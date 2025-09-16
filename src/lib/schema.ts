import { pgTable, text, timestamp, varchar, pgEnum, decimal, boolean, integer, index } from 'drizzle-orm/pg-core'
import { relations } from 'drizzle-orm'

export const userTypeEnum = pgEnum('user_type', ['producer', 'consumer'])
export const productStatusEnum = pgEnum('product_status', ['active', 'inactive', 'out_of_stock'])
export const listingStatusEnum = pgEnum('listing_status', ['active', 'sold', 'expired'])
export const orderStatusEnum = pgEnum('order_status', ['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled'])

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

// Orders table
export const orders = pgTable('orders', {
  id: varchar('id', { length: 255 }).primaryKey().$defaultFn(() => crypto.randomUUID()),
  customerId: varchar('customer_id', { length: 255 }).notNull().references(() => users.id),
  status: orderStatusEnum('status').notNull().default('pending'),
  subtotal: decimal('subtotal', { precision: 10, scale: 2 }).notNull(),
  deliveryCharge: decimal('delivery_charge', { precision: 10, scale: 2 }).notNull().default('0'),
  total: decimal('total', { precision: 10, scale: 2 }).notNull(),
  paymentMethod: varchar('payment_method', { length: 50 }).notNull(), // cod, online
  deliveryDate: varchar('delivery_date', { length: 255 }).notNull(),
  contactName: varchar('contact_name', { length: 255 }).notNull(),
  email: varchar('email', { length: 255 }).notNull(),
  phone: varchar('phone', { length: 20 }).notNull(),
  address: text('address').notNull(),
  city: varchar('city', { length: 255 }).notNull(),
  pincode: varchar('pincode', { length: 10 }).notNull(),
  deliveryNotes: text('delivery_notes'),
  createdAt: timestamp('created_at', { mode: 'date' }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { mode: 'date' }).defaultNow().notNull(),
}, (table) => ({
  customerIdx: index('orders_customer_id_idx').on(table.customerId),
  statusIdx: index('orders_status_idx').on(table.status),
  deliveryDateIdx: index('orders_delivery_date_idx').on(table.deliveryDate),
}))

// Order Items table
export const orderItems = pgTable('order_items', {
  id: varchar('id', { length: 255 }).primaryKey().$defaultFn(() => crypto.randomUUID()),
  orderId: varchar('order_id', { length: 255 }).notNull().references(() => orders.id),
  productId: varchar('product_id', { length: 255 }).notNull().references(() => products.id),
  quantity: decimal('quantity', { precision: 10, scale: 2 }).notNull(),
  pricePerUnit: decimal('price_per_unit', { precision: 10, scale: 2 }).notNull(),
  total: decimal('total', { precision: 10, scale: 2 }).notNull(),
  createdAt: timestamp('created_at', { mode: 'date' }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { mode: 'date' }).defaultNow().notNull(),
}, (table) => ({
  orderIdx: index('order_items_order_id_idx').on(table.orderId),
  productIdx: index('order_items_product_id_idx').on(table.productId),
}))

// Relations
export const usersRelations = relations(users, ({ many }) => ({
  products: many(products),
  orders: many(orders),
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
  orderItems: many(orderItems),
}))

export const listingsRelations = relations(listings, ({ one }) => ({
  product: one(products, {
    fields: [listings.productId],
    references: [products.id],
  }),
}))

export const ordersRelations = relations(orders, ({ one, many }) => ({
  customer: one(users, {
    fields: [orders.customerId],
    references: [users.id],
  }),
  orderItems: many(orderItems),
}))

export const orderItemsRelations = relations(orderItems, ({ one }) => ({
  order: one(orders, {
    fields: [orderItems.orderId],
    references: [orders.id],
  }),
  product: one(products, {
    fields: [orderItems.productId],
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

export type Order = typeof orders.$inferSelect
export type NewOrder = typeof orders.$inferInsert

export type OrderItem = typeof orderItems.$inferSelect
export type NewOrderItem = typeof orderItems.$inferInsert