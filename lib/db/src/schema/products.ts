import { pgTable, uuid, text, numeric, timestamp, integer } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const productsTable = pgTable("products", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: text("name").notNull(),
  price: numeric("price", { precision: 12, scale: 2 }).notNull(),
  description: text("description").notNull(),
  category: text("category").notNull(),
  badge: text("badge"),
  affiliateLink: text("affiliate_link").notNull(),
  imageUrl: text("image_url").notNull(),
  clickCount: integer("click_count").notNull().default(0),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertProductSchema = createInsertSchema(productsTable).omit({
  id: true,
  createdAt: true,
  clickCount: true,
});

export type InsertProduct = z.infer<typeof insertProductSchema>;
export type DbProduct = typeof productsTable.$inferSelect;
