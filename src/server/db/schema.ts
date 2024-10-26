
import { InferSelectModel, relations, sql } from "drizzle-orm";

import {
  index,
  integer,
  pgTableCreator,
  primaryKey,
  serial,
  text,
  timestamp,
  varchar,
} from "drizzle-orm/pg-core";
import { type AdapterAccount } from "next-auth/adapters";

/**
 * This is an example of how to use the multi-project schema feature of Drizzle ORM. Use the same
 * database instance for multiple projects.
 *
 * @see https://orm.drizzle.team/docs/goodies#multi-project-schema
 */
export const createTable = pgTableCreator((name) => `socials_${name}`);
export type Message = InferSelectModel<typeof messages>;
export type Conversation = InferSelectModel<typeof conversations>;
export type ConversationParticipant = InferSelectModel<typeof conversationParticipants>;
export type User = InferSelectModel<typeof users>;

// Extended types with relationships
export type MessageWithSenderImage = Message & {
  senderImage: string | null;
};
export interface MessageWithSender extends MessageWithSenderImage {
  sender?: {
    id: string;
    name?: string | null;
    image?: string | null;
  };
}

export interface ConversationWithParticipants extends Conversation {
  participants: ConversationParticipant[];
  lastMessage?: Message;
}

export type MessageStatus = 'sent' | 'delivered' | 'read';

export interface MessageEvent {
  type: 'send' | 'receive' | 'status';
  message: Message;
  conversationId: number;
  status?: MessageStatus;
}

export interface MessagesResponse {
  messages: MessageWithSenderImage[];
  nextCursor?: number;
}

export interface ConversationResponse {
  conversation: ConversationWithParticipants;
  unreadCount?: number;
}


export interface ServerToClientEvents {
  'receive-message': (event: MessageEvent) => void;
  'message-status': (messageId: number, status: MessageStatus) => void;
  'typing-status': (conversationId: number, userId: string, isTyping: boolean) => void;
}

export interface ClientToServerEvents {
  'join-room': (roomId: string) => void;
  'leave-room': (roomId: string) => void;
  'send-message': (event: MessageEvent) => void;
  'mark-as-read': (messageId: number) => void;
  'typing': (conversationId: number, isTyping: boolean) => void;
}
  // {
  //   id: '2',
  //   type: 'image',
  //   author: {
  //     name: 'John Smith',
  //     avatar: 'https://i.pravatar.cc/150?img=2',
  //     university: 'MIT',
  //   },
  //   content: 'Check out this amazing sunset on campus! 🌅',
  //   media: 'https://utfs.io/f/NZEym2bBuewNBmYWSmTnNaVrYpkMWJxHmRBE3uK8IiPcZ4QL',
  //   timestamp: '4h ago',
  //   likes: 78,
  //   comments: 12,
  //   shares: 5,
  // },
//   createPost: protectedProcedure
//   .input(
//     z.object({
//       content: z.string().min(1).max(500),
//       media: z.string().optional(),
//       type: z.enum(['text', 'image', 'video']),
// }))
// .mutation(async ({ ctx, input }) => {
//   const post = await ctx.db.insert(posts).values({
//     userId: ctx.session.user.id,
//     content: input.content,
//     media: input.media,
//     type: input.type,
//     createdById: ctx.session.user.id,
//   });

//   return post;
// }),

