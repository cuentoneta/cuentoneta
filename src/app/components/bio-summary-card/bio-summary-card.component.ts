// Core
import { Component, input, OnInit } from '@angular/core';
import { NgOptimizedImage, NgIf, CommonModule } from '@angular/common';

// Modelos
import { Resource } from '@models/resource.model';
import { Story } from '@models/story.model';

// Componentes
import { ResourceComponent } from '../resource/resource.component';
import { PortableTextParserComponent } from '../portable-text-parser/portable-text-parser.component';
import { RouterLink } from '@angular/router';
import { AppRoutes } from '../../app.routes';

@Component({
	selector: 'cuentoneta-bio-summary-card',
	template: `
		<div class="rounded border-1 border-solid border-gray-200 bg-gray-100 p-6">
			@if (story().author) {
				<section class="mb-4 grid grid-cols-[1fr] gap-4 sm:mb-8 sm:grid-cols-[auto_1fr]">
					<a [routerLink]="['/', appRoutes.Author, story().author.slug]" class="grid grid-cols-[64px_1fr] gap-4">
						<img
							[alt]="'Retrato de ' + story().author.name"
							[ngSrc]="story().author.imageUrl + '?h=64&w=64'"
							class="rounded-md"
							width="64"
							height="64"
						/>
						<div class="flex flex-col justify-center">
							<p class="inter-body-lg-semibold">{{ story().author.name }}</p>
							<div class="inter-body-base-medium flex items-center gap-2 text-gray-700">
								<img
									[alt]="'Bandera de ' + story().author.nationality.country"
									[ngSrc]="story().author.nationality.flag + '?w=20&h=15'"
									class="h-[15px] w-[20px] rounded"
									width="20"
									height="15"
								/>
								<span>{{ story().author.nationality.country }}</span>
							</div>
						</div>
					</a>

					@if (resources.length > 0) {
						<div class="xs-max:col-start-1 xs-max:col-end-3 flex justify-start gap-4 sm:justify-end">
							@for (resource of resources; track $index) {
								<cuentoneta-resource [resource]="resource"></cuentoneta-resource>
							}
						</div>
					}
				</section>
				<section [lang]="story().language" class="inter-body-base-regular text-gray-700">
					@if (story().author.biography) {
						<cuentoneta-portable-text-parser
							[paragraphs]="story().author.biography"
							[classes]="'mb-4'"
						></cuentoneta-portable-text-parser>
					}

					<cuentoneta-portable-text-parser
						[paragraphs]="story().summary"
						[classes]="'mb-4 last:mb-0'"
					></cuentoneta-portable-text-parser>
				</section>
			}
		</div>
	`,
	standalone: true,
	imports: [CommonModule, NgOptimizedImage, NgIf, ResourceComponent, PortableTextParserComponent, RouterLink],
})
export class BioSummaryCardComponent implements OnInit {
	story = input.required<Story>();

	public resources: Resource[] = [];
	protected readonly appRoutes = AppRoutes;

	ngOnInit() {
		const story = this.story();
		this.resources = [...(story.resources ?? []), ...(story.author.resources ?? [])];
	}
}
