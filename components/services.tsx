"use client";
import Image from "next/image";
import { motion, useReducedMotion } from "framer-motion";
import {
  ArrowUpRight,
  Truck,
  HardHat,
  MoveUpRight,
  Workflow,
} from "lucide-react";
import { services, type ServiceId } from "@/lib/services";
import { quoteMessage, whatsappUrl } from "@/lib/content";
import { trackIntent } from "@/lib/events";
const icons = {
  transporte: Truck,
  "locacao-equipamentos": HardHat,
  "movimentacao-cargas": MoveUpRight,
  "apoio-operacional": Workflow,
};
export function ServiceIcon({ id }: { id: ServiceId }) {
  const Icon = icons[id];
  return <Icon size={24} strokeWidth={1.4} />;
}

export function ServiceOverview() {
  const reduced = useReducedMotion();
  return (
    <section
      id="solucoes"
      className="section service-overview"
      aria-labelledby="services-title"
    >
      <div className="container">
        <motion.div
          className="reveal section-heading service-overview-heading"
          initial={reduced ? false : { opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-30px" }}
          onViewportEnter={(entry) =>
            entry?.target.setAttribute("data-revealed", "true")
          }
          transition={{ duration: reduced ? 0 : 0.6 }}
        >
          <div>
            <div className="eyebrow">
              <span className="short-line" /> ÁREAS DE ATUAÇÃO DA CLJ
            </div>
            <h2 id="services-title">
              NOSSAS <span className="outline-word">SOLUÇÕES.</span>
            </h2>
          </div>
          <p>
            Conheça as áreas de atuação da CLJ.
            <br />
            Converse com a equipe sobre o que seu projeto precisa.
          </p>
        </motion.div>
        <div className="service-overview-grid">
          {services.map((service, index) => (
            <motion.article
              key={service.id}
              data-service-id={service.id}
              className="reveal service-overview-card"
              initial={reduced ? false : { opacity: 0, y: 26 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-25px" }}
              transition={{
                duration: reduced ? 0 : 0.6,
                delay: reduced ? 0 : index * 0.05,
              }}
              onPointerMove={(event) => {
                if (
                  reduced ||
                  event.pointerType !== "mouse" ||
                  !matchMedia("(min-width:1024px)").matches
                )
                  return;
                const card = event.currentTarget;
                const rect = card.getBoundingClientRect();
                card.style.setProperty(
                  "--service-tilt-x",
                  `${((event.clientY - rect.top - rect.height / 2) / rect.height) * -2}deg`,
                );
                card.style.setProperty(
                  "--service-tilt-y",
                  `${((event.clientX - rect.left - rect.width / 2) / rect.width) * 2}deg`,
                );
              }}
              onPointerLeave={(event) => {
                event.currentTarget.style.setProperty(
                  "--service-tilt-x",
                  "0deg",
                );
                event.currentTarget.style.setProperty(
                  "--service-tilt-y",
                  "0deg",
                );
              }}
            >
              <div className="service-card-surface">
                <a
                  href={`#${service.target}`}
                  className="service-overview-image"
                  aria-label={`Conhecer ${service.title}`}
                >
                  <Image
                    src={service.image}
                    alt={service.imageAlt}
                    fill
                    sizes="(max-width:599px) 100vw,(max-width:1199px) 50vw,25vw"
                    quality={90}
                    style={{ objectPosition: service.position }}
                  />
                  <span className="service-image-notice">
                    IMAGEM ILUSTRATIVA · IA
                  </span>
                  <span className="service-image-action">
                    <ArrowUpRight size={20} />
                  </span>
                </a>
                <div className="service-overview-copy">
                  <div className="service-card-number">
                    <ServiceIcon id={service.id} />
                    <span>0{index + 1}</span>
                  </div>
                  <h3>
                    <a href={`#${service.target}`}>{service.title}</a>
                  </h3>
                  <p>{service.description}</p>
                  <span className="service-extra">
                    Vamos entender a sua necessidade.
                  </span>
                  <a
                    className="button service-quote"
                    href={whatsappUrl(quoteMessage(service.title))}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={() =>
                      trackIntent(
                        "whatsapp_click",
                        "service-overview",
                        undefined,
                        service.id,
                      )
                    }
                  >
                    Solicitar orçamento <ArrowUpRight size={17} />
                  </a>
                </div>
              </div>
            </motion.article>
          ))}
        </div>
        <p className="service-overview-note">
          Áreas de atuação informadas a partir do catálogo comercial da CLJ.
          Imagens ilustrativas. Escopo, condições e disponibilidade devem ser
          confirmados com a equipe.
        </p>
      </div>
    </section>
  );
}
