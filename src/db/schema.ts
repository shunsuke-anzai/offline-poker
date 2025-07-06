import { pgTable, serial, text, timestamp, integer } from 'drizzle-orm/pg-core';

export const rooms = pgTable('rooms', {
  id: serial('id').primaryKey(),
  max_members: integer('max_members').notNull(), // 最大参加人数
  stack: integer('stack').notNull(),
  bb: integer('bb').notNull(),
  keyword: text('keyword').notNull(),
  current_members: integer('current_members').default(1).notNull(), // 現在の参加人数 (追加)
  status: text('status').default('waiting').notNull(),
  player_names: text('player_names').array().default([]).notNull(), // プレイヤー名の配列
  created_at: timestamp('created_at').defaultNow().notNull(),
});