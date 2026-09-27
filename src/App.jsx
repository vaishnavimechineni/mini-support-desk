import { useEffect, useState } from "react";
import "./App.css";

const API_URL = "http://localhost:5000";

function App() {
  const [tickets, setTickets] = useState([]);

  const [title, setTitle] = useState("");
  const [client, setClient] = useState("");
  const [priority, setPriority] = useState("Medium");

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] =
    useState("All Statuses");
  const [priorityFilter, setPriorityFilter] =
    useState("All Priorities");

  const [editingId, setEditingId] = useState(null);
  const [editTitle, setEditTitle] = useState("");
  const [editClient, setEditClient] = useState("");

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Load tickets from backend
  const loadTickets = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await fetch(`${API_URL}/tickets`);

      if (!response.ok) {
        throw new Error("Failed to load tickets");
      }

      const data = await response.json();
      setTickets(data);
    } catch (err) {
      console.error(err);
      setError(
        "Could not connect to the backend. Make sure server.js is running."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTickets();
  }, []);

  // Dashboard counts
  const totalTickets = tickets.length;

  const openTickets = tickets.filter(
    (ticket) => ticket.status === "Open"
  ).length;

  const progressTickets = tickets.filter(
    (ticket) => ticket.status === "In Progress"
  ).length;

  const resolvedTickets = tickets.filter(
    (ticket) => ticket.status === "Resolved"
  ).length;

  // Create ticket
  const createTicket = async () => {
    if (
      title.trim() === "" ||
      client.trim() === ""
    ) {
      alert(
        "Please enter ticket title and client name."
      );
      return;
    }

    try {
      const response = await fetch(
        `${API_URL}/tickets`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            title: title.trim(),
            client: client.trim(),
            priority: priority,
          }),
        }
      );

      if (!response.ok) {
        throw new Error("Failed to create ticket");
      }

      const newTicket = await response.json();

      setTickets((currentTickets) => [
        ...currentTickets,
        newTicket,
      ]);

      setTitle("");
      setClient("");
      setPriority("Medium");
    } catch (err) {
      console.error(err);
      alert("Could not create ticket.");
    }
  };

  // Delete ticket
  const deleteTicket = async (id) => {
    const confirmDelete = window.confirm(
      "Are you sure you want to delete this ticket?"
    );

    if (!confirmDelete) {
      return;
    }

    try {
      const response = await fetch(
        `${API_URL}/tickets/${id}`,
        {
          method: "DELETE",
        }
      );

      if (!response.ok) {
        throw new Error("Failed to delete ticket");
      }

      setTickets((currentTickets) =>
        currentTickets.filter(
          (ticket) => ticket.id !== id
        )
      );
    } catch (err) {
      console.error(err);
      alert("Could not delete ticket.");
    }
  };

  // Change status
  const changeStatus = async (
    id,
    newStatus
  ) => {
    try {
      const response = await fetch(
        `${API_URL}/tickets/${id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            status: newStatus,
          }),
        }
      );

      if (!response.ok) {
        throw new Error("Failed to update status");
      }

      const updatedTicket =
        await response.json();

      setTickets((currentTickets) =>
        currentTickets.map((ticket) =>
          ticket.id === id
            ? updatedTicket
            : ticket
        )
      );
    } catch (err) {
      console.error(err);
      alert("Could not update status.");
    }
  };

  // Change priority
  const changePriority = async (
    id,
    newPriority
  ) => {
    try {
      const response = await fetch(
        `${API_URL}/tickets/${id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            priority: newPriority,
          }),
        }
      );

      if (!response.ok) {
        throw new Error(
          "Failed to update priority"
        );
      }

      const updatedTicket =
        await response.json();

      setTickets((currentTickets) =>
        currentTickets.map((ticket) =>
          ticket.id === id
            ? updatedTicket
            : ticket
        )
      );
    } catch (err) {
      console.error(err);
      alert("Could not update priority.");
    }
  };

  // Start editing
  const startEdit = (ticket) => {
    setEditingId(ticket.id);
    setEditTitle(ticket.title);
    setEditClient(ticket.client);
  };

  // Save edited ticket
  const saveEdit = async (id) => {
    if (
      editTitle.trim() === "" ||
      editClient.trim() === ""
    ) {
      alert(
        "Title and client name cannot be empty."
      );
      return;
    }

    try {
      const response = await fetch(
        `${API_URL}/tickets/${id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            title: editTitle.trim(),
            client: editClient.trim(),
          }),
        }
      );

      if (!response.ok) {
        throw new Error("Failed to edit ticket");
      }

      const updatedTicket =
        await response.json();

      setTickets((currentTickets) =>
        currentTickets.map((ticket) =>
          ticket.id === id
            ? updatedTicket
            : ticket
        )
      );

      setEditingId(null);
      setEditTitle("");
      setEditClient("");
    } catch (err) {
      console.error(err);
      alert("Could not edit ticket.");
    }
  };

  // Cancel editing
  const cancelEdit = () => {
    setEditingId(null);
    setEditTitle("");
    setEditClient("");
  };

  // Format date
  const formatDate = (dateString) => {
    if (!dateString) {
      return "Date unavailable";
    }

    const date = new Date(dateString);

    return date.toLocaleString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  // Search and filters
  const filteredTickets = tickets.filter(
    (ticket) => {
      const searchText =
        search.toLowerCase();

      const matchesSearch =
        ticket.title
          .toLowerCase()
          .includes(searchText) ||
        ticket.client
          .toLowerCase()
          .includes(searchText);

      const matchesStatus =
        statusFilter === "All Statuses" ||
        ticket.status === statusFilter;

      const matchesPriority =
        priorityFilter ===
          "All Priorities" ||
        ticket.priority ===
          priorityFilter;

      return (
        matchesSearch &&
        matchesStatus &&
        matchesPriority
      );
    }
  );

  return (
    <div className="app">

      {/* HEADER */}
      <header className="header">
        <h1>Support Desk</h1>

        <p>
          Internal Support Ticket Management
          System
        </p>
      </header>

      <main className="container">

        {/* ERROR MESSAGE */}
        {error && (
          <div
            style={{
              background: "#fee2e2",
              color: "#991b1b",
              padding: "15px",
              borderRadius: "8px",
              marginBottom: "20px",
              textAlign: "center",
              fontWeight: "bold",
            }}
          >
            {error}
          </div>
        )}

        {/* DASHBOARD */}
        <section className="dashboard">

          <div className="stat-card">
            <h2>{totalTickets}</h2>
            <p>Total Tickets</p>
          </div>

          <div className="stat-card">
            <h2>{openTickets}</h2>
            <p>Open</p>
          </div>

          <div className="stat-card">
            <h2>{progressTickets}</h2>
            <p>In Progress</p>
          </div>

          <div className="stat-card">
            <h2>{resolvedTickets}</h2>
            <p>Resolved</p>
          </div>

        </section>

        {/* CREATE TICKET */}
        <section className="panel">

          <h2>Create New Ticket</h2>

          <div className="create-form">

            <input
              type="text"
              placeholder="Ticket title"
              value={title}
              onChange={(e) =>
                setTitle(e.target.value)
              }
            />

            <input
              type="text"
              placeholder="Client name"
              value={client}
              onChange={(e) =>
                setClient(e.target.value)
              }
            />

            <select
              value={priority}
              onChange={(e) =>
                setPriority(e.target.value)
              }
            >
              <option value="Low">
                Low Priority
              </option>

              <option value="Medium">
                Medium Priority
              </option>

              <option value="High">
                High Priority
              </option>
            </select>

            <button
              onClick={createTicket}
            >
              + Create Ticket
            </button>

          </div>

        </section>

        {/* SEARCH AND FILTER */}
        <section className="panel">

          <h2>Search & Filter</h2>

          <div className="filter-form">

            <input
              type="text"
              placeholder="Search by title or client..."
              value={search}
              onChange={(e) =>
                setSearch(e.target.value)
              }
            />

            <select
              value={statusFilter}
              onChange={(e) =>
                setStatusFilter(
                  e.target.value
                )
              }
            >
              <option>
                All Statuses
              </option>

              <option>
                Open
              </option>

              <option>
                In Progress
              </option>

              <option>
                Resolved
              </option>
            </select>

            <select
              value={priorityFilter}
              onChange={(e) =>
                setPriorityFilter(
                  e.target.value
                )
              }
            >
              <option>
                All Priorities
              </option>

              <option>
                Low
              </option>

              <option>
                Medium
              </option>

              <option>
                High
              </option>
            </select>

          </div>

        </section>

        {/* TICKETS */}
        <section className="tickets-section">

          <h2>Support Tickets</h2>

          {loading ? (

            <div className="no-tickets">
              Loading tickets...
            </div>

          ) : (

            <p className="ticket-count">
              {filteredTickets.length} tickets
            </p>

          )}

          {!loading &&
            filteredTickets.length === 0 && (
              <div className="no-tickets">
                No tickets found.
              </div>
            )}

          {!loading &&
            filteredTickets.length > 0 && (

              <div className="tickets-grid">

                {filteredTickets.map(
                  (ticket) => (

                    <div
                      className="ticket-card"
                      key={ticket.id}
                    >

                      <div className="ticket-header">

                        <span className="ticket-id">
                          Ticket #{ticket.id}
                        </span>

                        <span
                          className={`priority ${ticket.priority.toLowerCase()}`}
                        >
                          {ticket.priority}
                        </span>

                      </div>

                      {editingId ===
                      ticket.id ? (

                        <>
                          <input
                            type="text"
                            value={editTitle}
                            onChange={(e) =>
                              setEditTitle(
                                e.target.value
                              )
                            }
                            placeholder="Ticket title"
                          />

                          <input
                            type="text"
                            value={editClient}
                            onChange={(e) =>
                              setEditClient(
                                e.target.value
                              )
                            }
                            placeholder="Client name"
                            style={{
                              marginTop:
                                "10px",
                            }}
                          />

                          <div
                            style={{
                              marginTop:
                                "15px",
                            }}
                          >

                            <button
                              onClick={() =>
                                saveEdit(
                                  ticket.id
                                )
                              }
                            >
                              Save Changes
                            </button>

                            <button
                              onClick={
                                cancelEdit
                              }
                              style={{
                                marginLeft:
                                  "10px",
                                background:
                                  "#64748b",
                              }}
                            >
                              Cancel
                            </button>

                          </div>
                        </>

                      ) : (

                        <>

                          <h3>
                            {ticket.title}
                          </h3>

                          <p>
                            <strong>
                              Client:
                            </strong>{" "}
                            {ticket.client}
                          </p>

                          <p className="created-date">
                            <strong>
                              Created:
                            </strong>{" "}
                            {formatDate(
                              ticket.createdAt
                            )}
                          </p>

                          {/* PRIORITY */}
                          <div className="ticket-field">

                            <label>
                              Priority:
                            </label>

                            <select
                              value={
                                ticket.priority
                              }
                              onChange={(e) =>
                                changePriority(
                                  ticket.id,
                                  e.target.value
                                )
                              }
                            >
                              <option>
                                Low
                              </option>

                              <option>
                                Medium
                              </option>

                              <option>
                                High
                              </option>

                            </select>

                          </div>

                          {/* STATUS */}
                          <div className="ticket-field">

                            <label>
                              Status:
                            </label>

                            <select
                              value={
                                ticket.status
                              }
                              onChange={(e) =>
                                changeStatus(
                                  ticket.id,
                                  e.target.value
                                )
                              }
                            >
                              <option>
                                Open
                              </option>

                              <option>
                                In Progress
                              </option>

                              <option>
                                Resolved
                              </option>

                            </select>

                          </div>

                          {/* EDIT */}
                          <button
                            onClick={() =>
                              startEdit(ticket)
                            }
                            style={{
                              width: "100%",
                              marginTop:
                                "10px",
                            }}
                          >
                            ✏️ Edit Ticket
                          </button>

                          {/* DELETE */}
                          <button
                            className="delete-button"
                            onClick={() =>
                              deleteTicket(
                                ticket.id
                              )
                            }
                          >
                            🗑️ Delete Ticket
                          </button>

                        </>

                      )}

                    </div>

                  )
                )}

              </div>

            )}

        </section>

      </main>

    </div>
  );
}

export default App;