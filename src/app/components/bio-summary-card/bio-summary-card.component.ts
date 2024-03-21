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
	templateUrl: './bio-summary-card.component.html',
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
