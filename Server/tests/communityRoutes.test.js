const request = require("supertest");
const express = require("express");
const multer = require("multer");
const fs = require("fs");
const path = require("path");
const communityController = require("../controllers/communityController");
const communityRoutes = require("../routes/communityRoutes"); // Adjust the path as needed

// Mock Express app
const app = express();
app.use(express.json());

// Mock socket.io
const io = { emit: jest.fn() };
const userSocketMap = new Map();

// Initialize routes with mocked socket
const router = communityRoutes(io, userSocketMap);
app.use("/api/community", router);

// Create a mock upload folder
const UPLOADS_DIR = path.join(__dirname, "../uploads");
if (!fs.existsSync(UPLOADS_DIR)) {
  fs.mkdirSync(UPLOADS_DIR);
}

// Mock controller methods
jest.mock("../controllers/communityController", () => ({
  createPost: jest.fn((req, res) => res.status(201).json({ success: true })),
  editPost: jest.fn((req, res) => res.json({ success: true })),
  joinCommunity: jest.fn(() => (req, res) => res.json({ success: true })),
  createEvent: jest.fn(
    () => (req, res) => res.status(201).json({ success: true })
  ),
  createDraftEvent: jest.fn((req, res) =>
    res.status(201).json({ success: true })
  ),
  fetchCommEvents: jest.fn((req, res) => res.json({ events: [] })),
  fetchAllEvents: jest.fn((req, res) => res.json({ events: [] })),
  fetchAnEvent: jest.fn((req, res) => res.json({ event: {} })),
  bookSeat: jest.fn((req, res) => res.json({ success: true })),
  deletePost: jest.fn((req, res) => res.json({ success: true })),
  likePost: jest.fn((req, res) => res.json({ success: true })),
  acceptRequest: jest.fn((req, res) => res.json({ success: true })),
  incerementPostShare: jest.fn((req, res) => res.json({ success: true })),
  addComment: jest.fn((req, res) => res.status(201).json({ success: true })),
  fetchTickets: jest.fn((req, res) => res.json({ tickets: [] })),
  fetchCommunities: jest.fn((req, res) => res.json({ communities: [] })),
  fetchCommunity: jest.fn((req, res) => res.json({ community: {} })),
  createCommunity: jest.fn(
    () => (req, res) => res.status(201).json({ success: true })
  ),
  createDraftCommunity: jest.fn((req, res) =>
    res.status(201).json({ success: true })
  ),
}));

describe("Community Routes API Tests", () => {
  test("POST /api/community/post should create a new post", async () => {
    const res = await request(app)
      .post("/api/community/post")
      .attach("media", Buffer.from("test"), "test.png");
    expect(res.status).toBe(201);
    expect(res.body).toHaveProperty("success", true);
  });

  test("PUT /api/community/:postId should edit a post", async () => {
    const res = await request(app)
      .put("/api/community/123")
      .attach("media", Buffer.from("test"), "test.png");
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty("success", true);
  });

  test("PUT /api/community/join/:communityId should join a community", async () => {
    const res = await request(app).put("/api/community/join/456");
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty("success", true);
  });

  test("POST /api/community/events should create an event", async () => {
    const res = await request(app)
      .post("/api/community/events")
      .attach("profilePicture", Buffer.from("test"), "test.png");
    expect(res.status).toBe(201);
    expect(res.body).toHaveProperty("success", true);
  });

  test("GET /api/community/events/fetchCommEvents/:communityId should fetch community events", async () => {
    const res = await request(app).get(
      "/api/community/events/fetchCommEvents/789"
    );
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty("events");
  });

  test("PUT /api/community/events/bookseat/:eventId should book a seat", async () => {
    const res = await request(app).put("/api/community/events/bookseat/321");
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty("success", true);
  });

  test("DELETE /api/community/:postId should delete a post", async () => {
    const res = await request(app).delete("/api/community/123");
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty("success", true);
  });

  test("PUT /api/community/like/:postId should like a post", async () => {
    const res = await request(app).put("/api/community/like/123");
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty("success", true);
  });

  test("POST /api/community should create a new community", async () => {
    const res = await request(app)
      .post("/api/community")
      .attach("profilePicture", Buffer.from("test"), "test.png");
    expect(res.status).toBe(201);
    expect(res.body).toHaveProperty("success", true);
  });

  test("GET /api/community/tickets/:userId should fetch user tickets", async () => {
    const res = await request(app).get("/api/community/tickets/123");
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty("tickets");
  });

  test("GET /api/community/:userId should fetch user communities", async () => {
    const res = await request(app).get("/api/community/123");
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty("communities");
  });

  test("GET /api/community/:communityId/:userId should fetch a specific community", async () => {
    const res = await request(app).get("/api/community/456/123");
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty("community");
  });

  test("POST /api/community/draft-community should create a draft community", async () => {
    const res = await request(app)
      .post("/api/community/draft-community")
      .attach("profilePicture", Buffer.from("test"), "test.png");
    expect(res.status).toBe(201);
    expect(res.body).toHaveProperty("success", true);
  });
});
