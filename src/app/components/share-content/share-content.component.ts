import { Component, Input } from '@angular/core';
import { CommonModule, NgOptimizedImage } from '@angular/common';
import { StoryList } from '../../models/storylist.model';
import { Story } from '../../models/story.model';

@Component({
  selector: 'cuentoneta-share-content',
  standalone: true,
  imports: [CommonModule, NgOptimizedImage],
  templateUrl: './share-content.component.html',
  styleUrls: ['./share-content.component.scss'],
})
export class ShareContentComponent {
  @Input() content!: Story | StoryList;
  platforms: SharingPlatform[] = [
    {
      name: 'Facebook',
      logo: 'facebook',
      url: `https://www.facebook.com/share.php?u=${encodeURIComponent(
        `https://www.cuentoneta.ar`
      )}`,
      content: 'abc',
      target: 'facebook-share-dialog',
      features: 'width=626,height=436',
    },
    {
      name: 'Whatsapp',
      logo: 'whatsapp',
      target: '_blank',
      content: 'Sumate a La Cuentoneta',
      url: `https://wa.me?text=${'Sumate a La Cuentoneta: https://www.cuentoneta.ar'}`,
    },
    {
      name: 'Twitter',
      logo: 'twitter',
      content: 'Sumate a La Cuentoneta',
      url: `https://twitter.com/intent/tweet?&text=${'Sumate a La Cuentoneta: https://www.cuentoneta.ar'}`,
    },
    {
      name: 'Instagram',
      logo: 'instagram',
      url: 'https://instagram.com',
      content: 'abc',
    },
    {
      name: 'Copiar Hipervínculo al Portapapeles',
      logo: 'copy-link',
      url: 'copy',
      content: 'abc',
    },
  ];

  onShareToPlatformClicked(
    event: MouseEvent | KeyboardEvent,
    platform: SharingPlatform
  ) {
    window.open(platform.url, platform.target, platform.features);
  }
}

interface SharingPlatform {
  name: string;
  logo: string;
  url: string;
  target?: string;
  features?: string;
  content: string;
}
