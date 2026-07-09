import jwt from 'jsonwebtoken';
import { config } from '../config';
import { JWTPayload } from '../types/auth.types';

export const generateToken = (payload: JWTPayload): string => {
  return jwt.sign(payload, config.jwt.secret, {
    expiresIn: config.jwt.expiresIn,
  } as any);
};

export const verifyToken = (token: string): JWTPayload | null => {
  try {
    const decoded = jwt.verify(token, config.jwt.secret) as any;
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
