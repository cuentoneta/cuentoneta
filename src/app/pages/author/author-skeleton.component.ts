import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RepeatPipe } from '../../pipes/repeat.pipe';
import { StoryCardSkeletonComponent } from '../../components/story-card-skeleton/story-card-skeleton.component';
import { NgxSkeletonLoaderModule } from 'ngx-skeleton-loader';
import { ThemeService } from '../../providers/theme.service';

@Component({
	selector: 'cuentoneta-author-skeleton',
	imports: [CommonModule, RepeatPipe, StoryCardSkeletonComponent, NgxSkeletonLoaderModule],
	template: `
		<section class="flex flex-col items-center justify-center gap-4">
			<ngx-skeleton-loader
				[theme]="{
					'height.px': 192,
					'width.px': 192,
					'background-color': skeletonColor
				}"
				count="1"
				appearance="line"
			></ngx-skeleton-loader>
			<div class="flex items-center gap-4">
				<ngx-skeleton-loader
					[theme]="{
						'height.px': 40,
						'width.px': 320,
						'margin.px': 0,
						'background-color': skeletonColor
					}"
					count="1"
					appearance="line"
				></ngx-skeleton-loader>
				<ngx-skeleton-loader
					[theme]="{
						'height.px': 40,
						'width.px': 40,
						'margin.px': 0,
						'background-color': skeletonColor
					}"
					count="1"
					appearance="line"
				></ngx-skeleton-loader>
			</div>
			<div class="flex justify-start gap-4 sm:justify-end">
				@for (item of 3 | repeat; track $index) {
					<ngx-skeleton-loader
						[theme]="{
							'height.px': 48,
							'width.px': 48,
							'margin.px': 0,
							'background-color': skeletonColor
						}"
						count="1"
						appearance="circle"
					></ngx-skeleton-loader>
				}
			</div>
			<ngx-skeleton-loader
				[theme]="{
					'height.px': 20,
					'width.px': 768,
					'background-color': skeletonColor
				}"
				class="max-width-[960px] flex flex-col"
				count="6"
			></ngx-skeleton-loader>
		</section>
		<section class="grid grid-cols-1 gap-4 sm:grid-cols-2 md:gap-8">
			@for (item of 6 | repeat; track $index) {
				<cuentoneta-story-card-skeleton [animation]="'progress'" [displayFooter]="false" />
			}
		</section>
	`,
	styles: `
		:host {
			@apply grid grid-cols-1 gap-8;
		}
	`,
})
export class AuthorSkeletonComponent {
	private themeService = inject(ThemeService);
	skeletonColor = this.themeService.pickColor('zinc', 300);
}
