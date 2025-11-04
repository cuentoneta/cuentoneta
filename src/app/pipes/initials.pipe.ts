import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
	name: 'initials',
	standalone: true,
})
export class InitialsPipe implements PipeTransform {
	transform(name: string): string {
		if (!name) return '';

		if (name.length <= 22) {
			return name;
		}

		const asArray = name.split(' ');

		if (asArray.length === 1) {
			return name.slice(0, 19).concat('...');
		}

		if (asArray.length > 2) {
			asArray[1] = `${asArray[1][0]}.`;
		}

		if (asArray.join(' ').length <= 22) {
			return asArray.join(' ');
		}

		return asArray
			.map((word, index) => (word.length <= 2 ? word : index + 1 !== asArray.length ? `${word[0]}.` : word))
			.join(' ');
	}
}
