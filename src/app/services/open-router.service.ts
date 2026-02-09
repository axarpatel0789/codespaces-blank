// Import necessary Angular modules
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { catchError } from 'rxjs/operators';

// Service decorator - makes this available throughout the app
@Injectable({
  providedIn: 'root'  // Singleton service - only one instance in entire app
})
export class OpenRouterService {
  
  // Backend server URL where we send errors for AI processing
  // Change this to match your Node.js backend server address
  private backendUrl = 'http://localhost:3000/api';

  // Constructor - runs when service is created
  // Inject HttpClient to make HTTP requests to backend
  constructor(private http: HttpClient) {
    // Test if backend is running when service starts
    this.testConnection();
  }

  // Method to send error to backend and get AI fix suggestion
  // Parameters:
  //   error: The error message from console
  //   codeContext: Stack trace or code location where error occurred
  // Returns: Observable with AI solution
  fixError(error: string, codeContext: string): Observable<any> {
    // Make POST request to backend with error details
    return this.http.post(`${this.backendUrl}/fix-error`, {
      error: error,           // The error message
      codeContext: codeContext // Stack trace for context
    }).pipe(
      // If backend request fails, use fallback solution
      catchError(err => {
        console.log('Backend error, using fallback');
        // Return a basic fix suggestion without AI
        return of({
          success: false,
          solution: this.getFallback(error)
        });
      })
    );
  }

  // Method to check if backend server is running
  testConnection() {
    // Make GET request to health check endpoint
    this.http.get(`${this.backendUrl}/health`)
      .subscribe({
        // If request succeeds, backend is running
        next: () => console.log('Backend connected'),
        // If request fails, backend is not running
        error: () => console.log('Backend not connected')
      });
  }

  // Fallback method when backend is unavailable
  // Provides basic fix suggestions based on error patterns
  // Parameter: error message string
  // Returns: Simple fix suggestion
  private getFallback(error: string): string {
    // Check for common error patterns and return appropriate fix
    
    // If error is about reading properties of null/undefined
    if (error.includes('Cannot read')) 
      return 'Use: obj?.property or check if obj exists';
    
    // If error mentions undefined variable
    if (error.includes('undefined')) 
      return 'Initialize variable: let x = value;';
    
    // If error is about missing dependency injection
    if (error.includes('NullInjector')) 
      return 'Add service to providers array in module';
    
    // If error is a type mismatch
    if (error.includes('TypeError')) 
      return 'Check variable types before operations';
    
    // Default fallback if no pattern matches
    return 'Review error in browser console';
  }
}