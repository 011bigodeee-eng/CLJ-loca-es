"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import {
  AnimatePresence,
  motion,
  useReducedMotion,
  useScroll,
  useTransform,
  useMotionValue,
} from "framer-motion";
import {
  ArrowUpRight,
  ArrowRight,
  ArrowDown,
  Menu,
  X,
  Search,
  Truck,
  HardHat,
  MoveUpRight,
  MessageCircle,
  Check,
  Volume2,
  ShieldCheck,
  SlidersHorizontal,
  Plus,
} from "lucide-react";
import {
  company,
  equipment,
  categories,
  navigation,
  whatsappUrl,
  type Equipment,
} from "@/lib/content";
import { trackIntent } from "@/lib/events";

function Brand({ footer = false }: { footer?: boolean }) {
  return (
    <a
      href="#inicio"
      className={`brand ${footer ? "brand-footer" : ""}`}
      aria-label="CLJ — Início"
    >
      <span className="brand-mark">
        CLJ<span className="brand-dot">.</span>
      </span>
      <span className="brand-description">
        LOCAÇÕES
        <br />
        <b>E SOLUÇÕES</b>
      </span>
    </a>
  );
}
function WhatsAppLink({
  children,
  className = "",
  source,
  message = "Olá! Gostaria de conversar sobre uma locação com a CLJ.",
  equipmentId,
}: {
  children: React.ReactNode;
  className?: string;
  source: string;
  message?: string;
  equipmentId?: string;
}) {
  return (
    <a
      className={className}
      href={whatsappUrl(message)}
      target="_blank"
      rel="noopener noreferrer"
      onClick={() => trackIntent("whatsapp_click", source, equipmentId)}
    >
      {children}
    </a>
  );
}
function Reveal({
  children,
  className = "",
  delay = 0,
}: {
  children: React.ReactNode;
  className?: string;
  delay?: number;
}) {
  const reduced = useReducedMotion();
  return (
    <motion.div
      className={`reveal ${className}`}
      initial={reduced ? false : { opacity: 0, y: 24 }}
      animate={reduced ? { opacity: 1, y: 0 } : undefined}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-40px" }}
      transition={{
        duration: reduced ? 0 : 0.65,
        delay: reduced ? 0 : delay,
        ease: [0.2, 0.7, 0.3, 1],
      }}
    >
      {children}
    </motion.div>
  );
}
function Intro() {
  const [visible, setVisible] = useState(false);
  const reduced = useReducedMotion();
  useEffect(() => {
    let seen = false;
    try {
      seen = sessionStorage.getItem("clj-intro") === "seen";
      sessionStorage.setItem("clj-intro", "seen");
    } catch {
      /* Storage may be unavailable in private browsing. */
    }
    if (seen || window.matchMedia("(prefers-reduced-motion: reduce)").matches)
      return;
    setVisible(true);
    const timer = window.setTimeout(() => setVisible(false), 2500);
    return () => window.clearTimeout(timer);
  }, []);
  function playSound() {
    // Original synthesized industrial tone; this handler is the only audio entry point.
    const ctx = new AudioContext();
    const oscillator = ctx.createOscillator();
    const gain = ctx.createGain();
    oscillator.type = "triangle";
    oscillator.frequency.setValueAtTime(95, ctx.currentTime);
    oscillator.frequency.exponentialRampToValueAtTime(
      38,
      ctx.currentTime + 0.65,
    );
    gain.gain.setValueAtTime(0, ctx.currentTime);
    gain.gain.linearRampToValueAtTime(0.065, ctx.currentTime + 0.04);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.8);
    oscillator.connect(gain);
    gain.connect(ctx.destination);
    oscillator.start();
    oscillator.stop(ctx.currentTime + 0.85);
    oscillator.onended = () => {
      void ctx.close();
    };
  }
  return (
    <AnimatePresence>
      {visible && !reduced && (
        <motion.div
          className="intro"
          initial={{ opacity: 1 }}
          exit={{ opacity: 0, transition: { duration: 0.35 } }}
          aria-label="Introdução CLJ"
        >
          <div className="intro-beam" />
          <motion.span
            className="intro-logo"
            initial={{
              opacity: 0,
              letterSpacing: ".25em",
              filter: "blur(12px)",
            }}
            animate={{
              opacity: 1,
              letterSpacing: "-.07em",
              filter: "blur(0px)",
            }}
            transition={{ duration: 1.4 }}
          >
            CLJ<span>.</span>
          </motion.span>
          <p>FORÇA QUE MOVE. SOLUÇÕES QUE CONECTAM.</p>
          <div className="intro-controls">
            <button onClick={playSound}>
              <Volume2 size={15} /> Ativar som
            </button>
            <button onClick={() => setVisible(false)}>
              Pular introdução <ArrowRight size={15} />
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
function Header() {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [active, setActive] = useState("inicio");
  const menuButton = useRef<HTMLButtonElement>(null);
  const mobileNav = useRef<HTMLElement>(null);
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 30);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    const observer = new IntersectionObserver(
      (entries) =>
        entries.forEach((e) => {
          if (e.isIntersecting) setActive(e.target.id);
        }),
      { rootMargin: "-15% 0px -55% 0px" },
    );
    navigation.forEach(([id]) => {
      const el = document.getElementById(id);
      if (el) observer.observe(el);
    });
    return () => {
      window.removeEventListener("scroll", onScroll);
      observer.disconnect();
    };
  }, []);
  useEffect(() => {
    if (!open) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    mobileNav.current?.querySelector<HTMLAnchorElement>("a")?.focus();
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setOpen(false);
        menuButton.current?.focus();
      }
      if (event.key === "Tab") {
        const items = [
          menuButton.current,
          ...Array.from(
            mobileNav.current?.querySelectorAll<HTMLAnchorElement>("a") ?? [],
          ),
        ].filter(Boolean) as HTMLElement[];
        const first = items[0];
        const last = items[items.length - 1];
        if (event.shiftKey && document.activeElement === first) {
          event.preventDefault();
          last.focus();
        } else if (!event.shiftKey && document.activeElement === last) {
          event.preventDefault();
          first.focus();
        }
      }
    };
    document.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = previous;
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);
  return (
    <header className={`header ${scrolled || open ? "header-solid" : ""}`}>
      <div className="header-inner">
        <Brand />
        <nav className="desktop-nav" aria-label="Navegação principal">
          {navigation.map(([id, label]) => (
            <a
              key={id}
              className={active === id ? "active" : ""}
              href={`#${id}`}
              aria-current={active === id ? "location" : undefined}
            >
              {label}
            </a>
          ))}
        </nav>
        <a className="button button-small header-cta" href="#contato">
          Solicitar orçamento <ArrowUpRight size={17} />
        </a>
        <button
          ref={menuButton}
          className="menu-toggle"
          aria-label={open ? "Fechar menu" : "Abrir menu"}
          aria-expanded={open}
          aria-controls="mobile-menu"
          onClick={() => setOpen(!open)}
        >
          {open ? <X /> : <Menu />}
        </button>
      </div>
      <AnimatePresence>
        {open && (
          <motion.nav
            ref={mobileNav}
            id="mobile-menu"
            className="mobile-nav"
            aria-label="Navegação mobile"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
          >
            {navigation.map(([id, label], i) => (
              <a key={id} href={`#${id}`} onClick={() => setOpen(false)}>
                <span>0{i + 1}</span>
                {label}
                <ArrowUpRight size={20} />
              </a>
            ))}
            <p>Vamos mover seu próximo projeto.</p>
          </motion.nav>
        )}
      </AnimatePresence>
    </header>
  );
}
function Hero() {
  const ref = useRef<HTMLElement>(null);
  const reduced = useReducedMotion();
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start start", "end start"],
  });
  const y = useTransform(scrollYProgress, [0, 1], ["0%", "14%"]);
  return (
    <section id="inicio" ref={ref} className="hero">
      <motion.div className="hero-image" style={reduced ? undefined : { y }}>
        <Image
          src="/images/truck.webp"
          alt="Cena ilustrativa gerada por IA: caminhão com equipamento pesado em ambiente industrial"
          fill
          priority
          sizes="100vw"
          quality={90}
        />
      </motion.div>
      <div className="hero-shade" />
      <div className="hero-grid" />
      <div className="hero-content container">
        <div className="eyebrow">
          <span className="status-dot" /> FORÇA QUE MOVE. SOLUÇÕES QUE CONECTAM.
        </div>
        <motion.h1
          initial={reduced ? false : { opacity: 0, y: 25 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.9, delay: 0.2 }}
        >
          POTÊNCIA PARA
          <br />
          MOVER SEUS
          <br />
          <span>PROJETOS.</span>
        </motion.h1>
        <p className="hero-description">
          Locação de caminhões, equipamentos e soluções
          <br className="desktop-break" /> para acompanhar cada etapa da sua
          operação.
        </p>
        <div className="hero-actions">
          <a href="#equipamentos" className="button">
            Explorar equipamentos <ArrowUpRight size={20} />
          </a>
          <a href="#contato" className="button button-outline">
            Solicitar orçamento <ArrowRight size={18} />
          </a>
        </div>
        <div className="hero-note">
          <span className="note-rule" /> O EQUIPAMENTO CERTO. O PRÓXIMO PASSO DO
          SEU PROJETO.
        </div>
      </div>
      <div className="hero-bottom container">
        <a href="#sobre" className="scroll-cue">
          <span>
            <ArrowDown size={17} />
          </span>{" "}
          EXPLORE A CLJ
        </a>
        <span className="image-caption">
          IMAGEM ILUSTRATIVA · GERADA POR IA
        </span>
        <span className="hero-index">
          <b>01</b> / 06
        </span>
      </div>
      <span className="hero-side">CLJ — LOCAÇÕES E SOLUÇÕES</span>
    </section>
  );
}
function About() {
  return (
    <section id="sobre" className="section about container">
      <Reveal className="about-image">
        <Image
          src="/images/excavator.webp"
          alt="Escavadeira ilustrativa em cenário industrial, imagem gerada por IA"
          fill
          sizes="(max-width: 768px) 100vw, 45vw"
        />
        <span className="image-corner corner-top" />
        <span className="image-corner corner-bottom" />
        <span className="image-caption about-caption">
          CENÁRIO ILUSTRATIVO · IA
        </span>
        <div className="image-tag">
          <span>CLJ</span>
          <ArrowUpRight size={30} />
        </div>
      </Reveal>
      <Reveal className="about-content">
        <div className="eyebrow">
          <span className="short-line" /> CONHEÇA A CLJ
        </div>
        <h2>
          GRANDES PROJETOS.
          <br />
          <span className="muted">CONEXÕES</span>
          <br />
          QUE MOVEM.
        </h2>
        <p>
          Cada operação começa com uma necessidade. A CLJ Locações e Soluções
          aproxima seu projeto das possibilidades em caminhões, equipamentos e
          transporte.
        </p>
        <p>
          Uma conversa direta para entender sua demanda, apresentar opções e
          alinhar as condições da locação com a equipe comercial.
        </p>
        <div className="about-principles">
          <span>
            <Check size={16} /> Clareza em cada etapa
          </span>
          <span>
            <Check size={16} /> Contato sem complicação
          </span>
        </div>
        <a href="#contato" className="text-link">
          Vamos conversar sobre seu projeto <ArrowUpRight size={19} />
        </a>
      </Reveal>
    </section>
  );
}
function EquipmentModal({
  item,
  close,
}: {
  item: Equipment;
  close: () => void;
}) {
  const dialog = useRef<HTMLDialogElement>(null);
  useEffect(() => {
    const el = dialog.current;
    el?.showModal();
    const old = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = old;
      el?.close();
    };
  }, []);
  return (
    <dialog
      ref={dialog}
      className="equipment-dialog"
      onCancel={close}
      onClick={(e) => {
        if (e.target === e.currentTarget) close();
      }}
      aria-labelledby="equipment-title"
    >
      <div className="dialog-content">
        <button
          className="dialog-close icon-button"
          aria-label="Fechar detalhes"
          onClick={close}
        >
          <X />
        </button>
        <div className="dialog-image">
          <Image
            src={item.gallery[0]}
            alt={`${item.name} — imagem ilustrativa gerada por IA`}
            fill
            sizes="(max-width: 768px) 100vw, 50vw"
            style={{ objectPosition: item.position }}
          />
          <span className="demo-badge">DEMONSTRATIVO · IA</span>
        </div>
        <div className="dialog-copy">
          <div className="eyebrow">{item.category}</div>
          <h2 id="equipment-title">{item.name}</h2>
          <p>{item.description}</p>
          <div className="demo-notice">
            <ShieldCheck size={20} />
            <p>
              Este item é uma referência demonstrativa. Não representa
              equipamento da frota CLJ. Modelo, especificações, condições e
              disponibilidade precisam ser confirmados pela equipe.
            </p>
          </div>
          <WhatsAppLink
            className="button"
            source="equipment-details"
            equipmentId={item.id}
            message={`Olá! Gostaria de solicitar um orçamento para locação de ${item.name}.`}
          >
            Solicitar orçamento <ArrowUpRight size={19} />
          </WhatsAppLink>
          <span className="small-note">
            Abre o WhatsApp. Número comercial a confirmar.
          </span>
        </div>
      </div>
    </dialog>
  );
}
function Catalog() {
  const [category, setCategory] = useState("Todos");
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState<Equipment | null>(null);
  const opener = useRef<HTMLButtonElement | null>(null);
  useEffect(() => {
    const param = new URLSearchParams(window.location.search).get("categoria");
    if (param && categories.includes(param as (typeof categories)[number]))
      setCategory(param);
  }, []);
  const normalize = (value: string) =>
    value
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .toLowerCase();
  const filtered = equipment.filter(
    (e) =>
      (category === "Todos" || e.category === category) &&
      normalize(`${e.name} ${e.description} ${e.category}`).includes(
        normalize(search),
      ),
  );
  function filter(value: string) {
    setCategory(value);
    const url = new URL(window.location.href);
    if (value === "Todos") url.searchParams.delete("categoria");
    else url.searchParams.set("categoria", value);
    window.history.replaceState(null, "", url);
  }
  return (
    <section id="equipamentos" className="section catalog">
      <div className="container">
        <Reveal className="section-heading">
          <div>
            <div className="eyebrow">
              <span className="short-line" /> EQUIPAMENTOS & POSSIBILIDADES
            </div>
            <h2>
              O PRÓXIMO PASSO
              <br />
              COMEÇA <span className="outline-word">AQUI.</span>
            </h2>
          </div>
          <p>
            Explore possibilidades para sua operação.
            <br />
            Encontre o que precisa e converse com a CLJ.
          </p>
        </Reveal>
        <div className="catalog-toolbar">
          <div
            className="filters"
            role="group"
            aria-label="Filtrar por categoria"
          >
            {categories.map((c) => (
              <button
                key={c}
                className={category === c ? "selected" : ""}
                aria-pressed={category === c}
                onClick={() => filter(c)}
              >
                {c}
              </button>
            ))}
          </div>
          <label className="search-field">
            <Search size={18} />
            <span className="sr-only">Buscar equipamento</span>
            <input
              placeholder="Buscar equipamento"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              type="search"
            />
          </label>
        </div>
        <div className="catalog-meta">
          <span>
            <span className="status-dot" /> CATÁLOGO DEMONSTRATIVO
          </span>
          <span aria-live="polite">
            {filtered.length}{" "}
            {filtered.length === 1 ? "possibilidade" : "possibilidades"}
          </span>
        </div>
        <div className="equipment-grid">
          {filtered.map((item, index) => (
            <Reveal
              key={item.id}
              delay={Math.min(index * 0.06, 0.18)}
              className="equipment-card"
            >
              <button
                className="card-main"
                onClick={(event) => {
                  opener.current = event.currentTarget;
                  setSelected(item);
                }}
                aria-label={`Ver detalhes: ${item.name}`}
              >
                <div className="card-image">
                  <Image
                    src={item.image}
                    alt={`${item.name}, ilustração gerada por IA`}
                    fill
                    sizes="(max-width: 600px) 100vw, (max-width: 1000px) 50vw, 33vw"
                    style={{ objectPosition: item.position }}
                  />
                  <span className="demo-badge">DEMONSTRATIVO</span>
                  <span className="card-expand">
                    <Plus size={22} />
                  </span>
                </div>
                <div className="card-copy">
                  <span className="card-category">{item.category}</span>
                  <h3>{item.name}</h3>
                  <p>{item.description}</p>
                  <span className="card-link">
                    Consultar disponibilidade <ArrowUpRight size={20} />
                  </span>
                </div>
              </button>
            </Reveal>
          ))}
          <div className="catalog-help">
            <span className="help-icon">
              <MessageCircle size={28} strokeWidth={1.3} />
            </span>
            <span className="eyebrow">VAMOS ENCONTRAR UM CAMINHO</span>
            <h3>
              SUA NECESSIDADE
              <br />É O NOSSO
              <br />
              <span>PONTO DE PARTIDA.</span>
            </h3>
            <p>
              Não encontrou o que procura?
              <br />
              Conte para a nossa equipe.
            </p>
            <WhatsAppLink className="text-link" source="catalog-help">
              Falar com a CLJ <ArrowUpRight size={20} />
            </WhatsAppLink>
          </div>
        </div>
        {filtered.length === 0 && (
          <div className="empty-results">
            <SlidersHorizontal size={28} />
            <h3>Nenhum equipamento encontrado</h3>
            <p>Tente outro termo ou explore todas as categorias.</p>
            <button
              className="button button-outline"
              onClick={() => {
                setSearch("");
                filter("Todos");
              }}
            >
              Limpar filtros
            </button>
          </div>
        )}
        <p className="catalog-disclaimer">
          Prévia demonstrativa. Imagens geradas por IA e categorias
          ilustrativas. Os itens não representam a frota da CLJ. Consulte o
          catálogo oficial com a equipe.
        </p>
      </div>
      {selected && (
        <EquipmentModal
          item={selected}
          close={() => {
            setSelected(null);
            requestAnimationFrame(() => opener.current?.focus());
          }}
        />
      )}
    </section>
  );
}
const solutions = [
  {
    number: "01",
    title: "Caminhões",
    icon: Truck,
    text: "Converse sobre a locação de caminhões e as necessidades do seu projeto.",
    category: "Caminhões",
  },
  {
    number: "02",
    title: "Equipamentos",
    icon: HardHat,
    text: "Apresente sua operação e explore possibilidades em equipamentos.",
    category: "Máquinas pesadas",
  },
  {
    number: "03",
    title: "Transporte",
    icon: MoveUpRight,
    text: "Compartilhe o que precisa movimentar e alinhe as condições com a equipe.",
    category: "Transporte",
  },
];
function Solutions() {
  return (
    <section id="solucoes" className="section solutions container">
      <Reveal className="section-heading">
        <div>
          <div className="eyebrow">
            <span className="short-line" /> SOLUÇÕES QUE CONECTAM
          </div>
          <h2>
            DIFERENTES DEMANDAS.
            <br />
            <span className="muted">A MESMA DIREÇÃO.</span>
          </h2>
        </div>
        <p>
          Da escolha do equipamento à conversa comercial,
          <br />
          um ponto de contato para o seu próximo projeto.
        </p>
      </Reveal>
      <div className="solutions-grid">
        {solutions.map(({ number, title, icon: Icon, text, category }, i) => (
          <Reveal className="solution-card" key={title} delay={i * 0.1}>
            <div className="solution-photo">
              <Image
                src={i === 1 ? "/images/excavator.webp" : "/images/truck.webp"}
                alt={`Cena ilustrativa de ${title.toLowerCase()} gerada por IA`}
                fill
                sizes="(max-width: 768px) 100vw, 33vw"
              />
            </div>
            <div className="solution-top">
              <Icon size={26} strokeWidth={1.4} />
              <span>{number}</span>
            </div>
            <div className="solution-copy">
              <h3>{title}</h3>
              <p>{text}</p>
              <a
                href={`/?categoria=${encodeURIComponent(category)}#equipamentos`}
                aria-label={`Explorar ${title.toLowerCase()}`}
                className="solution-link"
              >
                <ArrowUpRight size={24} />
              </a>
            </div>
            <span className="solution-demo">IMAGEM ILUSTRATIVA · IA</span>
          </Reveal>
        ))}
      </div>
    </section>
  );
}
function Process() {
  const steps = [
    [
      "Escolha o equipamento",
      "Explore o catálogo demonstrativo e identifique sua necessidade.",
    ],
    [
      "Solicite um orçamento",
      "Compartilhe os detalhes do seu projeto pelo WhatsApp.",
    ],
    [
      "Converse com a equipe",
      "Entenda as opções e tire suas dúvidas com o atendimento comercial.",
    ],
    [
      "Confirme as condições",
      "Alinhe disponibilidade, valores e condições antes de contratar.",
    ],
  ];
  return (
    <section id="como-funciona" className="section process">
      <div className="container">
        <Reveal className="section-heading">
          <div>
            <div className="eyebrow">
              <span className="short-line" /> DO PROJETO À CONVERSA
            </div>
            <h2>
              SIMPLES PARA VOCÊ.
              <br />
              <span className="muted">CLARO EM CADA ETAPA.</span>
            </h2>
          </div>
          <span className="process-caption">
            UM FLUXO DEMONSTRATIVO
            <br />
            PARA O SEU PRÓXIMO PASSO <ArrowDown size={20} />
          </span>
        </Reveal>
        <div className="timeline">
          {steps.map(([title, text], i) => (
            <Reveal key={title} className="timeline-step" delay={i * 0.1}>
              <span className="step-number">
                0{i + 1}
                <span className="step-dot" />
              </span>
              <h3>{title}</h3>
              <p>{text}</p>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
function Impact() {
  const ref = useRef<HTMLElement>(null);
  const reduced = useReducedMotion();
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"],
  });
  const scale = useTransform(scrollYProgress, [0, 1], [1.1, 1]);
  return (
    <section ref={ref} className="impact">
      <motion.div
        className="impact-image"
        style={reduced ? undefined : { scale }}
      >
        <Image
          src="/images/excavator.webp"
          fill
          sizes="100vw"
          alt="Escavadeira em paisagem cinematográfica, imagem ilustrativa gerada por IA"
        />
      </motion.div>
      <div className="impact-overlay" />
      <Reveal className="impact-content container">
        <div className="eyebrow">
          O SEU PRÓXIMO PROJETO COMEÇA COM UMA CONVERSA.
        </div>
        <h2>
          SUA OPERAÇÃO
          <br />
          <span>NÃO PODE PARAR.</span>
        </h2>
        <WhatsAppLink className="button" source="impact">
          FALE COM A CLJ <ArrowUpRight size={21} />
        </WhatsAppLink>
      </Reveal>
      <span className="image-caption impact-caption">
        IMAGEM ILUSTRATIVA · GERADA POR IA
      </span>
      <div className="industrial-tape">
        <span>
          FORÇA QUE MOVE <Plus size={22} /> SOLUÇÕES QUE CONECTAM{" "}
          <Plus size={22} /> CLJ LOCAÇÕES <Plus size={22} /> FORÇA QUE MOVE{" "}
          <Plus size={22} /> SOLUÇÕES QUE CONECTAM <Plus size={22} />
        </span>
      </div>
    </section>
  );
}
function Contact() {
  const [status, setStatus] = useState("");
  function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const data = new FormData(form);
    const name = String(data.get("name") ?? "").trim();
    const phone = String(data.get("phone") ?? "").trim();
    const interest = String(data.get("equipment") ?? "").trim();
    const message = String(data.get("message") ?? "").trim();
    if (
      name.length < 2 ||
      phone.replace(/\D/g, "").length < 10 ||
      phone.replace(/\D/g, "").length > 15 ||
      !interest ||
      !message
    ) {
      setStatus(
        "Confira o nome, um telefone válido (10 a 15 dígitos), o equipamento e a mensagem.",
      );
      return;
    }
    const text = `Olá! Gostaria de solicitar um orçamento com a CLJ.\n\nNome: ${name}\n${data.get("company") ? `Empresa: ${String(data.get("company")).trim()}\n` : ""}Telefone: ${phone}\nEquipamento de interesse: ${interest}\n\nMensagem: ${message}`;
    trackIntent("form_whatsapp_open", "contact-form");
    const opened = window.open(
      whatsappUrl(text),
      "_blank",
      "noopener,noreferrer",
    );
    // noopener may return null even when a new tab opens; keep an explicit manual link available.
    void opened;
    setStatus(
      "Continue no WhatsApp para revisar e enviar sua mensagem. Nada foi enviado automaticamente.",
    );
    setFallback(whatsappUrl(text));
  }
  const [fallback, setFallback] = useState("");
  return (
    <section id="contato" className="section contact container">
      <Reveal className="contact-copy">
        <div className="eyebrow">
          <span className="short-line" /> VAMOS MOVER SEU PROJETO
        </div>
        <h2>
          QUAL É O SEU
          <br />
          <span className="outline-word">PRÓXIMO</span>
          <br />
          DESAFIO?
        </h2>
        <p>
          Conte o que você precisa.
          <br />A conversa começa aqui.
        </p>
        <WhatsAppLink className="contact-phone" source="contact-phone">
          <span className="contact-phone-icon">
            <MessageCircle size={23} />
          </span>
          <span>
            <small>WHATSAPP COMERCIAL</small>
            <strong>{company.phoneDisplay}</strong>
          </span>
          <ArrowUpRight size={22} />
        </WhatsAppLink>
        <p className="small-note">
          Número informado para esta prévia.
          <br />A confirmar antes da publicação definitiva.
        </p>
        <div className="contact-detail">
          <span className="status-dot" /> CONTATO DIRETO. SEM COMPLICAÇÃO.
        </div>
      </Reveal>
      <Reveal className="form-panel">
        <div className="form-heading">
          <h3>Vamos conversar.</h3>
          <ArrowUpRight size={25} />
        </div>
        <p>Preencha os dados e continue pelo WhatsApp.</p>
        <form onSubmit={submit}>
          <div className="form-row">
            <label>
              Seu nome <span>*</span>
              <input
                name="name"
                autoComplete="name"
                placeholder="Como podemos chamar você?"
                required
                minLength={2}
                maxLength={100}
              />
            </label>
            <label>
              Empresa <small>(opcional)</small>
              <input
                name="company"
                autoComplete="organization"
                placeholder="Nome da empresa"
                maxLength={120}
              />
            </label>
          </div>
          <div className="form-row">
            <label>
              Telefone <span>*</span>
              <input
                name="phone"
                type="tel"
                autoComplete="tel"
                placeholder="(00) 00000-0000"
                required
                maxLength={22}
                pattern={String.raw`[+0-9\(\) .\-]{10,22}`}
              />
            </label>
            <label>
              Equipamento de interesse <span>*</span>
              <select name="equipment" required defaultValue="">
                <option value="" disabled>
                  Selecione uma opção
                </option>
                {equipment.map((e) => (
                  <option key={e.id}>{e.name}</option>
                ))}
                <option>Quero conversar sobre meu projeto</option>
              </select>
            </label>
          </div>
          <label>
            Sua mensagem <span>*</span>
            <textarea
              name="message"
              placeholder="Conte um pouco sobre a sua necessidade..."
              rows={4}
              required
              maxLength={2000}
            />
          </label>
          <button className="button submit-button" type="submit">
            Enviar pelo WhatsApp <ArrowUpRight size={21} />
          </button>
          <p className="form-privacy">
            <ShieldCheck size={14} /> Seus dados apenas compõem a mensagem. O
            envio é feito por você no WhatsApp.
          </p>
          <p className="form-status" role="status">
            {status}
          </p>
          {fallback && (
            <a
              href={fallback}
              target="_blank"
              rel="noopener noreferrer"
              className="text-link"
            >
              Continuar no WhatsApp <ArrowUpRight size={16} />
            </a>
          )}
        </form>
      </Reveal>
    </section>
  );
}
function Footer() {
  return (
    <footer className="footer">
      <div className="container">
        <div className="footer-main">
          <div>
            <Brand footer />
            <p>
              Força que move.
              <br />
              Soluções que conectam.
            </p>
          </div>
          <div className="footer-links">
            <span>NAVEGUE</span>
            {navigation.slice(1, 4).map(([id, label]) => (
              <a href={`#${id}`} key={id}>
                {label}
              </a>
            ))}
          </div>
          <div className="footer-links">
            <span>SEU PRÓXIMO PASSO</span>
            <a href="#como-funciona">Como funciona</a>
            <a href="#contato">Solicitar orçamento</a>
            <WhatsAppLink source="footer">
              Fale com a CLJ <ArrowUpRight size={14} />
            </WhatsAppLink>
          </div>
          <a href="#inicio" className="back-top" aria-label="Voltar ao início">
            <ArrowUpRight size={22} />
          </a>
        </div>
        <div className="footer-bottom">
          <p>© {new Date().getFullYear()} CLJ Locações e Soluções.</p>
          <span>PRÉVIA DEMONSTRATIVA · CONTEÚDO SUJEITO À CONFIRMAÇÃO</span>
        </div>
      </div>
    </footer>
  );
}
export default function Site() {
  const cursorX = useMotionValue(0);
  const cursorY = useMotionValue(0);
  return (
    <>
      <a className="skip-link" href="#main">
        Pular para o conteúdo
      </a>
      <Intro />
      <Header />
      <main
        id="main"
        onPointerMove={(e) => {
          if (
            e.pointerType === "mouse" &&
            window.matchMedia("(pointer: fine)").matches
          ) {
            cursorX.set(e.clientX);
            cursorY.set(e.clientY);
          }
        }}
      >
        <motion.div
          className="cursor-light"
          aria-hidden="true"
          style={{ left: cursorX, top: cursorY }}
        />
        <Hero />
        <div className="demo-strip">
          <div className="container">
            <span>
              <span className="status-dot" /> UMA PRÉVIA DO QUE PODEMOS
              CONSTRUIR JUNTOS.
            </span>
            <span>
              Conteúdo e equipamentos demonstrativos <ArrowUpRight size={15} />
            </span>
          </div>
        </div>
        <About />
        <Catalog />
        <Solutions />
        <Process />
        <Impact />
        <Contact />
      </main>
      <Footer />
      <WhatsAppLink source="floating" className="floating-whatsapp">
        <MessageCircle size={23} />
        <span>Fale com a CLJ</span>
        <span className="sr-only"> pelo WhatsApp, abre em nova aba</span>
      </WhatsAppLink>
    </>
  );
}
