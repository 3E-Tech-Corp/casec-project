import { useTheme } from './ThemeProvider';
import { Link } from 'react-router-dom';

export default function LogoOrText() {
  const { theme } = useTheme();

  if (theme?.logoUrl) {
    return (
      <Link to="/" className="flex items-center">
        <img 
          src={theme.logoUrl} 
          alt={theme.organizationName || 'Logo'} 
          className="h-10 w-auto"
        />
      </Link>
    );
  }

  return (
    <Link to="/" className="text-2xl font-display font-bold text-primary">
      {theme?.organizationName || 'CASEC'}
    </Link>
  );
}
