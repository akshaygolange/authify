# Authify

A multi-tenant authentication and authorization platform built to understand and implement production-oriented authentication, organization management, and role-based access control (RBAC).

## Project Overview

Authify is a SaaS-style authentication platform where multiple organizations can manage their users and access permissions.

A single user can belong to multiple organizations and have different roles in each organization.

## Tech Stack

**Backend**
- Node.js
- Express.js
- PostgreSQL
- JWT
- Joi

**Frontend**
- React
- Tailwind CSS

## Core Features

- User registration and login
- Secure password hashing
- JWT-based authentication
- Access and refresh token management
- Multi-tenant organization management
- Role-based access control (RBAC)
- User and membership management
- Audit logs and login activity

## Database Design

Initial database tables:

- `users` — stores global user accounts.
- `organizations` — stores organizations.
- `organization_members` — connects users with organizations and stores their organization-specific roles.

## Project Structure

```text
authify/
├── backend/
├── frontend/
├── docs/
│   ├── database/
│   │   └── schema.sql
│   └── learning-notes.md
├── .gitignore
└── README.md
```

## Development Status

Currently completed:
- Initial PostgreSQL database setup
- Core database schema
- Many-to-many relationships
- Database constraints and foreign keys
- JOIN queries and cascade deletion testing

Backend and frontend implementation are planned next.

## Learning Goals

This project focuses on practical understanding of:
- Authentication vs authorization
- Multi-tenancy
- PostgreSQL database design
- REST API development
- JWT and session management
- Production-oriented backend security
