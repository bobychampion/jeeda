/**
 * API Configuration
 * Automatically detects environment and uses appropriate backend URL
 */

// Detect if we're running on production
const isProduction = typeof window !== 'undefined' && (
  window.location.hostname === 'coupleit.web.app' || 
  window.location.hostname === 'coupleit.firebaseapp.com'
);

// Get API URL from environment variable or use defaults
// In production, if VITE_API_URL is not set, it will show an error message
export const API_URL = import.meta.env.VITE_API_URL || 
  (isProduction 
    ? (() => {
        console.error('⚠️ VITE_API_URL is not set! Please set your backend URL in the environment variables.');
        console.error('The app will try to use localhost, which will fail in production.');
        return 'http://localhost:5000'; // This will fail, but at least it's clear
      })()
    : 'http://localhost:5000'
  );

export const API_BASE_URL = `${API_URL}/api`;

if (typeof window !== 'undefined') {
  console.log('API Configuration:', {
    environment: isProduction ? 'production' : 'development',
    apiUrl: API_URL,
    hostname: window.location.hostname,
    hasEnvVar: !!import.meta.env.VITE_API_URL,
  });
}

