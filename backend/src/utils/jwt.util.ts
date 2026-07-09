import { SignJWT, jwtVerify } from 'jose';
import { config } from '../config';
import { JWTPayload } from '../types/auth.types';

const getSecretKey = () => new TextEncoder().encode(config.jwt.secret);

export const generateToken = async (payload: JWTPayload): Promise<string> => {
  const expiresIn = config.jwt.expiresIn || '7d';
  // Parse expiration time
  let expirationTime = '7d';
  if (typeof expiresIn === 'string') {
    expirationTime = expiresIn;
  }
  
  return await new SignJWT({ ...payload })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime(expirationTime)
    .sign(getSecretKey());
};

export const verifyToken = async (token: string): Promise<JWTPayload | null> => {
  try {
    const { payload } = await jwtVerify(token, getSecretKey());
    const decoded = payload as any;
    // Ensure both userId and id are present for compatibility
    return {
      ...decoded,
      id: decoded.userId || decoded.id,
      userId: decoded.userId || decoded.id,
    };
  } catch (error) {
    return null;
  }
};
