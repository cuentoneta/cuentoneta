import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Prologue } from '@models/prologue.model';

@Component({
	selector: 'cuentoneta-story-epigraph',
	standalone: true,
	imports: [CommonModule],
	template: `
		<div class="border-l-3 border-solid border-primary-500 mr-4"></div>
		<div class="flex flex-wrap flex-col items-end justify-end flex-1 source-serif-pro-body-lg text-gray-700">
			<p class="self-baseline">{{ prologue.text }}&nbsp;</p>
			<div class="text-end">
				@if (prologue.reference) {
					<em>{{ prologue.reference }}</em>
				}
			</div>
		</div>
	`,
	styleUrl: './epigraph.component.scss',
	changeDetection: ChangeDetectionStrategy.OnPush,
})
export class EpigraphComponent {
	@Input({ required: true }) prologue!: Prologue;
}
