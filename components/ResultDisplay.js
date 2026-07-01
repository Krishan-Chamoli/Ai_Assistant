'use client';

import React, { useState } from 'react';
import { Copy, Check, Download, Trash2, Bookmark, Sparkles, FileText, Globe } from 'lucide-react';

/**
 * A fast, lightweight Markdown-to-HTML parser for safety and speed.
 */
function renderSimpleMarkdown(md) {
  if (!md) return '';
  
  // Escape HTML
  let html = md
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');

  // Headings
  html = html.replace(/^# (.*$)/gim, '<h1 class="text-xl font-bold mt-5 mb-3 text-foreground">$1</h1>');
  html = html.replace(/^## (.*$)/gim, '<h2 class="text-lg font-semibold mt-4 mb-2.5 text-foreground border-b border-border pb-1">$1</h2>');
  html = html.replace(/^### (.*$)/gim, '<h3 class="text-md font-medium mt-3.5 mb-2 text-foreground">$1</h3>');

  // Bold text
  html = html.replace(/\*\*(.*?)\*\*/g, '<strong class="font-bold text-foreground">$1</strong>');
  
  // Italic text
  html = html.replace(/\*(.*?)\*/g, '<em class="italic">$1</em>');

  // Lists (Unordered)
  html = html.replace(/^\* (.*$)/gim, '<li class="ml-5 list-disc mb-1 text-xs">$1</li>');
  html = html.replace(/^- (.*$)/gim, '<li class="ml-5 list-disc mb-1 text-xs">$1</li>');

  // Simple table parsing
  html = html.replace(/\|(.*)\|/g, (match) => {
    const cells = match.split('|').slice(1, -1);
    const rowContent = cells.map(c => `<td class="border border-border p-2 text-xs">${c.trim()}</td>`).join('');
    return `<tr class="border-b border-border">${rowContent}</tr>`;
  });
  // Wrap table rows in a table tag
  html = html.replace(/(<tr.*?>[\s\S]*?<\/tr>)+/g, '<div class="overflow-x-auto my-3"><table class="w-full border-collapse border border-border">$1</table></div>');
  // Clean up table headings if present (replace first table row with headers if it has dashes)
  html = html.replace(/<tr>\s*<td.*?>---<\/td>.*?<\/tr>/g, '');

  // Line breaks & paragraphs
  html = html.split('\n').map(line => {
    if (line.trim().startsWith('<h') || line.trim().startsWith('<li') || line.trim().startsWith('<tr') || line.trim().startsWith('<table') || line.trim().startsWith('</table') || line.trim().startsWith('<div') || line.trim().startsWith('</div')) {
      return line;
    }
    return line.trim().length > 0 ? `<p class="mb-3 leading-relaxed text-xs text-muted-foreground/90">${line}</p>` : '';
  }).join('\n');

  return html;
}

export default function ResultDisplay({ generation, onSave, isSaving, hasSaved, onClear }) {
  const [copied, setCopied] = useState(false);
  const [showExportOptions, setShowExportOptions] = useState(false);

  const handleCopy = async () => {
    if (!generation) return;
    try {
      await navigator.clipboard.writeText(generation.output);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy text:', err);
    }
  };

  const handleExport = (format) => {
    if (!generation) return;
    const { contentType, topic, tone, output } = generation;
    let content = '';
    let mimeType = 'text/plain';
    let filename = `${topic.toLowerCase().replace(/[^a-z0-9]+/g, '_')}_generation`;

    if (format === 'txt') {
      content = output;
      mimeType = 'text/plain';
      filename += '.txt';
    } else if (format === 'md') {
      content = `# Generation: ${topic}\nContent Type: ${contentType} | Tone: ${tone}\n\n${output}`;
      mimeType = 'text/markdown';
      filename += '.md';
    } else {
      content = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>${topic} (${contentType})</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif; line-height: 1.6; max-width: 800px; margin: 40px auto; padding: 0 20px; color: #1e293b; }
    h1 { color: #0f172a; border-bottom: 2px solid #e2e8f0; padding-bottom: 10px; }
    h2, h3 { color: #334155; }
    table { width: 100%; border-collapse: collapse; margin: 20px 0; }
    th, td { border: 1px solid #cbd5e1; padding: 10px; text-align: left; }
    tr:nth-child(even) { background-color: #f8fafc; }
  </style>
</head>
<body>
  ${renderSimpleMarkdown(output)}
</body>
</html>`;
      mimeType = 'text/html';
      filename += '.html';
    }

    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    setShowExportOptions(false);
  };

  return (
    <div className="glass border border-border rounded-2xl bg-card shadow-md flex flex-col h-[520px] select-none">
      {/* Header Panel */}
      <div className="h-16 flex items-center justify-between px-6 border-b border-border">
        <h3 className="text-sm font-bold text-foreground">Generated Content</h3>
        
        {generation && (
          <div className="flex items-center gap-2 relative">
            {/* Save Button */}
            <button
              onClick={onSave}
              disabled={isSaving || hasSaved}
              className={`flex items-center justify-center p-2 sm:px-3 sm:py-1.5 rounded-lg text-xs font-semibold border transition-all cursor-pointer ${
                hasSaved
                  ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20'
                  : 'bg-primary hover:bg-primary-hover text-primary-foreground border-transparent disabled:opacity-50'
              }`}
            >
              <Bookmark className="h-3.5 w-3.5" />
              <span className="hidden sm:inline ml-1">{hasSaved ? 'Saved' : isSaving ? 'Saving...' : 'Save'}</span>
            </button>

            {/* Copy Button */}
            <button
              onClick={handleCopy}
              className="flex items-center justify-center p-2 sm:px-3 sm:py-1.5 rounded-lg border border-border bg-input hover:bg-secondary text-xs font-semibold text-muted-foreground hover:text-foreground transition-all cursor-pointer"
            >
              {copied ? <Check className="h-3.5 w-3.5 text-emerald-500" /> : <Copy className="h-3.5 w-3.5" />}
              <span className="hidden sm:inline ml-1">{copied ? 'Copied' : 'Copy'}</span>
            </button>

            {/* Clear Button */}
            <button
              onClick={onClear}
              className="flex items-center justify-center p-2 sm:px-3 sm:py-1.5 rounded-lg border border-border bg-input hover:bg-secondary text-xs font-semibold text-muted-foreground hover:text-destructive transition-all cursor-pointer"
            >
              <Trash2 className="h-3.5 w-3.5" />
              <span className="hidden sm:inline ml-1">Clear</span>
            </button>

            {/* Export Dropdown Trigger */}
            <button
              onClick={() => setShowExportOptions(!showExportOptions)}
              className="flex items-center justify-center p-2 sm:px-3 sm:py-1.5 rounded-lg border border-border bg-input hover:bg-secondary text-xs font-semibold text-muted-foreground hover:text-foreground transition-all cursor-pointer"
            >
              <Download className="h-3.5 w-3.5" />
              <span className="hidden sm:inline ml-1">Export</span>
            </button>

            {/* Export Options Modal Dropdown */}
            {showExportOptions && (
              <div className="absolute right-0 top-full mt-1.5 w-36 rounded-xl border border-border bg-card shadow-lg p-1 z-50">
                <button
                  onClick={() => handleExport('txt')}
                  className="w-full flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors cursor-pointer text-left"
                >
                  <FileText className="h-3.5 w-3.5" />
                  <span>Plain Text (.txt)</span>
                </button>
                <button
                  onClick={() => handleExport('md')}
                  className="w-full flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors cursor-pointer text-left"
                >
                  <Sparkles className="h-3.5 w-3.5" />
                  <span>Markdown (.md)</span>
                </button>
                <button
                  onClick={() => handleExport('html')}
                  className="w-full flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors cursor-pointer text-left"
                >
                  <Globe className="h-3.5 w-3.5" />
                  <span>Web Page (.html)</span>
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Body Viewport */}
      <div className="flex-1 overflow-y-auto p-6">
        {generation ? (
          <div className="prose prose-sm dark:prose-invert max-w-none">
            <div dangerouslySetInnerHTML={{ __html: renderSimpleMarkdown(generation.output) }} />
          </div>
        ) : (
          /* Empty Mockup Illustration */
          <div className="flex flex-col items-center justify-center h-full text-center">
            {/* Custom purple illustration */}
            <div className="relative mb-6 flex items-center justify-center w-24 h-24">
              {/* Background sparkles */}
              <div className="absolute top-2 right-2 w-2.5 h-2.5 rounded-full bg-primary/20 animate-pulse-subtle" />
              <div className="absolute bottom-4 left-2 w-2 h-2 rounded-full bg-indigo-500/20" />
              
              {/* Central document icon box */}
              <div className="w-16 h-20 rounded-xl bg-primary/10 border border-primary/20 flex flex-col justify-center px-4.5 gap-2 relative shadow-inner">
                {/* Lines inside doc */}
                <div className="h-1.5 w-full bg-primary/20 rounded" />
                <div className="h-1.5 w-4/5 bg-primary/20 rounded" />
                <div className="h-1.5 w-full bg-primary/20 rounded" />
                <div className="h-1.5 w-2/3 bg-primary/20 rounded" />
              </div>
              
              {/* Pencil icon floating */}
              <div className="absolute bottom-2 right-2 p-2 rounded-full bg-primary text-primary-foreground shadow-lg border border-card rotate-12 animate-pulse-subtle">
                <FileText className="h-4 w-4" />
              </div>
            </div>

            <h3 className="text-sm font-bold text-foreground mb-1.5">Your content will appear here</h3>
            <p className="text-xs text-muted-foreground max-w-xs leading-relaxed">
              Fill in the details on the left and click "Generate Content" to get started.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
