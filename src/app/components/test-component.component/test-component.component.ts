import { Component, OnInit } from '@angular/core';
import { ErrorInterceptorService } from '../../services/error-interceptor.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-test-component',
  imports: [CommonModule],
  standalone: true,
  templateUrl: './test-component.component.html',
  styleUrl: './test-component.component.css',
})
export class TestComponentComponent implements OnInit {
  componentState = {
    initialized: true,
    lastError: null,
    testVariable: undefined
  };
  
  constructor(private errorInterceptor: ErrorInterceptorService) {}
  
  ngOnInit() {
    console.log('Test component loaded. AI Auto-Coder is active.');
  }
  
  generateTemplateError() {
    console.error('ERROR Error: NG0303: Can\'t bind to \'undefinedDirective\' since it isn\'t a known property of \'div\'.');
    console.error('Template parse errors:');
    console.error('Property binding undefinedDirective not used by any directive on an embedded template.');
  }
  
  generateTypeError() {
    console.error('TypeError: Cannot read properties of undefined (reading \'name\')');
    console.error('at TestComponent.getUserName (test.component.ts:25:15)');
  }
  
  generateReferenceError() {
    console.error('ReferenceError: userData is not defined');
    console.error('at TestComponent.ngOnInit (test.component.ts:18:5)');
  }
  
  testValidCode() {
    console.log('✓ Valid code executed successfully');
  }
}
