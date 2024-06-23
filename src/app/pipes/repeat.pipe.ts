import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
	name: 'repeat',
	standalone: true,
})
export class RepeatPipe implements PipeTransform {
	transform(value: number): number[] {
		return Array(value).fill(0);
	}
}
