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
		class="flex flex-row items-center hover:cursor-pointer"
	>
		<img
			[alt]="'Retrato de ' + author().name"
			[ngSrc]="authorImageUrl()"
			class="mr-3 h-10 w-10 rounded"
			width="40"
			height="40"
		/>
		<div class="block hover:!cursor-pointer">
			<label class="inter-body-base-semibold hover:!cursor-pointer">{{ author().name }}</label>
			@if (author().nationality; as nationality) {
				<div class="flex items-center">
					<img
						[alt]="'Bandera de ' + nationality.country"
						[ngSrc]="nationality.flag"
						class="h-[15px] w-[20px] rounded"
						width="20"
						height="15"
					/>
					<label class="inter-body-sm-semibold ml-2 text-gray-500 hover:!cursor-pointer">{{
						nationality.country
					}}</label>
				</div>
			}
		</div>
	</a>`,
})
export class AuthorTeaserComponent {
	author = input.required<Omit<Author, 'biography'>>();
	authorImageUrl = computed(() => this.author().imageUrl ?? 'assets/img/default-avatar.jpg');

	protected readonly appRoutes = AppRoutes;
}
