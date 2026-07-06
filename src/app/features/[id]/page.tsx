"use client";

import { useStore, Feature, FeaturePriority, FeatureStatus, RoadmapPhase } from "@/lib/store";
import { useParams, useRouter } from "next/navigation";
import { MarkdownRenderer, MarkdownEditor } from "@/components/MarkdownRenderer";
import { CommentThread } from "@/components/CommentThread";
import { ArrowLeft, BarChart, Edit2, Link as LinkIcon, User, Layers, ArrowRight } from "lucide-react";
import Link from "next/link";
import { computeRICE } from "@/lib/helpers";
import { useState } from "react";
import { TagInput } from "@/components/TagInput";

export default function FeatureDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { features, releases, stakeholders, customerRequests, updateFeature } = useStore();
  
  const feature = features.find(f => f.id === id);
  const release = releases.find(r => r.id === feature?.releaseId);
  const assignee = stakeholders.find(s => s.id === feature?.assigneeId);
  
  // Dependencies
  const blockedBy = features.filter(f => feature?.dependsOn?.includes(f.id));
  const blocks = features.filter(f => f.dependsOn?.includes(id as string));
  
  // Linked Requests
  const drivingRequests = customerRequests.filter(r => r.linkedFeatureId === id);

  // Edit State
  const [isEditMode, setIsEditMode] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [priority, setPriority] = useState<FeaturePriority>("Medium");
  const [status, setStatus] = useState<FeatureStatus>("Draft");
  const [assigneeId, setAssigneeId] = useState<string>("");
  const [impact, setImpact] = useState(5);
  const [effort, setEffort] = useState(5);
  const [reach, setReach] = useState(100);
  const [confidence, setConfidence] = useState(80);
  const [phase, setPhase] = useState<RoadmapPhase>("Later");
  const [releaseId, setReleaseId] = useState<string>("");
  const [dependsOn, setDependsOn] = useState<string[]>([]);
  const [tags, setTags] = useState<string[]>([]);

  const startEdit = () => {
    if (!feature) return;
    setTitle(feature.title);
    setDescription(feature.description);
    setPriority(feature.priority);
    setStatus(feature.status || "Draft");
    setAssigneeId(feature.assigneeId || "");
    setImpact(feature.impactScore);
    setEffort(feature.effortScore);
    setReach(feature.reach || 100);
    setConfidence(feature.confidence || 80);
    setPhase(feature.roadmapPhase || "Later");
    setReleaseId(feature.releaseId || "");
    setDependsOn(feature.dependsOn || []);
    setTags(feature.tags || []);
    setIsEditMode(true);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !feature) return;
    
    updateFeature(feature.id, {
      title: title.trim(),
      description: description.trim(),
      priority,
      status,
      assigneeId: assigneeId || undefined,
      impactScore: impact,
      effortScore: effort,
      reach,
      confidence,
      roadmapPhase: phase,
      releaseId: releaseId || undefined,
      dependsOn,
      tags
    });
    setIsEditMode(false);
  };

  if (!feature) {
    return (
      <div className="p-8 text-center max-w-4xl mx-auto">
        <h2 className="text-2xl font-bold mb-4">Feature not found</h2>
        <Link href="/features" className="text-primary hover:underline">Return to features</Link>
      </div>
    );
  }

  const score = computeRICE(feature.reach, feature.impactScore, feature.confidence, feature.effortScore);
  const featStatus = feature.status || 'Draft';

  const statusColors: Record<FeatureStatus, string> = {
    "Draft": "bg-muted text-muted-foreground border-border",
    "In Development": "bg-blue-500/10 text-blue-500 border-blue-500/20",
    "QA": "bg-purple-500/10 text-purple-500 border-purple-500/20",
    "Done": "bg-green-500/10 text-green-500 border-green-500/20"
  };

  const ALL_STATUSES: FeatureStatus[] = ['Draft', 'In Development', 'QA', 'Done'];

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-12">
      <Link href="/features" className="flex items-center gap-2 text-muted-foreground hover:text-foreground w-fit">
        <ArrowLeft className="w-4 h-4" /> Back to Features
      </Link>
      
      {isEditMode ? (
        <div className="bg-card border border-border rounded-xl p-6 shadow-sm space-y-6">
          <h2 className="text-xl font-bold">Edit Feature</h2>
          <form onSubmit={handleSave} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2 md:col-span-2">
                <label className="text-sm font-medium">Feature Name</label>
                <input required type="text" value={title} onChange={e => setTitle(e.target.value)} className="w-full px-3 py-2 border rounded-md bg-background focus:ring-2 focus:ring-primary outline-none" />
              </div>
              
              <div className="space-y-2 md:col-span-2">
                <label className="text-sm font-medium">Description</label>
                <MarkdownEditor value={description} onChange={setDescription} minHeight="120px" />
              </div>

              <div className="space-y-2 md:col-span-2">
                <label className="text-sm font-medium">Tags</label>
                <TagInput tags={tags} onChange={setTags} />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Status</label>
                <select value={status} onChange={e => setStatus(e.target.value as FeatureStatus)} className="w-full px-3 py-2 border rounded-md bg-background">
                  {ALL_STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Assignee</label>
                <select value={assigneeId} onChange={e => setAssigneeId(e.target.value)} className="w-full px-3 py-2 border rounded-md bg-background">
                  <option value="">Unassigned</option>
                  {stakeholders.map(s => <option key={s.id} value={s.id}>{s.name} ({s.role})</option>)}
                </select>
              </div>

              <div className="space-y-2 md:col-span-2">
                <label className="text-sm font-medium">Dependencies (Blocked By)</label>
                <select 
                  multiple
                  value={dependsOn} 
                  onChange={e => {
                    const selected = Array.from(e.target.selectedOptions, option => option.value);
                    setDependsOn(selected);
                  }} 
                  className="w-full px-3 py-2 border rounded-md bg-background h-24"
                >
                  {features.filter(f => f.id !== feature.id).map(f => (
                    <option key={f.id} value={f.id}>{f.title}</option>
                  ))}
                </select>
                <p className="text-xs text-muted-foreground">Hold Ctrl/Cmd to select multiple dependencies.</p>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Reach (Audience size)</label>
                <input type="number" min="0" value={reach} onChange={e => setReach(Number(e.target.value))} className="w-full px-3 py-2 border rounded-md bg-background" />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Impact (1-10)</label>
                <input type="range" min="1" max="10" value={impact} onChange={e => setImpact(Number(e.target.value))} className="w-full" />
                <div className="text-xs text-center text-muted-foreground">{impact}</div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Confidence (0-100%)</label>
                <input type="number" min="0" max="100" value={confidence} onChange={e => setConfidence(Number(e.target.value))} className="w-full px-3 py-2 border rounded-md bg-background" />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Effort (1-10)</label>
                <input type="range" min="1" max="10" value={effort} onChange={e => setEffort(Number(e.target.value))} className="w-full" />
                <div className="text-xs text-center text-muted-foreground">{effort}</div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Priority</label>
                <select value={priority} onChange={e => setPriority(e.target.value as FeaturePriority)} className="w-full px-3 py-2 border rounded-md bg-background">
                  <option value="Critical">Critical</option>
                  <option value="High">High</option>
                  <option value="Medium">Medium</option>
                  <option value="Low">Low</option>
                </select>
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-medium">Phase</label>
                <select value={phase} onChange={e => setPhase(e.target.value as RoadmapPhase)} className="w-full px-3 py-2 border rounded-md bg-background">
                  <option value="Now">Now</option>
                  <option value="Next">Next</option>
                  <option value="Later">Later</option>
                </select>
              </div>
              
              <div className="space-y-2 md:col-span-2">
                <label className="text-sm font-medium">Release</label>
                <select value={releaseId} onChange={e => setReleaseId(e.target.value)} className="w-full px-3 py-2 border rounded-md bg-background">
                  <option value="">None</option>
                  {releases.map(r => (
                    <option key={r.id} value={r.id}>v{r.version}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-6 border-t border-border">
              <button type="button" onClick={() => setIsEditMode(false)} className="px-4 py-2 border rounded-md text-sm hover:bg-accent">Cancel</button>
              <button type="submit" className="px-4 py-2 bg-primary text-primary-foreground rounded-md text-sm font-medium hover:bg-primary/90">
                Save Changes
              </button>
            </div>
          </form>
        </div>
      ) : (
        <div className="bg-card border border-border rounded-xl p-6 shadow-sm space-y-6">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold pr-12">{feature.title}</h1>
              <div className="flex gap-2 mt-3 flex-wrap items-center">
                <span className={`text-xs px-2.5 py-1 rounded-full border font-medium ${statusColors[featStatus]}`}>
                  {featStatus}
                </span>
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
                {assignee && (
                  <span className="text-xs px-2.5 py-1 rounded-full border border-border flex items-center gap-1.5 font-medium bg-background">
                    <User className="w-3 h-3 text-muted-foreground" />
                    {assignee.name}
                  </span>
                )}
              </div>
            </div>
            
            <div className="flex flex-col items-end gap-3 flex-shrink-0">
              <button 
                onClick={startEdit}
                className="px-3 py-1.5 bg-accent hover:bg-accent/80 border border-border rounded-md text-sm font-medium flex items-center gap-1.5 transition-colors"
              >
                <Edit2 className="w-3.5 h-3.5" />
                Edit
              </button>
              <div className="text-center bg-accent border border-border p-3 rounded-lg min-w-[120px]">
                <div className="text-xs text-muted-foreground mb-1 font-medium">RICE Score</div>
                <div className="text-2xl font-bold flex items-center justify-center gap-1 text-primary">
                  <BarChart className="w-5 h-5" />
                  {score}
                </div>
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
          
          {(blockedBy.length > 0 || blocks.length > 0) && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-accent/20 p-5 rounded-lg border border-border">
              {blockedBy.length > 0 && (
                <div>
                  <h3 className="text-sm font-semibold mb-3 flex items-center gap-2 text-destructive">
                    <Layers className="w-4 h-4" /> Blocked By ({blockedBy.length})
                  </h3>
                  <div className="space-y-2">
                    {blockedBy.map(f => (
                      <Link key={f.id} href={`/features/${f.id}`} className="block p-2.5 bg-background border border-border rounded-md text-sm hover:border-primary transition-colors line-clamp-1">
                        {f.title}
                      </Link>
                    ))}
                  </div>
                </div>
              )}
              
              {blocks.length > 0 && (
                <div>
                  <h3 className="text-sm font-semibold mb-3 flex items-center gap-2 text-primary">
                    <ArrowRight className="w-4 h-4" /> Blocks ({blocks.length})
                  </h3>
                  <div className="space-y-2">
                    {blocks.map(f => (
                      <Link key={f.id} href={`/features/${f.id}`} className="block p-2.5 bg-background border border-border rounded-md text-sm hover:border-primary transition-colors line-clamp-1">
                        {f.title}
                      </Link>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {drivingRequests.length > 0 && (
            <div>
              <h3 className="text-sm font-semibold mb-3 flex items-center gap-2">
                <LinkIcon className="w-4 h-4 text-muted-foreground" /> Driving Requests ({drivingRequests.length})
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {drivingRequests.map(r => (
                  <Link key={r.id} href={`/requests/${r.id}`} className="block p-3 bg-accent/30 border border-border rounded-lg text-sm hover:bg-accent/50 transition-colors">
                    <div className="font-medium line-clamp-1">{r.title}</div>
                    <div className="text-xs text-muted-foreground mt-1">Status: {r.status}</div>
                  </Link>
                ))}
              </div>
            </div>
          )}

          <div>
            <h3 className="text-lg font-semibold mb-3">Description</h3>
            <div className="bg-background rounded-lg p-5 border border-border min-h-[150px]">
              {feature.description ? (
                <MarkdownRenderer content={feature.description} />
              ) : (
                <p className="text-muted-foreground italic text-sm">No description provided.</p>
              )}
            </div>
          </div>
          
          {feature.tags && feature.tags.length > 0 && (
            <div>
              <div className="flex gap-2 flex-wrap">
                {feature.tags.map(t => (
                  <span key={t} className="text-xs px-2.5 py-1 rounded-md bg-secondary text-secondary-foreground border border-border">{t}</span>
                ))}
              </div>
            </div>
          )}

          <div className="text-xs text-muted-foreground pt-4 border-t border-border">
            Created: {new Date(feature.createdAt).toLocaleString()}
          </div>
        </div>
      )}
      
      <div className="bg-card border border-border rounded-xl shadow-sm overflow-hidden mt-8">
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
