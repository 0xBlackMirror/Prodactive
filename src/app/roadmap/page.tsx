"use client";

import { useStore, Feature, FeaturePriority, RoadmapPhase } from "@/lib/store";
import { ArrowRight, ArrowLeft, Layout, Edit2, AlertTriangle } from "lucide-react";
import { useState } from "react";
import { GanttTimeline } from "@/components/GanttTimeline";
import { SearchFilterBar } from "@/components/SearchFilterBar";

type BoardType = 'Phase' | 'Priority' | 'Release' | 'Timeline';

export default function RoadmapPage() {
  const { features, releases, updateFeature } = useStore();
  const [boardType, setBoardType] = useState<BoardType>('Phase');
  const [searchQuery, setSearchQuery] = useState("");

  // Edit Feature State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingFeatureId, setEditingFeatureId] = useState<string | null>(null);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [priority, setPriority] = useState<FeaturePriority>("Medium");
  const [impact, setImpact] = useState(5);
  const [effort, setEffort] = useState(5);
  const [phase, setPhase] = useState<RoadmapPhase>("Later");
  const [releaseId, setReleaseId] = useState<string>("");

  const openEditModal = (f: Feature) => {
    setEditingFeatureId(f.id);
    setTitle(f.title);
    setDescription(f.description);
    setPriority(f.priority);
    setImpact(f.impactScore);
    setEffort(f.effortScore);
    setPhase(f.roadmapPhase || "Later");
    setReleaseId(f.releaseId || "");
    setIsModalOpen(true);
  };

  const handleSaveFeature = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !editingFeatureId) return;
    
    updateFeature(editingFeatureId, {
      title: title.trim(),
      description: description.trim(),
      priority,
      impactScore: impact,
      effortScore: effort,
      roadmapPhase: phase,
      releaseId: releaseId || undefined
    });
    
    setIsModalOpen(false);
  };

  const moveFeature = (featureId: string, currentColId: string, direction: 'left' | 'right', colIds: string[]) => {
    const currentIndex = colIds.indexOf(currentColId);
    
    let newIndex = currentIndex;
    if (direction === 'left' && currentIndex > 0) newIndex = currentIndex - 1;
    if (direction === 'right' && currentIndex < colIds.length - 1) newIndex = currentIndex + 1;
    
    if (newIndex !== currentIndex) {
      const newColId = colIds[newIndex];
      if (boardType === 'Phase') {
        updateFeature(featureId, { roadmapPhase: newColId as RoadmapPhase });
      } else if (boardType === 'Priority') {
        updateFeature(featureId, { priority: newColId as FeaturePriority });
      } else if (boardType === 'Release') {
        updateFeature(featureId, { releaseId: newColId === 'backlog' ? undefined : newColId });
      }
    }
  };

  const filteredFeatures = features.filter(f => {
    if (searchQuery && !f.title.toLowerCase().includes(searchQuery.toLowerCase()) && !f.description.toLowerCase().includes(searchQuery.toLowerCase())) {
      return false;
    }
    return true;
  });

  const getPhaseColumns = () => {
    const ids = ['Now', 'Next', 'Later'];
    return ids.map(id => ({
      id,
      title: id,
      desc: id === 'Now' ? "Currently in development" : id === 'Next' ? "Up next" : "Future backlog",
      features: filteredFeatures.filter(f => f.roadmapPhase === id).sort((a, b) => b.impactScore - a.impactScore),
      colIds: ids
    }));
  };

  const getPriorityColumns = () => {
    const ids = ['Critical', 'High', 'Medium', 'Low'];
    return ids.map(id => ({
      id,
      title: id,
      desc: `${id} priority items`,
      features: filteredFeatures.filter(f => f.priority === id).sort((a, b) => b.impactScore - a.impactScore),
      colIds: ids
    }));
  };

  const getReleaseColumns = () => {
    // Sort releases by target date
    const sortedReleases = [...releases].sort((a, b) => new Date(a.targetDate).getTime() - new Date(b.targetDate).getTime());
    const ids = ['backlog', ...sortedReleases.map(r => r.id)];
    
    return ids.map(id => {
      if (id === 'backlog') {
        return {
          id,
          title: "Backlog",
          desc: "Unassigned to a release",
          features: filteredFeatures.filter(f => !f.releaseId).sort((a, b) => b.impactScore - a.impactScore),
          colIds: ids
        };
      }
      const release = sortedReleases.find(r => r.id === id)!;
      return {
        id,
        title: release.version,
        desc: new Date(release.targetDate).toLocaleDateString(),
        features: filteredFeatures.filter(f => f.releaseId === id).sort((a, b) => b.impactScore - a.impactScore),
        colIds: ids
      };
    });
  };

  const getActiveColumns = () => {
    if (boardType === 'Phase') return getPhaseColumns();
    if (boardType === 'Priority') return getPriorityColumns();
    if (boardType === 'Release') return getReleaseColumns();
    return [];
  };

  const getDependencyWarnings = (feature: Feature) => {
    if (!feature.dependsOn || feature.dependsOn.length === 0) return [];
    const warnings: string[] = [];
    feature.dependsOn.forEach(depId => {
      const dep = features.find(f => f.id === depId);
      if (dep) {
        if (feature.startDate && dep.targetDate && new Date(feature.startDate) < new Date(dep.targetDate)) {
          warnings.push(`Scheduled before dependency: ${dep.title}`);
        }
      }
    });
    return warnings;
  };

  const columns = getActiveColumns();

  return (
    <div className="max-w-[1400px] mx-auto space-y-8 h-full flex flex-col pb-4">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Product Roadmap</h1>
          <p className="text-muted-foreground mt-1">Visualize and plan your feature rollout.</p>
        </div>
        
        <div className="flex items-center gap-3 bg-card border border-border p-1 rounded-lg">
          <Layout className="w-4 h-4 text-muted-foreground ml-2" />
          <span className="text-sm text-muted-foreground mr-1">View by:</span>
          {(['Phase', 'Priority', 'Release', 'Timeline'] as BoardType[]).map(type => (
            <button
              key={type}
              onClick={() => setBoardType(type)}
              className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                boardType === type ? 'bg-primary text-primary-foreground shadow-sm' : 'hover:bg-accent text-muted-foreground'
              }`}
            >
              {type}
            </button>
          ))}
        </div>
      </div>

      <SearchFilterBar 
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
      />

      {boardType === 'Timeline' ? (
        <div className="flex-1 min-h-0 bg-background rounded-xl border border-border">
          <GanttTimeline 
            features={filteredFeatures} 
            releases={releases} 
            onFeatureClick={openEditModal} 
          />
        </div>
      ) : (
        <div className="flex gap-6 overflow-x-auto pb-4 flex-1 min-h-0 snap-x">
          {columns.map((col, index) => (
            <div key={col.id} className="flex flex-col bg-muted/50 rounded-xl border border-border p-4 h-full w-[350px] min-w-[350px] snap-center">
              <div className="mb-4">
                <h2 className="text-xl font-semibold">{col.title}</h2>
                <p className="text-xs text-muted-foreground">{col.desc}</p>
              </div>
              
              <div className="flex-1 overflow-y-auto space-y-3 pr-1">
                {col.features.map(f => {
                  const warnings = getDependencyWarnings(f);
                  return (
                  <div key={f.id} className="bg-card p-4 rounded-lg border border-border shadow-sm group">
                    <div className="flex justify-between items-start gap-2">
                      <h3 className="font-medium text-sm">{f.title}</h3>
                      <button 
                        onClick={() => openEditModal(f)}
                        className="p-1 text-muted-foreground hover:text-foreground rounded hover:bg-accent opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0"
                        title="Edit Feature"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    {warnings.length > 0 && (
                      <div className="mt-2 text-xs text-destructive flex flex-col gap-1 bg-destructive/10 p-1.5 rounded">
                        {warnings.map((w, i) => (
                          <div key={i} className="flex items-start gap-1">
                            <AlertTriangle className="w-3 h-3 flex-shrink-0 mt-0.5" />
                            <span>{w}</span>
                          </div>
                        ))}
                      </div>
                    )}

                    <div className="flex items-center justify-between mt-4">
                      <span className="text-xs font-medium text-muted-foreground bg-accent px-2 py-1 rounded">
                        {boardType !== 'Priority' ? f.priority : (f.roadmapPhase || 'Unassigned')}
                      </span>
                      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button 
                          disabled={index === 0}
                          onClick={() => moveFeature(f.id, col.id, 'left', col.colIds)}
                          className="p-1 text-muted-foreground hover:text-foreground disabled:opacity-30 rounded hover:bg-accent"
                        >
                          <ArrowLeft className="w-4 h-4" />
                        </button>
                        <button 
                          disabled={index === columns.length - 1}
                          onClick={() => moveFeature(f.id, col.id, 'right', col.colIds)}
                          className="p-1 text-muted-foreground hover:text-foreground disabled:opacity-30 rounded hover:bg-accent"
                        >
                          <ArrowRight className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                )})}
                
                {col.features.length === 0 && (
                  <div className="text-center p-4 text-sm text-muted-foreground/60 border-2 border-dashed border-border/50 rounded-lg">
                    Empty
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {isModalOpen && (
        <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-card border border-border rounded-xl shadow-lg max-w-xl w-full p-6 space-y-6">
            <h2 className="text-xl font-bold">Edit Feature</h2>
            <form onSubmit={handleSaveFeature} className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Feature Name</label>
                <input required type="text" value={title} onChange={e => setTitle(e.target.value)} className="w-full px-3 py-2 border rounded-md bg-background" />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Description</label>
                <textarea value={description} onChange={e => setDescription(e.target.value)} className="w-full px-3 py-2 border rounded-md bg-background min-h-[80px]" />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Impact (1-10)</label>
                  <input type="range" min="1" max="10" value={impact} onChange={e => setImpact(Number(e.target.value))} className="w-full" />
                  <div className="text-xs text-center">{impact}</div>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Effort (1-10)</label>
                  <input type="range" min="1" max="10" value={effort} onChange={e => setEffort(Number(e.target.value))} className="w-full" />
                  <div className="text-xs text-center">{effort}</div>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
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
                <div className="space-y-2">
                  <label className="text-sm font-medium">Release</label>
                  <select value={releaseId} onChange={e => setReleaseId(e.target.value)} className="w-full px-3 py-2 border rounded-md bg-background">
                    <option value="">None</option>
                    {releases.map(r => (
                      <option key={r.id} value={r.id}>v{r.version}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-4">
                <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 border rounded-md text-sm">Cancel</button>
                <button type="submit" className="px-4 py-2 bg-primary text-primary-foreground rounded-md text-sm font-medium">
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
