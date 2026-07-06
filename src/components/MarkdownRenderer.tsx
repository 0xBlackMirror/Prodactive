"use client";

import React, { useState } from 'react';
import { Bold, Italic, List, Link as LinkIcon, Heading2 } from 'lucide-react';

interface MarkdownRendererProps {
  content: string;
}

export function MarkdownRenderer({ content }: MarkdownRendererProps) {
  // Simple regex-based markdown parser
  const renderContent = () => {
    let html = content
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      // Headers
      .replace(/^### (.*$)/gim, '<h3 class="text-lg font-bold mt-4 mb-2">$1</h3>')
      .replace(/^## (.*$)/gim, '<h2 class="text-xl font-bold mt-5 mb-3">$1</h2>')
      .replace(/^# (.*$)/gim, '<h1 class="text-2xl font-bold mt-6 mb-4">$1</h1>')
      // Bold & Italic
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/\*(.*?)\*/g, '<em>$1</em>')
      // Links
      .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank" class="text-primary hover:underline">$1</a>')
      // Lists
      .replace(/^\s*-\s(.*)/gim, '<li class="ml-4 list-disc">$1</li>')
      // Paragraphs
      .replace(/\n\n/g, '</p><p class="my-2">')
      .replace(/\n/g, '<br/>');

    return <div className="text-sm prose dark:prose-invert" dangerouslySetInnerHTML={{ __html: `<p class="my-2">${html}</p>` }} />;
  };

  return renderContent();
}

interface MarkdownEditorProps {
  value: string;
  onChange: (val: string) => void;
  placeholder?: string;
  minHeight?: string;
}

export function MarkdownEditor({ value, onChange, placeholder, minHeight = "100px" }: MarkdownEditorProps) {
  const insertText = (before: string, after: string = '') => {
    const textarea = document.getElementById('markdown-editor') as HTMLTextAreaElement;
    if (!textarea) return;
    
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const text = textarea.value;
    const selected = text.substring(start, end);
    
    const newText = text.substring(0, start) + before + selected + after + text.substring(end);
    onChange(newText);
    
    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(start + before.length, end + before.length);
    }, 0);
  };

  return (
    <div className="border border-input rounded-md bg-background focus-within:ring-2 focus-within:ring-primary overflow-hidden flex flex-col">
      <div className="flex items-center gap-1 p-1 border-b border-border bg-muted/50">
        <button type="button" onClick={() => insertText('**', '**')} className="p-1.5 hover:bg-accent rounded text-muted-foreground hover:text-foreground" title="Bold">
          <Bold className="w-4 h-4" />
        </button>
        <button type="button" onClick={() => insertText('*', '*')} className="p-1.5 hover:bg-accent rounded text-muted-foreground hover:text-foreground" title="Italic">
          <Italic className="w-4 h-4" />
        </button>
        <div className="w-px h-4 bg-border mx-1" />
        <button type="button" onClick={() => insertText('## ')} className="p-1.5 hover:bg-accent rounded text-muted-foreground hover:text-foreground" title="Heading">
          <Heading2 className="w-4 h-4" />
        </button>
        <button type="button" onClick={() => insertText('\n- ')} className="p-1.5 hover:bg-accent rounded text-muted-foreground hover:text-foreground" title="Bullet List">
          <List className="w-4 h-4" />
        </button>
        <button type="button" onClick={() => insertText('[', '](url)')} className="p-1.5 hover:bg-accent rounded text-muted-foreground hover:text-foreground" title="Link">
          <LinkIcon className="w-4 h-4" />
        </button>
      </div>
      <textarea 
        id="markdown-editor"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full p-3 resize-y outline-none bg-transparent"
        style={{ minHeight }}
        placeholder={placeholder}
      />
    </div>
  );
}
