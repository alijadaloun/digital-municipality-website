import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import { ServiceRequest, ServiceType, Complaint, User, ComplaintAttachment, Payment } from '../models/core';
import { Announcement, Poll, PollVote, Notification, ActivityLog } from '../models/extra';
import { getGeminiClient } from '../services/gemini';

export const getDashboard = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user.id;
    const requestsCount = await ServiceRequest.count({ where: { userId } });
    const complaintsCount = await Complaint.count({ where: { userId } });
    const announcements = await Announcement.findAll({ limit: 5, order: [['publishedAt', 'DESC']] });

    res.json({
      stats: {
        totalRequests: requestsCount,
        totalComplaints: complaintsCount,
      },
      announcements,
    });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching dashboard data' });
  }
};

export const submitServiceRequest = async (req: AuthRequest, res: Response) => {
  const { serviceTypeId, notes } = req.body;
  try {
    const request = await ServiceRequest.create({
      userId: req.user.id,
      serviceTypeId: Number(serviceTypeId),
      notes,
      status: 'submitted',
    });

    await ActivityLog.create({
      userId: req.user.id,
      action: 'SERVICE_REQUEST_SUBMIT',
      details: `Submitted request for service ID ${serviceTypeId}`,
      ipAddress: req.ip,
    });

    res.status(201).json(request);
  } catch (error) {
    res.status(500).json({ message: 'Error submitting service request' });
  }
};

export const getMyRequests = async (req: AuthRequest, res: Response) => {
  try {
    const requests = await ServiceRequest.findAll({
      where: { userId: req.user.id },
      include: [
        ServiceType,
        {
          model: Payment,
          required: false,
          separate: true,
          order: [['createdAt', 'DESC']],
          limit: 1,
        },
      ],
      order: [['createdAt', 'DESC']],
    });
    res.json(requests);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching requests' });
  }
};

const PAYMENT_METHODS = ['card', 'bank_transfer', 'cash_at_counter'] as const;
type PaymentMethod = (typeof PAYMENT_METHODS)[number];

function luhnValid(digits: string): boolean {
  const s = digits.replace(/\D/g, '');
  if (s.length < 13 || s.length > 19) return false;
  let sum = 0;
  let dbl = false;
  for (let i = s.length - 1; i >= 0; i--) {
    let d = parseInt(s[i], 10);
    if (Number.isNaN(d)) return false;
    if (dbl) {
      d *= 2;
      if (d > 9) d -= 9;
    }
    sum += d;
    dbl = !dbl;
  }
  return sum % 10 === 0;
}

/** Normalize currency from DB (decimal string or number) to 2 decimal places */
function roundMoney(value: unknown): number {
  const n = Number(value ?? 0);
  if (Number.isNaN(n) || n < 0) return 0;
  return Math.round(n * 100) / 100;
}

/** Checkout summary for document / service request processing fee */
export const getPaymentSummary = async (req: AuthRequest, res: Response) => {
  const { requestId } = req.params;
  try {
    const sr = await ServiceRequest.findOne({
      where: { id: requestId, userId: req.user.id },
      include: [ServiceType],
    });
    if (!sr) {
      return res.status(404).json({ message: 'Request not found' });
    }
    const st = (sr as any).serviceType as { id?: number; name?: string; price?: unknown } | undefined;
    const amount = roundMoney(st?.price);

    let latestPayment = (await Payment.findOne({
      where: { serviceRequestId: requestId },
      order: [['createdAt', 'DESC']],
    })) as InstanceType<typeof Payment> | null;

    if (latestPayment && latestPayment.get('status') === 'pending' && amount >= 0) {
      const stored = roundMoney(latestPayment.get('amount'));
      if (stored !== amount) {
        latestPayment.set('amount', amount);
        await latestPayment.save();
      }
    }

    res.json({
      serviceRequest: sr,
      amount,
      requiresPayment: amount > 0,
      serviceType: st ? { id: st.id, name: st.name, price: amount } : null,
      latestPayment,
    });
  } catch {
    res.status(500).json({ message: 'Error loading payment summary' });
  }
};

