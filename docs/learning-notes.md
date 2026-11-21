
# Authify - Database Learning Notes

<!-- & "C:\Program Files\PostgreSQL\18\bin\psql.exe" -U postgres -d authify_dev -->

## 1. Project Overview

Authify is a multi-tenant authentication SaaS platform.

Tech stack:
- PostgreSQL
- Node.js
- Express.js
- React
- JWT
- Argon2id / bcrypt

## 2. Database Design

We created three core tables:

1. organizations
2. users
3. organization_members

### Relationships

- One organization can have many members.
- One user can join multiple organizations.
- users and organizations have a many-to-many relationship.
- organization_members is the junction table.

## 3. Important Database Decisions

| Decision | Reason |
|---|---|
| BIGINT IDENTITY | Automatic ID generation |
| UNIQUE(email) | One global account per email |
| password_hash | Never store plain-text passwords |
| Composite primary key | Prevent duplicate memberships |
| CHECK constraint | Allow only predefined roles |
| ON DELETE CASCADE | Clean up dependent memberships |
| deleted_at | Support organization soft deletion |

## 4. Available Roles

- admin
- manager
- member

Roles are stored in organization_members because
a user can have different roles in different organizations.

## 5. Important Concepts

- Primary Key
- Foreign Key
- Composite Primary Key
- UNIQUE Constraint
- CHECK Constraint
- Many-to-Many Relationship
- Soft Delete
- Referential Integrity
- Database Index

## 6. Interview Questions

Q1. Why do we use a junction table?

Answer: To manage a many-to-many relationship
between users and organizations.

Q2. Why is the role stored in organization_members?

Answer: Because the same user can have different
roles in different organizations.

Q3. Why store password_hash instead of password?

Answer: To avoid storing plain-text passwords.
We store a secure password hash instead.

Q4. What is ON DELETE CASCADE?

Answer: It automatically deletes dependent records
when their referenced parent record is hard-deleted.




## SQL Injection and Parameterized Queries

### 1. What is SQL Injection?

SQL injection is a security vulnerability where an attacker manipulates SQL queries through malicious user input.

**Example of an unsafe query:**

```javascript
const query = `SELECT * FROM users WHERE email = '${email}'`;
```

User input is directly inserted into the SQL query, which can change its intended logic.

### 2. How to prevent SQL Injection?

Use parameterized queries.

```javascript
const query = "SELECT * FROM users WHERE email = $1";

const result = await pool.query(query, [email]);
```

- `$1` is a placeholder.
- `[email]` supplies the user input.
- PostgreSQL treats the supplied value as data, not executable SQL instructions.

### 3. Input Validation vs SQL Injection Protection

- Joi validation: Checks whether input follows expected rules.
- Parameterized queries: Protect SQL queries from injection.

Both are necessary.

### 4. Practical Experiment in Authify

Test input:

```text
anything' OR '1'='1
```

| Query | Result |
|---|---|
| Unsafe string interpolation | Returned all sample users |
| Parameterized query | Returned no matching users |

This demonstrated how SQL injection works and how parameterized queries prevent this type of attack.

### 5. Important Production Rule

Never directly concatenate user input into SQL queries.

Always use parameterized queries for user-provided values.

**Interview answer:**

SQL injection is a vulnerability where attackers manipulate SQL queries through malicious input. We prevent it by using parameterized queries, input validation, and avoiding direct SQL string concatenation.

## Centralized Error Handling in Express

### Problem
Writing try/catch and error responses in every controller
creates duplicate code and inconsistent API responses.

### Solution
Use centralized error-handling middleware.

### Express error middleware signature
(err, req, res, next)

### Forward errors
next(error);

### Registration order
Register error-handling middleware after all routes.

### Security
- 4xx: Return safe, meaningful client-facing messages.
- 5xx: Return generic messages.
- Log detailed errors on the server.
- Never expose SQL queries, database credentials,
  stack traces, or internal implementation details.

### Interview answer
Centralized error handling in Express allows us to manage
application errors in one place. It improves code
maintainability, consistency, and security.


## Custom AppError Class

### Purpose
Creates consistent application errors with HTTP status codes.

### Implementation
- Extends JavaScript's built-in Error class.
- Uses super(message) to initialize the parent Error.
- Adds statusCode to identify the HTTP status.
- Adds isOperational to identify expected application errors.
- Error.captureStackTrace() captures a useful stack trace.

### Usage
throw new AppError("User not found", 404);

### Error categories

Operational:
- Invalid credentials (401)
- User not found (404)
- Email already registered (409)

Unexpected:
- Programming bugs
- Unexpected system/database failures

### Interview answer
A custom AppError class extends JavaScript's Error class
and adds application-specific properties such as statusCode
and isOperational. It helps us handle expected errors
consistently through centralized error middleware.


## Database Errors vs Application Errors

### 1. Successful query with no matching records

Example:
SELECT * FROM users WHERE id = $1;

If the requested user doesn't exist, PostgreSQL returns:

result.rows = [];

Important:
- The query executed successfully.
- No matching record was found.
- This is NOT a database error.
- Our application must handle this situation.

Example:

if (!result.rows.length) {
  throw new AppError("User not found", 404);
}

### 2. Database query failure

Example:
SELECT * FROM unknown_table;

