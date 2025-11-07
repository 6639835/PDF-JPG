import { Inter } from 'next/font/google';
import { useEffect, useState } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useThemeStore } from '@/store/useThemeStore';
import '../styles/globals.css';

// Initialize Inter font with specific subsets and features
const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
  weight: ['300', '400', '500', '600', '700'],
  fallback: ['system-ui', 'sans-serif'],
  preload: true,
});

// Error boundary for production
function ErrorFallback({ error }: { error: Error }) {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-dark text-white p-4">
      <div className="card-glass p-8 max-w-lg">
        <h1 className="text-2xl font-semibold text-primary mb-4">Something went wrong</h1>
        <p className="mb-4">We apologize for the inconvenience. Please try refreshing the page or contact support if the problem persists.</p>
        <div className="bg-dark-400 p-3 rounded-md text-sm mb-4 overflow-auto">
          <code>{error.message || 'Unknown error'}</code>
        </div>
        <button 
          className="btn-primary px-4 py-2" 
          onClick={() => window.location.reload()}
        >
          Refresh Page
        </button>
      </div>
    </div>
  );
}

// Create a client for React Query
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
      staleTime: 5 * 60 * 1000, // 5 minutes
    },
  },
});

// Theme initializer component
function ThemeInitializer() {
  const theme = useThemeStore((state) => state.theme);

  useEffect(() => {
    // Initialize theme on mount
    document.documentElement.classList.toggle('light', theme === 'light');
  }, [theme]);

  return null;
}

export default function MyApp({ Component, pageProps }: any) {
  const [error, setError] = useState<Error | null>(null);

  // Error boundary for client-side errors
  useEffect(() => {
    const handleError = (event: ErrorEvent) => {
      console.error('Global error caught:', event.error);
      setError(event.error);
    };

    window.addEventListener('error', handleError);
    return () => window.removeEventListener('error', handleError);
  }, []);

  // Apply noise texture to the whole app
  useEffect(() => {
    document.body.classList.add('bg-grain');
  }, []);

  if (error) {
    return (
      <div className={`${inter.variable} font-sans`}>
        <ErrorFallback error={error} />
      </div>
    );
  }

  return (
    <QueryClientProvider client={queryClient}>
      <div className={`${inter.variable} font-sans`}>
        <ThemeInitializer />
        <Component {...pageProps} />
      </div>
    </QueryClientProvider>
  );
}

