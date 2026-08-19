export interface ThemeColors {
  mode: 'light' | 'dark';
  primary: string;
  primaryLight: string;
  background: string;
  surface: string;
  textMain: string;
  textMuted: string;
  border: string;
  status: {
    pending: string;
    inProgress: string;
    resolved: string;
  };
  shadow: string;
  iconPrimary: string;
  iconMuted: string;
}

export const lightTheme: ThemeColors = {
  mode: 'light',
  primary: '#4F46E5',
  primaryLight: '#EEF2FF',
  background: '#F9FAFB',
  surface: '#FFFFFF',
  textMain: '#111827',
  textMuted: '#6B7280',
  border: '#E5E7EB',
  status: { pending: '#F59E0B', inProgress: '#3B82F6', resolved: '#10B981' },
  shadow: '#000000',
  iconPrimary: '#4F46E5',
  iconMuted: '#9CA3AF'
};

export const darkTheme: ThemeColors = {
  mode: 'dark',
  primary: '#6366F1',
  primaryLight: '#312E81',
  background: '#111827',
  surface: '#1F2937',
  textMain: '#F9FAFB',
  textMuted: '#9CA3AF',
  border: '#374151',
  status: { pending: '#FBBF24', inProgress: '#60A5FA', resolved: '#34D399' },
  shadow: '#000000',
  iconPrimary: '#818CF8',
  iconMuted: '#6B7280'
};