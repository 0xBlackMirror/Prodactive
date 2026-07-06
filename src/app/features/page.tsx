"use client";

import { useStore, Feature, FeaturePriority, FeatureStatus, RoadmapPhase } from "@/lib/store";
import { computeRICE } from "@/lib/helpers";
import { useState, useMemo } from "react";
import { Plus, BarChart, Edit2, Trash2, Layers, LayoutGrid, List as ListIcon, User } from "lucide-react";
import { SearchFilterBar } from "@/components/SearchFilterBar";
import { ConfirmDialog } from "@/components/ConfirmDialog";
import { TagInput } from "@/components/TagInput";
import { MarkdownEditor } from "@/components/MarkdownRenderer";
import Link from "next/link";

export default function FeaturePlannerPage() {
  const { features, addFeature, updateFeature, deleteFeature, releases, stakeholders } = useStore();
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingFeatureId, setEditingFeatureId] = useState<string | null>(null);
  
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

  // Search, Filter, Sort
  const [searchQuery, setSearchQuery] = useState("");
  const [sortValue, setSortValue] = useState("score");
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>("desc");
  const [selectedPriorities, setSelectedPriorities] = useState<string[]>([]);
  const [selectedStatuses, setSelectedStatuses] = useState<string[]>([]);
  const [selectedPhases, setSelectedPhases] = useState<string[]>([]);
  
  // View Mode
  const [viewMode, setViewMode] = useState<'list' | 'kanban'>('list');
  const [hideDone, setHideDone] = useState(false);

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
    setStatus("Draft");
    setAssigneeId("");
    setImpact(5);
    setEffort(5);
    setReach(100);
    setConfidence(80);
    setPhase("Later");
    setReleaseId("");
    setDependsOn([]);
    setTags([]);
    setIsModalOpen(true);
  };

  const openEditModal = (f: Feature) => {
    setEditingFeatureId(f.id);
    setTitle(f.title);
    setDescription(f.description);
    setPriority(f.priority);
    setStatus(f.status || "Draft");
    setAssigneeId(f.assigneeId || "");
    setImpact(f.impactScore);
    setEffort(f.effortScore);
    setReach(f.reach || 100);
    setConfidence(f.confidence || 80);
    setPhase(f.roadmapPhase || "Later");
    setReleaseId(f.releaseId || "");
    setDependsOn(f.dependsOn || []);
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
    } else {
      addFeature({
        id: crypto.randomUUID(),
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
        tags,
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
      const featStatus = f.status || 'Draft';
      
      if (viewMode === 'list' && hideDone && featStatus === 'Done') {
        return false;
      }

      if (searchQuery && !f.title.toLowerCase().includes(searchQuery.toLowerCase()) && !(f.description || "").toLowerCase().includes(searchQuery.toLowerCase())) {
        return false;
      }
      if (selectedPriorities.length > 0 && !selectedPriorities.includes(f.priority)) {
        return false;
      }
      if (selectedStatuses.length > 0 && !selectedStatuses.includes(featStatus)) {
        return false;
      }
      const featPhase = f.roadmapPhase || 'Later';
      if (selectedPhases.length > 0 && !selectedPhases.includes(featPhase)) {
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
  }, [features, searchQuery, selectedPriorities, selectedStatuses, selectedPhases, sortValue, sortDirection, hideDone, viewMode]);

  const priorityColors = {
    "Critical": "bg-destructive/10 text-destructive border-destructive/20",
    "High": "bg-orange-500/10 text-orange-500 border-orange-500/20",
    "Medium": "bg-blue-500/10 text-blue-500 border-blue-500/20",
    "Low": "bg-muted text-muted-foreground border-border"
  };

  const statusColors: Record<FeatureStatus, string> = {
    "Draft": "bg-muted text-muted-foreground border-border",
    "In Development": "bg-blue-500/10 text-blue-500 border-blue-500/20",
    "QA": "bg-purple-500/10 text-purple-500 border-purple-500/20",
    "Done": "bg-green-500/10 text-green-500 border-green-500/20"
  };

  const ALL_STATUSES: FeatureStatus[] = ['Draft', 'In Development', 'QA', 'Done'];

  // Summary counts
  const priorityCounts = features.reduce((acc, f) => {
    acc[f.priority] = (acc[f.priority] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const renderFeatureCard = (feature: Feature, compact: boolean = false) => {
    const score = computeRICE(feature.reach, feature.impactScore, feature.confidence, feature.effortScore);
    const assignedRelease = releases.find(r => r.id === feature.releaseId);
    const assignee = stakeholders.find(s => s.id === feature.assigneeId);
    const isSelected = selectedIds.has(feature.id);
    const featStatus = feature.status || 'Draft';
    
    return (
      <div key={feature.id} className={`p-4 rounded-xl border bg-card shadow-sm flex flex-col gap-3 group transition-colors relative ${isSelected ? 'border-primary bg-primary/5 ring-1 ring-primary' : 'border-border'} ${compact ? 'hover:border-primary/50' : ''}`}>
        
        {isBulkMode && !compact && (
          <div className="absolute left-3 top-4 z-10">
            <input 
              type="checkbox" 
              checked={isSelected}
              onChange={() => toggleSelection(feature.id)}
              className="w-5 h-5 rounded border-input text-primary focus:ring-primary"
            />
          </div>
        )}

        <div className={`flex flex-col gap-1 ${isBulkMode && !compact ? 'pl-8' : ''}`}>
          <div className="flex items-start justify-between gap-2">
            <Link href={`/features/${feature.id}`} className="font-semibold text-base hover:text-primary transition-colors line-clamp-2">
              {feature.title}
            </Link>
            <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0">
              <button 
                onClick={(e) => { e.preventDefault(); openEditModal(feature); }}
                className="p-1 text-muted-foreground hover:text-foreground rounded hover:bg-accent"
                title="Edit Feature"
              >
                <Edit2 className="w-3.5 h-3.5" />
              </button>
              <button 
                onClick={(e) => { e.preventDefault(); setItemToDelete(feature.id); }}
                className="p-1 text-muted-foreground hover:text-destructive rounded hover:bg-destructive/10"
                title="Delete Feature"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
          
          <div className="flex flex-wrap gap-1.5 mt-1">
            <select 
              value={featStatus}
              onChange={(e) => updateFeature(feature.id, { status: e.target.value as FeatureStatus })}
              className={`text-[10px] font-medium px-1.5 py-0.5 rounded-full border outline-none cursor-pointer ${statusColors[featStatus as keyof typeof statusColors]}`}
            >
              <option value="Draft">Draft</option>
              <option value="In Development">In Dev</option>
              <option value="QA">QA</option>
              <option value="Done">Done</option>
            </select>
            
            <select 
              value={feature.priority}
              onChange={(e) => updateFeature(feature.id, { priority: e.target.value as FeaturePriority })}
              className={`text-[10px] font-medium px-1.5 py-0.5 rounded-full border outline-none cursor-pointer ${priorityColors[feature.priority]}`}
            >
              <option value="Critical">Critical</option>
              <option value="High">High</option>
              <option value="Medium">Medium</option>
              <option value="Low">Low</option>
            </select>

            <select 
              value={feature.roadmapPhase || "Later"}
              onChange={(e) => updateFeature(feature.id, { roadmapPhase: e.target.value as RoadmapPhase })}
              className="text-[10px] font-medium px-1.5 py-0.5 rounded-full bg-accent text-accent-foreground border border-border outline-none cursor-pointer"
            >
              <option value="Now">Phase: Now</option>
              <option value="Next">Phase: Next</option>
              <option value="Later">Phase: Later</option>
            </select>
          </div>
        </div>

        {!compact && (
          <p className={`text-sm text-muted-foreground line-clamp-2 ${isBulkMode ? 'pl-8' : ''}`}>
            {feature.description.replace(/[*#]/g, '') || 'No description provided.'}
          </p>
        )}
        
        <div className={`flex items-center justify-between mt-auto pt-2 border-t border-border/50 ${isBulkMode && !compact ? 'pl-8' : ''}`}>
          <div className="flex items-center gap-2">
            <div className="text-sm font-bold flex items-center gap-1" title="RICE Score">
              <BarChart className="w-3.5 h-3.5 text-primary" />
              {score}
            </div>
            {assignedRelease && (
              <span className="text-[10px] px-1.5 py-0.5 rounded border border-border text-muted-foreground whitespace-nowrap">
                v{assignedRelease.version}
              </span>
            )}
          </div>
          
          <div className="flex items-center gap-1">
            {assignee ? (
              <div className="w-6 h-6 rounded-full bg-primary/10 text-primary border border-primary/20 flex items-center justify-center text-[10px] font-bold" title={`Assigned to ${assignee.name}`}>
                {assignee.name.charAt(0).toUpperCase()}
              </div>
            ) : (
              <div className="w-6 h-6 rounded-full bg-muted border border-border flex items-center justify-center text-[10px] text-muted-foreground" title="Unassigned">
                <User className="w-3 h-3" />
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="max-w-[1400px] mx-auto space-y-6 h-full flex flex-col pb-8">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 flex-shrink-0">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Feature Planner</h1>
          <div className="flex items-center gap-3 mt-1 text-sm text-muted-foreground">
            <span>Total: {features.length}</span>
            {priorityCounts['Critical'] > 0 && <span className="text-destructive">• Critical: {priorityCounts['Critical']}</span>}
            {priorityCounts['High'] > 0 && <span className="text-orange-500">• High: {priorityCounts['High']}</span>}
          </div>
        </div>
        <div className="flex gap-2 items-center">
          {viewMode === 'list' && (
            <label className="flex items-center gap-2 mr-2 text-sm font-medium text-muted-foreground cursor-pointer hover:text-foreground transition-colors">
              <input type="checkbox" checked={hideDone} onChange={e => setHideDone(e.target.checked)} className="rounded border-input text-primary focus:ring-primary cursor-pointer" />
              Hide Done
            </label>
          )}
          <div className="flex items-center bg-accent rounded-md p-1 border border-border mr-2">
            <button 
              onClick={() => setViewMode('list')}
              className={`p-1.5 rounded-sm transition-colors ${viewMode === 'list' ? 'bg-background shadow-sm text-foreground' : 'text-muted-foreground hover:text-foreground'}`}
              title="List View"
            >
              <ListIcon className="w-4 h-4" />
            </button>
            <button 
              onClick={() => setViewMode('kanban')}
              className={`p-1.5 rounded-sm transition-colors ${viewMode === 'kanban' ? 'bg-background shadow-sm text-foreground' : 'text-muted-foreground hover:text-foreground'}`}
              title="Kanban Board View"
            >
              <LayoutGrid className="w-4 h-4" />
            </button>
          </div>

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
            className="px-4 py-2 bg-primary text-primary-foreground hover:bg-primary/90 rounded-md text-sm font-medium flex items-center gap-2 shadow-sm"
          >
            <Plus className="w-4 h-4" />
            New Feature
          </button>
        </div>
      </div>

      <div className="flex-shrink-0 relative z-20">
        <SearchFilterBar 
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          filters={[
            {
              id: 'status',
              label: 'Status',
              options: ALL_STATUSES.map(s => ({ label: s, value: s })),
              value: selectedStatuses,
              onChange: setSelectedStatuses
            },
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
            },
            {
              id: 'phase',
              label: 'Phase',
              options: [
                { label: 'Now', value: 'Now' },
                { label: 'Next', value: 'Next' },
                { label: 'Later', value: 'Later' }
              ],
              value: selectedPhases,
              onChange: setSelectedPhases
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
          isBulkMode={viewMode === 'list' ? isBulkMode : false}
          onToggleBulkMode={viewMode === 'list' ? () => {
            setIsBulkMode(!isBulkMode);
            setSelectedIds(new Set());
          } : undefined}
          selectedCount={selectedIds.size}
        />
      </div>

      {viewMode === 'list' ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 overflow-hidden flex-1">
          <div className="lg:col-span-2 overflow-y-auto pr-2 space-y-3">
            {filteredFeatures.length === 0 ? (
              <div className="py-20 border border-border border-dashed rounded-xl flex items-center justify-center text-muted-foreground bg-card">
                No features match your criteria.
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-3">
                {filteredFeatures.map(f => renderFeatureCard(f))}
              </div>
            )}
          </div>

          <div className="space-y-4 flex-shrink-0">
            <h2 className="text-xl font-semibold">Impact vs Effort</h2>
            <div className="aspect-square bg-card border border-border rounded-xl relative p-4 shadow-sm">
              <div className="absolute inset-0 grid grid-cols-2 grid-rows-2 p-4">
                <div className="border-r border-b border-border/50 bg-green-500/5 rounded-tl-lg flex items-center justify-center"><span className="text-muted-foreground/30 font-bold rotate-[-45deg]">Quick Wins</span></div>
                <div className="border-b border-border/50 bg-blue-500/5 rounded-tr-lg flex items-center justify-center"><span className="text-muted-foreground/30 font-bold rotate-[-45deg]">Major Projects</span></div>
                <div className="border-r border-border/50 bg-orange-500/5 rounded-bl-lg flex items-center justify-center"><span className="text-muted-foreground/30 font-bold rotate-[-45deg]">Fill-ins</span></div>
                <div className="bg-destructive/5 rounded-br-lg flex items-center justify-center"><span className="text-muted-foreground/30 font-bold rotate-[-45deg]">Time Sink</span></div>
              </div>
              
              {features.length === 0 ? (
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-20 px-8 text-center">
                  <p className="text-muted-foreground text-sm font-medium bg-card/80 p-3 rounded-lg backdrop-blur-sm border border-border/50">
                    Add features to see them plotted by impact vs effort.
                  </p>
                </div>
              ) : (
                features.map(f => {
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
                })
              )}
              
              <div className="absolute left-2 top-1/2 -translate-y-1/2 -rotate-90 text-xs font-medium text-muted-foreground">Impact &rarr;</div>
              <div className="absolute bottom-2 left-1/2 -translate-x-1/2 text-xs font-medium text-muted-foreground">Effort &rarr;</div>
            </div>
          </div>
        </div>
      ) : (
        <div className="flex-1 overflow-x-auto overflow-y-hidden">
          <div className="flex h-full gap-4 min-w-[1000px] pb-4">
            {ALL_STATUSES.map(colStatus => {
              const colFeatures = filteredFeatures.filter(f => (f.status || 'Draft') === colStatus);
              
              return (
                <div key={colStatus} className="flex-1 flex flex-col bg-accent/30 rounded-xl border border-border overflow-hidden">
                  <div className="p-3 border-b border-border bg-card/50 flex items-center justify-between flex-shrink-0">
                    <h3 className="font-semibold text-sm flex items-center gap-2">
                      <div className={`w-2 h-2 rounded-full ${statusColors[colStatus].split(' ')[0]} border ${statusColors[colStatus].split(' ')[2]}`} />
                      {colStatus}
                    </h3>
                    <span className="text-xs font-medium text-muted-foreground bg-accent px-2 py-0.5 rounded-full">
                      {colFeatures.length}
                    </span>
                  </div>
                  
                  <div className="flex-1 overflow-y-auto p-3 space-y-3">
                    {colFeatures.map(f => renderFeatureCard(f, true))}
                    {colFeatures.length === 0 && (
                      <div className="text-center p-6 border-2 border-dashed border-border rounded-lg text-muted-foreground text-sm">
                        Drop features here
                      </div>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}

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
                    {features.filter(f => f.id !== editingFeatureId).map(f => (
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
