# Mobile: composição, efeitos e validação

O desktop aprovado foi preservado. A composição para smartphones fica em `app/mobile.css`, com regras visuais até 767 px; os efeitos adaptativos podem ser ativados até 1023 px. Não há novas dependências.

## Hero para smartphones

- Navbar de 64 px, marca textual preservada e menu com alvo de toque de 44 px.
- Título com `clamp(38px, 12.1vw, 54px)`. Nos perfis de 360, 375, 390 e 430 px, os tamanhos são aproximadamente 43,6, 45,4, 47,2 e 52 px.
- Texto de apoio de 14 px e frase institucional de 10 px.
- CTAs de 50 px lado a lado; rótulos visuais compactos, com nomes acessíveis completos.
- Hero de até 740 px, usando `svh`. No perfil 375 × 667, a altura é 667 px. Em telas muito baixas, a altura mínima é 640 px, mantendo título, CTAs e caminhão visíveis sem exigir uma seção de 900 px.
- Caminhão integrado ao fundo desde 64 px, com proporções preservadas e gradientes para legibilidade.
- O `sizes` mobile considera o recorte de `cover` e solicita uma variante de pelo menos 1080 px, em vez de ampliar uma miniatura de 390 px. As fontes continuam sendo os mesmos arquivos de 1536 × 1024, sem ampliação artificial.

## Efeitos por breakpoint

| Recurso             | Smartphone, 320–767 px                                                                                         | Tablet, 768–1023 px           | Desktop, a partir de 1024 px                      |
| ------------------- | -------------------------------------------------------------------------------------------------------------- | ----------------------------- | ------------------------------------------------- |
| Scroll reveal       | Framer Motion: títulos, máscaras, imagens e cards; linhas desenhadas ao entrar                                 | Mesmo mecanismo responsivo    | Comportamento aprovado preservado                 |
| Profundidade        | Camadas com deslocamento e perspectiva suaves, controlados pela rolagem                                        | Profundidade por rolagem      | Perspectiva de mouse e parallax existentes        |
| Transição líquida   | Máscara SVG ondulada por rolagem sobre a fotografia; a imagem base nunca é ocultada                            | Mesmo efeito SVG              | Shader WebGL no hover, com fallback SVG existente |
| Vitrine diagonal    | Sequência vertical com deslocamentos e rotações alternados; sobreposição sticky em retrato com altura ≥ 650 px | Grid com deslocamentos suaves | GSAP/ScrollTrigger existente                      |
| Painéis de soluções | Sticky, escala e opacidade controladas pelo scroll, foco elevado acima dos outros painéis                      | Sticky adaptado               | Painéis aprovados preservados                     |
| Imagem expansiva    | Aproximadamente 85% → 100%, raio 22 px → 0 e título sobre a imagem                                             | Expansão adaptada             | Comportamento aprovado preservado                 |
| Opções de orçamento | Revelação por toque/foco; informações essenciais e modal continuam disponíveis                                 | Mesmas opções acessíveis      | Sem alterações visuais no catálogo                |

Não existe vídeo autorizado configurado: a seção expansiva usa a imagem cinematográfica real do projeto. O componente continua preparado para um vídeo futuro em `lib/media.ts`.

## Fallbacks e estabilidade

`components/mobile-motion.tsx` centraliza os breakpoints e as preferências. Movimento reduzido, economia de dados, memória informada ≤ 2 GB ou até dois núcleos informados mantêm as versões estáticas das composições avançadas. No modo de movimento reduzido, a introdução e animações são omitidas; imagens e ações continuam acessíveis. Em paisagem com altura ≤ 600 px, os painéis deixam de fixar e a expansão permanece estática, para não prender a navegação.

As transformações usam variáveis CSS e MotionValues, sem renderizações React a cada frame. Um ResizeObserver limitado ao layout mobile recalcula as medidas após mudanças de conteúdo, tamanho e orientação. Observer, listeners e RAF de atualização são limpos. O mobile não cria um contexto WebGL para a transição líquida.

A abertura continua no HTML inicial, com decisão no `<head>`, antes da pintura, e rolagem bloqueada durante a introdução. O watchdog também libera o conteúdo quando os scripts falham numa sessão repetida. Sem JavaScript, o fallback CSS mantém a página legível.

O WhatsApp flutuante recolhe na hero, catálogo, vitrine diagonal, soluções, seção de impacto, contato e rodapé no mobile, onde já existem ações próprias.

## Evidência de validação

- Build de produção e TypeScript aprovados.
- 34 testes Playwright passaram: oito larguras (320, 360, 375, 390, 430, 768, 1024 e 1440), incluindo emulação de toque nos perfis 375 × 667, 390 × 844, 430 × 932 e 360 × 800.
- Verificação funcional dos movimentos: matriz de profundidade muda com scroll, caminho da máscara SVG muda, cards se deslocam, largura da mídia cresce e raio diminui, painéis fixam e links focados permanecem expostos.
- Introdução antes da hidratação, toque para pular, falha de scripts, sessão repetida, JavaScript desativado, menu, catálogo, modal e mensagens de WhatsApp verificados. Nenhuma mensagem real foi enviada.
- Ausência de erros de console e overflow horizontal nas larguras verificadas. Fallback de aparelho modesto e mudança de orientação verificados.
- Auditoria Axe WCAG 2 A/AA e 2.1 AA no perfil mobile sem violações detectadas.
- Hero desktop de 1440 × 900 comparada por pixels com a captura anterior: zero diferenças na área comparada, excluindo o canto reservado ao botão flutuante. A altura total do documento desktop permaneceu em 9476 px. A comparação não representa certificação visual de todos os frames animados.
- CLS observado igual a 0 nas capturas locais de 375, 390 e 430 px após carregar fontes e imagem. Esse resultado não representa todas as condições de rede ou aparelhos físicos.

Safari iOS nativo não está disponível neste ambiente. As verificações de smartphone usam Chromium com emulação de viewport, DPR e toque; não foram executadas em iPhones físicos. A confirmação no Safari real continua recomendada antes da publicação definitiva.
