import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class OpenRouterService {
  // API key is now stored securely in Node.js backend (.env file)
  // No longer exposed to frontend
  private backendUrl = 'https://stunning-doodle-97gqp4jwwq95cjj9-3000.app.github.dev/api';

  constructor(private http: HttpClient) {}

  fixError(error: string, codeContext: string): Observable<any> {
    // Headers no longer need Authorization - backend handles API key
    const headers = new HttpHeaders({
      'Content-Type': 'application/json'
    });

    const body = {
      error: error,
      codeContext: codeContext
    };

    // Call Node.js backend proxy instead of OpenRouter directly
    return this.http.post(`${this.backendUrl}/fix-error`, body, { headers });
  }
}

