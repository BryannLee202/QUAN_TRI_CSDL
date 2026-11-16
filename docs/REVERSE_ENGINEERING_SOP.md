# QUY TRÌNH PHÂN TÍCH NGƯỢC & RÀ SOÁT AN TOÀN PHẦN MỀM (REVERSE ENGINEERING & CRAFT ANYTHING SOP)

**Dự án:** MushroomCloud Farm-as-a-Service Platform  
**Ứng dụng:** Antigravity AI Agent + REA Framework  
**Phiên bản tài liệu:** v1.0.0  

---

## 1. Tổng Quan Về Phương Pháp Luận "Craft Anything"

Phương pháp luận **Craft Anything** kết hợp giữa kỹ thuật dịch ngược (Reverse Engineering) và trí tuệ nhân tạo (AI Agent) để nghiên cứu kiến trúc hệ thống, tái thiết kế sạch sẽ (*Clean-room Design*) và rà soát an toàn phần mềm mà không vi phạm bản quyền:

```
┌─────────────────────────────────────────────────────────────────────────────┐
│  Target System  ──►   REA MCP   ──►  SPEC.md  ──► Rebuild  ──► Differential │
│  (Binary / App)      Analysis        (Tài liệu)    (Mã mới)    Test (Oracle) │
└─────────────────────────────────────────────────────────────────────────────┘
```

1. **Analysis (Phân tích đối tượng):** Dùng các công cụ chuyên sâu (Ghidra, JADX, ImHex, Frida, mitmproxy) để khám phá cấu trúc dữ liệu, luồng nghiệp vụ và giao thức mạng.
2. **SPEC.md (Đặc tả hành vi):** Đúc kết toàn bộ hành vi, ràng buộc logic và quy tắc hệ thống thành văn bản kỹ thuật rõ ràng.
3. **Rebuild (Tái xây dựng mã nguồn):** Sử dụng AI Agent lập trình lại 100% mã nguồn mới từ bản đặc tả trên stack công nghệ hiện đại (Next.js 14, Node.js Express, Microsoft SQL Server 2022).
4. **Differential Testing (Kiểm chứng đối chiếu):** Chạy song song cả hai hệ thống với cùng một tập dữ liệu đầu vào (Oracle Testing) để đảm bảo độ chính xác tuyệt đối.

---

## 2. Rà Soát Bảo Mật Mã Nguồn Dự Án (Static Security Audit)

Để đảm bảo hệ thống thương mại của nền tảng không bị đối thủ dịch ngược hoặc khai thác lỗ hổng, MushroomCloud áp dụng kịch bản rà soát tự động qua `scripts/security_audit.js`:

### Các Tiêu Chí Kiểm Tra (Security Checkpoints):
1. **Không rò rỉ Chuỗi kết nối / Credentials:** Cấm tuyệt đối việc hardcode mật khẩu CSDL SQL Server hoặc khóa bí mật `JWT_SECRET` trong mã nguồn client.
2. **Phòng chống SQL Injection:** Tất cả truy vấn đến SQL Server phải dùng **Parameterized Queries** (`pool.request().input(...)`) hoặc Stored Procedures. Tuyệt đối không ghép chuỗi SQL trực tiếp.
3. **Phòng thủ đa tầng HTTP:**
   - **Helmet:** Thiết lập các cờ HTTP Headers an toàn chống Clickjacking, XSS và MIME sniffing.
   - **Double Submit Cookie CSRF:** Bảo vệ các thao tác ghi nhận đơn hàng và điều khiển thiết bị.
   - **Rate Limiting:** Chặn đứng các đợt tấn công vét cạn (Brute-force) hoặc DoS vào API xác thực.

### Lệnh Thực Thi Rà Soát:
```bash
node scripts/security_audit.js
```

---

## 3. Bản Đồ Công Cụ RE Phục Vụ Nông Nghiệp Thông Minh

| Công Cụ | Phân Khúc Ứng Dụng Trong Nông Nghiệp Thông Minh |
| :--- | :--- |
| **ImHex** | Giải mã cấu trúc gói tin cảm biến môi trường nhị phân (Modbus RTU, LoRaWAN frames). |
| **mitmproxy** | Giám sát lưu lượng mạng WebSocket, đo độ trễ các bản tin Telemetry và luồng Camera PTZ. |
| **JADX & Apktool** | Phân tích file APK di động của khách hàng, đảm bảo không rò rỉ token bí mật. |
| **Frida** | Kiểm thử động trên thiết bị di động, kiểm tra tính toàn vẹn của ứng dụng khi tương tác với API backend. |
| **Ghidra / Rizin** | Phân tích firmware vi điều khiển IoT buồng nuôi nấm khi cần nâng cấp giao thức truyền thông. |

---

## 4. Cam Kết Pháp Lý & Tuân Thủ Chuẩn Mực
- Việc ứng dụng công cụ phân tích ngược chỉ được thực hiện cho mục đích nghiên cứu học thuật, kiểm thử bảo mật nội bộ và tương thích thiết bị phần cứng cảm biến theo đúng quy định pháp luật và sở hữu trí tuệ.
