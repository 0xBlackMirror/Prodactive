"use client";

import React, { useState } from 'react';
import { useStore } from '@/lib/store';
import { BookOpen, Plus, Trash2, Edit3, Save, FileText, Target, Map, Activity, Users, Settings2, Layout } from 'lucide-react';
import { MarkdownRenderer } from '@/components/MarkdownRenderer';

const BUILT_IN_GUIDES = [
  {
    id: 'rice',
    title: 'The RICE Scoring Model',
    icon: Activity,
    content: `
# RICE Scoring Model

RICE is a prioritization framework designed to help product managers evaluate features objectively.

## Formula
**RICE Score** = \`(Reach × Impact × Confidence) / Effort\`

- **Reach**: How many people will this impact in a given period? (e.g., users per month)
- **Impact**: How much will this impact the user or the business?
  - 3 = Massive Impact
  - 2 = High Impact
  - 1 = Medium Impact
  - 0.5 = Low Impact
  - 0.25 = Minimal
- **Confidence**: How confident are you in your estimates? (100% = High, 80% = Medium, 50% = Low)
- **Effort**: How much time will it require from all team members? (measured in person-months)

### Why Use RICE?
It prevents personal bias from dictating the roadmap and forces teams to quantify the potential ROI of their time.
    `
  },
  {
    id: 'prd',
    title: 'Writing a Good PRD',
    icon: FileText,
    content: `
# Product Requirements Document (PRD)

A PRD serves as the single source of truth for a feature. It defines the *what* and the *why*, leaving the *how* to engineering and design.

## Recommended Structure

1. **Problem Statement**: What user or business problem are we solving?
2. **Success Metrics**: How will we know if this feature is successful? (e.g., adoption rate, conversion lift)
3. **Target Audience**: Who is this for?
4. **User Stories / Requirements**: 
   - *As a [user type], I want to [action] so that [benefit].*
5. **Out of Scope**: Explicitly state what we are *not* building right now.
6. **Dependencies & Risks**: Are there cross-team dependencies or technical blockers?

### Golden Rule
Keep it living. A PRD is not a one-time document; it should be updated as new information is discovered during development.
    `
  },
  {
    id: 'roadmap',
    title: 'Roadmapping & Releases',
    icon: Map,
    content: `
# Effective Roadmapping

A roadmap is a strategic communication tool, not a project plan with hard deadlines. 

## Best Practices
- **Outcome vs Output**: Focus on the problems you are solving (Outcomes) rather than the exact features you are shipping (Outputs).
- **Time Horizons**: Instead of strict dates, use "Now, Next, Later" or quarters (Q1, Q2) to convey priority without false precision.
- **Theme-Based**: Group features into strategic themes that align with company goals.

## Release Management
- Keep releases as small as possible to minimize risk and accelerate feedback loops.
- Use the **Release** entity in this tool to bundle interdependent features together for launch.
    `
  },
  {
    id: 'okrs',
    title: 'OKRs (Objectives & Key Results)',
    icon: Target,
    content: `
# OKRs Framework

OKRs bridge the gap between strategy and execution.

## Objective
The *What*. Qualitative, inspirational, and time-bound.
*Example: "Create an onboarding experience that users love."*

## Key Results
The *How*. Quantitative, measurable milestones that indicate whether you've achieved the objective.
*Example 1: "Increase Day 1 retention from 20% to 35%."*
*Example 2: "Reduce average onboarding completion time from 10 mins to 3 mins."*

### Tips
- Set ambitious goals (hitting 70% of an OKR should be considered a success).
- Limit to 3-5 Key Results per Objective.
- Use the **Missions** entity in this tool to represent your Objectives.
    `
  },
  {
    id: 'user-story-mapping',
    title: 'User Story Mapping',
    icon: Layout,
    content: `
# User Story Mapping

Story mapping is a visual exercise that helps teams understand the user journey and slice out a Minimum Viable Product (MVP).

## How to do it
1. **The Backbone**: Map out the high-level steps a user takes to accomplish a goal (left to right).
2. **The Details**: Underneath each step, list the specific tasks or stories required to complete that step (top to bottom).
3. **The Slices**: Draw horizontal lines to group stories into releases. The top slice is your MVP.

This prevents the "flat backlog" problem where context is lost and helps teams prioritize based on user flow rather than feature silos.
    `
  },
  {
    id: 'ab-testing',
    title: 'A/B Testing & Experimentation',
    icon: Settings2,
    content: `
# A/B Testing Fundamentals

Experimentation allows you to validate hypotheses with actual user behavior rather than opinions.

## The Process
1. **Formulate a Hypothesis**: *If we change X, then Y will happen, because of Z.*
2. **Define Metrics**: Choose a primary metric (what you want to improve) and secondary/guardrail metrics (what you don't want to break).
3. **Calculate Sample Size**: Determine how many users you need to reach statistical significance.
4. **Run the Test**: Ensure a clean split (Control vs. Variant).
5. **Analyze & Act**: If the results are significant, roll out the winner. If not, learn and iterate.

### Pitfalls
- **Peeking**: Looking at results too early and stopping the test before reaching the required sample size.
- **Too Many Variables**: Testing multiple major changes at once makes it impossible to know *why* a metric moved.
    `
  },
  {
    id: 'stakeholders',
    title: 'Stakeholder Management',
    icon: Users,
    content: `
# Managing Stakeholders

As a PM, you lead by influence, not authority. Managing stakeholders is a critical skill.

## The Power-Interest Grid
- **High Power, High Interest (Manage Closely)**: Your core sponsors. Involve them early and often.
- **High Power, Low Interest (Keep Satisfied)**: Keep them updated on high-level progress. Don't overwhelm them with details.
- **Low Power, High Interest (Keep Informed)**: Usually subject matter experts. Consult them for input and keep them in the loop.
- **Low Power, Low Interest (Monitor)**: Minimal effort required, just ensure they have access to information if needed.

### Communication Tips
- Tailor your message: Engineers want technical context; executives want business impact.
- Say "no" gracefully by pointing back to the agreed-upon OKRs and Roadmap priorities.
    `
  }
];

