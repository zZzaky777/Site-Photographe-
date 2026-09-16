import { useState, useEffect, useRef } from "react";

const THEMES = [
  { id: "sport", label: "Sport" },
  { id: "evenements", label: "Événements" },
  { id: "portrait", label: "Portrait" },
  { id: "nature", label: "Nature" },
  { id: "mariage", label: "Mariage" },
];

const GALLERY: Record<string, { id: string; url: string; alt: string; caption: string }[]> = {
  sport: [
    {
      id: "s1",
      url: "https://images.unsplash.com/photo-1745163112816-1dcfb5193520?w=800&h=600&fit=crop&auto=format",
      alt: "Cycliste en backflip dans les airs",
      caption: "Freestyle — Annecy 2024",
    },
    {
      id: "s2",
      url: "https://images.unsplash.com/photo-1745163112810-ab65646732ba?w=800&h=600&fit=crop&auto=format",
      alt: "Cycliste en saut dans un ciel nuageux",
      caption: "Mountain Bike — Grenoble 2024",
    },
    {
      id: "s3",
      url: "https://images.unsplash.com/photo-1516902588772-9a108be8e47b?w=800&h=600&fit=crop&auto=format",
      alt: "Skieur nautique tracté par un bateau",
      caption: "Ski Nautique — Lac Léman 2023",
    },
    {
      id: "s4",
      url: "https://images.unsplash.com/photo-1593766827228-8737b4534aa6?w=800&h=600&fit=crop&auto=format",
      alt: "Athlète en action",
      caption: "Compétition — Lyon 2023",
    },
  ],
  evenements: [
    {
      id: "e1",
      url: "https://images.unsplash.com/photo-1459749411175-04bf5292ceea?w=800&h=600&fit=crop&auto=format",
      alt: "Concert salle comble",
      caption: "Festival Jazz — Paris 2024",
    },
    {
      id: "e2",
      url: "https://images.unsplash.com/photo-1470229722913-7c0e2dbbafd3?w=800&h=600&fit=crop&auto=format",
      alt: "Lumières de scène sur le public",
      caption: "Live Music — Bordeaux 2024",
    },
    {
      id: "e3",
      url: "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=800&h=600&fit=crop&auto=format",
      alt: "Foule devant une scène",
      caption: "Festival Électro — Marseille 2023",
    },
    {
      id: "e4",
      url: "https://images.unsplash.com/photo-1563841930606-67e2bce48b78?w=800&h=600&fit=crop&auto=format",
      alt: "Foule et scène",
      caption: "Soirée Corporative — Cannes 2023",
    },
  ],
  portrait: [
    {
      id: "p1",
      url: "https://images.unsplash.com/photo-1506863530036-1efeddceb993?w=800&h=600&fit=crop&auto=format",
      alt: "Femme en portrait noir et blanc",
      caption: "Série Lumière — Studio Paris 2024",
    },
    {
      id: "p2",
      url: "https://images.unsplash.com/photo-1535579710123-3c0f261c474e?w=800&h=600&fit=crop&auto=format",
      alt: "Femme en haut noir",
      caption: "Editorial — Vogue FR 2024",
    },
    {
      id: "p3",
      url: "https://images.unsplash.com/photo-1606143412458-acc5f86de897?w=800&h=600&fit=crop&auto=format",
      alt: "Femme portrait dramatique",
      caption: "Chiaroscuro — Studio Lyon 2023",
    },
    {
      id: "p4",
      url: "https://images.unsplash.com/photo-1563170446-9c3c0622d8a9?w=800&h=600&fit=crop&auto=format",
      alt: "Femme aux yeux bleus",
      caption: "Portrait Naturel — Nice 2023",
    },
  ],
  nature: [
    {
      id: "n1",
      url: "https://images.unsplash.com/uploads/1412026095116d2b0c90e/3bf33993?w=800&h=600&fit=crop&auto=format",
      alt: "Prairie et montagne vue aérienne",
      caption: "Alpes — Aube dorée 2024",
    },
    {
      id: "n2",
      url: "https://images.unsplash.com/photo-1475070929565-c985b496cb9f?w=800&h=600&fit=crop&auto=format",
      alt: "Rivière entre grands arbres",
      caption: "Forêt — Vosges 2024",
    },
    {
      id: "n3",
      url: "https://images.unsplash.com/photo-1500485035595-cbe6f645feb1?w=800&h=600&fit=crop&auto=format",
      alt: "Feuille de palmier près de l'eau",
      caption: "Côte Atlantique — Été 2023",
    },
    {
      id: "n4",
      url: "https://images.unsplash.com/photo-1604715686140-d5bef96c8b9d?w=800&h=600&fit=crop&auto=format",
      alt: "Champ vert près d'un lac",
      caption: "Lac de Constance — Automne 2023",
    },
  ],
  mariage: [
    {
      id: "m1",
      url: "https://images.unsplash.com/photo-1764380751758-fdf366ac7318?w=800&h=600&fit=crop&auto=format",
      alt: "Mariée avec son bébé et ses invités",
      caption: "Cérémonie — Château de la Loire 2024",
    },
    {
      id: "m2",
      url: "https://images.unsplash.com/photo-1785256576124-df0213975f9e?w=800&h=600&fit=crop&auto=format",
      alt: "Cérémonie de mariage nocturne",
      caption: "Mariage de nuit — Côte d'Azur 2024",
    },
    {
      id: "m3",
      url: "https://images.unsplash.com/photo-1780291260492-adc9022bb738?w=800&h=600&fit=crop&auto=format",
      alt: "Couple en noir et blanc sous lustre",
      caption: "Les Mariés — Normandie 2023",
    },
  ],
};

