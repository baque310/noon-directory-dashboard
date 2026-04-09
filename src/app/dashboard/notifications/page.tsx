"use client";
import { useEffect, useState } from "react";
import { apiGet, apiDelete, apiPost } from "@/lib/api";

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({ title: "", body: "" });

  const loadNotifications = () => {
    setLoading(true);
    apiGet("/admin/notifications")
      .then((res) => setNotifications(res.data || []))
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  };

  useEffect(() => { loadNotifications(); }, []);

  const handleDelete = async (id: string) => {
    if (!confirm("هل أنت متأكد من حذف هذا الإشعار؟")) return;
    try {
      await apiDelete(`/admin/notifications/${id}`);
      loadNotifications();
    } catch (err) {
      alert("حدث خطأ أثناء الحذف");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      // Assuming you might add a POST /admin/notifications route later
      // For now, let's keep it simple or not even show the modal.
      alert("هذه الميزة لإنشاء إشعار مخصص قيد التطوير.");
      setShowModal(false);
      setFormData({ title: "", body: "" });
    } catch (err) {
      alert("حدث خطأ");
    }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">الإشعارات</h1>
          <p className="text-sm text-gray-500 mt-1">سجل الإشعارات المرسلة لمستخدمي التطبيق</p>
        </div>
        {/* <button onClick={() => setShowModal(true)} className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-xl text-sm font-semibold transition-colors flex items-center gap-2">
          <span>+</span> إنشاء إشعار مخصص
        </button> */}
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-right text-gray-500">
            <thead className="bg-gray-50 text-gray-700 text-xs uppercase font-semibold">
              <tr>
                <th className="px-6 py-4">العنوان</th>
                <th className="px-6 py-4">النص</th>
                <th className="px-6 py-4">التاريخ</th>
                <th className="px-6 py-4 text-center">إجراءات</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={4} className="px-6 py-10 text-center"><div className="animate-spin h-6 w-6 border-2 border-blue-600 border-t-transparent rounded-full mx-auto"></div></td></tr>
              ) : notifications.length === 0 ? (
                <tr><td colSpan={4} className="px-6 py-10 text-center text-gray-400">لا توجد إشعارات حالياً</td></tr>
              ) : notifications.map((item) => (
                <tr key={item.id} className="border-b border-gray-100 table-row">
                  <td className="px-6 py-4 font-medium text-gray-900">{item.title}</td>
                  <td className="px-6 py-4 truncate max-w-xs">{item.body}</td>
                  <td className="px-6 py-4" dir="ltr">{new Date(item.createdAt).toLocaleString("ar-IQ")}</td>
                  <td className="px-6 py-4 text-center">
                    <button onClick={() => handleDelete(item.id)} className="text-red-500 hover:text-red-700 p-1 bg-red-50 rounded-lg transition-colors">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                    </button>
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
