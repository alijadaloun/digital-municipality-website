# Database Design - Digital Municipality System

## Conceptual Data Model (CDM)
The database is designed to handle users, their roles, municipal services, requests, documents, complaints, announcements, polls, and notifications.

## Logical Data Model (LDM)

### Tables

#### 1. roles
- `id`: INT (PK, AI)
- `name`: VARCHAR(20) (UNIQUE) - 'CITIZEN', 'ADMIN'
- `created_at`: TIMESTAMP
- `updated_at`: TIMESTAMP

#### 2. users
- `id`: CHAR(36) (PK, UUID)
- `first_name`: VARCHAR(100)
- `last_name`: VARCHAR(100)
- `email`: VARCHAR(255) (UNIQUE, INDEX)
- `phone`: VARCHAR(20)
- `password_hash`: VARCHAR(255)
- `is_verified`: TINYINT(1) (DEFAULT 0)
- `created_at`: TIMESTAMP (INDEX)
- `updated_at`: TIMESTAMP

#### 3. user_roles (Junction)
- `user_id`: CHAR(36) (FK users.id)
- `role_id`: INT (FK roles.id)
- (PK: user_id, role_id)

#### 4. verification_codes
- `id`: INT (PK, AI)
- `user_id`: CHAR(36) (FK users.id)
- `code`: VARCHAR(6)
- `expires_at`: TIMESTAMP
- `created_at`: TIMESTAMP

#### 5. sessions (Refresh Tokens)
- `id`: CHAR(36) (PK, UUID)
- `user_id`: CHAR(36) (FK users.id)
- `token`: TEXT
- `expires_at`: TIMESTAMP
- `created_at`: TIMESTAMP

#### 6. service_types
- `id`: INT (PK, AI)
- `name`: VARCHAR(150)
- `description`: TEXT
- `price`: DECIMAL(10,2) (DEFAULT 0)
- `created_at`: TIMESTAMP
- `updated_at`: TIMESTAMP

#### 7. document_types
- `id`: INT (PK, AI)
- `name`: VARCHAR(150)
- `description`: TEXT
- `required`: TINYINT(1) (DEFAULT 1)
- `created_at`: TIMESTAMP
- `updated_at`: TIMESTAMP

#### 8. service_requests
- `id`: CHAR(36) (PK, UUID)
- `user_id`: CHAR(36) (FK users.id, INDEX)
- `service_type_id`: INT (FK service_types.id, INDEX)
- `status`: ENUM('submitted', 'under_review', 'approved', 'rejected', 'completed') (INDEX)
- `notes`: TEXT
- `created_at`: TIMESTAMP (INDEX)
- `updated_at`: TIMESTAMP

#### 9. documents (Supporting files)
- `id`: CHAR(36) (PK, UUID)
- `user_id`: CHAR(36) (FK users.id)
- `document_type_id`: INT (FK document_types.id, INDEX)
- `file_url`: TEXT
- `status`: ENUM('pending', 'approved', 'rejected')
- `created_at`: TIMESTAMP
- `updated_at`: TIMESTAMP

#### 10. service_request_documents (Junction)
- `service_request_id`: CHAR(36) (FK service_requests.id)
- `document_id`: CHAR(36) (FK documents.id)
- (PK: service_request_id, document_id)

#### 11. document_status_history
- `id`: INT (PK, AI)
- `document_id`: CHAR(36) (FK documents.id)
- `status`: VARCHAR(20)
- `changed_by`: CHAR(36) (FK users.id)
- `notes`: TEXT
- `created_at`: TIMESTAMP

#### 12. complaints
- `id`: CHAR(36) (PK, UUID)
- `user_id`: CHAR(36) (FK users.id, INDEX)
- `subject`: VARCHAR(255)
- `description`: TEXT
- `status`: ENUM('open', 'in_progress', 'resolved', 'closed') (INDEX)
- `created_at`: TIMESTAMP
- `updated_at`: TIMESTAMP

#### 13. complaint_attachments
- `id`: INT (PK, AI)
- `complaint_id`: CHAR(36) (FK complaints.id)
- `file_url`: TEXT
- `created_at`: TIMESTAMP

#### 14. announcements
- `id`: INT (PK, AI)
- `title`: VARCHAR(255)
- `content`: TEXT
- `image_url`: TEXT
- `priority`: ENUM('low', 'medium', 'high')
- `published_at`: TIMESTAMP (INDEX)
- `created_at`: TIMESTAMP

#### 15. polls
- `id`: INT (PK, AI)
- `question`: VARCHAR(255)
- `description`: TEXT
- `is_active`: TINYINT(1) (DEFAULT 1)
- `expires_at`: TIMESTAMP
- `created_at`: TIMESTAMP

#### 16. poll_options
- `id`: INT (PK, AI)
- `poll_id`: INT (FK polls.id)
- `option_text`: VARCHAR(255)

#### 17. poll_votes
- `id`: INT (PK, AI)
- `poll_id`: INT (FK polls.id)
- `user_id`: CHAR(36) (FK users.id)
- `option_id`: INT (FK poll_options.id)
- (UNIQUE KEY: poll_id, user_id) - Enforce one vote per user per poll

#### 18. payments
- `id`: CHAR(36) (PK, UUID)
- `service_request_id`: CHAR(36) (FK service_requests.id)
- `user_id`: CHAR(36) (FK users.id)
- `amount`: DECIMAL(10,2)
- `status`: ENUM('pending', 'completed', 'failed')
- `transaction_id`: VARCHAR(100)
- `created_at`: TIMESTAMP

#### 19. notifications
- `id`: CHAR(36) (PK, UUID)
- `user_id`: CHAR(36) (FK users.id, INDEX)
- `title`: VARCHAR(255)
- `message`: TEXT
- `is_read`: TINYINT(1) (DEFAULT 0)
- `type`: VARCHAR(50)
- `created_at`: TIMESTAMP

#### 20. activity_logs
- `id`: INT (PK, AI)
- `user_id`: CHAR(36) (FK users.id)
- `action`: VARCHAR(255)
- `details`: TEXT
- `ip_address`: VARCHAR(45)
- `created_at`: TIMESTAMP (INDEX)