function useInView(threshold = 0.15) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) setVisible(true); },
      { threshold }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);
  return { ref, visible };
}

function FadeIn({ children, delay = 0, className = "" }: { children: React.ReactNode; delay?: number; className?: string }) {
  const { ref, visible } = useInView();
  return (
    <div
      ref={ref}
      className={className}
      style={{
        opacity: visible ? 1 : 0,
        transform: visible ? "translateY(0)" : "translateY(24px)",
        transition: `opacity 0.7s ease ${delay}ms, transform 0.7s ease ${delay}ms`,
      }}
    >
      {children}
    </div>
  );
}

function Nav({ activeSection }: { activeSection: string }) {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 40);
    window.addEventListener("scroll", handler);
    return () => window.removeEventListener("scroll", handler);
  }, []);

  const links = [
    { href: "#hero", label: "Accueil" },
    { href: "#galerie", label: "Galerie" },
    { href: "#apropos", label: "À propos" },
    { href: "#contact", label: "Contact" },
  ];

  return (
    <nav
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        zIndex: 50,
        padding: "1.25rem 2rem",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        background: scrolled ? "rgba(10,10,10,0.92)" : "transparent",
        backdropFilter: scrolled ? "blur(12px)" : "none",
        borderBottom: scrolled ? "1px solid #2a2520" : "1px solid transparent",
        transition: "all 0.4s ease",
      }}
    >
      <a
        href="#hero"
        style={{
          fontFamily: "var(--font-display)",
          fontSize: "1.25rem",
          fontWeight: 300,
          letterSpacing: "0.08em",
          color: "#f0ebe3",
          textDecoration: "none",
        }}
      >
        <span style={{ color: "#c9a84c" }}>Z</span>aky.Photo
        <span style={{ fontSize: "0.6rem", letterSpacing: "0.25em", marginLeft: "0.5rem", color: "#6b6460", verticalAlign: "middle", textTransform: "uppercase" }}>Photographe</span>
      </a>

      {/* Desktop nav */}
      <div style={{ display: "flex", gap: "2.5rem" }} className="hidden-mobile">
        {links.map((l) => (
          <a
            key={l.href}
            href={l.href}
            style={{
              fontSize: "0.75rem",
              letterSpacing: "0.15em",
              textTransform: "uppercase",
              color: activeSection === l.href.slice(1) ? "#c9a84c" : "#a09890",
              textDecoration: "none",
              transition: "color 0.2s",
            }}
            onMouseEnter={(e) => { (e.target as HTMLAnchorElement).style.color = "#f0ebe3"; }}
            onMouseLeave={(e) => { (e.target as HTMLAnchorElement).style.color = activeSection === l.href.slice(1) ? "#c9a84c" : "#a09890"; }}
          >
            {l.label}
          </a>
        ))}
      </div>

      {/* Mobile hamburger */}
      <button
        onClick={() => setMenuOpen(!menuOpen)}
        style={{ background: "none", border: "none", cursor: "pointer", padding: "4px", display: "none" }}
        className="show-mobile"
        aria-label="Menu"
      >
        <div style={{ width: 22, height: 1.5, background: "#f0ebe3", marginBottom: 5, transition: "all 0.3s", transform: menuOpen ? "rotate(45deg) translate(4px, 4px)" : "none" }} />
        <div style={{ width: 22, height: 1.5, background: "#f0ebe3", marginBottom: 5, opacity: menuOpen ? 0 : 1, transition: "all 0.3s" }} />
        <div style={{ width: 22, height: 1.5, background: "#f0ebe3", transition: "all 0.3s", transform: menuOpen ? "rotate(-45deg) translate(4px, -4px)" : "none" }} />
      </button>

      {menuOpen && (
        <div style={{
          position: "fixed", top: 64, left: 0, right: 0, background: "rgba(10,10,10,0.98)",
          backdropFilter: "blur(16px)", padding: "2rem", display: "flex", flexDirection: "column", gap: "1.5rem",
          borderBottom: "1px solid #2a2520",
        }}>
          {links.map((l) => (
            <a
              key={l.href}
              href={l.href}
              onClick={() => setMenuOpen(false)}
              style={{
                fontSize: "0.875rem", letterSpacing: "0.15em", textTransform: "uppercase",
                color: "#f0ebe3", textDecoration: "none",
              }}
            >
              {l.label}
            </a>
          ))}
        </div>
      )}
    </nav>
  );
}

