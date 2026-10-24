# NicheLanka — Shared API and Database Plan

## 1. Project Overview

NicheLanka is a web platform for discovering lesser-known tourist attractions, local activities, and community tourism information, initially focusing on Galle District.

**Technology stack**
- Frontend: React + Tailwind CSS
- Backend: Node.js + Express.js
- Database: MongoDB + Mongoose
- API style: REST API

## 2. Authentication and User Management

| Method | Endpoint | Purpose |
|---|---|---|
| POST | `/api/auth/register` | Register a user |
| POST | `/api/auth/login` | Log in |
| GET | `/api/auth/me` | Get the logged-in user's details |
| PUT | `/api/users/me` | Update the user's profile |

## 3. Attractions

| Method | Endpoint | Purpose |
|---|---|---|
| GET | `/api/attractions` | View published attractions |
| GET | `/api/attractions/:id` | View one attraction |

Authorized content-management endpoints will be added for creating, updating, and deleting attractions.

## 4. Activities

| Method | Endpoint | Purpose |
|---|---|---|
| GET | `/api/activities` | View published activities |
| GET | `/api/activities/:id` | View one activity |

Authorized content-management endpoints will be added for creating, updating, and deleting activities.

## 5. Reviews and Ratings

| Method | Endpoint | Purpose |
|---|---|---|
| GET | `/api/reviews` | View reviews for attractions or activities |
| POST | `/api/reviews` | Submit a review and rating |
| PUT | `/api/reviews/:id` | Edit your own review |
| DELETE | `/api/reviews/:id` | Delete your own review |

Rules:
- Users must log in to submit reviews.
- Users can edit or delete only their own reviews.
- Each review must be linked to an attraction or activity.

## 6. Community Contributions

| Method | Endpoint | Purpose |
|---|---|---|
| POST | `/api/contributions` | Submit tourism content |
| GET | `/api/contributions/my` | View your own submissions |
| PUT | `/api/contributions/:id` | Edit your own pending submission |

Rules:
- New submissions start with `pending` status.
- Contributors can edit their own pending submissions.
- Administrators review submissions and approve or reject them.
- Approved content becomes publicly visible.
- Changes to approved content must be submitted for administrator review.

## 7. Admin Management

| Method | Endpoint | Purpose |
|---|---|---|
| GET | `/api/admin/contributions` | View submitted contributions |
| PATCH | `/api/admin/contributions/:id` | Approve or reject a contribution |
| GET | `/api/admin/users` | View users |
| PATCH | `/api/admin/users/:id/role` | Change a user's role |
| GET | `/api/admin/audit-logs` | View recorded admin actions |

## 8. Inquiry Handling

| Method | Endpoint | Purpose |
|---|---|---|
| POST | `/api/inquiries` | Submit an inquiry |
| GET | `/api/inquiries/my` | View your own inquiries |
| GET | `/api/admin/inquiries` | View all inquiries as an administrator |
| PATCH | `/api/admin/inquiries/:id` | Update inquiry status and record a response |

Rules:
- Tourists must log in to submit inquiries.
- Tourists can view only their own inquiries.
- Administrators manage all inquiries and record responses.
- This feature does not provide a full booking or reservation system.

## 9. Database Collections

### `users`
Stores user profiles and authentication details.

Main fields: `name`, `email`, `passwordHash`, `role`, `profileDetails`

Roles: `tourist`, `contributor`, `admin`

### `attractions`
Stores tourist attraction information.

Main fields: `name`, `description`, `location`, `images`, `category`, `status`

### `activities`
Stores local tourism activities.

Main fields: `name`, `description`, `location`, `category`, `images`, `status`

### `reviews`
Stores user reviews and ratings.

Main fields: `userId`, `rating`, `text`, `attractionId`, `activityId`

A review should reference either an attraction or an activity.

### `contributions`
Stores content submitted by local contributors.

Main fields: `userId`, `submissionType`, `content`, `status`

Possible statuses: `pending`, `approved`, `rejected`

### `auditLogs`
Records important administrator actions.

Main fields: `actorId`, `action`, `targetType`, `targetId`, `timestamp`

### `inquiries`
Stores inquiries submitted by tourists.

Main fields: `userId`, `subject`, `message`, `status`, `adminResponse`, `respondedBy`, `createdAt`, `updatedAt`

Possible statuses: `pending`, `inProgress`, `answered`, `closed`

## 10. Authorization Rules

- Passwords must be stored as secure hashes, never as plain text.
- Authentication and authorization must be checked by the backend.
- Tourists can view only their own inquiries.
- Users can edit or delete only their own reviews.
- Contributors can manage their own eligible submissions.
- Only administrators can access admin endpoints and approve or reject contributions.
- Public users should see only approved tourism content.
- Sensitive configuration values must be stored in environment variables, not committed to GitHub.

## 11. Important Scope Limitations

NicheLanka supports tourism discovery, community contributions, reviews, and inquiries.

It does **not** include:
- Online bookings or reservations
- Online payments
- Booking availability or cancellation management
- Direct messaging between users
- GPS tracking or interactive maps

## 12. Implementation Notes

- These endpoints and fields are the initial shared plan, not a complete implementation.
- Members should discuss proposed changes before modifying shared API contracts.
- Endpoint access must be validated through backend tests.
- Additional fields, validation rules, and endpoints may be agreed upon during development.
