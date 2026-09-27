import express from "express";
import cors from "cors";
import Database from "better-sqlite3";

const app = express();

const PORT = 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Create / open database
const db = new Database("supportdesk.db");

// Create tickets table
db.prepare(`
  CREATE TABLE IF NOT EXISTS tickets (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    client TEXT NOT NULL,
    priority TEXT NOT NULL DEFAULT 'Medium',
    status TEXT NOT NULL DEFAULT 'Open',
    createdAt TEXT NOT NULL
  )
`).run();

// Add initial tickets only if database is empty
const ticketCount = db
  .prepare("SELECT COUNT(*) AS count FROM tickets")
  .get();

if (ticketCount.count === 0) {
  const insert = db.prepare(`
    INSERT INTO tickets
    (title, client, priority, status, createdAt)
    VALUES (?, ?, ?, ?, ?)
  `);

  insert.run(
    "Password reset",
    "Kiran",
    "High",
    "In Progress",
    "2026-09-27T09:30:00"
  );

  insert.run(
    "Account update",
    "Priya",
    "Low",
    "Resolved",
    "2026-09-27T10:15:00"
  );

  insert.run(
    "Payment confirmation",
    "Arjun",
    "Medium",
    "Resolved",
    "2026-09-27T11:00:00"
  );

  insert.run(
    "Login problem",
    "Rahul",
    "High",
    "Open",
    "2026-09-27T12:20:00"
  );

  insert.run(
    "Software installation",
    "Sneha",
    "Medium",
    "Open",
    "2026-09-27T13:10:00"
  );
}

// Test route
app.get("/", (req, res) => {
  res.json({
    message: "Support Desk Backend is running!",
  });
});

// GET all tickets
app.get("/tickets", (req, res) => {
  const tickets = db
    .prepare(`
      SELECT *
      FROM tickets
      ORDER BY id ASC
    `)
    .all();

  res.json(tickets);
});

// CREATE ticket
app.post("/tickets", (req, res) => {
  const {
    title,
    client,
    priority,
  } = req.body;

  if (!title || !client) {
    return res.status(400).json({
      message:
        "Title and client are required.",
    });
  }

  const createdAt =
    new Date().toISOString();

  const result = db
    .prepare(`
      INSERT INTO tickets
      (title, client, priority, status, createdAt)
      VALUES (?, ?, ?, ?, ?)
    `)
    .run(
      title.trim(),
      client.trim(),
      priority || "Medium",
      "Open",
      createdAt
    );

  const newTicket = db
    .prepare(`
      SELECT *
      FROM tickets
      WHERE id = ?
    `)
    .get(result.lastInsertRowid);

  res.status(201).json(newTicket);
});

// UPDATE ticket
app.put("/tickets/:id", (req, res) => {
  const id = Number(req.params.id);

  const existingTicket = db
    .prepare(`
      SELECT *
      FROM tickets
      WHERE id = ?
    `)
    .get(id);

  if (!existingTicket) {
    return res.status(404).json({
      message: "Ticket not found.",
    });
  }

  const title =
    req.body.title !== undefined
      ? req.body.title.trim()
      : existingTicket.title;

  const client =
    req.body.client !== undefined
      ? req.body.client.trim()
      : existingTicket.client;

  const priority =
    req.body.priority !== undefined
      ? req.body.priority
      : existingTicket.priority;

  const status =
    req.body.status !== undefined
      ? req.body.status
      : existingTicket.status;

  db.prepare(`
    UPDATE tickets
    SET
      title = ?,
      client = ?,
      priority = ?,
      status = ?
    WHERE id = ?
  `).run(
    title,
    client,
    priority,
    status,
    id
  );

  const updatedTicket = db
    .prepare(`
      SELECT *
      FROM tickets
      WHERE id = ?
    `)
    .get(id);

  res.json(updatedTicket);
});

// DELETE ticket
app.delete("/tickets/:id", (req, res) => {
  const id = Number(req.params.id);

  const result = db
    .prepare(`
      DELETE FROM tickets
      WHERE id = ?
    `)
    .run(id);

  if (result.changes === 0) {
    return res.status(404).json({
      message: "Ticket not found.",
    });
  }

  res.json({
    message:
      "Ticket deleted successfully.",
  });
});

// Unknown route
app.use((req, res) => {
  res.status(404).json({
    message: "Route not found",
    route: req.originalUrl,
  });
});

// Start server
app.listen(PORT, () => {
  console.log(
    `Backend running at http://localhost:${PORT}`
  );

  console.log(
    "SQLite database connected successfully."
  );
});