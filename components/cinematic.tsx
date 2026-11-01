"use client";

import Image from "next/image";
import { useEffect, useId, useRef, useState } from "react";
import {
  motion,
  useInView,
  useMotionValue,
  useMotionTemplate,
  type MotionStyle,
  useReducedMotion,
  useScroll,
  useSpring,
  useTransform,
} from "framer-motion";
import { ArrowUpRight } from "lucide-react";
import { equipment, whatsappUrl } from "@/lib/content";
import { operationMedia, visualEquipmentIds } from "@/lib/media";
import { trackIntent } from "@/lib/events";
import type { LiquidRenderer } from "./liquid-renderer";
import { useMobileMotion } from "./mobile-motion";

/** Fluid displacement only touches the photograph, never its text or controls.
 * A short SVG pulse avoids a permanent WebGL render loop. Touch/reduced-motion
 * users get the unchanged image. Animation is cancelled outside the viewport.
 */
function LiquidImage() {
  const ref = useRef<HTMLDivElement>(null);
  const displacement = useRef<SVGFEDisplacementMapElement>(null);
  const frame = useRef(0);
  const canvas = useRef<HTMLCanvasElement>(null);
  const renderer = useRef<LiquidRenderer | null>(null);
  const generation = useRef(0);
  const loading = useRef<AbortController | null>(null);
  const id = `liquid-${useId().replace(/:/g, "")}`;
  const reduced = useReducedMotion();
  const inView = useInView(ref);
  const mobile = useMobileMotion();
  const { scrollYProgress: liquidProgress } = useScroll({
    target: ref,
    offset: ["start 95%", "start 32%"],
  });
  const mobileClipId = `mobile-wave-${id}`;
  const mobileWave = useTransform(liquidProgress, (progress) => {
    const p = Math.max(0, Math.min(1, progress));
    const level = (1 - p) * 0.95;
    const wave = Math.sin(p * Math.PI) * 0.08;
    return `M 0 ${level} C .28 ${level - wave} .72 ${level + wave} 1 ${level} L 1 1 L 0 1 Z`;
  });
  const mobileEdge = useTransform(liquidProgress, (progress) => {
    const p = Math.max(0, Math.min(1, progress));
    const level = (1 - p) * 0.95;
    const wave = Math.sin(p * Math.PI) * 0.08;
    return `M 0 ${level} C .28 ${level - wave} .72 ${level + wave} 1 ${level}`;
  });
  const edgeOpacity = useTransform(
    liquidProgress,
    [0, 0.15, 0.85, 1],
    [0, 0.6, 0.5, 0],
  );
  const reset = () => {
    generation.current++;
    loading.current?.abort();
    loading.current = null;
    renderer.current?.dispose();
    renderer.current = null;
    if (canvas.current) canvas.current.style.opacity = "0";
    cancelAnimationFrame(frame.current);
    displacement.current?.setAttribute("scale", "0");
    if (ref.current) ref.current.style.filter = "none";
  };
  useEffect(() => {
    if (!inView || reduced) reset();
    return reset;
  }, [inView, reduced]);
  async function ripple() {
    if (
      !inView ||
      reduced ||
      !window.matchMedia("(min-width:1024px) and (pointer:fine)").matches ||
      !CSS.supports("filter", `url("#${id}")`)
    )
      return;
    reset();
    const token = generation.current;
    if (canvas.current) {
      try {
        const { createLiquidRenderer } = await import("./liquid-renderer");
        if (token !== generation.current || !canvas.current) return;
        loading.current = new AbortController();
        const effect = await createLiquidRenderer(
          canvas.current,
          "/images/truck.webp",
          loading.current.signal,
        );
        if (token !== generation.current) {
          effect?.dispose();
          return;
        }
        if (effect) {
          renderer.current = effect;
          canvas.current!.style.opacity = "1";
          canvas.current!.dataset.renderer = "webgl";
          effect.play(reset);
          return;
        }
      } catch {
        /* Keep the SVG fallback when context creation or texture decoding fails. */
      }
    }
    if (canvas.current) canvas.current.dataset.renderer = "svg-fallback";
    const started = performance.now();
    if (ref.current) ref.current.style.filter = `url("#${id}")`;
    function tick(now: number) {
      const progress = Math.min((now - started) / 900, 1);
      displacement.current?.setAttribute(
        "scale",
        String(Math.sin(progress * Math.PI) * 13),
      );
      if (progress < 1) frame.current = requestAnimationFrame(tick);
      else reset();
    }
    frame.current = requestAnimationFrame(tick);
  }
  return (
    <div
      className="liquid-image-shell"
      onPointerEnter={ripple}
      onPointerLeave={reset}
      onFocus={ripple}
    >
      <svg
        className="liquid-filter-defs"
        aria-hidden="true"
        width="0"
        height="0"
      >
        <defs>
          <clipPath id={mobileClipId} clipPathUnits="objectBoundingBox">
            <motion.path d={mobileWave} />
          </clipPath>
          <filter
            id={id}
            x="-5%"
            y="-5%"
            width="110%"
            height="110%"
            colorInterpolationFilters="sRGB"
          >
            <feTurbulence
              type="fractalNoise"
              baseFrequency=".008 .018"
              numOctaves="2"
              seed="8"
              result="noise"
            />
            <feDisplacementMap
              ref={displacement}
              in="SourceGraphic"
              in2="noise"
              scale="0"
              xChannelSelector="R"
              yChannelSelector="G"
            />
          </filter>
        </defs>
      </svg>
      <div ref={ref} className="liquid-photo">
        <Image
          src="/images/truck.webp"
          alt="Caminhão ilustrativo gerado por IA, apresentado em uma composição de fotografias em camadas"
          fill
          sizes="(max-width:767px) 100vw, 65vw"
          quality={90}
        />
      </div>
      {mobile.enabled && (
        <div
          className="mobile-liquid-overlay"
          data-mobile-liquid="active"
          style={{ clipPath: `url(#${mobileClipId})` }}
          aria-hidden="true"
        >
          <Image
            src="/images/truck.webp"
            alt=""
            fill
            sizes="(max-width:767px) 100vw,65vw"
            quality={90}
          />
          <svg
            className="mobile-liquid-edge"
            viewBox="0 0 1 1"
            preserveAspectRatio="none"
          >
            <motion.path
              d={mobileEdge}
              fill="none"
              stroke="#ff6a00"
              strokeWidth=".006"
              style={{ opacity: edgeOpacity }}
            />
          </svg>
        </div>
      )}
      <canvas ref={canvas} className="liquid-canvas" aria-hidden="true" />
      <span className="photo-edge" aria-hidden="true" />
    </div>
  );
}

