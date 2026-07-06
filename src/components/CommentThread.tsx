"use client";

import React, { useState } from 'react';
import { useStore, Comment } from '@/lib/store';
import { Send, User } from 'lucide-react';
import { MarkdownRenderer } from './MarkdownRenderer';

interface CommentThreadProps {
  entityType: Comment['entityType'];
  entityId: string;
}

export function CommentThread({ entityType, entityId }: CommentThreadProps) {
  const { comments, addComment } = useStore();
  const [newComment, setNewComment] = useState("");

  const threadComments = comments
    .filter(c => c.entityType === entityType && c.entityId === entityId)
    .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim()) return;

    addComment({
      id: crypto.randomUUID(),
      entityType,
      entityId,
      text: newComment.trim(),
      createdAt: new Date().toISOString()
    });

    setNewComment("");
  };

  return (
    <div className="space-y-6">
      <h3 className="text-lg font-semibold flex items-center gap-2">
        Comments <span className="bg-muted text-muted-foreground text-xs px-2 py-0.5 rounded-full">{threadComments.length}</span>
      </h3>
      
      <div className="space-y-4">
        {threadComments.length === 0 ? (
          <p className="text-sm text-muted-foreground italic">No comments yet. Start the conversation!</p>
        ) : (
          threadComments.map(comment => (
            <div key={comment.id} className="flex gap-4">
              <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                <User className="w-4 h-4 text-primary" />
              </div>
              <div className="flex-1 space-y-1">
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-sm">Team Member</span>
                  <span className="text-xs text-muted-foreground">
                    {new Date(comment.createdAt).toLocaleString()}
                  </span>
                </div>
                <div className="text-sm bg-muted/50 p-3 rounded-xl rounded-tl-none border border-border">
                  <MarkdownRenderer content={comment.text} />
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      <form onSubmit={handleSubmit} className="relative mt-4">
        <textarea
          value={newComment}
          onChange={(e) => setNewComment(e.target.value)}
          placeholder="Add a comment... (Supports markdown)"
          className="w-full bg-background border border-input rounded-xl p-4 pr-12 min-h-[100px] resize-y focus:outline-none focus:ring-2 focus:ring-primary text-sm"
        />
        <button 
          type="submit"
          disabled={!newComment.trim()}
          className="absolute right-3 bottom-3 p-2 bg-primary text-primary-foreground rounded-lg disabled:opacity-50 hover:bg-primary/90 transition-colors"
        >
          <Send className="w-4 h-4" />
        </button>
      </form>
    </div>
  );
}
