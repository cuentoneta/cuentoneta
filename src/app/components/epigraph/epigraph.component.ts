import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Prologue } from '@models/prologue.model';

@Component({
	selector: 'cuentoneta-story-epigraph',
	standalone: true,
	imports: [CommonModule],
	template: `
		<div class="bar"></div>
		<div class="prologue">
			<p class="text">{{ prologue.text }}&nbsp;</p>
			<div class="reference">
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
