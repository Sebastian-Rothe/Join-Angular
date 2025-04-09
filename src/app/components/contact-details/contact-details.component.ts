import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { User } from '../../models/user.class';

@Component({
  selector: 'app-contact-details',
  standalone: true,
  imports: [CommonModule, MatIconModule],
  templateUrl: './contact-details.component.html',
  styleUrls: ['./contact-details.component.scss']
})
export class ContactDetailsComponent {
  @Input() contact: User | null = null;
  @Input() isMobileView = false;
}
