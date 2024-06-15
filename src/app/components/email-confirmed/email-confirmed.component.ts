import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-email-confirmed',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './email-confirmed.component.html',
  styleUrls: ['./email-confirmed.component.css'],
})
export class EmailConfirmedComponent implements OnInit {
  constructor(
    private authService: AuthService,
    private route: ActivatedRoute
  ) {}

  confirmed = true;

  ngOnInit() {
    const token = this.route.snapshot.paramMap.get('token');
    if (token) {
      this.authService.confirmEmail(token).subscribe({
        next: (data) => {
          this.confirmed = true;
        },
        error: (error) => {
          this.confirmed = false;
        },
      });
    } else {
      this.confirmed = false;
    }
  }
}
