# PlateShare API

A small Express API backed by MongoDB. `index.js` mounts focused route and controller files so each request is easy to follow. The API stores users, food listings, food requests, categories, analytics, and contact messages in MongoDB.

## 1. Requirements

- Node.js 20 or newer.
- npm.
- A MongoDB database, local or MongoDB Atlas.

## 2. Create the database connection

1. Create a MongoDB database named `plateshare-db` (or choose another name for `MONGODB_DATABASE`).
2. Copy `.env.example` to `.env` in this folder.
3. Put your MongoDB connection string in `MONGODB_URI`. Keep the database username and password private. If your password has reserved URL characters, URL-encode them.
4. Replace `JWT_SECRET` with a private random value of at least 32 characters. Do not commit `.env`.
5. Leave `CLIENT_URL` set to the local Vite address while developing. For deployment, set it to your real frontend origin.

Generate a value locally in PowerShell with:

```powershell
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

Copy that output directly into `.env` as `JWT_SECRET`. Do not paste the generated value into chat or commit it.

Example PowerShell commands from `PlateShare-server`:

```powershell
Copy-Item .env.example .env
npm install
npm start
```

Edit `.env` before `npm start`. With the example configuration, the API listens on port 5001. Check `http://127.0.0.1:5001/api/health`; a healthy response includes `"database":"connected"`. If your `PORT` differs, use that port in the health URL.

## 3. Run the frontend with the API

In a second terminal, go to `PlateShare-client`, copy its `.env.example` to `.env`, then run:

```powershell
Copy-Item .env.example .env
npm install
npm run dev
```

The client uses `VITE_API_URL` to find the API. Restart Vite after changing `.env`. The local API URL is for development only; set the production API URL in the hosting provider’s environment settings before deploying.

## 4. First account and admin role

Register through the client to create the first normal user. Public registration always assigns the `user` role; a request body cannot grant admin access.

To promote your own account while developing:

1. Open MongoDB Compass and connect with your MongoDB URI.
2. Open the `plateshare-db` database, then the `users` collection.
3. Find your account by its email address.
4. Change only its `role` field from `user` to `admin` and save.
5. Sign out and sign back in. The next API request reads the current role from MongoDB.

Never add a public “register as admin” option.

## 5. Collections and fields

- `users`: name, unique lowercase email, bcrypt `passwordHash`, photo URL/data, role, creation date.
- `foods`: title, category, description, quantity, location, pickup window, image URL, owner ID/name/email, status, creation date.
- `foodRequests`: food ID/title/owner, requester ID/name/email/photo, message, status, creation date.
- `categories`: category name, URL-friendly slug, creation date.
- `contacts`: sender name/email/message and creation date.

Indexes are created at server startup for unique user email, food creation date, food/request lookup, and unique category slug. The four starter categories are inserted only when the collection is empty.

## 6. Folder guide

```text
PlateShare-server/
	index.js                    Express setup, route mounting, and server startup
	config/database.js          MongoDB connection, indexes, category defaults, old-food import
	routes/                     URL-to-controller mapping
	controllers/                Request validation and MongoDB operations
	middleware/                 JWT auth, admin checks, async handling, API errors
	utils/                      Shared ID, response, and food-validation helpers
```

## 7. API routes

