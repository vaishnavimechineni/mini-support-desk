import express from "express";
import cors from "cors";
import Database from "better-sqlite3";

const app = express();

const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Create / open SQLite database
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

// --------------------------------------------------
// SAMPLE TICKETS
// --------------------------------------------------

const sampleTickets = [
  {
    title: "Password reset",
    client: "Kiran",
    priority: "High",
    status: "In Progress",
    createdAt: "2026-09-27T09:30:00",
  },
  {
    title: "Account update",
    client: "Priya",
    priority: "Low",
    status: "Resolved",
    createdAt: "2026-09-27T10:15:00",
  },
  {
    title: "Payment confirmation",
    client: "Arjun",
    priority: "Medium",
    status: "Resolved",
    createdAt: "2026-09-27T11:00:00",
  },
  {
    title: "Login problem",
    client: "Rahul",
    priority: "High",
    status: "Open",
    createdAt: "2026-09-27T12:20:00",
  },
  {
    title: "Software installation",
    client: "Sneha",
    priority: "Medium",
    status: "Open",
    createdAt: "2026-09-27T13:10:00",
  },
  {
    title: "Email not syncing",
    client: "Ananya",
    priority: "High",
    status: "Open",
    createdAt: "2026-09-27T14:00:00",
  },
  {
    title: "Software access request",
    client: "Rohit",
    priority: "Medium",
    status: "In Progress",
    createdAt: "2026-09-27T14:30:00",
  },
  {
    title: "Printer not working",
    client: "Meena",
    priority: "Low",
    status: "Open",
    createdAt: "2026-09-27T15:00:00",
  },
  {
    title: "Network connection issue",
    client: "Aditya",
    priority: "High",
    status: "Resolved",
    createdAt: "2026-09-27T15:30:00",
  },
  {
    title: "Account locked",
    client: "Neha",
    priority: "Medium",
    status: "Resolved",
    createdAt: "2026-09-27T16:00:00",
  },
];

// Insert sample tickets only if they don't already exist
const insertSampleTicket = db.prepare(`
  INSERT INTO tickets
  (title, client, priority, status, createdAt)
  VALUES (?, ?, ?, ?, ?)
`);

for (const ticket of sampleTickets) {
  const existingTicket = db
    .prepare(`
      SELECT id
      FROM tickets
      WHERE title = ? AND client = ?
    `)
    .get(ticket.title, ticket.client);

  if (!existingTicket) {
    insertSampleTicket.run(
      ticket.title,
      ticket.client,
      ticket.priority,
      ticket.status,
      ticket.createdAt
    );
  }
}

// --------------------------------------------------
// TEST ROUTE
// --------------------------------------------------

app.get("/", (req, res) => {
  res.json({
    message: "Support Desk Backend is running!",
  });
});

// --------------------------------------------------
// GET ALL TICKETS
// --------------------------------------------------

app.get("/tickets", (req, res) => {
  try {
    const tickets = db
      .prepare(`
        SELECT *
        FROM tickets
        ORDER BY id ASC
      `)
      .all();

    res.status(200).json(tickets);
  } catch (error) {
    console.error(error);

    res.status(500).json({
      message: "Failed to fetch tickets.",
    });
  }
});

// --------------------------------------------------
// CREATE TICKET
// --------------------------------------------------

app.post("/tickets", (req, res) => {
  try {
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
  } catch (error) {
    console.error(error);

    res.status(500).json({
      message: "Failed to create ticket.",
    });
  }
});

// --------------------------------------------------
// UPDATE TICKET
// --------------------------------------------------

app.put("/tickets/:id", (req, res) => {
  try {
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

    res.status(200).json(updatedTicket);
  } catch (error) {
    console.error(error);

    res.status(500).json({
      message: "Failed to update ticket.",
    });
  }
});

// --------------------------------------------------
// DELETE TICKET
// --------------------------------------------------

app.delete("/tickets/:id", (req, res) => {
  try {
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

    res.status(200).json({
      message:
        "Ticket deleted successfully.",
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      message: "Failed to delete ticket.",
    });
  }
});

// --------------------------------------------------
// UNKNOWN ROUTE
// --------------------------------------------------

app.use((req, res) => {
  res.status(404).json({
    message: "Route not found",
    route: req.originalUrl,
  });
});

// --------------------------------------------------
// START SERVER
// --------------------------------------------------

app.listen(PORT, "0.0.0.0", () => {
  console.log(
    `Backend running on port ${PORT}`
  );

  console.log(
    "SQLite database connected successfully."
  );

  console.log(
    "10 sample tickets are configured."
  );
});