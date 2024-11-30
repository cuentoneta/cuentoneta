import { Component, computed, input } from '@angular/core';
import { CommonModule, NgOptimizedImage } from '@angular/common';
import { Author } from '@models/author.model';
import { RouterLink } from '@angular/router';
import { AppRoutes } from '../../app.routes';

@Component({
	selector: 'cuentoneta-author-teaser',
	standalone: true,
	imports: [CommonModule, NgOptimizedImage, RouterLink],
	template: ` <a
		[routerLink]="['/', appRoutes.Author, author().slug]"
		[ngClass]="{
			'gap-3': variant() === 'sm',
			'gap-4': variant() === 'md'
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
				'h-[64px] w-[64px] rounded-md': variant() === 'md'
			}"
		/>
		<div class="block hover:!cursor-pointer">
			<h2
				[ngClass]="{
					'inter-body-base-semibold': variant() === 'sm',
					'inter-body-lg-semibold': variant() === 'md'
				}"
				class="flex items-center hover:!cursor-pointer"
			>
				{{ author().name }}<span class="icon-arrow-right"></span>
			</h2>
			@if (author().nationality; as nationality) {
				<div class="flex items-center gap-2">
					<img
						[alt]="'Bandera de ' + nationality.country"
						[ngSrc]="nationality.flag"
						class="h-[15px] w-[20px] rounded"
						width="20"
						height="15"
					/>
					<span
						[ngClass]="{
							'inter-body-sm-semibold text-gray-500 hover:!cursor-pointer': variant() === 'sm',
							'inter-body-base-medium text-gray-700': variant() === 'md'
						}"
						>{{ nationality.country }}</span
					>
				</div>
			}
		</div>
	</a>`,
})
export class AuthorTeaserComponent {
	author = input.required<Omit<Author, 'biography'>>();
	variant = input<'sm' | 'md'>('sm');

	imageSize = computed(() => (this.variant() === 'sm' ? 40 : 64));

	// Para un mejor scaling, a cargo del browser, se obtiene una imagen del 1.5x el tamaño final renderizado
	authorImageUrl = computed(() =>
		this.author().imageUrl
			? `${this.author().imageUrl}?h=${this.imageSize() * 1.5}&w=${this.imageSize() * 1.5}`
			: 'assets/img/default-avatar.jpg',
	);

	protected readonly appRoutes = AppRoutes;
}
