"use client";

import React from 'react';
import { Search, Filter, SortAsc, SortDesc, CheckSquare } from 'lucide-react';

interface SearchFilterBarProps {
  searchQuery: string;
  onSearchChange: (val: string) => void;
  
  // Filtering
  filters?: {
    id: string;
    label: string;
    options: { value: string; label: string }[];
    value: string[];
    onChange: (val: string[]) => void;
  }[];
  
  // Sorting
  sortOptions?: { value: string; label: string }[];
  sortValue?: string;
  onSortChange?: (val: string) => void;
  sortDirection?: 'asc' | 'desc';
  onSortDirectionChange?: (dir: 'asc' | 'desc') => void;
  
  // Bulk selection
  isBulkMode?: boolean;
  onToggleBulkMode?: () => void;
  selectedCount?: number;
}

export function SearchFilterBar({
  searchQuery,
  onSearchChange,
  filters,
  sortOptions,
  sortValue,
  onSortChange,
  sortDirection = 'desc',
  onSortDirectionChange,
  isBulkMode,
  onToggleBulkMode,
  selectedCount = 0
}: SearchFilterBarProps) {
  
  return (
    <div className="flex flex-col sm:flex-row gap-3 items-center bg-card p-3 rounded-xl border border-border shadow-sm mb-6">
      
      {/* Search Input */}
      <div className="relative flex-1 w-full">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <input 
          type="search"
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="Search... (Press '/' to focus)"
          className="w-full pl-9 pr-4 py-2 bg-background border border-input rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary"
        />
      </div>

      <div className="flex items-center gap-3 w-full sm:w-auto overflow-x-auto no-scrollbar pb-1 sm:pb-0">
        
        {/* Bulk Toggle */}
        {onToggleBulkMode && (
          <button 
            onClick={onToggleBulkMode}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors border ${
              isBulkMode 
                ? 'bg-primary/10 text-primary border-primary/20' 
                : 'bg-background hover:bg-accent border-input text-muted-foreground'
            }`}
          >
            <CheckSquare className="w-4 h-4" />
            {isBulkMode ? `Bulk (${selectedCount})` : 'Select'}
          </button>
        )}

        {/* Filters */}
        {filters && filters.map(filter => (
          <div key={filter.id} className="relative group flex-shrink-0">
            <button className="flex items-center gap-1.5 px-3 py-2 bg-background hover:bg-accent border border-input rounded-lg text-sm font-medium text-muted-foreground whitespace-nowrap">
              <Filter className="w-4 h-4" />
              {filter.label}
              {filter.value.length > 0 && (
                <span className="ml-1 bg-primary text-primary-foreground text-[10px] w-4 h-4 rounded-full flex items-center justify-center">
                  {filter.value.length}
                </span>
              )}
            </button>
            <div className="absolute right-0 top-full mt-1 hidden group-hover:block bg-card border border-border rounded-lg shadow-lg p-2 z-50 min-w-[200px]">
              <div className="space-y-1">
                {filter.options.map(opt => {
                  const isSelected = filter.value.includes(opt.value);
                  return (
                    <label key={opt.value} className="flex items-center gap-2 p-2 hover:bg-accent rounded-md cursor-pointer">
                      <input 
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => {
                          if (isSelected) {
                            filter.onChange(filter.value.filter(v => v !== opt.value));
                          } else {
                            filter.onChange([...filter.value, opt.value]);
                          }
                        }}
                        className="rounded border-input text-primary focus:ring-primary"
                      />
                      <span className="text-sm">{opt.label}</span>
                    </label>
                  );
                })}
              </div>
            </div>
          </div>
        ))}

        {/* Sort */}
        {sortOptions && onSortChange && onSortDirectionChange && (
          <div className="flex items-center flex-shrink-0 bg-background border border-input rounded-lg">
            <select 
              value={sortValue}
              onChange={(e) => onSortChange(e.target.value)}
              className="pl-3 pr-8 py-2 bg-transparent text-sm font-medium outline-none appearance-none cursor-pointer"
            >
              {sortOptions.map(opt => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
            <div className="w-px h-4 bg-border" />
            <button 
              onClick={() => onSortDirectionChange(sortDirection === 'asc' ? 'desc' : 'asc')}
              className="p-2 hover:bg-accent rounded-r-lg text-muted-foreground hover:text-foreground"
            >
              {sortDirection === 'asc' ? <SortAsc className="w-4 h-4" /> : <SortDesc className="w-4 h-4" />}
            </button>
          </div>
        )}
        
      </div>
    </div>
  );
}
