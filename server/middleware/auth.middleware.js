// Clerk authentication middleware for client-side
export function requireAuth() {
  return (req, res, next) => {
    if (!req.auth || !req.auth.userId) {
      return res.status(401).json({
        success: false,
        error: 'Unauthorized - Please sign in'
      });
    }
    next();
  };
}

// Check if user has specific role
export function requireRole(roles = []) {
  return (req, res, next) => {
    if (!req.auth || !req.auth.userId) {
      return res.status(401).json({
        success: false,
        error: 'Unauthorized'
      });
    }

    const userRole = req.auth.sessionClaims?.role || 'user';
    
    if (!roles.includes(userRole)) {
      return res.status(403).json({
        success: false,
        error: 'Forbidden - Insufficient permissions'
      });
    }
    
    next();
  };
}

export default { requireAuth, requireRole };
