import { Component } from '@angular/core';
import { Location } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-help',
  imports: [MatIconModule],
  templateUrl: './help.component.html',
  styleUrl: './help.component.scss'
})
export class HelpComponent {
  constructor(private location: Location) {}

  goBack() {
    this.location.back();
  }
}