export function DepthShowcase() {
  const ref = useRef<HTMLElement>(null);
  const active = useInView(ref, { margin: "100px" });
  const reduced = useReducedMotion();
  const pointerX = useMotionValue(0);
  const pointerY = useMotionValue(0);
  const x = useSpring(pointerX, { stiffness: 85, damping: 25 });
  const y = useSpring(pointerY, { stiffness: 85, damping: 25 });
  const rotateX = useTransform(y, [-0.5, 0.5], [3, -3]);
  const rotateY = useTransform(x, [-0.5, 0.5], [-4, 4]);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"],
  });
  const backY = useTransform(scrollYProgress, [0, 1], [30, -35]);
  const frontY = useTransform(scrollYProgress, [0, 1], [65, -55]);
  const mobileFrontY = useTransform(scrollYProgress, [0, 1], [28, -28]);
  const mobileBackY = useTransform(scrollYProgress, [0, 1], [16, -18]);
  const mobileTilt = useTransform(scrollYProgress, [0, 1], [-1.1, 1.1]);
  const mobileFrontTransform = useMotionTemplate`translate3d(0,${mobileFrontY}px,35px) rotateZ(${mobileTilt}deg)`;
  const mobileBackTransform = useMotionTemplate`translate3d(0,${mobileBackY}px,15px)`;
  return (
    <section
      ref={ref}
      className="depth-showcase container"
      aria-labelledby="depth-title"
      onPointerMove={(event) => {
        if (
          !active ||
          reduced ||
          event.pointerType !== "mouse" ||
          !window.matchMedia("(min-width:1024px)").matches
        )
          return;
        const bounds = event.currentTarget.getBoundingClientRect();
        pointerX.set((event.clientX - bounds.left) / bounds.width - 0.5);
        pointerY.set((event.clientY - bounds.top) / bounds.height - 0.5);
      }}
      onPointerLeave={() => {
        pointerX.set(0);
        pointerY.set(0);
      }}
    >
      <div className="depth-heading">
        <div className="eyebrow">
          <span className="short-line" /> UMA NOVA PERSPECTIVA PARA O SEU
          PROJETO
        </div>
        <h2 id="depth-title">
          FORÇA EM CADA
          <br />
          <span className="outline-word">PERSPECTIVA.</span>
        </h2>
        <p>
          Caminhões, equipamentos e possibilidades.
          <br />
          Conecte sua necessidade ao próximo passo.
        </p>
      </div>
      <motion.div
        className="depth-scene"
        style={reduced ? undefined : { rotateX, rotateY }}
      >
        <div className="depth-grid" aria-hidden="true" />
        <motion.div
          className="depth-photo depth-photo-back"
          style={
            {
              "--depth-mobile-transform": mobileBackTransform,
              ...(reduced ? {} : { y: backY, z: 25 }),
            } as MotionStyle
          }
        >
          <Image
            src="/images/excavator.webp"
            alt="Escavadeira ilustrativa gerada por IA em camada de fundo"
            fill
            sizes="(max-width:767px) 100vw, 38vw"
          />
          <span className="depth-photo-label">EQUIPAMENTOS · ILUSTRATIVO</span>
        </motion.div>
        <motion.div
          className="depth-photo depth-photo-front"
          style={
            {
              "--depth-mobile-transform": mobileFrontTransform,
              ...(reduced ? {} : { y: frontY, z: 70 }),
            } as MotionStyle
          }
        >
          <LiquidImage />
          <span className="depth-photo-label">CAMINHÕES · ILUSTRATIVO</span>
        </motion.div>
        <span className="depth-coordinate" aria-hidden="true">
          CLJ / MOVIMENTO & POSSIBILIDADES
        </span>
      </motion.div>
      <p className="depth-disclaimer">
        Composição com imagens ilustrativas geradas por IA. Não representa
        equipamentos da frota CLJ.
      </p>
    </section>
  );
}

