import { SignJWT, jwtVerify } from 'jose';

const secret = new TextEncoder().encode(
  process.env.JWT_SECRET || 'your-secret-key-change-in-production'
);

export async function createToken(payload) {
  try {
    const token = await new SignJWT(payload)
      .setProtectedHeader({ alg: 'HS256' })
      .setIssuedAt()
      .setExpirationTime('7d')
      .sign(secret);

    return token;
  } catch (error) {
    console.error('Create token error:', error);
    throw new Error('Failed to create token');
  }
}

export async function verifyToken(token) {
  try {
    if (!token) {
      return null;
    }

    const verified = await jwtVerify(token, secret);
    return verified.payload;
  } catch (error) {
    console.error('Verify token error:', error);
    return null;
  }
}