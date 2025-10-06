import { Component, computed, input } from '@angular/core';
import { CommonModule, NgOptimizedImage } from '@angular/common';
import { Author } from '@models/author.model';
import { RouterLink } from '@angular/router';
import { AppRoutes } from '../../app.routes';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { faSolidArrowRightLong } from '@ng-icons/font-awesome/solid';

@Component({
	selector: 'cuentoneta-author-teaser',
	imports: [CommonModule, NgIcon, NgOptimizedImage, RouterLink],
	providers: [provideIcons({ faSolidArrowRightLong })],
	template: ` <a
		[routerLink]="['/', appRoutes.Author, author().slug]"
		[ngClass]="{
			'gap-3': variant() === 'sm',
			'gap-4': variant() === 'md',
		}"
		class="flex flex-row items-center hover:cursor-pointer"
	>
		<img
			[alt]="'Retrato de ' + author().name"
			[ngSrc]="authorImageUrl()"
			[width]="imageSize()"
			[height]="imageSize()"
			[ngClass]="{
				'h-[40px] w-[40px] rounded': variant() === 'sm',
				'h-[64px] w-[64px] rounded-md': variant() === 'md',
			}"
		/>
		<div class="block hover:!cursor-pointer">
			<h2
				[ngClass]="{
					'inter-body-base-semibold': variant() === 'sm',
					'inter-body-lg-semibold': variant() === 'md',
				}"
				class="flex items-center gap-1 hover:!cursor-pointer"
			>
				{{ author().name }} <ng-icon name="faSolidArrowRightLong" size="16px" />
			</h2>
			@if (author().nationality; as nationality) {
				<div class="flex items-center gap-2">
					<img
						[alt]="'Bandera de ' + nationality.country"
						[ngSrc]="authorFlagUrl()"
						class="h-[15px] w-[20px] rounded"
						width="20"
						height="15"
					/>
					<span
						[ngClass]="{
							'inter-body-sm-semibold text-gray-500 hover:!cursor-pointer': variant() === 'sm',
							'inter-body-base-medium text-gray-700': variant() === 'md',
						}"
						>{{ nationality.country }}</span
					>
				</div>
			}
		</div>
	</a>`,
})
export class AuthorTeaserComponent {
	readonly author = input.required<Omit<Author, 'biography'>>();
	readonly variant = input<'sm' | 'md'>('sm');

	readonly imageSize = computed(() => (this.variant() === 'sm' ? 40 : 64));

	// Para un mejor scaling, a cargo del browser, se obtiene una imagen del 1.5x el tamaño final renderizado
	readonly authorImageUrl = computed(() =>
		this.author().imageUrl
			? `${this.author().imageUrl}?h=${this.imageSize() * 1.5}&w=${this.imageSize() * 1.5}&auto=format`
			: 'assets/img/default-avatar.jpg',
	);

	readonly authorFlagUrl = computed(
		() => `${this.author().nationality.flag}?h=${this.flagImageSize.height}&w=${this.flagImageSize.width}&auto=format`,
	);

	protected readonly appRoutes = AppRoutes;
	private readonly flagImageSize = { width: 32, height: 20 };
}
