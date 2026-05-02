import { DataTypes, Model } from 'sequelize';
import { sequelize } from '../config/db';

const commonOptions = {
  underscored: true,
  timestamps: true,
};

export class Role extends Model {}
Role.init(
  {
    id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    name: { type: DataTypes.STRING(20), unique: true, allowNull: false },
  },
  { sequelize, modelName: 'role', tableName: 'roles', ...commonOptions }
);

export class User extends Model {}
User.init(
  {
    id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
    firstName: { type: DataTypes.STRING(100), allowNull: false, field: 'first_name' },
    lastName: { type: DataTypes.STRING(100), allowNull: false, field: 'last_name' },
    email: { type: DataTypes.STRING(255), unique: true, allowNull: false },
    phone: { type: DataTypes.STRING(20) },
    passwordHash: { type: DataTypes.STRING(255), allowNull: false, field: 'password_hash' },
    isVerified: { type: DataTypes.BOOLEAN, defaultValue: false, field: 'is_verified' },
  },
  { sequelize, modelName: 'user', tableName: 'users', ...commonOptions }
);

export class ServiceType extends Model {}
ServiceType.init(
  {
    id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    name: { type: DataTypes.STRING(150), unique: true, allowNull: false },
    description: { type: DataTypes.TEXT },
    price: { type: DataTypes.DECIMAL(10, 2), defaultValue: 0 },
    requiresDocuments: { type: DataTypes.BOOLEAN, defaultValue: true, field: 'requires_documents' },
  },
  { sequelize, modelName: 'service_type', tableName: 'service_types', ...commonOptions }
);

export class DocumentType extends Model {}
DocumentType.init(
  {
    id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    name: { type: DataTypes.STRING(150), unique: true, allowNull: false },
    description: { type: DataTypes.TEXT },
    required: { type: DataTypes.BOOLEAN, defaultValue: true },
    requiresApproval: { type: DataTypes.BOOLEAN, defaultValue: true, field: 'requires_approval' },
  },
  { sequelize, modelName: 'document_type', tableName: 'document_types', ...commonOptions }
);

export class ServiceRequest extends Model {}
ServiceRequest.init(
  {
    id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
    userId: { type: DataTypes.UUID, allowNull: false, field: 'user_id' },
    serviceTypeId: { type: DataTypes.INTEGER, allowNull: false, field: 'service_type_id' },
    status: {
      type: DataTypes.ENUM('submitted', 'under_review', 'approved', 'rejected', 'completed'),
      defaultValue: 'submitted',
    },
    notes: { type: DataTypes.TEXT },
  },
  { sequelize, modelName: 'service_request', tableName: 'service_requests', ...commonOptions }
);

export class Document extends Model {}
Document.init(
  {
    id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
    userId: { type: DataTypes.UUID, allowNull: false, field: 'user_id' },
    documentTypeId: { type: DataTypes.INTEGER, allowNull: false, field: 'document_type_id' },
    fileUrl: { type: DataTypes.TEXT, allowNull: false, field: 'file_url' },
    status: {
      type: DataTypes.ENUM('pending', 'approved', 'rejected'),
      defaultValue: 'pending',
    },
  },
  { sequelize, modelName: 'document', tableName: 'documents', ...commonOptions }
);

export class ServiceRequestDocument extends Model {}
ServiceRequestDocument.init(
  {
    id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    serviceRequestId: { type: DataTypes.UUID, allowNull: false, field: 'service_request_id' },
    documentId: { type: DataTypes.UUID, allowNull: false, field: 'document_id' },
  },
  { sequelize, modelName: 'service_request_document', tableName: 'service_request_documents', ...commonOptions }
);

export class Complaint extends Model {}
Complaint.init(
  {
    id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
    userId: { type: DataTypes.UUID, allowNull: false, field: 'user_id' },
    subject: { type: DataTypes.STRING(255), allowNull: false },
    description: { type: DataTypes.TEXT },
    category: { type: DataTypes.STRING(80), allowNull: true },
    locationText: { type: DataTypes.STRING(255), allowNull: true, field: 'location_text' },
    latitude: { type: DataTypes.DECIMAL(10, 7), allowNull: true },
    longitude: { type: DataTypes.DECIMAL(10, 7), allowNull: true },
    status: {
      type: DataTypes.ENUM('open', 'in_progress', 'resolved', 'closed'),
      defaultValue: 'open',
    },
    adminResponse: { type: DataTypes.TEXT, field: 'admin_response' },
  },
  { sequelize, modelName: 'complaint', tableName: 'complaints', ...commonOptions }
);

export class ComplaintAttachment extends Model {}
ComplaintAttachment.init(
  {
    id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    complaintId: { type: DataTypes.UUID, allowNull: false, field: 'complaint_id' },
    fileUrl: { type: DataTypes.TEXT, allowNull: false, field: 'file_url' },
  },
  { sequelize, modelName: 'complaint_attachment', tableName: 'complaint_attachments', ...commonOptions }
);

