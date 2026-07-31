import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import type { LiteraryWork } from '@models/literary-work.model';
import { elOdioLiteraryWorkMock } from '@mocks/onoff/el-odio.mock';
import { neronLiteraryWorkMock } from '@mocks/onoff/neron.mock';
import { environment } from '../environments/environment';
import { Endpoints } from './endpoints';
import { HttpLiteraryWorkApi } from './literary-work.provider';
import type { LiteraryWorkDto } from '@models/literary-work.dto';

// El DTO de wire es la serialización JSON del agregado: los métodos (toAnchor) y los brands se
// pierden, quedando el shape plano que el endpoint efectivamente emite. Se deriva del canon de Onoff
// en vez de hand-authorear un objeto mock paralelo.
function toWireDto(literaryWork: LiteraryWork): LiteraryWorkDto {
	return JSON.parse(JSON.stringify(literaryWork)) as LiteraryWorkDto;
}

describe('HttpLiteraryWorkApi', () => {
	let api: HttpLiteraryWorkApi;
	let http: HttpTestingController;

	beforeEach(() => {
		TestBed.configureTestingModule({
			providers: [provideHttpClient(), provideHttpClientTesting()],
		});
		api = TestBed.inject(HttpLiteraryWorkApi);
		http = TestBed.inject(HttpTestingController);
	});

	afterEach(() => {
		http.verify();
	});

	function requestBySlug(dto: LiteraryWorkDto): Promise<LiteraryWork> {
		const result = new Promise<LiteraryWork>((resolve, reject) => {
			api.getBySlug(dto.slug).subscribe({ next: resolve, error: reject });
		});
		http.expectOne(`${environment.apiUrl}${Endpoints.LiteraryWork}/${dto.slug}`).flush(dto);
		return result;
	}

	it('rehydrates the wire DTO back into the domain aggregate, frozen and with methods restored', async () => {
		const dto = toWireDto(elOdioLiteraryWorkMock);
		const rehydrated = await requestBySlug(dto);

		// Round-trip: re-serializar el agregado rehidratado reproduce el DTO de origen.
		expect(toWireDto(rehydrated)).toEqual(dto);
		expect(Object.isFrozen(rehydrated)).toBe(true);
		// toAnchor() no cruza el wire; la rehidratación lo reconstruye vía createSectionTitle.
		expect(rehydrated.content[0].title?.toAnchor()).toBe(elOdioLiteraryWorkMock.content[0].title?.toAnchor());
		expect(rehydrated.content[0].epigraphs?.[0].reference).toContain('Onoff');
	});

	it('derives totalReadingTime from the sections, ignoring the wire value', async () => {
		const dto = toWireDto(elOdioLiteraryWorkMock);
		const rehydrated = await requestBySlug({ ...dto, totalReadingTime: dto.totalReadingTime + 999 });

		expect(rehydrated.totalReadingTime).toBe(elOdioLiteraryWorkMock.totalReadingTime);
	});

	it('errors the stream when the DTO violates a domain invariant', async () => {
		const dto = toWireDto(elOdioLiteraryWorkMock);

		// authors: [] pasa el schema de zod (array vacío es shape válido) pero viola la invariante
		// de dominio: la factory es la que lanza, no zod.
		await expect(requestBySlug({ ...dto, authors: [] })).rejects.toThrow(/sin autores/);
	});

	it('rehydrates the editorial note as sanitized html', async () => {
		const dto = toWireDto(elOdioLiteraryWorkMock);
		const rehydrated = await requestBySlug(dto);

		expect(rehydrated.editorialNote).toBe(elOdioLiteraryWorkMock.editorialNote);
	});

	it('leaves the editorial note undefined when the wire DTO carries none', async () => {
		const dto = toWireDto(neronLiteraryWorkMock);
		const rehydrated = await requestBySlug(dto);

		expect(rehydrated.editorialNote).toBeUndefined();
		expect(toWireDto(rehydrated)).toEqual(dto);
	});

	// El schema acepta el string vacío (z.string() no lo excluye), así que la guarda por truthiness
	// del provider es alcanzable: sin ella, createSanitizedHtml lanzaría por contenido vacío.
	it('leaves the editorial note undefined when the wire DTO carries an empty string', async () => {
		const dto = toWireDto(elOdioLiteraryWorkMock);
		const rehydrated = await requestBySlug({ ...dto, editorialNote: '' });

		expect(rehydrated.editorialNote).toBeUndefined();
	});

	// La frontera es la última defensa antes del [innerHTML] con bypass: un backend regresado que
	// sirviera HTML sin procesar tiene que fallar acá, no llegar al DOM.
	it('errors the stream when the editorial note carries html the pipeline never emits', async () => {
		const dto = toWireDto(elOdioLiteraryWorkMock);

		await expect(requestBySlug({ ...dto, editorialNote: '<p>Hola</p><script>alert(1)</script>' })).rejects.toThrow(
			/no pasó por el pipeline de sanitización/,
		);
	});

	it('errors the stream when the wire shape violates the DTO schema', async () => {
		const dto = toWireDto(elOdioLiteraryWorkMock);
		// readingTime como string en vez de number: zod lo rechaza en la frontera, antes de rehidratar.
		const malformed = { ...dto, content: [{ ...dto.content[0], readingTime: 'dos' }] };

		const result = new Promise<LiteraryWork>((resolve, reject) => {
			api.getBySlug(dto.slug).subscribe({ next: resolve, error: reject });
		});
		http.expectOne(`${environment.apiUrl}${Endpoints.LiteraryWork}/${dto.slug}`).flush(malformed);

		await expect(result).rejects.toThrow();
	});
});