export const postData = createTable(
  "postData",
  {
    id: serial("id").primaryKey(),
    postId: integer("post_id").notNull().references(() => posts.id),
    userId: varchar("user_id", { length: 255 }).notNull().references(() => users.id),
    likes: integer("likes").default(0),
    comments: integer("comments").default(0),
    shares: integer("shares").default(0),
  }
)
export const posts = createTable(
  "post",
  {
    id: serial("id").primaryKey(),
    content: varchar("name", { length: 500 }).notNull(),
    type: varchar("type", { length: 20 }).notNull(),
    media: varchar("media", { length: 255 }),
    createdById: varchar("created_by", { length: 255 })
      .notNull()
      .references(() => users.id),
    likesCount: integer("likes_count").default(0),
    commentsCount: integer("comments_count").default(0),
    sharesCount: integer("shares_count").default(0),
    createdAt: timestamp("created_at", { withTimezone: true })
      .default(sql`CURRENT_TIMESTAMP`)
      .notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).$onUpdate(
      () => new Date()
    ),
  },
  (example) => ({
    createdByIdIdx: index("created_by_idx").on(example.createdById),
    nameIndex: index("name_idx").on(example.content),
  })
);
export const likes = createTable(
  "like",
  {
    id: serial("id").primaryKey(),
    userId: varchar("user_id", { length: 255 })
      .notNull()
      .references(() => users.id),
    postId: integer("post_id")
      .notNull()
      .references(() => posts.id),
    createdAt: timestamp("created_at", { withTimezone: true })
      .default(sql`CURRENT_TIMESTAMP`)
      .notNull(),
  },
  (table) => ({
    userPostIdx: index("user_post_idx").on(table.userId, table.postId),
  })
);

export const likesRelations = relations(likes, ({ one }) => ({
  user: one(users, {
    fields: [likes.userId],
    references: [users.id],
  }),
  post: one(posts, {
    fields: [likes.postId],
    references: [posts.id],
  }),
}));

export const postsRelations = relations(posts, ({ many }) => ({
  likes: many(likes),
}));




