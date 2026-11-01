# Áreas comerciais da CLJ

A organização foi fornecida pelo usuário a partir do catálogo comercial: a entrada “CLJ Locações & Soluções” é institucional; as quatro áreas são **Transporte**, **Locação de Equipamentos**, **Movimentação de Cargas** e **Apoio Operacional**.

## Ordem e conteúdo

A ordem principal é Hero → Sobre a CLJ → Nossas Soluções (as quatro áreas) → Catálogo de Equipamentos. Somente depois entram as composições de equipamentos e os painéis editoriais de Transporte, Movimentação de Cargas e Apoio Operacional, seguidos pelo fluxo de orçamento e contato. Nenhum destaque meramente visual foi colocado entre Sobre e as quatro áreas.

Os nomes das quatro áreas são informações fornecidas pelo usuário. Os textos de apresentação são sugestões comerciais; o escopo, as condições e a disponibilidade precisam de confirmação. O catálogo de equipamentos continua claramente demonstrativo e não representa uma frota confirmada.

## Arquivos

- `lib/services.ts`: dados editáveis das áreas, descrições, imagens, destinos e status da confirmação.
- `components/services.tsx` e `app/services.css`: vitrine das quatro áreas, animação de entrada, fotos, hover/foco, profundidade e CTAs.
- `components/site.tsx`: ordem da página, apresentação institucional, painéis editoriais sobrepostos, formulário com áreas e equipamentos e links comerciais.
- `lib/content.ts` e `lib/events.ts`: mensagem compartilhada de orçamento e eventos locais, distinguindo `serviceId` de `equipmentId`.
- `components/cinematic.tsx`: preserva os efeitos de equipamentos e utiliza o formato compartilhado de mensagem.
- `app/layout.tsx`: carrega os estilos específicos sem substituir o design existente.
- `public/images/cargo-handling.webp` e `public/images/operational-support.webp`: novas imagens originais geradas por IA, identificadas como ilustrativas. As imagens da hero e da escavadeira foram preservadas.
- `tests/services.spec.ts` e `tests/site.spec.ts`: ordem, quatro áreas, destinos/assuntos de WhatsApp, formulário, eventos locais e layout dos serviços nos quatro tamanhos de smartphone.

## Orçamentos

Cada área tem um CTA direto para `https://wa.me/5516992206959`, com a mensagem codificada:

> Olá! Conheci o site da CLJ e gostaria de solicitar um orçamento para [área ou equipamento].

Os botões de orçamento da navbar, hero e rodapé também usam WhatsApp. O formulário continua permitindo revisar e enviar no WhatsApp; não existe confirmação falsa de envio. Os eventos de intenção permanecem locais, sem pixels ou captura de campos pessoais.

## Apresentação e animações

Desktop: quatro áreas lado a lado em telas a partir de 1200 px; duas colunas nas larguras intermediárias. Fotos, hierarquia e paleta seguem o site existente. Os cards têm zoom leve de imagem, perspectiva de ponteiro, revelação de informação complementar no hover/foco e linha laranja. Os detalhes reutilizam os painéis editoriais sticky e o parallax existentes.

Smartphones: uma coluna abaixo de 600 px, conteúdo essencial sempre visível, CTAs laranja e navegação por toque. Animações têm movimento reduzido/fallback, e as regras anteriores da hero mobile foram preservadas.

O desktop não foi reconstruído. A ordem da navegação e a altura total do documento mudam para acomodar as áreas solicitadas. A identidade e a hero permanecem; a vitrine de serviços e seus textos são alterações intencionais de conteúdo.

## Dados e materiais pendentes

- Validar o número comercial antes da publicação definitiva.
- Aprovar descrições, escopo e condições de cada área.
- Fornecer catálogo real e fotografias/vídeos oficiais autorizados.
- Confirmar eventuais modelos, capacidades, cobertura, disponibilidade ou certificações antes de publicá-los; nenhuma dessas informações foi inventada.
- Fornecer logo e demais dados institucionais oficiais quando disponíveis.

As capturas recebidas foram usadas como referência e não foram publicadas como fotografias próprias da empresa.

## Validação

Build de produção, TypeScript e 42 testes passaram. A suíte verifica a posição exata da seção imediatamente após Sobre e antes do catálogo, os quatro nomes, todos os links de orçamento no WhatsApp, assunto específico por área, eventos locais separados, formulário com serviço e leitura dos cards em 360, 375, 390 e 430 px, além das regressões existentes de desktop, mobile, introdução e animações. Não foram enviadas mensagens reais ao WhatsApp.

Safari iOS nativo não está disponível neste ambiente; os testes móveis usam Chromium com emulação de viewport e toque.

A comparação da área principal da hero desktop com a captura anterior registrou zero pixels diferentes na região medida, excluindo a navbar reordenada e o canto do contato flutuante. Isso confirma a preservação da hero, não uma igualdade de toda a página: as novas áreas alteram intencionalmente a ordem e a altura do conteúdo.

Também foram atualizados `README.md`, `docs/mobile.md` e `public/images/ASSETS.md` para registrar a organização comercial, o histórico de validação mobile e a procedência das ilustrações.
