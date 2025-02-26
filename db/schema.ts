import { int, sqliteTable, text, real } from 'drizzle-orm/sqlite-core'
import { createInsertSchema } from 'drizzle-zod'

export const pantryItems = sqliteTable('pantry_items', {
  id: int().primaryKey({ autoIncrement: true }),
  name: text('name').notNull(),
  dateBought: text('date_bought').notNull(),
  dateExpiry: text('date_expiry').notNull(),
  cost: real('cost').notNull().default(0),
  consumed: int('consumed', { mode: 'boolean' }).default(false),
  quantity: int('quantity').notNull().default(1),
  amount: text('amount', { enum: ['empty', 'low', 'half', 'full'] })
    .notNull()
    .default('full'),
  category: text('category', {
    enum: ['food', 'hygiene', 'supplies', 'miscellaneous'],
  }).notNull(),
  location: text('location').notNull(),
  spot: text('remarks').notNull(),
})

export const pantryItemsInsertSchema = createInsertSchema(pantryItems)
