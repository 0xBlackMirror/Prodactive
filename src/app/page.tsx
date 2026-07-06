"use client";

import { useStore } from "@/lib/store";
import { useState } from "react";
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors, DragEndEvent } from '@dnd-kit/core';
import { arrayMove, SortableContext, sortableKeyboardCoordinates, rectSortingStrategy, useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Settings, LayoutGrid, AlertCircle, Clock } from "lucide-react";
import { ProgressRing } from "@/components/ProgressRing";

// Sortable Widget Wrapper
function SortableWidget({ id, children, isCustomizing }: { id: string, children: React.ReactNode, isCustomizing: boolean }) {
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div ref={setNodeRef} style={style} className="h-full">
      <div className={`h-full relative ${isCustomizing ? 'ring-2 ring-primary border-primary bg-primary/5 cursor-grab rounded-xl' : ''}`}>
        {isCustomizing && (
          <div {...attributes} {...listeners} className="absolute inset-0 z-10" />
        )}
        <div className={isCustomizing ? 'opacity-80 pointer-events-none h-full' : 'h-full'}>
          {children}
        </div>
      </div>
    </div>
  );
}

export default function Home() {
  const { missions, customerRequests, features, releases, settings, updateSettings } = useStore();
  const [isCustomizing, setIsCustomizing] = useState(false);
  
  const activeWidgets = settings.dashboardConfig?.activeWidgets || ['missions', 'requests', 'features'];
  const allWidgets = ['missions', 'requests', 'features'];

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      const oldIndex = activeWidgets.indexOf(active.id as string);
      const newIndex = activeWidgets.indexOf(over.id as string);
      const newWidgets = arrayMove(activeWidgets, oldIndex, newIndex);
      updateSettings({ dashboardConfig: { activeWidgets: newWidgets } });
    }
  };

  const toggleWidget = (widgetId: string) => {
    let newWidgets = [...activeWidgets];
    if (newWidgets.includes(widgetId)) {
      newWidgets = newWidgets.filter(w => w !== widgetId);
    } else {
      newWidgets.push(widgetId);
    }
    updateSettings({ dashboardConfig: { activeWidgets: newWidgets } });
  };

  const setTemplate = (templateId: string) => {
    let newWidgets: string[] = [];
    if (templateId === 'empty') newWidgets = [];
    if (templateId === 'standard') newWidgets = ['missions', 'requests', 'features'];
    if (templateId === 'execution') newWidgets = ['missions', 'features'];
    updateSettings({ dashboardConfig: { activeWidgets: newWidgets } });
  };

  const renderWidget = (id: string) => {
    switch (id) {
      case 'missions':
        return (
          <div className="rounded-xl border border-border bg-card p-6 shadow-sm flex flex-col h-full">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold">Today's Missions</h2>
              <span className="text-sm text-muted-foreground">{missions.length} tasks</span>
            </div>
            <div className="flex-1">
              {missions.length === 0 ? (
                <div className="flex h-full items-center justify-center text-sm text-muted-foreground">No missions for today.</div>
              ) : (
                <ul className="space-y-2 text-sm">
                  {missions.slice(0, 5).map(m => (
                    <li key={m.id} className="flex justify-between items-center p-2 rounded-md bg-accent/50">
                      <span className="font-medium">{m.title}</span>
                      <span className="text-xs px-2 py-1 bg-background rounded-full border border-border">{m.status}</span>
                    </li>
                  ))}
                </ul>
              )}
            </div>
            <a href="/missions" className="mt-4 text-sm text-primary hover:underline font-medium z-20 relative">View all missions &rarr;</a>
          </div>
        );
      case 'requests':
        return (
          <div className="rounded-xl border border-border bg-card p-6 shadow-sm flex flex-col h-full">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold">Recent Requests</h2>
              <span className="text-sm text-muted-foreground">{customerRequests.length} total</span>
            </div>
            <div className="flex-1">
              {customerRequests.length === 0 ? (
                <div className="flex h-full items-center justify-center text-sm text-muted-foreground">Inbox zero!</div>
              ) : (
                <ul className="space-y-2 text-sm">
                  {customerRequests.slice(0, 5).map(r => (
                    <li key={r.id} className="flex justify-between items-center p-2 rounded-md bg-accent/50">
                      <span className="font-medium truncate mr-2">{r.title}</span>
                      <span className="text-xs px-2 py-1 bg-background rounded-full border border-border">{r.status}</span>
                    </li>
                  ))}
                </ul>
              )}
            </div>
            <a href="/requests" className="mt-4 text-sm text-primary hover:underline font-medium z-20 relative">Manage requests &rarr;</a>
          </div>
        );
      case 'features':
        return (
          <div className="rounded-xl border border-border bg-card p-6 shadow-sm flex flex-col h-full">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold">Feature Pipeline</h2>
              <span className="text-sm text-muted-foreground">{features.length} planned</span>
            </div>
            <div className="flex-1">
              {features.length === 0 ? (
                <div className="flex h-full items-center justify-center text-sm text-muted-foreground">Pipeline is empty.</div>
              ) : (
                <ul className="space-y-2 text-sm">
                  {features.slice(0, 5).map(f => (
                    <li key={f.id} className="flex justify-between items-center p-2 rounded-md bg-accent/50">
                      <span className="font-medium truncate mr-2">{f.title}</span>
                      <span className={`text-xs px-2 py-1 rounded-full border border-border whitespace-nowrap ${f.priority === 'Critical' ? 'text-destructive bg-destructive/10 border-destructive/20' : 'bg-background'}`}>
                        {f.priority}
                      </span>
                    </li>
                  ))}
                </ul>
              )}
            </div>
            <a href="/features" className="mt-4 text-sm text-primary hover:underline font-medium z-20 relative">Go to feature planner &rarr;</a>
          </div>
        );
      default:
        return null;
    }
  };

  // Summary statistics
  const completedMissions = missions.filter(m => m.status === 'Done').length;
  const missionsProgress = missions.length ? (completedMissions / missions.length) * 100 : 0;

  const completedRequests = customerRequests.filter(r => r.status === 'Completed').length;
  const requestsProgress = customerRequests.length ? (completedRequests / customerRequests.length) * 100 : 0;

  const releasedFeatures = features.filter(f => {
    const rel = releases.find(r => r.id === f.releaseId);
    return rel?.status === 'Released';
  }).length;
  const featuresProgress = features.length ? (releasedFeatures / features.length) * 100 : 0;

  const upcomingReleases = releases.filter(r => r.status !== 'Released');

  // Alerts
  const overdueMissions = missions.filter(m => {
    if (m.status === 'Done' || !m.dueDate) return false;
    return new Date(m.dueDate) < new Date();
  });

  const staleFeatures = features.filter(f => {
    if (!f.createdAt) return false;
    const release = releases.find(r => r.id === f.releaseId);
    if (release?.status === 'Released') return false;
    const daysOld = (new Date().getTime() - new Date(f.createdAt).getTime()) / (1000 * 3600 * 24);
    return daysOld > 30 && (!f.roadmapPhase || f.roadmapPhase === 'Later');
  });

  return (
    <div className="space-y-6 pb-6 h-full flex flex-col">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">Dashboard Hub</h1>
        <button 
          onClick={() => setIsCustomizing(!isCustomizing)}
          className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-colors ${
            isCustomizing ? 'bg-primary text-primary-foreground' : 'bg-secondary text-secondary-foreground hover:bg-secondary/80 border border-border'
          }`}
        >
          {isCustomizing ? <LayoutGrid className="w-4 h-4" /> : <Settings className="w-4 h-4" />}
          {isCustomizing ? "Done Customizing" : "Customize"}
        </button>
      </div>

      {/* Summary Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-card border border-border rounded-xl p-4 flex items-center gap-4 shadow-sm">
          <ProgressRing progress={missionsProgress} size={60} strokeWidth={5} colorClass="text-blue-500" />
          <div>
            <p className="text-sm text-muted-foreground font-medium">Missions</p>
            <p className="text-2xl font-bold">{completedMissions}/{missions.length}</p>
          </div>
        </div>
        
        <div className="bg-card border border-border rounded-xl p-4 flex items-center gap-4 shadow-sm">
          <ProgressRing progress={featuresProgress} size={60} strokeWidth={5} colorClass="text-purple-500" />
          <div>
            <p className="text-sm text-muted-foreground font-medium">Features Released</p>
            <p className="text-2xl font-bold">{releasedFeatures}/{features.length}</p>
          </div>
        </div>

        <div className="bg-card border border-border rounded-xl p-4 flex items-center gap-4 shadow-sm">
          <ProgressRing progress={requestsProgress} size={60} strokeWidth={5} colorClass="text-green-500" />
          <div>
            <p className="text-sm text-muted-foreground font-medium">Requests Done</p>
            <p className="text-2xl font-bold">{completedRequests}/{customerRequests.length}</p>
          </div>
        </div>

        <div className="bg-card border border-border rounded-xl p-4 flex flex-col justify-center shadow-sm">
           <p className="text-sm text-muted-foreground font-medium">Upcoming Releases</p>
           <p className="text-3xl font-bold mt-1 text-primary">{upcomingReleases.length}</p>
        </div>
      </div>

      {/* Alerts */}
      {(staleFeatures.length > 0 || overdueMissions.length > 0) && (
        <div className="space-y-2">
          {overdueMissions.map(m => (
            <div key={m.id} className="flex items-center gap-2 p-3 bg-destructive/10 text-destructive rounded-lg border border-destructive/20 text-sm">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span><strong>Overdue Mission:</strong> {m.title} (Due {new Date(m.dueDate!).toLocaleDateString()})</span>
            </div>
          ))}
          {staleFeatures.map(f => (
            <div key={f.id} className="flex items-center gap-2 p-3 bg-orange-500/10 text-orange-600 dark:text-orange-400 rounded-lg border border-orange-500/20 text-sm">
              <Clock className="w-4 h-4 flex-shrink-0" />
              <span><strong>Stale Feature:</strong> {f.title} has been in planning for over 30 days.</span>
            </div>
          ))}
        </div>
      )}

      {isCustomizing && (
        <div className="bg-muted/50 border border-border rounded-xl p-6 space-y-6">
          <div>
            <h3 className="text-sm font-semibold mb-3">Templates</h3>
            <div className="flex gap-3">
              <button onClick={() => setTemplate('standard')} className="px-3 py-1.5 bg-background border border-border rounded-md text-sm hover:bg-accent font-medium">Standard PM</button>
              <button onClick={() => setTemplate('execution')} className="px-3 py-1.5 bg-background border border-border rounded-md text-sm hover:bg-accent font-medium">Execution Focus</button>
              <button onClick={() => setTemplate('empty')} className="px-3 py-1.5 bg-background border border-border rounded-md text-sm hover:bg-accent font-medium text-muted-foreground">Empty Grid</button>
            </div>
          </div>
          <div>
            <h3 className="text-sm font-semibold mb-3">Visible Widgets</h3>
            <div className="flex flex-wrap gap-3">
              {allWidgets.map(w => (
                <label key={w} className="flex items-center gap-2 cursor-pointer bg-background px-3 py-2 border border-border rounded-md hover:bg-accent">
                  <input 
                    type="checkbox" 
                    checked={activeWidgets.includes(w)} 
                    onChange={() => toggleWidget(w)}
                    className="rounded border-input text-primary focus:ring-primary"
                  />
                  <span className="text-sm capitalize font-medium">{w}</span>
                </label>
              ))}
            </div>
          </div>
          <p className="text-xs text-muted-foreground italic">Drag and drop the widgets below to reorder them.</p>
        </div>
      )}

      {activeWidgets.length === 0 && !isCustomizing ? (
        <div className="text-center p-12 border-2 border-dashed border-border rounded-xl bg-muted/20 flex-1 flex flex-col items-center justify-center">
          <h3 className="text-lg font-semibold text-muted-foreground mb-2">Your dashboard is empty</h3>
          <p className="text-sm text-muted-foreground mb-6">Click customize to add widgets or apply a template.</p>
          <button 
            onClick={() => setIsCustomizing(true)}
            className="px-4 py-2 bg-primary text-primary-foreground rounded-md text-sm font-medium hover:bg-primary/90"
          >
            Customize Dashboard
          </button>
        </div>
      ) : (
        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
          <SortableContext items={activeWidgets} strategy={rectSortingStrategy}>
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 auto-rows-fr items-stretch">
              {activeWidgets.map(id => (
                <SortableWidget key={id} id={id} isCustomizing={isCustomizing}>
                  {renderWidget(id)}
                </SortableWidget>
              ))}
            </div>
          </SortableContext>
        </DndContext>
      )}
    </div>
  );
}

