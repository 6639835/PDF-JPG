import { Inter } from 'next/font/google';
import { useEffect, useState } from 'react';
import '../styles/globals.css';

// Initialize Inter font with specific subsets and features
const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
  weight: ['300', '400', '500', '600', '700'],
  fallback: ['system-ui', 'sans-serif'],
  preload: true,
  features: {
    salt: '1',
    ss01: '1',
    ss02: '1',
  },
});

// Error boundary for production
function ErrorFallback({ error }) {
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

export default function MyApp({ Component, pageProps }) {
  const [error, setError] = useState(null);

  // Error boundary for client-side errors
  useEffect(() => {
    const handleError = (event) => {
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
    <div className={`${inter.variable} font-sans`}>
      <Component {...pageProps} />
    </div>
  );
}