
# Authify - Database Learning Notes

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

<!-- & "C:\Program Files\PostgreSQL\18\bin\psql.exe" -U postgres -d authify_dev -->


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