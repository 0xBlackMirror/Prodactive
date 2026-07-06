"use client";

import { useStore, Release, ReleaseStatus } from "@/lib/store";
import { useState, useMemo } from "react";
import { Plus, Tag, Calendar, Package, Edit2, Trash2 } from "lucide-react";
import { SearchFilterBar } from "@/components/SearchFilterBar";
import { ConfirmDialog } from "@/components/ConfirmDialog";
import { MarkdownEditor } from "@/components/MarkdownRenderer";
import Link from "next/link";

export default function ReleasesPage() {
  const { releases, addRelease, updateRelease, deleteRelease, features } = useStore();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingReleaseId, setEditingReleaseId] = useState<string | null>(null);
  
  const [version, setVersion] = useState("");
  const [description, setDescription] = useState("");
  const [targetDate, setTargetDate] = useState("");
  const [status, setStatus] = useState<ReleaseStatus>("Planning");

  // Search, Filter, Sort
  const [searchQuery, setSearchQuery] = useState("");
  const [sortValue, setSortValue] = useState("targetDate");
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>("asc");
  const [selectedStatuses, setSelectedStatuses] = useState<string[]>([]);
  
  // Bulk Selection
  const [isBulkMode, setIsBulkMode] = useState(false);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  // Confirm Delete
  const [itemToDelete, setItemToDelete] = useState<string | null>(null);
  const [bulkDeleteConfirm, setBulkDeleteConfirm] = useState(false);

  const openAddModal = () => {
    setEditingReleaseId(null);
    setVersion("");
    setDescription("");
    setTargetDate("");
    setStatus("Planning");
    setIsModalOpen(true);
  };

  const openEditModal = (r: Release) => {
    setEditingReleaseId(r.id);
    setVersion(r.version);
    setDescription(r.description || "");
    setTargetDate(r.targetDate);
    setStatus(r.status);
    setIsModalOpen(true);
  };

  const handleSaveRelease = (e: React.FormEvent) => {
    e.preventDefault();
    if (!version.trim() || !targetDate) return;
    
    if (editingReleaseId) {
      updateRelease(editingReleaseId, {
        version: version.trim(),
        description: description.trim(),
        targetDate,
        status
      });
    } else {
      addRelease({
        id: crypto.randomUUID(),
        version: version.trim(),
        description: description.trim(),
        targetDate,
        status
      });
    }
    
    setIsModalOpen(false);
  };

  const handleDeleteItem = () => {
    if (itemToDelete) {
      deleteRelease(itemToDelete);
      setItemToDelete(null);
    }
  };

  const handleBulkDelete = () => {
    selectedIds.forEach(id => deleteRelease(id));
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

  const filteredReleases = useMemo(() => {
    return releases.filter(r => {
      if (searchQuery && !r.version.toLowerCase().includes(searchQuery.toLowerCase()) && !(r.description || "").toLowerCase().includes(searchQuery.toLowerCase())) {
        return false;
      }
      if (selectedStatuses.length > 0 && !selectedStatuses.includes(r.status)) {
        return false;
      }
      return true;
    }).sort((a, b) => {
      let valA: any = a[sortValue as keyof Release];
      let valB: any = b[sortValue as keyof Release];

      if (sortValue === 'targetDate') {
        valA = new Date(a.targetDate).getTime();
        valB = new Date(b.targetDate).getTime();
      }

      if (valA < valB) return sortDirection === 'asc' ? -1 : 1;
      if (valA > valB) return sortDirection === 'asc' ? 1 : -1;
      return 0;
    });
  }, [releases, searchQuery, selectedStatuses, sortValue, sortDirection]);

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Release Planner</h1>
          <p className="text-muted-foreground mt-1">Plan versions, milestones, and scope.</p>
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
            className="px-4 py-2 bg-primary text-primary-foreground rounded-md text-sm font-medium flex items-center gap-2 hover:bg-primary/90"
          >
            <Plus className="w-4 h-4" />
            New Release
          </button>
        </div>
      </div>

      <SearchFilterBar 
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        filters={[
          {
            id: 'status',
            label: 'Status',
            options: [
              { label: 'Planning', value: 'Planning' },
              { label: 'In Progress', value: 'In Progress' },
              { label: 'Released', value: 'Released' }
            ],
            value: selectedStatuses,
            onChange: setSelectedStatuses
          }
        ]}
        sortOptions={[
          { label: 'Target Date', value: 'targetDate' },
          { label: 'Version', value: 'version' },
          { label: 'Status', value: 'status' }
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

      <div className="space-y-6">
        {filteredReleases.length === 0 ? (
          <div className="text-center py-16 border border-border border-dashed rounded-xl bg-card">
            <Package className="w-12 h-12 text-muted-foreground mx-auto mb-4 opacity-50" />
            <h3 className="text-lg font-medium">No releases found</h3>
            <p className="text-muted-foreground max-w-sm mx-auto mt-2">Adjust filters or define a new milestone.</p>
          </div>
        ) : (
          <div className="relative border-l-2 border-border ml-4 space-y-10 py-4">
            {filteredReleases.map(release => {
              const releaseFeatures = features.filter(f => f.releaseId === release.id);
              const isSelected = selectedIds.has(release.id);
              
              return (
                <div key={release.id} className="relative pl-8 group">
                  <div className="absolute w-4 h-4 bg-primary rounded-full -left-[9px] top-1.5 ring-4 ring-background" />
                  
                  <div className={`bg-card border rounded-xl p-6 shadow-sm transition-colors ${isSelected ? 'border-primary bg-primary/5' : 'border-border'}`}>
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center gap-3">
                        {isBulkMode && (
                          <input 
                            type="checkbox" 
                            checked={isSelected}
                            onChange={() => toggleSelection(release.id)}
                            className="w-5 h-5 rounded border-input text-primary focus:ring-primary"
                          />
                        )}
                        <h3 className="text-xl font-bold flex items-center gap-2 hover:text-primary transition-colors">
                          <Tag className="w-5 h-5 text-primary" />
                          <Link href={`/releases/${release.id}`}>v{release.version}</Link>
                        </h3>
                        <span className="text-xs px-2 py-0.5 rounded-full bg-accent text-accent-foreground border border-border">
                          {release.status}
                        </span>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <div className="flex items-center gap-2 text-sm text-muted-foreground bg-accent px-3 py-1 rounded-full">
                          <Calendar className="w-4 h-4" />
                          {new Date(release.targetDate).toLocaleDateString(undefined, { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric' })}
                        </div>
                        <div className="opacity-0 group-hover:opacity-100 transition-opacity flex gap-1">
                          <button 
                            onClick={() => openEditModal(release)}
                            className="p-1.5 text-muted-foreground hover:text-foreground rounded hover:bg-accent"
                            title="Edit Release"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button 
                            onClick={() => setItemToDelete(release.id)}
                            className="p-1.5 text-muted-foreground hover:text-destructive rounded hover:bg-destructive/10"
                            title="Delete Release"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>

                    {release.description && (
                      <p className="text-sm text-muted-foreground mb-4 line-clamp-2">{release.description.replace(/[*#]/g, '')}</p>
                    )}

                    <div>
                      <h4 className="text-sm font-semibold mb-2">Scope ({releaseFeatures.length} features)</h4>
                      {releaseFeatures.length === 0 ? (
                        <p className="text-sm text-muted-foreground italic">No features assigned to this release yet.</p>
                      ) : (
                        <ul className="space-y-2">
                          {releaseFeatures.map(f => (
                            <li key={f.id} className="text-sm flex items-center justify-between bg-background border border-border px-3 py-2 rounded-md hover:border-primary/50 transition-colors">
                              <Link href={`/features/${f.id}`} className="hover:underline">{f.title}</Link>
                              <span className="text-xs text-muted-foreground bg-accent px-2 rounded-full py-0.5">{f.priority}</span>
                            </li>
                          ))}
                        </ul>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-card border border-border rounded-xl shadow-lg max-w-lg w-full p-6 space-y-6 max-h-[90vh] overflow-y-auto">
            <h2 className="text-xl font-bold">{editingReleaseId ? "Edit Release" : "Plan New Release"}</h2>
            <form onSubmit={handleSaveRelease} className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Version Name / Number</label>
                <input required type="text" value={version} onChange={e => setVersion(e.target.value)} placeholder="1.0.0 or Q3 Launch" className="w-full px-3 py-2 border rounded-md bg-background focus:ring-2 focus:ring-primary outline-none" />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Description</label>
                <MarkdownEditor value={description} onChange={setDescription} minHeight="100px" placeholder="Goals for this release..." />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Target Date</label>
                  <input required type="date" value={targetDate} onChange={e => setTargetDate(e.target.value)} className="w-full px-3 py-2 border rounded-md bg-background focus:ring-2 focus:ring-primary outline-none" />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Status</label>
                  <select value={status} onChange={e => setStatus(e.target.value as ReleaseStatus)} className="w-full px-3 py-2 border rounded-md bg-background focus:ring-2 focus:ring-primary outline-none">
                    <option value="Planning">Planning</option>
                    <option value="In Progress">In Progress</option>
                    <option value="Released">Released</option>
                  </select>
                </div>
              </div>
              
              <div className="flex justify-end gap-3 pt-6 border-t border-border">
                <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 border rounded-md text-sm hover:bg-accent">Cancel</button>
                <button type="submit" className="px-4 py-2 bg-primary text-primary-foreground rounded-md text-sm font-medium hover:bg-primary/90">
                  {editingReleaseId ? "Save Changes" : "Save Release"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {itemToDelete && (
        <ConfirmDialog
          title="Delete Release"
          message="Are you sure you want to delete this release? Features in this release will not be deleted."
          onConfirm={handleDeleteItem}
          onCancel={() => setItemToDelete(null)}
          confirmText="Delete"
        />
      )}

      {bulkDeleteConfirm && (
        <ConfirmDialog
          title={`Delete ${selectedIds.size} Releases`}
          message={`Are you sure you want to delete these ${selectedIds.size} releases?`}
          onConfirm={handleBulkDelete}
          onCancel={() => setBulkDeleteConfirm(false)}
          confirmText="Delete All"
        />
      )}
    </div>
  );
}