function Hero() {
  return (
    <section
      id="hero"
      style={{
        position: "relative",
        minHeight: "100vh",
        display: "flex",
        alignItems: "flex-end",
        overflow: "hidden",
      }}
    >
      <div
        style={{
          position: "absolute",
          inset: 0,
          backgroundImage: "url(https://images.unsplash.com/photo-1470229722913-7c0e2dbbafd3?w=1600&h=1000&fit=crop&auto=format)",
          backgroundSize: "cover",
          backgroundPosition: "center",
          filter: "brightness(0.35)",
        }}
      />
      <div
        style={{
          position: "absolute",
          inset: 0,
          background: "linear-gradient(to top, rgba(10,10,10,1) 0%, rgba(10,10,10,0.4) 60%, transparent 100%)",
        }}
      />
      <div style={{ position: "relative", zIndex: 1, padding: "0 2rem 6rem", maxWidth: 900 }}>
        <div style={{ marginBottom: "1rem", marginRight: "auto !important" }}>
          <span style={{ fontSize: "0.65rem", letterSpacing: "0.3em", textTransform: "uppercase", color: "#c9a84c", marginTop: "0px !important", marginRight: "auto !important" }} />
        </div>
        <h1
          style={{
            fontFamily: "var(--font-display)",
            fontSize: "clamp(3rem, 8vw, 7rem)",
            fontWeight: 300,
            lineHeight: 1.0,
            color: "#f0ebe3",
            margin: "0 0 1.5rem",
            letterSpacing: "-0.02em",
          }}
        >
          Capturer<br />
          <em style={{ fontStyle: "italic", color: "#c9a84c" }}>l'instant</em><br />
          parfait.
        </h1>
        <p style={{ fontSize: "0.95rem", color: "#a09890", maxWidth: 480, lineHeight: 1.7, marginBottom: "2.5rem" }}>
          Sport, événements, portrait, nature — chaque image raconte une histoire unique. Basé à Montpellier et alentours.&nbsp;
        </p>
        <div style={{ display: "flex", gap: "1rem", flexWrap: "wrap" }}>
          <a
            href="#galerie"
            style={{
              display: "inline-block",
              padding: "0.8rem 2rem",
              background: "#c9a84c",
              color: "#0a0a0a",
              fontFamily: "var(--font-body)",
              fontSize: "0.75rem",
              fontWeight: 600,
              letterSpacing: "0.15em",
              textTransform: "uppercase",
              textDecoration: "none",
              transition: "background 0.2s",
            }}
            onMouseEnter={(e) => { (e.target as HTMLAnchorElement).style.background = "#d4b568"; }}
            onMouseLeave={(e) => { (e.target as HTMLAnchorElement).style.background = "#c9a84c"; }}
          >
            Voir la galerie
          </a>
          <a
            href="#contact"
            style={{
              display: "inline-block",
              padding: "0.8rem 2rem",
              border: "1px solid #2a2520",
              color: "#f0ebe3",
              fontFamily: "var(--font-body)",
              fontSize: "0.75rem",
              fontWeight: 400,
              letterSpacing: "0.15em",
              textTransform: "uppercase",
              textDecoration: "none",
              transition: "border-color 0.2s, color 0.2s",
            }}
            onMouseEnter={(e) => { const el = e.target as HTMLAnchorElement; el.style.borderColor = "#c9a84c"; el.style.color = "#c9a84c"; }}
            onMouseLeave={(e) => { const el = e.target as HTMLAnchorElement; el.style.borderColor = "#2a2520"; el.style.color = "#f0ebe3"; }}
          >
            Me contacter
          </a>
        </div>
      </div>

      {/* scroll indicator */}
      <div
        style={{
          position: "absolute",
          bottom: "2rem",
          right: "2rem",
          zIndex: 1,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: "0.5rem",
          color: "#6b6460",
          fontSize: "0.6rem",
          letterSpacing: "0.2em",
          textTransform: "uppercase",
        }}
      >
        <div style={{ width: 1, height: 60, background: "linear-gradient(to bottom, #c9a84c, transparent)" }} />
        Scroll
      </div>
    </section>
  );
}

