/**
 * Custom Markdown & HTML parser for rendering blog posts with full formatting:
 * Headings (#, ##, ###), Tables (| col | col |), Lists (* item, - item), Bold (**text**), 
 * Italics (*text*), Blockquotes (> quote), Images (![alt](url)), Links ([text](url)), Horizontal rules (---).
 */
export function parseMarkdownToHtml(markdown: string): string {
  if (!markdown) return '';

  let html = markdown.trim().replace(/\r\n/g, '\n');

  // 1. Parse Block Images (![alt](url)) first into full responsive image cards
  html = html.replace(/!\[([^\]]*)\]\(([^)]+)\)/g, (_match, alt, src) => {
    const cleanSrc = src.trim();
    const cleanAlt = (alt || 'Product Hardware Photo').trim();
    return `\n\n<div class="my-10 rounded-3xl overflow-hidden shadow-lg border border-neutral-200/80 dark:border-neutral-800 bg-white dark:bg-neutral-900 p-4 max-w-2xl mx-auto group transition-all duration-300 hover:shadow-xl"><div class="relative overflow-hidden rounded-2xl bg-neutral-100 dark:bg-neutral-800/80 flex items-center justify-center p-3"><img src="${cleanSrc}" alt="${cleanAlt}" class="w-full h-auto max-h-[460px] object-contain rounded-xl mx-auto transition-transform duration-500 group-hover:scale-[1.03]" loading="lazy" onError="this.src='https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=800&auto=format&fit=crop&q=80'" /></div><div class="flex items-center justify-center gap-2 mt-3 text-xs font-semibold text-neutral-600 dark:text-neutral-400"><span class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-neutral-100 dark:bg-neutral-800 text-[11px] font-bold text-neutral-800 dark:text-neutral-200 border border-neutral-200/60 dark:border-neutral-700">📸 ${cleanAlt}</span></div></div>\n\n`;
  });

  // 2. Parse Markdown Tables with sleek modern styling
  const tableRegex = /^\|(.+)\|\n\|(?:\s*[-:]+[-|\s:]*)\|\n((?:\|.+\|\n?)+)/gm;
  html = html.replace(tableRegex, (match, headerRow, bodyRows) => {
    const headers = headerRow
      .split('|')
      .map((h: string) => h.trim())
      .filter((h: string) => h.length > 0);

    const rows = bodyRows
      .trim()
      .split('\n')
      .map((row: string) =>
        row
          .split('|')
          .map((cell: string) => cell.trim())
          .filter((cell: string) => cell.length > 0)
      );

    const thead = `<thead><tr class="bg-gradient-to-r from-neutral-100 to-neutral-50 dark:from-neutral-800 dark:to-neutral-850 text-neutral-900 dark:text-white font-extrabold border-b-2 border-neutral-200 dark:border-neutral-700">${headers
      .map((h: string) => `<th class="p-3.5 border-r border-neutral-200 dark:border-neutral-700 text-left text-xs uppercase tracking-wider">${formatInlineMarkdown(h)}</th>`)
      .join('')}</tr></thead>`;

    const tbody = `<tbody>${rows
      .map(
        (r: string[], idx: number) =>
          `<tr class="${idx % 2 === 0 ? 'bg-white dark:bg-neutral-900' : 'bg-neutral-50/70 dark:bg-neutral-800/40'} border-b border-neutral-100 dark:border-neutral-800 hover:bg-brand-50/30 dark:hover:bg-brand-950/20 transition-colors">${r
            .map((cell: string) => `<td class="p-3.5 border-r border-neutral-200/50 dark:border-neutral-800 text-sm font-medium text-neutral-800 dark:text-neutral-200">${formatInlineMarkdown(cell)}</td>`)
            .join('')}</tr>`
      )
      .join('')}</tbody>`;

    return `<div class="overflow-x-auto my-8 border border-neutral-200 dark:border-neutral-800 rounded-3xl shadow-sm"><table class="w-full text-left text-xs border-collapse">${thead}${tbody}</table></div>`;
  });

  // 3. Parse Callouts & Block Quotes ( > Quote text )
  html = html.replace(/^>\s*(?:\[!(?:NOTE|TIP|IMPORTANT)\]\s*)?(.+)$/gm, (_match, text) => {
    return `<div class="my-6 p-5 rounded-2xl bg-gradient-to-r from-brand-50/80 to-blue-50/40 dark:from-brand-950/40 dark:to-blue-950/20 border-l-4 border-brand-500 shadow-xs space-y-1"><div class="flex items-center gap-1.5 font-extrabold text-brand-900 dark:text-brand-300 text-xs uppercase tracking-wider"><span>💡 Key Takeaway & Analysis</span></div><div class="text-neutral-800 dark:text-neutral-200 text-sm sm:text-base leading-relaxed font-sans font-medium">${text}</div></div>`;
  });

  // 4. Parse Headings
  html = html.replace(/^####\s+(.+)$/gm, '<h4 class="text-lg font-bold text-neutral-900 dark:text-white mt-6 mb-2 tracking-tight">$1</h4>');
  html = html.replace(/^###\s+(.+)$/gm, '<h3 class="text-xl font-extrabold text-neutral-900 dark:text-white mt-8 mb-3 tracking-tight border-b border-neutral-100 dark:border-neutral-800 pb-2">$1</h3>');
  html = html.replace(/^##\s+(.+)$/gm, '<h2 class="text-2xl sm:text-3xl font-black text-neutral-900 dark:text-white mt-10 mb-4 tracking-tight border-b-2 border-brand-500/30 pb-2">$1</h2>');
  html = html.replace(/^#\s+(.+)$/gm, '<h1 class="text-3xl sm:text-4xl font-black text-neutral-900 dark:text-white mt-10 mb-4 tracking-tight">$1</h1>');

  // 5. Parse Horizontal Rules (--- or ***)
  html = html.replace(/^[\*\-]{3,}$/gm, '<hr class="my-8 border-t border-neutral-200 dark:border-neutral-800" />');

  // 6. Parse Lists (* item or - item)
  const listRegex = /(?:^|\n)((?:(?:[*\-]\s+.+)|(?:\d+\.\s+.+))(?:\n(?:[*\-]\s+.+)|(?:\n\d+\.\s+.+))*)/g;
  html = html.replace(listRegex, (match, listBlock) => {
    const lines = listBlock.trim().split('\n');
    const isNumbered = /^\d+\./.test(lines[0].trim());
    const tag = isNumbered ? 'ol' : 'ul';
    const listClass = isNumbered
      ? 'list-decimal list-outside ml-6 space-y-2 my-4 text-neutral-800 dark:text-neutral-200 text-base font-sans'
      : 'list-disc list-outside ml-6 space-y-2 my-4 text-neutral-800 dark:text-neutral-200 text-base font-sans';

    const items = lines
      .map((line: string) => {
        const cleaned = line.replace(/^(?:[*\-]\s+|\d+\.\s+)/, '');
        return `<li>${formatInlineMarkdown(cleaned)}</li>`;
      })
      .join('');

    return `<${tag} class="${listClass}">${items}</${tag}>`;
  });

  // 7. Format Paragraphs (Split by double newlines, wrap in <p>)
  const blocks = html.split(/\n{2,}/);
  const formattedBlocks = blocks.map((block) => {
    const trimmedBlock = block.trim();
    if (!trimmedBlock) return '';

    // If block is already wrapped in HTML container tag, don't wrap in <p>
    if (/^<(h[1-6]|div|table|ul|ol|blockquote|hr|section|p|iframe|img)/i.test(trimmedBlock)) {
      return trimmedBlock;
    }

    // Format single line breaks inside paragraph into <br />
    const formattedParagraph = formatInlineMarkdown(trimmedBlock).replace(/\n/g, '<br />');
    return `<p class="mb-5 leading-relaxed text-neutral-800 dark:text-neutral-200 text-base sm:text-lg font-sans">${formattedParagraph}</p>`;
  });

  return formattedBlocks.join('\n');
}

/**
 * Format inline markdown syntax like **bold**, *italic*, `code`, and [links](url)
 * Uses tokenization to guarantee URLs and tags are never corrupted by underscore regex.
 */
function formatInlineMarkdown(text: string): string {
  if (!text) return '';

  const tokens: string[] = [];

  // Protect HTML tags and Markdown links from italic/bold regex
  let formatted = text.replace(/<[^>]+>/g, (match) => {
    const placeholder = `__HTML_TOKEN_${tokens.length}__`;
    tokens.push(match);
    return placeholder;
  });

  // Protect Markdown Links [label](url)
  formatted = formatted.replace(/\[([^\]]+)\]\(([^)]+)\)/g, (_match, label, url) => {
    const placeholder = `__HTML_TOKEN_${tokens.length}__`;
    const linkHtml = `<a href="${url}" target="_blank" rel="noopener noreferrer" class="text-brand-600 dark:text-brand-400 font-bold underline underline-offset-2 hover:text-brand-700">${label}</a>`;
    tokens.push(linkHtml);
    return placeholder;
  });

  // Inline code `code`
  formatted = formatted.replace(/`([^`]+)`/g, (_match, code) => {
    const placeholder = `__HTML_TOKEN_${tokens.length}__`;
    const codeHtml = `<code class="bg-neutral-100 dark:bg-neutral-800 px-1.5 py-0.5 rounded text-xs font-mono text-brand-600 dark:text-brand-400 border border-neutral-200 dark:border-neutral-700">${code}</code>`;
    tokens.push(codeHtml);
    return placeholder;
  });

  // Bold **text**
  formatted = formatted.replace(/\*\*([^\*]+)\*\*/g, '<strong class="font-extrabold text-neutral-900 dark:text-white">$1</strong>');

  // Italic *text*
  formatted = formatted.replace(/\*([^\*\n]+)\*/g, '<em class="italic">$1</em>');

  // Restore protected tokens
  tokens.forEach((token, index) => {
    formatted = formatted.replace(`__HTML_TOKEN_${index}__`, token);
  });

  return formatted;
}
