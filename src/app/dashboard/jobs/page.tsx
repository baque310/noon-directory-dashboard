"use client";
import { useEffect, useState } from "react";
import { apiGet, apiDelete, apiPatch } from "@/lib/api";

export default function JobsPage() {
  const [jobs, setJobs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const loadJobs = () => {
    setLoading(true);
    apiGet("/manager/job-seeker?take=100")
      .then((res) => setJobs(res.data || []))
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  };

  useEffect(() => { loadJobs(); }, []);

  const handleApprove = async (id: string) => {
    try {
      await apiPatch(`/manager/job-seeker/${id}/approve`);
      loadJobs();
    } catch { alert("خطأ في الموافقة"); }
  };

  const handleReject = async (id: string) => {
    try {
      await apiPatch(`/manager/job-seeker/${id}/reject`);
      loadJobs();
    } catch { alert("خطأ في الرفض"); }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("هل أنت متأكد من الحذف؟")) return;
    try {
      await apiDelete(`/manager/job-seeker/${id}`);
      loadJobs();
    } catch { alert("خطأ في الحذف"); }
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
        <h1 className="text-2xl font-bold text-gray-800">طلبات التوظيف</h1>
        <p className="text-sm text-gray-500 mt-1">الباحثين عن عمل واشتراكات الموظفين والسواق</p>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-right text-gray-500">
            <thead className="bg-gray-50 text-gray-700 text-xs uppercase font-semibold">
              <tr>
                <th className="px-6 py-4">الاسم</th>
                <th className="px-6 py-4">الاختصاص</th>
                <th className="px-6 py-4">المحافظة</th>
                <th className="px-6 py-4">رقم الهاتف</th>
                <th className="px-6 py-4">الحالة</th>
                <th className="px-6 py-4 text-center">إجراءات</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={6} className="px-6 py-10 text-center"><div className="animate-spin h-6 w-6 border-2 border-purple-600 border-t-transparent rounded-full mx-auto"></div></td></tr>
              ) : jobs.length === 0 ? (
                <tr><td colSpan={6} className="px-6 py-10 text-center text-gray-400">لا توجد طلبات توظيف</td></tr>
              ) : jobs.map((item) => (
                <tr key={item.id} className="border-b border-gray-100 table-row">
                  <td className="px-6 py-4 font-medium text-gray-900">{item.name}</td>
                  <td className="px-6 py-4 text-purple-700 font-medium">{item.speciality}</td>
                  <td className="px-6 py-4">{item.province}</td>
                  <td className="px-6 py-4" dir="ltr">{item.phone}</td>
                  <td className="px-6 py-4"><StatusBadge status={item.isApproved} /></td>
                  <td className="px-6 py-4 text-center">
                    <div className="flex items-center justify-center gap-2">
                      {item.isApproved === 'PENDING' && (
                        <>
                          <button onClick={() => handleApprove(item.id)} className="text-emerald-600 border border-emerald-600 hover:bg-emerald-600 hover:text-white px-3 py-1 rounded-md text-xs font-bold transition">موافقة</button>
                          <button onClick={() => handleReject(item.id)} className="text-red-600 border border-red-600 hover:bg-red-600 hover:text-white px-3 py-1 rounded-md text-xs font-bold transition">رفض</button>
                        </>
                      )}
                      <button onClick={() => handleDelete(item.id)} className="text-gray-400 hover:text-red-600 p-1 transition"><svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg></button>
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
