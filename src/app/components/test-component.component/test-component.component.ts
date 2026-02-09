// Import required Angular modules including signals
import { Component, OnInit, signal, computed } from '@angular/core';
import { ErrorInterceptorService } from '../../services/error-interceptor.service';
import { OpenRouterService } from '../../services/open-router.service';
import { CommonModule } from '@angular/common';

// Component decorator
@Component({
  selector: 'app-test-component',
  imports: [CommonModule],
  standalone: true,
  templateUrl: './test-component.component.html',
  styleUrl: './test-component.component.css',
})
export class TestComponentComponent implements OnInit {
  
  // Using signals for reactive state management
  // Current error signal
  currentError = signal<any>(null);
  
  // AI solution signal
  aiSolution = signal<any>(null);
  
  // Loading state signal
  isProcessing = signal<boolean>(false);
  
  // Error history signal
  errorHistory = signal<any[]>([]);
  
  // Statistics signals
  totalErrors = signal<number>(0);
  aiFixes = signal<number>(0);
  
  // Computed signal for success rate (auto-updates when totalErrors or aiFixes change)
  successRate = computed(() => {
    const total = this.totalErrors();
    const fixes = this.aiFixes();
    return total > 0 ? Math.round((fixes / total) * 100) : 0;
  });
  
  // Component state (can be regular object since it's just for display)
  componentState = {
    initialized: true,
    lastError: null,
    testVariable: undefined
  };
  
  // Constructor - inject services
  constructor(
    private errorInterceptor: ErrorInterceptorService,
    private openRouterService: OpenRouterService
  ) {}
  
  // Lifecycle hook
  ngOnInit() {
    console.log('Test component loaded. AI Auto-Coder is active.');
  }
  
// Method to simulate template error
generateTemplateError() {
  // Create error object
  const error = {
    type: 'Template Error',
    message: "NG0303: Can't bind to 'undefinedDirective' since it isn't a known property of 'div'",
    timestamp: new Date()
  };
  
  const errorMessage = "NG0303: Can't bind to 'undefinedDirective' since it isn't a known property of 'div'";
  const codeContext = "at TestComponent.template (test.component.html:15:3)";
  
  // Update signals immediately - UI updates automatically
  this.currentError.set(error);
  this.addToHistory(error);
  this.aiSolution.set(null);
  this.isProcessing.set(true);  // Show loader
  
  // Add minimum delay to show loader (300ms)
  const startTime = Date.now();
  
  // Call AI service
  this.openRouterService.fixError(errorMessage, codeContext)
    .subscribe({
      next: (response) => {
        console.log('AI Response received:', response);
        
        // Extract solution from nested response structure
        let solutionText = '';
        let fixedCode = '';
        
        // Try multiple paths to get the solution
        if (response?.data?.rawResponse?.choices?.[0]?.message?.content) {
          // Path 1: From rawResponse
          solutionText = response.data.rawResponse.choices[0].message.content;
        } else if (response?.data?.fixedCode) {
          // Path 2: From fixedCode
          fixedCode = response.data.fixedCode;
          solutionText = 'AI has generated a fix for your error.';
        } else if (response?.solution) {
          // Path 3: Direct solution
          solutionText = response.solution;
        } else {
          // Fallback
          solutionText = 'AI response received but format is unexpected.';
        }
        
        // Calculate remaining time to show loader
        const elapsedTime = Date.now() - startTime;
        const minimumDelay = 300; // Show loader for at least 300ms
        const remainingTime = Math.max(0, minimumDelay - elapsedTime);
        
        // Wait for remaining time, then show solution
        setTimeout(() => {
          this.showAISolution({
            status: 'Solved',
            solution: solutionText,
            code: fixedCode || this.extractCode(solutionText),
            confidence: 95,
            rawResponse: response // Store full response for debugging
          });
          
          this.isProcessing.set(false);  // Hide loader
        }, remainingTime);
      },
      error: (err) => {
        console.error('AI service error:', err);
        
        // Show error message
        this.aiSolution.set({
          status: 'Error',
          solution: 'Failed to get AI solution. Please try again.',
          confidence: 0
        });
        
        this.isProcessing.set(false);
      }
    });
}

// Method to simulate reference error
generateReferenceError() {
  const error = {
    type: 'Reference Error',
    message: 'ReferenceError: userData is not defined',
    timestamp: new Date()
  };
  
  const errorMessage = 'ReferenceError: userData is not defined';
  const codeContext = 'at TestComponent.ngOnInit (test.component.ts:18:5)';
  
  // Update signals
  this.currentError.set(error);
  this.addToHistory(error);
  this.aiSolution.set(null);
  this.isProcessing.set(true);
  
  // Add minimum delay
  const startTime = Date.now();
  
  // Call AI service
  this.openRouterService.fixError(errorMessage, codeContext)
    .subscribe({
      next: (response) => {
        console.log('AI Response received:', response);
        
        // Extract solution from nested response structure
        let solutionText = '';
        let fixedCode = '';
        
        if (response?.data?.rawResponse?.choices?.[0]?.message?.content) {
          solutionText = response.data.rawResponse.choices[0].message.content;
        } else if (response?.data?.fixedCode) {
          fixedCode = response.data.fixedCode;
          solutionText = 'AI has generated a fix for your error.';
        } else if (response?.solution) {
          solutionText = response.solution;
        } else {
          solutionText = 'AI response received but format is unexpected.';
        }
        
        const elapsedTime = Date.now() - startTime;
        const remainingTime = Math.max(0, 300 - elapsedTime);
        
        setTimeout(() => {
          this.showAISolution({
            status: 'Solved',
            solution: solutionText,
            code: fixedCode || this.extractCode(solutionText),
            confidence: 92,
            rawResponse: response
          });
          
          this.isProcessing.set(false);
        }, remainingTime);
      },
      error: (err) => {
        console.error('AI service error:', err);
        this.aiSolution.set({
          status: 'Error',
          solution: 'Failed to get AI solution. Please try again.',
          confidence: 0
        });
        this.isProcessing.set(false);
      }
    });
}

