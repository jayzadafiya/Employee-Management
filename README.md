# Employee Management System API

A production-level Employee Management System built with Node.js, TypeScript, Express, and MongoDB featuring employee listing, performance analytics, and multiple pagination strategies.

## 📁 Project Structure

```
Employee-Management/
├── src/
│   ├── config/                 # Configuration files
│   │   ├── config.ts          # Environment configuration
│   │   └── database.ts        # MongoDB connection setup
│   │
│   ├── middlewares/           # Express middlewares
│   │   ├── auth.ts           # Authentication middleware (mock JWT)
│   │   ├── errorHandler.ts  # Global error handler
│   │   ├── notFound.ts       # 404 handler
│   │   └── security.ts       # Security middleware setup
│   │
│   ├── modules/              # Feature modules
│   │   ├── auth/            # Authentication module
│   │   │   ├── auth.controller.ts
│   │   │   ├── auth.routes.ts
│   │   │   └── auth.service.ts
│   │   │
│   │   ├── employee/        # Employee management module
│   │   │   ├── employee.controller.ts
│   │   │   ├── employee.model.ts
│   │   │   ├── employee.routes.ts
│   │   │   └── employee.service.ts
│   │   │
│   │   └── review/          # Review & analytics module
│   │       ├── review.controller.ts
│   │       ├── review.model.ts
│   │       ├── review.routes.ts
│   │       └── review.service.ts
│   │
│   ├── routes/              # API route aggregation
│   │   └── index.ts        # Main router
│   │
│   ├── scripts/            # Utility scripts
│   │   └── migrate.ts     # Database migration script
│   │
│   ├── types/              # TypeScript type definitions
│   │   ├── index.ts       # Central type exports
│   │   └── xss-clean.d.ts # Third-party type declarations
│   │
│   ├── utils/              # Utility functions
│   │   ├── apiResponse.ts # Response helpers
│   │   └── appError.ts    # Custom error class
│   │
│   ├── app.ts             # Express app setup
│   └── server.ts          # Server entry point
│
├── data/                   # Data files
│   ├── employees.json     # Employee seed data
│   └── reviews.json       # Review seed data
│
├── dist/                  # Compiled JavaScript (generated)
├── node_modules/          # Dependencies
├── .env                   # Environment variables (not in git)
├── .env.example          # Environment variables template
├── .gitignore            # Git ignore rules
├── package.json          # Project dependencies and scripts
├── tsconfig.json         # TypeScript configuration
└── README.md             # This file
```

## 🚀 Features

- **Employee Management** with multiple pagination strategies
- **Performance Analytics** - Top performers tracking
- **Security** - Helmet, CORS, XSS protection, NoSQL injection prevention
- **Error Handling** - Global error handler with custom error classes
- **Type Safety** - Full TypeScript implementation
- **Modular Architecture** - Clean separation of concerns

## 📋 Prerequisites

- Node.js (v16 or higher)
- MongoDB (v5 or higher)
- npm or yarn

## ⚙️ Installation

1. **Clone the repository**

   ```bash
   git clone https://github.com/jayzadafiya/Employee-Management.git
   cd Employee-Management
   ```

2. **Install dependencies**

   ```bash
   npm install
   ```

3. **Set up environment variables**

   ```bash
   cp .env.example .env
   ```

   Edit `.env` and configure:

   ```env
   NODE_ENV=development
   PORT=5000
   MONGODB_URI=mongodb://localhost:27017/employee_management
   JWT_SECRET=your_jwt_secret_key
   JWT_EXPIRE=30d
   ```

4. **Run database migration**
   ```bash
   npm run migrate
   ```

## 🎯 Available Scripts

```bash
npm run dev        # Start development server with hot-reload
npm run build      # Compile TypeScript to JavaScript
npm start          # Start production server
npm run migrate    # Import seed data to database
npm run lint       # Run ESLint
npm run format     # Format code with Prettier
```

## 📡 API Endpoints

### Base URL

```
http://localhost:5000/api
```

### Health Check

```http
GET /api/health
```

### Authentication

All endpoints require mock authentication header:

```
Authorization: Bearer mock_token
```

---

### 👥 Employee Endpoints

#### 1. List Employees (Facet Pagination)

```http
GET /api/employees
```

**Query Parameters:**

- `page` (number, default: 1) - Page number
- `limit` (number, default: 10) - Items per page
- `department` (string, optional) - Filter by department
- `firstName` (string, optional) - Filter by first name (case-insensitive)
- `lastName` (string, optional) - Filter by last name (case-insensitive)

**Example:**

```http
GET /api/employees?page=1&limit=5&department=Engineering
```

**Response:**

```json
{
  "success": true,
  "message": "Employees fetched successfully",
  "data": [
    {
      "_id": "68ccdba2e10537271a307370",
      "firstName": "Symon",
      "lastName": "Geist",
      "department": "Engineering",
      "averageRating": 3.5,
      "numberOfRatings": 4,
      "createdAt": "2025-12-11T06:53:48.166Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 5,
    "total": 25,
    "totalPages": 5
  }
}
```

---

#### 2. List Employees (Count-based Pagination)

```http
GET /api/employees/counterList
```

