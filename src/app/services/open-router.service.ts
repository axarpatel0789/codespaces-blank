import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class OpenRouterService {
  private apiKey = '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'; // Replace with your actual key
  private apiUrl = 'https://openrouter.ai/api/v1/chat/completions';

  constructor(private http: HttpClient) {}

  fixError(error: string, codeContext: string): Observable<any> {
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${this.apiKey}`,
      'Content-Type': 'application/json',
      'HTTP-Referer': 'http://localhost:4200', // Required for some OpenRouter endpoints
      'X-Title': 'Angular AI Auto-Coder'
    });

    const body = {
      model: "openai/gpt-5.2",
      messages: [
        {
          role: "system",
          content: "You are an expert Angular developer. Analyze the error and provide the exact fixed code only. No explanations."
        },
        {
          role: "user",
          content: `Angular Error: ${error}\n\nFix the following Angular code:\n${codeContext}`
        }
      ],
      max_tokens: 300
    };

    return this.http.post(this.apiUrl, body, { headers });
  }
}