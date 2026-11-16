# Quy Tắc Phân Bổ Git Commit Cho Nhóm Phát Triển (SmartMushroom FaaS)

Mỗi khi có thay đổi mã nguồn, tính năng hoặc giao diện mới cần đưa lên Git, luôn tuân thủ nghiêm ngặt các quy tắc phân chia commit sau:

## 1. Danh Sách Thành Viên & Danh Tính Commit
- **LeMinhTai (Chủ dự án)**: `LeMinhTai <leminhtai2222005@gmail.com>`
- **Dang**: `Dang <dang0382482793@gmail.com>`
- **Nguyen Thanh Hien**: `Nguyen Thanh Hien <alanhien123@gmail.com>`
- **Vo Duy Thinh**: `Vo Duy Thinh <thinh20032006@gmail.com>`
- **Hoang Huy**: `Hoang Huy <hoanghuy216412@gmail.com>`

## 2. Quy Tắc Phân Bổ Commit
1. **Tự Động Chia Nhỏ**: Tự động bóc tách các tệp thay đổi thành nhiều commit nhỏ, nguyên tử (atomic commits) theo tính năng (branding, backend, landing, customer, operator, docs, ai,...).
2. **Ưu Tiên Số Lượng Commit Cho LeMinhTai**:
   - Trong mọi đợt commit, `LeMinhTai` luôn phải là người có **số lượng commit nhiều nhất** trong nhóm (ví dụ: LeMinhTai chiếm 2-4 commit, các thành viên khác 1 commit mỗi người).
   - Các phần việc cốt lõi, kiến trúc hệ thống, nhận diện thương hiệu, AI và cấu hình chính ưu tiên gán cho `LeMinhTai`.
3. **Thay Đổi Nhỏ / Đơn Lẻ**:
   - Nếu phần thay đổi quá ít, không đủ để phân chia nhiều thành viên, **mặc định 100% commit dưới tên `LeMinhTai`**.
4. **Quy Chuẩn Danh Tính (Zero Co-Author)**:
   - Cả `GIT_AUTHOR` và `GIT_COMMITTER` phải trùng khớp 100% tên và email của thành viên tương ứng.
   - Tuyệt đối không thêm dòng `Co-authored-by`.

## 3. Quy Tắc Áp Dụng Kỹ Năng (Skills Enforcement)
- **Tự động kích hoạt kỹ năng**: Luôn kiểm tra danh mục kỹ năng (Skills) đã cài đặt tại `~/.gemini/config/skills/` và `.agents/skills/` (ví dụ: `mobile-app-testing`, `webapp-testing`, `reverse-engineer-anything`, `frontend-design`, `docx`, `xlsx`, `pptx`, `pdf`, `claude-api`,...).
- **Tuân thủ quy trình chuẩn**: Bất kỳ khi nào tác vụ liên quan đến kiểm thử (web, mobile apk), thiết kế giao diện, xuất tài liệu hoặc dịch ngược mã nguồn, AI bắt buộc phải đọc và tuân thủ các bước chỉ dẫn trong tệp `SKILL.md` của skill tương ứng trước khi phản hồi hoặc thực thi.
- **Không tự ý bỏ qua**: Tuyệt đối không phỏng đoán hay tự ý làm tắt khi đã có quy trình chuẩn trong Skill.
