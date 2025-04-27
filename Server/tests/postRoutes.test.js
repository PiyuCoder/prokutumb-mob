const request = require("supertest");
const express = require("express");
const multer = require("multer");
const postController = require("../controllers/postController");
const postRoutes = require("../routes/postRoutes"); // Adjust the path if needed

// Mock Express app
const app = express();
app.use(express.json());

// Initialize routes
app.use("/api/posts", postRoutes);

// Mock controller methods
jest.mock("../controllers/postController", () => ({
  createPost: jest.fn((req, res) => res.status(201).json({ success: true })),
  editPost: jest.fn((req, res) => res.json({ success: true })),
  deletePost: jest.fn((req, res) => res.json({ success: true })),
  fetchPosts: jest.fn((req, res) => res.json({ posts: [] })),
  fetchPost: jest.fn((req, res) => res.json({ post: {} })),
  likePost: jest.fn((req, res) => res.json({ success: true })),
  incrementPostView: jest.fn((req, res) => res.json({ success: true })),
  incerementPostShare: jest.fn((req, res) => res.json({ success: true })),
  addComment: jest.fn((req, res) => res.status(201).json({ success: true })),
}));

describe("Post Routes API Tests", () => {
  test("POST /api/posts should create a new post", async () => {
    const res = await request(app)
      .post("/api/posts")
      .attach("media", Buffer.from("test"), "test.png");
    expect(res.status).toBe(201);
    expect(res.body).toHaveProperty("success", true);
  });

  test("PUT /api/posts/:postId should edit a post", async () => {
    const res = await request(app)
      .put("/api/posts/123")
      .attach("media", Buffer.from("test"), "test.png");
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty("success", true);
  });

  test("DELETE /api/posts/:postId should delete a post", async () => {
    const res = await request(app).delete("/api/posts/123");
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty("success", true);
  });

  test("GET /api/posts/:userId should fetch user posts", async () => {
    const res = await request(app).get("/api/posts/456");
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty("posts");
  });

  test("GET /api/posts/fetch/:id should fetch a single post", async () => {
    const res = await request(app).get("/api/posts/fetch/789");
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty("post");
  });

  test("PUT /api/posts/like/:postId should like a post", async () => {
    const res = await request(app).put("/api/posts/like/123");
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty("success", true);
  });

  test("PUT /api/posts/view/:postId should increment post view count", async () => {
    const res = await request(app).put("/api/posts/view/123");
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty("success", true);
  });

  test("PUT /api/posts/share/:postId should increment post shares", async () => {
    const res = await request(app).put("/api/posts/share/123");
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty("success", true);
  });

  test("POST /api/posts/comment/:postId should add a comment", async () => {
    const res = await request(app)
      .post("/api/posts/comment/123")
      .send({ text: "Nice post!" });
    expect(res.status).toBe(201);
    expect(res.body).toHaveProperty("success", true);
  });
});
