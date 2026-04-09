"use client";
import { useEffect, useState } from "react";
import { apiGet, apiDelete, apiPost, apiPatch, apiUpload, CATEGORIES, PROVINCES } from "@/lib/api";

export default function JobOffersPage() {
  const [offers, setOffers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [editId, setEditId] = useState<string | null>(null);

  const initialForm = {
    companyName: "",
    jobTitle: "",
    category: "INSTITUTE",
    province: PROVINCES[0],
    description: "",
    requirements: "",
    salaryRange: "",
    contactPhone: "",
    contactEmail: "",
  };

  // Form State
  const [formData, setFormData] = useState(initialForm);

  const loadOffers = () => {
    setLoading(true);
    let url = "/manager/job-offer?take=100";
    if (selectedCategory !== 'ALL') {
      url += `&category=${selectedCategory}`;
    }
    
    apiGet(url)
      .then((res) => setOffers(res.data || []))
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  };

  useEffect(() => { loadOffers(); }, [selectedCategory]);

  const openNewModal = () => {
    setEditId(null);
    setFormData(initialForm);
    setSelectedFile(null);
    setShowModal(true);
  };

  const openEditModal = (item: any) => {
    setEditId(item.id);
    setFormData({
      companyName: item.companyName || "",
      jobTitle: item.jobTitle || "",
      category: item.category || "INSTITUTE",
      province: item.province || PROVINCES[0],
      description: item.description || "",
      requirements: item.requirements || "",
      salaryRange: item.salaryRange || "",
      contactPhone: item.contactPhone || "",
      contactEmail: item.contactEmail || "",
    });
    setSelectedFile(null);
    setShowModal(true);
  };

  const handleApprove = async (id: string) => {
    try {
      await apiPatch(`/manager/job-offer/${id}/approve`);
      loadOffers();
    } catch { alert("خطأ في الموافقة"); }
  };

  const handleReject = async (id: string) => {
    try {
      await apiPatch(`/manager/job-offer/${id}/reject`);
      loadOffers();
    } catch { alert("خطأ في الرفض"); }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("هل أنت متأكد من الحذف؟")) return;
    try {
      await apiDelete(`/manager/job-offer/${id}`);
      loadOffers();
    } catch { alert("خطأ في الحذف"); }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.companyName || !formData.jobTitle || !formData.province) {
      return alert("يرجى ملء الحقول الأساسية");
    }

    try {
      let targetId = editId;

      if (editId) {
        // Update existing
        await apiPatch(`/manager/job-offer/${editId}`, formData);
      } else {
        // 1. Create new (Submit to public endpoint which sets it to PENDING by default or manager endpoint)
        // Since we are creating from dashboard, we can use public then approve
        const res = await apiPost("/public/job-offer", formData);
        targetId = res?.id || res?.data?.id;
        
        if (targetId) {
          // Immediately approve it 
          await apiPatch(`/manager/job-offer/${targetId}/approve`);
        }
      }

      if (targetId && selectedFile) {
        const fileData = new FormData();
        fileData.append("logo", selectedFile);
        await apiUpload(`/manager/job-offer/${targetId}/logo`, fileData);
      }
      
      setShowModal(false);
      setFormData(initialForm);
      setSelectedFile(null);
      setEditId(null);
      loadOffers();
    } catch (e) {
      console.error(e);
      alert("خطأ في الحفظ (يرجى التأكد من إعادة تشغيل API إذا لزم الأمر)");
    }
  };

  const StatusBadge = ({ status }: { status: string }) => {
    switch (status) {
      case 'APPROVED': return <span className="text-xs bg-green-100 text-green-700 font-semibold px-2 py-1 rounded-md">مقبول ✔️</span>;
      case 'REJECTED': return <span className="text-xs bg-red-100 text-red-700 font-semibold px-2 py-1 rounded-md">مرفوض ❌</span>;
      default: return <span className="text-xs bg-yellow-100 text-yellow-700 font-semibold px-2 py-1 rounded-md">جديد ⏳</span>;
    }
  };

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">الوظائف المعروضة</h1>
          <p className="text-sm text-gray-500 mt-1">إعلانات الوظائف من المدارس والشركات (تظهر في قسم الوظائف بالموبايل)</p>
        </div>
        <button onClick={openNewModal} className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-xl shadow-sm transition flex items-center justify-center gap-2">
          إضافة إعلان توظيف +
        </button>
      </div>

      {/* Category Tabs */}
      <div className="flex overflow-x-auto border-b border-gray-200 mb-6 scrollbar-hide">
        <button
          onClick={() => setSelectedCategory('ALL')}
          className={`whitespace-nowrap px-6 py-3 text-sm font-bold transition-all duration-300 border-b-2 ${selectedCategory === 'ALL' ? 'border-purple-600 text-purple-700' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}`}
        >
          الكل
        </button>
        {Object.entries(CATEGORIES).map(([key, label]) => (
          <button
            key={key}
            onClick={() => setSelectedCategory(key)}
            className={`whitespace-nowrap px-6 py-3 text-sm font-bold transition-all duration-300 border-b-2 ${selectedCategory === key ? 'border-purple-600 text-purple-700' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}`}
          >
            {label}
          </button>
        ))}
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-right text-gray-500">
            <thead className="bg-gray-50 text-gray-700 text-xs uppercase font-semibold">
              <tr>
                <th className="px-6 py-4">الجهة المعلنة</th>
                <th className="px-6 py-4">المسمى الوظيفي</th>
                <th className="px-6 py-4">القسم</th>
                <th className="px-6 py-4">المحافظة</th>
                <th className="px-6 py-4">الحالة</th>
                <th className="px-6 py-4 text-center">إجراءات</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={6} className="px-6 py-10 text-center"><div className="animate-spin h-6 w-6 border-2 border-purple-600 border-t-transparent rounded-full mx-auto"></div></td></tr>
              ) : offers.length === 0 ? (
                <tr><td colSpan={6} className="px-6 py-10 text-center text-gray-400">لا توجد عروض توظيف في هذا القسم</td></tr>
              ) : offers.map((item) => (
                <tr key={item.id} className="border-b border-gray-100 hover:bg-gray-50 transition">
                  <td className="px-6 py-4 font-medium text-gray-900">{item.companyName}</td>
                  <td className="px-6 py-4 text-purple-700 font-medium">{item.jobTitle}</td>
                  <td className="px-6 py-4">
                    <span className="bg-gray-100 text-gray-600 px-2 py-1 rounded text-xs">{CATEGORIES[item.category] || item.category}</span>
                  </td>
                  <td className="px-6 py-4">{item.province}</td>
                  <td className="px-6 py-4"><StatusBadge status={item.isApproved} /></td>
                  <td className="px-6 py-4 text-center border-l border-gray-100">
                    <div className="flex items-center justify-center gap-2">
                      {item.isApproved === 'PENDING' && (
                        <>
                          <button onClick={() => handleApprove(item.id)} className="text-emerald-700 bg-emerald-50 hover:bg-emerald-100 px-3 py-1 rounded-md text-xs font-bold transition border border-emerald-200">قبول</button>
                          <button onClick={() => handleReject(item.id)} className="text-red-700 bg-red-50 hover:bg-red-100 px-3 py-1 rounded-md text-xs font-bold transition border border-red-200">رفض</button>
                        </>
                      )}
                      <button onClick={() => openEditModal(item)} className="text-blue-500 hover:text-blue-700 p-2 rounded-lg hover:bg-blue-50 transition" title="تعديل">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg>
                      </button>
                      <button onClick={() => handleDelete(item.id)} className="text-red-400 hover:text-red-600 p-2 rounded-lg hover:bg-red-50 transition" title="حذف">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* CREATE MODAL */}
      {showModal && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="bg-white rounded-2xl w-full max-w-2xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh]">
            <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
              <h3 className="text-lg font-bold text-gray-800">{editId ? 'تعديل الوظيفة' : 'إضافة إعلان توظيف جديد'}</h3>
              <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-gray-600 bg-gray-100 hover:bg-gray-200 p-2 rounded-lg transition">✖</button>
            </div>
            
            <div className="p-6 overflow-y-auto">
              <form id="offerForm" onSubmit={handleSubmit} className="space-y-5">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1">لوكو المدرسة/الشركة (اختياري)</label>
                    <input type="file" accept="image/*" className="w-full border-gray-300 rounded-xl shadow-sm focus:border-blue-500 focus:ring-blue-500 text-sm px-4 py-2 bg-gray-50 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                      onChange={e => setSelectedFile(e.target.files ? e.target.files[0] : null)} />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1">الجهة المعلنة (المدرسة/الشركة) <span className="text-red-500">*</span></label>
                    <input required type="text" className="w-full border-gray-300 rounded-xl shadow-sm focus:border-blue-500 focus:ring-blue-500 text-sm px-4 py-2.5 bg-gray-50"
                      value={formData.companyName} onChange={e => setFormData({ ...formData, companyName: e.target.value })} />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1">المسمى الوظيفي <span className="text-red-500">*</span></label>
                    <input required type="text" className="w-full border-gray-300 rounded-xl shadow-sm focus:border-blue-500 focus:ring-blue-500 text-sm px-4 py-2.5 bg-gray-50"
                      placeholder="مثال: معلم رياضيات"
                      value={formData.jobTitle} onChange={e => setFormData({ ...formData, jobTitle: e.target.value })} />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1">تصنيف الوظيفة <span className="text-red-500">*</span></label>
                    <select className="w-full border-gray-300 rounded-xl shadow-sm focus:border-blue-500 focus:ring-blue-500 text-sm px-4 py-2.5 bg-gray-50"
                      value={formData.category} onChange={e => setFormData({ ...formData, category: e.target.value })}>
                      {Object.entries(CATEGORIES).map(([key, val]) => <option key={key} value={key}>{val}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1">المحافظة <span className="text-red-500">*</span></label>
                    <select className="w-full border-gray-300 rounded-xl shadow-sm focus:border-blue-500 focus:ring-blue-500 text-sm px-4 py-2.5 bg-gray-50"
                      value={formData.province} onChange={e => setFormData({ ...formData, province: e.target.value })}>
                      {PROVINCES.map(p => <option key={p} value={p}>{p}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1">الراتب (اختياري)</label>
                    <input type="text" className="w-full border-gray-300 rounded-xl shadow-sm focus:border-blue-500 focus:ring-blue-500 text-sm px-4 py-2.5 bg-gray-50"
                      placeholder="مثال: 500 إلى 700 ألف"
                      value={formData.salaryRange} onChange={e => setFormData({ ...formData, salaryRange: e.target.value })} />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1">رقم الهاتف (للتواصل)</label>
                    <input type="text" dir="ltr" className="w-full border-gray-300 rounded-xl shadow-sm focus:border-blue-500 focus:ring-blue-500 text-sm px-4 py-2.5 bg-gray-50 text-left"
                      value={formData.contactPhone} onChange={e => setFormData({ ...formData, contactPhone: e.target.value })} />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">الوصف والمتطلبات</label>
                  <textarea rows={4} className="w-full border-gray-300 rounded-xl shadow-sm focus:border-blue-500 focus:ring-blue-500 text-sm px-4 py-3 bg-gray-50"
                    placeholder="ضع هنا تفاصيل الوظيفة والشروط المطلوبة..."
                    value={formData.description} onChange={e => setFormData({ ...formData, description: e.target.value })}></textarea>
                </div>

              </form>
            </div>
            
            <div className="p-5 border-t border-gray-100 bg-gray-50 flex justify-end gap-3 rounded-b-2xl">
              <button onClick={() => setShowModal(false)} className="px-5 py-2.5 rounded-xl font-semibold text-gray-600 bg-white border border-gray-300 hover:bg-gray-50 transition">إلغاء</button>
              <button form="offerForm" type="submit" className="px-6 py-2.5 rounded-xl font-bold text-white bg-blue-600 hover:bg-blue-700 transition shadow-sm">حفظ ونشر</button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