function JourneyCard({
  children,
  index,
}: {
  children: React.ReactNode;
  index: number;
}) {
  const ref = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"],
  });
  const direction = index % 2 === 0 ? 1 : -1;
  const x = useTransform(
    scrollYProgress,
    [0, 1],
    [12 * direction, -10 * direction],
  );
  const y = useTransform(scrollYProgress, [0, 1], [24, -24]);
  const rotation = useTransform(
    scrollYProgress,
    [0, 1],
    [0.7 * direction, -0.4 * direction],
  );
  const scale = useTransform(scrollYProgress, [0, 0.45, 1], [0.98, 1, 0.99]);
  const transform = useMotionTemplate`translate3d(${x}px,${y}px,0) rotate(${rotation}deg) scale(${scale})`;
  return (
    <motion.article
      ref={ref}
      className={`journey-card journey-card-${index}`}
      style={
        {
          "--journey-mobile-transform": transform,
          "--journey-mobile-index": index,
        } as MotionStyle
      }
    >
      {children}
    </motion.article>
  );
}

export function EquipmentJourney() {
  const ref = useRef<HTMLElement>(null);
  const near = useInView(ref, { margin: "300px" });
  const reduced = useReducedMotion();
  useEffect(() => {
    if (
      !near ||
      reduced ||
      !window.matchMedia(
        "(min-width:1024px) and (prefers-reduced-motion:no-preference)",
      ).matches
    )
      return;
    let cancelled = false;
    let revert: (() => void) | undefined;
    Promise.all([import("gsap"), import("gsap/ScrollTrigger")])
      .then(([module, plugin]) => {
        if (cancelled || !ref.current) return;
        const { gsap } = module;
        const { ScrollTrigger } = plugin;
        gsap.registerPlugin(ScrollTrigger);
        const match = gsap.matchMedia();
        match.add(
          "(min-width:1024px) and (prefers-reduced-motion:no-preference)",
          () => {
            const cards = ref.current!.querySelectorAll(".journey-card");
            const tween = gsap.fromTo(
              cards,
              {
                x: (i: number) => 50 - i * 35,
                y: (i: number) => 110 + i * 45,
                rotation: (i: number) => -7 + i * 6,
              },
              {
                x: (i: number) => -45 + i * 30,
                y: (i: number) => -65 + i * 10,
                rotation: (i: number) => -3 + i * 3,
                ease: "none",
                scrollTrigger: {
                  trigger: ref.current,
                  start: "top 75%",
                  end: "bottom 20%",
                  scrub: 0.55,
                  invalidateOnRefresh: true,
                },
              },
            );
            ref.current?.setAttribute("data-motion-ready", "true");
            return () => {
              tween.scrollTrigger?.kill();
              tween.kill();
              ref.current?.removeAttribute("data-motion-ready");
            };
          },
        );
        revert = () => match.revert();
      })
      .catch(() => {
        /* The static, accessible cards remain usable if animation cannot load. */
      });
    return () => {
      cancelled = true;
      revert?.();
    };
  }, [near, reduced]);
  const items = visualEquipmentIds.map((id) =>
    equipment.find((item) => item.id === id)!,
  );
  return (
    <section
      ref={ref}
      className="equipment-journey"
      aria-labelledby="journey-title"
    >
      <div className="container">
        <div className="journey-heading">
          <div className="eyebrow">
            <span className="short-line" /> CADA PROJETO TEM UM CAMINHO
          </div>
          <h2 id="journey-title">
            ESCOLHA O SEU
            <br />
            <span className="muted">PRÓXIMO MOVIMENTO.</span>
          </h2>
        </div>
        <div className="journey-stage">
          {items.map((item, index) => (
            <JourneyCard key={item.id} index={index}>
              <div className="journey-photo">
                <Image
                  src={item.image}
                  alt={`${item.name} — imagem ilustrativa gerada por IA`}
                  fill
                  sizes="(max-width:767px) 100vw, (max-width:1023px) 45vw, 38vw"
                  style={{ objectPosition: item.position }}
                />
                <span className="demo-badge">DEMONSTRATIVO · IA</span>
              </div>
              <div className="journey-copy">
                <span className="card-category">{item.category}</span>
                <h3>{item.name}</h3>
                <p>{item.description}</p>
                <a
                  href={whatsappUrl(
                    `Olá! Gostaria de solicitar um orçamento para locação de ${item.name}.`,
                  )}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={() =>
                    trackIntent("whatsapp_click", "equipment-journey", item.id)
                  }
                >
                  Solicitar orçamento <ArrowUpRight size={18} />
                </a>
              </div>
            </JourneyCard>
          ))}
        </div>
        <p className="journey-disclaimer">
          Seleção demonstrativa. Consulte opções e condições com a equipe.
        </p>
      </div>
    </section>
  );
}