**Query Parameters:** Same as above

**Description:** Uses `countDocuments()` for more efficient counting on large datasets.

**Example:**

```http
GET /api/employees/counterList?department=Legal&page=1&limit=3
```

---

#### 3. List Employees (Cursor Pagination)

```http
GET /api/employees/cursorList
```

**Query Parameters:**

- `cursor` (string, optional) - Base64 encoded cursor for next page
- `limit` (number, default: 10) - Items per page
- `department` (string, optional) - Filter by department
- `firstName` (string, optional) - Filter by first name
- `lastName` (string, optional) - Filter by last name

**Example:**

```http
# First request
GET /api/employees/cursorList?limit=5

# Next page using cursor from previous response
GET /api/employees/cursorList?limit=5&cursor=eyJfaWQiOiI2OGNjZGJh...
```

**Response:**

```json
{
  "success": true,
  "message": "Employees fetched successfully with cursor pagination",
  "data": [...],
  "pagination": {
    "nextCursor": "eyJfaWQiOiI2OGNjZGJhMmUxMDUzNzI2MzE4ZWNkNzQifQ==",
    "prevCursor": null,
    "hasNext": true,
    "hasPrev": false,
    "limit": 5
  }
}
```

**Benefits:**

- ✅ Consistent results with changing data
- ✅ No data skipping/duplication
- ✅ Better performance for deep pagination
- ✅ Ideal for infinite scrolling

---

### 📊 Analytics Endpoints

#### Get Top Performers

```http
GET /api/analytics/top-performers
```

**Description:** Returns top 3 employees by average rating (minimum 2 reviews required)

**Response:**

```json
{
  "success": true,
  "message": "Top performers fetched successfully",
  "data": [
    {
      "_id": "68ccdba2e10537260d4405f4",
      "firstName": "Cordelie",
      "lastName": "Fairrie",
      "department": "Accounting",
      "averageRating": 4,
      "numberOfReviews": 4
    },
    {
      "_id": "68ccdba2e105372564c50d36",
      "firstName": "Poppy",
      "lastName": "Farryann",
      "department": "Research and Development",
      "averageRating": 4,
      "numberOfReviews": 4
    },
    {
      "_id": "68ccdba2e1053725ad28a3fb",
      "firstName": "Anatollo",
      "lastName": "Daynter",
      "department": "Support",
      "averageRating": 3.75,
      "numberOfReviews": 4
    }
  ]
}
```

---

## 🗄️ Database Models

### Employee Model

```typescript
{
  _id: ObjectId,
  firstName: string,
  lastName: string,
  department: string,
  createdAt: Date,
  updatedAt: Date
}
```

**Indexes:**

- `department`
- `firstName + lastName`

### Review Model

```typescript
{
  _id: ObjectId,
  employeeId: ObjectId (ref: Employee),
  reviewerId: ObjectId (ref: Employee),
  rating: number (1-5),
  createdAt: Date,
  updatedAt: Date
}
```

**Indexes:**

- `employeeId`
- `reviewerId`
- `rating`

---

## 🔒 Security Features

- **Helmet** - Security headers
- **CORS** - Cross-origin resource sharing
- **XSS Protection** - XSS sanitization
- **NoSQL Injection Prevention** - MongoDB sanitization
- **Input Validation** - Query parameter validation
- **Error Handling** - No sensitive data exposure

---

## 🛠️ Technology Stack

- **Runtime:** Node.js
- **Language:** TypeScript
- **Framework:** Express.js
- **Database:** MongoDB with Mongoose
- **Security:** Helmet, CORS, XSS-clean, Express-mongo-sanitize
- **Development:** Nodemon, ts-node
- **Code Quality:** ESLint, Prettier

---

## 📝 Error Handling

All errors follow a consistent format:

```json
{
  "success": false,
  "message": "Error description",
  "error": "Detailed error (development only)"
}
```

**HTTP Status Codes:**

- `200` - Success
- `400` - Bad Request (validation errors)
- `404` - Not Found
- `500` - Internal Server Error

---

## 🔄 Migration

The project includes seed data for testing:

- **25 Employees** across multiple departments
- **100 Reviews** with ratings 1-5

Run migration:

```bash
npm run migrate
```

This will:

1. Connect to MongoDB
2. Clear existing data
3. Import employees from `data/employees.json`
4. Import reviews from `data/reviews.json`

---

## 🚀 Deployment

### Production Build

```bash
npm run build
npm start
```

### Environment Variables for Production

```env
NODE_ENV=production
PORT=5000
MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/dbname
JWT_SECRET=your_secure_secret
```

---

## 📚 API Response Format

### Success Response

```json
{
  "success": true,
  "message": "Success message",
  "data": {...},
  "pagination": {...}
}
```

### Error Response

```json
{
  "success": false,
  "message": "Error message",
  "error": "Error details"
}
```

---

## 👨‍💻 Author

**Jay Zadafiya**

- GitHub: [@jayzadafiya](https://github.com/jayzadafiya)

---

## 🙏 Acknowledgments

- Express.js community
- MongoDB documentation
- TypeScript team

---

**Built with ❤️ using TypeScript, Express, and MongoDB**
