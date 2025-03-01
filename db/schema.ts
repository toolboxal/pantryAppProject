import { int, sqliteTable, text, real } from 'drizzle-orm/sqlite-core'
import { createInsertSchema } from 'drizzle-zod'
import { relations } from 'drizzle-orm'

export const locations = sqliteTable('locations', {
  id: int('id').primaryKey({ autoIncrement: true }),
  room: text('room').notNull(),
  direction: text('direction').notNull(),
  noun: text('noun').notNull(),
})

export const locationsRelations = relations(locations, ({ many }) => ({
  items: many(pantryItems),
}))

export const pantryItems = sqliteTable('pantry_items', {
  id: int().primaryKey({ autoIncrement: true }),
  name: text('name').notNull(),
  dateBought: text('date_bought').notNull(),
  dateExpiry: text('date_expiry').notNull(),
  cost: text('cost').notNull().default('0'),
  consumed: int('consumed', { mode: 'boolean' }).default(false),
  quantity: text('quantity').notNull().default('1'),
  amount: text('amount', { enum: ['empty', 'low', 'half', 'full'] })
    .notNull()
    .default('full'),
  category: text('category', {
    enum: ['food', 'hygiene', 'supplies', 'miscellaneous'],
  }).notNull(),
  locationId: int('location_id')
    .notNull()
    .references(() => locations.id),
})

export const pantryItemsRelations = relations(pantryItems, ({ one }) => ({
  location: one(locations, {
    fields: [pantryItems.locationId],
    references: [locations.id],
  }),
}))

export const locationInsertSchema = createInsertSchema(locations)
export const pantryItemsInsertSchema = createInsertSchema(pantryItems, {
  name: (schema) =>
    schema
      .min(1, { message: 'Item is required.' })
      .max(40, { message: 'Exceeds max length.' }),
  quantity: (schema) =>
    schema.min(1, { message: 'Minimum 1 quantity.' }).default('1'),
  cost: (schema) =>
    schema.regex(/^(?:\d+(?:[.,]\d{0,2})?|[.,]\d{1,2})$/, {
      message: 'Invalid cost.',
    }),
}).pick({
  name: true,
  dateBought: true,
  dateExpiry: true,
  cost: true,
  quantity: true,
  category: true,
  locationId: true,
})