export class Session extends Model {}
Session.init(
  {
    id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
    userId: { type: DataTypes.UUID, allowNull: false, field: 'user_id' },
    refreshToken: { type: DataTypes.TEXT, allowNull: false, field: 'refresh_token' },
    expiresAt: { type: DataTypes.DATE, allowNull: false, field: 'expires_at' },
  },
  { sequelize, modelName: 'session', tableName: 'sessions', ...commonOptions }
);

export class Poll extends Model {}
Poll.init(
  {
    id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    question: { type: DataTypes.STRING(255), allowNull: false },
    description: { type: DataTypes.TEXT },
    isActive: { type: DataTypes.BOOLEAN, defaultValue: true, field: 'is_active' },
    expiresAt: { type: DataTypes.DATE, allowNull: true, field: 'expires_at' },
  },
  { sequelize, modelName: 'poll', tableName: 'polls', ...commonOptions }
);

export class PollOption extends Model {}
PollOption.init(
  {
    id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    pollId: { type: DataTypes.INTEGER, allowNull: false, field: 'poll_id' },
    optionText: { type: DataTypes.STRING(255), allowNull: false, field: 'option_text' },
  },
  { sequelize, modelName: 'poll_option', tableName: 'poll_options', ...commonOptions }
);

export class PollVote extends Model {}
PollVote.init(
  {
    id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    pollId: { type: DataTypes.INTEGER, allowNull: false, field: 'poll_id' },
    userId: { type: DataTypes.UUID, allowNull: false, field: 'user_id' },
    optionId: { type: DataTypes.INTEGER, allowNull: false, field: 'option_id' },
  },
  { sequelize, modelName: 'poll_vote', tableName: 'poll_votes', ...commonOptions }
);

export class Payment extends Model {}
Payment.init(
  {
    id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
    serviceRequestId: { type: DataTypes.UUID, allowNull: false, field: 'service_request_id' },
    userId: { type: DataTypes.UUID, allowNull: false, field: 'user_id' },
    amount: { type: DataTypes.DECIMAL(10, 2), allowNull: false },
    status: {
      type: DataTypes.ENUM('pending', 'completed', 'failed'),
      defaultValue: 'pending',
    },
    transactionId: { type: DataTypes.STRING(100), field: 'transaction_id' },
    paymentMethod: { type: DataTypes.STRING(40), allowNull: true, field: 'payment_method' },
  },
  { sequelize, modelName: 'payment', tableName: 'payments', ...commonOptions }
);

export class Notification extends Model {}
Notification.init(
  {
    id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
    userId: { type: DataTypes.UUID, allowNull: false, field: 'user_id' },
    title: { type: DataTypes.STRING(255), allowNull: false },
    message: { type: DataTypes.TEXT, allowNull: false },
    isRead: { type: DataTypes.BOOLEAN, defaultValue: false, field: 'is_read' },
    type: { type: DataTypes.STRING(50) },
  },
  { sequelize, modelName: 'notification', tableName: 'notifications', ...commonOptions }
);

User.belongsToMany(Role, {
  through: 'user_roles',
  foreignKey: 'user_id',
  otherKey: 'role_id',
  onDelete: 'CASCADE',
  onUpdate: 'CASCADE',
});

Role.belongsToMany(User, {
  through: 'user_roles',
  foreignKey: 'role_id',
  otherKey: 'user_id',
  onDelete: 'CASCADE',
  onUpdate: 'CASCADE',
});

User.hasMany(ServiceRequest, { foreignKey: { name: 'userId', field: 'user_id', allowNull: false }, onDelete: 'CASCADE', onUpdate: 'CASCADE' });
ServiceRequest.belongsTo(User, { foreignKey: { name: 'userId', field: 'user_id', allowNull: false }, onDelete: 'CASCADE', onUpdate: 'CASCADE' });

ServiceType.hasMany(ServiceRequest, { foreignKey: { name: 'serviceTypeId', field: 'service_type_id', allowNull: false }, onDelete: 'RESTRICT', onUpdate: 'CASCADE' });
ServiceRequest.belongsTo(ServiceType, { foreignKey: { name: 'serviceTypeId', field: 'service_type_id', allowNull: false }, onDelete: 'RESTRICT', onUpdate: 'CASCADE' });

User.hasMany(Document, { foreignKey: { name: 'userId', field: 'user_id', allowNull: false }, onDelete: 'CASCADE', onUpdate: 'CASCADE' });
Document.belongsTo(User, { foreignKey: { name: 'userId', field: 'user_id', allowNull: false }, onDelete: 'CASCADE', onUpdate: 'CASCADE' });

