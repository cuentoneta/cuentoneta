import {
	Component,
	computed,
	createEnvironmentInjector,
	EnvironmentInjector,
	inject,
	input,
	OnInit,
} from '@angular/core';
import { SharingPlatform } from '@models/sharing-platform';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { NgComponentOutlet } from '@angular/common';
import { A11yTooltipModule } from '@a11y-ngx/tooltip';

@Component({
	selector: 'cuentoneta-share-button',
	imports: [NgComponentOutlet, A11yTooltipModule],
	template: ` @if (platform(); as platform) {
		<button
			(click)="onShareToPlatformClicked($event, platform)"
			[tooltip]="getShareTooltip(platform)"
			[attr.aria-label]="platform.name"
			[attr.data-testid]="icon()?.name"
			class="flex h-12 w-12 items-center justify-center gap-3 rounded-full border-1 border-solid border-gray-200 bg-gray-100 hover:bg-gray-200"
		>
			@if (icon(); as icon) {
				<ng-container *ngComponentOutlet="NgIcon; inputs: { name: icon.name, size: '24px' }; injector: icon.injector" />
			}
		</button>
	}`,
})
export class ShareButtonComponent {
	readonly platform = input.required<SharingPlatform>();
	readonly params = input<{ [key: string]: string }>({});
	readonly message = input<string>('');
	readonly route = input<string>('');

	readonly NgIcon = NgIcon;

	private injector = inject(EnvironmentInjector);

	readonly icon = computed(() => {
		const platform = this.platform();

		if (!platform) {
			return null;
		}

		return {
			name: Object.keys(platform.icon)[0],
			injector: createEnvironmentInjector([provideIcons(platform.icon)], this.injector),
		};
	});

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

	getShareTooltip(platform: SharingPlatform): string {
		return `Compartir en ${platform.name}`;
	}
}
