import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { verifySupabaseAuth, checkSupabaseKeys } from "./supabaseAuth";
import { insertEventSchema, insertCourseSchema, insertProjectSchema, insertDonationSchema, insertBookingSchema, insertArtistProfileSchema, insertMessageSchema } from "@shared/schema";

export async function registerRoutes(app: Express): Promise<Server> {
  if (process.env.NODE_ENV !== 'production') {
    app.get('/__auth/keys-check', async (_req, res) => {
      try {
        const result = await checkSupabaseKeys();
        const status = result.ok ? 200 : result.status || 500;
        res.status(status).json(result);
      } catch (error) {
        const message = error instanceof Error ? error.message : 'Unknown error';
        res.status(500).json({ ok: false, status: 0, text: message });
      }
    });
  }

  // Auth routes
  app.get('/api/auth/user', verifySupabaseAuth, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const user = await storage.getUser(userId);
      res.json(user);
    } catch (error) {
      console.error("Error fetching user:", error);
      res.status(500).json({ message: "Failed to fetch user" });
    }
  });

  app.patch('/api/user/profile', verifySupabaseAuth, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const updateData = {
        firstName: req.body.firstName,
        lastName: req.body.lastName,
        email: req.body.email,
        bio: req.body.bio,
        role: req.body.role,
        skills: req.body.skills,
        interests: req.body.interests,
        profileImageUrl: req.body.profileImageUrl,
      };
      const updatedUser = await storage.updateUser(userId, updateData);
      res.json(updatedUser);
    } catch (error) {
      console.error("Error updating user profile:", error);
      res.status(500).json({ message: "Failed to update user profile" });
    }
  });

  // Dashboard stats
  app.get('/api/dashboard/stats', verifySupabaseAuth, async (req, res) => {
    try {
      const stats = await storage.getDashboardStats();
      res.json(stats);
    } catch (error) {
      console.error("Error fetching dashboard stats:", error);
      res.status(500).json({ message: "Failed to fetch dashboard stats" });
    }
  });

  // Get community members
  app.get('/api/community/members', async (req, res) => {
    try {
      const members = await storage.getCommunityMembers();
      res.json(members);
    } catch (error) {
      console.error("Error fetching community members:", error);
      res.status(500).json({ message: "Failed to fetch community members" });
    }
  });

  // Event routes
  app.get('/api/events', async (req, res) => {
    try {
      const events = await storage.getEvents();
      res.json(events);
    } catch (error) {
      console.error("Error fetching events:", error);
      res.status(500).json({ message: "Failed to fetch events" });
    }
  });

  app.get('/api/events/:id', async (req, res) => {
    try {
      const event = await storage.getEvent(req.params.id);
      if (!event) {
        return res.status(404).json({ message: "Event not found" });
      }
      res.json(event);
    } catch (error) {
      console.error("Error fetching event:", error);
      res.status(500).json({ message: "Failed to fetch event" });
    }
  });

  app.post('/api/events', verifySupabaseAuth, async (req: any, res) => {
    try {
      const eventData = insertEventSchema.parse({
        ...req.body,
        organizerId: req.user.id,
      });
      const event = await storage.createEvent(eventData);
      res.json(event);
    } catch (error) {
      console.error("Error creating event:", error);
      res.status(500).json({ message: "Failed to create event" });
    }
  });

  app.post('/api/events/:id/register', verifySupabaseAuth, async (req: any, res) => {
    try {
      const registration = await storage.registerForEvent(
        req.params.id,
        req.user.id
      );
      res.json(registration);
    } catch (error) {
      console.error("Error registering for event:", error);
      res.status(500).json({ message: "Failed to register for event" });
    }
  });

  // Course routes
  app.get('/api/courses', async (req, res) => {
    try {
      const courses = await storage.getCourses();
      res.json(courses);
    } catch (error) {
      console.error("Error fetching courses:", error);
      res.status(500).json({ message: "Failed to fetch courses" });
    }
  });

  app.get('/api/courses/:id', async (req, res) => {
    try {
      const course = await storage.getCourse(req.params.id);
      if (!course) {
        return res.status(404).json({ message: "Course not found" });
      }
      res.json(course);
    } catch (error) {
      console.error("Error fetching course:", error);
      res.status(500).json({ message: "Failed to fetch course" });
    }
  });

  app.post('/api/courses', verifySupabaseAuth, async (req: any, res) => {
    try {
      const courseData = insertCourseSchema.parse({
        ...req.body,
        instructorId: req.user.id,
      });
      const course = await storage.createCourse(courseData);
      res.json(course);
    } catch (error) {
      console.error("Error creating course:", error);
      res.status(500).json({ message: "Failed to create course" });
    }
  });

  app.post('/api/courses/:id/enroll', verifySupabaseAuth, async (req: any, res) => {
    try {
      const enrollment = await storage.enrollInCourse(
        req.params.id,
        req.user.id
      );
      res.json(enrollment);
    } catch (error) {
      console.error("Error enrolling in course:", error);
      res.status(500).json({ message: "Failed to enroll in course" });
    }
  });

  app.get('/api/user/enrollments', verifySupabaseAuth, async (req: any, res) => {
    try {
      const enrollments = await storage.getUserCourseEnrollments(req.user.id);
      res.json(enrollments);
    } catch (error) {
      console.error("Error fetching enrollments:", error);
      res.status(500).json({ message: "Failed to fetch enrollments" });
    }
  });

  // Project routes
  app.get('/api/projects', async (req, res) => {
    try {
      const projects = await storage.getProjects();
      res.json(projects);
    } catch (error) {
      console.error("Error fetching projects:", error);
      res.status(500).json({ message: "Failed to fetch projects" });
    }
  });

  app.post('/api/projects', verifySupabaseAuth, async (req: any, res) => {
    try {
      const projectData = insertProjectSchema.parse({
        ...req.body,
        creatorId: req.user.id,
      });
      const project = await storage.createProject(projectData);
      res.json(project);
    } catch (error) {
      console.error("Error creating project:", error);
      res.status(500).json({ message: "Failed to create project" });
    }
  });

  app.post('/api/projects/:id/donate', verifySupabaseAuth, async (req: any, res) => {
    try {
      const donationData = insertDonationSchema.parse({
        ...req.body,
        projectId: req.params.id,
        userId: req.user.id,
      });
      const donation = await storage.createDonation(donationData);
      res.json(donation);
    } catch (error) {
      console.error("Error creating donation:", error);
      res.status(500).json({ message: "Failed to create donation" });
    }
  });

  // Accommodation routes
  app.get('/api/accommodations', async (req, res) => {
    try {
      const accommodations = await storage.getAccommodations();
      res.json(accommodations);
    } catch (error) {
      console.error("Error fetching accommodations:", error);
      res.status(500).json({ message: "Failed to fetch accommodations" });
    }
  });

  app.post('/api/bookings', verifySupabaseAuth, async (req: any, res) => {
    try {
      const bookingData = insertBookingSchema.parse({
        ...req.body,
        userId: req.user.id,
      });
      
      // Check availability first
      const isAvailable = await storage.checkAvailability(
        bookingData.accommodationId,
        bookingData.checkIn,
        bookingData.checkOut
      );
      
      if (!isAvailable) {
        return res.status(400).json({ message: "Accommodation not available for selected dates" });
      }
      
      const booking = await storage.createBooking(bookingData);
      res.json(booking);
    } catch (error) {
      console.error("Error creating booking:", error);
      res.status(500).json({ message: "Failed to create booking" });
    }
  });

  app.get('/api/user/bookings', verifySupabaseAuth, async (req: any, res) => {
    try {
      const bookings = await storage.getUserBookings(req.user.id);
      res.json(bookings);
    } catch (error) {
      console.error("Error fetching bookings:", error);
      res.status(500).json({ message: "Failed to fetch bookings" });
    }
  });

  // Artist routes
  app.get('/api/artists', async (req, res) => {
    try {
      const artists = await storage.getArtistProfiles();
      res.json(artists);
    } catch (error) {
      console.error("Error fetching artists:", error);
      res.status(500).json({ message: "Failed to fetch artists" });
    }
  });

  app.post('/api/artist-profile', verifySupabaseAuth, async (req: any, res) => {
    try {
      const profileData = insertArtistProfileSchema.parse({
        ...req.body,
        userId: req.user.id,
      });
      const profile = await storage.createArtistProfile(profileData);
      res.json(profile);
    } catch (error) {
      console.error("Error creating artist profile:", error);
      res.status(500).json({ message: "Failed to create artist profile" });
    }
  });

  // Message routes
  app.get('/api/messages/community', async (req, res) => {
    try {
      const messages = await storage.getCommunityMessages();
      res.json(messages);
    } catch (error) {
      console.error("Error fetching community messages:", error);
      res.status(500).json({ message: "Failed to fetch community messages" });
    }
  });

  app.get('/api/messages', verifySupabaseAuth, async (req: any, res) => {
    try {
      const messages = await storage.getMessages(req.user.id);
      res.json(messages);
    } catch (error) {
      console.error("Error fetching messages:", error);
      res.status(500).json({ message: "Failed to fetch messages" });
    }
  });

  app.post('/api/messages', verifySupabaseAuth, async (req: any, res) => {
    try {
      const messageData = insertMessageSchema.parse({
        ...req.body,
        senderId: req.user.id,
      });
      const message = await storage.sendMessage(messageData);
      res.json(message);
    } catch (error) {
      console.error("Error sending message:", error);
      res.status(500).json({ message: "Failed to send message" });
    }
  });

  // Resource routes
  app.get('/api/resources', async (req, res) => {
    try {
      const resources = await storage.getResources();
      res.json(resources);
    } catch (error) {
      console.error("Error fetching resources:", error);
      res.status(500).json({ message: "Failed to fetch resources" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