If the table doesn't exist:
- PostgreSQL rejects the query.
- The Promise gets rejected.
- Express 5 automatically forwards the error
  to centralized error middleware.

### 3. Important HTTP status codes

| Scenario | Status |
|---|---|
| Invalid request data | 400 |
| Invalid credentials | 401 |
| User not found | 404 |
| Duplicate email | 409 |
| Unexpected server error | 500 |

### Key takeaway

A successful database query does not guarantee
that matching data exists.

We must check result.rows and create an
application-specific error when necessary.

### Interview answer

A database query can execute successfully but return
an empty array if no matching records exist.
This is not a database error. We check the result
and throw a custom AppError with status 404
when the requested resource is not found.



## GET User by ID API

### 1. Purpose

Fetch a specific user's details using their ID.

**Endpoint:**

`GET /api/users/:id`

Example:

`GET /api/users/1`

### 2. Request Flow

1. Client sends a GET request.
2. Validation middleware validates the ID.
3. Controller executes the PostgreSQL query.
4. If the user exists, return 200.
5. If the user doesn't exist, throw AppError with status 404.
6. Centralized error middleware handles errors.

### 3. Controller Implementation

```javascript
const query = require("../utils/query");
const AppError = require("../utils/AppError");

const getUserById = async (req, res) => {
  const { id } = req.params;

  const result = await query(
    `SELECT id, name, email, created_at
     FROM users
     WHERE id = $1`,
    [id]
  );

  if (!result.rows.length) {
    throw new AppError("User not found", 404);
  }

  res.status(200).json({
    success: true,
    data: result.rows[0],
  });
};

module.exports = {
  getUserById,
};
```

**Important:**

- `req.params.id` gets the ID from the URL.
- `$1` is a parameterized SQL placeholder.
- `result.rows[0]` returns the matching user.
- `password_hash` is excluded from the response for security.

### 4. Joi Input Validation

**Problem:**

An API should reject invalid IDs before executing database queries.

Examples of invalid IDs:
- `abc`
- `1.6`
- `0`
- `-5`

**Validation schema:**

```javascript
const Joi = require("joi");

const userIdSchema = Joi.object({
  id: Joi.string()
    .pattern(/^[1-9]\d*$/)
    .required()
    .messages({
      "string.pattern.base":
        "User ID must be a positive integer",
      "any.required": "User ID is required",
    }),
});

module.exports = {
  userIdSchema,
};
```

**Why use a string instead of a number?**

PostgreSQL BIGINT can store integers larger than JavaScript's safe integer limit.

Keeping the ID as a string avoids JavaScript number precision problems.

### 5. Reusable Validation Middleware

```javascript
const AppError = require("../utils/AppError");

const validate = (schema, property = "params") => {
  return (req, res, next) => {
    const { error } = schema.validate(req[property], {
      abortEarly: true,
      convert: false,
    });

    if (error) {
      return next(
        new AppError(error.details[0].message, 400)
      );
    }

    next();
  };
};

module.exports = validate;
```

**Important concepts:**

- `schema`: Joi validation rules.
- `property`: Request section to validate (`params`, `body`, or `query`).
- `abortEarly: true`: Stop at the first validation error.
- `convert: false`: Don't automatically convert input types.
- `next()`: Continue to the next middleware.
- `next(error)`: Forward the error to centralized error handling.

This middleware can be reused for other API endpoints.

### 6. Route Implementation

```javascript
router.get(
  "/:id",
  validate(userIdSchema),
  getUserById
);
```

Middleware execution order:

1. Validate user ID.
2. Execute controller only if validation succeeds.

### 7. API Testing Results

| Request | Expected status | Result |
|---|---:|---|
| `/api/users/1` (existing user) | 200 | Passed |
| `/api/users/999999` | 404 | Passed |
| `/api/users/abc` | 400 | Passed |
| `/api/users/1.6` | 400 | Passed |
| `/api/users/0` | 400 | Passed |

### 8. Important Error-Handling Concept

**Successful request:**

When a user exists, the controller sends a 200 response. No error is thrown, so centralized error middleware is not called.

**Failed request:**

When a user doesn't exist, the controller throws:

```javascript
throw new AppError("User not found", 404);
```

Express 5 forwards the rejected async route handler to centralized error middleware.

**Terminal logging:**

`console.error("Error:", err)` logs the error object, including `statusCode` and `isOperational`.

These properties belong to the internal AppError object. They are not automatically included in the API response.

### 9. Interview Questions

**Q1. Why do we use middleware for validation?**

Answer: To validate incoming requests before they reach controllers. It reduces duplicate code and keeps controllers clean.

**Q2. What is Joi?**

Answer: Joi is a JavaScript validation library used to define schemas and validate incoming data.

**Q3. What is the difference between req.params and req.body?**

Answer:
- `req.params`: Values from URL parameters.
- `req.body`: Data sent in the request body.

**Q4. Why return 400 for an invalid ID and 404 for a missing user?**

Answer: 400 means the request input is invalid. 404 means the request is valid, but the requested resource doesn't exist.

**Q5. Why exclude password_hash from the GET response?**

Answer: Password hashes are sensitive authentication data and should never be exposed through ordinary user API responses.

### Key Takeaway

Validation middleware protects controllers from invalid input. Parameterized queries protect database operations. AppError and centralized error middleware provide consistent API error responses.