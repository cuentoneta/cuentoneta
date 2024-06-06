import { Component, effect, input } from '@angular/core';
import { CommonModule, NgOptimizedImage } from '@angular/common';
import { StoryEditionDateLabelComponent } from '../story-edition-date-label/story-edition-date-label.component';
import { PortableTextParserComponent } from '../portable-text-parser/portable-text-parser.component';
import { StoryCard } from '@models/story.model';
import { APP_ROUTE_TREE } from '../../app.routes';
import { PRIMARY_OUTLET, RouterLink, UrlTree } from '@angular/router';

@Component({
	selector: 'cuentoneta-story-card-content',
	standalone: true,
	imports: [CommonModule, StoryEditionDateLabelComponent, PortableTextParserComponent, NgOptimizedImage, RouterLink],
	template: `
		<ng-template #resources>
			@for (mediaResource of story().media; track $index) {
				@switch (mediaResource.type) {
					@case ('audioRecording') {
						<div [title]="'Contiene material en formato audio'" class="h-8 w-8">
							<img [alt]="'Contiene audio'" src="assets/svg/waveform.svg" />
						</div>
					}
					@case ('spaceRecording') {
						<div [title]="'Contiene material en formato Spaces de X'" class="h-8 w-8">
							<img [alt]="'Contiene link a Spaces'" src="assets/svg/twitter.svg" />
						</div>
					}
					@case ('youTubeVideo') {
						<div [title]="'Contiene material audiovisual'" class="h-8 w-8">
							<img [alt]="'Contiene video'" class="video" src="assets/svg/video.svg" />
						</div>
					}
				}
			}
		</ng-template>
		<a
			[routerLink]="['/', appRouteTree['STORY'], story().slug]"
			[queryParams]="navigationLink()?.queryParams"
			class="mb-2 flex flex-col gap-2 md:mb-4 md:gap-4"
		>
			<header [lang]="story().language" class="card-header">
				@if (headerText()) {
					<cuentoneta-story-edition-date-label [label]="headerText()" />
				}
			</header>
			<section [lang]="story().language">
				<h1 class="inter-body-xl-bold mb-1 overflow-hidden text-ellipsis whitespace-nowrap">{{ story().title }}</h1>
				<cuentoneta-portable-text-parser
					[type]="'span'"
					[paragraphs]="story().paragraphs"
					class="sm:source-serif-pro-body-base hidden sm:relative sm:line-clamp-3 sm:min-h-18 sm:text-ellipsis sm:text-justify"
				></cuentoneta-portable-text-parser>
			</section>
			<div class="flex h-4 items-center justify-between">
				<time class="inter-body-xs-semibold font-semibold text-gray-600">
					{{ story().approximateReadingTime }} minutos de lectura
				</time>
				@if (!story().author) {
					<div>
						<ng-container *ngTemplateOutlet="resources"></ng-container>
					</div>
				}
			</div>
		</a>
		@if (story().author) {
			<div class="flex flex-col gap-2 md:gap-4">
				<hr class="text-gray-300" />
				<footer class="flex flex-row items-center justify-between">
					<a
						[routerLink]="['/', appRouteTree['AUTHOR'], story().author.slug]"
						class="flex flex-row items-center hover:cursor-pointer"
					>
						<img
							[alt]="'Retrato de ' + story().author.name"
							[ngSrc]="story().author.imageUrl + '?h=40&w=40'"
							class="mr-3 h-10 w-10 rounded"
							width="40"
							height="40"
						/>
						<div>
							<label class="inter-body-base-semibold">{{ story().author.name }}</label>
							@if (story().author.nationality; as nationality) {
								<div class="flex items-center">
									<img
										[alt]="'Bandera de ' + nationality.country"
										[ngSrc]="nationality.flag + '?w=20&h=15'"
										class="h-[15px] w-[20px] rounded"
										width="20"
										height="15"
									/>
									<label class="inter-body-sm-semibold ml-2 text-gray-500">{{ nationality.country }}</label>
								</div>
							}
						</div>
					</a>
					<ng-container *ngTemplateOutlet="resources"></ng-container>
				</footer>
			</div>
		}
	`,
})
export class StoryCardContentComponent {
	story = input.required<StoryCard>();
	headerText = input<string>();
	navigationLink = input<UrlTree>();

	protected readonly appRouteTree = APP_ROUTE_TREE;
}
