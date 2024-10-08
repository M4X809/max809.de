import { relations, type SQL, sql } from "drizzle-orm";
// import { float } from "drizzle-orm/mysql-core";
import {
	boolean,
	doublePrecision,
	index,
	integer,
	pgTableCreator,
	primaryKey,
	serial,
	text,
	timestamp,
	varchar,
} from "drizzle-orm/pg-core";
import type { AdapterAccount } from "next-auth/adapters";
// import QrCode from "~/app/qr-code-generator/_qr-components/QrCodeContainer";

/**
 * This is an example of how to use the multi-project schema feature of Drizzle ORM. Use the same
 * database instance for multiple projects.
 *
 * @see https://orm.drizzle.team/docs/goodies#multi-project-schema
 */
export const createTable = pgTableCreator((name) => `qr-code_${name}`);

export const qrCodes = createTable("codes", {
	id: varchar("id", { length: 255 })
		.notNull()
		.primaryKey()
		.$defaultFn(() => crypto.randomUUID()),
	name: varchar("name", { length: 255 }),
	createdById: varchar("created_by", { length: 255 })
		.notNull()
		.references(() => users.id),
	createdAt: timestamp("created_at", { withTimezone: true })
		.default(sql`CURRENT_TIMESTAMP`)
		.notNull(),
	updatedAt: timestamp("updated_at", { withTimezone: true }).$onUpdate(
		() => new Date(),
	),
	// data: varchar("data", { length: 500 }),
	dataUrl: text("data_url"),
	qrCode: varchar("qr_code", { length: 4096 }),
	qrLvl: integer("qr_lvl").default(1),
	size: integer("size").default(512),
	color: varchar("color", { length: 255 }).default("#000000"),
	backgroundColor: varchar("background_color", { length: 255 }).default(
		"#ffffff",
	),
	finderRadius: doublePrecision("finder_radius").default(0),
	dotRadius: doublePrecision("dot_radius").default(0),
	shareable: boolean("shareable").default(false),
	imageKey: varchar("image_key", { length: 255 }),
});

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
	limit: integer("limit").default(15).notNull(),
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
		refresh_token_expires_in: integer("refresh_token_expires_in"),
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
	}),
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
	}),
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
	}),
);

export const cubeTimes = createTable("cube-times", {
	id: varchar("id", { length: 255 })
		.notNull()
		.primaryKey()
		.$defaultFn(() => crypto.randomUUID()),
	createdById: varchar("created_by", { length: 255 })
		.notNull()
		.references(() => users.id),
	cubeSize: varchar("cubeSize").notNull(),
	scramble: varchar("scramble", { length: 255 }).notNull(),
	time: integer("time").notNull(),
	createdAt: timestamp("created_at", { withTimezone: true })
		.default(sql`CURRENT_TIMESTAMP`)
		.notNull(),
});

export const emojis = createTable("emoji-icon", {
	id: varchar("id", { length: 255 }).notNull().primaryKey().unique(), // emoji hash
	emoji: varchar("emoji", { length: 255 }).notNull(),
	callCount: integer("call_count")
		.notNull()
		.default(0)
		.$onUpdateFn((): SQL => sql`${sql.raw("call_count + 1")}`),
	lastCalledAt: timestamp("last_called_at", { withTimezone: true })
		.notNull()
		.default(sql`CURRENT_TIMESTAMP`),
});
