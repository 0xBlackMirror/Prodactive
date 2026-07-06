"use client";

import { useStore, Mission, MissionStatus } from "@/lib/store";
import { useState, useMemo } from "react";
import { Plus, Trash2, CheckCircle2, Circle, Clock, Edit2 } from "lucide-react";
import { SearchFilterBar } from "@/components/SearchFilterBar";
import { ConfirmDialog } from "@/components/ConfirmDialog";
import { MarkdownEditor } from "@/components/MarkdownRenderer";
import Link from "next/link";

export default function MissionsPage() {
  const { missions, addMission, updateMission, deleteMission } = useStore();
  const [newTaskTitle, setNewTaskTitle] = useState("");
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingMissionId, setEditingMissionId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState("");
  const [editDescription, setEditDescription] = useState("");
  const [editStatus, setEditStatus] = useState<MissionStatus>("To Do");

  // Search, Filter, Sort
  const [searchQuery, setSearchQuery] = useState("");
  const [sortValue, setSortValue] = useState("createdAt");
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>("desc");
  const [selectedStatuses, setSelectedStatuses] = useState<string[]>([]);
  
  // Bulk Selection
  const [isBulkMode, setIsBulkMode] = useState(false);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  // Confirm Delete
  const [itemToDelete, setItemToDelete] = useState<string | null>(null);
  const [bulkDeleteConfirm, setBulkDeleteConfirm] = useState(false);

  const handleAddTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTaskTitle.trim()) return;
    
    addMission({
      id: crypto.randomUUID(),
      title: newTaskTitle.trim(),
      description: "",
      status: "To Do",
      linkedFeatureIds: [],
      keyResults: [],
      createdAt: new Date().toISOString()
    });
    setNewTaskTitle("");
  };

  const openEditModal = (m: Mission) => {
    setEditingMissionId(m.id);
    setEditTitle(m.title);
    setEditDescription(m.description || "");
    setEditStatus(m.status);
    setIsModalOpen(true);
  };

  const handleSaveMission = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editTitle.trim() || !editingMissionId) return;
    
    updateMission(editingMissionId, {
      title: editTitle.trim(),
      description: editDescription,
      status: editStatus
    });
    setIsModalOpen(false);
  };

  const handleDeleteItem = () => {
    if (itemToDelete) {
      deleteMission(itemToDelete);
      setItemToDelete(null);
    }
  };

  const handleBulkDelete = () => {
    selectedIds.forEach(id => deleteMission(id));
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

  const toggleStatus = (id: string, currentStatus: MissionStatus) => {
    const nextStatus: Record<MissionStatus, MissionStatus> = {
      "To Do": "In Progress",
      "In Progress": "Done",
      "Blocked": "Done",
      "Done": "To Do"
    };
    updateMission(id, { status: nextStatus[currentStatus] });
  };

  const filteredMissions = useMemo(() => {
    return missions.filter(m => {
      if (searchQuery && !m.title.toLowerCase().includes(searchQuery.toLowerCase()) && !(m.description || "").toLowerCase().includes(searchQuery.toLowerCase())) {
        return false;
      }
      if (selectedStatuses.length > 0 && !selectedStatuses.includes(m.status)) {
        return false;
      }
      return true;
    }).sort((a, b) => {
      let valA: any = a[sortValue as keyof Mission];
      let valB: any = b[sortValue as keyof Mission];

      if (sortValue === 'title') {
        valA = a.title.toLowerCase();
        valB = b.title.toLowerCase();
      }

      if (valA < valB) return sortDirection === 'asc' ? -1 : 1;
      if (valA > valB) return sortDirection === 'asc' ? 1 : -1;
      return 0;
    });
  }, [missions, searchQuery, selectedStatuses, sortValue, sortDirection]);

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">PM Daily Missions</h1>
          <p className="text-muted-foreground mt-1">Manage your operational tasks and goals for today.</p>
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
        </div>
      </div>

      <form onSubmit={handleAddTask} className="flex gap-4">
        <input 
          type="text" 
          value={newTaskTitle}
          onChange={(e) => setNewTaskTitle(e.target.value)}
          placeholder="What's your mission for today? (e.g., Review Q3 analytics)"
          className="flex-1 px-4 py-3 border border-input rounded-xl text-sm bg-card shadow-sm outline-none focus:ring-2 focus:ring-primary"
        />
        <button 
          type="submit"
          disabled={!newTaskTitle.trim()}
          className="px-6 py-3 bg-primary text-primary-foreground rounded-xl font-medium shadow-sm flex items-center gap-2 disabled:opacity-50"
        >
          <Plus className="w-5 h-5" />
          Add Mission
        </button>
      </form>

      <SearchFilterBar 
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        filters={[
          {
            id: 'status',
            label: 'Status',
            options: [
              { label: 'To Do', value: 'To Do' },
              { label: 'In Progress', value: 'In Progress' },
              { label: 'Blocked', value: 'Blocked' },
              { label: 'Done', value: 'Done' }
            ],
            value: selectedStatuses,
            onChange: setSelectedStatuses
          }
        ]}
        sortOptions={[
          { label: 'Date Logged', value: 'createdAt' },
          { label: 'Title', value: 'title' },
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

      <div className="space-y-4">
        {filteredMissions.length === 0 ? (
          <div className="text-center py-12 border border-border border-dashed rounded-xl text-muted-foreground bg-card">
            No missions match your criteria.
          </div>
        ) : (
          <div className="grid gap-3">
            {filteredMissions.map(mission => {
              const isSelected = selectedIds.has(mission.id);
              
              return (
                <div 
                  key={mission.id} 
                  className={`group flex items-center gap-4 p-4 rounded-xl border transition-colors ${mission.status === 'Done' ? 'bg-muted/50 opacity-75' : 'bg-card shadow-sm hover:border-primary/50'} ${isSelected ? 'border-primary bg-primary/5' : 'border-border'}`}
                >
                  {isBulkMode && (
                    <div className="flex-shrink-0">
                      <input 
                        type="checkbox" 
                        checked={isSelected}
                        onChange={() => toggleSelection(mission.id)}
                        className="w-5 h-5 rounded border-input text-primary focus:ring-primary"
                      />
                    </div>
                  )}

                  <button 
                    onClick={() => toggleStatus(mission.id, mission.status)}
                    className="flex-shrink-0 text-muted-foreground hover:text-primary transition-colors"
                  >
                    {mission.status === 'Done' ? (
                      <CheckCircle2 className="w-6 h-6 text-green-500" />
                    ) : mission.status === 'In Progress' ? (
                      <Clock className="w-6 h-6 text-yellow-500" />
                    ) : (
                      <Circle className="w-6 h-6" />
                    )}
                  </button>
                  <div className="flex-1 min-w-0">
                    <Link href={`/missions/${mission.id}`} className={`text-sm font-medium hover:text-primary transition-colors ${mission.status === 'Done' ? 'line-through text-muted-foreground' : ''}`}>
                      {mission.title}
                    </Link>
                    {mission.description && (
                      <p className="text-xs text-muted-foreground mt-1 line-clamp-1">{mission.description.replace(/[*#]/g, '')}</p>
                    )}
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <span className="text-xs font-medium px-2.5 py-1 rounded-full bg-accent text-accent-foreground mr-1">
                      {mission.status}
                    </span>
                    <button 
                      onClick={() => openEditModal(mission)}
                      className="text-muted-foreground hover:text-foreground p-2 rounded-md hover:bg-accent transition-colors opacity-0 group-hover:opacity-100"
                      title="Edit Mission"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button 
                      onClick={() => setItemToDelete(mission.id)}
                      className="text-muted-foreground hover:text-destructive p-2 rounded-md hover:bg-destructive/10 transition-colors opacity-0 group-hover:opacity-100"
                      title="Delete Mission"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
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
            <h2 className="text-xl font-bold">Edit Mission</h2>
            <form onSubmit={handleSaveMission} className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Mission Title</label>
                <input required type="text" value={editTitle} onChange={e => setEditTitle(e.target.value)} className="w-full px-3 py-2 border rounded-md bg-background focus:ring-2 focus:ring-primary outline-none" />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Description</label>
                <MarkdownEditor value={editDescription} onChange={setEditDescription} minHeight="100px" placeholder="Details..." />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Status</label>
                <select value={editStatus} onChange={e => setEditStatus(e.target.value as MissionStatus)} className="w-full px-3 py-2 border rounded-md bg-background focus:ring-2 focus:ring-primary outline-none">
                  <option value="To Do">To Do</option>
                  <option value="In Progress">In Progress</option>
                  <option value="Blocked">Blocked</option>
                  <option value="Done">Done</option>
                </select>
              </div>
              
              <div className="flex justify-end gap-3 pt-4 border-t border-border">
                <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 border rounded-md text-sm hover:bg-accent">Cancel</button>
                <button type="submit" className="px-4 py-2 bg-primary text-primary-foreground rounded-md text-sm font-medium hover:bg-primary/90">
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {itemToDelete && (
        <ConfirmDialog
          title="Delete Mission"
          message="Are you sure you want to delete this mission?"
          onConfirm={handleDeleteItem}
          onCancel={() => setItemToDelete(null)}
          confirmText="Delete"
        />
      )}

      {bulkDeleteConfirm && (
        <ConfirmDialog
          title={`Delete ${selectedIds.size} Missions`}
          message={`Are you sure you want to delete these ${selectedIds.size} missions?`}
          onConfirm={handleBulkDelete}
          onCancel={() => setBulkDeleteConfirm(false)}
          confirmText="Delete All"
        />
      )}
    </div>
  );
}
