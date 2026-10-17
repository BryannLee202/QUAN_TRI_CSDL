-- ============================================================================
-- ĐỒ ÁN HỆ QUẢN TRỊ CƠ SỞ DỮ LIỆU & PHÁT TRIỂN ỨNG DỤNG WEB
-- HỆ THỐNG QUẢN LÝ NUÔI TRỒNG NẤM THÔNG MINH TÍCH HỢP CHO THUÊ VÀ GIÁM SÁT TỪ XA
-- File: run_all.sql - Master Script Chạy Khởi Tạo Toàn Bộ CSDL SmartMushroomDB
-- ============================================================================

PRINT N'======================================================================';
PRINT N'BẮT ĐẦU KHỞI TẠO HỆ THỐNG CƠ SỞ DỮ LIỆU SMARTMUSHROOMDB...';
PRINT N'======================================================================';

-- 1. BẢNG DỮ LIỆU & RÀNG BUỘC (01_schema.sql)
:r 01_schema.sql

-- 2. STORED PROCEDURES, TRIGGERS, FUNCTIONS & VIEWS (02_tsql_logic.sql)
:r 02_tsql_logic.sql

-- 3. NẠP DỮ LIỆU MẪU ĐẦY ĐỦ (03_seed_data.sql)
:r 03_seed_data.sql

-- 4. ĐÁNH CHỈ MỤC TỐI ƯU HIỆU NĂNG (04_indexing_and_performance.sql)
:r 04_indexing_and_performance.sql

PRINT N'======================================================================';
PRINT N'HOÀN TẤT 100% QUÁ TRÌNH KHỞI TẠO CƠ SỞ DỮ LIỆU CHO HỆ THỐNG!';
PRINT N'======================================================================';
GO
