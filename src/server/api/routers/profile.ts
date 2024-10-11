import { and, eq, inArray, not, or, sql } from "drizzle-orm";
import { createTRPCRouter, protectedProcedure, publicProcedure } from '../trpc';
import { profiles, approvedSchools, schoolApplications, friendRequests, swipes, users } from '~/server/db/schema';
import { z } from 'zod';
import { TRPCError } from '@trpc/server';
import { Filter } from 'bad-words';  

export const profileRouter = createTRPCRouter({
  setup: protectedProcedure
    .input(z.object({
      displayName: z.string().min(1).max(50),
      bio: z.string().max(500).optional(),
      major: z.string().min(1).max(100),
      graduationYear: z.number().int().min(2000).max(2100),
      interests: z.array(z.string().max(50)).max(10),
    }))
    .mutation(async ({ ctx, input }) => {
      const user = ctx.session.user;

      if (!user || !user.email) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'User not found or email not available',
        });
      }

      const filter = new Filter();


      const { displayName, bio } = input;

      if (filter.isProfane(displayName)) {
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: 'Display name contains inappropriate language',
        });
      }

      if (bio && filter.isProfane(bio)) {
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: 'Bio contains inappropriate language',
        });
      }

      const emailDomain = user.email.split('@')[1];

      const approvedSchool = await ctx.db.query.approvedSchools.findFirst({
        where: sql`${approvedSchools.domain} = ${emailDomain}`,
      });

      if (!approvedSchool) {
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: 'Your school is not in our list of approved institutions',
        });
      }

      const existingProfile = await ctx.db.query.profiles.findFirst({
        where: eq(profiles.userId, ctx.session.user.id),
      });

      if (existingProfile) {
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: 'Profile already exists for this user',
        });
      }

      // Insert profile into the database
      await ctx.db.insert(profiles).values({
        userId: ctx.session.user.id,
        displayName: input.displayName,
        bio: input.bio,
        university: approvedSchool.name,
        major: input.major,
        graduationYear: input.graduationYear,
        interests: input.interests,
      });

      return { success: true };
    }),

  approvedSchools: publicProcedure
    .query(async ({ ctx }) => {
      const schools = await ctx.db.query.approvedSchools.findMany({
        orderBy: (schools, { asc }) => [asc(schools.name)],
      });
      return schools;
    }),

  submitSchoolApplication: publicProcedure
    .input(z.object({
      schoolName: z.string().min(1).max(255),
      domain: z.string().min(1).max(255),
      contactEmail: z.string().email(),
      additionalInfo: z.string().optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      const existingSchool = await ctx.db.query.approvedSchools.findFirst({
        where: eq(approvedSchools.domain, input.domain),
      });

      if (existingSchool) {
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: 'This school is already approved',
        });
      }

      const existingApplication = await ctx.db.query.schoolApplications.findFirst({
        where: eq(schoolApplications.domain, input.domain),
      });

      if (existingApplication) {
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: 'An application for this school is already pending',
        });
      }

      await ctx.db.insert(schoolApplications).values({
        schoolName: input.schoolName,
        domain: input.domain,
        contactEmail: input.contactEmail,
        additionalInfo: input.additionalInfo,
        status: 'PENDING',
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      return { success: true };
    }),

    getNextUser: protectedProcedure.query(async ({ ctx }) => {
      const currentUserId = ctx.session.user.id;
      
      const swipedUsers = ctx.db
        .select({ id: swipes.swipedId })
        .from(swipes)
        .where(eq(swipes.swiperId, currentUserId));
    
      const potentialMatch = await ctx.db.query.users.findFirst({
        where: and(
          not(eq(users.id, currentUserId)),
          not(inArray(users.id, swipedUsers))
        ),
      });
    
      if (!potentialMatch) {
        return { status: 'NO_MORE_USERS' as const };
      }
    
      const profile = await ctx.db.query.profiles.findFirst({
        where: eq(profiles.userId, potentialMatch.id),
      });
    
      return { status: 'SUCCESS' as const, user: { ...potentialMatch, profile } };
    }),
  
    swipe: protectedProcedure
      .input(z.object({
        swipedId: z.string(),
        direction: z.enum(['left', 'right']),
      }))
      .mutation(async ({ ctx, input }) => {
        const { swipedId, direction } = input;
        const swiperId = ctx.session.user.id;
  
        await ctx.db.insert(swipes).values({
          swiperId,
          swipedId,
          direction,
        });
  
        if (direction === 'right') {
          const matchingSwipe = await ctx.db.query.swipes.findFirst({
            where: and(
              eq(swipes.swiperId, swipedId),
              eq(swipes.swipedId, swiperId),
              eq(swipes.direction, 'right')
            ),
          });
  
          if (matchingSwipe) {
            await ctx.db.insert(friendRequests).values([
              {
                senderId: swiperId,
                receiverId: swipedId,
                status: 'accepted',
              },
              {
                senderId: swipedId,
                receiverId: swiperId,
                status: 'accepted',
              },
            ]);
  
            return { status: 'MATCH' as const, matchedUserId: swipedId };
          }
        }
  
        return { status: 'NO_MATCH' as const };
      }),
  

      getFriends: protectedProcedure.query(async ({ ctx }) => {
        const userId = ctx.session.user.id;
    
        const friendRequestsQuery = ctx.db
          .select()
          .from(friendRequests)
          .where(
            and(
              eq(friendRequests.status, 'accepted'),
              or(
                eq(friendRequests.senderId, userId),
                eq(friendRequests.receiverId, userId)
              )
            )
          );
    
        const friendRequestsResult = await friendRequestsQuery;
    
        const friendIds = friendRequestsResult.map(request => 
          request.senderId === userId ? request.receiverId : request.senderId
        );
    
        const friends = await ctx.db.query.users.findMany({
          where: inArray(users.id, friendIds),
          columns: {
            id: true,
            name: true,
            email: true,
            image: true,
          },
        });
    
        const friendProfiles = await ctx.db.query.profiles.findMany({
          where: inArray(profiles.userId, friendIds),
          columns: {
            userId: true,
            bio: true,
            major: true,
            graduationYear: true,
          },
        });
    
        const friendsWithProfiles = friends.map(friend => ({
          ...friend,
          profile: friendProfiles.find(profile => profile.userId === friend.id) ?? null,
        }));
    
        return friendsWithProfiles;
      }),
});