export default function PlaybookPage() {
  const { playbookNotes, addPlaybookNote, updatePlaybookNote, deletePlaybookNote } = useStore();
  
  const [activeTab, setActiveTab] = useState<'guides' | 'custom'>('guides');
  const [activeGuide, setActiveGuide] = useState(BUILT_IN_GUIDES[0].id);
  
  const [isEditingNote, setIsEditingNote] = useState(false);
  const [editingNoteId, setEditingNoteId] = useState<string | null>(null);
  
  const [noteTitle, setNoteTitle] = useState('');
  const [noteContent, setNoteContent] = useState('');

  const currentGuide = BUILT_IN_GUIDES.find(g => g.id === activeGuide);

  const startNewNote = () => {
    setIsEditingNote(true);
    setEditingNoteId(null);
    setNoteTitle('');
    setNoteContent('# New Note\\n\\nWrite your thoughts here...');
  };

  const editNote = (note: any) => {
    setIsEditingNote(true);
    setEditingNoteId(note.id);
    setNoteTitle(note.title);
    setNoteContent(note.content);
  };

  const saveNote = () => {
    if (!noteTitle.trim()) return;

    if (editingNoteId) {
      updatePlaybookNote(editingNoteId, {
        title: noteTitle,
        content: noteContent
      });
    } else {
      addPlaybookNote({
        id: Date.now().toString(),
        title: noteTitle,
        content: noteContent,
        createdAt: Date.now(),
        updatedAt: Date.now()
      });
    }
    setIsEditingNote(false);
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6 pb-12 h-full flex flex-col">
      <div className="flex items-center justify-between flex-shrink-0">
        <div>
          <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
            <BookOpen className="w-8 h-8 text-primary" />
            PM Playbook
          </h1>
          <p className="text-muted-foreground mt-1">Knowledge base, frameworks, and custom notes.</p>
        </div>
        
        {activeTab === 'custom' && !isEditingNote && (
          <button 
            onClick={startNewNote}
            className="px-4 py-2 bg-primary text-primary-foreground rounded-lg font-medium flex items-center gap-2 hover:bg-primary/90 transition-colors"
          >
            <Plus className="w-4 h-4" />
            New Note
          </button>
        )}
      </div>

      <div className="flex items-center gap-4 border-b border-border flex-shrink-0">
        <button
          onClick={() => setActiveTab('guides')}
          className={`pb-3 px-1 text-sm font-medium border-b-2 transition-colors ${
            activeTab === 'guides' 
              ? 'border-primary text-foreground' 
              : 'border-transparent text-muted-foreground hover:text-foreground'
          }`}
        >
          Built-in Guides
        </button>
        <button
          onClick={() => {
            setActiveTab('custom');
            setIsEditingNote(false);
          }}
          className={`pb-3 px-1 text-sm font-medium border-b-2 transition-colors ${
            activeTab === 'custom' 
              ? 'border-primary text-foreground' 
              : 'border-transparent text-muted-foreground hover:text-foreground'
          }`}
        >
          My Custom Notes ({playbookNotes?.length || 0})
        </button>
      </div>

      <div className="flex-1 overflow-hidden min-h-0">
        {activeTab === 'guides' && (
          <div className="flex h-full gap-6">
            <div className="w-64 flex-shrink-0 border-r border-border pr-6 overflow-y-auto space-y-1">
              {BUILT_IN_GUIDES.map(guide => {
                const Icon = guide.icon;
                const isActive = activeGuide === guide.id;
                return (
                  <button
                    key={guide.id}
                    onClick={() => setActiveGuide(guide.id)}
                    className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-left transition-colors ${
                      isActive 
                        ? 'bg-primary/10 text-primary font-medium' 
                        : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                    }`}
                  >
                    <Icon className="w-4 h-4 flex-shrink-0" />
                    <span className="truncate">{guide.title}</span>
                  </button>
                );
              })}
            </div>
            <div className="flex-1 overflow-y-auto bg-card border border-border rounded-xl p-8 shadow-sm">
              <MarkdownRenderer content={currentGuide?.content || ''} />
            </div>
          </div>
        )}

        {activeTab === 'custom' && (
          <div className="h-full">
            {isEditingNote ? (
              <div className="flex flex-col h-full bg-card border border-border rounded-xl shadow-sm overflow-hidden">
                <div className="flex items-center justify-between p-4 border-b border-border bg-muted/30">
                  <input
                    type="text"
                    value={noteTitle}
                    onChange={(e) => setNoteTitle(e.target.value)}
                    placeholder="Note Title..."
                    className="text-xl font-semibold bg-transparent border-none outline-none focus:ring-0 flex-1 px-2"
                  />
                  <div className="flex items-center gap-2">
                    <button 
                      onClick={() => setIsEditingNote(false)}
                      className="px-3 py-1.5 text-sm font-medium hover:bg-muted rounded-md transition-colors text-muted-foreground"
                    >
                      Cancel
                    </button>
                    <button 
                      onClick={saveNote}
                      disabled={!noteTitle.trim()}
                      className="px-4 py-1.5 bg-primary text-primary-foreground rounded-md text-sm font-medium flex items-center gap-2 hover:bg-primary/90 disabled:opacity-50"
                    >
                      <Save className="w-4 h-4" />
                      Save
                    </button>
                  </div>
                </div>
                <div className="flex-1 p-4 overflow-y-auto">
                  <textarea
                    value={noteContent}
                    onChange={(e) => setNoteContent(e.target.value)}
                    className="w-full h-full min-h-[500px] resize-none border-none outline-none focus:ring-0 bg-transparent font-mono text-sm leading-relaxed"
                    placeholder="Supports full markdown..."
                  />
                </div>
              </div>
            ) : (
              <div className="h-full overflow-y-auto">
                {(!playbookNotes || playbookNotes.length === 0) ? (
                  <div className="flex flex-col items-center justify-center h-full text-center space-y-4 pt-20">
                    <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center">
                      <BookOpen className="w-8 h-8 text-muted-foreground" />
                    </div>
                    <div>
                      <h3 className="text-lg font-medium">No custom notes yet</h3>
                      <p className="text-sm text-muted-foreground max-w-sm mt-1">
                        Use this space to save your own frameworks, meeting notes, retrospectives, or team guidelines.
                      </p>
                    </div>
                    <button 
                      onClick={startNewNote}
                      className="px-4 py-2 bg-primary text-primary-foreground rounded-lg font-medium flex items-center gap-2 mt-4 hover:bg-primary/90"
                    >
                      <Plus className="w-4 h-4" />
                      Create First Note
                    </button>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {playbookNotes.map(note => (
                      <div key={note.id} className="bg-card border border-border rounded-xl p-5 shadow-sm hover:shadow-md transition-all group flex flex-col h-[280px]">
                        <div className="flex items-start justify-between mb-3">
                          <h3 className="font-semibold text-lg line-clamp-2">{note.title}</h3>
                          <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button 
                              onClick={() => editNote(note)}
                              className="p-1.5 text-muted-foreground hover:bg-muted hover:text-foreground rounded-md"
                            >
                              <Edit3 className="w-4 h-4" />
                            </button>
                            <button 
                              onClick={() => {
                                if (confirm("Are you sure you want to delete this note?")) {
                                  deletePlaybookNote(note.id);
                                }
                              }}
                              className="p-1.5 text-destructive hover:bg-destructive/10 rounded-md"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                        <div className="flex-1 overflow-hidden relative">
                          <div className="text-sm text-muted-foreground absolute inset-0 overflow-hidden pointer-events-none" style={{ maskImage: 'linear-gradient(to bottom, black 50%, transparent 100%)' }}>
                            <MarkdownRenderer content={note.content} />
                          </div>
                        </div>
                        <div className="pt-4 mt-auto text-xs text-muted-foreground border-t border-border/50">
                          Last updated: {new Date(note.updatedAt).toLocaleDateString()}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
