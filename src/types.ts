export interface AppItem {
  id: string;
  title: string;
  tagline: string;
  description: string;
  status: 'Live' | 'Ready' | 'In Development';
  url: string;
  previewUrl: string;
  previewSupported: boolean;
  iconName: 'camera' | 'calculator' | 'file-text';
}
