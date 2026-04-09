"use client";
import { useEffect, useState } from "react";
import { apiGet, apiDelete, apiPatch, CATEGORIES } from "@/lib/api";

export default function AdRequestsPage() {
  const [requests, setRequests] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const loadRequests = () => {
    setLoading(true);
    apiGet("/manager/ad-request?take=100")
      .then((res) => setRequests(res.data || []))
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  };

  useEffect(() => { loadRequests(); }, []);

  const handleApprove = async (id: string) => {
    if (!confirm("هل أنت متأكد من الموافقة؟ سيتم إضافة هذا الطلب إلى الدليل مباشرة.")) return;
    try {
      await apiPatch(`/manager/ad-request/${id}/approve`);
      loadRequests();
    } catch {
      alert("حدث خطأ أثناء الموافقة");
    }
  };

  const handleReject = async (id: string) => {
    if (!confirm("هل أنت متأكد من رفض هذا الطلب؟")) return;
    try {
      await apiPatch(`/manager/ad-request/${id}/reject`);
      loadRequests();
    } catch {
      alert("حدث خطأ أثناء الرفض");
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("هل أنت متأكد من الحذف نهائياً؟")) return;
    try {
      await apiDelete(`/manager/ad-request/${id}`);
      loadRequests();
    } catch {
      alert("حدث خطأ أثناء الحذف");
    }
  };

  const StatusBadge = ({ status }: { status: string }) => {
    switch (status) {
      case 'APPROVED': return <span className="badge badge-success">مقبول ✔️</span>;
      case 'REJECTED': return <span className="badge badge-danger">مرفوض ❌</span>;
      default: return <span className="badge badge-warning">قيد المراجعة ⏳</span>;
    }
  };

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800">طلبات الإعلانات</h1>
        <p className="text-sm text-gray-500 mt-1">مراجعة الطلبات المقدمة من قسم (أضف إعلانك)</p>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-right text-gray-500">
            <thead className="bg-gray-50 text-gray-700 text-xs uppercase font-semibold">
              <tr>
                <th className="px-6 py-4">الاسم</th>
                <th className="px-6 py-4">القسم / المحافظة</th>
                <th className="px-6 py-4">رقم الهاتف</th>
                <th className="px-6 py-4">الحالة</th>
                <th className="px-6 py-4">التاريخ</th>
                <th className="px-6 py-4 text-center">إجراءات</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={6} className="px-6 py-10 text-center"><div className="animate-spin h-6 w-6 border-2 border-emerald-600 border-t-transparent rounded-full mx-auto"></div></td></tr>
              ) : requests.length === 0 ? (
                <tr><td colSpan={6} className="px-6 py-10 text-center text-gray-400">لا توجد طلبات حالياً</td></tr>
              ) : requests.map((item) => (
                <tr key={item.id} className="border-b border-gray-100 table-row">
                  <td className="px-6 py-4 font-medium text-gray-900">{item.name}</td>
                  <td className="px-6 py-4">
                    <span className="block text-xs font-semibold text-gray-700 mb-1">{CATEGORIES[item.category] || item.category}</span>
                    <span className="text-[10px] text-gray-400">{item.province}</span>
                  </td>
                  <td className="px-6 py-4" dir="ltr">{item.phone}</td>
                  <td className="px-6 py-4"><StatusBadge status={item.status} /></td>
                  <td className="px-6 py-4">{new Date(item.createdAt).toLocaleDateString("ar-IQ")}</td>
                  <td className="px-6 py-4 text-center">
                    <div className="flex items-center justify-center gap-2">
                      {item.status === 'PENDING' && (
                        <>
                          <button onClick={() => handleApprove(item.id)} className="text-emerald-600 hover:text-white hover:bg-emerald-600 text-xs font-bold border border-emerald-600 px-3 py-1.5 rounded-lg transition-colors">موافقة</button>
                          <button onClick={() => handleReject(item.id)} className="text-amber-600 hover:text-white hover:bg-amber-600 text-xs font-bold border border-amber-600 px-3 py-1.5 rounded-lg transition-colors">رفض</button>
                        </>
                      )}
                      <button onClick={() => handleDelete(item.id)} className="text-red-500 hover:text-red-700 p-1.5 bg-red-50 rounded-lg transition-colors" title="حذف نهائي">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
