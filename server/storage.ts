import {
  users,
  events,
  courses,
  projects,
  accommodations,
  bookings,
  artistProfiles,
  messages,
  resources,
  eventRegistrations,
  courseEnrollments,
  donations,
  type User,
  type UpsertUser,
  type Event,
  type InsertEvent,
  type Course,
  type InsertCourse,
  type Project,
  type InsertProject,
  type Accommodation,
  type InsertAccommodation,
  type Booking,
  type InsertBooking,
  type ArtistProfile,
  type InsertArtistProfile,
  type Message,
  type InsertMessage,
  type Resource,
  type EventRegistration,
  type CourseEnrollment,
  type Donation,
  type InsertDonation,
} from "@shared/schema";
import { db } from "./db";
import { eq, desc, and, gte, lte, ilike, sql } from "drizzle-orm";

export interface IStorage {
  // User operations (mandatory for Replit Auth)
  getUser(id: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  upsertUser(user: UpsertUser): Promise<User>;
  updateUser(id: string, userData: Partial<User>): Promise<User>;
  getCommunityMembers(): Promise<User[]>;
  
  // Event operations
  getEvents(): Promise<Event[]>;
  getEvent(id: string): Promise<Event | undefined>;
  createEvent(event: InsertEvent): Promise<Event>;
  updateEvent(id: string, event: Partial<InsertEvent>): Promise<Event>;
  deleteEvent(id: string): Promise<void>;
  getUserEvents(userId: string): Promise<Event[]>;
  registerForEvent(eventId: string, userId: string): Promise<EventRegistration>;
  getEventRegistrations(eventId: string): Promise<EventRegistration[]>;
  
  // Course operations
  getCourses(): Promise<Course[]>;
  getCourse(id: string): Promise<Course | undefined>;
  createCourse(course: InsertCourse): Promise<Course>;
  updateCourse(id: string, course: Partial<InsertCourse>): Promise<Course>;
  deleteCourse(id: string): Promise<void>;
  enrollInCourse(courseId: string, userId: string): Promise<CourseEnrollment>;
  getUserCourseEnrollments(userId: string): Promise<CourseEnrollment[]>;
  updateCourseProgress(courseId: string, userId: string, progress: number): Promise<CourseEnrollment>;
  
  // Project operations
  getProjects(): Promise<Project[]>;
  getProject(id: string): Promise<Project | undefined>;
  createProject(project: InsertProject): Promise<Project>;
  updateProject(id: string, project: Partial<InsertProject>): Promise<Project>;
  deleteProject(id: string): Promise<void>;
  
  // Donation operations
  createDonation(donation: InsertDonation): Promise<Donation>;
  getProjectDonations(projectId: string): Promise<Donation[]>;
  
  // Accommodation operations
  getAccommodations(): Promise<Accommodation[]>;
  getAccommodation(id: string): Promise<Accommodation | undefined>;
  createAccommodation(accommodation: InsertAccommodation): Promise<Accommodation>;
  updateAccommodation(id: string, accommodation: Partial<InsertAccommodation>): Promise<Accommodation>;
  
  // Booking operations
  createBooking(booking: InsertBooking): Promise<Booking>;
  getUserBookings(userId: string): Promise<Booking[]>;
  getBooking(id: string): Promise<Booking | undefined>;
  updateBooking(id: string, booking: Partial<InsertBooking>): Promise<Booking>;
  checkAvailability(accommodationId: string, checkIn: string, checkOut: string): Promise<boolean>;
  
  // Artist operations
  getArtistProfiles(): Promise<ArtistProfile[]>;
  getArtistProfile(userId: string): Promise<ArtistProfile | undefined>;
  createArtistProfile(profile: InsertArtistProfile): Promise<ArtistProfile>;
  updateArtistProfile(userId: string, profile: Partial<InsertArtistProfile>): Promise<ArtistProfile>;
  
  // Message operations
  getMessages(userId: string): Promise<Message[]>;
  getCommunityMessages(): Promise<Message[]>;
  sendMessage(message: InsertMessage): Promise<Message>;
  markMessageAsRead(messageId: string): Promise<void>;
  
  // Resource operations
  getResources(): Promise<Resource[]>;
  updateResource(id: string, level: number, metadata?: any): Promise<Resource>;
  
  // Dashboard stats
  getDashboardStats(): Promise<{
    totalMembers: number;
    activeEvents: number;
    energyLevel: number;
    totalFunding: number;
  }>;
}

export class DatabaseStorage implements IStorage {
  // User operations
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.email, email));
    return user;
  }

  async upsertUser(userData: UpsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(userData)
      .onConflictDoUpdate({
        target: users.id,
        set: {
          ...userData,
          updatedAt: new Date(),
        },
      })
      .returning();
    return user;
  }

  async updateUser(id: string, userData: Partial<User>): Promise<User> {
    const [user] = await db
      .update(users)
      .set({
        ...userData,
        updatedAt: new Date(),
      })
      .where(eq(users.id, id))
      .returning();
    return user;
  }

  // Event operations
  async getEvents(): Promise<Event[]> {
    return await db.select().from(events).orderBy(desc(events.startDate));
  }

  async getEvent(id: string): Promise<Event | undefined> {
    const [event] = await db.select().from(events).where(eq(events.id, id));
    return event;
  }

  async createEvent(event: InsertEvent): Promise<Event> {
    const [newEvent] = await db.insert(events).values(event).returning();
    return newEvent;
  }

  async updateEvent(id: string, event: Partial<InsertEvent>): Promise<Event> {
    const [updatedEvent] = await db
      .update(events)
      .set(event)
      .where(eq(events.id, id))
      .returning();
    return updatedEvent;
  }

  async deleteEvent(id: string): Promise<void> {
    await db.delete(events).where(eq(events.id, id));
  }

  async getUserEvents(userId: string): Promise<Event[]> {
    return await db.select().from(events).where(eq(events.organizerId, userId));
  }

  async registerForEvent(eventId: string, userId: string): Promise<EventRegistration> {
    const [registration] = await db
      .insert(eventRegistrations)
      .values({ eventId, userId })
      .returning();
    return registration;
  }

  async getEventRegistrations(eventId: string): Promise<EventRegistration[]> {
    return await db
      .select()
      .from(eventRegistrations)
      .where(eq(eventRegistrations.eventId, eventId));
  }

  // Course operations
  async getCourses(): Promise<Course[]> {
    return await db.select().from(courses).where(eq(courses.isActive, true));
  }

  async getCourse(id: string): Promise<Course | undefined> {
    const [course] = await db.select().from(courses).where(eq(courses.id, id));
    return course;
  }

  async createCourse(course: InsertCourse): Promise<Course> {
    const [newCourse] = await db.insert(courses).values(course).returning();
    return newCourse;
  }

  async updateCourse(id: string, course: Partial<InsertCourse>): Promise<Course> {
    const [updatedCourse] = await db
      .update(courses)
      .set(course)
      .where(eq(courses.id, id))
      .returning();
    return updatedCourse;
  }

  async deleteCourse(id: string): Promise<void> {
    await db.update(courses).set({ isActive: false }).where(eq(courses.id, id));
  }

  async enrollInCourse(courseId: string, userId: string): Promise<CourseEnrollment> {
    const [enrollment] = await db
      .insert(courseEnrollments)
      .values({ courseId, userId })
      .returning();
    return enrollment;
  }

  async getUserCourseEnrollments(userId: string): Promise<CourseEnrollment[]> {
    return await db
      .select()
      .from(courseEnrollments)
      .where(eq(courseEnrollments.userId, userId));
  }

  async updateCourseProgress(
    courseId: string,
    userId: string,
    progress: number
  ): Promise<CourseEnrollment> {
    const [enrollment] = await db
      .update(courseEnrollments)
      .set({ progress })
      .where(
        and(
          eq(courseEnrollments.courseId, courseId),
          eq(courseEnrollments.userId, userId)
        )
      )
      .returning();
    return enrollment;
  }

  // Project operations
  async getProjects(): Promise<Project[]> {
    return await db.select().from(projects).orderBy(desc(projects.createdAt));
  }

  async getProject(id: string): Promise<Project | undefined> {
    const [project] = await db.select().from(projects).where(eq(projects.id, id));
    return project;
  }

  async createProject(project: InsertProject): Promise<Project> {
    const [newProject] = await db.insert(projects).values(project).returning();
    return newProject;
  }

  async updateProject(id: string, project: Partial<InsertProject>): Promise<Project> {
    const [updatedProject] = await db
      .update(projects)
      .set(project)
      .where(eq(projects.id, id))
      .returning();
    return updatedProject;
  }

  async deleteProject(id: string): Promise<void> {
    await db.delete(projects).where(eq(projects.id, id));
  }

  // Donation operations
  async createDonation(donation: InsertDonation): Promise<Donation> {
    const [newDonation] = await db.insert(donations).values(donation).returning();
    
    // Update project current amount
    const donationAmount = parseFloat(donation.amount);
    await db
      .update(projects)
      .set({
        currentAmount: sql`${projects.currentAmount} + ${donationAmount}`,
      })
      .where(eq(projects.id, donation.projectId));
    
    return newDonation;
  }

  async getProjectDonations(projectId: string): Promise<Donation[]> {
    return await db
      .select()
      .from(donations)
      .where(eq(donations.projectId, projectId))
      .orderBy(desc(donations.createdAt));
  }

  // Accommodation operations
  async getAccommodations(): Promise<Accommodation[]> {
    return await db.select().from(accommodations);
  }

  async getAccommodation(id: string): Promise<Accommodation | undefined> {
    const [accommodation] = await db
      .select()
      .from(accommodations)
      .where(eq(accommodations.id, id));
    return accommodation;
  }

  async createAccommodation(accommodation: InsertAccommodation): Promise<Accommodation> {
    const [newAccommodation] = await db
      .insert(accommodations)
      .values(accommodation)
      .returning();
    return newAccommodation;
  }

  async updateAccommodation(
    id: string,
    accommodation: Partial<InsertAccommodation>
  ): Promise<Accommodation> {
    const [updatedAccommodation] = await db
      .update(accommodations)
      .set(accommodation)
      .where(eq(accommodations.id, id))
      .returning();
    return updatedAccommodation;
  }

  // Booking operations
  async createBooking(booking: InsertBooking): Promise<Booking> {
    const [newBooking] = await db.insert(bookings).values(booking).returning();
    return newBooking;
  }

  async getUserBookings(userId: string): Promise<Booking[]> {
    return await db
      .select()
      .from(bookings)
      .where(eq(bookings.userId, userId))
      .orderBy(desc(bookings.createdAt));
  }

  async getBooking(id: string): Promise<Booking | undefined> {
    const [booking] = await db.select().from(bookings).where(eq(bookings.id, id));
    return booking;
  }

  async updateBooking(id: string, booking: Partial<InsertBooking>): Promise<Booking> {
    const [updatedBooking] = await db
      .update(bookings)
      .set(booking)
      .where(eq(bookings.id, id))
      .returning();
    return updatedBooking;
  }

  async checkAvailability(
    accommodationId: string,
    checkIn: string,
    checkOut: string
  ): Promise<boolean> {
    const conflicts = await db
      .select()
      .from(bookings)
      .where(
        and(
          eq(bookings.accommodationId, accommodationId),
          eq(bookings.status, "confirmed"),
          // Check for date overlaps
          sql`(${bookings.checkIn} <= ${checkOut} AND ${bookings.checkOut} >= ${checkIn})`
        )
      );
    
    return conflicts.length === 0;
  }

  // Artist operations
  async getArtistProfiles(): Promise<ArtistProfile[]> {
    return await db.select().from(artistProfiles).orderBy(desc(artistProfiles.rating));
  }

  async getArtistProfile(userId: string): Promise<ArtistProfile | undefined> {
    const [profile] = await db
      .select()
      .from(artistProfiles)
      .where(eq(artistProfiles.userId, userId));
    return profile;
  }

  async createArtistProfile(profile: InsertArtistProfile): Promise<ArtistProfile> {
    const [newProfile] = await db
      .insert(artistProfiles)
      .values(profile)
      .returning();
    return newProfile;
  }

  async updateArtistProfile(
    userId: string,
    profile: Partial<InsertArtistProfile>
  ): Promise<ArtistProfile> {
    const [updatedProfile] = await db
      .update(artistProfiles)
      .set(profile)
      .where(eq(artistProfiles.userId, userId))
      .returning();
    return updatedProfile;
  }

  // Message operations
  async getMessages(userId: string): Promise<Message[]> {
    return await db
      .select()
      .from(messages)
      .where(eq(messages.recipientId, userId))
      .orderBy(desc(messages.createdAt));
  }

  async getCommunityMessages(): Promise<Message[]> {
    return await db
      .select()
      .from(messages)
      .where(sql`${messages.recipientId} IS NULL`)
      .orderBy(desc(messages.createdAt))
      .limit(50);
  }

  async sendMessage(message: InsertMessage): Promise<Message> {
    const [newMessage] = await db.insert(messages).values(message).returning();
    return newMessage;
  }

  async markMessageAsRead(messageId: string): Promise<void> {
    await db
      .update(messages)
      .set({ isRead: true })
      .where(eq(messages.id, messageId));
  }

  // Resource operations
  async getResources(): Promise<Resource[]> {
    return await db.select().from(resources).orderBy(resources.type);
  }

  async updateResource(id: string, level: number, metadata?: any): Promise<Resource> {
    const [updatedResource] = await db
      .update(resources)
      .set({
        currentLevel: level.toString(),
        lastUpdated: new Date(),
        metadata,
      })
      .where(eq(resources.id, id))
      .returning();
    return updatedResource;
  }

  // Dashboard stats
  async getDashboardStats(): Promise<{
    totalMembers: number;
    activeEvents: number;
    energyLevel: number;
    totalFunding: number;
    newMembersThisMonth: number;
    upcomingEvents: number;
    fundingProgress: number;
  }> {
    const [memberCount] = await db
      .select({ count: sql<number>`count(*)` })
      .from(users);

    const [eventCount] = await db
      .select({ count: sql<number>`count(*)` })
      .from(events)
      .where(
        and(
          eq(events.status, "active"),
          gte(events.startDate, new Date())
        )
      );

    const [solarResource] = await db
      .select()
      .from(resources)
      .where(eq(resources.type, "solar"))
      .limit(1);

    const [fundingSum] = await db
      .select({ total: sql<number>`sum(${donations.amount})` })
      .from(donations);

    // Get new members this month
    const oneMonthAgo = new Date();
    oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1);
    
    const [newMembersCount] = await db
      .select({ count: sql<number>`count(*)` })
      .from(users)
      .where(gte(users.createdAt, oneMonthAgo));

    // Get upcoming events this weekend
    const today = new Date();
    const thisWeekend = new Date();
    thisWeekend.setDate(today.getDate() + (6 - today.getDay())); // Next Saturday
    
    const [weekendEventCount] = await db
      .select({ count: sql<number>`count(*)` })
      .from(events)
      .where(
        and(
          eq(events.status, "active"),
          gte(events.startDate, today),
          lte(events.startDate, thisWeekend)
        )
      );

    return {
      totalMembers: memberCount.count || 0,
      activeEvents: eventCount.count || 0,
      energyLevel: parseFloat(solarResource?.currentLevel || "0"),
      totalFunding: fundingSum.total || 0,
      newMembersThisMonth: newMembersCount.count || 0,
      upcomingEvents: weekendEventCount.count || 0,
      fundingProgress: 0, // No active projects with goals currently
    };
  }

  async getCommunityMembers(): Promise<User[]> {
    const allUsers = await db.select().from(users).orderBy(users.createdAt);
    return allUsers;
  }
}

export const storage = new DatabaseStorage();
