import { useColorScheme } from 'react-native';

export interface Theme {
  background: string;
  text: string;
  textMuted: string;
  accent: string;
  border: string;
}

const light: Theme = { background: '#FFFFFF', text: '#0F172A', textMuted: '#64748B', accent: '#2563EB', border: '#E2E8F0' };
const dark: Theme = { background: '#0F172A', text: '#F8FAFC', textMuted: '#94A3B8', accent: '#60A5FA', border: '#1E293B' };

export function useTheme(): Theme {
  const scheme = useColorScheme();
  return scheme === 'dark' ? dark : light;
}
