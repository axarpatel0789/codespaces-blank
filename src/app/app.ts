import { Component, signal, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { TestComponentComponent } from './components/test-component.component/test-component.component';
import { ErrorInterceptorService } from './services/error-interceptor.service';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, TestComponentComponent],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App {
  protected readonly title = signal('new-app');
  constructor(private ErrorInterceptorService: ErrorInterceptorService) {
    // No need to call initialize() - it auto-runs in constructor
    console.log('App started');
  }

  testError() {
    // This will trigger the error interceptor
    console.error('Test error: Cannot read property "name" of undefined');
  }
}
