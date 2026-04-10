const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3003';
const API_KEY = process.env.NEXT_PUBLIC_API_KEY || 'noon_directory_api_key_2024_secure';

export async function apiGet(path: string) {
  const res = await fetch(`${API_URL}${path}`, {
    headers: { 'x-api-key': API_KEY },
    credentials: 'include',
    cache: 'no-store',
  });
  if (!res.ok) throw new Error(`API Error: ${res.status}`);
  return res.json();
}

export async function apiPost(path: string, body?: any) {
  const res = await fetch(`${API_URL}${path}`, {
    method: 'POST',
    headers: { 'x-api-key': API_KEY, 'Content-Type': 'application/json' },
    credentials: 'include',
    body: body ? JSON.stringify(body) : undefined,
  });
  if (!res.ok) throw new Error(`API Error: ${res.status}`);
  return res.json();
}

export async function apiPatch(path: string, body?: any) {
  const res = await fetch(`${API_URL}${path}`, {
    method: 'PATCH',
    headers: { 'x-api-key': API_KEY, 'Content-Type': 'application/json' },
    credentials: 'include',
    body: body ? JSON.stringify(body) : undefined,
  });
  if (!res.ok) throw new Error(`API Error: ${res.status}`);
  return res.json();
}

export async function apiDelete(path: string) {
  const res = await fetch(`${API_URL}${path}`, {
    method: 'DELETE',
    headers: { 'x-api-key': API_KEY },
    credentials: 'include',
  });
  if (!res.ok) throw new Error(`API Error: ${res.status}`);
  return res.json();
}

export async function apiUpload(path: string, formData: FormData) {
  const res = await fetch(`${API_URL}${path}`, {
    method: 'POST',
    headers: { 'x-api-key': API_KEY },
    credentials: 'include',
    body: formData,
  });
  if (!res.ok) throw new Error(`API Error: ${res.status}`);
  return res.json();
}

export async function login(username: string, password: string) {
  const res = await fetch(`${API_URL}/auth/signin`, {
    method: 'POST',
    headers: { 'x-api-key': API_KEY, 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify({ username, password }),
  });
  if (!res.ok) throw new Error('Invalid credentials');
  return res.json();
}

export const CATEGORIES: Record<string, string> = {
  INSTITUTE: 'معاهد تقوية',
  PHYSICAL_ACTIVITY: 'أنشطة بدنية',
  KINDERGARTEN: 'رياض الأطفال',
  PRIVATE_SCHOOL: 'مدارس أهلية',
  TEACHER: 'أساتذة',
  LIBRARY: 'مكتبات',
  UNIFORM: 'الزي المدرسي',
  SMART_TOYS: 'ألعاب الذكاء',
  HEALTH_DENTAL: 'أطباء أسنان',
  HEALTH_PEDIATRIC: 'دكاترة أطفال',
  HEALTH_SPECIALIST: 'أخصائيين',
};

export const PROVINCES = [
  'بغداد - الرصافة الأولى', 'بغداد - الرصافة الثانية', 'بغداد - الرصافة الثالثة',
  'بغداد - الكرخ الأولى', 'بغداد - الكرخ الثانية',
  'البصرة', 'نينوى', 'أربيل',
  'النجف', 'كربلاء', 'ذي قار', 'بابل', 'الأنبار',
  'ديالى', 'كركوك', 'صلاح الدين', 'واسط', 'ميسان',
  'المثنى', 'القادسية', 'دهوك', 'السليمانية',
];

export const UPLOADS_URL = `${API_URL}/uploads`;
