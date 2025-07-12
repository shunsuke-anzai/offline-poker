import { pgTable, serial, text, timestamp, integer, jsonb } from 'drizzle-orm/pg-core';

//部屋（ロビー）の情報を管理
export const rooms = pgTable('rooms', {
  id: serial('id').primaryKey(),
  max_members: integer('max_members').notNull(), // 最大参加人数
  stack: integer('stack').notNull(),
  bb: integer('bb').notNull(),
  keyword: text('keyword').notNull(),
  current_members: integer('current_members').default(1).notNull(), // 現在の参加人数
  status: text('status').default('waiting').notNull(),
  player_names: text('player_names').array().default([]).notNull(), // プレイヤー名の配列
  created_at: timestamp('created_at').defaultNow().notNull(),
});

// ゲーム中のリアルタイムな状態を管理
export const gameStates = pgTable('game_states', {
  // roomsテーブルのIDを参照する外部キー。これにより、どの部屋のゲームか紐付けます。
  roomId: integer('room_id').primaryKey().references(() => rooms.id),
  
  // ゲームの全状態（プレイヤー配列、ポット、現在のベット額など）を格納するJSONBカラム
  state: jsonb('state').notNull(), 
});