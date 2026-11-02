export type AppCategory = 'All' | 'Finance & Tax' | 'Creative & Media' | 'Productivity' | 'Automation';

export type AppStatus = 'Live' | 'Cloud Ready' | 'In Development' | 'Internal';

export interface AppItem {
  id: string;
  title: string;
  tagline: string;
  description: string;
  category: AppCategory;
  status: AppStatus;
  url: string;
  previewUrl?: string;
  previewSupported: boolean;
  iconName: 'camera' | 'calculator' | 'file-text' | 'map-pin' | 'code' | 'layers';
  techStack: string[];
  hostPlatform: string;
  featured?: boolean;
  highlightStat?: {
    label: string;
    value: string;
  };
}
