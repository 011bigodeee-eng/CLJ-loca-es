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

Os testes Playwright cobrem 320, 375, 390, 768, 1024 e 1440 px, overflow horizontal, menu, busca, filtros, entrada por categoria, detalhes, retorno de foco, teclado, introdução de sessão, movimento reduzido e composição da mensagem do formulário. Não enviam mensagens reais.

No ambiente de nuvem, Chromium está em `/usr/bin/chromium`. Em outra máquina, instale o navegador com `npx playwright install chromium` para usar o navegador gerenciado pelo Playwright. Um executável alternativo pode ser definido em `PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH`.

## Conteúdo e funcionalidades

- `lib/content.ts`: dados da empresa, telefone, categorias, equipamentos e imagens. Todos os equipamentos são demonstrativos; não há preços, capacidade ou disponibilidade inventados.
- `components/site.tsx`: navegação, introdução de 2,5 segundos, seções, catálogo, modal e formulário. O som é sintetizado localmente e só toca com clique explícito. A introdução aparece uma vez por sessão, pode ser pulada e é omitida com movimento reduzido.
- `app/globals.css`: identidade visual, layouts e efeitos responsivos. Elementos 3D leves usam CSS, sem WebGL, GSAP ou bibliotecas adicionais de renderização.
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
