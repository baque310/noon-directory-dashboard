"use client";
import { useEffect, useState } from "react";
import { apiGet, CATEGORIES } from "@/lib/api";

export default function DashboardHome() {
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      apiGet("/manager/directory-listing?take=1000").catch(() => ({ totalCount: 0 })),
      apiGet("/manager/banner").catch(() => []),
      apiGet("/manager/ad-request?take=1000").catch(() => ({ totalCount: 0 })),
      apiGet("/manager/job-seeker?take=1000").catch(() => ({ totalCount: 0 })),
    ]).then(([listings, banners, adRequests, jobs]) => {
      setStats({
        listings: listings.totalCount || 0,
        banners: Array.isArray(banners) ? banners.length : 0,
        adRequests: adRequests.totalCount || 0,
        jobs: jobs.totalCount || 0,
      });
      setLoading(false);
    });
  }, []);

  const cards = [
    { label: "إجمالي الدليل", value: stats?.listings, icon: "📋", color: "from-blue-500 to-blue-700" },
    { label: "البنرات", value: stats?.banners, icon: "🖼️", color: "from-amber-500 to-orange-600" },
    { label: "طلبات الإعلانات", value: stats?.adRequests, icon: "📩", color: "from-emerald-500 to-green-700" },
    { label: "طلبات التوظيف", value: stats?.jobs, icon: "💼", color: "from-purple-500 to-purple-700" },
  ];

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-800">مرحباً بك في لوحة التحكم</h1>
        <p className="text-gray-500 text-sm mt-1">نظرة عامة على منصة دليل نون</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
        {cards.map((card, i) => (
          <div key={i} className={`bg-gradient-to-br ${card.color} rounded-2xl p-5 text-white card-hover shadow-lg`}>
            <div className="flex items-center justify-between mb-3">
              <span className="text-3xl">{card.icon}</span>
              <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
                {loading ? (
                  <div className="animate-spin h-5 w-5 border-2 border-white border-t-transparent rounded-full"></div>
                ) : (
                  <span className="text-lg font-bold">{card.value}</span>
                )}
              </div>
            </div>
            <h3 className="font-semibold text-sm">{card.label}</h3>
          </div>
        ))}
      </div>

      {/* Categories Overview */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
        <h2 className="text-lg font-bold text-gray-800 mb-4">الأقسام المتاحة</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
          {Object.entries(CATEGORIES).map(([key, label]) => (
            <div key={key} className="bg-gray-50 rounded-xl p-3 text-center border border-gray-100 card-hover">
              <span className="text-xl block mb-1">
                {key.includes("HEALTH") ? "🏥" : key === "INSTITUTE" ? "🏫" : key === "TEACHER" ? "👨‍🏫" : key === "KINDERGARTEN" ? "🧒" : key === "UNIFORM" ? "👔" : "📦"}
              </span>
              <p className="text-xs font-medium text-gray-700">{label}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
