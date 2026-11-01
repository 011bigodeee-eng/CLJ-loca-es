"use client";

import Image from "next/image";
import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
} from "react";
import {
  AnimatePresence,
  motion,
  useReducedMotion,
  useScroll,
  useTransform,
  useMotionValue,
  useMotionTemplate,
  type MotionStyle,
} from "framer-motion";
import {
  ArrowUpRight,
  ArrowRight,
  ArrowDown,
  Menu,
  X,
  Search,
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
  quoteMessage,
  type Equipment,
} from "@/lib/content";
import { trackIntent } from "@/lib/events";
import { services, detailedServices } from "@/lib/services";
import { ServiceOverview, ServiceIcon } from "@/components/services";
import {
  MobileMotionProvider,
  useMobileMotion,
} from "@/components/mobile-motion";
import {
  DepthShowcase,
  EquipmentJourney,
  OperationMedia,
} from "@/components/cinematic";

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
  message = quoteMessage(),
  equipmentId,
  serviceId,
  ariaLabel,
}: {
  children: React.ReactNode;
  className?: string;
  source: string;
  message?: string;
  equipmentId?: string;
  serviceId?: string;
  ariaLabel?: string;
}) {
  return (
    <a
      className={className}
      aria-label={ariaLabel}
      href={whatsappUrl(message)}
      target="_blank"
      rel="noopener noreferrer"
      onClick={() =>
        trackIntent("whatsapp_click", source, equipmentId, serviceId)
      }
    >
      {children}
    </a>
  );
}
function Reveal({
  children,
  className = "",
  delay = 0,
  variant = "default",
}: {
  children: React.ReactNode;
  className?: string;
  delay?: number;
  variant?: "default" | "image";
}) {
  const reduced = useReducedMotion();
  return (
    <motion.div
      className={`reveal ${className}`}
      initial={
        reduced
          ? false
          : {
              opacity: 0,
              y: 24,
              ...(variant === "image"
                ? { clipPath: "inset(8% 0% 8% 0%)" }
                : {}),
            }
      }
      animate={reduced ? { opacity: 1, y: 0 } : undefined}
      whileInView={{
        opacity: 1,
        y: 0,
        ...(variant === "image" ? { clipPath: "inset(0% 0% 0% 0%)" } : {}),
      }}
      onViewportEnter={(entry) =>
        entry?.target.setAttribute("data-revealed", "true")
      }
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
function Intro({ onComplete }: { onComplete: () => void }) {
  const [visible, setVisible] = useState(true);
  const controls = useRef<HTMLDivElement>(null);
  const finish = useCallback(() => {
    if (document.documentElement.dataset.cljIntro === "pending")
      document.documentElement.dataset.cljIntro = "exiting";
    setVisible(false);
    onComplete();
  }, [onComplete]);
  useLayoutEffect(() => {
    document.documentElement.dataset.cljHydrated = "true";
    if (!visible) return;
    if (
      document.documentElement.dataset.cljIntro !== "pending" ||
      window.matchMedia("(prefers-reduced-motion: reduce)").matches
    ) {
      finish();
      return;
    }
    const shell = document.getElementById("site-content");
    if (shell) shell.inert = true;
    const previousFocus = document.activeElement as HTMLElement | null;
    controls.current
      ?.querySelector<HTMLButtonElement>("button")
      ?.focus({ preventScroll: true });
    const started =
      (window as Window & { __cljIntroStart?: number }).__cljIntroStart ??
      performance.now();
    const timer = window.setTimeout(
      finish,
      Math.max(0, 2400 - (performance.now() - started)),
    );
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") finish();
      if (event.key === "Tab") {
        const buttons =
          controls.current?.querySelectorAll<HTMLButtonElement>("button");
        if (!buttons?.length) return;
        if (event.shiftKey && document.activeElement === buttons[0]) {
          event.preventDefault();
          buttons[buttons.length - 1].focus();
        } else if (
          !event.shiftKey &&
          document.activeElement === buttons[buttons.length - 1]
        ) {
          event.preventDefault();
          buttons[0].focus();
        }
      }
    };
    document.addEventListener("keydown", onKey);
    window.addEventListener("clj:intro-timeout", finish);
    return () => {
      clearTimeout(timer);
      document.removeEventListener("keydown", onKey);
      window.removeEventListener("clj:intro-timeout", finish);
      if (shell) shell.inert = false;
      if (previousFocus && previousFocus !== document.body)
        previousFocus.focus({ preventScroll: true });
    };
  }, [finish, visible]);
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
    <AnimatePresence
      onExitComplete={() => {
        document.documentElement.dataset.cljIntro = "skip";
      }}
    >
      {visible && (
        <motion.div
          className="intro"
          initial={{ opacity: 1 }}
          exit={{ opacity: 0, transition: { duration: 0.35 } }}
          aria-label="Introdução CLJ"
          role="dialog"
          aria-modal="true"
        >
          <div className="intro-beam" />
          <span className="intro-logo">
            <span className="intro-metal" data-text="CLJ">
              CLJ
            </span>
            <span>.</span>
          </span>
          <p>FORÇA QUE MOVE. SOLUÇÕES QUE CONECTAM.</p>
          <div className="intro-controls" ref={controls}>
            <button onClick={playSound}>
              <Volume2 size={15} /> Ativar som
            </button>
            <button onClick={finish}>
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
          if (e.isIntersecting)
            setActive(e.target.getAttribute("data-nav-section") || e.target.id);
        }),
      { rootMargin: "-15% 0px -55% 0px" },
    );
    navigation.forEach(([id]) => {
      const el = document.getElementById(id);
      if (el) observer.observe(el);
    });
    document
      .querySelectorAll("[data-nav-section]")
      .forEach((element) => observer.observe(element));
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
        <WhatsAppLink
          className="button button-small header-cta"
          source="header-quote"
        >
          Solicitar orçamento <ArrowUpRight size={17} />
        </WhatsAppLink>
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
function Hero({ ready }: { ready: boolean }) {
  const ref = useRef<HTMLElement>(null);
  const reduced = useReducedMotion();
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start start", "end start"],
  });
  const y = useTransform(scrollYProgress, [0, 1], ["0%", "9%"]);
  return (
    <section id="inicio" ref={ref} className="hero">
      <motion.div className="hero-image" style={reduced ? undefined : { y }}>
        <motion.div
          className="hero-image-frame"
          initial={{ scale: 1.075 }}
          animate={{ scale: ready || reduced ? 1 : 1.075 }}
          transition={{ duration: reduced ? 0 : 1.9, ease: [0.2, 0.7, 0.3, 1] }}
        >
          <Image
            src="/images/truck.webp"
            alt="Cena ilustrativa gerada por IA: caminhão com equipamento pesado em ambiente industrial"
            fill
            priority
            sizes="(max-width:767px) 1100px, 100vw"
            quality={90}
          />
        </motion.div>
      </motion.div>
      <div className="hero-ambient" aria-hidden="true" />
      <div className="hero-shade" />
      <div className="hero-grid" />
      <div className="hero-content container">
        <div className="eyebrow">
          <span className="status-dot" /> FORÇA QUE MOVE. SOLUÇÕES QUE CONECTAM.
        </div>
        <h1 aria-label="POTÊNCIA PARA MOVER SEUS PROJETOS.">
          {["POTÊNCIA PARA", "MOVER SEUS", "PROJETOS."].map((line, index) => (
            <span className="hero-line-mask" key={line}>
              <motion.span
                className={index === 2 ? "hero-line accent" : "hero-line"}
                aria-hidden="true"
                initial={{ y: "110%" }}
                animate={{ y: ready || reduced ? "0%" : "110%" }}
                transition={{
                  duration: reduced ? 0 : 0.85,
                  delay: reduced ? 0 : 0.12 + index * 0.13,
                  ease: [0.2, 0.7, 0.3, 1],
                }}
              >
                {line}
              </motion.span>
            </span>
          ))}
        </h1>
        <p className="hero-description">
          Locação de caminhões, equipamentos e soluções
          <br className="desktop-break" /> para acompanhar cada etapa da sua
          operação.
        </p>
        <div className="hero-actions">
          <a
            href="#equipamentos"
            className="button"
            aria-label="Explorar equipamentos"
          >
            <span className="desktop-label">Explorar equipamentos</span>
            <span className="mobile-label" aria-hidden="true">
              Equipamentos
            </span>{" "}
            <ArrowUpRight size={20} />
          </a>
          <WhatsAppLink
            source="hero-quote"
            className="button button-outline"
            ariaLabel="Solicitar orçamento"
          >
            <span className="desktop-label">Solicitar orçamento</span>
            <span className="mobile-label" aria-hidden="true">
              Orçamento
            </span>{" "}
            <ArrowRight size={18} />
          </WhatsAppLink>
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
      </div>
      <span className="hero-side">CLJ — LOCAÇÕES E SOLUÇÕES</span>
    </section>
  );
}
function About() {
  return (
    <section id="sobre" className="section about container">
      <Reveal className="about-image" variant="image">
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
          A CLJ Locações e Soluções reúne frentes de transporte, locação de
          equipamentos, movimentação de cargas e apoio operacional para
          conversar sobre as necessidades do seu projeto.
        </p>
        <p>
          Uma conversa direta para entender sua demanda, apresentar opções e
          alinhar os próximos passos com a equipe comercial.
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
            message={quoteMessage(item.name)}
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
  const [touchOpen, setTouchOpen] = useState<string | null>(null);
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
        <motion.div
          className="equipment-grid"
          key={filtered.map((item) => item.id).join(",")}
          initial={{ opacity: 0.45, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.25 }}
        >
          {filtered.map((item, index) => (
            <Reveal
              key={item.id}
              delay={Math.min(index * 0.06, 0.18)}
              className="equipment-card"
            >
              <button
                className="card-main"
                onPointerMove={(event) => {
                  if (
                    event.pointerType !== "mouse" ||
                    !window.matchMedia(
                      "(min-width: 1024px) and (prefers-reduced-motion: no-preference)",
                    ).matches
                  )
                    return;
                  const card = event.currentTarget;
                  const rect = card.getBoundingClientRect();
                  card.style.setProperty(
                    "--tilt-x",
                    `${((event.clientY - rect.top - rect.height / 2) / rect.height) * -3}deg`,
                  );
                  card.style.setProperty(
                    "--tilt-y",
                    `${((event.clientX - rect.left - rect.width / 2) / rect.width) * 3}deg`,
                  );
                }}
                onPointerLeave={(event) => {
                  event.currentTarget.style.setProperty("--tilt-x", "0deg");
                  event.currentTarget.style.setProperty("--tilt-y", "0deg");
                }}
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
                  <span className="card-hover-label">EXPLORAR EQUIPAMENTO</span>
                  <span className="card-expand">
                    <Plus size={22} />
                  </span>
                </div>
                <div className="card-copy">
                  <span className="card-category">{item.category}</span>
                  <h3>{item.name}</h3>
                  <p>{item.description}</p>
                  <span className="card-extra">
                    Modelo e condições a confirmar com a equipe.
                  </span>
                  <span className="card-link">
                    Consultar disponibilidade <ArrowUpRight size={20} />
                  </span>
                </div>
              </button>
              <div className="mobile-card-actions">
                <button
                  type="button"
                  className="mobile-options-toggle"
                  aria-label={`Opções de orçamento: ${item.name}`}
                  aria-expanded={touchOpen === item.id}
                  aria-controls={`touch-options-${item.id}`}
                  onClick={() =>
                    setTouchOpen(touchOpen === item.id ? null : item.id)
                  }
                >
                  Opções de orçamento <Plus size={16} />
                </button>
                {touchOpen === item.id && (
                  <div
                    className="mobile-quote-options"
                    id={`touch-options-${item.id}`}
                  >
                    <p>
                      Modelo, condições e disponibilidade precisam ser
                      confirmados com a equipe. Este item é demonstrativo.
                    </p>
                    <WhatsAppLink
                      source="mobile-equipment-options"
                      equipmentId={item.id}
                      className="button"
                      message={quoteMessage(item.name)}
                    >
                      Solicitar orçamento <ArrowUpRight size={18} />
                    </WhatsAppLink>
                  </div>
                )}
              </div>
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
        </motion.div>
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
function SolutionPanel({
  children,
  index,
  serviceId,
}: {
  children: React.ReactNode;
  index: number;
  serviceId?: string;
}) {
  const ref = useRef<HTMLElement>(null);
  const reduced = useReducedMotion();
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"],
  });
  const scale = useTransform(scrollYProgress, [0, 0.5, 1], [0.98, 1, 0.96]);
  const opacity = useTransform(scrollYProgress, [0, 0.65, 1], [1, 1, 0.86]);
  const mobileScale = useTransform(scrollYProgress, [0, 0.65, 1], [1, 1, 0.96]);
  const mobileTransform = useMotionTemplate`scale(${mobileScale})`;
  const mobileOpacity = useTransform(
    scrollYProgress,
    [0, 0.65, 1],
    [1, 1, 0.85],
  );
  return (
    <motion.article
      ref={ref}
      className="solution-card solution-panel"
      id={serviceId}
      aria-labelledby={serviceId ? `${serviceId}-title` : undefined}
      style={
        {
          top: 110 + index * 18,
          "--mobile-panel-index": index,
          "--mobile-panel-transform": mobileTransform,
          "--mobile-panel-opacity": mobileOpacity,
          ...(reduced ? {} : { scale, opacity }),
        } as MotionStyle
      }
    >
      {children}
    </motion.article>
  );
}
function ServiceDetails() {
  return (
    <section
      id="areas-em-detalhe"
      data-nav-section="solucoes"
      className="section solutions service-detail-section container"
      aria-labelledby="service-details-title"
    >
      <Reveal className="section-heading">
        <div>
          <div className="eyebrow">
            <span className="short-line" /> CONHEÇA AS POSSIBILIDADES
          </div>
          <h2 id="service-details-title">
            SUA NECESSIDADE.
            <br />
            <span className="muted">O NOSSO PONTO DE PARTIDA.</span>
          </h2>
        </div>
        <p>
          Conte o contexto da sua operação.
          <br />A equipe comercial ajuda a esclarecer os próximos passos.
        </p>
      </Reveal>
      <div className="solutions-grid solutions-stack">
        {detailedServices.map((service, index) => (
          <SolutionPanel key={service.id} index={index} serviceId={service.id}>
            <div className="solution-photo">
              <Image
                src={service.image}
                alt={service.imageAlt}
                fill
                sizes="(max-width:768px) 100vw,75vw"
                quality={90}
                style={{ objectPosition: service.position }}
              />
            </div>
            <div className="solution-top">
              <ServiceIcon id={service.id} />
              <span>0{index + 1}</span>
            </div>
            <div className="solution-copy">
              <h3 id={`${service.id}-title`}>{service.title}</h3>
              <p>{service.detail}</p>
              <WhatsAppLink
                source="service-details"
                serviceId={service.id}
                message={quoteMessage(service.title)}
                className="button service-detail-quote"
              >
                Solicitar orçamento <ArrowUpRight size={19} />
              </WhatsAppLink>
            </div>
            <span className="solution-demo">
              IMAGEM ILUSTRATIVA · IA · CONDIÇÕES A CONFIRMAR
            </span>
          </SolutionPanel>
        ))}
      </div>
    </section>
  );
}
function Process() {
  const steps = [
    [
      "Escolha uma solução",
      "Conheça as áreas de atuação ou explore o catálogo demonstrativo e identifique sua necessidade.",
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
              <span className="short-line" /> COMO SOLICITAR UM ORÇAMENTO
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
    offset: ["start 85%", "end 70%"],
  });
  const scale = useTransform(scrollYProgress, [0, 0.7, 1], [0.84, 1, 1]);
  const radius = useTransform(scrollYProgress, [0, 0.7], [20, 0]);
  const mobileScale = useTransform(scrollYProgress, [0, 0.7, 1], [0.85, 1, 1]);
  const mobileRadius = useTransform(scrollYProgress, [0, 0.7], [22, 0]);
  const mobileRadiusValue = useMotionTemplate`${mobileRadius}px`;
  return (
    <section
      ref={ref}
      className="impact expanding-impact"
      aria-label="Sua operação não pode parar"
    >
      <div className="impact-sticky">
        <motion.div
          className="impact-frame"
          style={
            {
              "--mobile-expansion-scale": mobileScale,
              "--mobile-expansion-radius": mobileRadiusValue,
              ...(reduced ? {} : { scale, borderRadius: radius }),
            } as MotionStyle
          }
        >
          <OperationMedia />
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
        </motion.div>
      </div>
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
    const text = `${quoteMessage()}\n\nNome: ${name}\n${data.get("company") ? `Empresa: ${String(data.get("company")).trim()}\n` : ""}Telefone: ${phone}\nServiço ou equipamento de interesse: ${interest}\n\nMensagem: ${message}`;
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
              Serviço ou equipamento de interesse <span>*</span>
              <select name="equipment" required defaultValue="">
                <option value="" disabled>
                  Selecione uma opção
                </option>
                <optgroup label="Áreas de atuação">
                  {services.map((service) => (
                    <option key={service.id}>{service.title}</option>
                  ))}
                </optgroup>
                <optgroup label="Equipamentos demonstrativos">
                  {equipment.map((e) => (
                    <option key={e.id}>{e.name}</option>
                  ))}
                </optgroup>
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
            <WhatsAppLink source="footer-quote">
              Solicitar orçamento
            </WhatsAppLink>
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
function FloatingContact() {
  const mobile = useMobileMotion();
  const [hidden, setHidden] = useState(true);
  useEffect(() => {
    const visible = new Set<Element>();
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) visible.add(entry.target);
          else visible.delete(entry.target);
        });
        setHidden(visible.size > 0);
      },
      { threshold: 0 },
    );
    document
      .querySelectorAll(
        mobile.mobile
          ? "#inicio, #equipamentos, .equipment-journey, #solucoes, #areas-em-detalhe, .expanding-impact, #contato, .footer"
          : "#inicio, .equipment-journey, #contato, .footer",
      )
      .forEach((element) => observer.observe(element));
    return () => observer.disconnect();
  }, [mobile.mobile]);
  return (
    <WhatsAppLink
      source="floating"
      className={`floating-whatsapp ${hidden ? "floating-hidden" : ""}`}
    >
      <MessageCircle size={23} />
      <span>Fale com a CLJ</span>
      <span className="sr-only"> pelo WhatsApp, abre em nova aba</span>
    </WhatsAppLink>
  );
}
function SiteContent() {
  const mobileMotion = useMobileMotion();
  const [heroReady, setHeroReady] = useState(false);
  const finishIntro = useCallback(() => setHeroReady(true), []);
  const cursorX = useMotionValue(0);
  const cursorY = useMotionValue(0);
  return (
    <>
      <a className="skip-link" href="#main">
        Pular para o conteúdo
      </a>
      <Intro onComplete={finishIntro} />
      <div
        id="site-content"
        data-mobile-motion={
          mobileMotion.mobile
            ? mobileMotion.enabled
              ? "active"
              : "static"
            : undefined
        }
      >
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
          <Hero ready={heroReady} />
          <div className="demo-strip">
            <div className="container">
              <span>
                <span className="status-dot" /> UMA PRÉVIA DO QUE PODEMOS
                CONSTRUIR JUNTOS.
              </span>
              <span>
                Áreas de atuação informadas · equipamentos ilustrativos{" "}
                <ArrowUpRight size={15} />
              </span>
            </div>
          </div>
          <About />
          <ServiceOverview />
          <Catalog />
          <DepthShowcase />
          <EquipmentJourney />
          <ServiceDetails />
          <Process />
          <Impact />
          <Contact />
        </main>
        <Footer />
        <FloatingContact />
      </div>
    </>
  );
}

export default function Site() {
  return (
    <MobileMotionProvider>
      <SiteContent />
    </MobileMotionProvider>
  );
}
