import React from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import App from './App';

const container = document.getElementById('root');
if (container) {
  const root = createRoot(container);
  root.render(
    <React.StrictMode>
      <App />
    </React.StrictMode>
  );

  // Register Service Worker with robust auto-update mechanisms
  if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
      // updateViaCache: 'none' forces the browser to bypass HTTP cache for sw.js itself
      navigator.serviceWorker.register(`${import.meta.env.BASE_URL}sw.js`, {
        updateViaCache: 'none'
      }).then(registration => {
        console.log('SW registered: ', registration);
        
        // Initial check on load
        registration.update().catch(err => console.log('Error updating SW on load:', err));

        // Periodically check for updates every 5 minutes
        setInterval(() => {
          registration.update().catch(err => console.log('Error during periodic SW update:', err));
        }, 5 * 60 * 1000);

        // Active check: trigger update check when PWA is resumed from background
        document.addEventListener('visibilitychange', () => {
          if (document.visibilityState === 'visible') {
            console.log('PWA active/focused, checking for service worker updates...');
            registration.update().catch(err => console.log('Error checking update on focus:', err));
          }
        });
      }).catch(registrationError => {
        console.log('SW registration failed: ', registrationError);
      });
    });

    // Detect when a new Service Worker activates and takes control, then force reload
    let refreshing = false;
    navigator.serviceWorker.addEventListener('controllerchange', () => {
      if (!refreshing) {
        refreshing = true;
        console.log('New Service Worker took control. Reloading application to apply updates...');
        window.location.reload();
      }
    });
  }
}
