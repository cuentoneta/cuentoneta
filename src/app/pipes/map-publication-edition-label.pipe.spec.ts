import { MapPublicationEditionLabelPipe } from './map-publication-edition-label.pipe';
import { TestBed } from '@angular/core/testing';
import { DatePipe } from '@angular/common';

describe('MapPublicationEditionLabelPipe', () => {
	let pipe: MapPublicationEditionLabelPipe;

	beforeEach(async () => {
		TestBed.configureTestingModule({ providers: [DatePipe, MapPublicationEditionLabelPipe] });
	});

	it('create an instance', () => {
		pipe = TestBed.inject(MapPublicationEditionLabelPipe);
		expect(pipe).toBeTruthy();
	});
});
