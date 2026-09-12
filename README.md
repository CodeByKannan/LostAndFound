# 🔍 Campus Lost & Found — MERN Stack

A full-stack MERN application designed to digitize campus lost-and-found management.

Students can report lost or found items, upload images, submit claims with proof, track claim status, and manage their listings through a centralized platform.

**Tech:** React.js · Node.js · Express.js · MongoDB · JWT · Cloudinary · Tailwind CSS

## ✨ Features

- **Lost & Found Listings** — Browse, filter, and search items by type, category, location, and date
- **Image Upload** — Upload up to 4 photos via Cloudinary
- **Claim System** — Submit claims for found items with proof; item owners can approve/reject
- **Notifications** — Get notified about new claims and claim status updates
- **User Dashboard** — Manage your postings, track submitted claims, read notifications
- **Admin Panel** — View platform stats, manage user roles
- **JWT Authentication** — Secure login/register with protected routes
- **Responsive Design** — Mobile-first UI with Tailwind CSS

## 🛠 Tech Stack

| Layer     | Technology                |
|-----------|---------------------------|
| Frontend  | React 18, Vite, Tailwind CSS |
| Backend   | Node.js, Express          |
| Database  | MongoDB + Mongoose        |
| Auth      | JWT + bcryptjs            |
| Images    | Cloudinary + Multer       |
| Routing   | React Router v6           |

## 🚀 Getting Started

### Prerequisites
- Node.js v18+
- MongoDB Atlas account (or local MongoDB)
- Cloudinary account (free tier works)

### 1. Clone & Install

```bash
git clone <repo-url>
cd campus-lost-found
npm run install-all
```

### 2. Configure Environment

Copy `.env.example` to `.env` in the root:

```bash
cp .env.example .env
```

Fill in your values:
```
MONGO_URI=mongodb+srv://...
JWT_SECRET=your_secret_key
CLOUDINARY_CLOUD_NAME=...
CLOUDINARY_API_KEY=...
CLOUDINARY_API_SECRET=...
```

### 3. Run Development Servers

```bash
npm run dev
```

This runs the Express server on **port 5000** and Vite dev server on **port 5173** concurrently.

### 4. Create Admin User

Register normally, then in MongoDB Atlas update your user's `role` field to `"admin"`.

## 📁 Project Structure

```
campus-lost-found/
├── server/
│   ├── config/
│   │   └── cloudinary.js       # Image upload config
│   ├── middleware/
│   │   └── auth.js             # JWT protection middleware
│   ├── models/
│   │   ├── User.js
│   │   ├── Item.js
│   │   ├── Claim.js
│   │   └── Notification.js
│   ├── routes/
│   │   ├── authRoutes.js
│   │   ├── itemRoutes.js
│   │   ├── claimRoutes.js
│   │   └── userRoutes.js
│   └── server.js
├── client/
│   ├── src/
│   │   ├── components/
│   │   │   ├── Navbar.jsx
│   │   │   ├── Footer.jsx
│   │   │   ├── ItemCard.jsx
│   │   │   └── ItemForm.jsx
│   │   ├── context/
│   │   │   └── AuthContext.jsx
│   │   ├── pages/
│   │   │   ├── Home.jsx
│   │   │   ├── ItemList.jsx
│   │   │   ├── ItemDetail.jsx
│   │   │   ├── PostItem.jsx
│   │   │   ├── EditItem.jsx
│   │   │   ├── Dashboard.jsx
│   │   │   ├── Profile.jsx
│   │   │   ├── Login.jsx
│   │   │   ├── Register.jsx
│   │   │   ├── AdminPanel.jsx
│   │   │   └── NotFound.jsx
│   │   ├── App.jsx
│   │   ├── main.jsx
│   │   └── index.css
│   ├── index.html
│   ├── package.json
│   ├── vite.config.js
│   └── tailwind.config.js
├── package.json
├── .env.example
├── .gitignore
└── README.md
```
## 🏗️ Architecture

```text
React.js + Tailwind CSS
          │
          ▼
     Express.js API
          │
     ┌────┴────┐
     ▼         ▼
 MongoDB   Cloudinary
     │
     ▼
 JWT Authentication

## 🌐 API Endpoints

### Auth
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | /api/auth/register | Register |
| POST | /api/auth/login | Login |
| GET | /api/auth/me | Get current user |
| PUT | /api/auth/profile | Update profile |
| PUT | /api/auth/password | Change password |

### Items
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | /api/items | List/search items |
| GET | /api/items/:id | Get item detail |
| POST | /api/items | Create item (auth) |
| PUT | /api/items/:id | Update item (owner) |
| DELETE | /api/items/:id | Delete item (owner) |
| GET | /api/items/user/mine | My items (auth) |
| PATCH | /api/items/:id/resolve | Resolve item (owner) |

### Claims
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | /api/claims | Submit claim (auth) |
| GET | /api/claims/item/:itemId | Claims on item (owner) |
| GET | /api/claims/mine | My claims (auth) |
| PATCH | /api/claims/:id/review | Approve/reject (owner) |

### Users
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | /api/users/notifications | My notifications |
| PATCH | /api/users/notifications/read | Mark read |
| GET | /api/users | All users (admin) |
| PATCH | /api/users/:id/role | Change role (admin) |
| GET | /api/users/admin/stats | Platform stats (admin) |

## 📦 Deployment

**Build the client:**
```bash
cd client && npm run build
```

Set `NODE_ENV=production` and the app will serve the React build from Express.

Compatible with: **Render**, **Railway**, **Heroku**, **DigitalOcean App Platform**.
