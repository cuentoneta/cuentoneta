import { Component } from '@angular/core';
import { inject } from '@vercel/analytics';
import { environment } from './environments/environment';
@Component({
  selector: 'cuentoneta-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent {
  constructor() {
    // Importa y configura el paquete de analytics de Vercel
    inject({
      mode: environment.environment === 'production' ? 'production' : 'development',
    });
  }
}
