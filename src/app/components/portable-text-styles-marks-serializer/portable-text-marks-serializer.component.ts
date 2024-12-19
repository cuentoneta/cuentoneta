import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MarkDef } from '@models/block-content.model';

@Component({
	selector: 'cuentoneta-portable-text-marks-serializer',
	imports: [CommonModule],
	template: ` <!-- Caso base: no se aplica ningún estilo y se interpola la cadena de texto -->
		@if (marks().length === 0) {
			<!-- Chequeo de saltos de línea -->
			@for (portion of text(); let index = $index; track index) {
				{{ portion }}
				@if (index !== text().length - 1) {
					<br />
				}
			}
		} @else if (marks()[0] === 'strong') {
			<!-- Comienza a recorrer el arreglo de marks aplicando negrita -->
			<b>
				<cuentoneta-portable-text-marks-serializer
					[text]="text()"
					[marks]="marks().slice(1)"
					[markDefs]="markDefs()"
				></cuentoneta-portable-text-marks-serializer>
			</b>
		} @else if (marks()[0] === 'em') {
			<!-- Comienza a recorrer el arreglo de marks aplicando itálicas -->
			<i>
				<cuentoneta-portable-text-marks-serializer
					[text]="text()"
					[marks]="marks().slice(1)"
					[markDefs]="markDefs()"
				></cuentoneta-portable-text-marks-serializer>
			</i>
		} @else if (marks()[0]) {
			<!-- Comienza a recorrer el arreglo de marks aplicando markDefs -->
			@for (markDef of markDefs(); track $index) {
				@if (markDef._key === marks()[0]) {
					@switch (markDef._type) {
						@case ('link') {
							<a [href]="findUrlFromMarks(markDefs(), marks()[0])">
								<cuentoneta-portable-text-marks-serializer
									[text]="text()"
									[marks]="marks().slice(1)"
									[markDefs]="markDefs()"
								></cuentoneta-portable-text-marks-serializer>
							</a>
						}
					}
				}
			}
		}`,
	changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PortableTextMarksSerializerComponent {
	text = input.required({
		transform: (span: string | string[]): string[] => (typeof span === 'string' ? span.split('\n') : span),
	});
	marks = input<string[]>([]);
	markDefs = input<MarkDef[]>([]);

	findUrlFromMarks(markDefs: MarkDef[], currentMark: string): string {
		return markDefs.find((mark) => mark._key === currentMark)?.href ?? '#';
	}
}
