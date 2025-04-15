import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';
import { HeaderComponent } from '../components/header/header.component';
import { NavbarComponent } from '../components/navbar/navbar.component';

@Component({
  selector: 'app-main-content',
  standalone: true,
  imports: [HeaderComponent, NavbarComponent, RouterModule],
  templateUrl: './main-content.component.html',
  styleUrl: './main-content.component.scss'
})
export class MainContentComponent {
}
