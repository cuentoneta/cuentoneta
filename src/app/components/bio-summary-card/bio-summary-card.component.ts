// Core
import { Component, Input, OnInit } from '@angular/core';
import { NgOptimizedImage, NgIf, CommonModule } from '@angular/common';

// Modelos
import { Story } from '@models/story.model';

// Componentes
import { ResourceComponent } from '../resource/resource.component';
import { Resource } from '@models/resource.model';

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
					@for (paragraph of story.author.biography; track $index) {
						<p [innerHTML]="paragraph.text" [ngClass]="paragraph.classes" class="last:mb-0 mb-4"></p>
					}
					@for (paragraph of story.summary; track $index) {
						<p [innerHTML]="paragraph.text" [ngClass]="paragraph.classes" class="last:mb-0 mb-4"></p>
					}
				</section>
			}
		</div>
	`,
	standalone: true,
	imports: [CommonModule, NgOptimizedImage, NgIf, ResourceComponent],
})
export class BioSummaryCardComponent implements OnInit {
	@Input({ required: true }) story!: Story;

	public resources: Resource[] = [];

	ngOnInit() {
		this.resources = [...(this.story.resources ?? []), ...(this.story.author.resources ?? [])];
	}
}
