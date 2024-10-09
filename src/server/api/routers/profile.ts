import { eq, sql } from "drizzle-orm";
import { createTRPCRouter, protectedProcedure, publicProcedure } from '../trpc';
import { profiles, approvedSchools, schoolApplications } from '~/server/db/schema';
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
});
