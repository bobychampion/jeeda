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
export const API_URL = import.meta.env.VITE_API_URL || 
  (isProduction 
    ? 'https://jeeda.onrender.com' // Render backend URL
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