function Gallery() {
  const [activeTheme, setActiveTheme] = useState("sport");
  const [lightbox, setLightbox] = useState<null | { url: string; alt: string; caption: string }>(null);

  const photos = GALLERY[activeTheme] || [];

  return (
    <section id="galerie" style={{ padding: "8rem 2rem", maxWidth: 1280, margin: "0 auto" }}>
      <FadeIn>
        <div style={{ marginBottom: "0.75rem" }}>
          <span style={{ fontSize: "0.65rem", letterSpacing: "0.3em", textTransform: "uppercase", color: "#c9a84c" }}>
            Portfolio
          </span>
        </div>
        <h2
          style={{
            fontFamily: "var(--font-display)",
            fontSize: "clamp(2rem, 5vw, 3.5rem)",
            fontWeight: 300,
            color: "#f0ebe3",
            margin: "0 0 3rem",
            letterSpacing: "-0.02em",
          }}
        >
          Galerie
        </h2>
      </FadeIn>

      {/* Theme tabs */}
      <FadeIn delay={100}>
        <div
          style={{
            display: "flex",
            gap: 0,
            marginBottom: "3rem",
            borderBottom: "1px solid #2a2520",
            overflowX: "auto",
          }}
        >
          {THEMES.map((t) => (
            <button
              key={t.id}
              onClick={() => setActiveTheme(t.id)}
              style={{
                background: "none",
                border: "none",
                borderBottom: activeTheme === t.id ? "2px solid #c9a84c" : "2px solid transparent",
                marginBottom: -1,
                padding: "0.75rem 1.5rem",
                color: activeTheme === t.id ? "#c9a84c" : "#6b6460",
                fontSize: "0.75rem",
                letterSpacing: "0.12em",
                textTransform: "uppercase",
                cursor: "pointer",
                transition: "color 0.2s",
                whiteSpace: "nowrap",
              }}
              onMouseEnter={(e) => { if (activeTheme !== t.id) (e.target as HTMLButtonElement).style.color = "#a09890"; }}
              onMouseLeave={(e) => { if (activeTheme !== t.id) (e.target as HTMLButtonElement).style.color = "#6b6460"; }}
            >
              {t.label}
            </button>
          ))}
        </div>
      </FadeIn>

      {/* Grid */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))",
          gap: "1px",
          background: "#2a2520",
        }}
      >
        {photos.map((photo, i) => (
          <FadeIn key={photo.id} delay={i * 80}>
            <div
              onClick={() => setLightbox(photo)}
              style={{
                position: "relative",
                aspectRatio: "4/3",
                background: "#141414",
                overflow: "hidden",
                cursor: "pointer",
              }}
              onMouseEnter={(e) => {
                const img = (e.currentTarget as HTMLDivElement).querySelector("img");
                const overlay = (e.currentTarget as HTMLDivElement).querySelector(".overlay") as HTMLDivElement;
                if (img) img.style.transform = "scale(1.05)";
                if (overlay) overlay.style.opacity = "1";
              }}
              onMouseLeave={(e) => {
                const img = (e.currentTarget as HTMLDivElement).querySelector("img");
                const overlay = (e.currentTarget as HTMLDivElement).querySelector(".overlay") as HTMLDivElement;
                if (img) img.style.transform = "scale(1)";
                if (overlay) overlay.style.opacity = "0";
              }}
            >
              <img
                src={photo.url}
                alt={photo.alt}
                style={{
                  width: "100%",
                  height: "100%",
                  objectFit: "cover",
                  transition: "transform 0.6s ease",
                }}
              />
              <div
                className="overlay"
                style={{
                  position: "absolute",
                  inset: 0,
                  background: "rgba(10,10,10,0.7)",
                  opacity: 0,
                  transition: "opacity 0.4s ease",
                  display: "flex",
                  alignItems: "flex-end",
                  padding: "1.25rem",
                }}
              >
                <span style={{ fontSize: "0.75rem", color: "#c9a84c", letterSpacing: "0.08em" }}>{photo.caption}</span>
              </div>
            </div>
          </FadeIn>
        ))}
      </div>

      {/* Lightbox */}
      {lightbox && (
        <div
          onClick={() => setLightbox(null)}
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 100,
            background: "rgba(0,0,0,0.95)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            flexDirection: "column",
            padding: "2rem",
            backdropFilter: "blur(8px)",
          }}
        >
          <img
            src={lightbox.url.replace("w=800&h=600", "w=1400&h=900")}
            alt={lightbox.alt}
            style={{ maxWidth: "90vw", maxHeight: "80vh", objectFit: "contain" }}
            onClick={(e) => e.stopPropagation()}
          />
          <p style={{ marginTop: "1rem", color: "#c9a84c", fontSize: "0.8rem", letterSpacing: "0.1em" }}>{lightbox.caption}</p>
          <button
            onClick={() => setLightbox(null)}
            style={{
              position: "absolute",
              top: "1.5rem",
              right: "1.5rem",
              background: "none",
              border: "1px solid #2a2520",
              color: "#f0ebe3",
              width: 40,
              height: 40,
              cursor: "pointer",
              fontSize: "1rem",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            ×
          </button>
        </div>
      )}
    </section>
  );
}

