// Import necessary modules
import { Injectable } from '@angular/core';
import { OpenRouterService } from './open-router.service';
import { ErrorLoggingService } from './error-logging-service';

@Injectable({
  providedIn: 'root'
})
export class ErrorInterceptorService {
  private originalConsoleError: any;
  private isActive = false;

  constructor(
    private openRouterService: OpenRouterService,
    private errorLoggingService: ErrorLoggingService  // Inject error logging service
  ) {
    // Auto-initialize when service is created
    this.setupErrorHandling();
  }

  private setupErrorHandling() {
    if (this.isActive) return;
    
    // Store original console.error
    this.originalConsoleError = console.error;
    
    // Override console.error to capture all errors
    console.error = (...args: any[]) => {
      this.handleError(args);
      this.originalConsoleError.apply(console, args);
    };

    this.isActive = true;
    console.log('AI Error Interceptor started with logging enabled');
  }

  private handleError(args: any[]) {
    try {
      // Convert error arguments to string
      const errorMessage = args.map(arg => {
        if (typeof arg === 'object') {
          return arg.message || JSON.stringify(arg);
        }
        return String(arg);
      }).join(' ');

      // Check if it's an Angular error we should handle
      if (this.isAngularError(errorMessage)) {
        console.log('🤖 AI detected error:', errorMessage.substring(0, 100));
        
        // Get code context from stack trace
        const codeContext = this.getCodeContext(args);
        
        // Get component name from stack trace
        const component = this.getComponentName(codeContext);
        
        // Call AI service to get fix
        this.openRouterService.fixError(errorMessage, codeContext)
          .subscribe({
            next: (response) => {
              if (response.success) {
                // Extract AI solution
                const aiSolution = this.extractSolution(response);
                
                // Show fix to user
                this.showFix(aiSolution, errorMessage);
                
                // Log error with AI solution to backend
                this.logErrorToBackend(errorMessage, codeContext, aiSolution, component);
              }
            },
            error: (err) => {
              console.warn('AI service failed, logging error without solution');
              
              // Log error without AI solution
              this.logErrorToBackend(errorMessage, codeContext, null, component);
            }
          });
      }
    } catch (err) {
      console.warn('Error handler failed:', err);
    }
  }

  // Extract AI solution from response
  private extractSolution(response: any): string {
    if (response?.data?.rawResponse?.choices?.[0]?.message?.content) {
      return response.data.rawResponse.choices[0].message.content;
    } else if (response?.data?.fixedCode) {
      return response.data.fixedCode;
    } else if (response?.solution) {
      return response.solution;
    }
    return 'No solution provided';
  }

  // Log error to backend database
  private logErrorToBackend(
    errorMessage: string, 
    errorStack: string, 
    aiSolution: string | null,
    component: string
  ) {
    // Prepare error data
    const errorData = {
      errorType: 'frontend' as const,
      errorMessage: errorMessage,
      errorStack: errorStack,
      aiSolution: aiSolution || 'No AI solution generated',
      component: component,
      timestamp: new Date()
    };
    
    // Send to backend
    this.errorLoggingService.logError(errorData)
      .subscribe({
        next: (result: any) => {
          console.log('Error logged to database:', result);
        },
        error: (err: any) => {
          console.warn('Failed to log error to database:', err);
        }
      });
  }

  // Extract component name from stack trace
  private getComponentName(stackTrace: string): string {
    // Try to extract component name from stack trace
    const match = stackTrace.match(/at\s+(\w+Component)/);
    if (match && match[1]) {
      return match[1];
    }
    
    // Try to extract filename
    const fileMatch = stackTrace.match(/\((.+?\.ts):\d+:\d+\)/);
    if (fileMatch && fileMatch[1]) {
      return fileMatch[1];
    }
    
    return 'Unknown Component';
  }

  private isAngularError(error: string): boolean {
    const patterns = [
      /NG\d{4}/,
      /ExpressionChanged/,
      /Cannot read property/,
      /undefined is not/,
      /NullInjectorError/,
      /TypeError/,
      /ReferenceError/
    ];
    
    return patterns.some(pattern => pattern.test(error));
  }

  private getCodeContext(args: any[]): string {
    for (const arg of args) {
      if (arg instanceof Error && arg.stack) {
        return arg.stack.substring(0, 500);
      }
    }
    return 'No stack trace available';
  }

  private showFix(solution: string, error: string) {
    // Remove existing notification
    const existing = document.getElementById('ai-fix-notification');
    if (existing) existing.remove();

    // Create notification element
    const div = document.createElement('div');
    div.id = 'ai-fix-notification';
    
    div.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      background: #4CAF50;
      color: white;
      padding: 15px;
      border-radius: 8px;
      z-index: 9999;
      max-width: 400px;
      box-shadow: 0 4px 12px rgba(0,0,0,0.15);
      font-family: Arial, sans-serif;
    `;
    
    const shortError = error.length > 100 ? error.substring(0, 100) + '...' : error;
    const shortSolution = solution.length > 150 ? solution.substring(0, 150) + '...' : solution;
    
    div.innerHTML = `
      <div style="font-weight: bold; margin-bottom: 5px; font-size: 16px;">🤖 AI Fix Found & Logged</div>
      <div style="font-size: 12px; opacity: 0.9; margin-bottom: 8px;">${shortError}</div>
      <div style="background: rgba(255,255,255,0.1); padding: 8px; border-radius: 4px; margin-bottom: 10px; font-size: 14px;">
        ${shortSolution}
      </div>
      <button onclick="navigator.clipboard.writeText('${this.escapeText(solution)}')" 
              style="background: white; color: #4CAF50; border: none; padding: 5px 10px; border-radius: 4px; font-size: 12px; cursor: pointer;">
        Copy Fix
      </button>
      <button onclick="this.parentElement.remove()" 
              style="background: transparent; color: white; border: 1px solid white; padding: 5px 10px; border-radius: 4px; font-size: 12px; cursor: pointer; margin-left: 8px;">
        Dismiss
      </button>
    `;
    
    document.body.appendChild(div);
    
    // Auto remove after 15 seconds
    setTimeout(() => {
      if (div.parentElement) {
        div.remove();
      }
    }, 15000);
  }

  private escapeText(text: string): string {
    return text.replace(/'/g, "\\'").replace(/"/g, '\\"');
  }
}