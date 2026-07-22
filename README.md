# HVKart Admin AI Development Guide

## Project Overview

This repository contains the standalone Admin Panel for HVKart.

The customer-facing ecommerce application is maintained in a separate repository.

This project must NEVER become a copy of the storefront.

The objective is to build a scalable, enterprise-grade administration system while keeping complete compatibility with the existing ecommerce platform.

---

# Primary Goal

Build a professional standalone Admin Panel.

The customer website and the admin panel must be independently deployable.

Both applications must use the same PostgreSQL database.

---

# Existing Store Project

Existing Store Repository

hardvanta

This repository already contains:

- Products
- Categories
- Brands
- Orders
- Customers
- Delivery
- Coupons
- Reviews
- Blogs
- Contact
- B2B
- Bulk Orders
- Checkout
- Payments
- Authentication
- Prisma
- NextAuth

Do NOT redesign existing business logic.

Reuse proven logic whenever possible.

---

# Absolute Rules

Never delete working code.

Never rewrite working business logic.

Never change database schema without approval.

Never rename Prisma models.

Never rename database columns.

Never redesign APIs unless requested.

Never introduce breaking changes.

Never make assumptions.

Always inspect existing implementation first.

Always prefer reuse over rewrite.

Always prefer refactoring over rebuilding.

---

# Migration Rules

Migration must happen module by module.

Never migrate the whole project at once.

Approved order:

1. Authentication
2. Admin Shell
3. Shared Layer
4. Products
5. Categories
6. Brands
7. Inventory
8. Orders
9. Payments
10. Customers
11. Delivery
12. Marketing
13. Reports
14. Analytics
15. Settings

Never skip phases.

---

# Architecture

Feature-first architecture only.

Example

src/

app/

(auth)

(dashboard)

catalog/

sales/

customers/

delivery/

marketing/

analytics/

reports/

settings/

components/

lib/

services/

hooks/

shared/

utils/

providers/

store/

---

# Shared Layer

Business logic that already exists should become shared whenever possible.

Examples

- Prisma
- Authentication
- Email
- Order Status
- Delivery Logic
- Coupon Engine
- Shared UI
- Shared Utilities

Never duplicate business logic.

---

# Authentication

Reuse existing authentication.

Reuse existing middleware.

Reuse existing session handling.

Reuse existing role system.

Never redesign login flow.

---

# Database

One PostgreSQL database.

Never create a second database.

Never duplicate data.

Prisma schema must remain compatible.

---

# APIs

Reuse existing API logic.

Never rewrite stable APIs.

Improve structure only when necessary.

---

# UI Guidelines

Professional enterprise dashboard.

Design inspiration

- Shopify Admin
- Amazon Seller Central
- Stripe Dashboard
- Vercel Dashboard
- Linear

Requirements

- Responsive
- Accessible
- Fast
- Clean
- Consistent
- Keyboard Friendly

---

# Coding Standards

Small reusable components.

No duplicated code.

Feature-based organization.

Meaningful names.

No magic numbers.

Strong typing when applicable.

Readable code.

Keep files small.

Prefer composition over inheritance.

---

# Before Writing Code

Always inspect existing implementation.

Search for:

- Components
- APIs
- Hooks
- Prisma
- Utilities
- Middleware
- Shared Logic

Never generate duplicate implementations.

---

# After Every Task

Run lint.

Run build.

Fix every error.

Do not continue if build fails.

---

# Git Rules

Never commit every file separately.

Create logical commits only.

Examples

feat(auth): implement admin authentication

feat(layout): create admin shell

feat(products): migrate product management

fix(orders): resolve status sync

refactor(shared): extract common utilities

Never include personal names, IDs, or private information in commits.

---

# Documentation

When a task is completed provide:

- Summary
- Files created
- Files modified
- Files reused
- Build status
- Lint status
- Remaining TODO

---

# When Unsure

Never guess.

Analyze first.

Explain findings.

Wait for approval before major architectural changes.
