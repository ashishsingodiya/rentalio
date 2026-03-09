# Rentalio

A full-stack rental listings and move-in management platform connecting tenants, property owners, and admins.

---

## Features

### Tenants

- Browse and filter published property listings
- View featured listings on the homepage
- Shortlist / favourite properties
- Request property visits and track their status
- Structured three-stage move-in flow (Documents → Agreement → Inventory)
- Raise and track support tickets with admin messaging

### Property Owners

- Create listings with multi-image galleries (stored on ImageKit CDN)
- Listing status workflow: `draft → review → published / rejected → rented`
- Manage visit requests (schedule, reject, mark as visited)
- Set move-in terms — agreement text, security deposit, lease duration
- Define inventory with item conditions, confirm final move-in

### Admins

- Approve or reject listings submitted by owners
- Toggle `isFeatured` flag of a listing for homepage visibility
- View and manage all support tickets, reply, and update ticket status (`open → in_progress → resolved → closed`)

---

## Tech Stack

| Layer               | Technology                                                      |
| ------------------- | --------------------------------------------------------------- |
| Frontend            | React 19, Vite 7, React Router DOM 7, Tailwind CSS 4, shadcn/ui |
| Backend             | Node.js (ESM), Express.js 5                                     |
| Database            | MongoDB (Mongoose 9)                                            |
| Auth                | JWT (`jsonwebtoken`), `bcryptjs`                                |
| Image Storage       | ImageKit CDN (via `imagekit` SDK + `multer`)                    |

---

## Project Structure

```
rentalio/
├── client/                 # React SPA (Vite)
│   └── src/
│       ├── App.jsx           # Route definitions
│       ├── context/          # Global auth state (AppContext)
│       ├── pages/
│       │   ├── (public)      # Home, Browse, Login, Signup, Property Detail, Shortlisted
│       │   ├── tenant/       # Dashboard, Visits, Move-Ins, Support
│       │   ├── owner/        # Dashboard, Listings, Create, Visits, Move-Ins
│       │   └── admin/        # Dashboard, Listings, Tickets
│       └── components/       # Shared UI components, role-aware headers
├── server/                  # Express REST API
│   ├── index.js              # App entry, route mounting
│   ├── configs/              # DB and ImageKit config
│   ├── middleware/           # JWT auth guards, multer upload
│   ├── models/               # Mongoose schemas (User, Listing, Visit, MoveIn, Ticket)
│   ├── routes/               # Express routers
│   ├── controllers/          # Business logic
│
```

---

## Getting Started

### Prerequisites

- Node.js 22+
- MongoDB instance (local or Atlas)
- ImageKit account (for image uploads)

### Environment Variables

Create a `.env` file in the `backend/` directory:

```env
PORT=3000
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret

IMAGEKIT_PUBLIC_KEY=your_imagekit_public_key
IMAGEKIT_PRIVATE_KEY=your_imagekit_private_key
IMAGEKIT_ENDPOINT_URL=https://ik.imagekit.io/your_id
```

Create a `.env` file in the `frontend/` directory:

```env
VITE_BASE_URL=http://localhost:3000
```

### Running Locally

**Backend:**

```bash
cd server
npm install
node index.js
```

**Frontend:**

```bash
cd client
npm install
npm run dev
```

## Authentication

- Passwords are hashed with `bcryptjs`. JWTs are issued on login and stored in `localStorage`.
- All Axios requests attach the token via the `Authorization` header.
- Server-side middleware (`protect`, `requireAdmin`, `requireOwner`, `requireTenant`) validates the token and enforces role-based access on every protected route.

---