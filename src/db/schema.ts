import { pgTable, serial, text, timestamp, integer } from "drizzle-orm/pg-core";

export const rooms = pgTable("rooms", {
  id: serial("id").primaryKey(),
  max_members: integer("max_members").notNull(),
  stack: integer("stack").notNull(),
  bb: integer("bb").notNull(),
  keyword: text("keyword").notNull(),
  current_members: integer("current_members").default(1).notNull(),
  status: text("status").default("waiting").notNull(),// "waiting", "playing", "finished"
  player_names: text("player_names").array().default([]).notNull(),
  created_at: timestamp("created_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
});
