# CLJ Locações e Soluções

Prévia demonstrativa navegável em Next.js, React, TypeScript, Tailwind CSS e Framer Motion. Identidade industrial em carvão, grafite e laranja, imagens originais ilustrativas geradas por IA e fontes locais.

## Rodar localmente

Requisitos: Node.js 22 ou 24 e npm. Nenhuma chave, banco de dados ou serviço de backend é necessário.

```sh
npm ci
npm run dev
```

Abra `http://localhost:3000` no seu navegador. Para validar a versão de produção:

```sh
npm run build
npm run start
```

## Verificação

```sh
npm run typecheck
npm run build
npm run test:e2e
```

Os testes Playwright cobrem 320, 360, 375, 390, 430, 768, 1024 e 1440 px, overflow horizontal, menu, busca, filtros, entrada por categoria, detalhes, retorno de foco, teclado, introdução de sessão, movimento reduzido e composição da mensagem do formulário. Não enviam mensagens reais.

No ambiente de nuvem, Chromium está em `/usr/bin/chromium`. Em outra máquina, instale o navegador com `npx playwright install chromium` para usar o navegador gerenciado pelo Playwright. Um executável alternativo pode ser definido em `PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH`.

## Conteúdo e funcionalidades

- `lib/content.ts`: dados da empresa, telefone, categorias, equipamentos e imagens. Todos os equipamentos são demonstrativos; não há preços, capacidade ou disponibilidade inventados.
- `components/site.tsx`: navegação, introdução de até 2,75 segundos, seções, catálogo, modal e formulário. O som é sintetizado localmente e só toca com clique explícito. A introdução aparece uma vez por sessão, pode ser pulada e é omitida com movimento reduzido.
- `app/globals.css` e `app/cinematic.css`: identidade visual, layouts e efeitos responsivos. A composição 2.5D usa fotografias em camadas; o efeito líquido usa um shader WebGL curto com fallback SVG. GSAP/ScrollTrigger é carregado sob demanda na vitrine diagonal desktop.
- `public/images/ASSETS.md`: origem dos assets e orientações para substituição. As capturas recebidas não foram reutilizadas como fotografias públicas. Vídeo não fornecido; há fallback fotográfico otimizado.
- Catálogo aceita links como `/?categoria=Transporte#equipamentos`. Categorias possuem URLs compartilháveis para futuras campanhas.
- Formulário valida os dados e abre uma mensagem no WhatsApp. O usuário precisa revisar e enviar no WhatsApp; não há backend de envio nem confirmação falsa. Nenhum campo é armazenado no site.
- `lib/events.ts`: eventos locais `clj:conversion`, com `whatsapp_click` e `form_whatsapp_open`, origem e ID de equipamento. Não carregam dados pessoais, pixels ou requisições de analytics. O segundo evento representa intenção de abrir o WhatsApp, não mensagem enviada.
- Metadata básica e Open Graph. A prévia usa `noindex, nofollow` para evitar indexação prematura. Não há avaliações, números, endereço, e-mail, CNPJ ou dados estruturados inventados.

## Publicar uma prévia na Vercel

1. Envie este projeto para o repositório GitHub e importe-o na Vercel.
2. Selecione o framework Next.js e a raiz do projeto. Use Node.js 22 ou 24, instalação `npm ci` e build `npm run build`; mantenha o diretório de saída padrão do Next.js.
3. Nenhuma variável de ambiente é necessária. Gere um Preview Deployment e revise o site com o cliente.
4. Não trate a prévia como site oficial: confirme os materiais abaixo antes de configurar o domínio e publicar a versão definitiva.

Este trabalho não executa deploy nem envia alterações ao GitHub automaticamente.

## Antes da versão oficial

- Confirmar o WhatsApp **+55 16 99220-6959** e testar o destino com o responsável.
- Receber logo oficial, variações e orientação de marca.
- Receber catálogo real, categorias, modelos, descrições e informações comerciais aprovadas.
- Receber fotos/vídeos autorizados dos equipamentos e comprovação de direitos de uso.
- Confirmar serviços, região atendida, condições e fluxo comercial; não prometer prazos ou disponibilidade sem aprovação.
- Confirmar razão social, CNPJ, endereço, e-mail, horários e redes sociais, se devam aparecer.
- Aprovar textos, contatos, domínio e política de privacidade conforme o fluxo definitivo.
- Substituir assets e conteúdo demonstrativos, atualizar metadados e só então remover `noindex` em `app/layout.tsx`.
- Definir campanhas e consentimento antes de instalar Google Ads, Meta Pixel ou outro rastreador.