export const users = createTable("user", {
  id: varchar("id", { length: 255 })
    .notNull()
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  name: varchar("name", { length: 255 }),
  email: varchar("email", { length: 255 }).notNull(),
  emailVerified: timestamp("email_verified", {
    mode: "date",
    withTimezone: true,
  }).default(sql`CURRENT_TIMESTAMP`),
  image: varchar("image", { length: 255 }),
});
export const events = createTable('events', {
  id: serial('id').primaryKey(),
  title: varchar('title', { length: 255 }).notNull(),
  description: text('description'),
  date: timestamp('date').notNull(),
  createdBy: varchar('created_by', { length: 255 }).references(() => users.id),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

export const usersRelations = relations(users, ({ many }) => ({
  accounts: many(accounts),
}));

export const accounts = createTable(
  "account",
  {
    userId: varchar("user_id", { length: 255 })
      .notNull()
      .references(() => users.id),
    type: varchar("type", { length: 255 })
      .$type<AdapterAccount["type"]>()
      .notNull(),
    provider: varchar("provider", { length: 255 }).notNull(),
    providerAccountId: varchar("provider_account_id", {
      length: 255,
    }).notNull(),
    refresh_token: text("refresh_token"),
    access_token: text("access_token"),
    expires_at: integer("expires_at"),
    token_type: varchar("token_type", { length: 255 }),
    scope: varchar("scope", { length: 255 }),
    id_token: text("id_token"),
    session_state: varchar("session_state", { length: 255 }),
  },
  (account) => ({
    compoundKey: primaryKey({
      columns: [account.provider, account.providerAccountId],
    }),
    userIdIdx: index("account_user_id_idx").on(account.userId),
  })
);

export const accountsRelations = relations(accounts, ({ one }) => ({
  user: one(users, { fields: [accounts.userId], references: [users.id] }),
}));

export const sessions = createTable(
  "session",
  {
    sessionToken: varchar("session_token", { length: 255 })
      .notNull()
      .primaryKey(),
    userId: varchar("user_id", { length: 255 })
      .notNull()
      .references(() => users.id),
    expires: timestamp("expires", {
      mode: "date",
      withTimezone: true,
    }).notNull(),
  },
  (session) => ({
    userIdIdx: index("session_user_id_idx").on(session.userId),
  })
);

export const sessionsRelations = relations(sessions, ({ one }) => ({
  user: one(users, { fields: [sessions.userId], references: [users.id] }),
}));

export const verificationTokens = createTable(
  "verification_token",
  {
    identifier: varchar("identifier", { length: 255 }).notNull(),
    token: varchar("token", { length: 255 }).notNull(),
    expires: timestamp("expires", {
      mode: "date",
      withTimezone: true,
    }).notNull(),
  },
  (vt) => ({
    compoundKey: primaryKey({ columns: [vt.identifier, vt.token] }),
  })
);
export const profiles = createTable('profiles', {
  id: serial('id').primaryKey(),
  userId: varchar('user_id').notNull().unique(),
  displayName: varchar('display_name').notNull(),
  bio: text('bio'),
  university: varchar('university').notNull(),
  major: varchar('major').notNull(),
  graduationYear: integer('graduation_year').notNull(),
  interests: text('interests').array(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export const approvedSchools = createTable('approved_schools', {
  id: text('id').primaryKey(),
  name: varchar('name', { length: 100 }).notNull(),
  domain: varchar('domain', { length: 100 }).notNull().unique(),
})
export const schoolApplications = createTable('school_applications', {
  id: serial('id').primaryKey(),
  schoolName: varchar('school_name', { length: 255 }).notNull(),
  domain: varchar('domain', { length: 255 }).notNull(),
  contactEmail: varchar('contact_email', { length: 255 }).notNull(),
  additionalInfo: text('additional_info'),
  status: varchar('status', { length: 20 }).notNull().default('PENDING'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});
export const friendRequests = createTable('friend_requests', {
  id: serial('id').primaryKey(),
  senderId: varchar('sender_id',{length:255}).references(() => users.id).notNull(),
  receiverId: varchar('receiver_id',{length:255}).references(() => users.id).notNull(),
  status: text('status').notNull().default('pending'), 
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

export const swipes = createTable('swipes', {
  id: serial('id').primaryKey(),
  swiperId: varchar('swiper_id',{length: 255}).references(() => users.id).notNull(),
  swipedId: varchar('swiped_id',{length: 255}).references(() => users.id).notNull(),
  direction: text('direction').notNull(), 
  createdAt: timestamp('created_at').defaultNow().notNull(),
});
export const products = createTable("product",{
  id:serial("id").primaryKey(),
  title:varchar("title",{length:225}).notNull(),
  description:text("description"),
  category:text("category"),
  price:integer("price").notNull(),
  sellerId:varchar("seller_id",{length:225}).references(()=>users.id).notNull(),
  image:varchar("image",{length:255}).notNull(),
  createdAt:timestamp("created_at").defaultNow().notNull()
})


export const conversations = createTable('conversations', {
  id: serial('id').primaryKey(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export const conversationParticipants = createTable('conversation_participants', {
  id: serial('id').primaryKey(),
  conversationId: integer('conversation_id').references(() => conversations.id).notNull(),
  userId: varchar('user_id', { length: 255 }).references(() => users.id).notNull(),
  lastRead: timestamp('last_read').defaultNow().notNull(),
});

export const messages = createTable('messages', {
  id: serial('id').primaryKey(),
  conversationId: integer('conversation_id').references(() => conversations.id).notNull(),
  senderId: varchar('sender_id', { length: 255 }).references(() => users.id).notNull(),
  content: text('content').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  status: varchar('status', { length: 20 }).notNull().default('sent'), 
});


export const conversationParticipantsRelations = relations(conversationParticipants, ({ one }) => ({
  conversation: one(conversations, {
    fields: [conversationParticipants.conversationId],
    references: [conversations.id],
  }),
  user: one(users, {
    fields: [conversationParticipants.userId],
    references: [users.id],
  }),
}));


export const messagesRelations = relations(messages, ({ one }) => ({
  conversation: one(conversations, {
    fields: [messages.conversationId],
    references: [conversations.id],
  }),
  sender: one(users, {
    fields: [messages.senderId],
    references: [users.id],
  }),


  
}));


