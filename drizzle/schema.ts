import { decimal, index, int, mysqlEnum, mysqlTable, text, timestamp, varchar } from "drizzle-orm/mysql-core";

/**
 * Core user table backing auth flow.
 * Extend this file with additional tables as your product grows.
 * Columns use camelCase to match both database fields and generated types.
 */
export const users = mysqlTable("users", {
  /**
   * Surrogate primary key. Auto-incremented numeric value managed by the database.
   * Use this for relations between tables.
   */
  id: int("id").autoincrement().primaryKey(),
  /** Manus OAuth identifier (openId) returned from the OAuth callback. Unique per user. */
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: mysqlEnum("role", ["user", "admin"]).default("user").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

/**
 * World ID Nullifiers - 防止重複認證
 */
export const nullifiers = mysqlTable(
  "nullifiers",
  {
    nullifier: varchar("nullifier", { length: 256 }).primaryKey(),
    action: varchar("action", { length: 255 }).notNull(),
    userId: int("userId").notNull(),
    verifiedAt: timestamp("verifiedAt").defaultNow().notNull(),
  },
  (table) => ({
    userIdIdx: index("userIdIdx").on(table.userId),
  })
);

export type Nullifier = typeof nullifiers.$inferSelect;
export type InsertNullifier = typeof nullifiers.$inferInsert;

/**
 * 商品表 - 二手/新品交易市場
 */
export const products = mysqlTable(
  "products",
  {
    id: int("id").autoincrement().primaryKey(),
    sellerId: int("sellerId").notNull(),
    title: varchar("title", { length: 255 }).notNull(),
    description: text("description"),
    category: mysqlEnum("category", ["new", "used"]).notNull(),
    condition: mysqlEnum("condition", ["excellent", "good", "fair"]).default(
      "good"
    ),
    price: decimal("price", { precision: 20, scale: 8 }).notNull(),
    images: text("images"), // JSON array of S3 URLs
    status: mysqlEnum("status", ["listed", "sold", "delisted"]).default(
      "listed"
    ),
    views: int("views").default(0),
    createdAt: timestamp("createdAt").defaultNow().notNull(),
    updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  },
  (table) => ({
    sellerIdx: index("sellerIdx").on(table.sellerId),
    statusIdx: index("statusIdx").on(table.status),
  })
);

export type Product = typeof products.$inferSelect;
export type InsertProduct = typeof products.$inferInsert;

/**
 * 交易表 - 商品購買記錄
 */
export const transactions = mysqlTable(
  "transactions",
  {
    id: int("id").autoincrement().primaryKey(),
    buyerId: int("buyerId").notNull(),
    sellerId: int("sellerId").notNull(),
    productId: int("productId").notNull(),
    amount: decimal("amount", { precision: 20, scale: 8 }).notNull(),
    transactionId: varchar("transactionId", { length: 256 }),
    status: mysqlEnum("status", ["pending", "completed", "cancelled"]).default(
      "pending"
    ),
    platformTokenReward: decimal("platformTokenReward", {
      precision: 20,
      scale: 8,
    }).default("0"),
    createdAt: timestamp("createdAt").defaultNow().notNull(),
    completedAt: timestamp("completedAt"),
  },
  (table) => ({
    buyerIdx: index("buyerIdx").on(table.buyerId),
    sellerIdx: index("sellerIdx").on(table.sellerId),
    statusIdx: index("statusIdx").on(table.status),
  })
);

export type Transaction = typeof transactions.$inferSelect;
export type InsertTransaction = typeof transactions.$inferInsert;

/**
 * 平台代幣表 - 代幣餘額與交易歷史
 */
export const platformTokens = mysqlTable(
  "platformTokens",
  {
    id: int("id").autoincrement().primaryKey(),
    userId: int("userId").notNull(),
    amount: decimal("amount", { precision: 20, scale: 8 }).notNull(),
    source: mysqlEnum("source", [
      "transaction_reward",
      "activity_reward",
      "referral",
      "lottery_prize",
      "loan_interest",
    ]).notNull(),
    relatedId: int("relatedId"),
    createdAt: timestamp("createdAt").defaultNow().notNull(),
  },
  (table) => ({
    userIdx: index("userIdx").on(table.userId),
  })
);

export type PlatformToken = typeof platformTokens.$inferSelect;
export type InsertPlatformToken = typeof platformTokens.$inferInsert;

/**
 * 抽獎表 - 用戶抽獎參與
 */
export const lotteries = mysqlTable(
  "lotteries",
  {
    id: int("id").autoincrement().primaryKey(),
    userId: int("userId").notNull(),
    ticketCount: int("ticketCount").notNull(),
    costPerTicket: decimal("costPerTicket", { precision: 20, scale: 8 }).notNull(),
    costType: mysqlEnum("costType", ["wld", "platform_token"]).notNull(),
    drawDate: timestamp("drawDate").notNull(),
    prizeAmount: decimal("prizeAmount", { precision: 20, scale: 8 }),
    status: mysqlEnum("status", ["pending", "won", "lost"]).default(
      "pending"
    ),
    createdAt: timestamp("createdAt").defaultNow().notNull(),
  },
  (table) => ({
    userIdx: index("userIdx").on(table.userId),
    statusIdx: index("statusIdx").on(table.status),
  })
);

export type Lottery = typeof lotteries.$inferSelect;
export type InsertLottery = typeof lotteries.$inferInsert;

/**
 * 貸款表 - 用戶貸款記錄
 */
export const loans = mysqlTable(
  "loans",
  {
    id: int("id").autoincrement().primaryKey(),
    borrowerId: int("borrowerId").notNull(),
    collateralAmount: decimal("collateralAmount", {
      precision: 20,
      scale: 8,
    }).notNull(),
    loanAmount: decimal("loanAmount", { precision: 20, scale: 8 }).notNull(),
    interestRate: decimal("interestRate", { precision: 5, scale: 2 }).notNull(),
    dueDate: timestamp("dueDate").notNull(),
    repaidAmount: decimal("repaidAmount", { precision: 20, scale: 8 }).default(
      "0"
    ),
    status: mysqlEnum("status", ["active", "repaid", "defaulted"]).default(
      "active"
    ),
    createdAt: timestamp("createdAt").defaultNow().notNull(),
    updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  },
  (table) => ({
    borrowerIdx: index("borrowerIdx").on(table.borrowerId),
    statusIdx: index("statusIdx").on(table.status),
  })
);

export type Loan = typeof loans.$inferSelect;
export type InsertLoan = typeof loans.$inferInsert;