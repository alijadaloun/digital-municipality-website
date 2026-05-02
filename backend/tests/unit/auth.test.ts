import bcrypt from 'bcryptjs';

describe('Auth Unit Tests', () => {
  it('should hash password correctly', async () => {
    const password = 'mysecretpassword';
    const hash = await bcrypt.hash(password, 10);
    expect(hash).not.toBe(password);
    const isMatch = await bcrypt.compare(password, hash);
    expect(isMatch).toBe(true);
  });

  it('should fail for incorrect password', async () => {
    const password = 'mysecretpassword';
    const hash = await bcrypt.hash(password, 10);
    const isMatch = await bcrypt.compare('wrongpassword', hash);
    expect(isMatch).toBe(false);
  });
});
