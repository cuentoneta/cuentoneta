import { Component } from '@angular/core';
import { CommonModule, NgOptimizedImage } from '@angular/common';

@Component({
  selector: 'cuentoneta-about',
  standalone: true,
  imports: [CommonModule, NgOptimizedImage],
  templateUrl: './about.component.html',
  styleUrls: ['./about.component.scss'],
})
export class AboutComponent {
  readonly links = {
    CONTRIBUTING: 'https://github.com/rolivencia/cuentoneta/blob/master/CONTRIBUTING.md',
    GITHUB_REPO: 'https://github.com/rolivencia/cuentoneta',
    FACEBOOK: 'https://facebook.com/lacuentoneta',
    INSTAGRAM: 'https://instagram.com/cuentoneta',
    TWITTER: 'https://twitter.com/cuentoneta',
    DISCORD_CHANNEL: 'https://discord.com/channels/594363964499165194/1109220285841944586',
    DISCORD_SERVER: 'https://discord.com/invite/frontendcafe',
    FIGMA: 'https://www.figma.com/file/BIlQ6U3eh3M8vtYQt3vLNW/La-Cuentoneta-v2',
    GITHUB_CONTRIBUTORS: 'https://github.com/rolivencia/cuentoneta/tree/master#contribuyentes'
  };
}
