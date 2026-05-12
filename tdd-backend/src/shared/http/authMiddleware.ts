import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { JWT_SECRET } from '../../config/jwt';

export const authMiddleware = (req: Request, res: Response, next: NextFunction): void => {
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    res.status(401).json({ error: 'Token não fornecido' });
    return;
  }

  const parts = authHeader.split(' ');

  if (parts.length !== 2) {
    res.status(401).json({ error: 'Token mal formatado' });
    return;
  }

  const [scheme, token] = parts;

  if (!/^Bearer$/i.test(scheme)) {
    res.status(401).json({ error: 'Token mal formatado' });
    return;
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as { sub?: string; id?: string };
    req.userId = decoded.sub || decoded.id;
    if (!req.userId) {
      res.status(401).json({ error: 'Token inválido: identificador ausente' });
      return;
    }
    return next();
  } catch (err) {
    res.status(401).json({ error: 'Token inválido ou expirado' });
    return;
  }
};
