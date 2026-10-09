import type { VercelRequest, VercelResponse } from "@vercel/node";
import { createClient } from "@supabase/supabase-js";
import { getDrive } from "./_drive";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== "GET") return res.status(405).end();
  const slug = String(req.query.slug || "");
  const id = String(req.query.id || "");
  if (!slug || !id || slug.length > 120 || id.length > 200) return res.status(400).end("Paramètres invalides");
  const url = process.env.VITE_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) return res.status(500).end("Configuration serveur manquante");
  try {
    const db = createClient(url, key, { auth: { persistSession: false } });
    const { data: gallery } = await db.from("client_galleries").select("drive_folder_id").eq("slug", slug).eq("published", true).maybeSingle();
    if (!gallery) return res.status(404).end("Galerie indisponible");
    const drive = getDrive();
    const meta = await drive.files.get({ fileId: id, fields: "id,name,mimeType,parents,size" });
    if (!meta.data.parents?.includes(gallery.drive_folder_id) || !meta.data.mimeType?.startsWith("image/")) return res.status(403).end("Accès refusé");
    const file = await drive.files.get({ fileId: id, alt: "media" }, { responseType: "arraybuffer" });
    const bytes = Buffer.from(file.data as ArrayBuffer);
    res.setHeader("Content-Type", meta.data.mimeType || "application/octet-stream");
    res.setHeader("Content-Length", String(bytes.length));
    res.setHeader("Content-Disposition", `${req.query.download === "1" ? "attachment" : "inline"}; filename*=UTF-8''${encodeURIComponent(meta.data.name || "photo")}`);
    res.setHeader("Cache-Control", "private, max-age=300");
    return res.status(200).send(bytes);
  } catch (e: any) {
    console.error("gallery image error", e?.message || e);
    return res.status(404).end("Photo introuvable");
  }
}
