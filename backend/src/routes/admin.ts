import { Router } from 'express';
import { authenticate, authorize } from '../middleware/auth';
import { getAdminDashboard, getAllServiceRequests, updateRequestStatus, manageUsers, createUser, deleteUser, getAllComplaints, updateComplaintStatus, getSystemLogs, listAnnouncements, createAnnouncement, updateAnnouncement, deleteAnnouncement, listServiceTypes, createServiceType, updateServiceType, deleteServiceType, getUserReport } from '../controllers/adminController';

const router = Router();

router.use(authenticate);
router.use(authorize(['ADMIN']));

router.get('/dashboard', getAdminDashboard);
router.get('/service-requests', getAllServiceRequests);
router.patch('/service-requests/:id/status', updateRequestStatus);
router.get('/users', manageUsers);
router.post('/users', createUser);
router.delete('/users/:id', deleteUser);
router.get('/complaints', getAllComplaints);
router.patch('/complaints/:id', updateComplaintStatus);
router.get('/logs', getSystemLogs);

router.get('/announcements', listAnnouncements);
router.post('/announcements', createAnnouncement);
router.patch('/announcements/:id', updateAnnouncement);
router.delete('/announcements/:id', deleteAnnouncement);

router.get('/service-types', listServiceTypes);
router.post('/service-types', createServiceType);
router.patch('/service-types/:id', updateServiceType);
router.delete('/service-types/:id', deleteServiceType);

router.get('/reports/users', getUserReport);

export default router;
