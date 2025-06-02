# Timecard System (fnenow/timecard)

A web-based time tracking and payroll calculation system.

## Project Structure

-   `/backend`: Node.js/Express backend application.
-   `/frontend`: HTML, CSS, and JavaScript for the user interface.

## Setup (Conceptual for Railway)

### Backend

-   Requires Node.js.
-   Dependencies are listed in `backend/package.json`.
-   Environment variables needed (managed by Railway):
    -   `PORT` (provided by Railway)
    -   `DATABASE_URL` (for connecting to the database service on Railway)
    -   `JWT_SECRET` (if implementing token-based authentication)

### Frontend

-   Static HTML, CSS, JS files.
-   Can be served by the backend Express app or as a separate static site service on Railway.
-   JavaScript files will make API calls to the backend service.

## Development (Online via GitHub Codespaces or similar)

1.  Open the repository in GitHub Codespaces.
2.  **Backend:**
    -   `cd backend`
    -   `npm install` (if not already done by Codespaces)
    -   `npm start` (or `npm run dev` if nodemon is configured)
3.  **Frontend:**
    -   Can be served by the backend or a simple HTTP server for development (e.g., Python's `http.server` or `live-server` npm package).