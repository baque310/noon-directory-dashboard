"use client";
import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";

const menuItems = [
  { href: "/dashboard", label: "الرئيسية", icon: "🏠" },
  { href: "/dashboard/listings", label: "الدليل", icon: "📋" },
  { href: "/dashboard/banners", label: "البنرات", icon: "🖼️" },
  { href: "/dashboard/ad-requests", label: "طلبات الإعلانات", icon: "📩" },
  { href: "/dashboard/job-offers", label: "الوظائف المعروضة", icon: "🏢" },
  { href: "/dashboard/jobs", label: "الباحثون عن عمل", icon: "👨‍💻" },
  { href: "/dashboard/notifications", label: "الإشعارات", icon: "🔔" },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [admin, setAdmin] = useState<any>(null);
  const [sidebarOpen, setSidebarOpen] = useState(true);

  useEffect(() => {
    const stored = localStorage.getItem("admin");
    if (!stored) { router.push("/"); return; }
    setAdmin(JSON.parse(stored));
  }, [router]);

  const handleLogout = () => {
    localStorage.removeItem("admin");
    document.cookie = "token_access=; Max-Age=0; path=/";
    document.cookie = "token_refresh=; Max-Age=0; path=/";
    router.push("/");
  };

  if (!admin) return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="animate-spin h-10 w-10 border-4 border-blue-500 border-t-transparent rounded-full"></div>
    </div>
  );

  return (
    <div className="min-h-screen flex">
      {/* Sidebar */}
      <aside className={`gradient-primary text-white transition-all duration-300 flex flex-col ${sidebarOpen ? "w-64" : "w-20"}`}>
        {/* Logo */}
        <div className="p-4 border-b border-white/10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center text-xl flex-shrink-0">📋</div>
            {sidebarOpen && <div><h1 className="font-bold text-lg">دليل نون</h1><p className="text-xs text-blue-200">لوحة التحكم</p></div>}
          </div>
        </div>

        {/* Menu */}
        <nav className="flex-1 p-3 space-y-1">
          {menuItems.map((item) => (
            <Link key={item.href} href={item.href}
              className={`sidebar-item flex items-center gap-3 text-sm ${pathname === item.href ? "active bg-white/15 font-semibold" : "text-blue-100 hover:text-white"}`}>
              <span className="text-lg">{item.icon}</span>
              {sidebarOpen && <span>{item.label}</span>}
            </Link>
          ))}
        </nav>

        {/* User / Logout */}
        <div className="p-4 border-t border-white/10">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-amber-500 rounded-full flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
              {admin?.username?.[0]?.toUpperCase() || "A"}
            </div>
            {sidebarOpen && (
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">{admin?.username}</p>
                <button onClick={handleLogout} className="text-xs text-red-300 hover:text-red-200 transition-colors">تسجيل الخروج</button>
              </div>
            )}
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col">
        {/* Top Bar */}
        <header className="bg-white shadow-sm border-b border-gray-200 px-6 py-3 flex items-center justify-between">
          <button onClick={() => setSidebarOpen(!sidebarOpen)} className="p-2 rounded-lg hover:bg-gray-100 transition-colors">
            <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
          <div className="text-sm text-gray-500">
            {new Date().toLocaleDateString("ar-IQ", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}
          </div>
        </header>

        {/* Page Content */}
        <div className="flex-1 p-6 overflow-auto bg-gray-50">
          {children}
        </div>
      </main>
    </div>
  );
}
