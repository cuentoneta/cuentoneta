import { Component, inject, input, OnInit } from '@angular/core';
import { CommonModule, NgOptimizedImage } from '@angular/common';
import { SharingPlatform } from '@models/sharing-platform';
import { TooltipDirective } from '../../directives/tooltip.directive';

@Component({
	selector: 'cuentoneta-share-button',
	imports: [CommonModule, NgOptimizedImage],
	hostDirectives: [TooltipDirective],
	template: ` @if (platform(); as platform) {
		<button
			(click)="onShareToPlatformClicked($event, platform)"
			class="flex h-12 w-12 items-center justify-center rounded-full border-1 border-solid border-gray-200 bg-gray-100 hover:bg-gray-200"
		>
			<img
				[alt]="'Compartir en ' + platform.name"
				[ngSrc]="'assets/svg/' + platform.logo + '.svg'"
				[height]="24"
				[width]="24"
				class="m-3 h-6 w-6"
			/>
		</button>
	}`,
})
export class ShareButtonComponent implements OnInit {
	platform = input.required<SharingPlatform>();
	params = input<{ [key: string]: string }>({});
	message = input<string>('');
	route = input<string>('');

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