| Method | Endpoint | Sign-in | Purpose |
| --- | --- | --- | --- |
| `GET` | `/api/health` | No | Check API and Mongo connection |
| `POST` | `/api/auth/register` | No | Create a user and return a JWT |
| `POST` | `/api/auth/login` | No | Verify password and return a JWT |
| `GET` | `/api/auth/me` | Yes | Verify the current JWT |
| `PATCH` | `/api/auth/profile` | Yes | Update name and profile image |
| `PATCH` | `/api/auth/password` | Yes | Change password after verifying current password |
| `GET` | `/api/foods` | No | Search, filter, sort, and page through available foods |
| `GET` | `/api/foods/mine` | Yes | Get the signed-in user’s listings; admins get all |
| `POST` | `/api/foods` | Yes | Create a food listing owned by the current user |
| `GET` | `/api/foods/:id` | No | Get one listing |
| `PATCH` | `/api/foods/:id` | Owner/admin | Update a listing |
| `DELETE` | `/api/foods/:id` | Owner/admin | Delete listing and its requests |
| `POST` | `/api/foods/:id/requests` | Yes | Create a pending food request |
| `GET` | `/api/foods/:id/requests` | Owner/admin | List requests for one food |
| `GET` | `/api/requests/mine` | Yes | Get requests sent by or received by the user |
| `PATCH` | `/api/requests/:id` | Owner/admin | Accept or reject a request |
| `GET` | `/api/stats` | No | Get live food, servings, neighborhood, and request counts |
| `POST` | `/api/contact` | No | Save a validated contact message |
| `GET` | `/api/analytics` | Yes | Get analytics limited to the signed-in user’s permitted foods and requests |
| `GET` | `/api/categories` | No | List categories used by Explore and food forms |
| `POST` | `/api/categories` | Admin | Add a category |
| `DELETE` | `/api/categories/:id` | Admin | Remove an unused category |
| `GET` | `/api/admin/users` | Admin | List accounts without password hashes; supports `search`, `page`, and `limit` |
| `PATCH` | `/api/admin/users/:id/role` | Admin | Assign `user` or `admin` role |
| `GET` | `/api/admin/analytics` | Admin | Get totals and database-derived bar, line, and pie datasets |
| `GET` | `/api/admin/contacts` | Admin | Paginated access to private contact submissions |

Protected requests use `Authorization: Bearer <token>`. The server checks the role and listing ownership; hiding a button in React is not treated as security.

`GET /api/admin/users?search=alice&page=1&limit=10` performs a case-insensitive search over name and email. Search input is trimmed, bounded, and escaped before it is used in a MongoDB regular expression. Pagination totals are calculated from the filtered result set.

## 8. Simple request lifecycle

1. The client sends a JSON request to an `/api` route.
2. `requireAuth` verifies the JWT and reloads the user from MongoDB.
3. The route validates fields and, where needed, checks ownership.
4. The route reads or writes the appropriate collection and returns JSON with an HTTP status.
5. Express returns a consistent error message for unknown routes and unexpected errors.

## 9. Security notes

- Passwords are hashed with bcrypt and are never returned in API responses.
- JWT secret, MongoDB credentials, and production URLs belong in environment variables.
- CORS is limited to the comma-separated origins in `CLIENT_URL`.
- Food text and request fields are validated on the server; client validation is only for usability.
- The server accepts food image URLs. Profile images accept HTTPS URLs or PNG/JPEG/WebP/GIF base64 data and are limited to 2 MB. They are stored on the user document for this small project. A dedicated image service is a better production option; no external image-storage credentials are configured.
- MongoDB Atlas network access should be limited to trusted IPs for production.

## 10. Demo sign-in details

The client’s **Fill demo details** button fills `demo@plateshare.local` and `plateshare-demo`; it does not bypass the real login API. To set it up, register once with those exact values. Then sign out and use the button on the login page. The new account has the regular `user` role.

To test the admin dashboard, promote a separate trusted account by following the Admin setup steps above. There is intentionally no hard-coded admin password or public admin-registration option.

## 11. Existing database data

The previous server used a `hasfoods` collection with different field names. This API uses `foods` and never deletes `hasfoods`. Startup migration copies only legacy records not already represented in `foods`, records a `legacyId` marker, and can resume safely after a partial migration. Existing records and references are not overwritten or dropped.

## 12. Testing

Run the built-in tests from this folder:

```powershell
npm test
```

These tests cover server-side food validation and safe image-source handling. Full API integration tests require a separate test MongoDB database and credentials; never point tests at production data.

## 13. Deployment readiness

For a Node.js host such as Render, configure the service root as `PlateShare-server`, use `npm install` during the build step, and use `npm start` as the start command. Set these environment variables in the host dashboard; do not commit them:

- `PORT` (the host may provide this automatically)
- `MONGODB_URI`
- `MONGODB_DATABASE=plateshare-db`
- `JWT_SECRET` (at least 32 random characters)
- `GOOGLE_CLIENT_ID` (optional unless Google sign-in is enabled)
- `CLIENT_URL` (the deployed frontend origin, or comma-separated allowed origins)

The frontend should be deployed separately, for example on Vercel, with `VITE_API_URL` set to the deployed API base ending in `/api`. The server's `CLIENT_URL` must match that frontend origin. Verify the deployed API with `GET /api/health` after MongoDB network access has been configured. This project does not include provider-specific deployment files or claim a deployment has been performed.
