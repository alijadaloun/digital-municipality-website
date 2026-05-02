import bcrypt from 'bcryptjs';
import { Role, User, ServiceType, DocumentType } from '../models/core';
import { Announcement, Poll, PollOption } from '../models/extra';

export async function runSeeders() {
  console.log('Running seeders...');

  // Roles
  const [adminRole] = await Role.findOrCreate({ where: { name: 'ADMIN' } });
  const [citizenRole] = await Role.findOrCreate({ where: { name: 'CITIZEN' } });

  // Admin User
  const adminEmail = 'admin@municipality.gov';
  const existingAdmin = await User.findOne({ where: { email: adminEmail } });
  if (!existingAdmin) {
    const passwordHash = await bcrypt.hash('AdminPassword123', 10);
    const admin = await User.create({
      firstName: 'System',
      lastName: 'Administrator',
      email: adminEmail,
      passwordHash,
      isVerified: true,
    });
    await (admin as any).addRole(adminRole);
    console.log('Admin user created.');
  }

  // Citizen User
  const citizenEmail = 'citizen@example.com';
  const existingCitizen = await User.findOne({ where: { email: citizenEmail } });
  if (!existingCitizen) {
    const passwordHash = await bcrypt.hash('CitizenPassword123', 10);
    const citizen = await User.create({
      firstName: 'John',
      lastName: 'Doe',
      email: citizenEmail,
      passwordHash,
      isVerified: true,
    });
    await (citizen as any).addRole(citizenRole);
    console.log('Citizen user created.');
  }

  // Service Types
  const serviceTypes = [
    { name: 'Residence Certificate', description: 'Proof of residency in the municipality.', price: 10.0 },
    { name: 'Family Status Certificate', description: 'Document showing family members.', price: 15.0 },
    { name: 'Building Permit', description: 'Permission to start construction.', price: 500.0 },
  ];
  for (const st of serviceTypes) {
    await ServiceType.findOrCreate({ where: { name: st.name }, defaults: st });
  }

  // Document Types
  const docTypes = [
    { name: 'ID Copy', description: 'National ID or Passport copy.', required: true },
    { name: 'Land Deed', description: 'Proof of ownership.', required: false },
  ];
  for (const dt of docTypes) {
    await DocumentType.findOrCreate({ where: { name: dt.name }, defaults: dt });
  }

  // Announcements
  await Announcement.findOrCreate({
    where: { title: 'Holiday Closure' },
    defaults: {
      title: 'Holiday Closure',
      content: 'The municipality offices will be closed for the upcoming holiday on May 5th.',
      priority: 'high',
    },
  });

  // Polls
  const poll: any = await Poll.findOne({ where: { question: 'New Park Location?' } });
  if (!poll) {
    const newPoll: any = await Poll.create({
      question: 'New Park Location?',
      description: 'Where should we build the new community park?',
      isActive: true,
    });
    await PollOption.create({ pollId: newPoll.id, optionText: 'Downtown' });
    await PollOption.create({ pollId: newPoll.id, optionText: 'East Suburb' });
    await PollOption.create({ pollId: newPoll.id, optionText: 'North Hills' });
  }

  console.log('Seeders completed.');
}
