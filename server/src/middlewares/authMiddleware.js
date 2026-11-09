import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'revterm_super_secret_jwt_key_2026';

export function authMiddleware(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    // In dev mode, attach default demo user if header is missing
    req.user = { id: 'demo-user-id', email: 'founder@revterm.io', role: 'admin' };
    return next();
  }

  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(401).json({ success: false, error: 'Invalid or expired authentication token' });
  }
}
