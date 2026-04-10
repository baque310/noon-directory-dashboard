"use client";
import { useEffect, useState } from "react";
import { apiGet, apiDelete, apiUpload, apiPatch, UPLOADS_URL } from "@/lib/api";

export default function StoriesPage() {
  const [stories, setStories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);

  const [showModal, setShowModal] = useState(false);
  const [editingStoryId, setEditingStoryId] = useState<string | null>(null);
  const [formData, setFormData] = useState({ title: "", advertiserName: "", priority: "1", link: "", duration: "15", expiresAt: "" });
  const [selectedThumbnail, setSelectedThumbnail] = useState<File | null>(null);
  const [selectedVideo, setSelectedVideo] = useState<File | null>(null);

  const loadStories = () => {
    setLoading(true);
    apiGet("/manager/story")
      .then((res) => setStories(res || []))
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  };

  useEffect(() => { loadStories(); }, []);

  const handleDelete = async (id: string) => {
    if (!confirm("هل أنت متأكد من حذف هذه الستوري؟")) return;
    try {
      await apiDelete(`/manager/story/${id}`);
      loadStories();
    } catch {
      alert("حدث خطأ أثناء الحذف");
    }
  };

  const handleEdit = (story: any) => {
    setEditingStoryId(story.id);
    setFormData({
      title: story.title || "",
      advertiserName: story.advertiserName || "",
      priority: story.priority?.toString() || "1",
      link: story.link || "",
      duration: story.duration?.toString() || "15",
      expiresAt: story.expiresAt ? story.expiresAt.split("T")[0] : "",
    });
    setSelectedThumbnail(null);
    setSelectedVideo(null);
    setShowModal(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setUploading(true);

    try {
      if (editingStoryId) {
        const updateData: any = {
          title: formData.title,
          advertiserName: formData.advertiserName,
          link: formData.link,
          priority: parseInt(formData.priority) || 1,
          duration: parseInt(formData.duration) || 15,
          expiresAt: formData.expiresAt || null,
        };
        await apiPatch(`/manager/story/${editingStoryId}`, updateData);
      } else {
        if (!selectedThumbnail || !selectedVideo) {
          alert("الرجاء اختيار صورة الغلاف ومقطع الفيديو");
          setUploading(false);
          return;
        }
        const data = new FormData();
        data.append("thumbnail", selectedThumbnail);
        data.append("video", selectedVideo);
        data.append("title", formData.title);
        if (formData.advertiserName) data.append("advertiserName", formData.advertiserName);
        if (formData.link) data.append("link", formData.link);
        data.append("priority", formData.priority);
        data.append("duration", formData.duration);
        if (formData.expiresAt) data.append("expiresAt", formData.expiresAt);
        await apiUpload("/manager/story", data);
      }

      resetForm();
      loadStories();
    } catch (err: any) {
      alert("حدث خطأ أثناء الحفظ:\n" + (err.message || err.toString()));
      console.error(err);
    } finally {
      setUploading(false);
    }
  };

  const resetForm = () => {
    setShowModal(false);
    setEditingStoryId(null);
    setSelectedThumbnail(null);
    setSelectedVideo(null);
    setFormData({ title: "", advertiserName: "", priority: "1", link: "", duration: "15", expiresAt: "" });
  };

  const toggleActive = async (story: any) => {
    try {
      await apiPatch(`/manager/story/${story.id}`, {
        isActive: story.isActive === "TRUE" ? "FALSE" : "TRUE",
      });
      loadStories();
    } catch {
      alert("حدث خطأ");
    }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">إدارة الستوريات</h1>
          <p className="text-sm text-gray-500 mt-1">فيديوهات إعلانية قصيرة تظهر أسفل البنرات الأفقية في تطبيق الموبايل</p>
        </div>
        <button onClick={() => setShowModal(true)} className="bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 text-white px-4 py-2 rounded-xl text-sm font-semibold transition-all flex items-center gap-2 shadow-lg">
          <span>🎬</span> إضافة ستوري
        </button>
      </div>

      {loading ? (
        <div className="bg-white rounded-2xl p-10 flex justify-center shadow-sm">
          <div className="animate-spin h-8 w-8 border-2 border-purple-500 border-t-transparent rounded-full"></div>
        </div>
      ) : stories.length === 0 ? (
        <div className="bg-white rounded-2xl p-16 text-center shadow-sm border border-gray-200">
          <div className="text-5xl mb-4">🎬</div>
          <h2 className="text-gray-700 font-semibold mb-1 text-lg">لا توجد ستوريات</h2>
          <p className="text-sm text-gray-500">قم بإضافة أول ستوري فيديو ليظهر في تطبيق الموبايل</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          {stories.map((item) => (
            <div key={item.id} className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden group flex flex-col">
              {/* Thumbnail */}
              <div className="h-44 bg-gray-100 relative group-hover:opacity-90 transition-opacity">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={`${UPLOADS_URL}/${item.thumbnail}`} alt={item.title || "ستوري"} className="w-full h-full object-cover" />
                {/* Play icon overlay */}
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                  <div className="bg-black/40 rounded-full p-3">
                    <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z" /></svg>
                  </div>
                </div>
                {/* Hover actions */}
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center gap-3 transition-opacity">
                  <button onClick={() => handleEdit(item)} className="bg-blue-500 hover:bg-blue-600 text-white p-2.5 rounded-full shadow-lg">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg>
                  </button>
                  <button onClick={() => toggleActive(item)} className={`${item.isActive === 'TRUE' ? 'bg-yellow-500 hover:bg-yellow-600' : 'bg-green-500 hover:bg-green-600'} text-white p-2.5 rounded-full shadow-lg`}>
                    {item.isActive === 'TRUE' ? '⏸' : '▶'}
                  </button>
                  <button onClick={() => handleDelete(item.id)} className="bg-red-500 hover:bg-red-600 text-white p-2.5 rounded-full shadow-lg">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                  </button>
                </div>
                {/* Badges */}
                <div className="absolute top-2 right-2 flex flex-col gap-1 items-end">
                  <span className="bg-purple-600 text-white text-[10px] px-2 py-0.5 rounded-full font-bold shadow">{item.duration || 15}ث</span>
                  <span className="bg-black/60 text-white text-[10px] px-2 py-0.5 rounded-full">ترتيب: {item.priority}</span>
                </div>
                <div className="absolute bottom-2 left-2">
                  <span className="bg-black/60 text-white text-[10px] px-2 py-0.5 rounded-full">👁 {item.viewCount || 0}</span>
                </div>
              </div>
              {/* Info */}
              <div className="p-3 flex flex-col justify-between flex-1">
                <div>
                  <h3 className="font-semibold text-gray-800 text-sm truncate">{item.title || "بدون عنوان"}</h3>
                  {item.advertiserName && (
                    <p className="text-xs text-gray-500 mt-0.5">المُعلن: {item.advertiserName}</p>
                  )}
                </div>
                <div className="mt-2 flex items-center justify-between text-xs">
                  {item.isActive === 'TRUE' ? (
                    <span className="text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded font-bold">نشط ✔️</span>
                  ) : (
                    <span className="text-red-600 bg-red-50 px-2 py-0.5 rounded font-bold">متوقف ✖️</span>
                  )}
                  {item.expiresAt && (
                    <span className="text-gray-400">{new Date(item.expiresAt).toLocaleDateString("ar-IQ")}</span>
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
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gradient-to-r from-pink-50 to-purple-50">
              <h3 className="font-bold text-gray-800">{editingStoryId ? "تعديل ستوري" : "إضافة ستوري جديد"}</h3>
              <button disabled={uploading} onClick={resetForm} className="text-gray-400 hover:text-gray-600">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[80vh] overflow-y-auto">
              {!editingStoryId && (
                <>
                  <div>
                    <label className="block text-xs font-semibold text-gray-600 mb-1">صورة الغلاف (Thumbnail) *</label>
                    <div className="relative border-2 border-dashed border-pink-300 rounded-xl p-4 text-center hover:bg-pink-50 transition-colors">
                      <input required type="file" accept="image/*" onChange={(e) => setSelectedThumbnail(e.target.files?.[0] || null)} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" />
                      {selectedThumbnail ? (
                        <div className="text-sm font-medium text-pink-600">📷 {selectedThumbnail.name}</div>
                      ) : (
                        <div className="text-sm text-gray-500 flex flex-col items-center gap-1">
                          <span className="text-2xl">📷</span>
                          <span>اضغط لاختيار صورة الغلاف</span>
                        </div>
                      )}
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-600 mb-1">مقطع الفيديو (MP4) *</label>
                    <div className="relative border-2 border-dashed border-purple-300 rounded-xl p-4 text-center hover:bg-purple-50 transition-colors">
                      <input required type="file" accept="video/mp4,video/quicktime,video/webm" onChange={(e) => setSelectedVideo(e.target.files?.[0] || null)} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" />
                      {selectedVideo ? (
                        <div className="text-sm font-medium text-purple-600">🎬 {selectedVideo.name}</div>
                      ) : (
                        <div className="text-sm text-gray-500 flex flex-col items-center gap-1">
                          <span className="text-2xl">🎬</span>
                          <span>اضغط لاختيار ملف الفيديو</span>
                        </div>
                      )}
                    </div>
                  </div>
                </>
              )}

              {editingStoryId && (
                <div className="bg-yellow-50 text-yellow-800 text-xs p-3 rounded-lg border border-yellow-200">
                  <span className="font-bold">ملاحظة:</span> لا يمكن تغيير الفيديو أو الصورة عند التعديل. لتغييرهما، احذف هذه الستوري وأنشئ واحدة جديدة.
                </div>
              )}

              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1">العنوان *</label>
                <input required type="text" value={formData.title} onChange={(e) => setFormData({ ...formData, title: e.target.value })} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm bg-gray-50 focus:bg-white transition-colors" placeholder="مثال: عرض خاص من أكاديمية نون" />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1">اسم المُعلن</label>
                <input type="text" value={formData.advertiserName} onChange={(e) => setFormData({ ...formData, advertiserName: e.target.value })} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm bg-gray-50 focus:bg-white transition-colors" placeholder="مثال: أكاديمية نون" />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1">المدة (ثانية)</label>
                  <input type="number" min="5" max="60" value={formData.duration} onChange={(e) => setFormData({ ...formData, duration: e.target.value })} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm bg-gray-50 focus:bg-white transition-colors" dir="ltr" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1">الأولوية (رقم)</label>
                  <input type="number" min="1" value={formData.priority} onChange={(e) => setFormData({ ...formData, priority: e.target.value })} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm bg-gray-50 focus:bg-white transition-colors" dir="ltr" />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1">رابط خارجي (اختياري)</label>
                <input type="text" value={formData.link} onChange={(e) => setFormData({ ...formData, link: e.target.value })} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm bg-gray-50 focus:bg-white transition-colors" placeholder="رابط صفحة أو واتساب" dir="ltr" />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1">تاريخ الانتهاء (اختياري)</label>
                <input type="date" value={formData.expiresAt} onChange={(e) => setFormData({ ...formData, expiresAt: e.target.value })} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm bg-gray-50 focus:bg-white transition-colors" dir="ltr" />
                <p className="text-[10px] text-gray-400 mt-1">اتركه فارغاً ليبقى الإعلان مفعلاً بشكل دائم</p>
              </div>

              <div className="pt-4 flex gap-3">
                <button disabled={uploading} type="submit" className="flex-1 bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 disabled:from-pink-300 disabled:to-purple-300 text-white py-2.5 rounded-lg text-sm font-semibold transition-all flex items-center justify-center shadow-lg">
                  {uploading ? (
                    <span className="flex items-center gap-2">
                      <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" /></svg>
                      جاري الرفع...
                    </span>
                  ) : (editingStoryId ? "حفظ التعديلات" : "🎬 رفع الستوري")}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
