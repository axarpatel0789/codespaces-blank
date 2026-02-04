import { bootstrapApplication } from '@angular/platform-browser';
import { appConfig } from './app/app.config';
import { App } from './app/app';

// Initialize error handling early
window.addEventListener('error', (event) => {
  console.log('Global error caught:', event.error);
});

bootstrapApplication(App, appConfig)
  .catch((err) => console.error(err));
