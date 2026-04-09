"use client";
import { useEffect, useState } from "react";
import { apiGet, apiDelete, apiPost, apiPatch, apiUpload, CATEGORIES, PROVINCES, UPLOADS_URL } from "@/lib/api";

export default function ListingsPage() {
  const [listings, setListings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  
  const initialForm = {
    name: "", category: "INSTITUTE", province: PROVINCES[0],
    phone: "", description: "", address: "", sendNotification: false
  };
  const [formData, setFormData] = useState(initialForm);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [selectedImages, setSelectedImages] = useState<File[]>([]);

  const [activeTab, setActiveTab] = useState<string>("ALL");

  const loadListings = () => {
    setLoading(true);
    apiGet("/manager/directory-listing?take=500")
      .then((res) => setListings(res.data || []))
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  };

  useEffect(() => { loadListings(); }, []);

  const handleDelete = async (id: string) => {
    if (!confirm("هل أنت متأكد من حذف هذا العنصر؟")) return;
    try {
      await apiDelete(`/manager/directory-listing/${id}`);
      loadListings();
    } catch (err) {
      alert("حدث خطأ أثناء الحذف");
    }
  };

  const handleEdit = (item: any) => {
    setFormData({
      name: item.name || "",
      category: item.category || "INSTITUTE",
      province: item.province || PROVINCES[0],
      phone: item.phone || "",
      description: item.description || "",
      address: item.address || "",
      sendNotification: false // Don't send notification on edit by default
    });
    setEditId(item.id);
    setSelectedFile(null);
    setSelectedImages([]);
    setShowModal(true);
  };

  const openNewModal = () => {
    setFormData(initialForm);
    setEditId(null);
    setSelectedFile(null);
    setSelectedImages([]);
    setShowModal(true);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
    }
  };

  const handleImagesChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setSelectedImages(Array.from(e.target.files));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      let targetId = editId;
      
      if (editId) {
        const { sendNotification, ...patchData } = formData;
        await apiPatch(`/manager/directory-listing/${editId}`, patchData);
      } else {
        const res = await apiPost("/manager/directory-listing", formData);
        targetId = res.id || res.data?.id;
      }

      if (selectedFile && targetId) {
        const fileData = new FormData();
        fileData.append("logo", selectedFile);
        await apiUpload(`/manager/directory-listing/${targetId}/logo`, fileData);
      }

      if (selectedImages.length > 0 && targetId) {
        for (const img of selectedImages) {
          const imgData = new FormData();
          imgData.append("image", img);
          await apiUpload(`/manager/directory-listing/${targetId}/image`, imgData);
        }
      }

      setShowModal(false);
      setFormData(initialForm);
      setEditId(null);
      setSelectedFile(null);
      setSelectedImages([]);
      loadListings();
    } catch (err) {
      alert("حدث خطأ أثناء الحفظ");
    }
  };

  const filteredListings = activeTab === "ALL" 
    ? listings 
    : listings.filter(item => item.category === activeTab);

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">الدليل</h1>
          <p className="text-sm text-gray-500 mt-1">إدارة عناصر دليل نون</p>
        </div>
        <button onClick={openNewModal} className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-xl text-sm font-semibold transition-colors flex items-center gap-2">
          <span>+</span> إضافة عنصر جديد
        </button>
      </div>

      {/* Categories Tabs */}
      <div className="mb-6 bg-white p-2 rounded-xl shadow-sm border border-gray-200 overflow-x-auto whitespace-nowrap hide-scrollbar flex gap-2 w-full">
        <button 
          onClick={() => setActiveTab("ALL")}
          className={`px-4 py-2 rounded-lg text-sm font-semibold transition-colors flex-shrink-0 ${activeTab === "ALL" ? "bg-blue-50 text-blue-600" : "text-gray-500 hover:bg-gray-50"}`}
        >
          الكل
        </button>
        {Object.entries(CATEGORIES).map(([key, label]) => (
          <button 
            key={key}
            onClick={() => setActiveTab(key)}
            className={`px-4 py-2 rounded-lg text-sm font-semibold transition-colors flex-shrink-0 ${activeTab === key ? "bg-blue-50 text-blue-600" : "text-gray-500 hover:bg-gray-50"}`}
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
                <th className="px-6 py-4">صورة</th>
                <th className="px-6 py-4">الاسم</th>
                <th className="px-6 py-4">القسم</th>
                <th className="px-6 py-4">المحافظة</th>
                <th className="px-6 py-4">رقم الهاتف</th>
                <th className="px-6 py-4">المشاهدات</th>
                <th className="px-6 py-4">التاريخ</th>
                <th className="px-6 py-4 text-center">إجراءات</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={8} className="px-6 py-10 text-center"><div className="animate-spin h-6 w-6 border-2 border-blue-600 border-t-transparent rounded-full mx-auto"></div></td></tr>
              ) : filteredListings.length === 0 ? (
                <tr><td colSpan={8} className="px-6 py-10 text-center text-gray-400">لا توجد بيانات حالياً</td></tr>
              ) : filteredListings.map((item) => (
                <tr key={item.id} className="border-b border-gray-100 table-row">
                  <td className="px-6 py-4">
                    {item.logo ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={`${UPLOADS_URL}/${item.logo}`} alt={item.name} className="w-10 h-10 rounded-lg object-cover border border-gray-200" />
                    ) : (
                      <div className="w-10 h-10 rounded-lg bg-gray-100 border border-gray-200 flex items-center justify-center text-gray-400 text-xs">لا يوجد</div>
                    )}
                  </td>
                  <td className="px-6 py-4 font-medium text-gray-900">{item.name}</td>
                  <td className="px-6 py-4"><span className="badge badge-info">{CATEGORIES[item.category] || item.category}</span></td>
                  <td className="px-6 py-4">{item.province}</td>
                  <td className="px-6 py-4" dir="ltr">{item.phone || "-"}</td>
                  <td className="px-6 py-4"><span className="badge badge-success text-[10px]">{item.viewCount}👀</span></td>
                  <td className="px-6 py-4 text-xs text-gray-500 whitespace-nowrap">{new Date(item.createdAt).toLocaleDateString("ar-IQ", { year:'numeric', month:'short', day:'numeric' })}</td>
                  <td className="px-6 py-4 text-center flex justify-center gap-2">
                    <button onClick={() => handleEdit(item)} className="text-blue-500 hover:text-blue-700 p-1 bg-blue-50 rounded-lg transition-colors" title="تعديل">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
                    </button>
                    <button onClick={() => handleDelete(item.id)} className="text-red-500 hover:text-red-700 p-1 bg-red-50 rounded-lg transition-colors" title="حذف">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add / Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg overflow-hidden animate-in fade-in zoom-in-95 duration-200 max-h-[90vh] flex flex-col">
            <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50 shrink-0">
              <h3 className="font-bold text-gray-800">{editId ? "تعديل العنصر" : "إضافة عنصر جديد"}</h3>
              <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-gray-600"><svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg></button>
            </div>
            <div className="overflow-y-auto p-6 space-y-4">
              <form id="listing-form" onSubmit={handleSubmit} className="space-y-4">
                
                {/* Logo Upload */}
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1">الصورة الرئيسية / الشعار (اختياري)</label>
                  <input type="file" accept="image/*" onChange={handleFileChange} className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 cursor-pointer" />
                  {selectedFile && <p className="text-[10px] text-green-600 mt-1">تم اختيار صورة: {selectedFile.name}</p>}
                </div>

                {/* Multiple Images Upload */}
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1">صور إضافية للإعلان (يُمكنك تحديد عدة صور)</label>
                  <input type="file" accept="image/*" multiple onChange={handleImagesChange} className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-sm file:font-semibold file:bg-gray-100 file:text-gray-700 hover:file:bg-gray-200 cursor-pointer" />
                  {selectedImages.length > 0 && <p className="text-[10px] text-green-600 mt-1">تم اختيار {selectedImages.length} صور</p>}
                </div>

                <div><label className="block text-xs font-semibold text-gray-600 mb-1">الاسم</label><input required type="text" value={formData.name} onChange={e=>setFormData({...formData, name: e.target.value})} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm bg-gray-50 focus:bg-white transition-colors" /></div>
                <div className="grid grid-cols-2 gap-4">
                  <div><label className="block text-xs font-semibold text-gray-600 mb-1">القسم</label><select required value={formData.category} onChange={e=>setFormData({...formData, category: e.target.value})} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm bg-gray-50 focus:bg-white transition-colors">{Object.entries(CATEGORIES).map(([val, label]) => <option key={val} value={val}>{label}</option>)}</select></div>
                  <div><label className="block text-xs font-semibold text-gray-600 mb-1">المحافظة</label><select required value={formData.province} onChange={e=>setFormData({...formData, province: e.target.value})} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm bg-gray-50 focus:bg-white transition-colors">{PROVINCES.map(p => <option key={p} value={p}>{p}</option>)}</select></div>
                </div>
                <div><label className="block text-xs font-semibold text-gray-600 mb-1">رقم الهاتف</label><input type="text" value={formData.phone} onChange={e=>setFormData({...formData, phone: e.target.value})} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm bg-gray-50 focus:bg-white transition-colors" dir="ltr" /></div>
                
                {/* Address Field */}
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1">الموقع (رابط خرائط جوجل أو عنوان مفصل)</label>
                  <input type="text" value={formData.address} onChange={e=>setFormData({...formData, address: e.target.value})} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm bg-gray-50 focus:bg-white transition-colors" placeholder="مثال: بغداد - الكرادة - شارع 62" />
                </div>

                <div><label className="block text-xs font-semibold text-gray-600 mb-1">الوصف</label><textarea rows={3} value={formData.description} onChange={e=>setFormData({...formData, description: e.target.value})} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm bg-gray-50 focus:bg-white transition-colors resize-none" placeholder="اكتب تفاصيل إضافية هنا..."></textarea></div>
                
                {/* Notification Toggle (Only show on Create) */}
                {!editId && (
                  <div className="flex items-center gap-3 p-3 bg-blue-50 rounded-lg border border-blue-100">
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input type="checkbox" className="sr-only peer" checked={formData.sendNotification} onChange={e => setFormData({...formData, sendNotification: e.target.checked})} />
                      <div className="w-9 h-5 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-blue-600"></div>
                    </label>
                    <div>
                      <h4 className="text-sm font-semibold text-blue-900">إرسال إشعار للمستخدمين</h4>
                      <p className="text-xs text-blue-700">سيتم تنبيه جميع مستخدمي التطبيق بهذا الإعلان الجديد</p>
                    </div>
                  </div>
                )}
              </form>
            </div>
            <div className="pt-4 p-6 border-t border-gray-100 flex gap-3 shrink-0 bg-white rounded-b-2xl">
              <button form="listing-form" type="submit" className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-lg text-sm font-semibold transition-colors">
                {editId ? "حفظ التعديلات" : "حفظ العنصر"}
              </button>
              <button type="button" onClick={() => setShowModal(false)} className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 py-2 rounded-lg text-sm font-semibold transition-colors">إلغاء</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
