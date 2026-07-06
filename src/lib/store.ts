import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { get, set, del } from 'idb-keyval';
import { withUndo, WithUndo } from './undoMiddleware';

// Data Types
export type MissionStatus = 'To Do' | 'In Progress' | 'Blocked' | 'Done';
export type RequestStatus = 'New' | 'Under Review' | 'Planned' | 'Rejected' | 'Completed';
export type FeaturePriority = 'Low' | 'Medium' | 'High' | 'Critical';
export type FeatureStatus = 'Draft' | 'In Development' | 'QA' | 'Done';
export type RoadmapPhase = 'Now' | 'Next' | 'Later';
export type ReleaseStatus = 'Planning' | 'In Progress' | 'Released';

export interface KeyResult {
  id: string;
  title: string;
  target: number;
  current: number;
}

export interface Mission {
  id: string;
  title: string;
  description: string;
  status: MissionStatus;
  dueDate?: string;
  linkedFeatureIds: string[];
  keyResults: KeyResult[];
  createdAt: string;
}

export interface CustomerRequest {
  id: string;
  title: string;
  description: string;
  source: string;
  status: RequestStatus;
  tags: string[];
  linkedFeatureId?: string;
  createdAt: string;
}

export interface Feature {
  id: string;
  title: string;
  description: string;
  priority: FeaturePriority;
  status: FeatureStatus;
  assigneeId?: string;
  impactScore: number;
  effortScore: number;
  reach: number;
  confidence: number;
  tags: string[];
  dependsOn: string[];
  roadmapPhase?: RoadmapPhase;
  releaseId?: string;
  startDate?: string;
  targetDate?: string;
  createdAt: string;
}

export interface Release {
  id: string;
  version: string;
  status: ReleaseStatus;
  description: string;
  releaseNotes?: string;
  targetDate: string;
  startDate?: string;
}

export interface Comment {
  id: string;
  entityType: 'Feature' | 'Mission' | 'Request' | 'Release';
  entityId: string;
  text: string;
  createdAt: string;
}

export interface SavedView {
  id: string;
  name: string;
  entityType: string;
  filters: any;
  sort: any;
}

export interface CustomFieldDef {
  id: string;
  name: string;
  type: 'text' | 'number' | 'date' | 'dropdown';
  entityType: 'Feature' | 'Mission' | 'Request' | 'Release';
  options?: string[];
}

export interface CustomFieldValue {
  entityId: string;
  fieldId: string;
  value: string;
}

export interface Stakeholder {
  id: string;
  name: string;
  company: string;
  role: string;
  email?: string;
}

export interface Workspace {
  id: string;
  name: string;
}

export interface PlaybookNote {
  id: string;
  title: string;
  content: string;
  createdAt: number;
  updatedAt: number;
}

export interface Settings {
  productLogoBase64?: string;
  dashboardConfig?: {
    activeWidgets: string[];
  };
  themeColor?: string;
  savedViews: SavedView[];
  workspaces: Workspace[];
  activeWorkspaceId: string;
}

export interface AppState {
  missions: Mission[];
  customerRequests: CustomerRequest[];
  features: Feature[];
  releases: Release[];
  comments: Comment[];
  stakeholders: Stakeholder[];
  customFieldDefs: CustomFieldDef[];
  customFieldValues: CustomFieldValue[];
  playbookNotes: PlaybookNote[];
  settings: Settings;
  
  // Actions
  addMission: (mission: Mission) => void;
  updateMission: (id: string, updates: Partial<Mission>) => void;
  deleteMission: (id: string) => void;
  
  addCustomerRequest: (req: CustomerRequest) => void;
  updateCustomerRequest: (id: string, updates: Partial<CustomerRequest>) => void;
  deleteCustomerRequest: (id: string) => void;
  
  addFeature: (feature: Feature) => void;
  updateFeature: (id: string, updates: Partial<Feature>) => void;
  deleteFeature: (id: string) => void;
  
