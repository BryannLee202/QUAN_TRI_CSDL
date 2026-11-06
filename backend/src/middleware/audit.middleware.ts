import { Request, Response, NextFunction } from "express";
import sql from "mssql";
import { getPool } from "../config/db.js";

/**
 * Middleware tự động ghi nhận nhật ký kiểm toán cho các giao dịch nhạy cảm
 * Kế thừa cơ chế audit_log từ Seal_Hackathon_Webapp
 * Phụ trách: Lê Minh Tài (Trưởng nhóm / Lead Architect)
 */
export const auditAction = (action: string, entityType: string) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const originalJson = res.json.bind(res);

    res.json = (body: any) => {
      if (res.statusCode >= 200 && res.statusCode < 300) {
        setImmediate(async () => {
          try {
            const pool = getPool();
            const actorId =
              (req as any).user?.userId ||
              req.body?.userId ||
              req.body?.operatorId ||
              null;

            const entityId =
              body?.order?.orderId ||
              body?.data?.id ||
              req.body?.orderId ||
              req.body?.trayId ||
              req.body?.harvestId ||
              "N/A";

            await pool
              .request()
              .input("ActorID", sql.Int, actorId)
              .input("Action", sql.VarChar(50), action)
              .input("EntityType", sql.VarChar(50), entityType)
              .input("EntityID", sql.VarChar(50), String(entityId))
              .input("NewValueJSON", sql.NVarChar(sql.MAX), JSON.stringify(body))
              .input("Notes", sql.NVarChar(500), `Endpoint: ${req.method} ${req.originalUrl}`)
              .execute("dbo.sp_LogAuditEvent");
          } catch (err: any) {
            console.warn("⚠️  [AuditLog Warning] Không thể ghi nhật ký kiểm toán:", err.message);
          }
        });
      }
      return originalJson(body);
    };

    next();
  };
};