/** The still poster is always present. No video is requested until a real
 * source is configured and the component approaches the viewport. */
export function OperationMedia() {
  const ref = useRef<HTMLDivElement>(null);
  const video = useRef<HTMLVideoElement>(null);
  const near = useInView(ref, { margin: "150px" });
  const reduced = useReducedMotion();
  const [failed, setFailed] = useState(false);
  const [playing, setPlaying] = useState(false);
  const [allowed, setAllowed] = useState(false);
  useEffect(() => {
    const connection = (
      navigator as Navigator & { connection?: { saveData?: boolean } }
    ).connection;
    setAllowed(
      !connection?.saveData && window.matchMedia("(min-width:768px)").matches,
    );
  }, []);
  const enabled =
    Boolean(operationMedia.videoSrc) && allowed && !reduced && !failed;
  useEffect(() => {
    const element = video.current;
    if (!enabled || !element) return;
    if (!near) {
      element.pause();
      return;
    }
    const timeout = setTimeout(() => {
      if (element.readyState < 3) setFailed(true);
    }, 8000);
    void element.play().catch(() => setFailed(true));
    return () => {
      clearTimeout(timeout);
      element.pause();
    };
  }, [enabled, near]);
  return (
    <div ref={ref} className="operation-media">
      <Image
        src={operationMedia.poster}
        alt="Escavadeira em paisagem cinematográfica, imagem ilustrativa gerada por IA"
        fill
        sizes="100vw"
        quality={90}
      />
      {enabled && near && (
        <video
          ref={video}
          className={playing ? "media-playing" : ""}
          muted
          loop
          playsInline
          preload="none"
          poster={operationMedia.poster}
          aria-hidden="true"
          onPlaying={() => setPlaying(true)}
          onError={() => {
            setFailed(true);
            setPlaying(false);
          }}
        >
          <source
            src={operationMedia.videoSrc!}
            type={operationMedia.videoType}
          />
        </video>
      )}
    </div>
  );
}
