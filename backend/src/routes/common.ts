import { Router } from 'express';
import { Announcement, Poll, PollOption } from '../models/extra';
import { ServiceType, DocumentType } from '../models/core';

const router = Router();

router.get('/announcements', async (req, res) => {
  const data = await Announcement.findAll({ order: [['publishedAt', 'DESC']] });
  res.json(data);
});

router.get('/polls', async (req, res) => {
  const data = await Poll.findAll({
    where: { isActive: true },
    include: [{ model: PollOption, as: 'options' }]
  });
  res.json(data);
});

router.get('/service-types', async (req, res) => {
  const data = await ServiceType.findAll();
  res.json(data);
});

router.get('/document-types', async (req, res) => {
  const data = await DocumentType.findAll();
  res.json(data);
});

export default router;
