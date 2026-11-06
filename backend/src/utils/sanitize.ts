/**
 * Tiện ích làm sạch dữ liệu và phòng chống tấn công CSV/Excel Formula Injection
 * Phụ trách: Nguyễn Thanh Hiển
 */
export const sanitizeCsvCell = (value: any): string => {
  if (value === null || value === undefined) return "";
  const str = String(value).trim();
  // Ký tự đầu nguy hiểm cho Excel/Google Sheets: =, +, -, @, \t, \r
  if (/^[=+\-@\t\r]/.test(str)) {
    return `'${str}`; // Thêm dấu nháy đơn để trình đọc bảng tính hiểu là chuỗi thuần
  }
  return str;
};

/**
 * Làm sạch một object dữ liệu trước khi xuất báo cáo bảng tính
 */
export const sanitizeCsvRow = <T extends Record<string, any>>(row: T): Record<string, string> => {
  const result: Record<string, string> = {};
  for (const [key, val] of Object.entries(row)) {
    result[key] = sanitizeCsvCell(val);
  }
  return result;
};
