export const company = {
  name: "CLJ Locações e Soluções",
  whatsapp: "5516992206959",
  phoneDisplay: "(16) 99220-6959",
  phoneConfirmed: false,
  demo: true,
};
export const categories = [
  "Todos",
  "Caminhões",
  "Transporte",
  "Máquinas pesadas",
  "Equipamentos para obras",
  "Outros equipamentos",
] as const;
export type Equipment = {
  id: string;
  name: string;
  category: string;
  description: string;
  image: string;
  position: string;
  demo: true;
  gallery: string[];
};
export const equipment: Equipment[] = [
  {
    id: "caminhao-prancha",
    name: "Caminhão prancha",
    category: "Caminhões",
    description:
      "Uma possibilidade para movimentar equipamentos e conectar as etapas da sua operação.",
    image: "/images/truck.webp",
    position: "72% center",
    demo: true,
    gallery: ["/images/truck.webp"],
  },
  {
    id: "escavadeira",
    name: "Escavadeira hidráulica",
    category: "Máquinas pesadas",
    description:
      "Uma referência de equipamento para projetos de movimentação de terra e construção.",
    image: "/images/excavator.webp",
    position: "65% center",
    demo: true,
    gallery: ["/images/excavator.webp"],
  },
  {
    id: "transporte-equipamentos",
    name: "Transporte de equipamentos",
    category: "Transporte",
    description:
      "Conte sua necessidade de movimentação para conversar sobre as possibilidades.",
    image: "/images/truck.webp",
    position: "93% center",
    demo: true,
    gallery: ["/images/truck.webp"],
  },
  {
    id: "equipamentos-obra",
    name: "Equipamentos para obras",
    category: "Equipamentos para obras",
    description:
      "Apresente a etapa do seu projeto e consulte a equipe sobre os equipamentos.",
    image: "/images/excavator.webp",
    position: "48% center",
    demo: true,
    gallery: ["/images/excavator.webp"],
  },
  {
    id: "outras-solucoes",
    name: "Outras necessidades",
    category: "Outros equipamentos",
    description:
      "Não encontrou o que procura? Compartilhe sua demanda com a equipe comercial.",
    image: "/images/truck.webp",
    position: "55% center",
    demo: true,
    gallery: ["/images/truck.webp"],
  },
];
export const navigation = [
  ["inicio", "Início"],
  ["sobre", "Sobre"],
  ["equipamentos", "Equipamentos"],
  ["solucoes", "Soluções"],
  ["como-funciona", "Como funciona"],
  ["contato", "Contato"],
] as const;
export function whatsappUrl(message: string) {
  return `https://wa.me/${company.whatsapp}?text=${encodeURIComponent(message)}`;
}
