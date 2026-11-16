/**
 * frontend/src/services/api.ts
 * Tầng giao tiếp HTTP Client giữa Next.js Frontend và Express Backend
 * Tác giả: Lê Minh Tài (Lead Architect)
 */

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";

export interface CreateRentalParams {
  userId?: number;
  packageId: number;
  trayId?: number;
  deliveryAddress: string;
  receiverPhone: string;
  paymentMethod?: string;
  discountPercent?: number;
  notes?: string;
}

export interface RentalResponse {
  success: boolean;
  message: string;
  data: {
    orderId: number;
    orderCode: string;
    trayId: number;
  };
  error?: string;
}

export interface RequestHarvestParams {
  orderId: number;
  deliveryType?: "HOME_DELIVERY" | "PICKUP_FARM";
  deliveryAddress?: string;
  notes?: string;
}

export interface HarvestResponse {
  success: boolean;
  message: string;
  data: {
    harvestId: number;
    orderId: number;
  };
  error?: string;
}

export interface VietQRParams {
  orderCode: string;
  amount: number;
  accountNo?: string;
  accountName?: string;
}

/**
 * 1. Đặt thuê khay nấm trực tuyến (Gọi Stored Procedure sp_CreateRentalOrder)
 */
export async function createRentalOrder(params: CreateRentalParams): Promise<RentalResponse> {
  const res = await fetch(`${API_BASE}/rentals`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(params),
  });

  const json = await res.json();
  if (!res.ok) {
    throw new Error(json.message || json.error || "Lỗi tạo đơn thuê khay nấm");
  }
  return json;
}

/**
 * 2. Gửi yêu cầu thu hoạch nấm (Gọi Stored Procedure sp_RequestHarvest)
 */
export async function requestHarvestApi(params: RequestHarvestParams): Promise<HarvestResponse> {
  const res = await fetch(`${API_BASE}/harvest`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(params),
  });

  const json = await res.json();
  if (!res.ok) {
    throw new Error(json.message || json.error || "Lỗi gửi yêu cầu thu hoạch");
  }
  return json;
}

/**
 * 3. Tạo payload mã VietQR động để thanh toán
 */
export async function generatePaymentQR(params: VietQRParams) {
  const res = await fetch(`${API_BASE}/payments/generate-qr`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(params),
  });

  const json = await res.json();
  if (!res.ok) {
    throw new Error(json.message || "Lỗi tạo mã thanh toán QR");
  }
  return json;
}

/**
 * 4. Kiểm tra sức khỏe hệ thống Backend & CSDL MS SQL Server
 */
export async function checkSystemHealth() {
  const res = await fetch(`${API_BASE}/health`);
  return res.json();
}

/**
 * 5. Các API Quản trị dành cho Trung Tâm Điều Hành Kỹ Thuật Viên (Operator Hub)
 */
export async function getOperatorRoomsApi() {
  const res = await fetch(`${API_BASE}/operator/rooms`);
  const json = await res.json();
  if (!res.ok) throw new Error(json.error?.message || "Lỗi tải danh sách buồng");
  return json.data;
}

export async function getOperatorTraysApi(roomId?: number) {
  const url = roomId ? `${API_BASE}/operator/trays?roomId=${roomId}` : `${API_BASE}/operator/trays`;
  const res = await fetch(url);
  const json = await res.json();
  if (!res.ok) throw new Error(json.error?.message || "Lỗi tải ma trận khay");
  return json.data;
}

export async function getOperatorAlertsApi(roomId?: number) {
  const url = roomId ? `${API_BASE}/operator/alerts?roomId=${roomId}` : `${API_BASE}/operator/alerts`;
  const res = await fetch(url);
  const json = await res.json();
  if (!res.ok) throw new Error(json.error?.message || "Lỗi tải cảnh báo vi khí hậu");
  return json.data;
}

export async function resolveOperatorAlertApi(alertId: number, notes?: string) {
  const res = await fetch(`${API_BASE}/operator/alerts/${alertId}/resolve`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ notes }),
  });
  const json = await res.json();
  if (!res.ok) throw new Error(json.error?.message || "Lỗi giải quyết cảnh báo");
  return json;
}

export async function toggleOperatorDeviceApi(params: {
  roomId: number;
  deviceType: string;
  actionState: "ON" | "OFF";
  triggeredBy?: string;
  details?: string;
}) {
  const res = await fetch(`${API_BASE}/operator/devices/toggle`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(params),
  });
  const json = await res.json();
  if (!res.ok) throw new Error(json.error?.message || "Lỗi điều khiển thiết bị");
  return json;
}

export async function updateOperatorTrayStatusApi(trayId: number, status: "AVAILABLE" | "MAINTENANCE") {
  const res = await fetch(`${API_BASE}/operator/trays/${trayId}/status`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ status }),
  });
  const json = await res.json();
  if (!res.ok) throw new Error(json.error?.message || "Lỗi cập nhật khay");
  return json;
}
