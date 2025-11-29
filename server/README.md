# Webinar API (local)

This is a minimal Express REST API used for the webinar project.

Run:

```powershell
cd server
npm install
npm run start
```

By default the server listens on port `4000` and exposes these endpoints:

- `GET /api/webinars` - list webinars
- `POST /api/webinars` - add a webinar (body: JSON)
- `PUT /api/webinars/:id` - update
- `DELETE /api/webinars/:id` - delete
- `POST /api/auth/signup` - body `{ username, password }`
- `POST /api/auth/login` - body `{ username, password }`
- `POST /api/auth/forgot` - body `{ username, newPassword }`

Notes:
- Data is stored in `server/data/db.json` (file-based persistence).
- Admin login: `admin` / `admin` (returns `{ role: 'admin' }`).
 
MongoDB usage:
- If you provide a MongoDB connection string in the `MONGO_URI` environment variable, the server will use MongoDB for persistence instead of the file DB.
- Optionally set `MONGO_DB` to choose the database name (defaults to `webinar_db`).
- The server will create collections: `users`, `webinars`, `registrations`, `messages`, and `loginLogs`.

Example (Windows PowerShell):
```powershell
cd server
setx MONGO_URI "mongodb+srv://<user>:<pass>@cluster0.mongodb.net/?retryWrites=true&w=majority"
setx MONGO_DB "my_webinar_db"
npm install
npm start
```
