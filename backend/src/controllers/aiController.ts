import { Request, Response } from "express";
import { ChatRequestSchema, ClimateInputSchema, VisionInspectionInputSchema } from "../ai/schemas/aiSchemas.js";
import { aiProvider } from "../ai/services/aiProvider.js";
import { autonomousClimateAgent } from "../ai/services/autonomousAgent.js";
import { mushroomVisionService } from "../ai/services/visionService.js";

/**
 * AI Controller - Quản lý toàn bộ API AI trong nền tảng MushroomCloud
 */
export class AIController {
  /**
   * POST /api/ai/chat
   * Trò chuyện tư vấn với MushroomBot AI (Llama-3.1-8B + RAG)
   */
  async handleChat(req: Request, res: Response): Promise<void> {
    try {
      const parsed = ChatRequestSchema.safeParse(req.body);
      if (!parsed.success) {
        res.status(400).json({
          success: false,
          error: {
            code: "VALIDATION_FAILED",
            message: "Dữ liệu yêu cầu không hợp lệ",
            details: parsed.error.format(),
          },
        });
        return;
      }

      const response = await aiProvider.generateChatResponse(parsed.data);
      res.status(200).json({
        success: true,
        data: response,
      });
    } catch (err: any) {
      console.error("[AIController] handleChat error:", err);
      res.status(500).json({
        success: false,
        error: {
          code: "AI_PROCESSING_ERROR",
          message: err.message || "Lỗi xử lý phản hồi AI",
        },
      });
    }
  }

  /**
   * POST /api/ai/diagnose
   * Chẩn đoán thị giác quả thể nấm & tiêu chuẩn VietGAP
   */
  async handleDiagnose(req: Request, res: Response): Promise<void> {
    try {
      const parsed = VisionInspectionInputSchema.safeParse(req.body);
      if (!parsed.success) {
        res.status(400).json({
          success: false,
          error: {
            code: "VALIDATION_FAILED",
            message: "Thông số chẩn đoán không hợp lệ",
            details: parsed.error.format(),
          },
        });
        return;
      }

      const result = mushroomVisionService.inspectMushroomImage(parsed.data);
      res.status(200).json({
        success: true,
        data: result,
      });
    } catch (err: any) {
      console.error("[AIController] handleDiagnose error:", err);
      res.status(500).json({
        success: false,
        error: {
          code: "VISION_ERROR",
          message: err.message || "Lỗi phân tích thị giác",
        },
      });
    }
  }

  /**
   * GET /api/ai/climate-recommendation
   * Quyết định điều khiển vi khí hậu tự động theo cảm biến
   */
  async handleClimateRecommendation(req: Request, res: Response): Promise<void> {
    try {
      const chamberId = String(req.query.chamberId || "B-01");
      const species = String(req.query.species || "Nấm Bào Ngư Xám");
      const temperature = Number(req.query.temperature ?? 24.2);
      const humidity = Number(req.query.humidity ?? 92);
      const co2 = Number(req.query.co2 ?? 620);

      const parsed = ClimateInputSchema.safeParse({
        chamberId,
        species,
        temperature,
        humidity,
        co2,
      });

      if (!parsed.success) {
        res.status(400).json({
          success: false,
          error: {
            code: "INVALID_PARAMETERS",
            message: "Thông số cảm biến không hợp lệ",
            details: parsed.error.format(),
          },
        });
        return;
      }

      const decision = autonomousClimateAgent.evaluateChamberClimate(parsed.data);
      res.status(200).json({
        success: true,
        data: decision,
      });
    } catch (err: any) {
      console.error("[AIController] handleClimateRecommendation error:", err);
      res.status(500).json({
        success: false,
        error: {
          code: "AGENT_ERROR",
          message: err.message || "Lỗi ra quyết định vi khí hậu",
        },
      });
    }
  }

  /**
   * GET /api/ai/status
   * Trạng thái Engine AI và thông tin Model đang vận hành
   */
  async handleStatus(_req: Request, res: Response): Promise<void> {
    try {
      const status = aiProvider.getStatus();
      res.status(200).json({
        success: true,
        data: status,
      });
    } catch (err: any) {
      res.status(500).json({
        success: false,
        error: {
          code: "STATUS_CHECK_FAILED",
          message: err.message || "Lỗi kiểm tra trạng thái AI",
        },
      });
    }
  }
}

export const aiController = new AIController();
