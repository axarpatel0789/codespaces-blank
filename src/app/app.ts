import { Component, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { TestComponentComponent } from './components/test-component.component/test-component.component';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, TestComponentComponent],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App {
  protected readonly title = signal('new-app');
}
