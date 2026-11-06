import { Router, Request, Response } from "express";
import os from "os";
import { checkDbHealth } from "../config/db.js";

const router = Router();

/**
 * Endpoint Giám Sát Sức Khỏe Toàn Diện Hệ Thống (/api/health)
 * Phụ trách: Nguyễn Thanh Hiển
 */
router.get("/health", async (_req: Request, res: Response) => {
  const dbHealth = await checkDbHealth();
  const mem = process.memoryUsage();

  const isHealthy = dbHealth.status === "healthy";

  const responsePayload = {
    status: isHealthy ? "healthy" : "degraded",
    timestamp: new Date().toISOString(),
    uptimeSeconds: Math.floor(process.uptime()),
    nodeVersion: process.version,
    memory: {
      rssMb: +(mem.rss / 1024 / 1024).toFixed(2),
      heapUsedMb: +(mem.heapUsed / 1024 / 1024).toFixed(2),
      heapTotalMb: +(mem.heapTotal / 1024 / 1024).toFixed(2),
    },
    system: {
      platform: process.platform,
      cpuCores: os.cpus().length,
      freeMemoryMb: +(os.freemem() / 1024 / 1024).toFixed(2),
      totalMemoryMb: +(os.totalmem() / 1024 / 1024).toFixed(2),
    },
    database: dbHealth,
  };

  res.status(isHealthy ? 200 : 503).json(responsePayload);
});

export default router;
