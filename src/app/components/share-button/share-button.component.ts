import {
	Component,
	computed,
	createEnvironmentInjector,
	effect,
	EnvironmentInjector,
	inject,
	input,
	ChangeDetectionStrategy,
} from '@angular/core';
import { SharingPlatform } from '@models/sharing-platform';
import { TooltipDirective } from '../../directives/tooltip.directive';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { NgComponentOutlet } from '@angular/common';

@Component({
	selector: 'cuentoneta-share-button',
	imports: [NgComponentOutlet],
	hostDirectives: [TooltipDirective],
	changeDetection: ChangeDetectionStrategy.OnPush,
	template: ` @if (platform(); as platform) {
		<button
			(click)="onShareToPlatformClicked($event, platform)"
			[attr.aria-label]="platform.name"
			[attr.data-testid]="icon()?.name"
			class="flex h-12 w-12 items-center justify-center gap-3 rounded-full border-1 border-solid border-neutral-200 bg-neutral-100 hover:bg-neutral-200"
		>
			@if (icon(); as icon) {
				<ng-container *ngComponentOutlet="NgIcon; inputs: { name: icon.name, size: '24px' }; injector: icon.injector" />
			}
		</button>
	}`,
})
export class ShareButtonComponent {
	public readonly platform = input.required<SharingPlatform>();
	public readonly params = input<{ [key: string]: string }>({});
	public readonly message = input<string>('');
	public readonly route = input<string>('');

	protected readonly NgIcon = NgIcon;

	private tooltipDirective = inject(TooltipDirective);
	private injector = inject(EnvironmentInjector);

	private readonly syncTooltipEffect = effect(() => {
		this.tooltipDirective.text.set('Compartir en ' + this.platform().name);
		this.tooltipDirective.position.set('bottom');
	});

	protected readonly icon = computed(() => {
		const platform = this.platform();

		if (!platform) {
			return null;
		}

		return {
			name: Object.keys(platform.icon)[0],
			injector: createEnvironmentInjector([provideIcons(platform.icon)], this.injector),
		};
	});

	protected onShareToPlatformClicked(event: MouseEvent | KeyboardEvent, platform: SharingPlatform) {
		const urlParams = Object.keys(this.params())
			.map((key) => `${key}=${this.params()[key]}`)
			.join('&');
		window.open(
			platform.generateSharingUrl(this.route(), urlParams, this.message()),
			platform.target,
			platform.features,
		);
	}
}
