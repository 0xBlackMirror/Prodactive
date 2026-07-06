"use client";

import { useStore, CustomerRequest, RequestStatus } from "@/lib/store";
import { useState, useMemo } from "react";
import { MessageSquarePlus, Trash2, Edit2 } from "lucide-react";
import { SearchFilterBar } from "@/components/SearchFilterBar";
import { ConfirmDialog } from "@/components/ConfirmDialog";
import { TagInput } from "@/components/TagInput";
import { MarkdownEditor } from "@/components/MarkdownRenderer";
import Link from "next/link";

export default function RequestsPage() {
  const { customerRequests, addCustomerRequest, updateCustomerRequest, deleteCustomerRequest, features } = useStore();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingRequestId, setEditingRequestId] = useState<string | null>(null);
  
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [status, setStatus] = useState<RequestStatus>("New");
  const [tags, setTags] = useState<string[]>([]);
  const [source, setSource] = useState("");

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

  const openAddModal = () => {
    setEditingRequestId(null);
    setTitle("");
    setDescription("");
    setStatus("New");
    setTags([]);
    setSource("");
    setIsModalOpen(true);
  };

  const openEditModal = (r: CustomerRequest) => {
    setEditingRequestId(r.id);
    setTitle(r.title);
    setDescription(r.description);
    setStatus(r.status);
    setTags(r.tags || []);
    setSource(r.source || "");
    setIsModalOpen(true);
  };

  const handleSaveRequest = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;
    
    if (editingRequestId) {
      updateCustomerRequest(editingRequestId, {
        title: title.trim(),
        description: description.trim(),
        status,
        tags,
        source
      });
    } else {
      addCustomerRequest({
        id: crypto.randomUUID(),
        title: title.trim(),
        description: description.trim(),
        status,
        tags,
        source,
        createdAt: new Date().toISOString()
      });
    }
    
    setIsModalOpen(false);
  };

  const handleDeleteItem = () => {
    if (itemToDelete) {
      deleteCustomerRequest(itemToDelete);
      setItemToDelete(null);
    }
  };

  const handleBulkDelete = () => {
    selectedIds.forEach(id => deleteCustomerRequest(id));
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

  const filteredRequests = useMemo(() => {
    return customerRequests.filter(r => {
      if (searchQuery && !r.title.toLowerCase().includes(searchQuery.toLowerCase()) && !(r.description || "").toLowerCase().includes(searchQuery.toLowerCase())) {
        return false;
      }
      if (selectedStatuses.length > 0 && !selectedStatuses.includes(r.status)) {
        return false;
      }
      return true;
    }).sort((a, b) => {
      let valA: any = a[sortValue as keyof CustomerRequest];
      let valB: any = b[sortValue as keyof CustomerRequest];

      if (sortValue === 'title') {
        valA = a.title.toLowerCase();
        valB = b.title.toLowerCase();
      }

      if (valA < valB) return sortDirection === 'asc' ? -1 : 1;
      if (valA > valB) return sortDirection === 'asc' ? 1 : -1;
      return 0;
    });
  }, [customerRequests, searchQuery, selectedStatuses, sortValue, sortDirection]);

  const statusColors: Record<RequestStatus, string> = {
    "New": "bg-blue-500/10 text-blue-500 border-blue-500/20",
    "Under Review": "bg-yellow-500/10 text-yellow-500 border-yellow-500/20",
    "Planned": "bg-purple-500/10 text-purple-500 border-purple-500/20",
    "Rejected": "bg-destructive/10 text-destructive border-destructive/20",
    "Completed": "bg-green-500/10 text-green-500 border-green-500/20"
  };

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Customer Requests</h1>
          <p className="text-muted-foreground mt-1">Track feedback, feature requests, and bug reports.</p>
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
            className="px-4 py-2 bg-primary text-primary-foreground rounded-md text-sm font-medium hover:bg-primary/90 flex items-center gap-2"
          >
            <MessageSquarePlus className="w-4 h-4" />
            Log Request
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
              { label: 'New', value: 'New' },
              { label: 'Under Review', value: 'Under Review' },
              { label: 'Planned', value: 'Planned' },
              { label: 'Completed', value: 'Completed' },
              { label: 'Rejected', value: 'Rejected' }
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

      <div className="grid gap-4">
        {filteredRequests.length === 0 ? (
          <div className="text-center py-16 border border-border border-dashed rounded-xl bg-card">
            <MessageSquarePlus className="w-12 h-12 text-muted-foreground mx-auto mb-4 opacity-50" />
            <h3 className="text-lg font-medium">No requests found</h3>
            <p className="text-muted-foreground max-w-sm mx-auto mt-2">Adjust your filters or log your first piece of customer feedback.</p>
          </div>
        ) : (
          filteredRequests.map(req => {
            const isSelected = selectedIds.has(req.id);
            return (
              <div key={req.id} className={`group p-5 rounded-xl border bg-card shadow-sm flex flex-col sm:flex-row gap-4 relative transition-colors ${isSelected ? 'border-primary bg-primary/5' : 'border-border'}`}>
                
                {isBulkMode && (
                  <div className="flex items-center justify-center pt-1 sm:pt-0">
                    <input 
                      type="checkbox" 
                      checked={isSelected}
                      onChange={() => toggleSelection(req.id)}
                      className="w-5 h-5 rounded border-input text-primary focus:ring-primary"
                    />
                  </div>
                )}
                
                <div className="flex-1 space-y-2 pr-20">
                  <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 justify-between">
                    <Link href={`/requests/${req.id}`} className="text-lg font-semibold hover:text-primary transition-colors">
                      {req.title}
                    </Link>
                    <select 
                      value={req.status}
                      onChange={(e) => updateCustomerRequest(req.id, { status: e.target.value as RequestStatus })}
                      className={`text-xs font-medium px-3 py-1 rounded-full border bg-transparent outline-none ${statusColors[req.status]}`}
                    >
                      {Object.keys(statusColors).map(s => (
                        <option key={s} value={s} className="bg-background text-foreground">{s}</option>
                      ))}
                    </select>
                  </div>
                  
                  <p className="text-sm text-muted-foreground line-clamp-2">{req.description.replace(/[*#]/g, '')}</p>
                  
                  {req.tags && req.tags.length > 0 && (
                    <div className="flex gap-1 flex-wrap pt-1">
                      {req.tags.map(t => (
                        <span key={t} className="text-[10px] px-1.5 py-0.5 rounded bg-accent text-accent-foreground border border-border">{t}</span>
                      ))}
                    </div>
                  )}

                  <div className="pt-2 text-xs text-muted-foreground flex flex-wrap items-center gap-4">
                    <span>Logged: {new Date(req.createdAt).toLocaleDateString()}</span>
                    {req.source && <span>Source: {req.source}</span>}
                    
                    {/* Link to Feature dropdown */}
                    <div className="flex items-center gap-2">
                      <span>Feature:</span>
                      <select 
                        value={req.linkedFeatureId || ""}
                        onChange={(e) => updateCustomerRequest(req.id, { linkedFeatureId: e.target.value || undefined })}
                        className="bg-accent border border-border rounded px-2 py-1 outline-none"
                      >
                        <option value="">None</option>
                        {features.map(f => (
                          <option key={f.id} value={f.id}>{f.title}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>

                <div className="absolute top-4 right-4 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button 
                    onClick={() => openEditModal(req)}
                    className="p-1.5 text-muted-foreground hover:text-foreground rounded hover:bg-accent"
                    title="Edit Request"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button 
                    onClick={() => setItemToDelete(req.id)}
                    className="p-1.5 text-muted-foreground hover:text-destructive rounded hover:bg-destructive/10"
                    title="Delete Request"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-card border border-border rounded-xl shadow-lg max-w-xl w-full p-6 space-y-6 max-h-[90vh] overflow-y-auto">
            <h2 className="text-xl font-bold">{editingRequestId ? "Edit Request" : "Log New Request"}</h2>
            <form onSubmit={handleSaveRequest} className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Title or Subject</label>
                <input 
                  required
                  type="text" 
                  value={title}
                  onChange={e => setTitle(e.target.value)}
                  className="w-full px-3 py-2 border border-input rounded-md bg-background focus:ring-2 focus:ring-primary outline-none" 
                  placeholder="e.g. Export to CSV is broken"
                />
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-medium">Feedback Details</label>
                <MarkdownEditor 
                  value={description} 
                  onChange={setDescription} 
                  placeholder="Customer mentioned that..." 
                  minHeight="120px"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Source</label>
                  <input 
                    type="text" 
                    value={source}
                    onChange={e => setSource(e.target.value)}
                    className="w-full px-3 py-2 border border-input rounded-md bg-background focus:ring-2 focus:ring-primary outline-none" 
                    placeholder="e.g. Intercom, Email"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Status</label>
                  <select 
                    value={status}
                    onChange={e => setStatus(e.target.value as RequestStatus)}
                    className="w-full px-3 py-2 border border-input rounded-md bg-background focus:ring-2 focus:ring-primary outline-none"
                  >
                    {Object.keys(statusColors).map(s => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Tags</label>
                <TagInput tags={tags} onChange={setTags} placeholder="Add tags..." />
              </div>

              <div className="flex justify-end gap-3 pt-6 border-t border-border">
                <button 
                  type="button" 
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 border border-input rounded-md text-sm hover:bg-accent"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  className="px-4 py-2 bg-primary text-primary-foreground rounded-md text-sm font-medium hover:bg-primary/90"
                >
                  {editingRequestId ? "Save Changes" : "Save Request"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {itemToDelete && (
        <ConfirmDialog
          title="Delete Request"
          message="Are you sure you want to delete this customer request?"
          onConfirm={handleDeleteItem}
          onCancel={() => setItemToDelete(null)}
          confirmText="Delete"
        />
      )}

      {bulkDeleteConfirm && (
        <ConfirmDialog
          title={`Delete ${selectedIds.size} Requests`}
          message={`Are you sure you want to delete these ${selectedIds.size} requests?`}
          onConfirm={handleBulkDelete}
          onCancel={() => setBulkDeleteConfirm(false)}
          confirmText="Delete All"
        />
      )}
    </div>
  );
}
