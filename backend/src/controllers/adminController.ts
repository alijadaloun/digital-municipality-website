import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import { ServiceRequest, ServiceType, Complaint, User, Role, ComplaintAttachment } from '../models/core';
import { ActivityLog, Notification, Announcement } from '../models/extra';
import { AuthRequest } from '../middleware/auth';
import { sequelize } from '../config/db';

export const getAdminDashboard = async (req: AuthRequest, res: Response) => {
  try {
    const usersCount = await User.count();
    const pendingRequests = await ServiceRequest.count({ where: { status: 'submitted' } });
    const openComplaints = await Complaint.count({ where: { status: 'open' } });
    const recentActivity = await ActivityLog.findAll({ limit: 10, order: [['createdAt', 'DESC']], include: [User] });

    res.json({
      stats: {
        totalUsers: usersCount,
        pendingRequests,
        openComplaints,
      },
      recentActivity,
    });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching admin dashboard data' });
  }
};

export const getAllServiceRequests = async (req: Request, res: Response) => {
  try {
    const { status, type } = req.query;
    const where: any = {};
    if (status) where.status = status;
    if (type) where.serviceTypeId = type;

    const requests = await ServiceRequest.findAll({
      where,
      include: [User, ServiceType],
      order: [['createdAt', 'DESC']],
    });
    res.json(requests);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching all requests' });
  }
};

export const updateRequestStatus = async (req: AuthRequest, res: Response) => {
  const { id } = req.params;
  const { status, notes } = req.body;
  try {
    const request = await ServiceRequest.findByPk(id);
    if (!request) return res.status(404).json({ message: 'Request not found' });

    request.status = status;
    if (notes) request.notes = notes;
    await request.save();

    // Notify user
    await Notification.create({
      userId: request.userId,
      title: 'Service Request Update',
      message: `Your request status has been updated to: ${status}`,
    });

    await ActivityLog.create({
      userId: req.user.id,
      action: 'UPDATE_REQUEST_STATUS',
      details: `Updated request ${id} to ${status}`,
      ipAddress: req.ip,
    });

    res.json(request);
  } catch (error) {
    res.status(500).json({ message: 'Error updating status' });
  }
};

export const manageUsers = async (req: Request, res: Response) => {
  try {
    const users = await User.findAll({ include: [Role] });
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching users' });
  }
};

export const createUser = async (req: AuthRequest, res: Response) => {
  const { firstName, lastName, email, password, phone, role } = req.body;
  try {
    const existing = await User.findOne({ where: { email } });
    if (existing) return res.status(400).json({ message: 'Email already in use' });

    const passwordHash = await bcrypt.hash(password, 10);
    const user: any = await User.create({
      firstName,
      lastName,
      email,
      passwordHash,
      phone,
      isVerified: true,
    });

    const roleName = role === 'ADMIN' ? 'ADMIN' : 'CITIZEN';
    const roleModel = await Role.findOne({ where: { name: roleName } });
    if (roleModel) await user.addRole(roleModel);

    await ActivityLog.create({
      userId: req.user.id,
      action: 'ADMIN_CREATE_USER',
      details: `Created user ${email} with role ${roleName}`,
      ipAddress: req.ip,
    });

    const created = await User.findByPk(user.id, { include: [Role] });
    res.status(201).json(created);
  } catch (error) {
    res.status(500).json({ message: 'Error creating user' });
  }
};

export const deleteUser = async (req: AuthRequest, res: Response) => {
  const { id } = req.params;
  try {
    if (req.user?.id === id) {
      return res.status(400).json({ message: 'You cannot delete your own account.' });
    }

    const user: any = await User.findByPk(id);
    if (!user) return res.status(404).json({ message: 'User not found' });
    await user.destroy();

    await ActivityLog.create({
      userId: req.user.id,
      action: 'ADMIN_DELETE_USER',
      details: `Deleted user ${id}`,
      ipAddress: req.ip,
    });

    res.json({ ok: true });
  } catch {
    res.status(500).json({ message: 'Error deleting user' });
  }
};

export const getAllComplaints = async (_req: Request, res: Response) => {
  try {
    const complaints = await Complaint.findAll({
      include: [User, ComplaintAttachment],
      order: [['createdAt', 'DESC']],
    });
    res.json(complaints);
  } catch {
    res.status(500).json({ message: 'Error fetching complaints' });
  }
};

export const getSystemLogs = async (req: Request, res: Response) => {
  try {
    const limit = Math.min(Number(req.query.limit) || 50, 200);
    const offset = Number(req.query.offset) || 0;
    const action = (req.query.action as string) || null;
    const where: any = {};
    if (action) where.action = action;

    const logs = await ActivityLog.findAll({
      where,
      limit,
      offset,
      order: [['createdAt', 'DESC']],
      include: [User],
    });

    res.json(logs);
  } catch {
    res.status(500).json({ message: 'Error fetching system logs' });
  }
};

export const listAnnouncements = async (_req: Request, res: Response) => {
  try {
    const data = await Announcement.findAll({ order: [['publishedAt', 'DESC']] });
    res.json(data);
  } catch {
    res.status(500).json({ message: 'Error fetching announcements' });
  }
};

export const createAnnouncement = async (req: AuthRequest, res: Response) => {
  const { title, content, priority } = req.body;
  try {
    const item = await Announcement.create({
      title,
      content,
      priority: priority || 'low',
      publishedAt: new Date(),
    });

    await ActivityLog.create({
      userId: req.user.id,
      action: 'ANNOUNCEMENT_PUBLISH',
      details: `Published announcement: ${title}`,
      ipAddress: req.ip,
    });

    res.status(201).json(item);
  } catch {
    res.status(500).json({ message: 'Error creating announcement' });
  }
};

