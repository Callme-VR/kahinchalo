# KahinChale Travel Platform

A comprehensive travel booking platform built with **Bun**, **TypeScript**, **Express**, **Prisma**, and **PostgreSQL**. Features a multi-role system for Users, Vendors, and Admins, supporting trip management, booking, reviews, and interactive support.

## 🚀 Tech Stack

- **Runtime:** [Bun](https://bun.sh) (Fast all-in-one JS runtime)
- **Framework:** Express.js
- **Database:** PostgreSQL
- **ORM:** Prisma
- **Authentication:** JWT (jsonwebtoken) + bcrypt + cookie-parser
- **Language:** TypeScript
- **Security:** Helmet.js, CORS, Zod validation

## 📁 Project Structure

```
khachale/
├── prisma/
│   ├── schema.prisma          # Database schema (Models: User, Vendor, Trip, etc.)
│   ├── migrations/            # DB migration history
│   └── seed.ts                # Initial data seeding
├── src/
│   ├── controllers/
│   │   ├── adminControllers/  # Admin management, promotions & reports
│   │   ├── authControllers/   # Authentication, Login, Register, OTP
│   │   ├── reviewControllers/ # Multi-directional review system
│   │   ├── tripControllers/   # Trip discovery & booking
│   │   └── userControllers/   # User profile & support queries
│   ├── routes/
│   │   ├── adminRoutes/       # Admin endpoints (/api/admin)
│   │   ├── authRoutes/        # Auth endpoints (/api/auth)
│   │   ├── reviewRoutes/      # Review endpoints (/api/reviews)
│   │   ├── tripRoutes/        # Trip endpoints (/api/trips)
│   │   └── userRoutes/        # User endpoints (/api/users)
│   ├── middleware/
│   │   └── authMiddleware/    # JWT & Role-based authentication
│   ├── lib/
│   │   └── db.ts              # Global Prisma client instance
│   ├── generated/prisma/      # Auto-generated Prisma client (ignored in git)
│   ├── types/
│   │   └── express.d.ts       # Type extensions for AuthenticatedRequest
│   └── index.ts               # Application Entry Point
├── Dockerfile                 # Production Docker image
├── Dockerfile.dev             # Development Docker image
├── docker-compose.yml         # Production composition
└── docker-compose.dev.yml     # Development composition with hot-reload
```

## 🔐 Authentication & Roles

The system handles three primary roles:

1.  **USER**: Standard travelers who book trips and leave reviews.
2.  **VENDOR**: Travel providers who list trips and can rate users.
3.  **ADMIN**: Platform managers who approve vendors, manage categories, and view reports.

**Auth Flow:** Register/Login → Set HTTP-Only Cookie (`jwt`) → Middleware validation via `authenticateUser`.

## 📡 API Endpoints

### Admin Endpoints (`/api/admin`)

| Method | Endpoint               | Description                           |
| :----- | :--------------------- | :------------------------------------ |
| `GET`  | `/vendors`             | List all vendors (filter by `status`) |
| `PUT`  | `/vendors/:id/approve` | Approve a pending vendor              |
| `POST` | `/vendor-categories`   | Create new vendor categories          |
| `POST` | `/trips`               | Create a new trip                     |
| `PUT`  | `/trips/:id/promote`   | Promote a trip & set age groups       |
| `GET`  | `/queries`             | List all user support queries         |
| `PUT`  | `/queries/:id/reply`   | Reply to a support query              |
| `GET`  | `/reports/revenue`     | Aggregate financial reports           |
| `GET`  | `/reports/topvendors`  | Top performing vendors by rating      |

### Review Endpoints (`/api/reviews`)

| Method | Endpoint            | Description           |
| :----- | :------------------ | :-------------------- |
| `POST` | `/trip/:tripId`     | User reviews a trip   |
| `POST` | `/vendor/:vendorId` | User reviews a vendor |
| `POST` | `/user/:userId`     | Vendor reviews a user |

### Trip Endpoints (`/api/trips`)

| Method | Endpoint    | Description                                          |
| :----- | :---------- | :--------------------------------------------------- |
| `GET`  | `/`         | List trips with filters (location, budget, ageGroup) |
| `GET`  | `/:id`      | Get detailed trip data and reviews                   |
| `POST` | `/bookings` | Book a trip (updates capacity)                       |

### Auth Endpoints (`/api/auth`)

| Method | Endpoint      | Description              |
| :----- | :------------ | :----------------------- |
| `POST` | `/register`   | User/Vendor registration |
| `POST` | `/login`      | Secure login             |
| `POST` | `/otp/send`   | Send verification code   |
| `POST` | `/otp/verify` | Verify identity code     |

## 🛠️ Getting Started

### Prerequisites

- [Bun](https://bun.sh) installed
- PostgreSQL database (or use Docker)

### Installation

1.  **Install dependencies:**
    ```bash
    bun install
    ```
2.  **Environment Setup:** Create a `.env` file:
    ```env
    DATABASE_URL="postgresql://user:password@localhost:5432/khachale"
    JWT_SECRET="your-secret-key"
    NODE_ENV="development"
    PORT=5000
    ```
3.  **Database Migration:**
    ```bash
    bunx prisma generate
    bunx prisma db push
    ```
4.  **Run Development:**
    ```bash
    bun run dev
    ```

## 🐳 Docker Support

### Development (Hot-Reloading)

```bash
docker-compose -f docker-compose.dev.yml up --build
```

### Production

```bash
docker-compose up --build -d
```

## 🧪 Testing

The platform includes several automated test scripts:

- `bun run test-new-apis.ts`: Comprehensive API logic test.
- `bun run src/test-new-apis-smoke.ts`: Quick endpoint connectivity check.
- `bun run test-endpoints.ts`: General authentication testing.

---

_Created for the KahinChale Travel Platform._
l
