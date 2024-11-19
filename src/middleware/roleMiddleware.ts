import { Request, Response, NextFunction } from 'express';

export function authorizeRole(requiredRoles: Array<"a" | "u">) {
  return (req: Request, res: Response, next: NextFunction) => {
    const userRole = req.role; 
    if (!userRole || !requiredRoles.includes(userRole)) {
      return res.status(403).json({ message: "Access forbidden" });
    }
    next();
  };
}