DocumentType.hasMany(Document, { foreignKey: { name: 'documentTypeId', field: 'document_type_id', allowNull: false }, onDelete: 'RESTRICT', onUpdate: 'CASCADE' });
Document.belongsTo(DocumentType, { foreignKey: { name: 'documentTypeId', field: 'document_type_id', allowNull: false }, onDelete: 'RESTRICT', onUpdate: 'CASCADE' });

ServiceRequest.hasMany(ServiceRequestDocument, { foreignKey: { name: 'serviceRequestId', field: 'service_request_id', allowNull: false }, onDelete: 'CASCADE', onUpdate: 'CASCADE' });
ServiceRequestDocument.belongsTo(ServiceRequest, { foreignKey: { name: 'serviceRequestId', field: 'service_request_id', allowNull: false }, onDelete: 'CASCADE', onUpdate: 'CASCADE' });

Document.hasMany(ServiceRequestDocument, { foreignKey: { name: 'documentId', field: 'document_id', allowNull: false }, onDelete: 'CASCADE', onUpdate: 'CASCADE' });
ServiceRequestDocument.belongsTo(Document, { foreignKey: { name: 'documentId', field: 'document_id', allowNull: false }, onDelete: 'CASCADE', onUpdate: 'CASCADE' });

User.hasMany(Complaint, { foreignKey: { name: 'userId', field: 'user_id', allowNull: false }, onDelete: 'CASCADE', onUpdate: 'CASCADE' });
Complaint.belongsTo(User, { foreignKey: { name: 'userId', field: 'user_id', allowNull: false }, onDelete: 'CASCADE', onUpdate: 'CASCADE' });

Complaint.hasMany(ComplaintAttachment, { foreignKey: { name: 'complaintId', field: 'complaint_id', allowNull: false }, onDelete: 'CASCADE', onUpdate: 'CASCADE' });
ComplaintAttachment.belongsTo(Complaint, { foreignKey: { name: 'complaintId', field: 'complaint_id', allowNull: false }, onDelete: 'CASCADE', onUpdate: 'CASCADE' });

User.hasMany(Session, { foreignKey: { name: 'userId', field: 'user_id', allowNull: false }, onDelete: 'CASCADE', onUpdate: 'CASCADE' });
Session.belongsTo(User, { foreignKey: { name: 'userId', field: 'user_id', allowNull: false }, onDelete: 'CASCADE', onUpdate: 'CASCADE' });

Poll.hasMany(PollOption, { foreignKey: { name: 'pollId', field: 'poll_id', allowNull: false }, onDelete: 'CASCADE', onUpdate: 'CASCADE' });
PollOption.belongsTo(Poll, { foreignKey: { name: 'pollId', field: 'poll_id', allowNull: false }, onDelete: 'CASCADE', onUpdate: 'CASCADE' });

Poll.hasMany(PollVote, { foreignKey: { name: 'pollId', field: 'poll_id', allowNull: false }, onDelete: 'CASCADE', onUpdate: 'CASCADE' });
PollVote.belongsTo(Poll, { foreignKey: { name: 'pollId', field: 'poll_id', allowNull: false }, onDelete: 'CASCADE', onUpdate: 'CASCADE' });

User.hasMany(PollVote, { foreignKey: { name: 'userId', field: 'user_id', allowNull: false }, onDelete: 'CASCADE', onUpdate: 'CASCADE' });
PollVote.belongsTo(User, { foreignKey: { name: 'userId', field: 'user_id', allowNull: false }, onDelete: 'CASCADE', onUpdate: 'CASCADE' });

PollOption.hasMany(PollVote, { foreignKey: { name: 'optionId', field: 'option_id', allowNull: false }, onDelete: 'CASCADE', onUpdate: 'CASCADE' });
PollVote.belongsTo(PollOption, { foreignKey: { name: 'optionId', field: 'option_id', allowNull: false }, onDelete: 'CASCADE', onUpdate: 'CASCADE' });

ServiceRequest.hasMany(Payment, { foreignKey: { name: 'serviceRequestId', field: 'service_request_id', allowNull: false }, onDelete: 'CASCADE', onUpdate: 'CASCADE' });
Payment.belongsTo(ServiceRequest, { foreignKey: { name: 'serviceRequestId', field: 'service_request_id', allowNull: false }, onDelete: 'CASCADE', onUpdate: 'CASCADE' });

User.hasMany(Payment, { foreignKey: { name: 'userId', field: 'user_id', allowNull: false }, onDelete: 'CASCADE', onUpdate: 'CASCADE' });
Payment.belongsTo(User, { foreignKey: { name: 'userId', field: 'user_id', allowNull: false }, onDelete: 'CASCADE', onUpdate: 'CASCADE' });

User.hasMany(Notification, { foreignKey: { name: 'userId', field: 'user_id', allowNull: false }, onDelete: 'CASCADE', onUpdate: 'CASCADE' });
Notification.belongsTo(User, { foreignKey: { name: 'userId', field: 'user_id', allowNull: false }, onDelete: 'CASCADE', onUpdate: 'CASCADE' });