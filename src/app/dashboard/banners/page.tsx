"use client";
import { useEffect, useState } from "react";
import { apiGet, apiDelete, apiUpload, apiPatch, UPLOADS_URL } from "@/lib/api";

export default function BannersPage() {
  const [banners, setBanners] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);

  const [showModal, setShowModal] = useState(false);
  const [editingBannerId, setEditingBannerId] = useState<string | null>(null);
  const [formData, setFormData] = useState({ priority: "1", title: "", isVertical: "false", description: "", link: "" });
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const loadBanners = () => {
    setLoading(true);
    apiGet("/manager/banner")
      .then((res) => setBanners(res || []))
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  };

  useEffect(() => { loadBanners(); }, []);

  const handleDelete = async (id: string) => {
    if (!confirm("هل أنت متأكد من حذف هذا البنر؟")) return;
    try {
      await apiDelete(`/manager/banner/${id}`);
      loadBanners();
    } catch {
      alert("حدث خطأ أثناء الحذف");
    }
  };

  const handleEdit = (banner: any) => {
    setEditingBannerId(banner.id);
    setFormData({
      priority: banner.priority?.toString() || "1",
      title: banner.title || "",
      isVertical: banner.isVertical ? "true" : "false",
      description: banner.description || "",
      link: banner.link || "",
    });
    setSelectedFile(null);
    setShowModal(true);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) setSelectedFile(file);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    setUploading(true);

    try {
      if (editingBannerId) {
        // Editing Mode (Only details)
        const updateData = {
          title: formData.title,
          description: formData.description,
          link: formData.link,
          priority: parseInt(formData.priority) || 1,
          isVertical: formData.isVertical === "true",
        };
        await apiPatch(`/manager/banner/${editingBannerId}`, updateData);
      } else {
        // Creating Mode
        if (!selectedFile) {
          alert("الرجاء اختيار صورة البنر");
          setUploading(false);
          return;
        }
        const data = new FormData();
        data.append("url", selectedFile);
        if (formData.title) data.append("title", formData.title);
        if (formData.description) data.append("description", formData.description);
        if (formData.link) data.append("link", formData.link);
        data.append("priority", formData.priority);
        data.append("isVertical", formData.isVertical);
        await apiUpload("/manager/banner", data);
      }

      setShowModal(false);
      setEditingBannerId(null);
      setSelectedFile(null);
      setFormData({ priority: "1", title: "", isVertical: "false", description: "", link: "" });
      loadBanners();
    } catch (err: any) {
      alert("حدث خطأ أثناء الحفظ:\n" + (err.message || err.toString()));
      console.error(err);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">إدارة البنرات</h1>
          <p className="text-sm text-gray-500 mt-1">البنرات الإعلانية تظهر في أعلى ووسط تطبيق الموبايل بحسب التوجيه والأولوية</p>
        </div>
        <button onClick={() => setShowModal(true)} className="bg-amber-500 hover:bg-amber-600 text-white px-4 py-2 rounded-xl text-sm font-semibold transition-colors flex items-center gap-2">
          <span>+</span> إضافة بنر إعلان
        </button>
      </div>

      {loading ? (
        <div className="bg-white rounded-2xl p-10 flex justify-center shadow-sm">
          <div className="animate-spin h-8 w-8 border-2 border-amber-500 border-t-transparent rounded-full"></div>
        </div>
      ) : banners.length === 0 ? (
        <div className="bg-white rounded-2xl p-16 text-center shadow-sm border border-gray-200">
          <div className="text-4xl mb-3">🖼️</div>
          <h2 className="text-gray-700 font-semibold mb-1">لا توجد بنرات</h2>
          <p className="text-sm text-gray-500">قم برفع البنر الأول ليظهر في التطبيق</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {banners.map((item) => (
            <div key={item.id} className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden group flex flex-col">
              <div className="h-48 bg-gray-100 relative group-hover:opacity-90 transition-opacity">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={`${UPLOADS_URL}/${item.url}`} alt={item.title || "بنر"} className={`w-full h-full object-cover ${item.isVertical ? 'object-contain bg-gray-900' : ''}`} />
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center gap-4 transition-opacity">
                  <button onClick={() => handleEdit(item)} className="bg-blue-500 hover:bg-blue-600 text-white p-3 rounded-full shadow-lg transform scale-90 group-hover:scale-100 transition-all">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg>
                  </button>
                  <button onClick={() => handleDelete(item.id)} className="bg-red-500 hover:bg-red-600 text-white p-3 rounded-full shadow-lg transform scale-90 group-hover:scale-100 transition-all">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                  </button>
                </div>
                <div className="absolute top-2 right-2 flex flex-col gap-1 text-white text-xs font-bold items-end">
                  <span className="bg-black/60 px-2 py-1 rounded border border-white/20">الأولوية: {item.priority}</span>
                  {item.isVertical ? (
                    <span className="bg-purple-600 px-2 py-1 rounded border border-white/20">طولي (عمودي)</span>
                  ) : (
                    <span className="bg-blue-600 px-2 py-1 rounded border border-white/20">عرضي (أفقي)</span>
                  )}
                </div>
              </div>
              <div className="p-4 flex flex-col justify-between flex-1">
                <div>
                  <h3 className="font-semibold text-gray-800 truncate" title={item.title}>{item.title || "بدون عنوان"}</h3>
                  <p className="text-xs text-gray-500 mt-1">{new Date(item.createdAt).toLocaleDateString("ar-IQ")}</p>
                </div>
                <div className="mt-4 flex gap-2 items-center text-xs justify-between">
                  {item.isActive === 'TRUE' || item.isActive === true ? (
                    <span className="text-emerald-600 bg-emerald-50 px-2 py-1 rounded-md font-bold">نشط ✔️</span>
                  ) : (
                    <span className="text-red-600 bg-red-50 px-2 py-1 rounded-md font-bold">مخفي ✖️</span>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50">
              <h3 className="font-bold text-gray-800">{editingBannerId ? "تعديل إعلان" : "إضافة بنر إعلاني جديد"}</h3>
              <button disabled={uploading} onClick={() => { setShowModal(false); setEditingBannerId(null); setSelectedFile(null); setFormData({ priority: "1", title: "", isVertical: "false", description: "", link: "" }); }} className="text-gray-400 hover:text-gray-600">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[80vh] overflow-y-auto">
              {!editingBannerId && (
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1">صورة البنر *</label>
                  <div className="relative border-2 border-dashed border-gray-300 rounded-xl p-4 text-center hover:bg-gray-50 transition-colors">
                    <input required={!editingBannerId} type="file" accept="image/*" onChange={handleFileChange} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" />
                    {selectedFile ? (
                      <div className="text-sm font-medium text-blue-600">{selectedFile.name}</div>
                    ) : (
                      <div className="text-sm text-gray-500 flex flex-col items-center gap-1">
                        <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" /></svg>
                        <span>اضغط لاختيار صورة</span>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {editingBannerId && (
                <div className="bg-yellow-50 text-yellow-800 text-xs p-3 rounded-lg border border-yellow-200">
                  <span className="font-bold">ملاحظة:</span> لا يمكن تغيير الصورة الخاصة بالبنر عند التعديل، تغيير الصورة يقتضي مسح هذا الإعلان ورفع واحد جديد.
                </div>
              )}

              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-2">نوع وشكل الإعلان *</label>
                <div className="flex gap-4">
                  <label className="flex-1 cursor-pointer">
                    <input type="radio" name="orientation" value="false" checked={formData.isVertical === "false"} onChange={() => setFormData({ ...formData, isVertical: "false" })} className="peer sr-only" />
                    <div className="text-center p-3 border-2 border-gray-200 rounded-lg peer-checked:border-blue-500 peer-checked:bg-blue-50 transition-all text-sm font-semibold text-gray-700 peer-checked:text-blue-700">
                      عرضي (أفقي)
                      <div className="text-[10px] text-gray-400 mt-1">أعلى الشاشة</div>
                    </div>
                  </label>
                  <label className="flex-1 cursor-pointer">
                    <input type="radio" name="orientation" value="true" checked={formData.isVertical === "true"} onChange={() => setFormData({ ...formData, isVertical: "true" })} className="peer sr-only" />
                    <div className="text-center p-3 border-2 border-gray-200 rounded-lg peer-checked:border-purple-500 peer-checked:bg-purple-50 transition-all text-sm font-semibold text-gray-700 peer-checked:text-purple-700">
                      طولي (عمودي)
                      <div className="text-[10px] text-gray-400 mt-1">بين أقسام الدليل</div>
                    </div>
                  </label>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1">الاسم أو العنوان الرئيسي (مثال: د. قطر الندى)</label>
                <input type="text" value={formData.title} onChange={e => setFormData({ ...formData, title: e.target.value })} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm bg-gray-50 focus:bg-white transition-colors" placeholder="مثال: الدكتورة قطر الندى سمير" />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1">الوصف أو الاختصاص (يظهر تحت الاسم)</label>
                <input type="text" value={formData.description || ""} onChange={e => setFormData({ ...formData, description: e.target.value })} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm bg-gray-50 focus:bg-white transition-colors" placeholder="مثال: طب الجملة العصبية" />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1">الموقع أو المنطقة (يظهر بجوار أيقونة الخريطة)</label>
                <input type="text" value={formData.link || ""} onChange={e => setFormData({ ...formData, link: e.target.value })} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm bg-gray-50 focus:bg-white transition-colors" placeholder="مثال: بغداد - الكرخ" />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1">الأولوية (رقم) *</label>
                <input required type="number" min="1" value={formData.priority} onChange={e => setFormData({ ...formData, priority: e.target.value })} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm bg-gray-50 focus:bg-white transition-colors" placeholder="مثال: 1 للظهور أولاً" dir="ltr" />
                <p className="text-[10px] text-gray-400 mt-1">البنرات تترتب من الرقم الأصغر (1) إلى الأكبر</p>
              </div>

              <div className="pt-4 flex gap-3">
                <button disabled={uploading} type="submit" className="flex-1 bg-amber-500 hover:bg-amber-600 disabled:bg-amber-300 text-white py-2 rounded-lg text-sm font-semibold transition-colors flex items-center justify-center">
                  {uploading ? (
                    <span className="flex items-center gap-2">
                       <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/></svg>
                      جاري الحفظ...
                    </span>
                  ) : (editingBannerId ? "حفظ التعديلات" : "رفع البنر")}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
