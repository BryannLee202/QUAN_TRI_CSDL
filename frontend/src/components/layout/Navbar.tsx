import Link from "next/link";
import ThemeToggle from "./ThemeToggle";

export default function Navbar() {
  return (
    <nav className="bg-[#0D5C3A] text-white px-6 py-4 flex justify-between items-center shadow-md dark:bg-slate-900 border-b border-emerald-800 dark:border-slate-800 transition-colors">
      <div className="text-xl font-bold text-[#D4AF37] shrink-0 whitespace-nowrap flex items-center gap-2">
        <span>🍄</span>
        <span>MushroomCloud</span>
      </div>
      <div className="flex items-center gap-6">
        <div className="hidden sm:flex space-x-6 text-sm font-medium">
          <Link href="/" className="hover:text-[#D4AF37] transition shrink-0 whitespace-nowrap">
            Cổng Khách Hàng
          </Link>
          <Link href="/operator" className="hover:text-[#D4AF37] transition shrink-0 whitespace-nowrap">
            Trung Tâm Điều Hành
          </Link>
          <a href="http://localhost:5000/api-docs" target="_blank" rel="noreferrer" className="hover:text-[#D4AF37] transition shrink-0 whitespace-nowrap">
            Swagger API
          </a>
        </div>
        <ThemeToggle />
      </div>
    </nav>
  );
}
