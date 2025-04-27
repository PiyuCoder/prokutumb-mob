const request = require("supertest");
const express = require("express");
const userRoute = require("../routes/userRoute");

// Mock Express App
const mockIO = {}; // Mock socket.io
const mockUserSocketMap = {};

const app = express();
app.use(express.json());
app.use("/api/user", userRoute(mockIO, mockUserSocketMap));

jest.mock("multer", () => {
  const mMock = jest.fn(() => ({
    single: jest.fn(() => (req, res, next) => {
      req.file = { filename: "mockProfilePic.jpg" };
      next();
    }),
    fields: jest.fn(() => (req, res, next) => {
      req.files = {
        profilePicture: [{ filename: "mockProfilePic.jpg" }],
        coverPicture: [{ filename: "mockCoverPic.jpg" }],
      };
      next();
    }),
  }));

  mMock.diskStorage = jest.fn(() => ({}));
  return mMock;
});

jest.mock("../controllers/userController", () => ({
  signup: jest.fn((req, res) => res.status(201).json({ success: true })),
  login: jest.fn((req, res) => res.json({ success: true, token: "mockToken" })),
  googleLogin: jest.fn((req, res) =>
    res.status(200).json({
      success: true,
      message: "Login successful!",
      token: "mockGoogleToken",
      user: { _id: "123", email: "test@example.com" }, // Mock user data
    })
  ),
  appleLogin: jest.fn((req, res) =>
    res.json({ success: true, token: "mockAppleToken" })
  ),
  createProfile: jest.fn((req, res) => res.status(201).json({ success: true })),
  fetchUserData: jest.fn((req, res) =>
    res.json({ user: { id: req.params.userId } })
  ),
  fetchUser: jest.fn((req, res) =>
    res.json({ user: { id: req.params.userId } })
  ),
  fetchUserInfo: jest.fn((req, res) =>
    res.json({ user: { id: req.params.userId } })
  ),
  editProfile: jest.fn((req, res) => res.json({ success: true })),
  editAbout: jest.fn((req, res) => res.json({ success: true })),
  sendRequest: jest.fn(
    () => (req, res) => res.status(200).json({ success: true })
  ), // ✅ Fix sendRequest mock
  fetchMessages: jest.fn((req, res) => res.json({ messages: [] })),
  follow: jest.fn((req, res) => res.json({ success: true })),
  deleteProfile: jest.fn((req, res) => res.status(200).json({ success: true })),
  getUserCommunitiesAndEvents: jest.fn((req, res) =>
    res.json({ communities: [], events: [] })
  ),

  fetchFriendRequests: jest.fn((req, res) => res.json({ requests: [] })),
  acceptRequest: jest.fn((req, res) => res.json({ success: true })),
  declineRequest: jest.fn((req, res) => res.json({ success: true })),
  addExperience: jest.fn((req, res) => res.json({ success: true })),
  editExperience: jest.fn((req, res) => res.json({ success: true })),
  editEdu: jest.fn((req, res) => res.json({ success: true })),
  addEducation: jest.fn((req, res) => res.json({ success: true })),
  fetchConversations: jest.fn((req, res) => res.json({ conversations: [] })),
  updateInterests: jest.fn((req, res) => res.json({ success: true })),
  fetchFriends: jest.fn((req, res) => res.json({ friends: [] })),
  fetchTopNetworkers: jest.fn((req, res) => res.json({ topNetworkers: [] })),
  fetchPeopleYouMayKnow: jest.fn((req, res) => res.json({ people: [] })),
}));

// ✅ Corrected Tests
describe("User Routes API Tests", () => {
  test("POST /users/signup should create a new user", async () => {
    const res = await request(app).post("/api/user/signup").send({
      username: "testuser",
      email: "test@example.com",
      password: "password123",
    });
    expect(res.status).toBe(201);
    expect(res.body).toHaveProperty("success", true);
  });

  test("POST /users/login should log in a user", async () => {
    const res = await request(app).post("/api/user/login").send({
      email: "test@example.com",
      password: "password123",
    });
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty("success", true);
    expect(res.body).toHaveProperty("token");
  });

  test("POST /users/google-signin should log in a user via Google", async () => {
    const res = await request(app).post("/api/user/google-signin").send({
      googleToken: "mockGoogleToken",
    });
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty("success", true);
    expect(res.body).toHaveProperty("token", "mockGoogleToken");
  });

  test("POST /users/create-profile should create a profile with an image", async () => {
    const res = await request(app)
      .post("/api/user/create-profile")
      .attach("profilePicture", Buffer.from("test"), "test.jpg");
    expect(res.status).toBe(201);
    expect(res.body).toHaveProperty("success", true);
  });

  test("GET /users/fetchUserData/:userId should fetch user data", async () => {
    const res = await request(app).get("/api/user/fetchUserData/123");
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty("user");
    expect(res.body.user).toHaveProperty("id", "123");
  });

  test("PUT /users/profile/:userId should update user profile", async () => {
    const res = await request(app)
      .put("/api/user/profile/123")
      .attach("profilePicture", Buffer.from("test"), "test.jpg")
      .attach("coverPicture", Buffer.from("test"), "test.jpg");
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty("success", true);
  });

  test("POST /users/send-connection-request should send a friend request", async () => {
    const res = await request(app)
      .post("/api/user/send-connection-request")
      .send({
        senderId: "123",
        recipientId: "456",
      });
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty("success", true);
  });

  test("GET /users/fetchMessages/:userId/:recipientId should fetch messages", async () => {
    const res = await request(app).get("/api/user/fetchMessages/123/456");
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty("messages");
  });

  test("PUT /users/follow/:followerId/:userId should follow a user", async () => {
    const res = await request(app).put("/api/user/follow/123/456");
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty("success", true);
  });

  test("DELETE /users/:userId should delete a user profile", async () => {
    const res = await request(app).delete("/api/user/123");
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty("success", true);
  });
});
