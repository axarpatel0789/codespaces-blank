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
  private errorInterceptor = inject(ErrorInterceptorService);
  
  constructor() {
    // Initialize error interceptor on app startup
    this.errorInterceptor.initialize();
  }
}
