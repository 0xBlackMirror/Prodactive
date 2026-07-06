"use client";

import React, { useState } from 'react';
import { X } from 'lucide-react';

interface TagInputProps {
  tags: string[];
  onChange: (tags: string[]) => void;
  suggestedTags?: string[];
  placeholder?: string;
}

export function TagInput({ tags, onChange, suggestedTags = [], placeholder = "Add tag..." }: TagInputProps) {
  const [input, setInput] = useState('');
  
  const addTag = (tag: string) => {
    const trimmed = tag.trim();
    if (trimmed && !tags.includes(trimmed)) {
      onChange([...tags, trimmed]);
    }
    setInput('');
  };
  
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      addTag(input);
    } else if (e.key === 'Backspace' && !input && tags.length > 0) {
      removeTag(tags[tags.length - 1]);
    }
  };
  
  const removeTag = (tagToRemove: string) => {
    onChange(tags.filter(t => t !== tagToRemove));
  };

  // Color generator based on string
  const getTagColor = (tag: string) => {
    const colors = [
      'bg-blue-500/10 text-blue-500 border-blue-500/20',
      'bg-green-500/10 text-green-500 border-green-500/20',
      'bg-purple-500/10 text-purple-500 border-purple-500/20',
      'bg-orange-500/10 text-orange-500 border-orange-500/20',
      'bg-pink-500/10 text-pink-500 border-pink-500/20',
      'bg-teal-500/10 text-teal-500 border-teal-500/20',
    ];
    let hash = 0;
    for (let i = 0; i < tag.length; i++) {
      hash = tag.charCodeAt(i) + ((hash << 5) - hash);
    }
    return colors[Math.abs(hash) % colors.length];
  };

  return (
    <div className="space-y-2">
      <div className="flex flex-wrap gap-2 p-2 border border-input rounded-md bg-background focus-within:ring-2 focus-within:ring-primary min-h-[42px]">
        {tags.map(tag => (
          <span 
            key={tag} 
            className={`flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium border ${getTagColor(tag)}`}
          >
            {tag}
            <button 
              type="button" 
              onClick={() => removeTag(tag)}
              className="hover:bg-black/10 dark:hover:bg-white/10 rounded-full p-0.5"
            >
              <X className="w-3 h-3" />
            </button>
          </span>
        ))}
        <input 
          type="text"
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={tags.length === 0 ? placeholder : ""}
          className="flex-1 min-w-[100px] outline-none bg-transparent text-sm"
        />
      </div>
      
      {input && suggestedTags.length > 0 && (
        <div className="flex flex-wrap gap-2 mt-2">
          {suggestedTags
            .filter(t => t.toLowerCase().includes(input.toLowerCase()) && !tags.includes(t))
            .slice(0, 5)
            .map(t => (
              <button
                key={t}
                type="button"
                onClick={() => addTag(t)}
                className="text-xs px-2 py-1 bg-accent hover:bg-accent/80 rounded-full text-accent-foreground transition-colors"
              >
                + {t}
              </button>
            ))
          }
        </div>
      )}
    </div>
  );
}
