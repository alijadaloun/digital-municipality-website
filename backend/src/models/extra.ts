import { DataTypes, Model } from 'sequelize';
import { sequelize } from '../config/db';
import { User, ServiceRequest, Complaint } from './core';

export class Announcement extends Model {}

Announcement.init(
  {
    id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },

    title: { type: DataTypes.STRING(255), allowNull: false },

    content: { type: DataTypes.TEXT, allowNull: false },

    imageUrl: {
      type: DataTypes.TEXT,
      field: 'image_url',
    },

    priority: {
      type: DataTypes.ENUM('low', 'medium', 'high'),
      defaultValue: 'low',
    },

    publishedAt: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
      field: 'published_at',
    },
  },
  {
    sequelize,
    modelName: 'announcement',
    tableName: 'announcements',
    underscored: true,
  }
);

export class Poll extends Model {}

Poll.init(
  {
    id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },

    question: { type: DataTypes.STRING(255), allowNull: false },

    description: { type: DataTypes.TEXT },

    isActive: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
      field: 'is_active',
    },

    expiresAt: {
      type: DataTypes.DATE,
      allowNull: true,
      field: 'expires_at',
    },
  },
  {
    sequelize,
    modelName: 'poll',
    tableName: 'polls',
    underscored: true,
  }
);

export class PollOption extends Model {}

PollOption.init(
  {
    id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },

    pollId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      field: 'poll_id',
    },

    optionText: {
      type: DataTypes.STRING(255),
      allowNull: false,
      field: 'option_text',
    },
  },
  {
    sequelize,
    modelName: 'poll_option',
    tableName: 'poll_options',
    underscored: true,
  }
);

export class PollVote extends Model {}

PollVote.init(
  {
    id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },

    pollId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      field: 'poll_id',
    },

    userId: {
      type: DataTypes.UUID,
      allowNull: false,
      field: 'user_id',
    },

    optionId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      field: 'option_id',
    },
  },
  {
    sequelize,
    modelName: 'poll_vote',
    tableName: 'poll_votes',
    underscored: true,
    indexes: [{ unique: true, fields: ['poll_id', 'user_id'] }],
  }
);

export class Notification extends Model {}

Notification.init(
  {
    id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },

    userId: {
      type: DataTypes.UUID,
      allowNull: false,
      field: 'user_id',
    },

    title: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },

    message: {
      type: DataTypes.TEXT,
      allowNull: false,
    },

    isRead: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
      field: 'is_read',
    },

    type: {
      type: DataTypes.STRING(50),
    },
  },
  {
    sequelize,
    modelName: 'notification',
    tableName: 'notifications',
    underscored: true,
  }
);

export class ActivityLog extends Model {}

ActivityLog.init(
  {
    id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },

    userId: {
      type: DataTypes.UUID,
      allowNull: true,
      field: 'user_id',
    },

    action: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },

    details: {
      type: DataTypes.TEXT,
    },

    ipAddress: {
      type: DataTypes.STRING(45),
      field: 'ip_address',
    },

    metadata: {
      type: DataTypes.JSON,
    },
  },
  {
    sequelize,
    modelName: 'activity_log',
    tableName: 'activity_logs',
    underscored: true,
  }
);

Poll.hasMany(PollOption, {
  as: 'options',
  foreignKey: {
    name: 'pollId',
    field: 'poll_id',
    allowNull: false,
  },
  onDelete: 'CASCADE',
  onUpdate: 'CASCADE',
});

PollOption.belongsTo(Poll, {
  foreignKey: {
    name: 'pollId',
    field: 'poll_id',
    allowNull: false,
  },
  onDelete: 'CASCADE',
  onUpdate: 'CASCADE',
});

Poll.hasMany(PollVote, {
  foreignKey: {
    name: 'pollId',
    field: 'poll_id',
    allowNull: false,
  },
  onDelete: 'CASCADE',
  onUpdate: 'CASCADE',
});

PollVote.belongsTo(Poll, {
  foreignKey: {
    name: 'pollId',
    field: 'poll_id',
    allowNull: false,
  },
  onDelete: 'CASCADE',
  onUpdate: 'CASCADE',
});

User.hasMany(PollVote, {
  foreignKey: {
    name: 'userId',
    field: 'user_id',
    allowNull: false,
  },
  onDelete: 'CASCADE',
  onUpdate: 'CASCADE',
});

PollVote.belongsTo(User, {
  foreignKey: {
    name: 'userId',
    field: 'user_id',
    allowNull: false,
  },
  onDelete: 'CASCADE',
  onUpdate: 'CASCADE',
});

PollOption.hasMany(PollVote, {
  foreignKey: {
    name: 'optionId',
    field: 'option_id',
    allowNull: false,
  },
  onDelete: 'CASCADE',
  onUpdate: 'CASCADE',
});

PollVote.belongsTo(PollOption, {
  foreignKey: {
    name: 'optionId',
    field: 'option_id',
    allowNull: false,
  },
  onDelete: 'CASCADE',
  onUpdate: 'CASCADE',
});

User.hasMany(Notification, {
  foreignKey: {
    name: 'userId',
    field: 'user_id',
    allowNull: false,
  },
  onDelete: 'CASCADE',
  onUpdate: 'CASCADE',
});

Notification.belongsTo(User, {
  foreignKey: {
    name: 'userId',
    field: 'user_id',
    allowNull: false,
  },
  onDelete: 'CASCADE',
  onUpdate: 'CASCADE',
});

User.hasMany(ActivityLog, {
  foreignKey: {
    name: 'userId',
    field: 'user_id',
    allowNull: true,
  },
  onDelete: 'SET NULL',
  onUpdate: 'CASCADE',
});

ActivityLog.belongsTo(User, {
  foreignKey: {
    name: 'userId',
    field: 'user_id',
    allowNull: true,
  },
  onDelete: 'SET NULL',
  onUpdate: 'CASCADE',
});

Complaint.hasMany(Notification, {
  foreignKey: {
    name: 'complaintId',
    field: 'complaint_id',
    allowNull: true,
  },
  constraints: false,
});

ServiceRequest.hasMany(Notification, {
  foreignKey: {
    name: 'serviceRequestId',
    field: 'service_request_id',
    allowNull: true,
  },
  constraints: false,
});