import { Component, inject, input, OnInit } from '@angular/core';
import { SharingPlatform } from '@models/sharing-platform';
import { TooltipDirective } from '../../directives/tooltip.directive';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { faBrandFacebook, faBrandWhatsapp, faBrandXTwitter } from '@ng-icons/font-awesome/brands';

@Component({
	selector: 'cuentoneta-share-button',
	imports: [NgIcon],
	providers: [provideIcons({ faBrandFacebook, faBrandWhatsapp, faBrandXTwitter })],
	hostDirectives: [TooltipDirective],
	template: ` @if (platform(); as platform) {
		<button
			(click)="onShareToPlatformClicked($event, platform)"
			class="flex h-12 w-12 items-center justify-center gap-3 rounded-full border-1 border-solid border-gray-200 bg-gray-100 hover:bg-gray-200"
		>
			<ng-icon [name]="platform.icon" size="24px" />
		</button>
	}`,
})
export class ShareButtonComponent implements OnInit {
	readonly platform = input.required<SharingPlatform>();
	readonly params = input<{ [key: string]: string }>({});
	readonly message = input<string>('');
	readonly route = input<string>('');

	onShareToPlatformClicked(event: MouseEvent | KeyboardEvent, platform: SharingPlatform) {
		const urlParams = Object.keys(this.params())
			.map((key) => `${key}=${this.params()[key]}`)
			.join('&');
		window.open(
			platform.generateSharingUrl(this.route(), urlParams, this.message()),
			platform.target,
			platform.features,
		);
	}

	private tooltipDirective = inject(TooltipDirective);

	ngOnInit() {
		this.tooltipDirective.text.set('Compartir en ' + this.platform().name);
		this.tooltipDirective.position.set('bottom');
	}
}
