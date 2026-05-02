# API Documentation - Digital Municipality System

This API follows RESTful principles. All endpoints are prefixed with `/api`.

## Authentication

### POST `/auth/register`
Registers a new citizen account.
- **Body:** `{ firstName, lastName, email, password, phone }`
- **Response:** `201 Created`

### POST `/auth/login`
Authenticates a user and returns tokens.
- **Body:** `{ email, password }`
- **Response:** `{ accessToken, refreshToken, user: { ... } }`

### POST `/auth/logout`
Invalidates the session.
- **Body:** `{ refreshToken }`

## Citizen Endpoints (Role: CITIZEN)

### GET `/citizen/dashboard`
Returns statistics and latest announcements for the logged-in citizen.

### POST `/citizen/service-requests`
Submits a new municipal service request.
- **Body:** `{ serviceTypeId, notes }`

### GET `/citizen/service-requests/my`
Retrieves all service requests submitted by the current user.

### POST `/citizen/complaints`
Files a new community complaint.
- **Body:** `{ subject, description }`

## Admin Endpoints (Role: ADMIN)

### GET `/admin/dashboard`
Returns system-wide stats and recent activity logs.

### GET `/admin/service-requests`
Fetch all service requests with optional filters `status` and `type`.

### PATCH `/admin/service-requests/:id/status`
Updates the status of a specific request.
- **Body:** `{ status, notes }`

### GET `/admin/users`
Retrieves all registered users in the system.

## Common Endpoints (Authenticated or Public)

### GET `/common/announcements`
Returns all public announcements.

### GET `/common/polls`
Returns all active community polls.

### GET `/common/service-types`
Returns list of available municipal services.
