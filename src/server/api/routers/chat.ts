import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "../trpc";
import { messages, conversations, conversationParticipants } from "~/server/db/schema";
import { eq, and, desc, lt, asc } from "drizzle-orm";
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
      })
      .from(conversationParticipants)
      .innerJoin(
        conversations,
        eq(conversations.id, conversationParticipants.conversationId)
      )
      .leftJoin(
        messages,
        eq(messages.conversationId, conversations.id)
      )
      .where(eq(conversationParticipants.userId, ctx.session.user.id))
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
        .select()
        .from(messages)
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

      const [newMessage] = await ctx.db.insert(messages)
        .values({
          conversationId: input.conversationId,
          senderId: ctx.session.user.id,
          content: input.content,
        })
        .returning();

      if (!newMessage) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to create message",
        });
      }

      await ctx.db.update(conversations)
        .set({ updatedAt: new Date() })
        .where(eq(conversations.id, input.conversationId));

      // Trigger Pusher event
      await pusherServer.trigger(
        `chat-${input.conversationId}`,
        'new-message',
        newMessage
      );

      return newMessage;
    }),

  createConversation: protectedProcedure
    .input(z.object({
      participantId: z.string(),
    }))
    .mutation(async ({ ctx, input }) => {
      const existingConversation = await ctx.db.query.conversationParticipants.findFirst({
        where: and(
          eq(conversationParticipants.userId, ctx.session.user.id),
          eq(conversationParticipants.userId, input.participantId)
        ),
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

  setTypingStatus: protectedProcedure
    .input(z.object({
      conversationId: z.number(),
      isTyping: z.boolean(),
    }))
    .mutation(async ({ ctx, input }) => {
      await pusherServer.trigger(
        `chat-${input.conversationId}-typing`,
        'typing-status',
        {
          userId: ctx.session.user.id,
          isTyping: input.isTyping,
        }
      );
    }),
});