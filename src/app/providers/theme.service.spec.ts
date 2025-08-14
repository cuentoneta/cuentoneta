import { TestBed } from '@angular/core/testing';
import { Meta } from '@angular/platform-browser';
import { PLATFORM_ID } from '@angular/core';
import { ThemeService } from './theme.service';
import { extendedColors } from '../../../theme.config';

describe('ThemeService', () => {
	let service: ThemeService;
	let mockMeta: jest.Mocked<Partial<Meta>>;

	beforeEach(() => {
		mockMeta = {
			addTag: jest.fn(),
		} as jest.Mocked<Partial<Meta>>;

		TestBed.configureTestingModule({
			providers: [ThemeService, { provide: Meta, useValue: mockMeta }, { provide: PLATFORM_ID, useValue: 'browser' }],
		});

		service = TestBed.inject(ThemeService);
	});
	it('should be created', () => {
		expect(service).toBeTruthy();
	});

	describe('pickColor', () => {
		it('should return the correct color value', () => {
			const color = service.pickColor('blue', 500);
			expect(color).toBe('#3B82F6'); // Ejemplo basado en Tailwind
		});

		it('should throw an error if the scale does not exist', () => {
			expect(() => service.pickColor('blue', 999)).toThrow('Scale 999 not found in color blue!');
		});
	});

	describe('pickThemeColor', () => {
		it('should return the correct extended color value', () => {
			const color = service.pickThemeColor('primary-500');
			expect(color).toBe(extendedColors['primary-500']);
		});
	});

	describe('addThemeColorTag', () => {
		it('should add a theme-color meta tag when running in the browser', () => {
			service.addThemeColorTag();
			expect(mockMeta.addTag).toHaveBeenCalledWith({
				name: 'theme-color',
				content: extendedColors['primary-500'],
			});
		});
	});
});
