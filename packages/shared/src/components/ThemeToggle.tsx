import { useTheme } from '../providers/ThemeProvider';

export function ThemeToggle() {
  const { theme, toggle } = useTheme();
  return (
    <button onClick={toggle} className="px-3 py-2 rounded-md border bg-white dark:bg-gray-900">
      {theme === 'dark' ? 'Light mode' : 'Dark mode'}
    </button>
  );
}