/** Start or update a pending payment after the citizen chooses how to pay */
export const startPayment = async (req: AuthRequest, res: Response) => {
  const { requestId } = req.params;
  const method = req.body?.paymentMethod as PaymentMethod | undefined;
  if (!method || !PAYMENT_METHODS.includes(method)) {
    return res.status(400).json({ message: 'Invalid payment method' });
  }
  try {
    const sr = await ServiceRequest.findOne({
      where: { id: requestId, userId: req.user.id },
      include: [ServiceType],
    });
    if (!sr) {
      return res.status(404).json({ message: 'Request not found' });
    }
    const st = (sr as any).serviceType as { price?: unknown } | undefined;
    const amount = roundMoney(st?.price);
    if (amount <= 0) {
      return res.status(400).json({ message: 'No payment is required for this request' });
    }

    const existing = (await Payment.findOne({
      where: { serviceRequestId: requestId },
      order: [['createdAt', 'DESC']],
    })) as InstanceType<typeof Payment> | null;
    if (existing?.get('status') === 'completed') {
      return res.status(409).json({ message: 'This request is already paid', payment: existing });
    }

    if (existing && existing.get('status') === 'pending') {
      existing.set('paymentMethod', method);
      existing.set('amount', amount);
      await existing.save();
      await ActivityLog.create({
        userId: req.user.id,
        action: 'PAYMENT_METHOD_SELECTED',
        details: `Payment ${existing.get('id')} method: ${method}`,
        ipAddress: req.ip,
      });
      return res.status(200).json({ payment: existing });
    }

    const payment = await Payment.create({
      serviceRequestId: requestId,
      userId: req.user.id,
      amount,
      status: 'pending',
      paymentMethod: method,
    });

    await ActivityLog.create({
      userId: req.user.id,
      action: 'PAYMENT_STARTED',
      details: `Started payment ${String(payment.get('id'))} for request ${requestId} (${method})`,
      ipAddress: req.ip,
    });

    res.status(201).json({ payment });
  } catch {
    res.status(500).json({ message: 'Error starting payment' });
  }
};

/** Complete card payment (demo: validates card format only; does not store card data) */
export const confirmCardPayment = async (req: AuthRequest, res: Response) => {
  const { paymentId } = req.params;
  const { cardNumber, expiry, cvv, cardholderName } = req.body as {
    cardNumber?: string;
    expiry?: string;
    cvv?: string;
    cardholderName?: string;
  };

  if (!cardholderName || typeof cardholderName !== 'string' || cardholderName.trim().length < 2) {
    return res.status(400).json({ message: 'Cardholder name is required' });
  }
  if (!cardNumber || !luhnValid(String(cardNumber))) {
    return res.status(400).json({ message: 'Invalid card number' });
  }
  if (!expiry || !/^\d{2}\/\d{2}$/.test(String(expiry).trim())) {
    return res.status(400).json({ message: 'Expiry must be MM/YY' });
  }
  if (!cvv || !/^\d{3,4}$/.test(String(cvv).trim())) {
    return res.status(400).json({ message: 'Invalid security code' });
  }

  try {
    const payment = (await Payment.findOne({
      where: { id: paymentId, userId: req.user.id },
    })) as InstanceType<typeof Payment> | null;
    if (!payment) {
      return res.status(404).json({ message: 'Payment not found' });
    }
    if (payment.get('paymentMethod') !== 'card') {
      return res.status(400).json({ message: 'This payment was not set up for card' });
    }
    if (payment.get('status') !== 'pending') {
      return res.status(409).json({ message: 'Payment is not pending', payment });
    }

    const digits = String(cardNumber).replace(/\D/g, '');
    const last4 = digits.slice(-4);
    const txnId = `CARD_${last4}_${Date.now().toString(36)}`;

    payment.set('status', 'completed');
    payment.set('transactionId', txnId);
    await payment.save();

    await Notification.create({
      userId: req.user.id,
      title: 'Payment received',
      message: `Your processing fee ($${roundMoney(payment.get('amount')).toFixed(2)}) was paid successfully. Reference: ${txnId}`,
      type: 'payment',
    });

    await ActivityLog.create({
      userId: req.user.id,
      action: 'PAYMENT_COMPLETED',
      details: `Card payment ${payment.get('id')} completed (last4 ${last4})`,
      ipAddress: req.ip,
    });

    res.json({ payment, message: 'Payment completed' });
  } catch {
    res.status(500).json({ message: 'Error confirming payment' });
  }
};

