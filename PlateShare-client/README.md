# PlateShare

PlateShare connects neighbours who have surplus food with people who can use it. The React client reads and writes food, accounts, requests, contact messages, and community statistics through the Express API and MongoDB. The JWT and selected light/dark theme are stored in browser local storage; the user profile is loaded from the API.

## Start the project

You need Node.js 20+, npm, and a MongoDB database (local MongoDB or MongoDB Atlas). Open two terminals from the project folder.

### 1. Configure and start the server

```powershell
Set-Location PlateShare-server
Copy-Item .env.example .env
npm install
```

Open `PlateShare-server/.env` and fill in:

- `MONGODB_URI`: your private MongoDB connection string.
- `MONGODB_DATABASE`: database name, normally `plateshare-db`.
- `JWT_SECRET`: a private random string with at least 32 characters.
- `CLIENT_URL`: the Vite origin(s), normally `http://localhost:5173,http://127.0.0.1:5173`.

Then start the API:

```powershell
npm start
```

Keep this terminal running. With the example configuration, check `http://127.0.0.1:5001/api/health`; the response should report that MongoDB is connected. The API creates the `users`, `foods`, `foodRequests`, and `contacts` collections as they are first used, and creates the required indexes at startup.

### 2. Configure and start the client

Open a second terminal:

```powershell
Set-Location PlateShare-client
Copy-Item .env.example .env
npm install
npm run dev
```

The client `.env` contains `VITE_API_URL=http://127.0.0.1:5001/api`. Restart Vite after changing it. Open the local URL Vite prints, usually `http://localhost:5173`.

### 3. Create an account and first food share

1. Choose **Join the table** and register. The API stores a bcrypt password hash and returns a JWT.
2. Add a food share from the profile menu or dashboard. The API validates the fields and writes the listing to MongoDB.
3. Open Explore to search, filter, sort, and page through MongoDB listings.
4. Sign in as another account and request a food share. The request is stored with `pending` status.
5. Sign back in as the listing owner. The request appears on that food’s detail page and in the dashboard; accept or reject it there.

To use **Fill demo details**, register once with email `demo@plateshare.local` and password `plateshare-demo`. Then sign out; the login button fills those credentials and still checks them through the API. This account is a regular user. For an admin demo, promote a separate account using the server README instructions; no admin password is hard-coded.

## Admin setup

Public registration always creates a regular `user`. To promote a trusted account for local testing, use MongoDB Compass to connect to your database, open `plateshare-db.users`, find your account by email, and change its `role` to `admin`. Sign out and back in. Admin routes and server actions verify the user role from MongoDB on each request.

## Where things live

```text
PlateShare/
  PlateShare-client/
    src/
      main.jsx                     React startup and browser router
      App.jsx                      Route definitions and protected-route display
      App.css, index.css           Page styling, responsive rules, and theme tokens
      components/
        Navbar/Navbar.jsx          Responsive navigation and its styles
        Footer.jsx                 Shared site footer
        FoodCard.jsx               Reusable food listing card
        UI/                         Button, Input, Card, Badge, Modal, Table, Dropdown, Loading
        Home/                       Separate reusable landing page sections
      context/                     Shared authenticated client state
      pages/
        Home/Home.jsx              Composes the landing page sections
        Explore/ExploreFoods.jsx    Search, filters, sort, and pagination
        FoodDetails/                Listing detail and request flow
        Auth.jsx, FoodForm.jsx      Login, registration, and food create/edit
        Dashboard.jsx               User/admin dashboard
        StaticPages.jsx             About, contact, profile, and 404
      services/api.js              Fetch wrapper, API URL, JWT header, and API errors
    .env.example                   Client API base URL
  PlateShare-server/
    index.js                       Express setup and route mounting
    config/                        MongoDB connection, indexes, migration, category defaults
    routes/                        Auth, food, request, admin, category, and misc URLs
    controllers/                   Request validation and MongoDB operations
    middleware/                    JWT checks, async handling, and central errors
    utils/                         Shared response and validation helpers
    .env.example                   Server environment variable names
    README.md                      Server setup, endpoint list, and Mongo notes
```

