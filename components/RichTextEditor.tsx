'use client';

import React, { useRef } from 'react';
import {
  Bold, Italic, Heading1, Heading2, List, ListOrdered,
  Table as TableIcon, Image as ImageIcon, Link as LinkIcon,
  Code, Sparkles, CheckSquare
} from 'lucide-react';

interface RichTextEditorProps {
  value: string;
  onChange: (content: string) => void;
}

export default function RichTextEditor({ value, onChange }: RichTextEditorProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const insertFormatting = (prefix: string, suffix: string = '') => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = value.substring(start, end) || 'Sample text';
    const replacement = `${prefix}${selectedText}${suffix}`;

    const newValue = value.substring(0, start) + replacement + value.substring(end);
    onChange(newValue);

    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(start + prefix.length, end + prefix.length);
    }, 50);
  };

  const insertProductTable = () => {
    const tableSnippet = `
<table className="w-full border-collapse border border-neutral-200 my-4 text-sm">
  <thead>
    <tr className="bg-neutral-100 font-bold">
      <th className="border border-neutral-200 p-2 text-left">Feature</th>
      <th className="border border-neutral-200 p-2 text-left">Specification</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td className="border border-neutral-200 p-2">Brand</td>
      <td className="border border-neutral-200 p-2">Apple / Sony / Samsung</td>
    </tr>
    <tr>
      <td className="border border-neutral-200 p-2">Display / Audio</td>
      <td className="border border-neutral-200 p-2">High Resolution / ANC</td>
    </tr>
  </tbody>
</table>
`;
    insertFormatting(tableSnippet);
  };

  return (
    <div className="border border-neutral-300 rounded-2xl overflow-hidden bg-white shadow-sm">
      {/* Toolbar */}
      <div className="bg-neutral-100 border-b border-neutral-200 p-2 flex flex-wrap items-center gap-1">
        <button
          type="button"
          onClick={() => insertFormatting('<strong>', '</strong>')}
          className="p-2 hover:bg-neutral-200 rounded-lg text-neutral-700 hover:text-neutral-900 transition-colors"
          title="Bold"
        >
          <Bold className="w-4 h-4" />
        </button>

        <button
          type="button"
          onClick={() => insertFormatting('<em>', '</em>')}
          className="p-2 hover:bg-neutral-200 rounded-lg text-neutral-700 hover:text-neutral-900 transition-colors"
          title="Italic"
        >
          <Italic className="w-4 h-4" />
        </button>

        <div className="w-px h-5 bg-neutral-300 mx-1" />

        <button
          type="button"
          onClick={() => insertFormatting('<h2>', '</h2>')}
          className="p-2 hover:bg-neutral-200 rounded-lg text-neutral-700 hover:text-neutral-900 transition-colors"
          title="Heading 2"
        >
          <Heading1 className="w-4 h-4" />
        </button>

        <button
          type="button"
          onClick={() => insertFormatting('<h3>', '</h3>')}
          className="p-2 hover:bg-neutral-200 rounded-lg text-neutral-700 hover:text-neutral-900 transition-colors"
          title="Heading 3"
        >
          <Heading2 className="w-4 h-4" />
        </button>

        <div className="w-px h-5 bg-neutral-300 mx-1" />

        <button
          type="button"
          onClick={() => insertFormatting('<ul>\n  <li>', '</li>\n</ul>')}
          className="p-2 hover:bg-neutral-200 rounded-lg text-neutral-700 hover:text-neutral-900 transition-colors"
          title="Unordered List"
        >
          <List className="w-4 h-4" />
        </button>

        <button
          type="button"
          onClick={() => insertFormatting('<ol>\n  <li>', '</li>\n</ol>')}
          className="p-2 hover:bg-neutral-200 rounded-lg text-neutral-700 hover:text-neutral-900 transition-colors"
          title="Ordered List"
        >
          <ListOrdered className="w-4 h-4" />
        </button>

        <div className="w-px h-5 bg-neutral-300 mx-1" />

        <button
          type="button"
          onClick={() => insertFormatting('<a href="https://amazon.com" target="_blank" rel="noopener">', '</a>')}
          className="p-2 hover:bg-neutral-200 rounded-lg text-neutral-700 hover:text-neutral-900 transition-colors"
          title="Link"
        >
          <LinkIcon className="w-4 h-4" />
        </button>

        <button
          type="button"
          onClick={() => insertFormatting('<img src="', '" alt="Product Image" className="rounded-2xl my-4 w-full" />')}
          className="p-2 hover:bg-neutral-200 rounded-lg text-neutral-700 hover:text-neutral-900 transition-colors"
          title="Insert Image"
        >
          <ImageIcon className="w-4 h-4" />
        </button>

        <button
          type="button"
          onClick={() => insertFormatting('<code>', '</code>')}
          className="p-2 hover:bg-neutral-200 rounded-lg text-neutral-700 hover:text-neutral-900 transition-colors"
          title="Code snippet"
        >
          <Code className="w-4 h-4" />
        </button>

        <div className="w-px h-5 bg-neutral-300 mx-1" />

        <button
          type="button"
          onClick={insertProductTable}
          className="px-2.5 py-1 text-xs font-semibold hover:bg-neutral-200 rounded-lg text-neutral-800 flex items-center gap-1"
          title="Insert Product Table"
        >
          <TableIcon className="w-3.5 h-3.5" />
          <span>Product Table</span>
        </button>
      </div>

      {/* Textarea Input */}
      <textarea
        ref={textareaRef}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        rows={16}
        className="w-full p-4 text-sm font-mono text-neutral-900 bg-white outline-none resize-y leading-relaxed"
        placeholder="Write blog content here (HTML / Markdown supported)..."
      />
    </div>
  );
}
