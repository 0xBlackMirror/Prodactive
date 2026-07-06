"use client";

import { useStore } from "@/lib/store";
import { useState, useRef } from "react";
import JSZip from "jszip";
import { ConfirmDialog } from "@/components/ConfirmDialog";
import { exportToCSV } from "@/lib/helpers";
import { Trash2, Plus, Users, Settings as SettingsIcon, Database, Paintbrush } from "lucide-react";

export default function SettingsPage() {
  const { 
    settings, 
    updateSettings, 
    importState, 
    addStakeholder,
    deleteStakeholder,
    addCustomFieldDef,
    deleteCustomFieldDef,
    ...fullState 
  } = useStore();
  
  const [exportName, setExportName] = useState("pm_workspace_data");
  const fileInputRef = useRef<HTMLInputElement>(null);
  const logoInputRef = useRef<HTMLInputElement>(null);
  
  const [showImportConfirm, setShowImportConfirm] = useState(false);
  const [pendingImportFile, setPendingImportFile] = useState<File | null>(null);

  // New Stakeholder State
  const [newStakeholderName, setNewStakeholderName] = useState("");
  const [newStakeholderRole, setNewStakeholderRole] = useState("");
  const [newStakeholderCompany, setNewStakeholderCompany] = useState("");

  // New Custom Field State
  const [newFieldName, setNewFieldName] = useState("");
  const [newFieldType, setNewFieldType] = useState<'text' | 'number' | 'date' | 'dropdown'>("text");
  const [newFieldEntity, setNewFieldEntity] = useState<'Feature' | 'Mission' | 'Request' | 'Release'>("Feature");

  // New Workspace State
  const [newWorkspaceName, setNewWorkspaceName] = useState("");

  const handleExportZip = async () => {
    const zip = new JSZip();
    zip.file("missions.json", JSON.stringify(fullState.missions, null, 2));
    zip.file("requests.json", JSON.stringify(fullState.customerRequests, null, 2));
    zip.file("features.json", JSON.stringify(fullState.features, null, 2));
    zip.file("releases.json", JSON.stringify(fullState.releases, null, 2));
    zip.file("stakeholders.json", JSON.stringify(fullState.stakeholders, null, 2));
    zip.file("customFields.json", JSON.stringify(fullState.customFieldDefs, null, 2));
    zip.file("settings.json", JSON.stringify(settings, null, 2));

    const content = await zip.generateAsync({ type: "blob" });
    const url = URL.createObjectURL(content);
    
    const downloadAnchorNode = document.createElement('a');
    downloadAnchorNode.setAttribute("href", url);
    downloadAnchorNode.setAttribute("download", `${exportName}.zip`);
    document.body.appendChild(downloadAnchorNode);
    downloadAnchorNode.click();
    downloadAnchorNode.remove();
    URL.revokeObjectURL(url);
  };

  const handleExportCSV = (entityType: 'features' | 'missions' | 'customerRequests' | 'releases') => {
    const data = fullState[entityType];
    if (data && (data as any[]).length > 0) {
      exportToCSV(data as any[], `${entityType}_export`);
    } else {
      alert(`No data found for ${entityType}`);
    }
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setPendingImportFile(file);
      setShowImportConfirm(true);
    }
    // Reset input so the same file can be selected again if needed
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const executeImport = async () => {
    if (!pendingImportFile) return;
    
    try {
      const zip = await JSZip.loadAsync(pendingImportFile);
      
      const missionsStr = await zip.file("missions.json")?.async("string");
      const requestsStr = await zip.file("requests.json")?.async("string");
      const featuresStr = await zip.file("features.json")?.async("string");
      const releasesStr = await zip.file("releases.json")?.async("string");
      const stakeholdersStr = await zip.file("stakeholders.json")?.async("string");
      const customFieldsStr = await zip.file("customFields.json")?.async("string");
      const settingsStr = await zip.file("settings.json")?.async("string");
      
      const newState: any = {};
      if (missionsStr) newState.missions = JSON.parse(missionsStr);
      if (requestsStr) newState.customerRequests = JSON.parse(requestsStr);
      if (featuresStr) newState.features = JSON.parse(featuresStr);
      if (releasesStr) newState.releases = JSON.parse(releasesStr);
      if (stakeholdersStr) newState.stakeholders = JSON.parse(stakeholdersStr);
      if (customFieldsStr) newState.customFieldDefs = JSON.parse(customFieldsStr);
      if (settingsStr) newState.settings = JSON.parse(settingsStr);
      
      if (Object.keys(newState).length > 0) {
        importState(newState);
        alert("Workspace imported successfully from ZIP!");
      } else {
        alert("No valid workspace files found in the ZIP.");
      }
    } catch (err) {
      console.error(err);
      alert("Failed to parse ZIP file.");
    } finally {
      setShowImportConfirm(false);
      setPendingImportFile(null);
    }
  };

  const handleLogoUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      const base64 = e.target?.result as string;
      updateSettings({ productLogoBase64: base64 });
    };
    reader.readAsDataURL(file);
  };

  const createWorkspace = () => {
    if (!newWorkspaceName.trim()) return;
    const newWs = { id: Date.now().toString(), name: newWorkspaceName };
    updateSettings({ 
      workspaces: [...(settings.workspaces || []), newWs],
      activeWorkspaceId: newWs.id
    });
    setNewWorkspaceName("");
  };

  const switchWorkspace = (id: string) => {
    updateSettings({ activeWorkspaceId: id });
    // Note: In a real app with backend, this would fetch new data.
    // For local-only, we might just use the activeWorkspaceId to partition data or clear it.
    // Assuming for now the ID is just tracked in settings.
  };

  return (
    <div className="max-w-5xl mx-auto space-y-8 pb-12">
      <h1 className="text-3xl font-bold tracking-tight">Workspace Settings</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        
        {/* Workspaces */}
        <section className="space-y-4 rounded-xl border border-border bg-card p-6 shadow-sm md:col-span-2">
          <div className="flex items-center gap-2 mb-4">
            <SettingsIcon className="w-5 h-5 text-primary" />
            <h2 className="text-xl font-semibold">Workspaces</h2>
          </div>
          <div className="flex flex-col md:flex-row gap-6">
            <div className="flex-1 space-y-4">
              <h3 className="text-sm font-medium">Switch Workspace</h3>
              <div className="flex flex-wrap gap-2">
                {(settings.workspaces || []).map(ws => (
                  <button
                    key={ws.id}
                    onClick={() => switchWorkspace(ws.id)}
                    className={`px-4 py-2 rounded-md text-sm transition-colors border ${
                      settings.activeWorkspaceId === ws.id
                        ? "bg-primary text-primary-foreground border-primary"
                        : "bg-background hover:bg-accent border-border"
                    }`}
                  >
                    {ws.name}
                  </button>
                ))}
              </div>
            </div>
            <div className="flex-1 space-y-4">
              <h3 className="text-sm font-medium">Create New Workspace</h3>
              <div className="flex items-center gap-2">
                <input 
                  type="text" 
                  value={newWorkspaceName} 
                  onChange={(e) => setNewWorkspaceName(e.target.value)}
                  className="px-3 py-2 border border-input rounded-md text-sm bg-background flex-1"
                  placeholder="Workspace name"
                />
                <button 
                  onClick={createWorkspace}
                  className="px-4 py-2 bg-secondary text-secondary-foreground rounded-md text-sm font-medium hover:bg-secondary/80 flex items-center gap-2"
                >
                  <Plus className="w-4 h-4" />
                  Create
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* Appearance */}
        <section className="space-y-4 rounded-xl border border-border bg-card p-6 shadow-sm">
          <div className="flex items-center gap-2 mb-4">
            <Paintbrush className="w-5 h-5 text-primary" />
            <h2 className="text-xl font-semibold">Appearance</h2>
          </div>
          <div className="space-y-4">
            <div>
              <h3 className="text-sm font-medium mb-3">Color Scheme</h3>
              <div className="flex items-center gap-4">
                {[
                  { id: 'zinc', name: 'Zinc', colorClass: 'bg-zinc-900 dark:bg-zinc-100' },
                  { id: 'blue', name: 'Blue', colorClass: 'bg-blue-600' },
                  { id: 'emerald', name: 'Emerald', colorClass: 'bg-emerald-500' },
                  { id: 'rose', name: 'Rose', colorClass: 'bg-rose-600' },
                ].map((theme) => (
                  <button
                    key={theme.id}
                    onClick={() => updateSettings({ themeColor: theme.id })}
                    className={`flex flex-col items-center gap-2 p-2 rounded-lg border-2 transition-all ${
                      (settings.themeColor || 'zinc') === theme.id ? 'border-primary bg-accent' : 'border-transparent hover:bg-accent/50'
                    }`}
                  >
                    <div className={`w-8 h-8 rounded-full ${theme.colorClass} shadow-sm`} />
                    <span className="text-xs font-medium">{theme.name}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>
          
          <div className="border-t border-border pt-4 mt-4">
            <h3 className="text-sm font-medium mb-3">Branding</h3>
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-md border border-border border-dashed flex items-center justify-center overflow-hidden bg-muted flex-shrink-0">
                {settings.productLogoBase64 ? (
                  <img src={settings.productLogoBase64} alt="Logo" className="object-contain w-full h-full" />
                ) : (
                  <span className="text-xs text-muted-foreground">None</span>
                )}
              </div>
              <div className="space-y-2">
                <input 
                  type="file" 
                  accept="image/*" 
                  className="hidden" 
                  ref={logoInputRef}
                  onChange={handleLogoUpload}
                />
                <button 
                  onClick={() => logoInputRef.current?.click()}
                  className="px-3 py-1.5 bg-secondary text-secondary-foreground rounded-md text-xs font-medium hover:bg-secondary/80"
                >
                  Upload Logo
                </button>
                {settings.productLogoBase64 && (
                  <button 
                    onClick={() => updateSettings({ productLogoBase64: undefined })}
                    className="ml-2 px-3 py-1.5 bg-destructive text-destructive-foreground rounded-md text-xs font-medium hover:bg-destructive/90"
                  >
                    Remove
                  </button>
                )}
              </div>
            </div>
          </div>
        </section>

        {/* Data Management */}
        <section className="space-y-4 rounded-xl border border-border bg-card p-6 shadow-sm">
          <div className="flex items-center gap-2 mb-4">
            <Database className="w-5 h-5 text-primary" />
            <h2 className="text-xl font-semibold">Data Management</h2>
          </div>
          
          <div className="space-y-6">
            <div className="space-y-2">
              <h3 className="text-sm font-medium">Export Workspace (ZIP)</h3>
              <div className="flex items-center gap-2">
                <input 
                  type="text" 
                  value={exportName} 
                  onChange={(e) => setExportName(e.target.value)}
                  className="px-3 py-2 border border-input rounded-md text-sm bg-background flex-1"
                  placeholder="File name"
                />
                <button 
                  onClick={handleExportZip}
                  className="px-4 py-2 bg-primary text-primary-foreground rounded-md text-sm font-medium hover:bg-primary/90 whitespace-nowrap"
                >
                  Export ZIP
                </button>
              </div>
            </div>
            
            <div className="space-y-2 pt-2 border-t border-border">
              <h3 className="text-sm font-medium">Export to CSV</h3>
              <div className="flex flex-wrap gap-2">
                <button onClick={() => handleExportCSV('features')} className="px-3 py-1.5 border border-input rounded-md text-xs hover:bg-accent">Features</button>
                <button onClick={() => handleExportCSV('missions')} className="px-3 py-1.5 border border-input rounded-md text-xs hover:bg-accent">Missions</button>
                <button onClick={() => handleExportCSV('customerRequests')} className="px-3 py-1.5 border border-input rounded-md text-xs hover:bg-accent">Requests</button>
                <button onClick={() => handleExportCSV('releases')} className="px-3 py-1.5 border border-input rounded-md text-xs hover:bg-accent">Releases</button>
              </div>
            </div>

            <div className="border-t border-border pt-4 space-y-2">
              <h3 className="text-sm font-medium">Import Workspace</h3>
              <p className="text-xs text-muted-foreground mb-2">Warning: Overwrites current state.</p>
              <input 
                type="file" 
                accept=".zip" 
                className="hidden" 
                ref={fileInputRef}
                onChange={handleFileSelect}
              />
              <button 
                onClick={() => fileInputRef.current?.click()}
                className="w-full px-4 py-2 bg-destructive/10 text-destructive rounded-md text-sm font-medium hover:bg-destructive/20 border border-destructive/20"
              >
                Import ZIP Data
              </button>
            </div>
          </div>
        </section>

        {/* Stakeholders */}
        <section className="space-y-4 rounded-xl border border-border bg-card p-6 shadow-sm md:col-span-2">
          <div className="flex items-center gap-2 mb-4">
            <Users className="w-5 h-5 text-primary" />
            <h2 className="text-xl font-semibold">Stakeholders</h2>
          </div>
          
          <div className="bg-background rounded-md border border-border overflow-hidden">
            <table className="w-full text-sm text-left">
              <thead className="bg-muted/50 border-b border-border">
                <tr>
                  <th className="px-4 py-3 font-medium">Name</th>
                  <th className="px-4 py-3 font-medium">Role</th>
                  <th className="px-4 py-3 font-medium">Company</th>
                  <th className="px-4 py-3 font-medium text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {fullState.stakeholders.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="px-4 py-8 text-center text-muted-foreground">
                      No stakeholders defined yet.
                    </td>
                  </tr>
                ) : (
                  fullState.stakeholders.map(s => (
                    <tr key={s.id} className="border-b border-border last:border-0 hover:bg-muted/30">
                      <td className="px-4 py-3 font-medium">{s.name}</td>
                      <td className="px-4 py-3 text-muted-foreground">{s.role}</td>
                      <td className="px-4 py-3 text-muted-foreground">{s.company}</td>
                      <td className="px-4 py-3 text-right">
                        <button 
                          onClick={() => deleteStakeholder(s.id)}
                          className="p-1.5 text-destructive hover:bg-destructive/10 rounded-md transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
          
          <div className="flex items-center gap-2 pt-2">
            <input 
              type="text" 
              value={newStakeholderName} 
              onChange={e => setNewStakeholderName(e.target.value)} 
              placeholder="Name" 
              className="px-3 py-2 text-sm border border-input rounded-md flex-1"
            />
            <input 
              type="text" 
              value={newStakeholderRole} 
              onChange={e => setNewStakeholderRole(e.target.value)} 
              placeholder="Role" 
              className="px-3 py-2 text-sm border border-input rounded-md flex-1"
            />
            <input 
              type="text" 
              value={newStakeholderCompany} 
              onChange={e => setNewStakeholderCompany(e.target.value)} 
              placeholder="Company" 
              className="px-3 py-2 text-sm border border-input rounded-md flex-1"
            />
            <button 
              onClick={() => {
                if(newStakeholderName) {
                  addStakeholder({ id: Date.now().toString(), name: newStakeholderName, role: newStakeholderRole, company: newStakeholderCompany });
                  setNewStakeholderName(""); setNewStakeholderRole(""); setNewStakeholderCompany("");
                }
              }}
              className="p-2 bg-secondary text-secondary-foreground rounded-md hover:bg-secondary/80"
            >
              <Plus className="w-5 h-5" />
            </button>
          </div>
        </section>

        {/* Custom Fields */}
        <section className="space-y-4 rounded-xl border border-border bg-card p-6 shadow-sm md:col-span-2">
          <div className="flex items-center gap-2 mb-4">
            <SettingsIcon className="w-5 h-5 text-primary" />
            <h2 className="text-xl font-semibold">Custom Fields</h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {fullState.customFieldDefs.map(field => (
              <div key={field.id} className="border border-border rounded-lg p-4 bg-background relative group">
                <div className="flex items-start justify-between mb-2">
                  <h3 className="font-medium text-sm">{field.name}</h3>
                  <button 
                    onClick={() => deleteCustomFieldDef(field.id)}
                    className="opacity-0 group-hover:opacity-100 p-1 text-destructive hover:bg-destructive/10 rounded transition-all"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <span className="bg-muted px-2 py-1 rounded capitalize">{field.entityType}</span>
                  <span className="capitalize">{field.type}</span>
                </div>
              </div>
            ))}
          </div>

          <div className="bg-muted/30 border border-border rounded-lg p-4 mt-4 space-y-4">
            <h3 className="text-sm font-medium">Add New Custom Field</h3>
            <div className="flex flex-col md:flex-row gap-3">
              <input 
                type="text" 
                value={newFieldName} 
                onChange={e => setNewFieldName(e.target.value)} 
                placeholder="Field Name" 
                className="px-3 py-2 text-sm border border-input rounded-md flex-1"
              />
              <select 
                value={newFieldEntity} 
                onChange={e => setNewFieldEntity(e.target.value as any)}
                className="px-3 py-2 text-sm border border-input rounded-md bg-background"
              >
                <option value="Feature">Feature</option>
                <option value="Mission">Mission</option>
                <option value="Request">Request</option>
                <option value="Release">Release</option>
              </select>
              <select 
                value={newFieldType} 
                onChange={e => setNewFieldType(e.target.value as any)}
                className="px-3 py-2 text-sm border border-input rounded-md bg-background"
              >
                <option value="text">Text</option>
                <option value="number">Number</option>
                <option value="date">Date</option>
                <option value="dropdown">Dropdown (CSV options coming soon)</option>
              </select>
              <button 
                onClick={() => {
                  if(newFieldName) {
                    addCustomFieldDef({ id: Date.now().toString(), name: newFieldName, entityType: newFieldEntity, type: newFieldType });
                    setNewFieldName("");
                  }
                }}
                className="px-4 py-2 bg-primary text-primary-foreground rounded-md text-sm font-medium hover:bg-primary/90 flex items-center justify-center gap-2"
              >
                <Plus className="w-4 h-4" /> Add Field
              </button>
            </div>
          </div>
        </section>

      </div>

      {showImportConfirm && (
        <ConfirmDialog
          title="Overwrite Workspace?"
          message={`Are you sure you want to import data from "${pendingImportFile?.name}"? This will overwrite your current workspace data and cannot be undone.`}
          confirmText="Yes, Import Data"
          onConfirm={executeImport}
          onCancel={() => {
            setShowImportConfirm(false);
            setPendingImportFile(null);
          }}
        />
      )}
    </div>
  );
}
