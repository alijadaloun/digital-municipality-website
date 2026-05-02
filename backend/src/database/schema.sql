DROP DATABASE IF EXISTS digital_municipality;
CREATE DATABASE digital_municipality;
USE digital_municipality;

SET FOREIGN_KEY_CHECKS = 0;

CREATE TABLE roles (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(20) UNIQUE NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE users (
    id VARCHAR(36) PRIMARY KEY,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    phone VARCHAR(20),
    password_hash VARCHAR(255) NOT NULL,
    is_verified TINYINT(1) DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_user_email (email),
    INDEX idx_user_created (created_at)
);

CREATE TABLE user_roles (
    user_id VARCHAR(36) NOT NULL,
    role_id INT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (user_id, role_id),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE ON UPDATE CASCADE,
    FOREIGN KEY (role_id) REFERENCES roles(id) ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE TABLE verification_codes (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id VARCHAR(36) NOT NULL,
    code VARCHAR(6) NOT NULL,
    type VARCHAR(30) DEFAULT 'email_verification',
    expires_at TIMESTAMP NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE TABLE sessions (
    id VARCHAR(36) PRIMARY KEY,
    user_id VARCHAR(36) NOT NULL,
    refresh_token TEXT NOT NULL,
    expires_at TIMESTAMP NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE TABLE service_types (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(150) UNIQUE NOT NULL,
    description TEXT,
    price DECIMAL(10,2) DEFAULT 0,
    requires_documents TINYINT(1) DEFAULT 1,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE document_types (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(150) UNIQUE NOT NULL,
    description TEXT,
    required TINYINT(1) DEFAULT 1,
    requires_approval TINYINT(1) DEFAULT 1,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE service_requests (
    id VARCHAR(36) PRIMARY KEY,
    user_id VARCHAR(36) NOT NULL,
    service_type_id INT NOT NULL,
    status ENUM('submitted', 'under_review', 'approved', 'rejected', 'completed') DEFAULT 'submitted',
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_sr_user (user_id),
    INDEX idx_sr_service_type (service_type_id),
    INDEX idx_sr_status (status),
    INDEX idx_sr_created (created_at),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE ON UPDATE CASCADE,
    FOREIGN KEY (service_type_id) REFERENCES service_types(id) ON DELETE RESTRICT ON UPDATE CASCADE
);

CREATE TABLE documents (
    id VARCHAR(36) PRIMARY KEY,
    user_id VARCHAR(36) NOT NULL,
    document_type_id INT NOT NULL,
    file_url TEXT NOT NULL,
    status ENUM('pending', 'approved', 'rejected') DEFAULT 'pending',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_doc_user (user_id),
    INDEX idx_doc_type (document_type_id),
    INDEX idx_doc_status (status),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE ON UPDATE CASCADE,
    FOREIGN KEY (document_type_id) REFERENCES document_types(id) ON DELETE RESTRICT ON UPDATE CASCADE
);

CREATE TABLE service_request_documents (
    id INT AUTO_INCREMENT PRIMARY KEY,
    service_request_id VARCHAR(36) NOT NULL,
    document_id VARCHAR(36) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    UNIQUE KEY unique_request_document (service_request_id, document_id),
    FOREIGN KEY (service_request_id) REFERENCES service_requests(id) ON DELETE CASCADE ON UPDATE CASCADE,
    FOREIGN KEY (document_id) REFERENCES documents(id) ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE TABLE document_status_history (
    id INT AUTO_INCREMENT PRIMARY KEY,
    document_id VARCHAR(36) NOT NULL,
    old_status VARCHAR(20),
    new_status VARCHAR(20) NOT NULL,
    changed_by VARCHAR(36),
    reason TEXT,
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (document_id) REFERENCES documents(id) ON DELETE CASCADE ON UPDATE CASCADE,
    FOREIGN KEY (changed_by) REFERENCES users(id) ON DELETE SET NULL ON UPDATE CASCADE
);

CREATE TABLE complaints (
    id VARCHAR(36) PRIMARY KEY,
    user_id VARCHAR(36) NOT NULL,
    subject VARCHAR(255) NOT NULL,
    description TEXT,
    status ENUM('open', 'in_progress', 'resolved', 'closed') DEFAULT 'open',
    admin_response TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_complaint_user (user_id),
    INDEX idx_complaint_status (status),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE TABLE complaint_attachments (
    id INT AUTO_INCREMENT PRIMARY KEY,
    complaint_id VARCHAR(36) NOT NULL,
    file_url TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (complaint_id) REFERENCES complaints(id) ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE TABLE announcements (
    id INT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    content TEXT NOT NULL,
    image_url TEXT,
    priority ENUM('low', 'medium', 'high') DEFAULT 'low',
    published_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_announcement_published (published_at)
);

CREATE TABLE polls (
    id INT AUTO_INCREMENT PRIMARY KEY,
    question VARCHAR(255) NOT NULL,
    description TEXT,
    is_active TINYINT(1) DEFAULT 1,
    expires_at TIMESTAMP NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE poll_options (
    id INT AUTO_INCREMENT PRIMARY KEY,
    poll_id INT NOT NULL,
    option_text VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (poll_id) REFERENCES polls(id) ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE TABLE poll_votes (
    id INT AUTO_INCREMENT PRIMARY KEY,
    poll_id INT NOT NULL,
    user_id VARCHAR(36) NOT NULL,
    option_id INT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    UNIQUE KEY unique_poll_user (poll_id, user_id),
    FOREIGN KEY (poll_id) REFERENCES polls(id) ON DELETE CASCADE ON UPDATE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE ON UPDATE CASCADE,
    FOREIGN KEY (option_id) REFERENCES poll_options(id) ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE TABLE payments (
    id VARCHAR(36) PRIMARY KEY,
    service_request_id VARCHAR(36) NOT NULL,
    user_id VARCHAR(36) NOT NULL,
    amount DECIMAL(10,2) NOT NULL,
    status ENUM('pending', 'completed', 'failed') DEFAULT 'pending',
    transaction_id VARCHAR(100),
    payment_method VARCHAR(40),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (service_request_id) REFERENCES service_requests(id) ON DELETE CASCADE ON UPDATE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE TABLE notifications (
    id VARCHAR(36) PRIMARY KEY,
    user_id VARCHAR(36) NOT NULL,
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    is_read TINYINT(1) DEFAULT 0,
    type VARCHAR(50),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_notif_user (user_id),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE TABLE activity_logs (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id VARCHAR(36),
    action VARCHAR(255) NOT NULL,
    details TEXT,
    ip_address VARCHAR(45),
    metadata JSON,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_activity_user (user_id),
    INDEX idx_activity_created (created_at),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL ON UPDATE CASCADE
);

SET FOREIGN_KEY_CHECKS = 1;

INSERT INTO roles (name) VALUES 
('ADMIN'),
('CITIZEN');

SET @hashed_pw = '$2a$10$7R/A1Jp47jS.7R/A1Jp47jS.7R/A1Jp47jS.7R/A1Jp47jS.';

INSERT INTO users (id, first_name, last_name, email, phone, password_hash, is_verified) VALUES
('u1', 'Rami', 'Haddad', 'rami.haddad@email.lb', '+961 70 123456', @hashed_pw, 1),
('u2', 'Sami', 'Khoury', 'sami.khoury@email.lb', '+961 71 234567', @hashed_pw, 1),
('u3', 'Leila', 'Mansour', 'leila.m@email.lb', '+961 03 345678', @hashed_pw, 1),
('u4', 'Ziad', 'Rahbani', 'ziad.r@email.lb', '+961 76 456789', @hashed_pw, 1),
('u5', 'Hiba', 'Tawaji', 'hiba.t@email.lb', '+961 70 567890', @hashed_pw, 1),
('u6', 'Elias', 'Sarkis', 'elias.s@email.lb', '+961 01 678901', @hashed_pw, 0),
('u7', 'Nadine', 'Labaki', 'nadine.l@email.lb', '+961 71 789012', @hashed_pw, 1),
('u8', 'Omar', 'Karam', 'omar.k@email.lb', '+961 76 890123', @hashed_pw, 1),
('u9', 'Dania', 'Khatib', 'dania.kh@email.lb', '+961 03 901234', @hashed_pw, 1),
('u10', 'Walid', 'Jumblatt', 'walid.j@email.lb', '+961 70 012345', @hashed_pw, 0),
('u11', 'Fadi', 'Abou Chakra', 'fadi.ac@email.lb', '+961 71 112233', @hashed_pw, 1),
('u12', 'Maya', 'Diab', 'maya.d@email.lb', '+961 76 223344', @hashed_pw, 1),
('u13', 'Georges', 'Wassouf', 'georges.w@email.lb', '+961 03 334455', @hashed_pw, 1),
('u14', 'Fairuz', 'Rahbani', 'fairuz.r@email.lb', '+961 70 445566', @hashed_pw, 1),
('u15', 'Assi', 'Hellani', 'assi.h@email.lb', '+961 71 556677', @hashed_pw, 1),
('u16', 'Nancy', 'Ajram', 'nancy.a@email.lb', '+961 76 667788', @hashed_pw, 1),
('u17', 'Haifa', 'Wehbe', 'haifa.w@email.lb', '+961 03 778899', @hashed_pw, 0),
('u18', 'Ragheb', 'Alama', 'ragheb.a@email.lb', '+961 70 889900', @hashed_pw, 1),
('u19', 'Marwan', 'Khoury', 'marwan.kh@email.lb', '+961 71 990011', @hashed_pw, 1),
('u20', 'System', 'Admin', 'admin@municipality.gov', '+961 01 000000', @hashed_pw, 1);

INSERT INTO user_roles (user_id, role_id) VALUES 
('u1', 2), ('u2', 2), ('u3', 2), ('u4', 2), ('u5', 2), 
('u6', 2), ('u7', 2), ('u8', 2), ('u9', 2), ('u10', 2),
('u11', 2), ('u12', 2), ('u13', 2), ('u14', 2), ('u15', 2),
('u16', 2), ('u17', 2), ('u18', 2), ('u19', 2), ('u20', 1);

INSERT INTO service_types (name, description, price, requires_documents) VALUES 
('Residence Certificate', 'Official proof of residency for administrative use.', 15000.00, 1),
('Family Status Record', 'Details of all registered family members.', 25000.00, 1),
('Building Permit', 'Approval for residential structural modifications.', 2500000.00, 1),
('Garbage Collection Permit', 'Annual fee for waste management services.', 120000.00, 0),
('Zoning Inquiry', 'Check the zoning regulation of specific land parcels.', 50000.00, 0);

INSERT INTO document_types (name, description, required, requires_approval) VALUES
('ID Card', 'National identity card copy.', 1, 1),
('Residence Proof', 'Proof of current residence.', 1, 1),
('Family Record', 'Official family record document.', 0, 1),
('Property Document', 'Property ownership or rental document.', 0, 1);

INSERT INTO announcements (title, content, priority) VALUES 
('Water Maintenance Sector B', 'Supply will be interrupted on Tuesday between 8 AM and 4 PM.', 'high'),
('New Public Garden Opening', 'Join us this Sunday in the Central District for the ribbon cutting.', 'medium'),
('Tax Deadline Extended', 'The 2024 municipal tax deadline has been extended to June 30.', 'low');

INSERT INTO polls (question, description) VALUES 
('Street Lighting Policy', 'Should we switch to solar-powered street lights for all main roads?');

INSERT INTO poll_options (poll_id, option_text) VALUES 
(1, 'Yes, definitely'),
(1, 'No, cost is too high'),
(1, 'Unsure, need more data');