function About() {
  return (
    <section id="apropos" style={{ borderTop: "1px solid #2a2520", padding: "8rem 2rem" }}>
      <div style={{ maxWidth: 1280, margin: "0 auto", display: "grid", gridTemplateColumns: "1fr 1fr", gap: "6rem", alignItems: "center" }}>
        <FadeIn>
          <div
            style={{
              aspectRatio: "3/4",
              overflow: "hidden",
              background: "#141414",
              position: "relative",
            }}
          >
            <img
              src="https://images.unsplash.com/photo-1606143412458-acc5f86de897?w=700&h=900&fit=crop&auto=format"
              alt="Lucas Martin photographe"
              style={{ width: "100%", height: "100%", objectFit: "cover", filter: "brightness(0.85)" }}
            />
            <div style={{
              position: "absolute",
              bottom: 0,
              left: 0,
              right: 0,
              height: "40%",
              background: "linear-gradient(to top, rgba(10,10,10,0.8), transparent)",
            }} />
            <div style={{
              position: "absolute",
              top: "1.5rem",
              left: "-1.5rem",
              background: "#c9a84c",
              color: "#0a0a0a",
              padding: "0.4rem 1rem",
              fontSize: "0.65rem",
              letterSpacing: "0.2em",
              textTransform: "uppercase",
              fontWeight: 600,
            }}>
              12 ans d'expérience
            </div>
          </div>
        </FadeIn>

        <FadeIn delay={150}>
          <div>
            <div style={{ marginBottom: "0.75rem" }}>
              <span style={{ fontSize: "0.65rem", letterSpacing: "0.3em", textTransform: "uppercase", color: "#c9a84c" }}>
                À propos
              </span>
            </div>
            <h2
              style={{
                fontFamily: "var(--font-display)",
                fontSize: "clamp(2rem, 4vw, 3rem)",
                fontWeight: 300,
                color: "#f0ebe3",
                margin: "0 0 1.5rem",
                letterSpacing: "-0.02em",
                lineHeight: 1.15,
              }}
            >
              La lumière<br />
              <em style={{ fontStyle: "italic", color: "#c9a84c" }}>comme langage</em>
            </h2>
            <p style={{ color: "#a09890", lineHeight: 1.8, marginBottom: "1.5rem", fontSize: "0.95rem" }}>
              Basé à Montpellier, Zakaria pratique la photographie depuis quasiment 5 ans. Avec une passion particulière pour la transcription des émotions, chaque image devient le témoin sincère d'un instant unique.
            </p>
            <p style={{ color: "#a09890", lineHeight: 1.8, marginBottom: "2.5rem", fontSize: "0.95rem" }}>
              Mon approche : être au plus proche de vos souhaits. Retranscrire toute l'importance de vos événements, de vos portraits — avec authenticité et exigence.
            </p>
          </div>
        </FadeIn>
      </div>
    </section>
  );
}

