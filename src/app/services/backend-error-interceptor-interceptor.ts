// Import required modules
import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError, throwError } from 'rxjs';
import { ErrorLoggingService } from './error-logging-service';
import { OpenRouterService } from './open-router.service';

// HTTP Interceptor to catch backend errors
export const backendErrorInterceptor: HttpInterceptorFn = (req, next) => {
  
  const errorLoggingService = inject(ErrorLoggingService);
  const openRouterService = inject(OpenRouterService);
  
  return next(req).pipe(
    catchError((error: HttpErrorResponse) => {
      
      // Skip error logging API calls
      if (!req.url.includes('/api/errors')) {
        
        console.error('Backend Error:', error);
        
        // Format error message
        const errorMessage = `${req.method} ${req.url} - Status: ${error.status} - ${error.message}`;
        const errorContext = `Response: ${JSON.stringify(error.error)}`;
        
        // Get AI solution
        openRouterService.fixError(errorMessage, errorContext)
          .subscribe({
            next: (response) => {
              // Extract AI solution
              let aiSolution = 'No solution';
              
              if (response?.data?.rawResponse?.choices?.[0]?.message?.content) {
                aiSolution = response.data.rawResponse.choices[0].message.content;
              } else if (response?.solution) {
                aiSolution = response.solution;
              }
              
              // Log to backend
              errorLoggingService.logError({
                errorType: 'backend',
                errorMessage: errorMessage,
                errorStack: errorContext,
                aiSolution: aiSolution,
                component: req.url,
                timestamp: new Date()
              }).subscribe();
              
              // Show notification
              showNotification(error, aiSolution);
            },
            error: () => {
              // Log without AI solution
              errorLoggingService.logError({
                errorType: 'backend',
                errorMessage: errorMessage,
                errorStack: errorContext,
                aiSolution: 'AI unavailable',
                component: req.url,
                timestamp: new Date()
              }).subscribe();
            }
          });
      }
      
      return throwError(() => error);
    })
  );
};

// Simple notification function
function showNotification(error: HttpErrorResponse, solution: string) {
  const existing = document.getElementById('backend-error-notification');
  if (existing) existing.remove();
  
  const div = document.createElement('div');
  div.id = 'backend-error-notification';
  
  div.style.cssText = `
    position: fixed;
    top: 80px;
    right: 20px;
    background: #f44336;
    color: white;
    padding: 15px;
    border-radius: 8px;
    z-index: 9999;
    max-width: 400px;
    box-shadow: 0 4px 12px rgba(0,0,0,0.15);
    font-family: Arial, sans-serif;
  `;
  
  const shortSolution = solution.length > 150 ? solution.substring(0, 150) + '...' : solution;
  
  div.innerHTML = `
    <div style="font-weight: bold; margin-bottom: 5px;">Backend Error</div>
    <div style="font-size: 13px; margin-bottom: 8px;">
      ${error.message}
    </div>
    <div style="font-size: 12px; margin-bottom: 8px; opacity: 0.8;">
      Status: ${error.status}
    </div>
    <div style="background: rgba(255,255,255,0.1); padding: 8px; border-radius: 4px; margin-bottom: 10px; font-size: 13px;">
      <strong>AI Solution:</strong><br/>
      ${shortSolution}
    </div>
    <button onclick="navigator.clipboard.writeText(\`${solution.replace(/`/g, '\\`')}\`)" 
            style="background: white; color: #f44336; border: none; padding: 5px 10px; border-radius: 4px; font-size: 12px; cursor: pointer; margin-right: 8px;">
      Copy
    </button>
    <button onclick="this.parentElement.remove()" 
            style="background: transparent; color: white; border: 1px solid white; padding: 5px 10px; border-radius: 4px; font-size: 12px; cursor: pointer;">
      Dismiss
    </button>
  `;
  
  document.body.appendChild(div);
  
  setTimeout(() => {
    if (div.parentElement) div.remove();
  }, 15000);
}