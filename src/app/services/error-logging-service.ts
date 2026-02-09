// Import required modules
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

// Service to log errors to backend
@Injectable({
  providedIn: 'root'
})
export class ErrorLoggingService {
  
  // Backend API endpoint for storing errors
  private apiUrl = 'http://localhost:3000/api/errors';
  
  constructor(private http: HttpClient) {}
  
  // Method to send error log to backend
  // Parameters:
  //   errorType: 'frontend' or 'backend'
  //   errorMessage: The error message
  //   errorStack: Stack trace or context
  //   aiSolution: Solution provided by AI
  //   component: Which component/file had the error
  logError(errorData: {
    errorType: 'frontend' | 'backend';
    errorMessage: string;
    errorStack?: string;
    aiSolution?: string;
    component?: string;
    timestamp?: Date;
  }): Observable<any> {
    
    // Prepare error log object
    const logEntry = {
      ...errorData,
      timestamp: errorData.timestamp || new Date(),
      userAgent: navigator.userAgent,  // Browser info
      url: window.location.href         // Current page URL
    };
    
    console.log('Logging error to backend:', logEntry);
    
    // Send POST request to backend
    return this.http.post(`${this.apiUrl}/log`, logEntry);
  }
  
  // Method to get all logged errors from backend
  getErrorLogs(): Observable<any> {
    return this.http.get(`${this.apiUrl}/logs`);
  }
  
  // Method to get error statistics
  getErrorStats(): Observable<any> {
    return this.http.get(`${this.apiUrl}/stats`);
  }
}