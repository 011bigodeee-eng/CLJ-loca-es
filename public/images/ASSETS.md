# Assets da prévia

- `truck.webp` e `excavator.webp`: imagens originais geradas por IA para esta demonstração; não são fotografias da frota CLJ. Identificação visível no site.
- Capturas de tela recebidas: usadas apenas como referência de direção visual, não publicadas no projeto.
- Fontes Barlow Condensed e Manrope: Google Fonts, SIL Open Font License. Licenças em `/public/fonts/OFL-*.txt`. Arquivos locais para evitar requisições a serviços de fontes.

Substitua as imagens por material oficial autorizado e atualize os textos alternativos, as legendas e os dados em `lib/content.ts` antes de remover as identificações de demonstração. Imagens atuais: 1536 × 1024, WebP, aproximadamente 300 KB cada.

Não foi fornecido vídeo licenciado. A experiência usa fotografias otimizadas com parallax e expansão, sem requests de vídeos inexistentes. Um futuro vídeo oficial deve ter poster, versão comprimida, reprodução silenciosa, fallback em falhas e em modo de movimento reduzido.

## Auditoria de resolução

- `truck.webp`: 1536 × 1024, aproximadamente 294 KB.
- `excavator.webp`: 1536 × 1024, aproximadamente 289 KB.
- Nenhum asset foi ampliado ou substituído neste refinamento. São suficientes para os cards, mas limitados para fullscreen/retina. Necessários originais autorizados com pelo menos 2560 px de largura para esse uso.
- `next.config.ts` limita variantes a 1536 px, preserva `sizes`/`srcset` e habilita AVIF/WebP. Somente a fotografia principal usa prioridade de carregamento; as outras usam lazy loading. Filtros de dessaturação foram removidos do catálogo e dos painéis para preservar detalhes.
- Vídeo oficial futuro é configurado em `lib/media.ts`. Sem fonte configurada não há elemento de vídeo nem tentativa de download.

## Imagens das áreas comerciais

- `cargo-handling.webp`: 1536 × 1024, aproximadamente 328 KB, imagem original gerada por IA de caminhão com guindaste e carga.
- `operational-support.webp`: 1536 × 1024, aproximadamente 380 KB, imagem original gerada por IA de ambiente industrial.
- Identificação de imagem ilustrativa visível nos cards e painéis. Não documentam equipamentos, instalações, capacidade ou pessoal da CLJ. Os nomes das áreas vêm do conteúdo fornecido pelo usuário, não das ilustrações.
- A nova captura de catálogo contém marcas de terceiros e foi utilizada somente como referência. Não foi copiada para os assets públicos do site.
