import { Injectable } from '@angular/core';
import { OpenRouterService } from './open-router.service';

@Injectable({
  providedIn: 'root'
})
export class ErrorInterceptorService {
  private originalConsoleError: any;

  constructor(private openRouterService: OpenRouterService) {}

  initialize() {
    // Store original console.error
    this.originalConsoleError = console.error;
    
    // Override console.error
    console.error = (...args: any[]) => {
      this.handleError(args);
      this.originalConsoleError.apply(console, args);
    };

    console.log('AI Auto-Coder initialized and monitoring errors...');
  }

  private handleError(errorArgs: any[]) {
    const errorMessage = errorArgs.join(' ');
    
    // Check if it's an Angular error
    if (this.isAngularError(errorMessage)) {
      console.log('%cAI Auto-Coder: Angular error detected', 'color: #FF6B6B; font-weight: bold;', errorMessage);
      
      // Get simulated code context for demo
      const codeContext = this.getSimulatedCodeContext();
      
      // Call AI to fix error
      this.openRouterService.fixError(errorMessage, codeContext).subscribe({
        next: (response) => {
          if (response.choices && response.choices[0]?.message?.content) {
            const fixedCode = response.choices[0].message.content;
            this.showFixToUser(fixedCode, errorMessage);
          }
        },
        error: (err) => {
          console.error('AI API Error:', err);
          this.showError('Failed to connect to AI service. Check API key.');
        }
      });
    }
  }

  private isAngularError(error: string): boolean {
    // Check for common Angular error patterns
    const patterns = [
      /NG\d{4}/, // Angular error codes like NG0100, NG0201, etc.
      /ExpressionChangedAfterItHasBeenCheckedError/,
      /Template parse errors/,
      /Cannot find/,
      /No provider for/,
      /is not a known element/,
      /is not a function/,
      /of undefined/
    ];
    
    return patterns.some(pattern => pattern.test(error));
  }

  private getSimulatedCodeContext(): string {
    // For demo purposes, return a simple Angular component
    return `
    @Component({
      selector: 'app-test',
      template: \`
        <div>{{ user.name }}</div>
        <button (click)="handleClick()">Click</button>
      \`
    })
    export class TestComponent {
      user: any;
      
      handleClick() {
        console.log('Clicked');
      }
    }
    `;
  }

  private showFixToUser(fixedCode: string, originalError: string) {
    // Create notification
    const notification = document.createElement('div');
    notification.id = 'ai-auto-coder-notification';
    notification.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      padding: 20px;
      border-radius: 10px;
      z-index: 9999;
      max-width: 500px;
      box-shadow: 0 10px 40px rgba(0,0,0,0.2);
      font-family: 'Segoe UI', Arial, sans-serif;
      border-left: 5px solid #4CAF50;
      animation: slideIn 0.3s ease;
    `;
    
    notification.innerHTML = `
      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px;">
        <h4 style="margin: 0; font-size: 18px;">
          🚀 AI Auto-Coder Found a Fix!
        </h4>
        <button onclick="document.getElementById('ai-auto-coder-notification').remove()" 
                style="background: none; border: none; color: white; font-size: 20px; cursor: pointer;">
          ×
        </button>
      </div>
      
      <div style="margin: 10px 0; padding: 10px; background: rgba(255,255,255,0.1); border-radius: 5px;">
        <strong style="font-size: 12px; opacity: 0.9;">Original Error:</strong>
        <div style="font-size: 11px; opacity: 0.8; margin-top: 5px;">${originalError.substring(0, 100)}...</div>
      </div>
      
      <div style="margin: 10px 0;">
        <strong style="font-size: 12px; opacity: 0.9;">Suggested Fix:</strong>
        <div style="position: relative;">
          <pre style="background: #1e1e1e; padding: 15px; border-radius: 5px; overflow: auto; 
                     color: #d4d4d4; margin-top: 10px; font-size: 12px; max-height: 200px;">
${this.escapeHtml(fixedCode)}
          </pre>
          <button onclick="navigator.clipboard.writeText(\`${this.escapeForCopy(fixedCode)}\`); 
                          this.textContent='✓ Copied!'; setTimeout(() => this.textContent='📋 Copy', 2000)"
                  style="position: absolute; top: 10px; right: 10px; background: #4CAF50; color: white; 
                         border: none; padding: 5px 10px; border-radius: 3px; cursor: pointer; font-size: 11px;">
            📋 Copy
          </button>
        </div>
      </div>
      
      <div style="font-size: 11px; opacity: 0.7; text-align: center; margin-top: 10px;">
        Powered by OpenRouter AI
      </div>
    `;
    
    // Add animation
    const style = document.createElement('style');
    style.textContent = `
      @keyframes slideIn {
        from { transform: translateX(100%); opacity: 0; }
        to { transform: translateX(0); opacity: 1; }
      }
    `;
    document.head.appendChild(style);
    
    // Remove existing notification
    const existing = document.getElementById('ai-auto-coder-notification');
    if (existing) existing.remove();
    
    document.body.appendChild(notification);
    
    // Auto-remove after 60 seconds
    setTimeout(() => {
      if (notification.parentElement) {
        notification.remove();
      }
    }, 60000);
  }

  private showError(message: string) {
    const errorDiv = document.createElement('div');
    errorDiv.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      background: #dc3545;
      color: white;
      padding: 15px;
      border-radius: 5px;
      z-index: 9999;
      max-width: 300px;
    `;
    errorDiv.textContent = message;
    
    document.body.appendChild(errorDiv);
    setTimeout(() => errorDiv.remove(), 5000);
  }

  private escapeHtml(text: string): string {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }

  private escapeForCopy(text: string): string {
    return text.replace(/`/g, '\\`').replace(/\${/g, '\\${');
  }
}