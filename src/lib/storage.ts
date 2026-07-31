import { supabase } from "@/integrations/supabase/client";

/** Buckets are private; links are created on demand and last 1 hour. */
export async function getSignedUrl(bucket: string, path: string, expiresIn = 3600) {
  const { data, error } = await supabase.storage.from(bucket).createSignedUrl(path, expiresIn);
  if (error) throw error;
  return data.signedUrl;
}

export async function openStoredFile(bucket: string, path: string) {
  const url = await getSignedUrl(bucket, path);
  window.open(url, "_blank", "noopener");
}
