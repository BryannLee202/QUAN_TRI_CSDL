/**
 * frontend/src/services/api.ts
 * Tầng giao tiếp HTTP Client giữa Next.js Frontend và Express Backend
 * Tác giả: Lê Minh Tài (Lead Architect)
 */

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";

export function getAuthHeaders(): Record<string, string> {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };
  if (typeof window !== "undefined") {
    const token = localStorage.getItem("mc_token");
    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
    }
  }
  return headers;
}

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

export interface PaymentInitiateParams {
  orderType: "FAAS_RENTAL" | "MARKET_BATCH";
  packageId?: number;
  itemName: string;
  grossAmount: number;
  voucherCode?: string;
  paymentMethod: "VIETQR_NAPAS" | "VNPAY_GATEWAY" | "INTERNATIONAL_CARD" | "COD_ESCROW";
  customerName?: string;
}

export interface PaymentSessionData {
  transactionRef: string;
  orderType: "FAAS_RENTAL" | "MARKET_BATCH";
  packageId?: number;
  itemName: string;
  grossAmount: number;
  discountAmount: number;
  netAmount: number;
  voucherApplied: string | null;
  voucherLabel: string | null;
  paymentMethod: string;
  customerName: string;
  qrImageUrl: string;
  bankInfo: {
    bankCode: string;
    bankName: string;
    bankBin: string;
    accountNo: string;
    accountName: string;
    transferMemo: string;
  };
  expiresInSeconds: number;
  createdAt: string;
}

export interface PaymentConfirmParams {
  transactionRef?: string;
  orderType: "FAAS_RENTAL" | "MARKET_BATCH";
  packageId?: number;
  userId?: number;
  customerName: string;
  customerPhone: string;
  deliveryAddress: string;
  itemName: string;
  durationLabel?: string;
  yieldCommitment?: string;
  grossAmount: number;
  voucherCode?: string;
  paymentMethod: "VIETQR_NAPAS" | "VNPAY_GATEWAY" | "INTERNATIONAL_CARD" | "COD_ESCROW";
  bankOrCardInfo?: string;
  batchCode?: string;
}

export interface PaymentTransactionRecord {
  transactionId: number;
  transactionRef: string;
  orderType: "FAAS_RENTAL" | "MARKET_BATCH";
  orderId: number | null;
  orderCode: string;
  trayId: number | null;
  trayCode: string | null;
  roomName?: string;
  customerName: string;
  customerPhone: string;
  deliveryAddress: string;
  itemName: string;
  durationLabel: string | null;
  yieldCommitment: string | null;
  grossAmount: number;
  discountAmount: number;
  netAmount: number;
  voucherCode: string | null;
  paymentMethod: string;
  bankOrCardInfo: string | null;
  paymentStatus: string;
  settledAt?: string;
  createdAt?: string;
}

export async function initiatePaymentSessionApi(params: PaymentInitiateParams): Promise<{ success: boolean; data: PaymentSessionData }> {
  const res = await fetch(`${API_BASE}/payments/initiate`, {
    method: "POST",
    headers: getAuthHeaders(),
    body: JSON.stringify(params),
  });
  const json = await res.json();
  if (!res.ok) {
    throw new Error(json.message || "Lỗi khởi tạo phiên cổng thanh toán");
  }
  return json;
}

export async function confirmPaymentCheckoutApi(params: PaymentConfirmParams): Promise<{ success: boolean; message: string; data: PaymentTransactionRecord }> {
  const res = await fetch(`${API_BASE}/payments/confirm`, {
    method: "POST",
    headers: getAuthHeaders(),
    body: JSON.stringify(params),
  });
  const json = await res.json();
  if (!res.ok) {
    throw new Error(json.message || "Lỗi xác nhận giao dịch thanh toán");
  }
  return json;
}

export async function getPaymentHistoryApi(limit: number = 15): Promise<PaymentTransactionRecord[]> {
  const res = await fetch(`${API_BASE}/payments/history?limit=${limit}`, {
    method: "GET",
    headers: getAuthHeaders(),
  });
  const json = await res.json();
  if (!res.ok) {
    throw new Error(json.message || "Lỗi tải lịch sử chứng từ giao dịch");
  }
  return json.data || [];
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
    headers: getAuthHeaders(),
    credentials: "include",
    body: JSON.stringify({ notes }),
  });
  const json = await res.json();
  if (!res.ok) throw new Error(json.error?.message || json.message || "Lỗi giải quyết cảnh báo");
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
    headers: getAuthHeaders(),
    credentials: "include",
    body: JSON.stringify(params),
  });
  const json = await res.json();
  if (!res.ok) throw new Error(json.error?.message || json.message || "Lỗi điều khiển thiết bị");
  return json;
}

export async function updateOperatorTrayStatusApi(trayId: number, status: "AVAILABLE" | "MAINTENANCE") {
  const res = await fetch(`${API_BASE}/operator/trays/${trayId}/status`, {
    method: "POST",
    headers: getAuthHeaders(),
    credentials: "include",
    body: JSON.stringify({ status }),
  });
  const json = await res.json();
  if (!res.ok) throw new Error(json.error?.message || json.message || "Lỗi cập nhật khay");
  return json;
}

// -------------------------------------------------------------
// Authentication & RBAC APIs
// -------------------------------------------------------------
export async function loginApi(params: { email: string; password: string }) {
  const res = await fetch(`${API_BASE}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify(params),
  });
  const json = await res.json();
  if (!res.ok) throw new Error(json.message || "Đăng nhập thất bại");
  return json;
}

export async function registerApi(params: {
  fullName: string;
  email: string;
  password: string;
  phoneNumber?: string;
  address?: string;
}) {
  const res = await fetch(`${API_BASE}/auth/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify(params),
  });
  const json = await res.json();
  if (!res.ok) throw new Error(json.message || "Đăng ký thất bại");
  return json;
}

export async function logoutApi() {
  const res = await fetch(`${API_BASE}/auth/logout`, {
    method: "POST",
    headers: getAuthHeaders(),
    credentials: "include",
  });
  const json = await res.json();
  return json;
}

export async function getMeApi() {
  const res = await fetch(`${API_BASE}/auth/me`, {
    method: "GET",
    headers: getAuthHeaders(),
    credentials: "include",
  });
  const json = await res.json();
  if (!res.ok) throw new Error(json.message || "Chưa đăng nhập");
  return json;
}

// -------------------------------------------------------------
// IoT Binary Protocol & Telemetry Parser APIs
// -------------------------------------------------------------
export async function decodeIotHexApi(hexPayload: string) {
  const res = await fetch(`${API_BASE}/iot/decode`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ hexPayload }),
  });
  const json = await res.json();
  if (!res.ok) throw new Error(json.error?.message || "Lỗi giải mã gói tin Hex");
  return json;
}

export async function ingestIotHexApi(hexPayload: string, roomId: number = 1) {
  const res = await fetch(`${API_BASE}/iot/ingest`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ hexPayload, roomId }),
  });
  const json = await res.json();
  if (!res.ok) throw new Error(json.error?.message || "Lỗi nạp dữ liệu IoT vào CSDL");
  return json;
}

export async function getSampleIotHexApi(temp?: number, hum?: number, co2?: number) {
  const params = new URLSearchParams();
  if (temp != null) params.set("temp", temp.toString());
  if (hum != null) params.set("hum", hum.toString());
  if (co2 != null) params.set("co2", co2.toString());

  const res = await fetch(`${API_BASE}/iot/sample?${params.toString()}`);
  const json = await res.json();
  if (!res.ok) throw new Error(json.error?.message || "Lỗi sinh gói tin mẫu");
  return json;
}
