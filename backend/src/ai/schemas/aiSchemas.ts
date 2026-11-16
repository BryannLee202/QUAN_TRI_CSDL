import { z } from "zod";

/**
 * Zod Schemas cho AI Services - Đảm bảo Zero-Crash & Strict Output Validation
 * Theo chuẩn từ repo buildfastwithai/gen-ai-experiments & huggingface/smolagents
 */

// 1. Schema cho Yêu Cầu & Phản Hồi Trò Chuyện (Chat & RAG)
export const ChatRequestSchema = z.object({
  message: z.string().min(1, "Câu hỏi không được để trống").max(1000, "Câu hỏi tối đa 1000 ký tự"),
  trayId: z.number().int().positive().optional(),
  history: z
    .array(
      z.object({
        role: z.enum(["user", "assistant", "system"]),
        content: z.string().max(2000),
      })
    )
    .max(20)
    .optional(),
});

export type ChatRequest = z.infer<typeof ChatRequestSchema>;

export const ChatResponseSchema = z.object({
  reply: z.string(),
  model: z.string(),
  latencyMs: z.number(),
  sources: z.array(z.string()),
  suggestedQuestions: z.array(z.string()),
  actionsTaken: z.array(z.string()).optional(),
});

export type ChatResponse = z.infer<typeof ChatResponseSchema>;

// 2. Schema cho Quyết Định Điều Khiển Vi Khí Hậu Tự Động (Autonomous Climate Agent)
export const ClimateInputSchema = z.object({
  chamberId: z.string().default("B-01"),
  species: z.string().default("Nấm Bào Ngư Xám"),
  temperature: z.number().min(10).max(45),
  humidity: z.number().min(20).max(100),
  co2: z.number().min(300).max(3000),
});

export type ClimateInput = z.infer<typeof ClimateInputSchema>;

export const ClimateDecisionSchema = z.object({
  chamberId: z.string(),
  status: z.enum(["OPTIMAL", "WARNING_DRY", "WARNING_HOT", "WARNING_STUFFY", "CRITICAL"]),
  action: z.enum([
    "MAINTAIN_CONDITIONS",
    "ACTIVATE_ULTRASONIC_MIST",
    "ACTIVATE_COOLING_CURTAIN",
    "ACTIVATE_VENTILATION_EXHAUST",
    "ACTIVATE_UVC_STERILIZE",
  ]),
  durationSeconds: z.number().min(0).max(600),
  targetParameter: z.string(),
  reasoning: z.string(),
  confidence: z.number().min(0).max(1),
  timestamp: z.string(),
});

export type ClimateDecision = z.infer<typeof ClimateDecisionSchema>;

// 3. Schema cho Chẩn Đoán Thị Giác Quả Thể Nấm (Vision AI Inspection)
export const VisionInspectionInputSchema = z.object({
  species: z.enum(["Bào Ngư Xám", "Linh Chi Đỏ", "Đông Trùng Hạ Thảo"]).default("Bào Ngư Xám"),
  stage: z.enum(["Cấy Giống", "Ghim Nấm", "Phát Triển Mũ", "Trưởng Thành", "Thu Hoạch"]).default("Phát Triển Mũ"),
  day: z.number().int().min(1).max(90).default(15),
  imageUrl: z.string().optional(),
});

export type VisionInspectionInput = z.infer<typeof VisionInspectionInputSchema>;

export const VisionInspectionResultSchema = z.object({
  species: z.string(),
  capDiameterMm: z.number(),
  estimatedYieldKg: z.number(),
  vietgapComplianceScore: z.number().min(0).max(100),
  diseaseDetected: z.boolean(),
  diseaseName: z.string().nullable(),
  daysToHarvest: z.number().int().min(0),
  recommendedAction: z.string(),
  healthStatus: z.enum(["XUẤT SẮC", "ỔN ĐỊNH", "CẦN TĂNG ẨM", "CẢNH BÁO"]),
});

export type VisionInspectionResult = z.infer<typeof VisionInspectionResultSchema>;
