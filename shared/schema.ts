import { sql } from 'drizzle-orm';
import {
  index,
  jsonb,
  pgTable,
  timestamp,
  varchar,
  text,
  integer,
  decimal,
  boolean,
  date,
} from "drizzle-orm/pg-core";
import { relations } from 'drizzle-orm';
import { createInsertSchema } from 'drizzle-zod';
import { z } from 'zod';

// Session storage table.
// (IMPORTANT) This table is mandatory for Replit Auth, don't drop it.
export const sessions = pgTable(
  "sessions",
  {
    sid: varchar("sid").primaryKey(),
    sess: jsonb("sess").notNull(),
    expire: timestamp("expire").notNull(),
  },
  (table) => [index("IDX_session_expire").on(table.expire)],
);

// User storage table.
// (IMPORTANT) This table is mandatory for Replit Auth, don't drop it.
export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  email: varchar("email").unique(),
  firstName: varchar("first_name"),
  lastName: varchar("last_name"),
  profileImageUrl: varchar("profile_image_url"),
  role: varchar("role").notNull().default("visitor"), // visitor, resident, educator, partner, admin, bisafoo_circle, golden_circle, founder
  bio: text("bio"),
  skills: text("skills").array(),
  interests: text("interests").array(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const events = pgTable("events", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  title: varchar("title").notNull(),
  description: text("description"),
  type: varchar("type").notNull(), // workshop, retreat, festival, community
  startDate: timestamp("start_date").notNull(),
  endDate: timestamp("end_date").notNull(),
  location: varchar("location"),
  capacity: integer("capacity"),
  price: decimal("price", { precision: 10, scale: 2 }),
  organizerId: varchar("organizer_id").notNull().references(() => users.id),
  imageUrl: varchar("image_url"),
  tags: text("tags").array(),
  status: varchar("status").notNull().default("active"), // active, cancelled, completed
  createdAt: timestamp("created_at").defaultNow(),
});

export const eventRegistrations = pgTable("event_registrations", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  eventId: varchar("event_id").notNull().references(() => events.id),
  userId: varchar("user_id").notNull().references(() => users.id),
  status: varchar("status").notNull().default("registered"), // registered, confirmed, cancelled
  createdAt: timestamp("created_at").defaultNow(),
});

export const courses = pgTable("courses", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  title: varchar("title").notNull(),
  description: text("description"),
  category: varchar("category").notNull(), // sustainability, culture, technology, arts
  instructorId: varchar("instructor_id").notNull().references(() => users.id),
  duration: integer("duration"), // in hours
  level: varchar("level").notNull(), // beginner, intermediate, advanced
  price: decimal("price", { precision: 10, scale: 2 }),
  imageUrl: varchar("image_url"),
  syllabus: jsonb("syllabus"), // array of lessons
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
});

export const courseEnrollments = pgTable("course_enrollments", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  courseId: varchar("course_id").notNull().references(() => courses.id),
  userId: varchar("user_id").notNull().references(() => users.id),
  progress: integer("progress").default(0), // percentage
  completedLessons: text("completed_lessons").array().default(sql`ARRAY[]::text[]`),
  enrolledAt: timestamp("enrolled_at").defaultNow(),
  completedAt: timestamp("completed_at"),
});

export const projects = pgTable("projects", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  title: varchar("title").notNull(),
  description: text("description"),
  category: varchar("category").notNull(), // infrastructure, cultural, educational, community
  goalAmount: decimal("goal_amount", { precision: 10, scale: 2 }).notNull(),
  currentAmount: decimal("current_amount", { precision: 10, scale: 2 }).default("0"),
  currency: varchar("currency").default("EUR"),
  deadline: date("deadline"),
  status: varchar("status").notNull().default("active"), // active, completed, cancelled
  creatorId: varchar("creator_id").notNull().references(() => users.id),
  imageUrl: varchar("image_url"),
  updates: jsonb("updates"), // array of project updates
  createdAt: timestamp("created_at").defaultNow(),
});

export const donations = pgTable("donations", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  projectId: varchar("project_id").notNull().references(() => projects.id),
  userId: varchar("user_id").references(() => users.id), // null for anonymous donations
  amount: decimal("amount", { precision: 10, scale: 2 }).notNull(),
  currency: varchar("currency").default("EUR"),
  message: text("message"),
  isAnonymous: boolean("is_anonymous").default(false),
  stripePaymentIntentId: varchar("stripe_payment_intent_id"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const artistProfiles = pgTable("artist_profiles", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id),
  artistName: varchar("artist_name"),
  specialty: varchar("specialty"), // sculptor, musician, painter, textile, etc.
  bio: text("bio"),
  portfolio: jsonb("portfolio"), // array of artwork/projects
  rating: decimal("rating", { precision: 3, scale: 2 }),
  totalWorks: integer("total_works").default(0),
  isVerified: boolean("is_verified").default(false),
  createdAt: timestamp("created_at").defaultNow(),
});

export const messages = pgTable("messages", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  senderId: varchar("sender_id").notNull().references(() => users.id),
  recipientId: varchar("recipient_id").references(() => users.id), // null for community messages
  content: text("content").notNull(),
  type: varchar("type").notNull().default("text"), // text, image, file
  isRead: boolean("is_read").default(false),
  threadId: varchar("thread_id"), // for grouped conversations
  createdAt: timestamp("created_at").defaultNow(),
});

