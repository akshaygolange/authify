
-- =====================================
-- 1. ORGANIZATIONS TABLE
-- Stores companies using Authify
-- =====================================

CREATE TABLE organizations (
    id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,

    name VARCHAR(150) NOT NULL,

    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    deleted_at TIMESTAMPTZ
);



-- =====================================
-- 2. USERS TABLE
-- Stores global Authify user accounts
-- =====================================

CREATE TABLE users (
    id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,

    name VARCHAR(100) NOT NULL,

    email VARCHAR(255) NOT NULL UNIQUE,

    password_hash TEXT NOT NULL,

    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);



-- =====================================
-- 3. ORGANIZATION MEMBERS TABLE
-- Connects users with organizations
-- =====================================

CREATE TABLE organization_members (
    user_id BIGINT NOT NULL,

    organization_id BIGINT NOT NULL,

    role VARCHAR(20) NOT NULL
        CHECK (role IN ('admin', 'manager', 'member')),

    joined_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    PRIMARY KEY (user_id, organization_id),

    FOREIGN KEY (user_id)
        REFERENCES users(id)
        ON DELETE CASCADE,

    FOREIGN KEY (organization_id)
        REFERENCES organizations(id)
        ON DELETE CASCADE
);

CREATE INDEX idx_organization_members_org_id
ON organization_members(organization_id);