  // Test valid code
  testValidCode() {
    console.log('✓ Valid code executed successfully');
    
    // Clear signals
    this.currentError.set(null);
    this.aiSolution.set(null);
    this.isProcessing.set(false);
  }
  
  // Add error to history
  private addToHistory(error: any) {
    // Get current history and add new error
    const currentHistory = this.errorHistory();
    this.errorHistory.set([
      { ...error, fixed: false },
      ...currentHistory
    ]);
    
    // Update total errors count
    this.totalErrors.update(count => count + 1);
  }
  
  // Display AI solution
  private showAISolution(solution: any) {
    // Set AI solution signal
    this.aiSolution.set(solution);
    
    // Mark last error as fixed in history
    const history = this.errorHistory();
    if (history.length > 0) {
      const updatedHistory = [...history];
      updatedHistory[0] = { ...updatedHistory[0], fixed: true };
      this.errorHistory.set(updatedHistory);
    }
    
    // Update AI fixes count
    this.aiFixes.update(count => count + 1);
  }
  
  // Extract code block from AI response
  private extractCode(solution: string): string {
    if (!solution) return '';
    
    // Look for code blocks in markdown format
    const codeMatch = solution.match(/```[\s\S]*?```/);
    if (codeMatch) {
      return codeMatch[0].replace(/```\w*\n?/g, '').trim();
    }
    return '';
  }
  
  // Copy solution to clipboard
  copySolution() {
    const solution = this.aiSolution();
    
    if (solution?.code) {
      navigator.clipboard.writeText(solution.code);
      alert('Code copied to clipboard!');
    } else if (solution?.solution) {
      navigator.clipboard.writeText(solution.solution);
      alert('Solution copied to clipboard!');
    }
  }
}