// Core
import { Component, Input, OnInit } from '@angular/core';
import { NgOptimizedImage, NgIf, CommonModule } from '@angular/common';

// Modelos
import { Resource } from '@models/resource.model';
import { Story } from '@models/story.model';

// Componentes
import { ResourceComponent } from '../resource/resource.component';
import { PortableTextParserComponent } from '../portable-text-parser/portable-text-parser.component';

@Component({
	selector: 'cuentoneta-bio-summary-card',
	template: `
		<div class="border-1 border-solid border-gray-200 bg-gray-100 p-6 rounded">
			@if (story.author) {
				<section class="grid mb-4 sm:mb-8 gap-4 grid-cols-[64px_1fr] sm:grid-cols-[64px_1fr_1fr]">
					<img
						[alt]="'Retrato de ' + story.author.name"
						[ngSrc]="story.author.imageUrl + '?h=64&w=64'"
						class="rounded-md"
						width="64"
						height="64"
					/>
					<div class="flex flex-col justify-center">
						<p class="inter-body-lg-semibold">{{ story.author.name }}</p>
						<div class="flex items-center gap-2 inter-body-base-medium text-gray-700">
							<img
								[alt]="'Bandera de ' + story.author.nationality.country"
								[ngSrc]="story.author.nationality.flag + '?w=20&h=15'"
								class="rounded w-[20px] h-[15px]"
								width="20"
								height="15"
							/>
							<span>{{ story.author.nationality.country }}</span>
						</div>
					</div>

					@if (resources.length > 0) {
						<div class="flex justify-start sm:justify-end gap-4 xs-max:col-start-1 xs-max:col-end-3">
							@for (resource of resources; track $index) {
								<cuentoneta-resource [resource]="resource"></cuentoneta-resource>
							}
						</div>
					}
				</section>
				<section [lang]="story.language" class="inter-body-base-regular text-gray-700">
					@if (!!story.author.biography) {
						<cuentoneta-portable-text-parser
							[paragraphs]="story.author.biography"
							class="hidden sm:source-serif-pro-body-base sm:text-ellipsis sm:relative sm:text-justify sm:min-h-18 sm:line-clamp-3"
						></cuentoneta-portable-text-parser>
					}

					<cuentoneta-portable-text-parser
						[paragraphs]="story.summary"
						class="hidden sm:source-serif-pro-body-base sm:text-ellipsis sm:relative sm:text-justify sm:min-h-18 sm:line-clamp-3"
					></cuentoneta-portable-text-parser>
				</section>
			}
		</div>
	`,
	standalone: true,
	imports: [CommonModule, NgOptimizedImage, NgIf, ResourceComponent, PortableTextParserComponent],
})
export class BioSummaryCardComponent implements OnInit {
	@Input({ required: true }) story!: Story;

	public resources: Resource[] = [];

	ngOnInit() {
		this.resources = [...(this.story.resources ?? []), ...(this.story.author.resources ?? [])];
	}
}
