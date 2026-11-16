import { ClimateInput, ClimateDecision, ClimateDecisionSchema } from "../schemas/aiSchemas.js";

/**
 * Autonomous Climate Agent - Tự Động Hóa Giám Sát Vi Khí Hậu 24/7
 * Lấy cảm hứng từ cấu trúc CodeAgent của Hugging Face smolagents
 */
export class AutonomousClimateAgent {
  /**
   * Phân tích dữ liệu cảm biến đa chiều và đưa ra quyết định chấp hành
   */
  evaluateChamberClimate(input: ClimateInput): ClimateDecision {
    const { chamberId, species, temperature, humidity, co2 } = input;
    const now = new Date().toISOString();

    // 1. Phân tích ngưỡng độ ẩm (Quan trọng nhất đối với nấm tươi)
    if (humidity < 85) {
      const mistDuration = Math.min(180, Math.round((92 - humidity) * 15));
      return ClimateDecisionSchema.parse({
        chamberId,
        status: humidity < 75 ? "CRITICAL" : "WARNING_DRY",
        action: "ACTIVATE_ULTRASONIC_MIST",
        durationSeconds: mistDuration,
        targetParameter: "Độ ẩm không khí (Target: 92%)",
        reasoning: `Độ ẩm đo đạc là ${humidity}%, thấp hơn ngưỡng sinh học 88-92% của ${species}. Cần kích hoạt hệ thống phun sương siêu âm nano ${mistDuration}s đối lưu nhẹ.`,
        confidence: 0.98,
        timestamp: now,
      });
    }

    // 2. Phân tích ngưỡng nhiệt độ phòng sạch
    if (temperature > 25.5) {
      const coolingDuration = Math.min(240, Math.round((temperature - 23.5) * 60));
      return ClimateDecisionSchema.parse({
        chamberId,
        status: temperature > 28 ? "CRITICAL" : "WARNING_HOT",
        action: "ACTIVATE_COOLING_CURTAIN",
        durationSeconds: coolingDuration,
        targetParameter: "Nhiệt độ buồng kính (Target: 23.5°C)",
        reasoning: `Nhiệt độ hiện tại ${temperature}°C vượt ngưỡng tối ưu (22 - 25°C). Kích hoạt rèm lạnh đối lưu hai chiều ${coolingDuration}s để hạ nhiệt buồng vô trùng.`,
        confidence: 0.96,
        timestamp: now,
      });
    }

    // 3. Phân tích nồng độ khí CO2
    if (co2 > 850) {
      const ventDuration = Math.min(120, Math.round((co2 - 600) * 0.3));
      return ClimateDecisionSchema.parse({
        chamberId,
        status: "WARNING_STUFFY",
        action: "ACTIVATE_VENTILATION_EXHAUST",
        durationSeconds: ventDuration,
        targetParameter: "Nồng độ khí CO2 (Target: < 650 ppm)",
        reasoning: `Nồng độ CO2 đạt ${co2} ppm, có nguy cơ khiến cuống nấm dài và mũ nấm teo nhỏ. Kích hoạt quạt hút thông gió trao đổi khí sạch ${ventDuration}s.`,
        confidence: 0.95,
        timestamp: now,
      });
    }

    // 4. Trạng thái sinh thái lý tưởng hoàn hảo
    return ClimateDecisionSchema.parse({
      chamberId,
      status: "OPTIMAL",
      action: "MAINTAIN_CONDITIONS",
      durationSeconds: 0,
      targetParameter: "Tất cả chỉ số đạt chuẩn VietGAP",
      reasoning: `Vi khí hậu buồng ${chamberId} đang ở trạng thái sinh trưởng hoàn hảo: ${temperature}°C, ${humidity}% RH, ${co2} ppm CO2. Không cần can thiệp phụ trợ.`,
      confidence: 0.99,
      timestamp: now,
    });
  }
}

export const autonomousClimateAgent = new AutonomousClimateAgent();