Não há vídeo, analytics, backend ou integração com catálogo externo nesta prévia. O catálogo é editável no arquivo de dados, conforme solicitado.

## Experiência cinematográfica

A introdução já existe no HTML do servidor. `lib/intro-bootstrap.ts` verifica a sessão e movimento reduzido no `<head>`, antes do corpo, sem mostrar a hero e depois cobri-la. O tempo é contado desde essa inicialização: cerca de 2,4 segundos mais 0,35 segundo de saída. A rolagem fica bloqueada e o conteúdo de fundo fica inerte. É possível pular ou usar Escape. Um watchdog de 3 segundos libera o conteúdo se a hidratação falhar; sem JavaScript, o `noscript` mantém a página legível. A introdução não depende de fotos, vídeos ou fontes para terminar.

- `components/cinematic.tsx`: composição 2.5D com fotografias em camadas e perspectiva de mouse; não são modelos 3D reais. Hover líquido só na fotografia, nunca nos textos.
- `components/liquid-renderer.ts`: shader WebGL importado apenas no hover desktop. Pulso de 900 ms, resolução de render limitada, um contexto por vez. Texturas, buffers, shaders, contexto e RAF são liberados ao terminar, sair da viewport ou abandonar o efeito. No mobile há máscara SVG por rolagem, sem contexto WebGL; em movimento reduzido há imagem estática.
- Vitrine diagonal: GSAP + ScrollTrigger importados apenas perto da seção em desktop com movimento permitido. No mobile os mesmos itens usam deslocamentos alternados por rolagem e sticky adaptado; em movimento reduzido permanecem estáticos. Listeners e triggers têm limpeza local.
- Soluções: os três serviços e seus links originais foram preservados em painéis sticky sobrepostos no desktop; mobile usa sticky adaptado, com fallback vertical em movimento reduzido ou paisagem baixa.
- Impacto: a fotografia cresce por transformação durante o scroll, sem alterar o fluxo do documento. O componente `OperationMedia` aceita vídeo oficial futuro por `lib/media.ts`; atualmente `videoSrc` é `null`, sem requests de vídeos fictícios.
- Vídeo futuro: poster sempre presente; reprodução silenciosa apenas perto da viewport, pausa fora dela, fallback em falha/timeout. Em movimento reduzido, economia de dados ou telas pequenas, permanece a fotografia.
- Cards: imagens maiores, bordas discretas, linha laranja e destaque de ação no hover/foco; informações essenciais permanecem visíveis; no mobile há opções adicionais de orçamento por toque/foco, além do modal original.

As duas fontes ilustrativas permanecem em 1536 × 1024; não foram substituídas nem ampliadas artificialmente. Next/Image gera AVIF/WebP e variantes até essa largura. Para melhorar a nitidez fullscreen/retina, são necessários arquivos oficiais autorizados de 2560 px ou mais. `public/images/ASSETS.md` registra a auditoria.

Os testes incluem primeira pintura antes da hidratação, sessão repetida, falha de scripts, JavaScript desativado, oito larguras, ausência de erros de console, filtro/modal/formulário, ScrollTrigger, expansão, painéis sticky, fallback SVG, movimento reduzido e shader real com liberação de contexto em Chromium/SwiftShader. A validação local não representa um teste em todos os dispositivos físicos ou uma confirmação do deploy na Vercel.

## Composição e validação mobile

A hero para smartphones usa título de 38–54 px, CTAs de 50 px lado a lado, navbar compacta e o caminhão integrado desde o topo. `app/mobile.css` contém as regras isoladas do desktop, e `components/mobile-motion.tsx` controla preferências, breakpoints e atualização de medidas.

Consulte [a matriz de efeitos e a evidência de testes](docs/mobile.md) para o comportamento de cada breakpoint, comparação do desktop, fallback de aparelhos modestos e a limitação de Safari iOS nativo neste ambiente.
