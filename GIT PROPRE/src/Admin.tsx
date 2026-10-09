import { useEffect, useState } from "react";
import { supabase, supabaseConfigured } from "./lib/supabase";

type Photo = { id: string; category: string; image_url: string; storage_path?: string; alt: string; caption: string; published: boolean; created_at?: string };
const categories = [
  { id: "sport", label: "Sport" }, { id: "evenements", label: "Événements" },
  { id: "portrait", label: "Portrait" }, { id: "nature", label: "Nature" }, { id: "mariage", label: "Mariage" },
];
const fieldStyle: React.CSSProperties = { width: "100%", boxSizing: "border-box", padding: "12px 14px", background: "#171717", border: "1px solid #38342e", color: "#f0ebe3", borderRadius: 8, outline: "none" };
const btn: React.CSSProperties = { border: 0, borderRadius: 8, padding: "11px 16px", fontWeight: 650, cursor: "pointer" };

export default function Admin() {
  const [session, setSession] = useState<any>(null);
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [category, setCategory] = useState("sport");
  const [caption, setCaption] = useState("");
  const [alt, setAlt] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [filter, setFilter] = useState("all");

  useEffect(() => {
    if (!supabase) return;
    supabase.auth.getSession().then(({ data }) => setSession(data.session));
    const { data: listener } = supabase.auth.onAuthStateChange((_event, nextSession) => setSession(nextSession));
    return () => listener.subscription.unsubscribe();
  }, []);

  useEffect(() => { if (session) void loadPhotos(); }, [session]);

  async function loadPhotos() {
    if (!supabase) return;
    setBusy(true);
    const { data, error } = await supabase.from("portfolio_photos").select("*").order("created_at", { ascending: false });
    if (error) setNotice(error.message); else setPhotos((data || []) as Photo[]);
    setBusy(false);
  }
  async function signIn(e: React.FormEvent) {
    e.preventDefault(); if (!supabase) return;
    setBusy(true); setNotice("");
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) setNotice("Connexion impossible : " + error.message);
    setBusy(false);
  }
  async function upload(e: React.FormEvent) {
    e.preventDefault();
    if (!supabase || !file) { setNotice("Choisis une image avant de publier."); return; }
    if (!file.type.startsWith("image/")) { setNotice("Le fichier doit être une image."); return; }
    if (file.size > 12 * 1024 * 1024) { setNotice("Image trop lourde (maximum 12 Mo)."); return; }
    setBusy(true); setNotice("");
    const safeName = file.name.normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-zA-Z0-9._-]/g, "-");
    const path = `${crypto.randomUUID()}-${safeName}`;
    const { error: uploadError } = await supabase.storage.from("portfolio").upload(path, file, { upsert: false, contentType: file.type });
    if (uploadError) { setNotice("Envoi impossible : " + uploadError.message); setBusy(false); return; }
    const { data: urlData } = supabase.storage.from("portfolio").getPublicUrl(path);
    const { error } = await supabase.from("portfolio_photos").insert({ category, image_url: urlData.publicUrl, storage_path: path, alt: alt || caption || file.name, caption, published: true });
    if (error) setNotice("Photo envoyée mais non enregistrée : " + error.message);
    else { setNotice("Photo publiée sur le portfolio."); setFile(null); setCaption(""); setAlt(""); const input = document.getElementById("photo-file") as HTMLInputElement | null; if (input) input.value = ""; await loadPhotos(); }
    setBusy(false);
  }
  async function togglePublished(photo: Photo) {
    if (!supabase) return;
    const { error } = await supabase.from("portfolio_photos").update({ published: !photo.published }).eq("id", photo.id);
    if (error) setNotice(error.message); else { setPhotos(p => p.map(x => x.id === photo.id ? { ...x, published: !x.published } : x)); setNotice(photo.published ? "Photo masquée du portfolio." : "Photo publiée."); }
  }
  async function removePhoto(photo: Photo) {
    if (!supabase || !window.confirm("Supprimer définitivement cette photo du portfolio ?")) return;
    setBusy(true);
    if (photo.storage_path) await supabase.storage.from("portfolio").remove([photo.storage_path]);
    const { error } = await supabase.from("portfolio_photos").delete().eq("id", photo.id);
    if (error) setNotice(error.message); else { setPhotos(p => p.filter(x => x.id !== photo.id)); setNotice("Photo supprimée."); }
    setBusy(false);
  }
  const visiblePhotos = photos.filter(p => filter === "all" || p.category === filter);
  const page: React.CSSProperties = { minHeight: "100vh", background: "#0b0b0b", color: "#f0ebe3", fontFamily: "Inter, system-ui, sans-serif" };
  if (!supabaseConfigured) return <main style={{ ...page, display: "grid", placeItems: "center", padding: 24 }}><div style={{ maxWidth: 620, border: "1px solid #39342a", background: "#141414", borderRadius: 16, padding: 28 }}><div style={{ color: "#c9a84c", letterSpacing: ".18em", fontSize: 12 }}>ZAKY.PHOTO / ADMIN</div><h1>Configuration requise</h1><p>Le panneau est ajouté au projet, mais il faut le relier à ton espace Supabase pour sécuriser la connexion et publier les photos en ligne.</p><ol style={{ lineHeight: 1.9 }}><li>Crée un projet sur Supabase.</li><li>Exécute le script <code>supabase-setup.sql</code> fourni dans ce ZIP.</li><li>Ajoute <code>VITE_SUPABASE_URL</code> et <code>VITE_SUPABASE_ANON_KEY</code> dans les variables d’environnement de Vercel.</li><li>Installe la dépendance <code>@supabase/supabase-js</code> avant de déployer.</li></ol><p style={{ color: "#aaa" }}>Aucun mot de passe n’est intégré au code du site.</p></div></main>;
  if (!session) return <main style={{ ...page, display: "grid", placeItems: "center", padding: 20 }}><form onSubmit={signIn} style={{ width: "min(420px, 100%)", padding: 32, background: "#141414", border: "1px solid #302c25", borderRadius: 16, boxSizing: "border-box" }}><a href="/" style={{ color: "#c9a84c", textDecoration: "none", fontSize: 12, letterSpacing: ".18em" }}>← RETOUR AU SITE</a><p style={{ color: "#c9a84c", letterSpacing: ".18em", fontSize: 11, marginTop: 28 }}>ESPACE PRIVÉ</p><h1 style={{ fontWeight: 400, marginTop: 8 }}>Administration</h1><p style={{ color: "#999", fontSize: 14 }}>Connecte-toi pour gérer ton portfolio.</p><label style={{ display: "block", margin: "24px 0 7px" }}>Adresse e-mail</label><input style={fieldStyle} type="email" value={email} onChange={e => setEmail(e.target.value)} required autoComplete="username" /><label style={{ display: "block", margin: "16px 0 7px" }}>Mot de passe</label><input style={fieldStyle} type="password" value={password} onChange={e => setPassword(e.target.value)} required autoComplete="current-password" /><button disabled={busy} style={{ ...btn, width: "100%", marginTop: 22, background: "#c9a84c", color: "#111" }}>{busy ? "Connexion…" : "Se connecter"}</button>{notice && <p role="status" style={{ color: "#f0b5a7", fontSize: 13 }}>{notice}</p>}</form></main>;

  return <main style={page}>
    <header style={{ borderBottom: "1px solid #29251f", padding: "20px clamp(18px,4vw,56px)", display: "flex", justifyContent: "space-between", alignItems: "center", gap: 16, flexWrap: "wrap" }}>
      <div><div style={{ color: "#c9a84c", fontSize: 11, letterSpacing: ".2em" }}>ZAKY.PHOTO</div><h1 style={{ margin: "5px 0 0", fontSize: 25, fontWeight: 500 }}>Administration</h1></div>
      <div style={{ display: "flex", gap: 10 }}><a href="/" style={{ ...btn, color: "#f0ebe3", border: "1px solid #38342e", textDecoration: "none" }}>Voir le site ↗</a><button style={{ ...btn, background: "#28241e", color: "#f0ebe3" }} onClick={() => void supabase?.auth.signOut()}>Déconnexion</button></div>
    </header>
    <div style={{ padding: "28px clamp(18px,4vw,56px)", maxWidth: 1400, margin: "0 auto" }}>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(150px,1fr))", gap: 12, marginBottom: 26 }}>
        {[["Photos", photos.length], ["Publiées", photos.filter(p => p.published).length], ["Masquées", photos.filter(p => !p.published).length]].map(([label, value]) => <div key={label} style={{ padding: 18, background: "#151515", border: "1px solid #29251f", borderRadius: 12 }}><div style={{ color: "#999", fontSize: 13 }}>{label}</div><div style={{ fontSize: 28, marginTop: 8 }}>{value}</div></div>)}
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "minmax(280px, .8fr) minmax(0, 1.6fr)", gap: 22 }} className="admin-layout">
        <form onSubmit={upload} style={{ background: "#151515", border: "1px solid #29251f", borderRadius: 14, padding: 22, alignSelf: "start" }}>
          <h2 style={{ marginTop: 0, fontWeight: 500 }}>Ajouter une photo</h2><p style={{ color: "#999", fontSize: 13, lineHeight: 1.6 }}>Les photos ajoutées ici sont envoyées vers le stockage en ligne et publiées sur ton site.</p>
          <label style={{ display: "block", margin: "18px 0 7px" }}>Fichier image</label><input id="photo-file" type="file" accept="image/*" required onChange={e => setFile(e.target.files?.[0] || null)} style={{ ...fieldStyle, padding: 9 }} />
          <label style={{ display: "block", margin: "16px 0 7px" }}>Catégorie</label><select style={fieldStyle} value={category} onChange={e => setCategory(e.target.value)}>{categories.map(c => <option key={c.id} value={c.id}>{c.label}</option>)}</select>
          <label style={{ display: "block", margin: "16px 0 7px" }}>Légende</label><input style={fieldStyle} value={caption} onChange={e => setCaption(e.target.value)} placeholder="Ex. Concert — Montpellier 2026" />
          <label style={{ display: "block", margin: "16px 0 7px" }}>Texte alternatif</label><input style={fieldStyle} value={alt} onChange={e => setAlt(e.target.value)} placeholder="Décris brièvement la photo" />
          <button disabled={busy} style={{ ...btn, width: "100%", background: "#c9a84c", color: "#111", marginTop: 20 }}>{busy ? "Traitement…" : "Publier la photo"}</button>
        </form>
        <section><div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12, flexWrap: "wrap", marginBottom: 16 }}><h2 style={{ margin: 0, fontWeight: 500 }}>Bibliothèque photo</h2><select value={filter} onChange={e => setFilter(e.target.value)} style={{ ...fieldStyle, width: "auto" }}><option value="all">Toutes les catégories</option>{categories.map(c => <option key={c.id} value={c.id}>{c.label}</option>)}</select></div>
          {notice && <p role="status" style={{ background: "#211e17", border: "1px solid #4c4027", borderRadius: 8, padding: 12, color: "#e8d29a", fontSize: 13 }}>{notice}</p>}
          {busy && <p style={{ color: "#aaa" }}>Chargement…</p>}
          {!busy && visiblePhotos.length === 0 && <div style={{ padding: 30, border: "1px dashed #39342a", borderRadius: 12, color: "#999", textAlign: "center" }}>Aucune photo dans cette catégorie pour le moment.</div>}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(180px,1fr))", gap: 12 }}>{visiblePhotos.map(photo => <article key={photo.id} style={{ overflow: "hidden", border: "1px solid #29251f", borderRadius: 12, background: "#151515" }}><img src={photo.image_url} alt={photo.alt} style={{ width: "100%", aspectRatio: "4/3", objectFit: "cover", display: "block" }} /><div style={{ padding: 12 }}><div style={{ fontSize: 11, color: "#c9a84c", textTransform: "uppercase", letterSpacing: ".12em" }}>{categories.find(c => c.id === photo.category)?.label || photo.category}</div><p style={{ fontSize: 13, margin: "8px 0 12px", minHeight: 32 }}>{photo.caption || photo.alt}</p><div style={{ display: "flex", gap: 7 }}><button onClick={() => void togglePublished(photo)} style={{ ...btn, flex: 1, padding: "8px 6px", background: photo.published ? "#25382d" : "#29251f", color: "#eee", fontSize: 12 }}>{photo.published ? "Publiée" : "Masquée"}</button><button onClick={() => void removePhoto(photo)} style={{ ...btn, background: "#3b2220", color: "#f3c7c2", padding: "8px 10px" }} aria-label="Supprimer">✕</button></div></div></article>)}</div>
        </section>
      </div>
    </div>
    <style>{`@media(max-width:800px){.admin-layout{grid-template-columns:1fr!important}}`}</style>
  </main>;
}
