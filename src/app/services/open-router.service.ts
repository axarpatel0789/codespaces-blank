import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { catchError } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class OpenRouterService {
  // Change this to your actual backend URL
  private backendUrl = 'https://stunning-doodle-97gqp4jwwq95cjj9-3000.app.github.dev/api';

  constructor(private http: HttpClient) {
    this.testConnection();
  }

  fixError(error: string, codeContext: string): Observable<any> {
    return this.http.post(`${this.backendUrl}/fix-error`, {
      error: error,
      codeContext: codeContext
    }).pipe(
      catchError(err => {
        console.log('Backend error, using fallback');
        return of({
          success: false,
          solution: this.getFallback(error)
        });
      })
    );
  }

  testConnection() {
    this.http.get(`${this.backendUrl}/health`)
      .subscribe({
        next: () => console.log('✅ Backend connected'),
        error: () => console.log('❌ Backend not connected')
      });
  }

  private getFallback(error: string): string {
    if (error.includes('Cannot read')) return 'Use: obj?.property or check if obj exists';
    if (error.includes('undefined')) return 'Initialize variable: let x = value;';
    if (error.includes('NullInjector')) return 'Add service to providers array in module';
    if (error.includes('TypeError')) return 'Check variable types before operations';
    return 'Review error in browser console';
  }
}