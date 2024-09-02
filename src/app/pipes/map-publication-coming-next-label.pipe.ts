import { inject, Pipe, PipeTransform } from '@angular/core';
import { Publication, Storylist } from '@models/storylist.model';
import { DatePipe } from '@angular/common';

@Pipe({
	name: 'mapPublicationComingNextLabel',
	standalone: true,
})
export class MapPublicationComingNextLabelPipe implements PipeTransform {
	private datePipe = inject(DatePipe);

	transform(publication: Publication, storylist: Storylist): string {
		let result = `${storylist.comingNextLabel}`;

		if (storylist.displayDates) {
			const formattedDate = this.datePipe.transform(publication.publishingDate, `dd 'de' MMMM, YYYY`);
			result = result.concat(` - ${formattedDate}`);
		}

		return result;
	}
}