type FormState = { name: string; email: string; theme: string; message: string; };

function Contact() {
  const [form, setForm] = useState<FormState>({ name: "", email: "", theme: "", message: "" });
  const [status, setStatus] = useState<"idle" | "sending" | "sent" | "error">("idle");

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) {
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }));
  }

 async function handleSubmit(e: React.FormEvent) {
  e.preventDefault();
  setStatus("sending");

  try {
    const response = await fetch("https://formspree.io/f/xjyvnabq", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify({
        name: form.name,
        email: form.email,
        theme: THEMES.find((t) => t.id === form.theme)?.label ?? form.theme,
        message: form.message,
      }),
    });

    if (response.ok) {
      setStatus("sent");
      setForm({
        name: "",
        email: "",
        theme: "",
        message: "",
      });
    } else {
      setStatus("error");
    }
  } catch {
    setStatus("error");
  }
}

  const inputStyle: React.CSSProperties = {
    width: "100%",
    background: "transparent",
    border: "none",
    borderBottom: "1px solid #2a2520",
    color: "#f0ebe3",
    padding: "0.75rem 0",
    fontSize: "0.9rem",
    fontFamily: "var(--font-body)",
    outline: "none",
    transition: "border-color 0.2s",
  };

  return (
    <section id="contact" style={{ borderTop: "1px solid #2a2520", padding: "8rem 2rem", background: "#080808" }}>
      <div style={{ maxWidth: 1280, margin: "0 auto", display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8rem", alignItems: "start" }}>
        <FadeIn>
          <div>
            <div style={{ marginBottom: "0.75rem" }}>
              <span style={{ fontSize: "0.65rem", letterSpacing: "0.3em", textTransform: "uppercase", color: "#c9a84c" }}>
                Contact
              </span>
            </div>
            <h2
              style={{
                fontFamily: "var(--font-display)",
                fontSize: "clamp(2rem, 4vw, 3rem)",
                fontWeight: 300,
                color: "#f0ebe3",
                margin: "0 0 1.5rem",
                letterSpacing: "-0.02em",
                lineHeight: 1.15,
              }}
            >
              Travaillons<br />
              <em style={{ fontStyle: "italic", color: "#c9a84c" }}>ensemble</em>
            </h2>
            <p style={{ color: "#a09890", lineHeight: 1.8, fontSize: "0.9rem", marginBottom: "3rem", maxWidth: 380 }}>
              Un projet, un événement, une séance portrait ? Décrivez votre vision et je vous recontacte sous 24h avec une proposition personnalisée.
            </p>
            <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
              {[
                { label: "Email", value: "Zakariabalbasry@gmail.com" },
                { label: "Téléphone", value: "07 69 51 21 47" },
                { label: "Localisation", value: "Montpellier, France" },
              ].map((info) => (
                <div key={info.label} style={{ display: "flex", alignItems: "baseline", gap: "1.5rem", borderBottom: "1px solid #1a1a1a", paddingBottom: "1rem" }}>
                  <div style={{ fontSize: "0.6rem", letterSpacing: "0.2em", textTransform: "uppercase", color: "#6b6460", flexShrink: 0, width: 80 }}>
                    {info.label}
                  </div>
                  <div style={{ color: "#f0ebe3", fontSize: "0.875rem" }}>{info.value}</div>
                </div>
              ))}
            </div>
          </div>
        </FadeIn>

        <FadeIn delay={150}>
          {status === "sent" ? (
            <div style={{
              padding: "3rem",
              border: "1px solid #2a2520",
              textAlign: "center",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: "1rem",
            }}>
              <div style={{ width: 48, height: 48, borderRadius: "50%", border: "1px solid #c9a84c", display: "flex", alignItems: "center", justifyContent: "center", color: "#c9a84c", fontSize: "1.25rem" }}>
                ✓
              </div>
              <h3 style={{ fontFamily: "var(--font-display)", fontSize: "1.5rem", fontWeight: 300, color: "#f0ebe3", margin: 0 }}>
                Message envoyé
              </h3>
              <p style={{ color: "#a09890", fontSize: "0.85rem", lineHeight: 1.7 }}>
                Merci pour votre message. Je vous répondrai dans les 24h.
              </p>
              <button onClick={() => setStatus("idle")} style={{ marginTop: "1rem", background: "none", border: "1px solid #2a2520", color: "#a09890", padding: "0.5rem 1.5rem", cursor: "pointer", fontSize: "0.75rem", letterSpacing: "0.1em" }}>
                Nouveau message
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "2rem" }}>
              <div>
                <label style={{ fontSize: "0.6rem", letterSpacing: "0.2em", textTransform: "uppercase", color: "#6b6460", display: "block", marginBottom: "0.5rem" }}>
                  Nom *
                </label>
                <input
                  name="name"
                  value={form.name}
                  onChange={handleChange}
                  required
                  placeholder="Marie Dupont"
                  style={inputStyle}
                  onFocus={(e) => { (e.target as HTMLInputElement).style.borderColor = "#c9a84c"; }}
                  onBlur={(e) => { (e.target as HTMLInputElement).style.borderColor = "#2a2520"; }}
                />
              </div>

              <div>
                <label style={{ fontSize: "0.6rem", letterSpacing: "0.2em", textTransform: "uppercase", color: "#6b6460", display: "block", marginBottom: "0.5rem" }}>
                  Email *
                </label>
                <input
                  type="email"
                  name="email"
                  value={form.email}
                  onChange={handleChange}
                  required
                  placeholder="marie@exemple.fr"
                  style={inputStyle}
                  onFocus={(e) => { (e.target as HTMLInputElement).style.borderColor = "#c9a84c"; }}
                  onBlur={(e) => { (e.target as HTMLInputElement).style.borderColor = "#2a2520"; }}
                />
              </div>

              <div>
                <label style={{ fontSize: "0.6rem", letterSpacing: "0.2em", textTransform: "uppercase", color: "#6b6460", display: "block", marginBottom: "0.5rem" }}>
                  Type de prestation
                </label>
                <select
                  name="theme"
                  value={form.theme}
                  onChange={handleChange}
                  style={{ ...inputStyle, appearance: "none", cursor: "pointer", color: form.theme ? "#f0ebe3" : "#6b6460" }}
                  onFocus={(e) => { (e.target as HTMLSelectElement).style.borderColor = "#c9a84c"; }}
                  onBlur={(e) => { (e.target as HTMLSelectElement).style.borderColor = "#2a2520"; }}
                >
                  <option value="" style={{ background: "#141414" }}>Sélectionner un thème…</option>
                  <option value="sport" style={{ background: "#141414" }}>Sport</option>
                  <option value="evenements" style={{ background: "#141414" }}>Événements</option>
                  <option value="portrait" style={{ background: "#141414" }}>Portrait</option>
                  <option value="nature" style={{ background: "#141414" }}>Nature</option>
                  <option value="mariage" style={{ background: "#141414" }}>Mariage</option>
                  <option value="autre" style={{ background: "#141414" }}>Autre</option>
                </select>
              </div>

              <div>
                <label style={{ fontSize: "0.6rem", letterSpacing: "0.2em", textTransform: "uppercase", color: "#6b6460", display: "block", marginBottom: "0.5rem" }}>
                  Message *
                </label>
                <textarea
                  name="message"
                  value={form.message}
                  onChange={handleChange}
                  required
                  rows={5}
                  placeholder="Décrivez votre projet, la date souhaitée, le lieu…"
                  style={{ ...inputStyle, resize: "none", lineHeight: 1.7 }}
                  onFocus={(e) => { (e.target as HTMLTextAreaElement).style.borderColor = "#c9a84c"; }}
                  onBlur={(e) => { (e.target as HTMLTextAreaElement).style.borderColor = "#2a2520"; }}
                />
              </div>

              <div style={{ display: "flex", gap: "1rem", flexWrap: "wrap", alignItems: "center" }}>
                <button
                  type="submit"
                  disabled={status === "sending"}
                  style={{
                    padding: "1rem 2.5rem",
                    background: "#c9a84c",
                    color: "#0a0a0a",
                    border: "none",
                    fontSize: "0.75rem",
                    fontWeight: 600,
                    letterSpacing: "0.15em",
                    textTransform: "uppercase",
                    cursor: status === "sending" ? "wait" : "pointer",
                    fontFamily: "var(--font-body)",
                    transition: "background 0.2s, opacity 0.2s",
                    opacity: status === "sending" ? 0.7 : 1,
                  }}
                  onMouseEnter={(e) => { if (status !== "sending") (e.target as HTMLButtonElement).style.background = "#d4b568"; }}
                  onMouseLeave={(e) => { (e.target as HTMLButtonElement).style.background = "#c9a84c"; }}
                >
                  {status === "sending" ? "Envoi en cours…" : "Envoyer le message"}
                </button>

                <a
                  href={`https://ig.me/m/Zaky.photo`}
                  target="_blank"
                  rel="noreferrer"
                  title="Envoyer un message Instagram"
                  style={{
                    width: 50,
                    height: 50,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    border: "1px solid #2a2520",
                    background: "#141414",
                    flexShrink: 0,
                    transition: "border-color 0.2s, background 0.2s",
                    textDecoration: "none",
                  }}
                  onMouseEnter={(e) => {
                    const el = e.currentTarget as HTMLAnchorElement;
                    el.style.borderColor = "#c9a84c";
                    el.style.background = "#1e1a14";
                  }}
                  onMouseLeave={(e) => {
                    const el = e.currentTarget as HTMLAnchorElement;
                    el.style.borderColor = "#2a2520";
                    el.style.background = "#141414";
                  }}
                >
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <defs>
                      <linearGradient id="ig-grad" x1="0%" y1="100%" x2="100%" y2="0%">
                        <stop offset="0%" stopColor="#f09433" />
                        <stop offset="25%" stopColor="#e6683c" />
                        <stop offset="50%" stopColor="#dc2743" />
                        <stop offset="75%" stopColor="#cc2366" />
                        <stop offset="100%" stopColor="#bc1888" />
                      </linearGradient>
                    </defs>
                    <rect x="2" y="2" width="20" height="20" rx="5" stroke="url(#ig-grad)" strokeWidth="1.5" fill="none"/>
                    <circle cx="12" cy="12" r="4" stroke="url(#ig-grad)" strokeWidth="1.5" fill="none"/>
                    <circle cx="17.5" cy="6.5" r="1" fill="url(#ig-grad)"/>
                  </svg>
                </a>
              </div>
            </form>
          )}
        </FadeIn>
      </div>
    </section>
  );
}

