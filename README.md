# KahinChale

A TypeScript-based authentication API built with Express, Prisma, and PostgreSQL. Provides user registration, login, JWT-based session management, and OTP verification.

## Tech Stack

- **Runtime:** Bun
- **Framework:** Express.js
- **Database:** PostgreSQL
- **ORM:** Prisma
- **Authentication:** JWT (jsonwebtoken) + bcrypt + cookie-parser
- **Language:** TypeScript

## Project Structure

```
khachale/
├── prisma/
│   ├── schema.prisma          # Database schema definition
│   ├── migrations/            # Database migration files
│   └── config.ts              # Prisma configuration
├── src/
│   ├── generated/prisma/      # Auto-generated Prisma client
│   ├── types/
│   │   └── express.d.ts       # Express type extensions (AuthenticatedRequest)
│   ├── controllers/
│   │   └── authControllers/
│   │       └── auth.controllers.ts   # Auth business logic
│   ├── routes/
│   │   └── authRoutes/
│   │       └── auth.routes.ts         # API route definitions
│   ├── middleware/
│   │   └── authMiddleware/
│   │       └── auth.middleware.ts     # JWT authentication middleware
│   ├── utils/
│   │   └── generatetoken/
│   │       └── generateToken.ts       # JWT token generation
│   ├── lib/
│   │   └── db.ts              # Database connection & Prisma client
│   └── index.ts               # Application entry point
├── .env                       # Environment variables (not in git)
├── .gitignore
├── package.json
├── tsconfig.json              # TypeScript configuration
└── README.md
```

## Database Schema

### Models

**User**
- `id`: UUID (primary key)
- `name`: String
- `email`: String (unique)
- `password`: String (hashed)
- `createdAt`: DateTime
- `updatedAt`: DateTime
- Relations: has many `Session`, has many `OTP`

**Session**
- `id`: UUID (primary key)
- `userId`: String (foreign key to User)
- `token`: String (unique JWT token)
- `expiresAt`: DateTime
- `createdAt`: DateTime
- `updatedAt`: DateTime
- Relations: belongs to `User`

**OTP**
- `id`: UUID (primary key)
- `userId`: String? (optional foreign key)
- `aadhaarMobile`: String (identifier for OTP)
- `otp`: String (6-digit code)
- `expiresAt`: DateTime
- `verified`: Boolean (default false)
- `createdAt`: DateTime
- `updatedAt`: DateTime
- Relations: optionally belongs to `User`

## API Endpoints

All endpoints prefixed with `/api/auth`

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | `/register` | Create new user account | No |
| POST | `/login` | Authenticate user | No |
| POST | `/logout` | Invalidate user sessions | Yes |
| POST | `/refresh` | Generate new JWT token | Yes |
| POST | `/otp/send` | Send 6-digit OTP | No |
| POST | `/otp/verify` | Verify OTP code | No |

### Request/Response Examples to try out for fake user

**Register User**
```bash
POST /api/auth/register
Content-Type: application/json

{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "securepassword123"
}
```

**Login User**
```bash
POST /api/auth/login
Content-Type: application/json

{
  "email": "john@example.com",
  "password": "securepassword123"
}
```
Response sets HTTP-only JWT cookie automatically.

**Logout User (Auth Required)**
```bash
POST /api/auth/logout
Cookie: jwt=<your-token>
```

**Refresh Token (Auth Required)**
```bash
POST /api/auth/refresh
Cookie: jwt=<your-token>
```

**Send OTP**
```bash
POST /api/auth/otp/send
Content-Type: application/json

{
  "aadhaarOrMobile": "9876543210"
}
```

## Environment Variables

Create a `.env` file with these variables:

```env
DATABASE_URL="postgresql://user:password@localhost:5432/khachale"
JWT_SECRET="your-secret-key-here"
NODE_ENV="development"
PORT=5000
```

## Getting Started

### Prerequisites

- Bun installed ([install guide](https://bun.sh))
- PostgreSQL database

### Installation

```bash
# Install dependencies
bun install

# Setup database
bun prisma migrate dev

# Generate Prisma client
bun prisma generate

# Run development server
bun run dev
```

### Scripts

| Command | Description |
|---------|-------------|
| `bun dev` | Start development server |
| `bun start` | Start with nodemon auto-reload |

## Security Features

- Passwords hashed with bcrypt (10 rounds)
- JWT tokens with 30-day expiration
- HTTP-only cookies for token storage
- Session tracking in database
- OTP expires after 10 minutes
- Secure cookie settings in production

## Notes for Contributors

- **Authentication Flow:** Login/Register sets HTTP-only JWT cookie → Protected routes (`/logout`, `/refresh`) use `authenticateUser` middleware → Middleware validates JWT and attaches user to `req.user` via `AuthenticatedRequest` type
- The project uses ES modules (`"type": "module"` in package.json)
- Prisma client is generated to `src/generated/prisma/` (do not edit manually)
- Console logging is enabled for debugging; remove in production
- Use `AuthenticatedRequest` type from `src/types/express.d.ts` for protected route controllers

This project was created using `bun init` in bun v1.3.4. [Bun](https://bun.com) is a fast all-in-one JavaScript runtime.