export const accommodations = pgTable("accommodations", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: varchar("name").notNull(),
  type: varchar("type").notNull(), // tiny_house, a_frame, yurt, mobile_home
  description: text("description"),
  capacity: integer("capacity").notNull(),
  amenities: text("amenities").array(),
  pricePerNight: decimal("price_per_night", { precision: 10, scale: 2 }).notNull(),
  imageUrl: varchar("image_url"),
  isAvailable: boolean("is_available").default(true),
  createdAt: timestamp("created_at").defaultNow(),
});

export const bookings = pgTable("bookings", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  accommodationId: varchar("accommodation_id").notNull().references(() => accommodations.id),
  userId: varchar("user_id").notNull().references(() => users.id),
  checkIn: date("check_in").notNull(),
  checkOut: date("check_out").notNull(),
  guests: integer("guests").notNull(),
  totalAmount: decimal("total_amount", { precision: 10, scale: 2 }).notNull(),
  status: varchar("status").notNull().default("pending"), // pending, confirmed, cancelled, completed
  specialRequests: text("special_requests"),
  stripePaymentIntentId: varchar("stripe_payment_intent_id"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const resources = pgTable("resources", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  type: varchar("type").notNull(), // solar, water, food, internet
  name: varchar("name").notNull(),
  currentLevel: decimal("current_level", { precision: 5, scale: 2 }).notNull(),
  capacity: decimal("capacity", { precision: 5, scale: 2 }),
  unit: varchar("unit"), // percentage, kWh, liters, etc.
  status: varchar("status").notNull().default("normal"), // normal, warning, critical
  lastUpdated: timestamp("last_updated").defaultNow(),
  metadata: jsonb("metadata"), // additional sensor data
});

// Relations
export const usersRelations = relations(users, ({ many, one }) => ({
  organizedEvents: many(events),
  eventRegistrations: many(eventRegistrations),
  courseEnrollments: many(courseEnrollments),
  instructedCourses: many(courses),
  createdProjects: many(projects),
  donations: many(donations),
  artistProfile: one(artistProfiles),
  sentMessages: many(messages, { relationName: "sender" }),
  receivedMessages: many(messages, { relationName: "recipient" }),
  bookings: many(bookings),
}));

export const eventsRelations = relations(events, ({ one, many }) => ({
  organizer: one(users, {
    fields: [events.organizerId],
    references: [users.id],
  }),
  registrations: many(eventRegistrations),
}));

export const coursesRelations = relations(courses, ({ one, many }) => ({
  instructor: one(users, {
    fields: [courses.instructorId],
    references: [users.id],
  }),
  enrollments: many(courseEnrollments),
}));

export const projectsRelations = relations(projects, ({ one, many }) => ({
  creator: one(users, {
    fields: [projects.creatorId],
    references: [users.id],
  }),
  donations: many(donations),
}));

export const artistProfilesRelations = relations(artistProfiles, ({ one }) => ({
  user: one(users, {
    fields: [artistProfiles.userId],
    references: [users.id],
  }),
}));

// Insert schemas
export const insertEventSchema = createInsertSchema(events).omit({
  id: true,
  createdAt: true,
});

export const insertCourseSchema = createInsertSchema(courses).omit({
  id: true,
  createdAt: true,
});

export const insertProjectSchema = createInsertSchema(projects).omit({
  id: true,
  createdAt: true,
});

export const insertDonationSchema = createInsertSchema(donations).omit({
  id: true,
  createdAt: true,
});

export const insertBookingSchema = createInsertSchema(bookings).omit({
  id: true,
  createdAt: true,
});

export const insertAccommodationSchema = createInsertSchema(accommodations).omit({
  id: true,
  createdAt: true,
});

export const insertArtistProfileSchema = createInsertSchema(artistProfiles).omit({
  id: true,
  createdAt: true,
});

export const insertMessageSchema = createInsertSchema(messages).omit({
  id: true,
  createdAt: true,
});

// Types
export type UpsertUser = typeof users.$inferInsert;
export type User = typeof users.$inferSelect;
export type Event = typeof events.$inferSelect;
export type InsertEvent = z.infer<typeof insertEventSchema>;
export type Course = typeof courses.$inferSelect;
export type InsertCourse = z.infer<typeof insertCourseSchema>;
export type Project = typeof projects.$inferSelect;
export type InsertProject = z.infer<typeof insertProjectSchema>;
export type Donation = typeof donations.$inferSelect;
export type InsertDonation = z.infer<typeof insertDonationSchema>;
export type Accommodation = typeof accommodations.$inferSelect;
export type InsertAccommodation = z.infer<typeof insertAccommodationSchema>;
export type Booking = typeof bookings.$inferSelect;
export type InsertBooking = z.infer<typeof insertBookingSchema>;
export type ArtistProfile = typeof artistProfiles.$inferSelect;
export type InsertArtistProfile = z.infer<typeof insertArtistProfileSchema>;
export type Message = typeof messages.$inferSelect;
export type InsertMessage = z.infer<typeof insertMessageSchema>;
export type Resource = typeof resources.$inferSelect;
export type EventRegistration = typeof eventRegistrations.$inferSelect;
export type CourseEnrollment = typeof courseEnrollments.$inferSelect;
