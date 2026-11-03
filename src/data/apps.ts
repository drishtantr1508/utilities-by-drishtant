import { AppItem } from '../types';

export const APPS_DATA: AppItem[] = [
  {
    id: 'visual-archive',
    title: 'Visual Archive',
    tagline: 'Fine-Art Curatorial Photography Exhibition',
    description: 'An architectural photography portfolio examining proportion, coastal stillness, and negative space. Features progressive WebP streaming, ambient lighting, and high-fidelity print downloads.',
    status: 'Live',
    url: 'https://visualarchivebydrishtant.netlify.app',
    previewUrl: 'https://visualarchivebydrishtant.netlify.app/collections',
    previewSupported: true,
    iconName: 'camera',
  },
  {
    id: 'salary-calculator',
    title: 'Indian Salary & TDS Simulator',
    tagline: 'Section 192 Month-by-Month Payroll Simulator',
    description: 'A dynamic tax and payroll simulation engine for India’s New Tax Regime (Section 115BAC). Accurately recalculates monthly TDS when mid-year appraisal hikes, variable bonuses, or statutory EPF contributions fluctuate.',
    status: 'Live',
    url: 'https://salarycalculatorbydrishtant.streamlit.app/',
    previewUrl: 'https://salarycalculatorbydrishtant.streamlit.app/?embed=true',
    previewSupported: true,
    iconName: 'calculator',
  },
  {
    id: 'notion-clone',
    title: 'Personal Workspace',
    tagline: 'Minimalist Markdown Wiki & Document Editor',
    description: 'A structured personal wiki and digital notebook for writing, document management, and knowledge organization with a fast, distraction-free markdown canvas.',
    status: 'Live',
    url: 'https://notionbydrishtant.netlify.app',
    previewUrl: 'https://notionbydrishtant.netlify.app',
    previewSupported: true,
    iconName: 'file-text',
  },
];