function Footer() {
  return (
    <footer style={{ borderTop: "1px solid #2a2520", padding: "2.5rem 2rem", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "1rem" }}>
      <div style={{ fontFamily: "var(--font-display)", fontSize: "0.9rem", fontWeight: 300, color: "#6b6460", letterSpacing: "0.05em" }}>
        © 2026 Zakaria Balbasry — Zaky.Photo
      </div>
      <div style={{ display: "flex", gap: "2rem" }}>
        {[
          { label: "Instagram", href: "https://www.instagram.com/Zaky.photo" },
          { label: "LinkedIn", href: "#" },
          { label: "Behance", href: "#" },
        ].map((social) => (
          <a
            key={social.label}
            href={social.href}
            target={social.href !== "#" ? "_blank" : undefined}
            rel="noreferrer"
            style={{ fontSize: "0.65rem", letterSpacing: "0.15em", textTransform: "uppercase", color: "#6b6460", textDecoration: "none", transition: "color 0.2s" }}
            onMouseEnter={(e) => { (e.target as HTMLAnchorElement).style.color = "#c9a84c"; }}
            onMouseLeave={(e) => { (e.target as HTMLAnchorElement).style.color = "#6b6460"; }}
          >
            {social.label}
          </a>
        ))}
      </div>
    </footer>
  );
}

export default function App() {
  const [activeSection, setActiveSection] = useState("hero");

  useEffect(() => {
    const ids = ["hero", "galerie", "apropos", "contact"];
    const observers = ids.map((id) => {
      const el = document.getElementById(id);
      if (!el) return null;
      const obs = new IntersectionObserver(
        ([entry]) => { if (entry.isIntersecting) setActiveSection(id); },
        { threshold: 0.4 }
      );
      obs.observe(el);
      return obs;
    });
    return () => observers.forEach((obs) => obs?.disconnect());
  }, []);

  return (
    <div style={{ background: "#0a0a0a", minHeight: "100vh" }}>
      <style>{`
        @media (max-width: 768px) {
          .hidden-mobile { display: none !important; }
          .show-mobile { display: flex !important; }
          #apropos > div, #contact > div {
            grid-template-columns: 1fr !important;
            gap: 3rem !important;
          }
        }
        @media (min-width: 769px) {
          .show-mobile { display: none !important; }
        }
      `}</style>
      <Nav activeSection={activeSection} />
      <Hero />
      <Gallery />
      <About />
      <Contact />
      <Footer />
    </div>
  );
}
