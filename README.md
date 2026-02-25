# KahinChale

A comprehensive travel booking platform built with TypeScript, Express, Prisma, and PostgreSQL. Features user authentication, trip management, booking system, support queries, and wishlist functionality for a complete travel experience.

## Tech Stack

- **Runtime:** Bun
- **Framework:** Express.js
- **Database:** PostgreSQL
- **ORM:** Prisma
- **Authentication:** JWT (jsonwebtoken) + bcrypt + cookie-parser
- **Language:** TypeScript
- **Additional:** Zod for validation, Morgan for logging, Helmet for security, CORS

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
│   │   ├── authControllers/
│   │   │   └── auth.controllers.ts   # Authentication business logic
│   │   └── userControllers/
│   │       └── user.controllers.ts   # User profile & booking logic
│   ├── routes/
│   │   ├── authRoutes/
│   │   │   └── auth.routes.ts         # Authentication API routes
│   │   └── userRoutes/
│   │       └── user.routes.ts         # User management API routes
│   ├── middleware/
│   │   └── authMiddleware/
│   │       └── auth.middleware.ts     # JWT authentication middleware
│   ├── utils/
│   │   └── generatetoken/
│   │       └── generateToken.ts       # JWT token generation
│   ├── lib/
│   │   └── db.ts              # Database connection & Prisma client
│   └── index.ts               # Application entry point
├── test-endpoints.ts          # API testing script
├── test-user-endpoints.ts     # User endpoints testing script
├── test-refresh.ts            # Token refresh testing script
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
- Relations: has many `Session`, `OTP`, `Booking`, `SupportQuery`, `Wishlist`

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

**Trip**
- `id`: UUID (primary key)
- `title`: String
- `description`: String?
- `price`: Decimal
- `location`: String
- `startDate`: DateTime
- `endDate`: DateTime
- `createdAt`: DateTime
- `updatedAt`: DateTime
- Relations: has many `Booking`, `Wishlist`

**Booking**
- `id`: UUID (primary key)
- `userId`: String (foreign key to User)
- `tripId`: String (foreign key to Trip)
- `status`: BookingStatus (PENDING, CONFIRMED, CANCELLED, COMPLETED)
- `totalAmount`: Decimal
- `createdAt`: DateTime
- `updatedAt`: DateTime
- Relations: belongs to `User`, belongs to `Trip`

**SupportQuery**
- `id`: UUID (primary key)
- `userId`: String (foreign key to User)
- `subject`: String
- `message`: String
- `category`: String?
- `status`: QueryStatus (OPEN, IN_PROGRESS, RESOLVED, CLOSED)
- `createdAt`: DateTime
- `updatedAt`: DateTime
- Relations: belongs to `User`

**Wishlist**
- `id`: UUID (primary key)
- `userId`: String (foreign key to User)
- `tripId`: String (foreign key to Trip)
- `createdAt`: DateTime
- Relations: belongs to `User`, belongs to `Trip`
- Unique constraint on [userId, tripId]

## API Endpoints

### Authentication Endpoints (`/api/auth`)

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | `/register` | Create new user account | No |
| POST | `/login` | Authenticate user | No |
| POST | `/logout` | Invalidate user sessions | Yes |
| POST | `/refresh` | Generate new JWT token | Yes |
| POST | `/otp/send` | Send 6-digit OTP | No |
| POST | `/otp/verify` | Verify OTP code | No |

### User Management Endpoints (`/api/users`)

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/me` | Get user profile | Yes |
| PUT | `/me` | Update user profile | Yes |
| POST | `/queries` | Submit support query | Yes |
| GET | `/bookings` | Get booking history | Yes |
| POST | `/wishlist/:tripId` | Add trip to wishlist | Yes |

### Health Check

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/check` | Health check endpoint | No |

### Request/Response Examples

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

**Get User Profile (Auth Required)**
```bash
GET /api/users/me
Cookie: jwt=<your-token>
```

**Update User Profile (Auth Required)**
```bash
PUT /api/users/me
Cookie: jwt=<your-token>
Content-Type: application/json

{
  "name": "John Updated",
  "email": "johnupdated@example.com"
}
```

**Submit Support Query (Auth Required)**
```bash
POST /api/users/queries
Cookie: jwt=<your-token>
Content-Type: application/json

{
  "subject": "Trip Booking Issue",
  "message": "I'm having trouble booking the Himalayan trek.",
  "category": "booking"
}
```

**Get Booking History (Auth Required)**
```bash
GET /api/users/bookings
Cookie: jwt=<your-token>
```

**Add Trip to Wishlist (Auth Required)**
```bash
POST /api/users/wishlist/trip-uuid-here
Cookie: jwt=<your-token>
```

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
| `bun prisma migrate dev` | Run database migrations |
| `bun prisma generate` | Generate Prisma client |
| `bun test-endpoints.ts` | Test all API endpoints |

## Testing

The project includes comprehensive testing scripts:

- **`test-endpoints.ts`** - Tests all authentication endpoints
- **`test-user-endpoints.ts`** - Tests user management endpoints  
- **`test-refresh.ts`** - Tests token refresh functionality

Run tests with:
```bash
bun run test-endpoints.ts
bun run test-user-endpoints.ts
bun run test-refresh.ts
```

## Security Features

- Passwords hashed with bcrypt (10 rounds)
- JWT tokens with 30-day expiration
- HTTP-only cookies for token storage
- Session tracking in database
- OTP expires after 10 minutes
- Secure cookie settings in production
- Zod validation for input sanitization
- Helmet.js for security headers (commented out, ready for production)

## Key Features

### Authentication & Authorization
- JWT-based authentication with HTTP-only cookies
- Secure password hashing with bcrypt
- OTP verification for mobile/aadhaar verification
- Session management with database tracking
- Token refresh mechanism

### User Management
- Profile creation and management
- Email uniqueness validation
- Support query system with status tracking
- Booking history management
- Wishlist functionality for trips

### Travel Platform Features
- Trip management with pricing and scheduling
- Booking system with status tracking (PENDING, CONFIRMED, CANCELLED, COMPLETED)
- Support ticket system with categories
- Wishlist for saving favorite trips

## Notes for Contributors

- **Authentication Flow:** Login/Register sets HTTP-only JWT cookie → Protected routes use `authenticateUser` middleware → Middleware validates JWT and attaches user to `req.user` via `AuthenticatedRequest` type
- **Database Relations:** All user-related data (bookings, queries, wishlist) is properly linked with cascade deletes
- **Error Handling:** Comprehensive error handling with appropriate HTTP status codes
- **Validation:** Input validation using Zod schemas (ensure to add validation schemas as needed)
- **Testing:** Use the provided test scripts to verify functionality before deployment
- The project uses ES modules (`"type": "module"` in package.json)
- Prisma client is generated to `src/generated/prisma/` (do not edit manually)
- Console logging is enabled for debugging; consider removing in production
- Use `AuthenticatedRequest` type from `src/types/express.d.ts` for protected route controllers

## Production Considerations

- Uncomment and configure Helmet.js for security headers
- Uncomment and configure CORS for cross-origin requests
- Uncomment Morgan for request logging in production
- Set appropriate environment variables for production
- Configure secure cookie settings
- Set up proper database connection pooling
- Consider implementing rate limiting for API endpoints

This project was created using `bun init` in bun v1.3.4. [Bun](https://bun.com) is a fast all-in-one JavaScript runtime.
