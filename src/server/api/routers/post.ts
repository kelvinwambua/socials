
import { z } from "zod";
import TimeAgo from "javascript-time-ago";
import en from 'javascript-time-ago/locale/en';
import { createTRPCRouter, protectedProcedure, publicProcedure } from "~/server/api/trpc";
import { posts, users } from "~/server/db/schema";
import { desc, eq, lt, lte } from "drizzle-orm";

TimeAgo.addDefaultLocale(en);
const timeAgo = new TimeAgo('en-US');

const PostSchema = z.object({
  id: z.string(),
  type: z.string(),
  author: z.object({
    name: z.string(),
    avatar: z.string(),
    university: z.string(),
  }),
  content: z.string(),
  media: z.string().optional(),
  timestamp: z.string(),
  likes: z.number(),
  comments: z.number(),
  shares: z.number(),
});

export const postRouter = createTRPCRouter({
  hello: publicProcedure
    .input(z.object({ text: z.string() }))
    .query(({ input }) => {
      return {
        greeting: `Hello ${input.text}`,
      };
    }),

  getLatest: publicProcedure.query(async ({ ctx }) => {
    const post = await ctx.db.query.posts.findFirst({
      orderBy: (posts, { desc }) => [desc(posts.createdAt)],
    });
    return post ?? null;
  }),

  getPosts: protectedProcedure
    .input(
      z.object({
        limit: z.number().min(1).max(100).default(10),
        cursor: z.string().nullable().default(null),
      })
    )
    .output(z.object({
      items: z.array(PostSchema),
      nextCursor: z.string().nullable(),
    }))
    .query(async ({ ctx, input }) => {
      const { limit, cursor } = input;

      const query = ctx.db
        .select({
          id: posts.id,
          type: posts.type,
          content: posts.content,
          media: posts.media,
          createdAt: posts.createdAt,
          authorId: posts.createdById,
          authorName: users.name,
          authorImage: users.image,
          likes: posts.likesCount,
          comments: posts.commentsCount,
          shares: posts.sharesCount,
        })
        .from(posts)
        .leftJoin(users, eq(users.id, posts.createdById))
        .orderBy(desc(posts.createdAt))
        .limit(limit + 1);

      if (cursor) {
        const postQuery = query.where(lte(posts.id, Number(cursor)));
      }

      const rawPosts = await query;

      const items = rawPosts.slice(0, limit).map(post => ({
        id: post.id.toString(),
        type: post.type,
        author: {
          name: post.authorName ?? 'Unknown',
          avatar: post.authorImage ?? 'https://i.pravatar.cc/150',
          university: "Unknown",
        },
        content: post.content,
        media: post.media ?? undefined,
        timestamp: timeAgo.format(new Date(post.createdAt)),
        likes: post.likes ?? 0,
        comments: post.comments ?? 0,
        shares: post.shares ?? 0,
      }));

      let nextCursor: string | null = null;
      if (rawPosts.length > limit) {
        const lastPost = rawPosts[limit - 1];
        nextCursor = lastPost?.id.toString() ?? null;
      }

      return {
        items,
        nextCursor,
      };
    }),

  createPost: protectedProcedure
    .input(
      z.object({
        content: z.string().min(1).max(500),
        media: z.string().optional(),
        type: z.enum(['text', 'image', 'video']),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const post = await ctx.db.insert(posts).values({
        content: input.content,
        media: input.media,
        type: input.type,
        createdById: ctx.session.user.id,
      });
      return post;
    }),
});