export const submitComplaint = async (req: AuthRequest, res: Response) => {
  const { subject, description, category, locationText, latitude, longitude } = req.body;
  try {
    const complaint = await Complaint.create({
      userId: req.user.id,
      subject,
      description,
      category: category || null,
      locationText: locationText || null,
      latitude: latitude ? Number(latitude) : null,
      longitude: longitude ? Number(longitude) : null,
      status: 'open',
    });

    const file = (req as any).file as Express.Multer.File | undefined;
    if (file) {
      await ComplaintAttachment.create({
        complaintId: (complaint as any).id,
        fileUrl: `/uploads/${file.filename}`,
      });
    }

    await ActivityLog.create({
      userId: req.user.id,
      action: 'COMPLAINT_SUBMIT',
      details: `Submitted complaint: ${subject}`,
      ipAddress: req.ip,
    });

    res.status(201).json(complaint);
  } catch (error) {
    res.status(500).json({ message: 'Error submitting complaint' });
  }
};

export const getMyComplaints = async (req: AuthRequest, res: Response) => {
  try {
    const complaints = await Complaint.findAll({
      where: { userId: req.user.id },
      include: [ComplaintAttachment],
      order: [['createdAt', 'DESC']],
    });
    res.json(complaints);
  } catch {
    res.status(500).json({ message: 'Error fetching complaints' });
  }
};

export const getNotifications = async (req: AuthRequest, res: Response) => {
  try {
    const notifications = await Notification.findAll({
      where: { userId: req.user.id },
      order: [['createdAt', 'DESC']],
    });
    res.json(notifications);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching notifications' });
  }
};

export const votePoll = async (req: AuthRequest, res: Response) => {
  const pollId = Number(req.params.pollId);
  const { optionId } = req.body;
  try {
    await PollVote.create({
      pollId,
      userId: req.user.id,
      optionId: Number(optionId),
    });

    await ActivityLog.create({
      userId: req.user.id,
      action: 'POLL_VOTE',
      details: `Voted on poll ${pollId} (option ${optionId})`,
      ipAddress: req.ip,
    });

    res.status(201).json({ ok: true });
  } catch (error: any) {
    // Unique constraint: user can vote once per poll
    if (String(error?.name).includes('SequelizeUniqueConstraintError')) {
      return res.status(409).json({ message: 'You already voted on this poll.' });
    }
    res.status(500).json({ message: 'Error submitting vote' });
  }
};

