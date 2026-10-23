# 🍃 PlateShare — Share Food, Spread Kindness

**A community-driven food-sharing platform that connects people with surplus food to those who need it.**

PlateShare helps reduce food waste by making it easier to share available food, discover nearby food donations, and request food through a simple, accessible digital platform.

<p align="center">
  <img src="https://img.shields.io/badge/React-2026-61DAFB?style=for-the-badge&logo=react&logoColor=black" alt="React" />
  <img src="https://img.shields.io/badge/Node.js-Backend-339933?style=for-the-badge&logo=nodedotjs&logoColor=white" alt="Node.js" />
  <img src="https://img.shields.io/badge/MongoDB-Database-47A248?style=for-the-badge&logo=mongodb&logoColor=white" alt="MongoDB" />
  <img src="https://img.shields.io/badge/Deployment-Vercel%20%7C%20Render-black?style=for-the-badge" alt="Deployment" />
</p>

## 🌍 Project Overview

Food waste and food insecurity are two important challenges in our communities. PlateShare provides a digital space where food donors and people looking for food can connect more easily.

Whether someone wants to share extra food, discover available donations, or manage food requests, PlateShare aims to make the process straightforward and convenient.

## ✨ Key Features

- **Explore Available Food** — Browse food listings and discover sharing opportunities.
- **Search & Filter** — Find food using available search and filtering options.
- **Food Details** — View information about individual food listings.
- **Secure Authentication** — Register and log in to access personalized features.
- **Food Management** — Add, update, and manage your food listings.
- **Food Requests** — Submit and manage requests for available food.
- **Role-Based Access** — Separate user and admin experiences.
- **Dashboard & Analytics** — Access relevant management information and activity insights.
- **Responsive Interface** — Designed for a convenient experience across different screen sizes.
- **REST API & Database Integration** — Connect the frontend to a backend API and MongoDB database.

## 🛠️ Tech Stack

| Category | Technologies |
|---|---|
| Frontend | React, Vite, JavaScript |
| Styling | Tailwind CSS |
| Backend | Node.js, Express.js |
| Database | MongoDB |
| Authentication | JWT, bcrypt |
| API | REST API |
| Deployment | Vercel (Frontend), Render (Backend) |
| Version Control | Git, GitHub |

## 🏗️ Architecture

```text
                ┌─────────────────────┐
                │      User / Admin   │
                └──────────┬──────────┘
                           │
                           ▼
                ┌─────────────────────┐
                │   React + Vite UI   │
                │     (Vercel)        │
                └──────────┬──────────┘
                           │ REST API
                           ▼
                ┌─────────────────────┐
                │   Express + Node.js  │
                │      (Render)       │
                └──────────┬──────────┘
                           │
                           ▼
                ┌─────────────────────┐
                │      MongoDB        │
                └─────────────────────┘
```

## 📂 Project Structure

```text
PlateShare/
├── PlateShare-client/       # React + Vite frontend
│   ├── public/
│   ├── src/
│   ├── package.json
│   └── ...
├── PlateShare-server/       # Express backend
│   ├── package.json
│   ├── ...
├── .gitignore
└── README.md
```

## 🚀 Getting Started

Follow these steps to run PlateShare locally.

### Prerequisites

Make sure you have installed:

- [Node.js](https://nodejs.org/)
- npm
- A MongoDB database (local MongoDB or MongoDB Atlas)
- Git

### 1. Clone the repository

```bash
git clone https://github.com/asmasultana07/PlateShare.git
cd PlateShare
```

### 2. Set up the backend

```bash
cd PlateShare-server
npm install
```

Create a `.env` file inside `PlateShare-server/`:

```env
PORT=5000
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_strong_secret_key
CLIENT_URL=http://localhost:5173
```

Use your own MongoDB connection string and a strong JWT secret. Never commit your `.env` file or expose credentials publicly.

Start the backend:

```bash
npm start
```

### 3. Set up the frontend

Open another terminal:

```bash
cd PlateShare/PlateShare-client
npm install
```

Create a `.env` file inside `PlateShare-client/`:

```env
VITE_API_URL=http://localhost:5000
```

Make sure this URL matches the API base URL expected by the application.

Start the development server:

```bash
npm run dev
```

Open the local URL shown in your terminal, usually `http://localhost:5173`.

## 🌐 Deployment

PlateShare uses a separate frontend and backend deployment setup.

| Component | Platform |
|---|---|
| Frontend | Vercel |
| Backend API | Render |
| Database | MongoDB Atlas or another configured MongoDB instance |

For production deployment:

1. Deploy `PlateShare-server` as a Render Web Service.
2. Configure the backend environment variables in Render.
3. Deploy `PlateShare-client` to Vercel with the correct `VITE_API_URL`.
4. Set the backend's `CLIENT_URL` to the deployed frontend origin.
5. Verify authentication, food listings, food requests, and database connectivity.

> **Live Demo:** Add your deployed Vercel URL here when the frontend deployment is complete.

> **Backend API:** Add your Render service URL here.

## 🔐 Security Notes

- Sensitive credentials belong in environment variables.
- Passwords should be hashed before storage.
- Protected endpoints should validate authentication and authorization.
- Admin-only operations should enforce role-based permissions on the backend.
- Never expose database credentials or private authentication secrets in the repository.

## 🎯 Project Goals

PlateShare is built around three simple goals:

- **Reduce Food Waste** — Encourage people to share surplus food.
- **Strengthen Communities** — Make food-sharing opportunities easier to discover.
- **Use Technology for Good** — Apply modern web technologies to a meaningful real-world problem.

## 🔮 Future Improvements

Potential improvements include:

- Location-based food discovery.
- Email or in-app notifications for food requests.
- Food expiry reminders.
- Enhanced accessibility and user experience.
- More detailed community impact analytics.

 

## 💚 A Small Share Can Make a Big Difference

PlateShare is more than a food-listing application — it is an effort to make sharing easier, reduce waste, and build a more connected community.

**Share food. Spread kindness. Make an impact.**
