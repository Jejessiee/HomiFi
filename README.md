# HomiFi — Property Rental Platform

HomiFi (formerly *RentEase*) is a full-stack **MERN** property rental marketplace that connects admin-verified property owners directly with prospective renters. It digitises the core leasing journey: property discovery with filtering, multimedia listing management, role-based security, a booking lifecycle, and reservation cancellation with automatic inventory synchronisation.

> Capstone project — Enterprise Database, Semester 7.

---

## ✨ Features

- **Multi-role authentication & authorization** — Admin, Owner, and Renter roles secured with JWT, plus an owner-approval flag (`granted`).
- **Owner property management** — full CRUD on listings with multi-image upload via Multer.
- **Renter browsing & discovery** — card-based catalogue with search by address and filters for ad type and category.
- **Booking & reservation system** — renters submit booking requests; owners approve them (`pending` → `booked`).
- **Inventory synchronization** — property availability updates automatically with booking status.
- **Booking cancellation (soft update)** — renters cancel pending bookings; status becomes `Canceled` and the property is restored to `Available`.
- **Admin governance** — grant/revoke owner rights and monitor all users, properties, and bookings.

---

## 🧰 Tech Stack

| Layer | Technologies |
|-------|--------------|
| **Frontend** | React 19, Vite, React Router, Axios, Tailwind CSS, Ant Design |
| **Backend** | Node.js, Express.js 5 (MVC pattern) |
| **Database** | MongoDB with Mongoose ODM |
| **Auth & Uploads** | JSON Web Token (JWT), bcrypt, HTTP-only cookies, Multer |

---

## 🏗️ Architecture

A 3-tier client–server architecture following the **Model-View-Controller (MVC)** pattern:

```
┌──────────────────────────┐
│   React SPA (Frontend)   │   →  localhost:5173
└──────────────────────────┘
             │   ▲
 Axios/HTTP  │   │  JSON responses (+ JWT cookie)
             ▼   │
┌──────────────────────────┐
│   Express.js REST API    │   →  localhost:8001
└──────────────────────────┘
             │   ▲
Mongoose ODM │   │  documents
             ▼   │
┌──────────────────────────┐
│     MongoDB Database     │   homifi_db
└──────────────────────────┘
```

---

## 📁 Folder Structure

```
Code/
├── Backend/
│   ├── config/connect.js         # MongoDB connection
│   ├── controllers/              # admin / owner / user controllers
│   ├── middlewares/authMiddleware.js   # JWT verification
│   ├── models/                   # UserSchema, PropertySchema, BookingSchema
│   ├── routes/                   # adminRoutes, ownerRoutes, userRoutes
│   ├── uploads/                  # uploaded property images
│   ├── .env                      # environment variables (not committed)
│   └── index.js                  # Express entry point
└── Frontend/
    ├── src/
    │   ├── images/
    │   ├── modules/
    │   │   ├── admin/            # AdminHome, AllUsers, AllProperty, AllBookings
    │   │   ├── common/           # Home, Login, Register, ForgotPassword, Toast
    │   │   └── user/             # AllPropertiesCards, owner/, renter/
    │   ├── App.jsx               # routes + UserContext
    │   └── main.jsx
    └── vite.config.js
```

---

## 🚀 Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) v18 or later
- [MongoDB](https://www.mongodb.com/) (local server or Atlas cluster)

### Installation

Clone the repository and install dependencies for both the backend and frontend:

```bash
git clone https://github.com/Jejessiee/HomiFi.git
cd HomiFi

# Backend
cd Backend
npm install

# Frontend
cd ../Frontend
npm install
```

### Environment Variables

Create a `.env` file inside the `Backend/` folder:

```env
PORT=8001
MONGO_DB=mongodb://localhost:27017/homifi_db
JWT_SECRET=your_secret_here
```

### Running the Application

Start MongoDB first, then run the backend and frontend in **two separate terminals**:

```bash
# Terminal 1 — Backend (http://localhost:8001)
cd Backend
npm start        # or: node index.js

# Terminal 2 — Frontend (http://localhost:5173)
cd Frontend
npm run dev
```

Open <http://localhost:5173> in your browser.

---

## 🔌 API Endpoints

Base URL: `http://localhost:8001` — responses follow `{ success, message, data? }`.
Routes marked **🔒** require a valid JWT (HTTP-only cookie or `Bearer` token).

### User & Public — `/api/user`

| Endpoint | Method | Access | Description |
|----------|--------|--------|-------------|
| `/register` | POST | Public | Register a user; owners start as `ungranted` |
| `/login` | POST | Public | Authenticate; returns user + JWT |
| `/forgotpassword` | POST | Public | Reset password by email |
| `/getAllProperties` | GET | Public | List all property listings |
| `/getuserdata` | POST | 🔒 | Get the authenticated user's profile |
| `/bookinghandle/:propertyid` | POST | 🔒 Renter | Create a booking request |
| `/getallbookings` | GET | 🔒 Renter | List the renter's bookings |
| `/cancelbooking` | POST | 🔒 Renter | Soft-cancel a booking → `Canceled` |

### Owner — `/api/owner` (🔒 all)

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/postproperty` | POST | Add a property (multipart image upload) |
| `/getallproperties` | GET | List the owner's properties |
| `/getallbookings` | GET | List bookings for the owner's properties |
| `/handlebookingstatus` | POST | Update booking status & sync availability |
| `/deleteproperty/:propertyid` | DELETE | Delete a property |
| `/updateproperty/:propertyid` | PATCH | Update a property (optional image) |

### Admin — `/api/admin` (🔒 all)

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/getallusers` | GET | List all registered users |
| `/handlestatus` | POST | Grant/revoke owner publishing rights |
| `/getallproperties` | GET | List all properties |
| `/getallbookings` | GET | List all bookings |

---

## 🔐 Authentication & Roles

- Passwords are hashed with **bcrypt** before storage.
- On login, a **JWT** (1-day expiry) is issued as a secure `httpOnly` cookie and in the response body.
- `authMiddleware` verifies the token on protected routes and injects `userId` into the request.
- **Role-Based Access Control:** Admin, Owner, and Renter each get their own dashboard. New owners are `ungranted` and cannot list properties until an Admin approves them.

---

## 👩‍💻 Author

**Jessica** — Full-Stack Developer & System Analyst

---

## 📄 License

This project was developed for academic purposes.
