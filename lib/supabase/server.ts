/**
 * Supabase Server Client (Server Components ve Server Actions için)
 * 
 * NEDEN AYRI BİR DOSYA?
 * - Next.js Server Components'te farklı bir Supabase client'ı kullanılır
 * - Server-side'da cookie'lerden session bilgisi alınır
 * - createServerClient, cookie'leri otomatik olarak yönetir
 */

import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

/**
 * Server Components için Supabase client oluşturur
 * 
 * @returns Supabase client instance
 * 
 * KULLANIM ÖRNEĞİ:
 * ```ts
 * // app/dashboard/page.tsx (Server Component)
 * import { createClient } from '@/lib/supabase/server';
 * 
 * export default async function Dashboard() {
 *   const supabase = await createClient();
 *   
 *   const { data: profile } = await supabase
 *     .from('profiles')
 *     .select('*')
 *     .single();
 *   
 *   return <div>{profile.full_name}</div>;
 * }
 * ```
 */
export async function createClient() {
  // Neden cookies() kullanıyoruz?
  // - Next.js'in cookies() fonksiyonu, server-side'da cookie'lere erişmemizi sağlar
  // - Supabase, session bilgisini cookie'lerde saklar
  // - createServerClient, bu cookie'leri okuyup otomatik olarak session'ı yönetir
  const cookieStore = await cookies();

  if (!process.env.NEXT_PUBLIC_SUPABASE_URL) {
    throw new Error('NEXT_PUBLIC_SUPABASE_URL bulunamadı! .env.local dosyasını kontrol edin.');
  }
  
  if (!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    throw new Error('NEXT_PUBLIC_SUPABASE_ANON_KEY bulunamadı! .env.local dosyasını kontrol edin.');
  }

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    {
      cookies: {
        // Neden getAll kullanıyoruz?
        // - Server Components'te sadece cookie'leri okumamız yeterli
        // - Cookie güncellemeleri middleware tarafından yapılır
        getAll() {
          return cookieStore.getAll();
        },
      },
    }
  );
}
