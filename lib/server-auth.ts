import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

export async function commissioner() {setAll(values: { name: string; value: string; options?: Parameters<typeof jar.set>[2] }[]) {
  for (const v of values) jar.set(v.name, v.value, v.options);
}
  const jar = await cookies();
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  const allowed = process.env.COMMISSIONER_EMAIL?.trim().toLowerCase();
  if (!url || !key || !allowed) return null;
  const supabase = createServerClient(url, key, {
    cookies: {
      getAll() { return jar.getAll(); },
      setAll(values: { name: string; value: string; options?: Parameters<typeof jar.set>[2] }[]) {
  for (const v of values) jar.set(v.name, v.value, v.options);
}
  });
  const { data: { user }, error } = await supabase.auth.getUser();
  return !error && user?.email?.toLowerCase() === allowed ? user : null;
}
