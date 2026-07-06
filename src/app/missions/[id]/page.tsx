"use client";

import { useStore } from "@/lib/store";
import { useParams, useRouter } from "next/navigation";
import { MarkdownRenderer } from "@/components/MarkdownRenderer";
import { CommentThread } from "@/components/CommentThread";
import { ArrowLeft, CheckCircle2, Clock, Circle } from "lucide-react";
import Link from "next/link";

export default function MissionDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const mission = useStore(state => state.missions.find(m => m.id === id));
  const updateMission = useStore(state => state.updateMission);

  if (!mission) {
    return (
      <div className="p-8 text-center max-w-4xl mx-auto">
        <h2 className="text-2xl font-bold mb-4">Mission not found</h2>
        <Link href="/missions" className="text-primary hover:underline">Return to missions</Link>
      </div>
    );
  }

  const toggleStatus = () => {
    const nextStatus = {
      "To Do": "In Progress",
      "In Progress": "Done",
      "Blocked": "Done",
      "Done": "To Do"
    } as const;
    updateMission(mission.id, { status: nextStatus[mission.status] });
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <Link href="/missions" className="flex items-center gap-2 text-muted-foreground hover:text-foreground w-fit">
        <ArrowLeft className="w-4 h-4" /> Back to Missions
      </Link>
      
      <div className="bg-card border border-border rounded-xl p-6 shadow-sm space-y-6">
        <div className="flex items-start gap-4">
          <button 
            onClick={toggleStatus}
            className="flex-shrink-0 mt-1 text-muted-foreground hover:text-primary transition-colors"
            title="Toggle Status"
          >
            {mission.status === 'Done' ? (
              <CheckCircle2 className="w-8 h-8 text-green-500" />
            ) : mission.status === 'In Progress' ? (
              <Clock className="w-8 h-8 text-yellow-500" />
            ) : (
              <Circle className="w-8 h-8" />
            )}
          </button>
          
          <div className="flex-1">
            <h1 className={`text-3xl font-bold ${mission.status === 'Done' ? 'line-through text-muted-foreground' : ''}`}>
              {mission.title}
            </h1>
            <div className="flex gap-2 mt-3">
              <span className="text-xs px-2.5 py-1 rounded-full bg-accent text-accent-foreground border border-border font-medium">
                {mission.status}
              </span>
            </div>
          </div>
        </div>

        <div>
          <h3 className="text-lg font-semibold mb-3">Mission Details</h3>
          <div className="bg-background rounded-lg p-4 border border-border min-h-[100px]">
            {mission.description ? (
              <MarkdownRenderer content={mission.description} />
            ) : (
              <p className="text-muted-foreground italic text-sm">No description provided.</p>
            )}
          </div>
        </div>
        
        <div className="text-xs text-muted-foreground pt-4 border-t border-border">
          Created on: {new Date(mission.createdAt).toLocaleString()}
        </div>
      </div>
      
      <div className="bg-card border border-border rounded-xl shadow-sm overflow-hidden">
        <div className="p-4 bg-muted/50 border-b border-border">
          <h3 className="font-semibold">Mission Thread</h3>
        </div>
        <div className="p-6">
          <CommentThread entityType="Mission" entityId={mission.id} />
        </div>
      </div>
    </div>
  );
}