The server entry point mounts a small set of route and controller modules. `services/api.js` is the only place the client constructs API requests and attaches the JWT.

## Main API routes

- `POST /api/auth/register`, `POST /api/auth/login`, `GET /api/auth/me` handle account creation, sign-in, and session checks.
- `GET /api/foods` accepts `search`, `category`, `location`, `sort`, `page`, and `limit` query parameters.
- `GET /api/foods/:id` loads a public food detail.
- `POST /api/foods`, `PATCH /api/foods/:id`, and `DELETE /api/foods/:id` create and manage owner listings.
- `POST /api/foods/:id/requests` creates a pending request; `GET /api/foods/:id/requests` and `PATCH /api/requests/:id` support owner review.
- `GET /api/foods/mine` and `GET /api/requests/mine` load the signed-in user’s dashboard data.
- `GET /api/stats` provides the live homepage counters.
- `POST /api/contact` stores a validated contact message.
- `GET /api/categories` returns the Mongo categories used by Explore and food forms. Admins can add/remove categories with `POST` and `DELETE` on this route.
- `/api/admin/users` and `/api/admin/users/:id/role` are admin-only account tools. The users endpoint supports server-side `search`, `page`, and `limit` query parameters.

Every protected request sends `Authorization: Bearer <token>`. The server checks the JWT, loads the account from MongoDB, and enforces ownership and role permissions. The client route guard is only a user experience feature, not the security boundary.

## Existing food listings

The old API stored food documents in `plateshare-db.hasfoods` with fields such as `food_name` and `food_quantity`. On startup, the new API copies those records into `plateshare-db.foods` only when the new collection is empty. It keeps the old collection unchanged. Old listings are assigned a legacy owner and cannot be edited by a regular account; an admin can manage them. Back up the database before migrating important production data.

## Useful commands

Run from `PlateShare-client`:

```sh
npm run format
npm run lint
npm run build
npm run preview
```

`npm run format` uses Prettier to format all files under `src/`. Single quotes and trailing commas match the project style.

Run from `PlateShare-server`:

```sh
npm start
node --check index.js
```

## Data and security notes

- Passwords are hashed using bcrypt. The raw password is never stored or returned.
- JWTs expire after seven days; invalid/expired sessions are removed from the client.
- Food and request records, profiles, messages, and statistics live in MongoDB. Only the JWT and theme preference are stored locally; no food fallback fixtures remain in the client.
- Food categories live in MongoDB and are editable from the admin dashboard. A category with existing food listings cannot be removed.
- The API validates forms again on the server. Client checks help users but do not replace server validation.
- The profile image is currently stored as a small data URL on the user document. Food photos use image URLs. A dedicated image storage service is a good later improvement.
- Never commit `.env` files. Use the provided `.env.example` files as a guide and configure production variables in your hosting provider.
- For deployment, set `CLIENT_URL` to the deployed frontend origin and `VITE_API_URL` to the deployed API base URL. Do not use localhost API URLs in production.

## Deployment checklist

Deploy the client to a static host such as Vercel with the project root set to `PlateShare-client`, build command `npm run build`, and output directory `dist`. Configure `VITE_API_URL` in the host environment to the deployed backend URL ending in `/api`; the client only uses the `127.0.0.1:5001` fallback during Vite development, not production builds.

Deploy the API to a Node.js host such as Render from `PlateShare-server` with build command `npm install` and start command `npm start`. Configure `PORT`, `MONGODB_URI`, `MONGODB_DATABASE=plateshare-db`, `JWT_SECRET`, `CLIENT_URL`, and optional `GOOGLE_CLIENT_ID` in the provider's private environment settings. Allow the deployed API host to reach MongoDB, then check `/api/health`. Nested client routes require the static host to serve `index.html` as a fallback for browser refreshes.

No deployment has been performed from this repository. Full API verification still requires a running backend with valid MongoDB and, for Google sign-in, Google OAuth configuration.
