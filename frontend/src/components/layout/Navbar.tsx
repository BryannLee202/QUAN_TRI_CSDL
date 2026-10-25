export default function Navbar() {
  return (
    <nav className="bg-[#0D5C3A] text-white px-6 py-4 flex justify-between items-center shadow-md">
      <div className="text-xl font-bold text-[#D4AF37]">
        MushroomCloud
      </div>
      <div className="space-x-6 text-sm font-medium">
        <a href="#" className="hover:text-[#D4AF37] transition">Trang chủ</a>
        <a href="#" className="hover:text-[#D4AF37] transition">Gói thuê</a>
        <a href="#" className="hover:text-[#D4AF37] transition">Giám sát</a>
      </div>
    </nav>
  );
}