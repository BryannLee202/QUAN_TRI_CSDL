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