export const askMunicipalityBot = async (req: AuthRequest, res: Response) => {
  const { message, history } = req.body as { message?: string; history?: { role: 'user' | 'model'; content: string }[] };
  if (!message || typeof message !== 'string') {
    return res.status(400).json({ message: 'Message is required' });
  }

  try {
    const ai = getGeminiClient();

    const systemInstruction = `
    You are Municipality BOT, an expert assistant inside a digital municipality portal.
    
    Your role is to help citizens understand and use the municipality services clearly, practically, and politely. 
    You assist with permits, municipal taxes, complaints/reports, public parks, utilities, announcements, document requirements, application tracking, and general municipality guidance.
    
    Core behavior:
    - Answer in a professional, friendly, and simple tone.
    - Keep answers short and practical unless the user asks for details.
    - Explain steps clearly using numbered steps when useful.
    - If information is missing, ask one concise follow-up question.
    - Never invent official legal rules, fees, deadlines, or document requirements.
    - When unsure, say that requirements may vary and advise the user to confirm with the municipality office.
    - Do not provide legal guarantees. Give general guidance only.
    - Do not ask for sensitive personal information unless it is necessary for the service.
    - If the user asks about a specific request, guide them to check the request status page or contact support if the request ID is unavailable.
    
    Service guidance:
    
    1. Permits:
    Help users understand how to apply for permits such as building, renovation, business, event, or municipal permissions.
    Explain that users usually need to fill an application, upload required documents, submit the request, and wait for municipal review.
    If the user asks about documents, mention typical documents such as ID, property document, ownership/rental proof, maps, or engineering papers, but clarify that exact requirements depend on the municipality.
    
    2. Tax:
    Help users understand municipal tax estimation and payment.
    Explain that the tax calculator may depend on ownership/property information and applicable expenses such as water, electricity, garbage collection, property fees, and other municipality-related charges.
    Clarify that calculations are estimates unless confirmed by official municipal records.
    Guide users to view dues, payment history, receipts, and pending payments.
    
    3. Report / Complaints:
    Treat reports as citizen complaints submitted through the app.
    Guide users to submit a complaint with a subject, description, category, optional image, and optional location.
    Explain complaint statuses such as open, in progress, resolved, and closed.
    For urgent safety issues, advise contacting the municipality directly or emergency services.
    
    4. Parks:
    Help users find information about public parks, opening hours, facilities, events, and reservations if available.
    Explain that availability and booking approval depend on municipality rules.

    6. Utilities:
    Help users with municipality-related utilities such as water, electricity notices, garbage collection, maintenance alerts, and service interruptions.
    Explain that users may view bills, notices, or submit utility-related complaints depending on the available portal features.
    
    7. Contact Center:
    Guide users to contact the municipality through support tickets or inquiries.
    Explain that users can submit a message, track the response, and receive updates from the relevant department.
    
    Response style:
    - Start with the direct answer.
    - Use simple language.
    - Avoid long paragraphs.
    - Prefer bullets or steps for processes.
    - If the user asks “how do I apply/pay/report,” give clear step-by-step instructions.
    - If the user asks something outside municipality services, politely say you can mainly help with municipality portal services.
    
    Safety and accuracy:
    - Never invent exact fees, laws, or deadlines.
    - Never say a request is approved unless the system provides that status.
    - Never pretend to access user records unless data is provided by the system.
    - For official confirmation, advise contacting the municipality office or contact center.
    
    Example tone:
    “Sure. To submit a complaint, go to Report, choose the complaint category, write a short description, attach a photo if available, then submit. You can later track the status from your complaints page.”
    `;

    const contents: any[] = [];
    contents.push({ role: 'user', parts: [{ text: systemInstruction }] });

    if (Array.isArray(history)) {
      for (const h of history.slice(-10)) {
        if (!h?.content) continue;
        contents.push({
          role: h.role === 'model' ? 'model' : 'user',
          parts: [{ text: String(h.content) }],
        });
      }
    }

    contents.push({ role: 'user', parts: [{ text: message }] });

    const result = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents,
    });

    const text = result.text ?? '';

    await ActivityLog.create({
      userId: req.user.id,
      action: 'MUNI_BOT_ASK',
      details: `Asked Municipality BOT: ${message.slice(0, 120)}`,
      ipAddress: req.ip,
    });

    res.json({ reply: text });
  } catch (error: any) {
    res.status(500).json({ message: 'BOT error', error: String(error?.message || error) });
  }
};

export const getProfile = async (req: AuthRequest, res: Response) => {
  const u: any = req.user as any;
  res.json({
    id: u.id,
    firstName: u.firstName,
    lastName: u.lastName,
    email: u.email,
    phone: u.phone,
    roles: (u.roles || []).map((r: any) => r.name),
  });
};

export const updateProfile = async (req: AuthRequest, res: Response) => {
  const { firstName, lastName, phone } = req.body;
  try {
    const u: any = req.user as any;
    if (firstName !== undefined) u.firstName = firstName;
    if (lastName !== undefined) u.lastName = lastName;
    if (phone !== undefined) u.phone = phone;
    await u.save();

    await ActivityLog.create({
      userId: u.id,
      action: 'PROFILE_UPDATE',
      details: `Updated profile`,
      ipAddress: req.ip,
    });

    res.json({
      id: u.id,
      firstName: u.firstName,
      lastName: u.lastName,
      email: u.email,
      phone: u.phone,
      roles: (u.roles || []).map((r: any) => r.name),
    });
  } catch {
    res.status(500).json({ message: 'Error updating profile' });
  }
};
