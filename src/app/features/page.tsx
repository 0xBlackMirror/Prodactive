"use client";

import { useStore, Feature, FeaturePriority, RoadmapPhase } from "@/lib/store";
import { computeRICE } from "@/lib/helpers";
import { useState, useMemo } from "react";
import { Plus, BarChart, Edit2, Trash2, Layers } from "lucide-react";
import { SearchFilterBar } from "@/components/SearchFilterBar";
import { ConfirmDialog } from "@/components/ConfirmDialog";
import { TagInput } from "@/components/TagInput";
import { MarkdownEditor } from "@/components/MarkdownRenderer";
import Link from "next/link";

export default function FeaturePlannerPage() {
  const { features, addFeature, updateFeature, deleteFeature, releases } = useStore();
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingFeatureId, setEditingFeatureId] = useState<string | null>(null);
  
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [priority, setPriority] = useState<FeaturePriority>("Medium");
  const [impact, setImpact] = useState(5);
  const [effort, setEffort] = useState(5);
  const [reach, setReach] = useState(100);
  const [confidence, setConfidence] = useState(80);
  const [phase, setPhase] = useState<RoadmapPhase>("Later");
  const [releaseId, setReleaseId] = useState<string>("");
  const [tags, setTags] = useState<string[]>([]);

  // Search, Filter, Sort
  const [searchQuery, setSearchQuery] = useState("");
  const [sortValue, setSortValue] = useState("score");
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>("desc");
  const [selectedPriorities, setSelectedPriorities] = useState<string[]>([]);
  
  // Bulk Selection
  const [isBulkMode, setIsBulkMode] = useState(false);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  // Confirm Delete
  const [itemToDelete, setItemToDelete] = useState<string | null>(null);
  const [bulkDeleteConfirm, setBulkDeleteConfirm] = useState(false);

  const openAddModal = () => {
    setEditingFeatureId(null);
    setTitle("");
    setDescription("");
    setPriority("Medium");
    setImpact(5);
    setEffort(5);
    setReach(100);
    setConfidence(80);
    setPhase("Later");
    setReleaseId("");
    setTags([]);
    setIsModalOpen(true);
  };

  const openEditModal = (f: Feature) => {
    setEditingFeatureId(f.id);
    setTitle(f.title);
    setDescription(f.description);
    setPriority(f.priority);
    setImpact(f.impactScore);
    setEffort(f.effortScore);
    setReach(f.reach || 100);
    setConfidence(f.confidence || 80);
    setPhase(f.roadmapPhase || "Later");
    setReleaseId(f.releaseId || "");
    setTags(f.tags || []);
    setIsModalOpen(true);
  };

  const handleSaveFeature = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;
    
    if (editingFeatureId) {
      updateFeature(editingFeatureId, {
        title: title.trim(),
        description: description.trim(),
        priority,
        impactScore: impact,
        effortScore: effort,
        reach,
        confidence,
        roadmapPhase: phase,
        releaseId: releaseId || undefined,
        tags
      });
    } else {
      addFeature({
        id: crypto.randomUUID(),
        title: title.trim(),
        description: description.trim(),
        priority,
        impactScore: impact,
        effortScore: effort,
        reach,
        confidence,
        roadmapPhase: phase,
        releaseId: releaseId || undefined,
        tags,
        dependsOn: [],
        createdAt: new Date().toISOString()
      });
    }
    setIsModalOpen(false);
  };

  const handleDeleteItem = () => {
    if (itemToDelete) {
      deleteFeature(itemToDelete);
      setItemToDelete(null);
    }
  };

  const handleBulkDelete = () => {
    selectedIds.forEach(id => deleteFeature(id));
    setSelectedIds(new Set());
    setBulkDeleteConfirm(false);
    setIsBulkMode(false);
  };

  const toggleSelection = (id: string) => {
    const next = new Set(selectedIds);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    setSelectedIds(next);
  };

  const filteredFeatures = useMemo(() => {
    return features.filter(f => {
      if (searchQuery && !f.title.toLowerCase().includes(searchQuery.toLowerCase()) && !(f.description || "").toLowerCase().includes(searchQuery.toLowerCase())) {
        return false;
      }
      if (selectedPriorities.length > 0 && !selectedPriorities.includes(f.priority)) {
        return false;
      }
      return true;
    }).sort((a, b) => {
      let valA: any = a[sortValue as keyof Feature];
      let valB: any = b[sortValue as keyof Feature];

      if (sortValue === 'score') {
        valA = computeRICE(a.reach, a.impactScore, a.confidence, a.effortScore);
        valB = computeRICE(b.reach, b.impactScore, b.confidence, b.effortScore);
      } else if (sortValue === 'title') {
        valA = a.title.toLowerCase();
        valB = b.title.toLowerCase();
      }

      if (valA < valB) return sortDirection === 'asc' ? -1 : 1;
      if (valA > valB) return sortDirection === 'asc' ? 1 : -1;
      return 0;
    });
  }, [features, searchQuery, selectedPriorities, sortValue, sortDirection]);

  const priorityColors = {
    "Critical": "bg-destructive/10 text-destructive border-destructive/20",
    "High": "bg-orange-500/10 text-orange-500 border-orange-500/20",
    "Medium": "bg-blue-500/10 text-blue-500 border-blue-500/20",
    "Low": "bg-muted text-muted-foreground border-border"
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Feature Planner</h1>
          <p className="text-muted-foreground mt-1">Manage backlog with RICE scoring, tags, and detailed planning.</p>
        </div>
        <div className="flex gap-2">
          {isBulkMode && selectedIds.size > 0 && (
            <button 
              onClick={() => setBulkDeleteConfirm(true)}
              className="px-4 py-2 bg-destructive/10 text-destructive hover:bg-destructive/20 rounded-md text-sm font-medium flex items-center gap-2"
            >
              <Trash2 className="w-4 h-4" />
              Delete ({selectedIds.size})
            </button>
          )}
          <button 
            onClick={openAddModal}
            className="px-4 py-2 bg-primary text-primary-foreground hover:bg-primary/90 rounded-md text-sm font-medium flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            New Feature
          </button>
        </div>
      </div>

      <SearchFilterBar 
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        filters={[
          {
            id: 'priority',
            label: 'Priority',
            options: [
              { label: 'Critical', value: 'Critical' },
              { label: 'High', value: 'High' },
              { label: 'Medium', value: 'Medium' },
              { label: 'Low', value: 'Low' }
            ],
            value: selectedPriorities,
            onChange: setSelectedPriorities
          }
        ]}
        sortOptions={[
          { label: 'RICE Score', value: 'score' },
          { label: 'Title', value: 'title' },
          { label: 'Impact', value: 'impactScore' },
          { label: 'Effort', value: 'effortScore' },
          { label: 'Created', value: 'createdAt' }
        ]}
        sortValue={sortValue}
        onSortChange={setSortValue}
        sortDirection={sortDirection}
        onSortDirectionChange={setSortDirection}
        isBulkMode={isBulkMode}
        onToggleBulkMode={() => {
          setIsBulkMode(!isBulkMode);
          setSelectedIds(new Set());
        }}
        selectedCount={selectedIds.size}
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold flex items-center gap-2">
              <Layers className="w-5 h-5" /> Backlog
            </h2>
            <span className="text-sm text-muted-foreground">{filteredFeatures.length} features</span>
          </div>

          {filteredFeatures.length === 0 ? (
            <div className="py-20 border border-border border-dashed rounded-xl flex items-center justify-center text-muted-foreground bg-card">
              No features match your criteria.
            </div>
          ) : (
            <div className="space-y-3">
              {filteredFeatures.map(feature => {
                const score = computeRICE(feature.reach, feature.impactScore, feature.confidence, feature.effortScore);
                const assignedRelease = releases.find(r => r.id === feature.releaseId);
                const isSelected = selectedIds.has(feature.id);
                
                return (
                  <div key={feature.id} className={`p-5 rounded-xl border bg-card shadow-sm flex flex-col sm:flex-row sm:items-center gap-4 group transition-colors ${isSelected ? 'border-primary bg-primary/5' : 'border-border'}`}>
                    
                    {isBulkMode && (
                      <div className="flex items-center justify-center pt-1 sm:pt-0">
                        <input 
                          type="checkbox" 
                          checked={isSelected}
                          onChange={() => toggleSelection(feature.id)}
                          className="w-5 h-5 rounded border-input text-primary focus:ring-primary"
                        />
                      </div>
                    )}

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-3 mb-1">
                        <Link href={`/features/${feature.id}`} className="font-semibold text-lg hover:text-primary transition-colors truncate">
                          {feature.title}
                        </Link>
                        <span className={`text-xs px-2 py-0.5 rounded-full font-medium border ${priorityColors[feature.priority]}`}>
                          {feature.priority}
                        </span>
                        {assignedRelease && (
                          <span className="text-xs px-2 py-0.5 rounded-full font-medium bg-accent text-accent-foreground border border-border whitespace-nowrap">
                            v{assignedRelease.version}
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground line-clamp-1 mb-2">
                        {feature.description.replace(/[*#]/g, '') || 'No description provided.'}
                      </p>
                      
                      {feature.tags && feature.tags.length > 0 && (
                        <div className="flex gap-1 flex-wrap">
                          {feature.tags.map(t => (
                            <span key={t} className="text-[10px] px-1.5 py-0.5 rounded bg-accent text-accent-foreground border border-border">{t}</span>
                          ))}
                        </div>
                      )}
                    </div>
                    
                    <div className="flex sm:flex-col gap-4 sm:gap-1 items-center sm:items-end min-w-[140px]">
                      <div className="text-xs text-muted-foreground grid grid-cols-2 gap-x-2 text-right">
                        <span title="Reach">R: {feature.reach}</span>
                        <span title="Impact">I: {feature.impactScore}</span>
                        <span title="Confidence">C: {feature.confidence}%</span>
                        <span title="Effort">E: {feature.effortScore}</span>
                      </div>
                      <div className="text-sm font-bold flex items-center gap-1 mt-1">
                        <BarChart className="w-4 h-4 text-primary" />
                        RICE: {score}
                      </div>
                    </div>

                    <div className="flex sm:flex-col gap-2 items-end justify-between">
                      <div className="flex gap-1">
                        <button 
                          onClick={() => openEditModal(feature)}
                          className="p-1.5 text-muted-foreground hover:text-foreground rounded hover:bg-accent"
                          title="Edit Feature"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button 
                          onClick={() => setItemToDelete(feature.id)}
                          className="p-1.5 text-muted-foreground hover:text-destructive rounded hover:bg-destructive/10"
                          title="Delete Feature"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                      <select 
                        value={feature.roadmapPhase}
                        onChange={(e) => updateFeature(feature.id, { roadmapPhase: e.target.value as RoadmapPhase })}
                        className="text-xs px-2 py-1 bg-accent rounded border-border"
                      >
                        <option value="Now">Now</option>
                        <option value="Next">Next</option>
                        <option value="Later">Later</option>
                      </select>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        <div className="space-y-4">
          <h2 className="text-xl font-semibold">Impact vs Effort</h2>
          <div className="aspect-square bg-card border border-border rounded-xl relative p-4 shadow-sm">
            <div className="absolute inset-0 grid grid-cols-2 grid-rows-2 p-4">
              <div className="border-r border-b border-border/50 bg-green-500/5 rounded-tl-lg flex items-center justify-center"><span className="text-muted-foreground/30 font-bold rotate-[-45deg]">Quick Wins</span></div>
              <div className="border-b border-border/50 bg-blue-500/5 rounded-tr-lg flex items-center justify-center"><span className="text-muted-foreground/30 font-bold rotate-[-45deg]">Major Projects</span></div>
              <div className="border-r border-border/50 bg-orange-500/5 rounded-bl-lg flex items-center justify-center"><span className="text-muted-foreground/30 font-bold rotate-[-45deg]">Fill-ins</span></div>
              <div className="bg-destructive/5 rounded-br-lg flex items-center justify-center"><span className="text-muted-foreground/30 font-bold rotate-[-45deg]">Time Sink</span></div>
            </div>
            
            {features.map(f => {
              const bottom = `${((f.impactScore - 1) / 9) * 90 + 5}%`;
              const left = `${((f.effortScore - 1) / 9) * 90 + 5}%`;
              
              return (
                <Link 
                  href={`/features/${f.id}`}
                  key={f.id} 
                  className="absolute w-3 h-3 bg-primary rounded-full cursor-pointer hover:scale-150 transition-transform shadow-sm ring-2 ring-background z-10"
                  style={{ bottom, left }}
                  title={`${f.title} (I:${f.impactScore}, E:${f.effortScore})`}
                />
              )
            })}
            
            <div className="absolute left-2 top-1/2 -translate-y-1/2 -rotate-90 text-xs font-medium text-muted-foreground">Impact &rarr;</div>
            <div className="absolute bottom-2 left-1/2 -translate-x-1/2 text-xs font-medium text-muted-foreground">Effort &rarr;</div>
          </div>
        </div>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-card border border-border rounded-xl shadow-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6 space-y-6">
            <h2 className="text-xl font-bold">{editingFeatureId ? "Edit Feature" : "Plan New Feature"}</h2>
            <form onSubmit={handleSaveFeature} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2 md:col-span-2">
                  <label className="text-sm font-medium">Feature Name</label>
                  <input required type="text" value={title} onChange={e => setTitle(e.target.value)} className="w-full px-3 py-2 border rounded-md bg-background focus:ring-2 focus:ring-primary outline-none" />
                </div>
                
                <div className="space-y-2 md:col-span-2">
                  <label className="text-sm font-medium">Description</label>
                  <MarkdownEditor value={description} onChange={setDescription} minHeight="120px" placeholder="Describe the feature... (Markdown supported)" />
                </div>

                <div className="space-y-2 md:col-span-2">
                  <label className="text-sm font-medium">Tags</label>
                  <TagInput tags={tags} onChange={setTags} placeholder="Add tags like 'UI', 'Backend'..." />
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
                <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 border rounded-md text-sm hover:bg-accent">Cancel</button>
                <button type="submit" className="px-4 py-2 bg-primary text-primary-foreground rounded-md text-sm font-medium hover:bg-primary/90">
                  {editingFeatureId ? "Save Changes" : "Add to Backlog"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {itemToDelete && (
        <ConfirmDialog
          title="Delete Feature"
          message="Are you sure you want to delete this feature? This action cannot be undone."
          onConfirm={handleDeleteItem}
          onCancel={() => setItemToDelete(null)}
          confirmText="Delete"
        />
      )}

      {bulkDeleteConfirm && (
        <ConfirmDialog
          title={`Delete ${selectedIds.size} Features`}
          message={`Are you sure you want to delete these ${selectedIds.size} features? This action cannot be undone.`}
          onConfirm={handleBulkDelete}
          onCancel={() => setBulkDeleteConfirm(false)}
          confirmText="Delete All"
        />
      )}
    </div>
  );
}
