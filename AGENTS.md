# Quy Tắc Quản Lý Git Commit & Kỹ Năng Phát Triển (SmartMushroom FaaS)

Mỗi khi có thay đổi mã nguồn, tính năng hoặc giao diện mới cần đưa lên Git, luôn tuân thủ nghiêm ngặt các quy tắc sau:

## 1. Danh Tính Chủ Dự Án Duy Nhất (100% Single Author)
- **LeMinhTai (Chủ dự án)**: `LeMinhTai <leminhtai2222005@gmail.com>`

## 2. Quy Chuẩn Commit
1. **100% Commit Dưới Tên LeMinhTai**:
   - Toàn bộ 100% các đợt commit trong dự án đều phải gán dưới danh tính duy nhất là `LeMinhTai <leminhtai2222005@gmail.com>`.
   - Tự động bóc tách các tệp thay đổi thành các commit nguyên tử (atomic commits) rõ ràng theo tính năng (branding, backend, landing, customer, operator, docs, ai,...).
2. **Quy Chuẩn Danh Tính (Zero Co-Author)**:
   - Cả `GIT_AUTHOR_NAME` / `GIT_AUTHOR_EMAIL` và `GIT_COMMITTER_NAME` / `GIT_COMMITTER_EMAIL` phải trùng khớp 100% với `LeMinhTai <leminhtai2222005@gmail.com>`.
   - Tuyệt đối không thêm dòng `Co-authored-by` và không commit dưới tên bất kỳ cá nhân nào khác.

## 3. Quy Tắc Áp Dụng Kỹ Năng (Skills Enforcement)
- **Tự động kích hoạt kỹ năng**: Luôn kiểm tra danh mục kỹ năng (Skills) đã cài đặt tại `~/.gemini/config/skills/` và `.agents/skills/` (ví dụ: `mobile-app-testing`, `webapp-testing`, `reverse-engineer-anything`, `frontend-design`, `docx`, `xlsx`, `pptx`, `pdf`, `claude-api`,...).
- **Tuân thủ quy trình chuẩn**: Bất kỳ khi nào tác vụ liên quan đến kiểm thử (web, mobile apk), thiết kế giao diện, xuất tài liệu hoặc dịch ngược mã nguồn, AI bắt buộc phải đọc và tuân thủ các bước chỉ dẫn trong tệp `SKILL.md` của skill tương ứng trước khi phản hồi hoặc thực thi.
- **Không tự ý bỏ qua**: Tuyệt đối không phỏng đoán hay tự ý làm tắt khi đã có quy trình chuẩn trong Skill.
