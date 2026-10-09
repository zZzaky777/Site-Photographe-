import type { VercelRequest, VercelResponse } from "@vercel/node";
import { createClient } from "@supabase/supabase-js";
import { getDrive } from "./_drive";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader("Cache-Control", "no-store");
  res.setHeader("X-Content-Type-Options", "nosniff");
  if (req.method !== "GET") return res.status(405).json({ error: "Méthode non autorisée" });
  const slug = String(req.query.slug || "");
  if (!slug || slug.length > 120) return res.status(400).json({ error: "Lien de galerie invalide" });
  const url = process.env.VITE_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) return res.status(500).json({ error: "Configuration serveur Supabase manquante" });
  try {
    const db = createClient(url, key, { auth: { persistSession: false } });
    const { data: gallery, error } = await db.from("client_galleries").select("client_name,title,slug,drive_folder_id").eq("slug", slug).eq("published", true).maybeSingle();
    if (error) throw error;
    if (!gallery) return res.status(404).json({ error: "Cette galerie n’existe pas ou n’est plus disponible." });
    const drive = getDrive();
    const result = await drive.files.list({
      q: `'${gallery.drive_folder_id.replace(/'/g, "\\'")}' in parents and trashed = false and mimeType contains 'image/'`,
      fields: "files(id,name,mimeType,size,imageMediaMetadata(width,height))",
      pageSize: 1000,
      orderBy: "name",
    });
    const photos = (result.data.files || []).map(f => ({ id: f.id, name: f.name, width: f.imageMediaMetadata?.width, height: f.imageMediaMetadata?.height, url: `/api/gallery-image?slug=${encodeURIComponent(slug)}&id=${encodeURIComponent(f.id || "")}` }));
    return res.status(200).json({ gallery: { clientName: gallery.client_name, title: gallery.title }, photos });
  } catch (e: any) {
    console.error("gallery api error", e?.message || e);
    return res.status(500).json({ error: "Impossible de charger les photos. Vérifie que le dossier Drive est partagé avec le compte de service." });
  }
}
