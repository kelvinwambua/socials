import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "../trpc";
import { messages, conversations, conversationParticipants, users } from "~/server/db/schema";
import { eq, and, desc, lt, asc, sql, ne } from "drizzle-orm";
import { TRPCError } from "@trpc/server";
import type { InferSelectModel } from "drizzle-orm";
import { pusherServer } from '~/server/pusher';

type MessageType = InferSelectModel<typeof messages>;

export const chatRouter = createTRPCRouter({
  getConversations: protectedProcedure.query(async ({ ctx }) => {
    const userConversations = await ctx.db
      .select({
        conversation: conversations,
        participant: conversationParticipants,
        lastMessage: messages,
        otherUser: users,
      })
      .from(conversations)
      .innerJoin(
        conversationParticipants,
        eq(conversations.id, conversationParticipants.conversationId)
      )
      .innerJoin(
        users,
        eq(users.id, 
          sql`(
            SELECT user_id 
            FROM ${conversationParticipants} 
            WHERE conversation_id = ${conversations.id} 
              AND user_id != ${ctx.session.user.id} 
            LIMIT 1
          )`
        )
      )
      .leftJoin(
        messages,
        and(
          eq(messages.conversationId, conversations.id),
          eq(messages.id, 
            sql`(
              SELECT id 
              FROM ${messages} 
              WHERE conversation_id = ${conversations.id} 
              ORDER BY last_read DESC 
              LIMIT 1
            )`
          )
        )
      )
      .where(
        eq(conversationParticipants.userId, ctx.session.user.id)
      )
      .orderBy(desc(conversations.updatedAt));
  
    return userConversations;
  }),

  getMessages: protectedProcedure
  .input(z.object({
    conversationId: z.number(),
    limit: z.number().default(50),
    cursor: z.number().optional(),
  }))
  .query(async ({ ctx, input }) => {
    const participant = await ctx.db.query.conversationParticipants.findFirst({
      where: and(
        eq(conversationParticipants.conversationId, input.conversationId),
        eq(conversationParticipants.userId, ctx.session.user.id)
      ),
    });
    if (!participant) {
      throw new TRPCError({
        code: "FORBIDDEN",
        message: "You are not part of this conversation",
      });
    }
    const messagesList = await ctx.db
      .select({
        id: messages.id,
        conversationId: messages.conversationId,
        senderId: messages.senderId,
        content: messages.content,
        createdAt: messages.createdAt,
        status: messages.status,
        senderImage: users.image,
      })
      .from(messages)
      .leftJoin(users, eq(messages.senderId, users.id))
      .where(
        input.cursor
          ? and(
              eq(messages.conversationId, input.conversationId),
              lt(messages.id, input.cursor)
            )
          : eq(messages.conversationId, input.conversationId)
      )
      .orderBy(asc(messages.createdAt))
      .limit(input.limit);
    return messagesList;
  }),
    sendMessage: protectedProcedure
    .input(z.object({
      conversationId: z.number(),
      content: z.string().min(1),
    }))
    .mutation(async ({ ctx, input }) => {
      console.log("Sending message:", input);
      console.log("User ID:", ctx.session.user.id);
  
      const participant = await ctx.db.query.conversationParticipants.findFirst({
        where: and(
          eq(conversationParticipants.conversationId, input.conversationId),
          eq(conversationParticipants.userId, ctx.session.user.id)
        ),
      });
  
      console.log("Participant query result:", participant);
  
      if (!participant) {
        console.log("Participant not found. Throwing FORBIDDEN error.");
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "You are not part of this conversation",
        });
      }
  
      console.log("Participant found. Proceeding to insert message.");
  
      try {
        const [newMessage] = await ctx.db.insert(messages)
          .values({
            conversationId: input.conversationId,
            senderId: ctx.session.user.id,
            content: input.content,
          })
          .returning();
  
        console.log("New message inserted:", newMessage);
  
        if (!newMessage) {
          console.log("Failed to create message. Throwing INTERNAL_SERVER_ERROR.");
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: "Failed to create message",
          });
        }
  
        console.log("Updating conversation updatedAt timestamp.");
        await ctx.db.update(conversations)
          .set({ updatedAt: new Date() })
          .where(eq(conversations.id, input.conversationId));
  
        console.log("Triggering Pusher event.");
        await pusherServer.trigger(
          `chat-${input.conversationId}`,
          'new-message',
          newMessage
        );
  
        console.log("Message sent successfully.");
        return newMessage;
      } catch (error) {
        console.error("Error in sendMessage procedure:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "An error occurred while sending the message",
        });
      }
    }),

  createConversation: protectedProcedure
    .input(z.object({
      participantId: z.string(),
    }))
    .mutation(async ({ ctx, input }) => {
      const existingConversation = await ctx.db.query.conversationParticipants.findFirst({
        where: and(
          eq(conversationParticipants.conversationId, sql`(
            SELECT conversation_id
            FROM socials_conversation_participants
            WHERE user_id IN (${ctx.session.user.id}, ${input.participantId})
            GROUP BY conversation_id
            HAVING COUNT(*) = 2
          )`)
        )
      });
      if (existingConversation) {
        return { id: existingConversation.conversationId };
      }

      const [newConversation] = await ctx.db.insert(conversations)
        .values({})
        .returning();

      if (!newConversation) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to create conversation",
        });
      }

      await ctx.db.insert(conversationParticipants).values([
        {
          conversationId: newConversation.id,
          userId: ctx.session.user.id,
        },
        {
          conversationId: newConversation.id,
          userId: input.participantId,
        },
      ]);

      return { id: newConversation.id };
    }),
    getConversationDetails: protectedProcedure
    .input(z.object({
      conversationId: z.number(),
    }))
    .query(async ({ ctx, input }) => {
      const conversation = await ctx.db
        .select({
          conversation: conversations,
          participant: conversationParticipants,
          user: users,
        })
        .from(conversations)
        .innerJoin(
          conversationParticipants,
          eq(conversations.id, conversationParticipants.conversationId)
        )
        .innerJoin(
          users,
          eq(conversationParticipants.userId, users.id)
        )
        .where(and(
          eq(conversations.id, input.conversationId),
          eq(conversationParticipants.userId, sql`${conversationParticipants.userId} != ${ctx.session.user.id}`)
        ))
        .limit(1);

      if (!conversation.length) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Conversation not found",
        });
      }

      return conversation[0];
    }),
    getConversation: protectedProcedure
    .input(z.object({
      conversationId: z.number(),
    }))
    .query(async ({ ctx, input }) => {
      const conversation = await ctx.db
        .select({
          conversation: conversations,
          participant: conversationParticipants,
          user: users,
        })
        .from(conversations)
        .innerJoin(
          conversationParticipants,
          eq(conversations.id, conversationParticipants.conversationId)
        )
        .innerJoin(
          users,
          eq(conversationParticipants.userId, users.id)
        )
        .where(and(
          eq(conversations.id, input.conversationId),
          ne(conversationParticipants.userId, ctx.session.user.id)
        ))
        .limit(1);
  
      if (!conversation.length) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Conversation not found",
        });
      }
  
      return conversation[0];
    }),

  // setTypingStatus: protectedProcedure
  //   .input(z.object({
  //     conversationId: z.number(),
  //     isTyping: z.boolean(),
  //   }))
  //   .mutation(async ({ ctx, input }) => {
  //     await pusherServer.trigger(
  //       `chat-${input.conversationId}-typing`,
  //       'typing-status',
  //       {
  //         userId: ctx.session.user.id,
  //         isTyping: input.isTyping,
  //       }
  //     );
  //   }),
});