import { Component, OnInit, signal } from '@angular/core';
import { UserService } from '../../services/user-service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-user-component',
  imports: [CommonModule],
  templateUrl: './user-component.html',
  styleUrl: './user-component.css',
})
export class UserComponent implements OnInit {

  users= signal<any[]>([]);
  constructor(private userService: UserService) { }

  ngOnInit(): void {
    this.userService.getUserData().subscribe({
      next: (data: any) => {
          this.users.set(data);
        console.log('User data loaded:', data);
      },
      error: (err) => {
        console.error('Error loading user data:', err);
      }
    }
    );
  }

}