export const updateAnnouncement = async (req: AuthRequest, res: Response) => {
  const { id } = req.params;
  const { title, content, priority } = req.body;
  try {
    const item: any = await Announcement.findByPk(id);
    if (!item) return res.status(404).json({ message: 'Announcement not found' });
    if (title !== undefined) item.title = title;
    if (content !== undefined) item.content = content;
    if (priority !== undefined) item.priority = priority;
    await item.save();

    await ActivityLog.create({
      userId: req.user.id,
      action: 'ANNOUNCEMENT_UPDATE',
      details: `Updated announcement ${id}`,
      ipAddress: req.ip,
    });

    res.json(item);
  } catch {
    res.status(500).json({ message: 'Error updating announcement' });
  }
};

export const deleteAnnouncement = async (req: AuthRequest, res: Response) => {
  const { id } = req.params;
  try {
    const item: any = await Announcement.findByPk(id);
    if (!item) return res.status(404).json({ message: 'Announcement not found' });
    await item.destroy();

    await ActivityLog.create({
      userId: req.user.id,
      action: 'ANNOUNCEMENT_DELETE',
      details: `Deleted announcement ${id}`,
      ipAddress: req.ip,
    });

    res.json({ ok: true });
  } catch {
    res.status(500).json({ message: 'Error deleting announcement' });
  }
};

export const listServiceTypes = async (_req: Request, res: Response) => {
  try {
    const data = await ServiceType.findAll({ order: [['name', 'ASC']] });
    res.json(data);
  } catch {
    res.status(500).json({ message: 'Error fetching service types' });
  }
};

function normalizePrice(raw: unknown): number {
  const n = Number(raw ?? 0);
  if (!Number.isFinite(n) || n < 0) return 0;
  return Math.round(n * 100) / 100;
}

export const createServiceType = async (req: AuthRequest, res: Response) => {
  const { name, description, price, requiresDocuments } = req.body;
  try {
    const item = await ServiceType.create({
      name,
      description: description || null,
      price: normalizePrice(price),
      requiresDocuments: requiresDocuments === undefined ? true : Boolean(requiresDocuments),
    });

    await ActivityLog.create({
      userId: req.user.id,
      action: 'SERVICE_TYPE_CREATE',
      details: `Created service type: ${name}`,
      ipAddress: req.ip,
    });

    res.status(201).json(item);
  } catch {
    res.status(500).json({ message: 'Error creating service type' });
  }
};

export const updateServiceType = async (req: AuthRequest, res: Response) => {
  const { id } = req.params;
  const { name, description, price, requiresDocuments } = req.body;
  try {
    const item: any = await ServiceType.findByPk(id);
    if (!item) return res.status(404).json({ message: 'Service type not found' });
    if (name !== undefined) item.name = name;
    if (description !== undefined) item.description = description;
    if (price !== undefined) item.price = normalizePrice(price);
    if (requiresDocuments !== undefined) item.requiresDocuments = Boolean(requiresDocuments);
    await item.save();

    await ActivityLog.create({
      userId: req.user.id,
      action: 'SERVICE_TYPE_UPDATE',
      details: `Updated service type ${id}`,
      ipAddress: req.ip,
    });

    res.json(item);
  } catch {
    res.status(500).json({ message: 'Error updating service type' });
  }
};

export const deleteServiceType = async (req: AuthRequest, res: Response) => {
  const { id } = req.params;
  try {
    const item: any = await ServiceType.findByPk(id);
    if (!item) return res.status(404).json({ message: 'Service type not found' });
    await item.destroy();

    await ActivityLog.create({
      userId: req.user.id,
      action: 'SERVICE_TYPE_DELETE',
      details: `Deleted service type ${id}`,
      ipAddress: req.ip,
    });

    res.json({ ok: true });
  } catch {
    res.status(500).json({ message: 'Error deleting service type' });
  }
};

export const getUserReport = async (_req: Request, res: Response) => {
  try {
    const totalUsers = await User.count();
    const admins = await User.count({
      include: [{ model: Role, where: { name: 'ADMIN' } }],
      distinct: true,
    });
    const citizens = await User.count({
      include: [{ model: Role, where: { name: 'CITIZEN' } }],
      distinct: true,
    });

    const topRequesters = await ServiceRequest.findAll({
      attributes: ['userId', [sequelize.fn('COUNT', sequelize.col('service_requests.id')), 'count']],
      group: ['userId'],
      order: [[sequelize.literal('count'), 'DESC']],
      limit: 5,
      include: [{ model: User, attributes: ['firstName', 'lastName', 'email'] }],
    });

    res.json({
      totals: { totalUsers, admins, citizens },
      topRequesters,
    });
  } catch {
    res.status(500).json({ message: 'Error building user report' });
  }
};

export const updateComplaintStatus = async (req: AuthRequest, res: Response) => {
  const { id } = req.params;
  const { status, adminResponse } = req.body;
  try {
    const complaint: any = await Complaint.findByPk(id);
    if (!complaint) return res.status(404).json({ message: 'Complaint not found' });

    if (status) complaint.status = status;
    if (adminResponse !== undefined) complaint.adminResponse = adminResponse;
    await complaint.save();

    await Notification.create({
      userId: complaint.userId,
      title: 'Complaint Update',
      message: `Your complaint "${complaint.subject}" is now: ${complaint.status}`,
    });

    await ActivityLog.create({
      userId: req.user.id,
      action: 'UPDATE_COMPLAINT_STATUS',
      details: `Updated complaint ${id} to ${complaint.status}`,
      ipAddress: req.ip,
    });

    res.json(complaint);
  } catch {
    res.status(500).json({ message: 'Error updating complaint' });
  }
};

// Add more admin functions here...
