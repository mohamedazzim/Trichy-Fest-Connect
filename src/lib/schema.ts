import { pgTable, text, timestamp, varchar, pgEnum, decimal, boolean, integer, index } from 'drizzle-orm/pg-core'
import { relations } from 'drizzle-orm'

export const userTypeEnum = pgEnum('user_type', ['producer', 'consumer'])
export const productStatusEnum = pgEnum('product_status', ['active', 'inactive', 'out_of_stock'])
export const listingStatusEnum = pgEnum('listing_status', ['active', 'sold', 'expired'])

// Users table
export const users = pgTable('users', {
  id: varchar('id', { length: 255 }).primaryKey(),
  name: varchar('name', { length: 255 }).notNull(),
  email: varchar('email', { length: 255 }).notNull().unique(),
  password: varchar('password', { length: 255 }),
  userType: userTypeEnum('user_type').notNull().default('consumer'),
  image: varchar('image', { length: 255 }),
  bio: text('bio'),
  location: varchar('location', { length: 255 }),
  phone: varchar('phone', { length: 20 }),
  emailVerified: timestamp('email_verified', { mode: 'date' }),
  createdAt: timestamp('created_at', { mode: 'date' }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { mode: 'date' }).defaultNow().notNull(),
})

// Categories table
export const categories = pgTable('categories', {
  id: varchar('id', { length: 255 }).primaryKey(),
  name: varchar('name', { length: 255 }).notNull().unique(),
  description: text('description'),
  image: varchar('image', { length: 255 }),
  createdAt: timestamp('created_at', { mode: 'date' }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { mode: 'date' }).defaultNow().notNull(),
})

// Products table
export const products = pgTable('products', {
  id: varchar('id', { length: 255 }).primaryKey(),
  name: varchar('name', { length: 255 }).notNull(),
  description: text('description'),
  categoryId: varchar('category_id', { length: 255 }).notNull().references(() => categories.id),
  producerId: varchar('producer_id', { length: 255 }).notNull().references(() => users.id),
  images: text('images'), // JSON array of image URLs
  unit: varchar('unit', { length: 50 }).notNull(), // kg, lbs, pieces, etc.
  pricePerUnit: decimal('price_per_unit', { precision: 10, scale: 2 }).notNull(),
  availableQuantity: decimal('available_quantity', { precision: 10, scale: 2 }).notNull(),
  minOrderQuantity: decimal('min_order_quantity', { precision: 10, scale: 2 }).default('1'),
  isOrganic: boolean('is_organic').default(false),
  harvestDate: timestamp('harvest_date', { mode: 'date' }),
  expiryDate: timestamp('expiry_date', { mode: 'date' }),
  status: productStatusEnum('status').notNull().default('active'),
  createdAt: timestamp('created_at', { mode: 'date' }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { mode: 'date' }).defaultNow().notNull(),
}, (table) => ({
  categoryIdx: index('products_category_id_idx').on(table.categoryId),
  producerIdx: index('products_producer_id_idx').on(table.producerId),
  statusIdx: index('products_status_idx').on(table.status),
}))

// Listings table (for when producers list products for sale)
export const listings = pgTable('listings', {
  id: varchar('id', { length: 255 }).primaryKey(),
  productId: varchar('product_id', { length: 255 }).notNull().references(() => products.id),
  title: varchar('title', { length: 255 }).notNull(),
  description: text('description'),
  quantity: decimal('quantity', { precision: 10, scale: 2 }).notNull(),
  pricePerUnit: decimal('price_per_unit', { precision: 10, scale: 2 }).notNull(),
  status: listingStatusEnum('status').notNull().default('active'),
  expiresAt: timestamp('expires_at', { mode: 'date' }),
  createdAt: timestamp('created_at', { mode: 'date' }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { mode: 'date' }).defaultNow().notNull(),
}, (table) => ({
  productIdx: index('listings_product_id_idx').on(table.productId),
  statusIdx: index('listings_status_idx').on(table.status),
}))

// Relations
export const usersRelations = relations(users, ({ many }) => ({
  products: many(products),
}))

export const categoriesRelations = relations(categories, ({ many }) => ({
  products: many(products),
}))

export const productsRelations = relations(products, ({ one, many }) => ({
  category: one(categories, {
    fields: [products.categoryId],
    references: [categories.id],
  }),
  producer: one(users, {
    fields: [products.producerId],
    references: [users.id],
  }),
  listings: many(listings),
}))

export const listingsRelations = relations(listings, ({ one }) => ({
  product: one(products, {
    fields: [listings.productId],
    references: [products.id],
  }),
}))

// Types
export type User = typeof users.$inferSelect
export type NewUser = typeof users.$inferInsert

export type Category = typeof categories.$inferSelect
export type NewCategory = typeof categories.$inferInsert

export type Product = typeof products.$inferSelect
export type NewProduct = typeof products.$inferInsert

export type Listing = typeof listings.$inferSelect
export type NewListing = typeof listings.$inferInsert