  addRelease: (release: Release) => void;
  updateRelease: (id: string, updates: Partial<Release>) => void;
  deleteRelease: (id: string) => void;
  
  addComment: (comment: Comment) => void;
  deleteComment: (id: string) => void;
  
  addStakeholder: (stakeholder: Stakeholder) => void;
  updateStakeholder: (id: string, updates: Partial<Stakeholder>) => void;
  deleteStakeholder: (id: string) => void;
  
  addCustomFieldDef: (def: CustomFieldDef) => void;
  deleteCustomFieldDef: (id: string) => void;
  setCustomFieldValue: (entityId: string, fieldId: string, value: string) => void;
  
  addPlaybookNote: (note: PlaybookNote) => void;
  updatePlaybookNote: (id: string, updates: Partial<PlaybookNote>) => void;
  deletePlaybookNote: (id: string) => void;
  
  updateSettings: (updates: Partial<Settings>) => void;
  importState: (newState: Partial<AppState>) => void;
  clearData: () => void;
}

const idbStorage = {
  getItem: async (name: string): Promise<string | null> => {
    return (await get(name)) || null;
  },
  setItem: async (name: string, value: string): Promise<void> => {
    await set(name, value);
  },
  removeItem: async (name: string): Promise<void> => {
    await del(name);
  },
};

const defaultSettings: Settings = {
  themeColor: 'zinc',
  dashboardConfig: {
    activeWidgets: ['missions', 'requests', 'features']
  },
  savedViews: [],
  workspaces: [{ id: 'default', name: 'Default Workspace' }],
  activeWorkspaceId: 'default'
};

