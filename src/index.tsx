import React from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import App from './App';

// Protection patch against Google Translate and other external DOM manipulators breaking React reconciliation
(function () {
  if (typeof window !== 'undefined' && typeof Node !== 'undefined') {
    const safeRemoveChild = Node.prototype.removeChild;
    Node.prototype.removeChild = function<T extends Node> (child: T): T {
      if (child.parentNode !== this) {
        if (console) {
          console.warn('DOM Protection: Prevented React crash during removeChild. Target child is not a child of this parent node.', this, child);
        }
        return child;
      }
      return safeRemoveChild.call(this, child) as T;
    };

    const safeInsertBefore = Node.prototype.insertBefore;
    Node.prototype.insertBefore = function<T extends Node> (newNode: T, referenceNode: Node | null): T {
      if (referenceNode && referenceNode.parentNode !== this) {
        if (console) {
          console.warn('DOM Protection: Prevented React crash during insertBefore. Reference node is not a child of this parent node.', this, newNode, referenceNode);
        }
        return newNode;
      }
      return safeInsertBefore.call(this, newNode, referenceNode) as T;
    };
  }
})();

// Global handler to catch dynamic import failures (caused by new deployments replacing bundle hashes)
window.addEventListener('error', (event) => {
  const errorMessage = event.message || '';
  if (
    errorMessage.includes('Failed to fetch dynamically imported module') ||
    errorMessage.includes('dynamically imported module') ||
    (event.error && event.error.name === 'TypeError' && event.error.message && event.error.message.includes('dynamically imported module'))
  ) {
    console.warn('Dynamic import failed (chunk mismatch). Reloading application to fetch latest version...', event);
    window.location.reload();
  }
}, true); // Use capture phase to catch resource loading errors

window.addEventListener('unhandledrejection', (event) => {
  const reason = event.reason;
  if (reason && reason instanceof Error) {
    const msg = reason.message || '';
    if (msg.includes('Failed to fetch dynamically imported module') || msg.includes('dynamically imported module')) {
      console.warn('Unhandled promise rejection from dynamic import. Reloading application...', reason);
      window.location.reload();
    }
  }
});

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
        
        // If a service worker is already waiting to activate, trigger skipWaiting immediately
        if (registration.waiting) {
          registration.waiting.postMessage({ type: 'SKIP_WAITING' });
        }

        // Whenever a new service worker update is found
        registration.addEventListener('updatefound', () => {
          const newWorker = registration.installing;
          if (newWorker) {
            newWorker.addEventListener('statechange', () => {
              // Once installed and waiting, tell it to take control right away
              if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                newWorker.postMessage({ type: 'SKIP_WAITING' });
              }
            });
          }
        });

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
