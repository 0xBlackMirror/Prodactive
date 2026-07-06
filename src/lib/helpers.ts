import { Feature, Release } from './store';

export const computeRICE = (reach: number = 0, impact: number = 0, confidence: number = 0, effort: number = 1): number => {
  if (effort === 0) return 0;
  return Number(((reach * impact * confidence) / effort).toFixed(1));
};

export const generateReleaseNotes = (release: Release, features: Feature[]): string => {
  let markdown = `# Release Notes: ${release.version}\n\n`;
  if (release.targetDate) {
    markdown += `**Target Date:** ${new Date(release.targetDate).toLocaleDateString()}\n\n`;
  }
  
  if (release.description) {
    markdown += `${release.description}\n\n`;
  }
  
  markdown += `## Features in this Release\n\n`;
  
  if (features.length === 0) {
    markdown += `No features assigned yet.\n`;
    return markdown;
  }
  
  const byPriority = {
    'Critical': features.filter(f => f.priority === 'Critical'),
    'High': features.filter(f => f.priority === 'High'),
    'Medium': features.filter(f => f.priority === 'Medium'),
    'Low': features.filter(f => f.priority === 'Low'),
  };
  
  for (const [priority, priorityFeatures] of Object.entries(byPriority)) {
    if (priorityFeatures.length > 0) {
      markdown += `### ${priority} Priority\n`;
      for (const feature of priorityFeatures) {
        markdown += `- **${feature.title}**: ${feature.description || 'No description provided.'}\n`;
      }
      markdown += `\n`;
    }
  }
  
  return markdown;
};

export const exportToCSV = (data: any[], filename: string) => {
  if (data.length === 0) return;
  
  // Flatten objects to a depth of 1 and extract keys
  const getKeys = (obj: any): string[] => {
    let keys = new Set<string>();
    for (const key in obj) {
      if (typeof obj[key] !== 'object' || obj[key] === null) {
        keys.add(key);
      } else if (Array.isArray(obj[key])) {
        keys.add(key);
      }
    }
    return Array.from(keys);
  };
  
  const allKeys = new Set<string>();
  data.forEach(item => {
    getKeys(item).forEach(k => allKeys.add(k));
  });
  
  const columns = Array.from(allKeys);
  
  let csv = columns.join(',') + '\n';
  
  data.forEach(item => {
    const row = columns.map(col => {
      let val = item[col];
      if (val === undefined || val === null) return '';
      if (Array.isArray(val)) val = val.join(';');
      // Escape quotes
      const valStr = String(val).replace(/"/g, '""');
      // Wrap in quotes if it contains comma, quote, or newline
      if (valStr.includes(',') || valStr.includes('"') || valStr.includes('\n')) {
        return `"${valStr}"`;
      }
      return valStr;
    });
    csv += row.join(',') + '\n';
  });
  
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', `${filename}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};

export const detectDuplicates = (newTitle: string, existingTitles: string[]): string[] => {
  const normalize = (s: string) => s.toLowerCase().replace(/[^a-z0-9\s]/g, '');
  const target = normalize(newTitle);
  if (!target) return [];
  
  const targetWords = new Set(target.split(/\s+/).filter(w => w.length > 2));
  
  const matches = existingTitles.map(title => {
    const normalizedTitle = normalize(title);
    const titleWords = new Set(normalizedTitle.split(/\s+/).filter(w => w.length > 2));
    
    let common = 0;
    for (const word of targetWords) {
      if (titleWords.has(word)) common++;
    }
    
    const maxWords = Math.max(targetWords.size, titleWords.size);
    const score = maxWords > 0 ? common / maxWords : 0;
    
    return { title, score };
  });
  
  return matches.filter(m => m.score > 0.4).sort((a, b) => b.score - a.score).map(m => m.title);
};
