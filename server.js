const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const cors = require("cors");
const fs = require("fs");
const path = require("path");

const app = express();
app.use(cors());
app.use(express.json());

const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: "http://localhost:3000",
    methods: ["GET", "POST"],
  },
});


// ─── DATASET LOADER ─────────────────────────────────────────────

const DATA_PATH = path.join(__dirname, "../dataset");

function load(file) {
  return JSON.parse(fs.readFileSync(path.join(DATA_PATH, file)));
}

function save(file, data) {
  fs.writeFileSync(
    path.join(DATA_PATH, file),
    JSON.stringify(data, null, 2)
  );
}

// Load datasets
let USERS = load("users.json");
let messages = load("messages.json");
let tasks = load("tasks.json");
let meetings = load("meetings.json");
let announcements = load("announcements.json");

// Track online users
const onlineUsers = {};


// ─── HELPER ─────────────────────────────────────────────────────

function getRoomKey(userId1, userId2) {
  const mentor = [userId1, userId2].find(id => USERS[id]?.role === "mentor");
  const mentee = [userId1, userId2].find(id => USERS[id]?.role === "mentee");
  if (!mentor || !mentee) return null;
  return `${mentor}-${mentee}`;
}


// ─── REST APIs ──────────────────────────────────────────────────

// LOGIN
app.post("/api/login", (req, res) => {
  const { email, password, role } = req.body;

  const user = Object.values(USERS).find(
    u => u.email === email && u.password === password && u.role === role
  );

  if (user) {
    const { password: _, ...safeUser } = user;
    res.json({ success: true, user: safeUser });
  } else {
    res.status(401).json({ success: false });
  }
});


// TASKS
app.get("/api/tasks", (req, res) => res.json(tasks));

app.post("/api/tasks", (req, res) => {
  const task = {
    id: Date.now(),
    ...req.body,
    status: "pending",
    progress: 0
  };

  tasks.push(task);
  save("tasks.json", tasks);

  io.emit("tasks:updated", tasks);
  res.json(task);
});

app.patch("/api/tasks/:id", (req, res) => {
  const id = parseInt(req.params.id);

  tasks = tasks.map(t =>
    t.id === id ? { ...t, ...req.body } : t
  );

  save("tasks.json", tasks);

  io.emit("tasks:updated", tasks);
  res.json(tasks.find(t => t.id === id));
});


// MEETINGS
app.get("/api/meetings", (req, res) => res.json(meetings));

app.post("/api/meetings", (req, res) => {
  const meeting = {
    id: Date.now(),
    ...req.body,
    status: "upcoming"
  };

  meetings.push(meeting);
  save("meetings.json", meetings);

  io.emit("meetings:updated", meetings);
  res.json(meeting);
});


// ANNOUNCEMENTS
app.get("/api/announcements", (req, res) => res.json(announcements));

app.post("/api/announcements", (req, res) => {
  const ann = {
    id: Date.now(),
    ...req.body,
    time: "Just now"
  };

  announcements.unshift(ann);
  save("announcements.json", announcements);

  io.emit("announcements:updated", announcements);
  res.json(ann);
});


// ONLINE USERS
app.get("/api/online", (req, res) => {
  res.json(Object.keys(onlineUsers));
});


// ─── SOCKET.IO ──────────────────────────────────────────────────

io.on("connection", (socket) => {

  console.log("Connected:", socket.id);

  // USER JOIN
  socket.on("user:join", (userId) => {

    onlineUsers[userId] = socket.id;
    socket.userId = userId;

    socket.join(userId);

    const user = USERS[userId];

    // Join rooms
    if (user?.role === "mentor") {
      user.mentees?.forEach(menteeId => {
        const room = getRoomKey(userId, menteeId);
        if (room) socket.join(room);
      });
    } else if (user?.role === "mentee") {
      const room = getRoomKey(userId, user.mentor);
      if (room) socket.join(room);
    }

    io.emit("users:online", Object.keys(onlineUsers));

    // send history
    const userMessages = {};

    if (user?.role === "mentor") {
      user.mentees?.forEach(menteeId => {
        const room = getRoomKey(userId, menteeId);
        if (room && messages[room])
          userMessages[room] = messages[room];
      });
    } else {
      const room = getRoomKey(userId, user.mentor);
      if (room && messages[room])
        userMessages[room] = messages[room];
    }

    socket.emit("messages:history", userMessages);
  });


  // SEND MESSAGE
  socket.on("message:send", ({ toUserId, text }) => {

    const fromUserId = socket.userId;
    if (!text?.trim()) return;

    const room = getRoomKey(fromUserId, toUserId);
    if (!room) return;

    const message = {
      id: Date.now(),
      from: fromUserId,
      to: toUserId,
      text,
      time: new Date().toLocaleTimeString(),
      room
    };

    if (!messages[room]) messages[room] = [];

    messages[room].push(message);

    save("messages.json", messages);

    io.to(room).emit("message:received", message);

    // notification
    if (onlineUsers[toUserId]) {
      io.to(toUserId).emit("notification:new", {
        text: `${USERS[fromUserId].name} sent message`
      });
    }

  });


  // TYPING
  socket.on("typing:start", ({ toUserId }) => {
    const room = getRoomKey(socket.userId, toUserId);
    if (room) socket.to(room).emit("typing:start");
  });

  socket.on("typing:stop", ({ toUserId }) => {
    const room = getRoomKey(socket.userId, toUserId);
    if (room) socket.to(room).emit("typing:stop");
  });


  // DISCONNECT
  socket.on("disconnect", () => {

    if (socket.userId) {
      delete onlineUsers[socket.userId];
      io.emit("users:online", Object.keys(onlineUsers));
    }

  });

});


// ─── START SERVER ───────────────────────────────────────────────

const PORT = 5000;

server.listen(PORT, () => {
  console.log("🚀 Server running on http://localhost:5000");
});