const request = require("supertest");
const express = require("express");
const router = require("../routes/otherRoutes"); // Adjust the path as needed
const otherController = require("../controllers/otherControllers");

// Mock Express app
const app = express();
app.use(express.json()); // Enable JSON body parsing
app.use("/api", router);

// Mock controller methods
jest.mock("../controllers/otherControllers", () => ({
  getNearbyUsers: jest.fn((req, res) => res.json({ users: [] })),
  prokuInteraction: jest.fn((req, res) =>
    res.status(201).json({ success: true })
  ),
  fetchProkuInteractions: jest.fn((req, res) => res.json({ interactions: [] })),
  searchPeople: jest.fn((req, res) => res.json({ people: [] })),
  searchCommunity: jest.fn((req, res) => res.json({ communities: [] })),
  searchEvent: jest.fn((req, res) => res.json({ events: [] })),
  getRecentPosts: jest.fn((req, res) => res.json({ posts: [] })),
  getNotifications: jest.fn((req, res) => res.json({ notifications: [] })),
  markAsRead: jest.fn((req, res) => res.json({ success: true })),
  addToWaitingList: jest.fn((req, res) =>
    res.status(201).json({ success: true })
  ),
  updateReferralLimit: jest.fn((req, res) => res.json({ success: true })),
}));

describe("Other Routes API Tests", () => {
  test("GET /api/nearby should return users", async () => {
    const res = await request(app).get("/api/nearby");
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty("users");
  });

  test("POST /api/interactions should create an interaction", async () => {
    const res = await request(app)
      .post("/api/interactions")
      .send({ userId: "123" });
    expect(res.status).toBe(201);
    expect(res.body).toHaveProperty("success", true);
  });

  test("GET /api/interactions/:userId should return user interactions", async () => {
    const res = await request(app).get("/api/interactions/123");
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty("interactions");
  });

  test("GET /api/search-people should return people results", async () => {
    const res = await request(app).get("/api/search-people");
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty("people");
  });

  test("GET /api/search-community should return community results", async () => {
    const res = await request(app).get("/api/search-community");
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty("communities");
  });

  test("GET /api/search-event should return event results", async () => {
    const res = await request(app).get("/api/search-event");
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty("events");
  });

  test("GET /api/recentPosts should return recent posts", async () => {
    const res = await request(app).get("/api/recentPosts");
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty("posts");
  });

  test("GET /api/notifications/:userId should return notifications", async () => {
    const res = await request(app).get("/api/notifications/123");
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty("notifications");
  });

  test("POST /api/notifications/mark-as-read should mark notifications as read", async () => {
    const res = await request(app).post("/api/notifications/mark-as-read");
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty("success", true);
  });

  test("POST /api/waiting-list should add a user to the waiting list", async () => {
    const res = await request(app)
      .post("/api/waiting-list")
      .send({ email: "test@example.com" });
    expect(res.status).toBe(201);
    expect(res.body).toHaveProperty("success", true);
  });

  test("POST /api/update-referral-limit should update referral limit", async () => {
    const res = await request(app)
      .post("/api/update-referral-limit")
      .send({ limit: 5 });
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty("success", true);
  });
});
