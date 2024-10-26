import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "../trpc";
import { products, users } from "~/server/db/schema";
import { eq, and, desc, lt, asc, sql, like, or, ne } from "drizzle-orm";
import { TRPCError } from "@trpc/server";
import type { InferSelectModel } from "drizzle-orm";

type Product = InferSelectModel<typeof products>;

export const marketplaceRouter = createTRPCRouter({
  getProducts: protectedProcedure
    .input(z.object({
      limit: z.number().default(12),
      cursor: z.number().optional(),
      category: z.string().optional(),
      search: z.string().optional(),
      sortBy: z.enum(['recent', 'price_asc', 'price_desc']).optional(),
    }))
    .query(async ({ ctx, input }) => {
      const query = ctx.db
        .select({
          product: products,
          seller: users,
        })
        .from(products)
        .innerJoin(users, eq(products.sellerId, users.id));

      if (input.category) {
        query.where(eq(products.category, input.category));
      }

      if (input.search) {
        query.where(
          or(
            like(products.title, `%${input.search}%`),
            like(products.description ?? '', `%${input.search}%`)
          )
        );
      }

      if (input.cursor) {
        query.where(lt(products.id, input.cursor));
      }

      switch (input.sortBy) {
        case 'price_asc':
          query.orderBy(asc(products.price));
          break;
        case 'price_desc':
          query.orderBy(desc(products.price));
          break;
        default:
          query.orderBy(desc(products.createdAt));
      }

      query.limit(input.limit);

      return query;
    }),

  getProductById: protectedProcedure
    .input(z.object({
      productId: z.number()
    }))
    .query(async ({ ctx, input }) => {
      const product = await ctx.db
        .select({
          product: products,
          seller: users,
        })
        .from(products)
        .innerJoin(users, eq(products.sellerId, users.id))
        .where(eq(products.id, input.productId))
        .limit(1);

      if (!product.length) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Product not found"
        });
      }

      return product[0];
    }),

  createProduct: protectedProcedure
    .input(z.object({
      title: z.string().min(1),
      description: z.string().optional(),
      price: z.number().positive(),
      category: z.string(),
      image: z.string(),
    }))
    .mutation(async ({ ctx, input }) => {
      const [newProduct] = await ctx.db.insert(products)
        .values({
          ...input,
          sellerId: ctx.session.user.id,
        })
        .returning();

      return newProduct;
    }),

  updateProduct: protectedProcedure
    .input(z.object({
      id: z.number(),
      title: z.string().min(1).optional(),
      description: z.string().optional(),
      price: z.number().positive().optional(),
      category: z.string().optional(),
      image: z.string().optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      const { id, ...updateData } = input;

      // Verify ownership
      const product = await ctx.db.query.products.findFirst({
        where: and(
          eq(products.id, id),
          eq(products.sellerId, ctx.session.user.id)
        ),
      });

      if (!product) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Product not found or you don't have permission to edit it"
        });
      }

      const [updatedProduct] = await ctx.db.update(products)
        .set(updateData)
        .where(eq(products.id, id))
        .returning();

      return updatedProduct;
    }),

  deleteProduct: protectedProcedure
    .input(z.object({
      productId: z.number()
    }))
    .mutation(async ({ ctx, input }) => {
      const product = await ctx.db.query.products.findFirst({
        where: and(
          eq(products.id, input.productId),
          eq(products.sellerId, ctx.session.user.id)
        ),
      });

      if (!product) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Product not found or you don't have permission to delete it"
        });
      }

      await ctx.db.delete(products)
        .where(eq(products.id, input.productId));

      return { success: true };
    }),

  getSellerProducts: protectedProcedure
    .input(z.object({
      sellerId: z.string(),
      limit: z.number().default(12),
      cursor: z.number().optional(),
    }))
    .query(async ({ ctx, input }) => {
      return ctx.db
        .select({
          product: products,
          seller: users,
        })
        .from(products)
        .innerJoin(users, eq(products.sellerId, users.id))
        .where(eq(products.sellerId, input.sellerId))
        .orderBy(desc(products.createdAt))
        .limit(input.limit);
    }),

  getSimilarProducts: protectedProcedure
    .input(z.object({
      category: z.string(),
      currentProductId: z.number(),
      limit: z.number().default(4)
    }))
    .query(async ({ ctx, input }) => {
      return ctx.db
        .select({
          product: products,
          seller: users,
        })
        .from(products)
        .innerJoin(users, eq(products.sellerId, users.id))
        .where(and(
          eq(products.category, input.category),
          ne(products.id, input.currentProductId)
        ))
        .orderBy(sql`RANDOM()`)
        .limit(input.limit);
    }),
});