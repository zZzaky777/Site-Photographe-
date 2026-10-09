import { useEffect, useState } from "react";

type Photo = { id: string; name: string; url: string; width?: number; height?: number };
type Payload = { gallery: { clientName: string; title: string }; photos: Photo[] };

export default function ClientGallery({ slug }: { slug: string }) {
  const [data, setData] = useState<Payload | null>(null);
  const [error, setError] = useState("");
  const [selected, setSelected] = useState<Photo | null>(null);
  useEffect(() => {
    let active = true;
    fetch(`/api/gallery?slug=${encodeURIComponent(slug)}`).then(async r => {
      const body = await r.json();
      if (!r.ok) throw new Error(body.error || "Galerie indisponible");
      return body as Payload;
    }).then(body => { if (active) setData(body); }).catch(e => { if (active) setError(e.message || "Erreur de chargement"); });
    return () => { active = false; };
  }, [slug]);

  const shell: React.CSSProperties = { minHeight: "100vh", background: "#0a0a0a", color: "#f0ebe3", fontFamily: "Inter, system-ui, sans-serif" };
  if (error) return <main style={{ ...shell, display: "grid", placeItems: "center", padding: 24 }}><section style={{ maxWidth: 580, textAlign: "center" }}><p style={{ color: "#c9a84c", letterSpacing: ".2em", fontSize: 12 }}>ZAKY.PHOTO</p><h1 style={{ fontWeight: 400 }}>Galerie indisponible</h1><p style={{ color: "#aaa", lineHeight: 1.7 }}>{error}</p><a href="/" style={{ color: "#c9a84c" }}>Retour au site</a></section></main>;
  if (!data) return <main style={{ ...shell, display: "grid", placeItems: "center" }}><p style={{ color: "#c9a84c" }}>Chargement de la galerie…</p></main>;
  return <main style={shell}>
    <header style={{ padding: "24px clamp(18px,5vw,72px)", borderBottom: "1px solid #29251f", display: "flex", justifyContent: "space-between", alignItems: "center", gap: 16 }}><a href="/" style={{ color: "#c9a84c", textDecoration: "none", letterSpacing: ".2em", fontSize: 12 }}>ZAKY.PHOTO</a><span style={{ color: "#aaa", fontSize: 12 }}>GALERIE CLIENT</span></header>
    <section style={{ padding: "clamp(34px,7vw,82px) clamp(18px,5vw,72px) 30px", maxWidth: 1500, margin: "auto" }}><p style={{ color: "#c9a84c", fontSize: 11, letterSpacing: ".22em", textTransform: "uppercase" }}>{data.gallery.clientName}</p><h1 style={{ fontSize: "clamp(32px,5vw,58px)", fontWeight: 400, margin: "12px 0" }}>{data.gallery.title}</h1><p style={{ color: "#999", fontSize: 14 }}>{data.photos.length} photo{data.photos.length > 1 ? "s" : ""} · Clique sur une photo pour l’agrandir ou la télécharger.</p></section>
    <section style={{ padding: "0 clamp(18px,5vw,72px) 72px", maxWidth: 1500, margin: "auto" }}>
      {data.photos.length === 0 ? <p style={{ color: "#999", padding: 32, border: "1px dashed #39342a" }}>Aucune photo n’est disponible dans ce dossier pour le moment.</p> : <div style={{ columns: "auto 260px", columnGap: 14 }}>{data.photos.map(photo => <article key={photo.id} style={{ breakInside: "avoid", marginBottom: 14, background: "#151515", border: "1px solid #29251f", borderRadius: 8, overflow: "hidden" }}><button onClick={() => setSelected(photo)} aria-label={`Agrandir ${photo.name}`} style={{ padding: 0, display: "block", width: "100%", border: 0, background: "transparent", cursor: "zoom-in" }}><img src={photo.url} alt={photo.name} loading="lazy" style={{ display: "block", width: "100%", height: "auto", minHeight: 120, objectFit: "cover" }} /></button><div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 8, padding: 10 }}><span style={{ color: "#aaa", fontSize: 12, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{photo.name}</span><a href={`${photo.url}&download=1`} download={photo.name} style={{ color: "#c9a84c", fontSize: 12, whiteSpace: "nowrap", textDecoration: "none" }}>Télécharger ↓</a></div></article>)}</div>}
    </section>
    <footer style={{ borderTop: "1px solid #29251f", padding: 24, color: "#666", fontSize: 11, textAlign: "center", letterSpacing: ".12em" }}>© ZAKY.PHOTO · GALERIE PRIVÉE</footer>
    {selected && <div onClick={() => setSelected(null)} role="presentation" style={{ position: "fixed", inset: 0, zIndex: 50, background: "rgba(0,0,0,.94)", display: "grid", placeItems: "center", padding: 20, cursor: "zoom-out" }}><button onClick={() => setSelected(null)} aria-label="Fermer" style={{ position: "absolute", top: 18, right: 22, color: "white", fontSize: 28, background: "transparent", border: 0, cursor: "pointer" }}>×</button><img src={selected.url} alt={selected.name} onClick={e => e.stopPropagation()} style={{ maxWidth: "min(96vw,1400px)", maxHeight: "85vh", objectFit: "contain" }} /><a href={`${selected.url}&download=1`} download={selected.name} onClick={e => e.stopPropagation()} style={{ position: "absolute", bottom: 20, color: "#c9a84c" }}>Télécharger la photo</a></div>}
  </main>;
}
