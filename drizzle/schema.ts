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

/**
 * 任務表 - 用戶可完成的任務以獲得獎勵
 */
export const tasks = mysqlTable(
  "tasks",
  {
    id: int("id").autoincrement().primaryKey(),
    userId: int("userId").notNull(),
    taskType: mysqlEnum("taskType", ["daily_checkin", "referral", "transaction", "social_share"]).notNull(),
    status: mysqlEnum("status", ["pending", "completed", "claimed"]).default("pending").notNull(),
    rewardAmount: decimal("rewardAmount", { precision: 20, scale: 8 }).notNull(),
    rewardType: mysqlEnum("rewardType", ["nexus", "wld"]).default("nexus").notNull(),
    metadata: text("metadata"), // JSON object for task-specific data
    completedAt: timestamp("completedAt"),
    claimedAt: timestamp("claimedAt"),
    expiresAt: timestamp("expiresAt"),
    createdAt: timestamp("createdAt").defaultNow().notNull(),
  },
  (table) => ({
    userIdx: index("userIdx").on(table.userId),
    taskTypeIdx: index("taskTypeIdx").on(table.taskType),
    statusIdx: index("statusIdx").on(table.status),
  })
);

export type Task = typeof tasks.$inferSelect;
export type InsertTask = typeof tasks.$inferInsert;

/**
 * 代幣兌換表 - NEXUS ↔ WLD 兌換記錄
 */
export const tokenExchanges = mysqlTable(
  "tokenExchanges",
  {
    id: int("id").autoincrement().primaryKey(),
    userId: int("userId").notNull(),
    fromToken: mysqlEnum("fromToken", ["nexus", "wld"]).notNull(),
    toToken: mysqlEnum("toToken", ["nexus", "wld"]).notNull(),
    fromAmount: decimal("fromAmount", { precision: 20, scale: 8 }).notNull(),
    toAmount: decimal("toAmount", { precision: 20, scale: 8 }).notNull(),
    exchangeRate: decimal("exchangeRate", { precision: 20, scale: 8 }).notNull(),
    status: mysqlEnum("status", ["pending", "completed", "failed"]).default("pending").notNull(),
    transactionHash: varchar("transactionHash", { length: 256 }),
    createdAt: timestamp("createdAt").defaultNow().notNull(),
    completedAt: timestamp("completedAt"),
  },
  (table) => ({
    userIdx: index("userIdx").on(table.userId),
    statusIdx: index("statusIdx").on(table.status),
  })
);

export type TokenExchange = typeof tokenExchanges.$inferSelect;
export type InsertTokenExchange = typeof tokenExchanges.$inferInsert;

/**
 * 用戶代幣餘額表 - 快速查詢用戶的 NEXUS 和 WLD 餘額
 */
export const userTokenBalances = mysqlTable(
  "userTokenBalances",
  {
    id: int("id").autoincrement().primaryKey(),
    userId: int("userId").notNull().unique(),
    nexusBalance: decimal("nexusBalance", { precision: 20, scale: 8 }).default("0").notNull(),
    wldBalance: decimal("wldBalance", { precision: 20, scale: 8 }).default("0").notNull(),
    updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  },
  (table) => ({
    userIdx: index("userIdx").on(table.userId),
  })
);

export type UserTokenBalance = typeof userTokenBalances.$inferSelect;
export type InsertUserTokenBalance = typeof userTokenBalances.$inferInsert;

/**
 * 邀請記錄表 - 追蹤用戶邀請關係
 */
export const referrals = mysqlTable(
  "referrals",
  {
    id: int("id").autoincrement().primaryKey(),
    referrerId: int("referrerId").notNull(),
    referredUserId: int("referredUserId").notNull(),
    referralCode: varchar("referralCode", { length: 64 }).unique(),
    rewardClaimed: int("rewardClaimed").default(0),
    status: mysqlEnum("status", ["pending", "active", "inactive"]).default("pending").notNull(),
    createdAt: timestamp("createdAt").defaultNow().notNull(),
  },
  (table) => ({
    referrerIdx: index("referrerIdx").on(table.referrerId),
    referredIdx: index("referredIdx").on(table.referredUserId),
  })
);

export type Referral = typeof referrals.$inferSelect;
export type InsertReferral = typeof referrals.$inferInsert;