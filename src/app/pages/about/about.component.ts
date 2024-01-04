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

  readonly programmers = [
    {
      name: "Erik Giovani",
      url: "https://github.com/erikgiovani",
      username: "@ErikGiovani"
    },
    {
      name: "Juan Blas Tschopp",
      url: "https://twitter.com/juanblas09",
      username: "@juanblas09"
    },
    {
      name: "Diego Franchina",
      url: "https://github.com/SoyDiego",
      username: "@SoyDiego"
    },
    {
      name: "Jimer Espinoza",
      url: "https://twitter.com/JimerSamuel",
      username: "@JimerSamuel"
    },
    {
      name: "Soledad Sasia",
      url: "https://github.com/SoleSasia",
      username: "@SoleSasia"
    },
    {
      name: "Mia Ramos",
      url: "https://github.com/MiaFate",
      username: "@MiaFate"
    },
    {
      name: "Wilson Lasso",
      url: "https://github.com/wilago",
      username: "@wilago"
    },
    {
      name: "Gustavo Petruzzi",
      url: "https://github.com/gustavoPetruzzi",
      username: "@gustavoPetruzzi"
    }
  ]
}
