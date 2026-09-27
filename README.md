# Mini Support Desk

A full-stack web application for managing internal support tickets.

The Mini Support Desk allows users to create, view, search, filter, edit, update, and delete support tickets. The application uses a React frontend, an Express.js backend, and SQLite for persistent ticket storage.

## Live Demo

Frontend:
https://mini-support-desk-delta.vercel.app/

Backend:
https://mini-support-desk-dycu.onrender.com/

GitHub:
https://github.com/vaishnavimechineni/mini-support-desk

## Features

- Create new support tickets
- View all support tickets
- Search tickets by title or client
- Filter tickets by status
- Filter tickets by priority
- Edit ticket details
- Change ticket status
- Change ticket priority
- Delete tickets
- Dashboard with ticket statistics
- Persistent data storage using SQLite
- Responsive user interface
- Live frontend deployment on Vercel
- Live backend deployment on Render

## Dashboard

The dashboard displays:

- Total Tickets
- Open Tickets
- In Progress Tickets
- Resolved Tickets

## Sample Tickets

The application contains 10 sample support tickets:

| ID | Ticket Title | Client | Priority | Status |
|---|---|---|---|---|
| 1 | Password reset | Kiran | High | In Progress |
| 2 | Account update | Priya | Low | Resolved |
| 3 | Payment confirmation | Arjun | Medium | Resolved |
| 4 | Login problem | Rahul | High | Open |
| 5 | Software installation | Sneha | Medium | Open |
| 6 | Email not syncing | Ananya | High | Open |
| 7 | Software access request | Rohit | Medium | In Progress |
| 8 | Printer not working | Meena | Low | Open |
| 9 | Network issue | Aditya | High | Resolved |
| 10 | Account locked | Neha | Medium | Resolved |

## Technology Stack

### Frontend

- React
- Vite
- JavaScript
- HTML
- CSS

### Backend

- Node.js
- Express.js
- CORS

### Database

- SQLite
- better-sqlite3

### Deployment

- Vercel – Frontend
- Render – Backend

## Project Structure

```text
mini-support-desk/
│
├── public/
│
├── src/
│   ├── assets/
│   ├── App.jsx
│   ├── App.css
│   ├── index.css
│   └── main.jsx
│
├── server.js
├── index.html
├── package.json
├── package-lock.json
├── vite.config.js
├── .gitignore
└── README.md