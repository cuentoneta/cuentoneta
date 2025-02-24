import { inject, Pipe, PipeTransform } from '@angular/core';
import {
	Publication,
	PublicationNavigationTeaser,
	Storylist,
	StorylistNavigationTeaser,
} from '@models/storylist.model';
import { DatePipe } from '@angular/common';

@Pipe({
	name: 'mapPublicationEditionLabel',
	standalone: true,
})
export class MapPublicationEditionLabelPipe implements PipeTransform {
	private datePipe = inject(DatePipe);

	transform(
		publication: Publication | PublicationNavigationTeaser,
		storylist: Storylist | StorylistNavigationTeaser,
	): string {
		let result = `${storylist.editionPrefix} ${publication.publishingOrder}`;

		if (storylist.displayDates) {
			const formattedDate = this.datePipe.transform(publication.publishingDate, `dd 'de' MMMM, YYYY`);
			result = result.concat(` - ${formattedDate}`);
		}

		return result;
	}
}
