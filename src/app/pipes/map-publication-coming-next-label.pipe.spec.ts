import { MapPublicationComingNextLabelPipe } from './map-publication-coming-next-label.pipe';
import { TestBed } from '@angular/core/testing';
import { DatePipe } from '@angular/common';

describe('MapPublicationComingNextLabelPipe', () => {
	let pipe: MapPublicationComingNextLabelPipe;

	beforeEach(async () => {
		TestBed.configureTestingModule({ providers: [DatePipe, MapPublicationComingNextLabelPipe] });
	});

	it('create an instance', () => {
		pipe = TestBed.inject(MapPublicationComingNextLabelPipe);
		expect(pipe).toBeTruthy();
	});
});
