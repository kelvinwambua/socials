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

// Socket event types
export type MessageStatus = 'sent' | 'delivered' | 'read';

export interface MessageEvent {
  type: 'send' | 'receive' | 'status';
  message: Message;
  conversationId: number;
  status?: MessageStatus;
}

// API response types
export interface MessagesResponse {
  messages: MessageWithSenderImage[];
  nextCursor?: number;
}

export interface ConversationResponse {
  conversation: ConversationWithParticipants;
  unreadCount?: number;
}

// Socket event types for type safety
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

export const posts = createTable(
  "post",
  {
    id: serial("id").primaryKey(),
    name: varchar("name", { length: 256 }),
    createdById: varchar("created_by", { length: 255 })
      .notNull()
      .references(() => users.id),
    createdAt: timestamp("created_at", { withTimezone: true })
      .default(sql`CURRENT_TIMESTAMP`)
      .notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).$onUpdate(
      () => new Date()
    ),
  },
  (example) => ({
    createdByIdIdx: index("created_by_idx").on(example.createdById),
    nameIndex: index("name_idx").on(example.name),
  })
);

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


