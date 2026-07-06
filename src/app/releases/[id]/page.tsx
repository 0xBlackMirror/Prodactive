"use client";

import { useStore } from "@/lib/store";
import { useParams, useRouter } from "next/navigation";
import { MarkdownRenderer } from "@/components/MarkdownRenderer";
import { CommentThread } from "@/components/CommentThread";
import { ArrowLeft, Calendar, Tag } from "lucide-react";
import Link from "next/link";
import { generateReleaseNotes } from "@/lib/helpers";
import { useState } from "react";

export default function ReleaseDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const release = useStore(state => state.releases.find(r => r.id === id));
  const features = useStore(state => state.features.filter(f => f.releaseId === id));
  
  const [showNotesModal, setShowNotesModal] = useState(false);
  const [generatedNotes, setGeneratedNotes] = useState("");

  if (!release) {
    return (
      <div className="p-8 text-center max-w-4xl mx-auto">
        <h2 className="text-2xl font-bold mb-4">Release not found</h2>
        <Link href="/releases" className="text-primary hover:underline">Return to releases</Link>
      </div>
    );
  }

  const handleGenerateNotes = () => {
    setGeneratedNotes(generateReleaseNotes(release, features));
    setShowNotesModal(true);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <Link href="/releases" className="flex items-center gap-2 text-muted-foreground hover:text-foreground w-fit">
        <ArrowLeft className="w-4 h-4" /> Back to Releases
      </Link>
      
      <div className="bg-card border border-border rounded-xl p-6 shadow-sm space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-primary mb-1">
              <Tag className="w-5 h-5" />
              <span className="font-semibold text-lg">Release</span>
            </div>
            <h1 className="text-3xl font-bold">v{release.version}</h1>
            <div className="flex gap-2 mt-3 flex-wrap">
              <span className="text-xs px-2.5 py-1 rounded-full bg-accent text-accent-foreground border border-border font-medium">
                {release.status}
              </span>
              <span className="flex items-center gap-1 text-xs px-2.5 py-1 rounded-full bg-accent text-accent-foreground border border-border font-medium">
                <Calendar className="w-3 h-3" />
                Target: {new Date(release.targetDate).toLocaleDateString()}
              </span>
            </div>
          </div>
          <button 
            onClick={handleGenerateNotes}
            className="px-4 py-2 bg-primary text-primary-foreground rounded-md text-sm font-medium hover:bg-primary/90 flex-shrink-0"
          >
            Generate Release Notes
          </button>
        </div>

        <div>
          <h3 className="text-lg font-semibold mb-3">Release Goals & Description</h3>
          <div className="bg-background rounded-lg p-4 border border-border">
            {release.description ? (
              <MarkdownRenderer content={release.description} />
            ) : (
              <p className="text-muted-foreground italic text-sm">No description provided.</p>
            )}
          </div>
        </div>

        <div>
          <h3 className="text-lg font-semibold mb-3">Features in this Release ({features.length})</h3>
          {features.length === 0 ? (
            <div className="bg-background border border-border border-dashed rounded-lg p-8 text-center text-muted-foreground text-sm">
              No features assigned to this release yet. Go to the Feature Planner to assign some.
            </div>
          ) : (
            <div className="grid gap-3">
              {features.map(f => (
                <div key={f.id} className="bg-background border border-border rounded-lg p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:border-primary/50 transition-colors">
                  <div>
                    <Link href={`/features/${f.id}`} className="font-semibold hover:text-primary transition-colors block mb-1">
                      {f.title}
                    </Link>
                    <p className="text-sm text-muted-foreground line-clamp-1">{f.description.replace(/[*#]/g, '')}</p>
                  </div>
                  <span className="text-xs px-2 py-1 rounded-full bg-accent border border-border whitespace-nowrap">
                    {f.priority} Priority
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
      
      <div className="bg-card border border-border rounded-xl shadow-sm overflow-hidden">
        <div className="p-4 bg-muted/50 border-b border-border">
          <h3 className="font-semibold">Discussion</h3>
        </div>
        <div className="p-6">
          <CommentThread entityType="Release" entityId={release.id} />
        </div>
      </div>

      {showNotesModal && (
        <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-card border border-border rounded-xl shadow-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto flex flex-col">
            <div className="p-6 border-b border-border flex justify-between items-center bg-muted/30">
              <h2 className="text-xl font-bold">Release Notes Preview</h2>
              <button onClick={() => setShowNotesModal(false)} className="text-muted-foreground hover:text-foreground">Close</button>
            </div>
            <div className="p-6 flex-1 overflow-y-auto bg-background">
              <MarkdownRenderer content={generatedNotes} />
            </div>
            <div className="p-6 border-t border-border bg-muted/30 flex justify-end gap-3">
              <button 
                onClick={() => {
                  navigator.clipboard.writeText(generatedNotes);
                  alert("Copied to clipboard!");
                }}
                className="px-4 py-2 border border-input rounded-md text-sm hover:bg-accent bg-background"
              >
                Copy Markdown
              </button>
              <button 
                onClick={() => setShowNotesModal(false)}
                className="px-4 py-2 bg-primary text-primary-foreground rounded-md text-sm font-medium hover:bg-primary/90"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
