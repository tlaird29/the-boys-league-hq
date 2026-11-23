
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

export async function commissioner() {
  const jar = await cookies();

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  const allowed = process.env.COMMISSIONER_EMAIL
    ?.trim()
    .toLowerCase();

  if (!url || !key || !allowed) {
    return null;
  }

  const supabase = createServerClient(url, key, {
    cookies: {
      getAll() {
        return jar.getAll();
      },

      setAll(
        values: {
          name: string;
          value: string;
          options?: Parameters<typeof jar.set>[2];
        }[]
      ) {
        for (const value of values) {
          try {
            jar.set(
              value.name,
              value.value,
              value.options
            );
          } catch {
            // Server Components cannot write cookies.
            // Supabase session refresh may attempt
            // this while rendering a protected page.
            // Cookie updates are handled when allowed
            // by Next.js request context.
          }
        }
      },
    },
  });

  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error || !user?.email) {
    return null;
  }

  return user.email.toLowerCase() === allowed
    ? user
    : null;
}
