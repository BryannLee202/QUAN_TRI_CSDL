import { Request, Response } from "express";

// POST /api/payments/generate-qr
export const generatePaymentQR = async (req: Request, res: Response): Promise<void> => {
  try {
    const { orderId, amount, bankAccount, bankId } = req.body;

    // Sử dụng dịch vụ VietQR để tạo mã QR chuyển khoản động
    // Ngân hàng mặc định (ví dụ: MBBank - 970422) hoặc lấy từ request
    const bank = bankId || "MB";
    const account = bankAccount || "0999999999";
    const addInfo = `THANH TOAN DON HANG ${orderId}`;

    // Link tạo ảnh QR động VietQR
    const qrImageUrl = `https://img.vietqr.io/image/${bank}-${account}-compact2.png?amount=${amount}&addInfo=${encodeURIComponent(addInfo)}&accountName=SMART%20MUSHROOM`;

    res.status(200).json({
      message: "Tạo mã QR thanh toán thành công",
      data: {
        orderId,
        amount,
        qrImageUrl,
        transferInfo: {
          bank,
          account,
          description: addInfo,
        },
      },
    });
  } catch (error: any) {
    res.status(500).json({ message: "Lỗi tạo mã QR thanh toán", error: error.message });
  }
};