"use client";

import { useStore } from "@/lib/store";
import { useParams, useRouter } from "next/navigation";
import { MarkdownRenderer } from "@/components/MarkdownRenderer";
import { CommentThread } from "@/components/CommentThread";
import { ArrowLeft, BarChart } from "lucide-react";
import Link from "next/link";
import { computeRICE } from "@/lib/helpers";

export default function FeatureDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const feature = useStore(state => state.features.find(f => f.id === id));
  const release = useStore(state => state.releases.find(r => r.id === feature?.releaseId));

  if (!feature) {
    return (
      <div className="p-8 text-center max-w-4xl mx-auto">
        <h2 className="text-2xl font-bold mb-4">Feature not found</h2>
        <Link href="/features" className="text-primary hover:underline">Return to features</Link>
      </div>
    );
  }

  const score = computeRICE(feature.reach, feature.impactScore, feature.confidence, feature.effortScore);

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <Link href="/features" className="flex items-center gap-2 text-muted-foreground hover:text-foreground w-fit">
        <ArrowLeft className="w-4 h-4" /> Back to Features
      </Link>
      
      <div className="bg-card border border-border rounded-xl p-6 shadow-sm space-y-6">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold">{feature.title}</h1>
            <div className="flex gap-2 mt-3 flex-wrap">
              <span className="text-xs px-2.5 py-1 rounded-full bg-accent text-accent-foreground border border-border font-medium">
                {feature.priority} Priority
              </span>
              <span className="text-xs px-2.5 py-1 rounded-full bg-accent text-accent-foreground border border-border font-medium">
                Phase: {feature.roadmapPhase || "Later"}
              </span>
              {release && (
                <span className="text-xs px-2.5 py-1 rounded-full bg-primary/10 text-primary border border-primary/20 font-medium">
                  Release v{release.version}
                </span>
              )}
            </div>
          </div>
          <div className="text-center bg-accent border border-border p-3 rounded-lg min-w-[120px] flex-shrink-0">
            <div className="text-xs text-muted-foreground mb-1 font-medium">RICE Score</div>
            <div className="text-2xl font-bold flex items-center justify-center gap-1 text-primary">
              <BarChart className="w-5 h-5" />
              {score}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 py-5 border-y border-border">
          <div className="bg-background rounded-lg p-3 border border-border">
            <div className="text-xs text-muted-foreground font-medium mb-1">Reach</div>
            <div className="font-semibold text-lg">{feature.reach}</div>
          </div>
          <div className="bg-background rounded-lg p-3 border border-border">
            <div className="text-xs text-muted-foreground font-medium mb-1">Impact</div>
            <div className="font-semibold text-lg">{feature.impactScore}/10</div>
          </div>
          <div className="bg-background rounded-lg p-3 border border-border">
            <div className="text-xs text-muted-foreground font-medium mb-1">Confidence</div>
            <div className="font-semibold text-lg">{feature.confidence}%</div>
          </div>
          <div className="bg-background rounded-lg p-3 border border-border">
            <div className="text-xs text-muted-foreground font-medium mb-1">Effort</div>
            <div className="font-semibold text-lg">{feature.effortScore}/10</div>
          </div>
        </div>
        
        {feature.tags && feature.tags.length > 0 && (
          <div>
            <h3 className="text-sm font-semibold mb-2">Tags</h3>
            <div className="flex gap-2 flex-wrap">
              {feature.tags.map(t => (
                <span key={t} className="text-xs px-2 py-1 rounded-md bg-secondary text-secondary-foreground border border-border">{t}</span>
              ))}
            </div>
          </div>
        )}

        <div>
          <h3 className="text-lg font-semibold mb-3">Description</h3>
          <div className="bg-background rounded-lg p-4 border border-border">
            {feature.description ? (
              <MarkdownRenderer content={feature.description} />
            ) : (
              <p className="text-muted-foreground italic text-sm">No description provided.</p>
            )}
          </div>
        </div>
        
        <div className="text-xs text-muted-foreground">
          Created: {new Date(feature.createdAt).toLocaleString()}
        </div>
      </div>
      
      <div className="bg-card border border-border rounded-xl shadow-sm overflow-hidden">
        <div className="p-4 bg-muted/50 border-b border-border">
          <h3 className="font-semibold">Discussion</h3>
        </div>
        <div className="p-6">
          <CommentThread entityType="Feature" entityId={feature.id} />
        </div>
      </div>
    </div>
  );
}
