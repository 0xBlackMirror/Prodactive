"use client";

import { useStore } from "@/lib/store";
import { useParams, useRouter } from "next/navigation";
import { MarkdownRenderer } from "@/components/MarkdownRenderer";
import { CommentThread } from "@/components/CommentThread";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";

export default function RequestDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const request = useStore(state => state.customerRequests.find(r => r.id === id));
  const feature = useStore(state => state.features.find(f => f.id === request?.linkedFeatureId));

  if (!request) {
    return (
      <div className="p-8 text-center max-w-4xl mx-auto">
        <h2 className="text-2xl font-bold mb-4">Request not found</h2>
        <Link href="/requests" className="text-primary hover:underline">Return to requests</Link>
      </div>
    );
  }

  const statusColors = {
    "New": "bg-blue-500/10 text-blue-500 border-blue-500/20",
    "Under Review": "bg-yellow-500/10 text-yellow-500 border-yellow-500/20",
    "Planned": "bg-purple-500/10 text-purple-500 border-purple-500/20",
    "Rejected": "bg-destructive/10 text-destructive border-destructive/20",
    "Completed": "bg-green-500/10 text-green-500 border-green-500/20"
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <Link href="/requests" className="flex items-center gap-2 text-muted-foreground hover:text-foreground w-fit">
        <ArrowLeft className="w-4 h-4" /> Back to Requests
      </Link>
      
      <div className="bg-card border border-border rounded-xl p-6 shadow-sm space-y-6">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold">{request.title}</h1>
            <div className="flex gap-2 mt-3 flex-wrap">
              <span className={`text-xs px-2.5 py-1 rounded-full font-medium border ${statusColors[request.status]}`}>
                {request.status}
              </span>
              {request.source && (
                <span className="text-xs px-2.5 py-1 rounded-full bg-accent text-accent-foreground border border-border font-medium">
                  Source: {request.source}
                </span>
              )}
            </div>
          </div>
        </div>

        {request.tags && request.tags.length > 0 && (
          <div>
            <h3 className="text-sm font-semibold mb-2">Tags</h3>
            <div className="flex gap-2 flex-wrap">
              {request.tags.map(t => (
                <span key={t} className="text-xs px-2 py-1 rounded-md bg-secondary text-secondary-foreground border border-border">{t}</span>
              ))}
            </div>
          </div>
        )}

        <div>
          <h3 className="text-lg font-semibold mb-3">Feedback Details</h3>
          <div className="bg-background rounded-lg p-4 border border-border">
            {request.description ? (
              <MarkdownRenderer content={request.description} />
            ) : (
              <p className="text-muted-foreground italic text-sm">No description provided.</p>
            )}
          </div>
        </div>
        
        {feature && (
          <div className="bg-primary/5 border border-primary/20 rounded-lg p-4 flex items-center justify-between">
            <div>
              <h3 className="text-sm font-semibold text-primary">Linked Feature</h3>
              <p className="text-sm">{feature.title}</p>
            </div>
            <Link href={`/features/${feature.id}`} className="text-xs bg-background border border-border px-3 py-1.5 rounded-md hover:bg-accent">
              View Feature
            </Link>
          </div>
        )}
        
        <div className="text-xs text-muted-foreground pt-4 border-t border-border">
          Logged on: {new Date(request.createdAt).toLocaleString()}
        </div>
      </div>
      
      <div className="bg-card border border-border rounded-xl shadow-sm overflow-hidden">
        <div className="p-4 bg-muted/50 border-b border-border">
          <h3 className="font-semibold">Discussion</h3>
        </div>
        <div className="p-6">
          <CommentThread entityType="Request" entityId={request.id} />
        </div>
      </div>
    </div>
  );
}