export const useStore = create<AppState & WithUndo>()(
  persist(
    withUndo<AppState>(
      (set) => ({
        missions: [],
        customerRequests: [],
        features: [],
        releases: [],
        comments: [],
        stakeholders: [],
        customFieldDefs: [],
        customFieldValues: [],
        playbookNotes: [],
        settings: defaultSettings,
        
        addMission: (mission) => set((state) => ({ missions: [...state.missions, mission] })),
        updateMission: (id, updates) => set((state) => ({
          missions: state.missions.map(m => m.id === id ? { ...m, ...updates } : m)
        })),
        deleteMission: (id) => set((state) => ({
          missions: state.missions.filter(m => m.id !== id),
          comments: state.comments.filter(c => !(c.entityType === 'Mission' && c.entityId === id))
        })),
        
        addCustomerRequest: (req) => set((state) => ({ customerRequests: [...state.customerRequests, req] })),
        updateCustomerRequest: (id, updates) => set((state) => ({
          customerRequests: state.customerRequests.map(c => c.id === id ? { ...c, ...updates } : c)
        })),
        deleteCustomerRequest: (id) => set((state) => ({
          customerRequests: state.customerRequests.filter(c => c.id !== id),
          comments: state.comments.filter(c => !(c.entityType === 'Request' && c.entityId === id))
        })),
        
        addFeature: (feature) => set((state) => ({ features: [...state.features, feature] })),
        updateFeature: (id, updates) => set((state) => ({
          features: state.features.map(f => f.id === id ? { ...f, ...updates } : f)
        })),
        deleteFeature: (id) => set((state) => ({
          features: state.features.filter(f => f.id !== id),
          customerRequests: state.customerRequests.map(r => r.linkedFeatureId === id ? { ...r, linkedFeatureId: undefined } : r),
          comments: state.comments.filter(c => !(c.entityType === 'Feature' && c.entityId === id))
        })),
        
        addRelease: (release) => set((state) => ({ releases: [...state.releases, release] })),
        updateRelease: (id, updates) => set((state) => ({
          releases: state.releases.map(r => r.id === id ? { ...r, ...updates } : r)
        })),
        deleteRelease: (id) => set((state) => ({
          releases: state.releases.filter(r => r.id !== id),
          features: state.features.map(f => f.releaseId === id ? { ...f, releaseId: undefined } : f),
          comments: state.comments.filter(c => !(c.entityType === 'Release' && c.entityId === id))
        })),

        addComment: (comment) => set((state) => ({ comments: [...state.comments, comment] })),
        deleteComment: (id) => set((state) => ({ comments: state.comments.filter(c => c.id !== id) })),

        addStakeholder: (stakeholder) => set((state) => ({ stakeholders: [...state.stakeholders, stakeholder] })),
        updateStakeholder: (id, updates) => set((state) => ({
          stakeholders: state.stakeholders.map(s => s.id === id ? { ...s, ...updates } : s)
        })),
        deleteStakeholder: (id) => set((state) => ({ stakeholders: state.stakeholders.filter(s => s.id !== id) })),

        addCustomFieldDef: (def) => set((state) => ({ customFieldDefs: [...state.customFieldDefs, def] })),
        deleteCustomFieldDef: (id) => set((state) => ({ 
          customFieldDefs: state.customFieldDefs.filter(d => d.id !== id),
          customFieldValues: state.customFieldValues.filter(v => v.fieldId !== id)
        })),
        setCustomFieldValue: (entityId, fieldId, value) => set((state) => {
          const existing = state.customFieldValues.findIndex(v => v.entityId === entityId && v.fieldId === fieldId);
          if (existing >= 0) {
            const nextValues = [...state.customFieldValues];
            if (value === '') {
              nextValues.splice(existing, 1);
            } else {
              nextValues[existing] = { ...nextValues[existing], value };
            }
            return { customFieldValues: nextValues };
          }
          if (value === '') return state;
          return { customFieldValues: [...state.customFieldValues, { entityId, fieldId, value }] };
        }),
        
        addPlaybookNote: (note) => set((state) => ({ playbookNotes: [...state.playbookNotes, note] })),
        updatePlaybookNote: (id, updates) => set((state) => ({
          playbookNotes: state.playbookNotes.map(n => n.id === id ? { ...n, ...updates, updatedAt: Date.now() } : n)
        })),
        deletePlaybookNote: (id) => set((state) => ({ playbookNotes: state.playbookNotes.filter(n => n.id !== id) })),
        
        updateSettings: (updates) => set((state) => ({
          settings: { ...state.settings, ...updates }
        })),
        
        importState: (newState) => set((state) => ({
          ...state,
          ...newState,
          settings: { ...state.settings, ...(newState.settings || {}) }
        })),

        clearData: () => set((state) => ({
          missions: [],
          customerRequests: [],
          features: [],
          releases: [],
          comments: [],
          stakeholders: [],
          customFieldDefs: [],
          customFieldValues: [],
          playbookNotes: [],
          // preserve settings
        }))
      })
    ) as any,
    {
      name: 'pm-multi-tool-storage',
      storage: createJSONStorage(() => idbStorage),
      merge: (persistedState: any, currentState: AppState) => {
        const mergedFeatures = (persistedState.features || []).map((f: any) => ({
          ...f,
          status: f.status || 'Draft',
          // assigneeId defaults to undefined
        }));

        return {
          ...currentState,
          ...persistedState,
          missions: persistedState.missions || [],
          customerRequests: persistedState.customerRequests || [],
          features: mergedFeatures,
          releases: persistedState.releases || [],
          comments: persistedState.comments || [],
          stakeholders: persistedState.stakeholders || [],
          customFieldDefs: persistedState.customFieldDefs || [],
          customFieldValues: persistedState.customFieldValues || [],
          playbookNotes: persistedState.playbookNotes || [],
          settings: {
            ...currentState.settings,
            ...(persistedState.settings || {}),
            workspaces: persistedState.settings?.workspaces || currentState.settings.workspaces,
            savedViews: persistedState.settings?.savedViews || currentState.settings.savedViews,
            dashboardConfig: persistedState.settings?.dashboardConfig || currentState.settings.dashboardConfig,
            activeWorkspaceId: persistedState.settings?.activeWorkspaceId || currentState.settings.activeWorkspaceId,
          }
        };
      },
    }
  ) as any
);
