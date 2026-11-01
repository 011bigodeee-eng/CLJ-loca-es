// The user supplied these four area names from the CLJ commercial catalog.
// Only the area names are confirmed. Scope, assets and conditions need approval.
export type ServiceId =
  | "transporte"
  | "locacao-equipamentos"
  | "movimentacao-cargas"
  | "apoio-operacional";
export type Service = {
  id: ServiceId;
  title: string;
  description: string;
  detail: string;
  image: string;
  imageAlt: string;
  position: string;
  target: string;
  areaConfirmed: true;
  detailsConfirmed: false;
  illustrativeImage: true;
};
export const services: Service[] = [
  {
    id: "transporte",
    title: "Transporte",
    description:
      "Soluções de transporte para atender às necessidades de diferentes operações.",
    detail:
      "Conte o que precisa transportar e compartilhe os detalhes da sua demanda. A equipe comercial pode esclarecer as possibilidades e as condições para o seu projeto.",
    image: "/images/truck.webp",
    imageAlt: "Caminhão em uma cena de transporte ilustrativa gerada por IA",
    position: "75% center",
    target: "transporte",
    areaConfirmed: true,
    detailsConfirmed: false,
    illustrativeImage: true,
  },
  {
    id: "locacao-equipamentos",
    title: "Locação de Equipamentos",
    description:
      "Consulte opções de equipamentos para atender às demandas do seu projeto.",
    detail:
      "Explore o catálogo demonstrativo e consulte a equipe sobre os equipamentos disponíveis para a sua necessidade.",
    image: "/images/excavator.webp",
    imageAlt: "Equipamento de construção ilustrativo gerado por IA",
    position: "65% center",
    target: "equipamentos",
    areaConfirmed: true,
    detailsConfirmed: false,
    illustrativeImage: true,
  },
  {
    id: "movimentacao-cargas",
    title: "Movimentação de Cargas",
    description: "Soluções voltadas às necessidades de movimentação de cargas.",
    detail:
      "Compartilhe a necessidade de movimentação da sua operação. Converse com a equipe para alinhar o escopo e confirmar as condições aplicáveis, sem pressupor capacidades ou características técnicas.",
    image: "/images/cargo-handling.webp",
    imageAlt:
      "Cena ilustrativa gerada por IA de caminhão com guindaste movimentando uma carga",
    position: "54% center",
    target: "movimentacao-cargas",
    areaConfirmed: true,
    detailsConfirmed: false,
    illustrativeImage: true,
  },
  {
    id: "apoio-operacional",
    title: "Apoio Operacional",
    description: "Soluções de apoio para diferentes necessidades operacionais.",
    detail:
      "Apresente o contexto da sua operação e o apoio que procura. A equipe comercial pode conversar sobre as possibilidades e os próximos passos para avaliar sua demanda.",
    image: "/images/operational-support.webp",
    imageAlt:
      "Ambiente industrial ilustrativo com equipamento e materiais, gerado por IA",
    position: "50% center",
    target: "apoio-operacional",
    areaConfirmed: true,
    detailsConfirmed: false,
    illustrativeImage: true,
  },
];
export const detailedServices = services.filter(
  (service) => service.id !== "locacao-equipamentos",
);
