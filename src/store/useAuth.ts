import { create } from 'zustand';
import { supabase } from '@/lib/supabase';

// Foydalanuvchi profilining strukturasi
interface UserProfile {
  id: string;
  full_name: string;
  role: 'student' | 'teacher' | 'parent' | 'director' | 'seller';
  private_points: number;
  class_id?: string;
}

interface AuthStore {
  user: UserProfile | null;
  loading: boolean;
  error: string | null;
  login: (id: string, password: string) => Promise<{ success: boolean; role?: string }>;
  logout: () => void;
}

export const useAuth = create<AuthStore>((set) => ({
  user: null,
  loading: false,
  error: null,

  login: async (id: string, password: string) => {
    set({ loading: true, error: null });
    try {
      // 1. Supabase 'profiles' jadvalidan foydalanuvchini ID orqali qidiramiz
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', id)
        .single();

      if (error || !data) {
        set({ error: "Bunday ID raqami topilmadi!", loading: false });
        return { success: false };
      }

      // 2. Parolni tekshiramiz (Sizda parollar bazada ochiq matn ko'rinishida ekan)
      if (data.password !== password) {
        set({ error: "Parol noto'g'ri!", loading: false });
        return { success: false };
      }

      // 3. Muvaffaqiyatli bo'lsa, foydalanuvchi ma'lumotlarini store'ga saqlaymiz
      set({ user: data as UserProfile, loading: false });
      return { success: true, role: data.role };

    } catch (err) {
      set({ error: "Tizimda kutilmagan xatolik!", loading: false });
      return { success: false };
    }
  },

  logout: () => set({ user: null, error: null }),
}));
