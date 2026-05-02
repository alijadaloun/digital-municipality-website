import { Router } from 'express';
import { authenticate, authorize } from '../middleware/auth';
import multer from 'multer';
import path from 'path';
import {
  getDashboard,
  submitServiceRequest,
  getMyRequests,
  submitComplaint,
  getNotifications,
  getMyComplaints,
  votePoll,
  askMunicipalityBot,
  getProfile,
  updateProfile,
  getPaymentSummary,
  startPayment,
  confirmCardPayment,
} from '../controllers/citizenController';

const router = Router();

const upload = multer({
  storage: multer.diskStorage({
    destination: (_req, _file, cb) => cb(null, path.join(process.cwd(), 'uploads')),
    filename: (_req, file, cb) => {
      const safeExt = path.extname(file.originalname || '').slice(0, 10);
      cb(null, `complaint-${Date.now()}-${Math.random().toString(16).slice(2)}${safeExt}`);
    },
  }),
  limits: { fileSize: 5 * 1024 * 1024 },
});

router.use(authenticate);
router.use(authorize(['CITIZEN']));

router.get('/dashboard', getDashboard);
router.post('/service-requests', submitServiceRequest);
router.get('/service-requests/my', getMyRequests);
router.get('/service-requests/:requestId/payment-summary', getPaymentSummary);
router.post('/service-requests/:requestId/payments', startPayment);
router.post('/payments/:paymentId/confirm-card', confirmCardPayment);
router.post('/complaints', upload.single('image'), submitComplaint);
router.get('/complaints/my', getMyComplaints);
router.get('/notifications', getNotifications);
router.post('/polls/:pollId/vote', votePoll);
router.post('/bot/ask', askMunicipalityBot);
router.get('/profile', getProfile);
router.patch('/profile', updateProfile);

export default router;
