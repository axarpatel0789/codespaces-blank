import { Injectable } from '@angular/core';
import { OpenRouterService } from './open-router.service';

@Injectable({
  providedIn: 'root'
})
export class ErrorInterceptorService {
  private originalConsoleError: any;
  private isActive = false;

  constructor(private openRouterService: OpenRouterService) {
    // Auto-initialize when service is created
    this.setupErrorHandling();
  }

  private setupErrorHandling() {
    if (this.isActive) return;
    
    // Store original console.error
    this.originalConsoleError = console.error;
    
    // Override console.error
    console.error = (...args: any[]) => {
      this.handleError(args);
      this.originalConsoleError.apply(console, args);
    };

    this.isActive = true;
    console.log('✅ AI Error Interceptor started');
  }

  private handleError(args: any[]) {
    try {
      const errorMessage = args.map(arg => {
        if (typeof arg === 'object') {
          return arg.message || JSON.stringify(arg);
        }
        return String(arg);
      }).join(' ');

      // Check if it's an Angular error
      if (this.isAngularError(errorMessage)) {
        console.log('🤖 AI detected error:', errorMessage.substring(0, 100));
        
        // Get code context from stack trace
        const codeContext = this.getCodeContext(args);
        
        // Call AI service
        this.openRouterService.fixError(errorMessage, codeContext)
          .subscribe(response => {
            if (response.success && response.solution) {
              this.showFix(response.solution, errorMessage);
            }
          });
      }
    } catch (err) {
      // Silently fail if error handler itself errors
      console.warn('Error handler failed:', err);
    }
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
    // Find stack trace in args
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

    // Create notification
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
      <div style="font-weight: bold; margin-bottom: 5px; font-size: 16px;">🤖 AI Fix Found</div>
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