import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Author } from 'src/app/models/author.model';

@Component({
  selector: 'cuentoneta-dmca',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './dmca.component.html',
  styleUrls: ['./dmca.component.scss'],
})
export class DmcaComponent {
  public linksList: OriginalLink[] = [];

  
  
}

export interface OriginalLink {
  author: Author;
  day: number;
  originalLink: string;
  title: string;
}
