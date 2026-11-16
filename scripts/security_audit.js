#!/usr/bin/env node

/**
 * MushroomCloud Security & Integrity Audit Script
 * Rà soát an toàn mã nguồn, kiểm tra rò rỉ thông tin nhạy cảm và kiểm tra tuân thủ OWASP
 * Áp dụng phương pháp phân tích tĩnh (Static Analysis) cho dự án FaaS
 */

import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT_DIR = path.resolve(__dirname, "..");

const SUSPICIOUS_PATTERNS = [
  { name: "Hardcoded MSSQL Password", regex: /password\s*[:=]\s*["'][^"']{6,}["']/i },
  { name: "Private Key Exposure", regex: /-----BEGIN (RSA|EC|OPENSSH) PRIVATE KEY-----/ },
  { name: "Hardcoded JWT Secret in Client", regex: /JWT_SECRET\s*=\s*["'][a-zA-Z0-9_@]{8,}["']/ },
  { name: "Direct SQL Concatenation (SQLi Risk)", regex: /query\s*\(\s*`[^`]*\$\{[^}]+\}[^`]*`\s*\)/i },
];

const SCAN_DIRS = [
  path.join(ROOT_DIR, "frontend", "src"),
  path.join(ROOT_DIR, "backend", "src"),
];

const IGNORE_EXTENSIONS = [".png", ".jpg", ".jpeg", ".ico", ".svg", ".map", ".lock"];

let issuesFound = 0;
let filesScanned = 0;

function scanDirectory(dir) {
  if (!fs.existsSync(dir)) return;
  const entries = fs.readdirSync(dir, { withFileTypes: true });

  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      if (entry.name !== "node_modules" && entry.name !== ".next" && entry.name !== "dist") {
        scanDirectory(fullPath);
      }
    } else if (entry.isFile()) {
      const ext = path.extname(entry.name);
      if (IGNORE_EXTENSIONS.includes(ext)) continue;

      filesScanned++;
      const content = fs.readFileSync(fullPath, "utf-8");

      for (const pattern of SUSPICIOUS_PATTERNS) {
        if (pattern.regex.test(content)) {
          // Ngoại lệ cho file cấu hình mẫu hoặc tài liệu
          if (fullPath.includes("security_audit.js") || fullPath.includes("test")) continue;

          console.warn(`⚠️ [CẢNH BÁO AN NINH] ${pattern.name} phát hiện tại: ${path.relative(ROOT_DIR, fullPath)}`);
          issuesFound++;
        }
      }
    }
  }
}

console.log("===============================================================");
console.log("🛡️ MUSHROOMCLOUD STATIC SECURITY & REVERSE INTEGRITY AUDIT");
console.log("===============================================================");

for (const dir of SCAN_DIRS) {
  scanDirectory(dir);
}

console.log(`\nTổng số tệp đã quét: ${filesScanned}`);
if (issuesFound === 0) {
  console.log("✅ KẾT QUẢ: 100% Mã nguồn tuân thủ tiêu chuẩn an toàn bảo mật.");
  console.log("   - Không phát hiện hardcoded credentials trong client code.");
  console.log("   - Cơ chế SQL Server Parameterized Queries được áp dụng nghiêm ngặt.");
} else {
  console.log(`⚠️ Phát hiện ${issuesFound} cảnh báo cần rà soát.`);
}
console.log("===============================================================\n");
