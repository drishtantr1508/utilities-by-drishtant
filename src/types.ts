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

export interface BackGestureState {
  active: boolean;
  progress: number;
  edge: number; // 0 = left edge, 1 = right edge
  touchX?: number;
  touchY?: number;
  destinationTabId: string;
}
