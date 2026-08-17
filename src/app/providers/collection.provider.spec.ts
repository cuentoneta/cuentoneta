import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import type { Observable } from 'rxjs';
import type { CollectionDto, CollectionTeaserDto } from '@models/collection.dto';
import {
	onoffCollectionsMock,
	onoffCollectionsWithSampleImageryMock,
	onoffCollectionTeasersMock,
} from '@mocks/onoff-collections.mock';
import { environment } from '../environments/environment';
import { Endpoints } from './endpoints';
import { CollectionApi, HttpCollectionApi } from './collection.provider';
import { provideCollectionApiMock, StubCollectionApi } from './collection.mock';

// El DTO de wire es la serialización JSON del agregado: los brands se pierden y queda el shape plano
// que el endpoint emite. Se deriva del canon en vez de escribir un objeto paralelo a mano.
function toWire<T>(value: unknown): T {
	return JSON.parse(JSON.stringify(value)) as T;
}

const [canon] = onoffCollectionsMock;
const [sampleCanon] = onoffCollectionsWithSampleImageryMock;

describe('HttpCollectionApi', () => {
	let api: HttpCollectionApi;
	let http: HttpTestingController;
	const url = `${environment.apiUrl}${Endpoints.Collection}`;

	beforeEach(() => {
		TestBed.configureTestingModule({
			providers: [provideHttpClient(), provideHttpClientTesting()],
		});
		api = TestBed.inject(HttpCollectionApi);
		http = TestBed.inject(HttpTestingController);
	});

	afterEach(() => {
		http.verify();
	});

	// Se suscribe antes de responder, que es el orden que el cliente de test necesita.
	function request<T>(source: Observable<T>, path: string, body: object): Promise<T> {
		const result = new Promise<T>((resolve, reject) => {
			source.subscribe({ next: resolve, error: reject });
		});
		http.expectOne(path).flush(body);
		return result;
	}

	it('rebuilds the aggregate from the wire payload', async () => {
		const dto = toWire<CollectionDto>(canon);

		const collection = await request(api.getBySlug(dto.slug), `${url}/${dto.slug}`, dto);

		expect(collection.slug).toBe(canon?.slug);
		expect(collection.title).toBe(canon?.title);
		expect(collection.literaryWorks).toHaveLength(canon?.literaryWorks.length ?? 0);
		expect(Object.isFrozen(collection)).toBe(true);
	});

	// Derivarlo en la factory es lo que impide que el servidor mande un total que no coincida.
	it('derives the count instead of trusting the payload', async () => {
		const dto = { ...toWire<CollectionDto>(canon), count: 99 };

		const collection = await request(api.getBySlug(dto.slug), `${url}/${dto.slug}`, dto);

		expect(collection.count).toBe(canon?.literaryWorks.length);
	});

	// El listado sirve la vista de catálogo: cada colección con su total, sin sus obras.
	it('rebuilds the listing as teasers', async () => {
		const dto = toWire<CollectionTeaserDto[]>(onoffCollectionTeasersMock);

		const teasers = await request(api.getAll(), url, dto);

		expect(teasers).toHaveLength(onoffCollectionTeasersMock.length);
		expect(teasers.map(({ slug }) => slug)).toEqual(onoffCollectionTeasersMock.map(({ slug }) => slug));
		teasers.forEach((teaser, index) => {
			expect(teaser.literaryWorks).toEqual([]);
			expect(teaser.count).toBe(onoffCollectionTeasersMock[index]?.count);
		});
	});

	// El listado tiene su propio schema y este es el único caso que lo ejercita de verdad: un `count`
	// que no es número atraviesa la factory —que solo lo compara contra 1, y esa comparación es falsa
	// para un string— así que si el schema dejara de validar sus elementos, nadie más lo atajaría.
	it('rejects a listing whose count is not a number', async () => {
		const [teaser] = toWire<CollectionTeaserDto[]>(onoffCollectionTeasersMock);
		const dto = [{ ...teaser, count: 'muchas' }];

		await expect(request(api.getAll(), url, dto)).rejects.toThrow();
	});

	// La unión discriminada cruza el wire como datos: sin validarla, el componente que la discrimina
	// recibiría una tupla incompleta y lo descubriría al renderizar.
	it('rejects a sample of imagery without three covers', async () => {
		const dto = { ...toWire<CollectionDto>(sampleCanon), imagery: { kind: 'sample', images: ['a.png', 'b.png'] } };

		await expect(request(api.getBySlug(dto.slug), `${url}/${dto.slug}`, dto)).rejects.toThrow();
	});

	// El largo del abanico es una garantía de dos lados y solo se cubría el corto. Con el schema vigente
	// rechaza el schema, que corre antes que la factory; pero el largo está validado dos veces, así que
	// degradar la tupla del wire a un array sin cota tampoco haría fallar este caso: lo atajaría la
	// invariante de dominio.
	it('rejects a sample of imagery with a fourth cover', async () => {
		const dto = {
			...toWire<CollectionDto>(sampleCanon),
			imagery: { kind: 'sample', images: ['a.png', 'b.png', 'c.png', 'd.png'] },
		};

		await expect(request(api.getBySlug(dto.slug), `${url}/${dto.slug}`, dto)).rejects.toThrow();
	});

	it('rejects a payload whose imagery kind is unknown', async () => {
		const dto = { ...toWire<CollectionDto>(canon), imagery: { kind: 'mosaic', image: 'a.png' } };

		await expect(request(api.getBySlug(dto.slug), `${url}/${dto.slug}`, dto)).rejects.toThrow();
	});

	// El HTML llega del servidor ya saneado, pero el tipo lo exige y rehidratarlo por la factory es lo
	// que mantiene la garantía a ambos lados del wire.
	it('rehydrates the description as sanitized html', async () => {
		const dto = toWire<CollectionDto>(canon);

		const collection = await request(api.getBySlug(dto.slug), `${url}/${dto.slug}`, dto);

		expect(collection.description).toBe(canon?.description);
	});
});

describe('CollectionApi', () => {
	// La factory del token es lo único que ata el contrato a su implementación HTTP: sin ella
	// la app arranca sin proveedor y falla recién al inyectarlo, ya en la ruta que lo necesita.
	// Es la única cobertura de inyección que tiene este contrato, que todavía no se consume desde
	// ninguna página.
	it('resuelve la implementación HTTP sin ningún proveedor explícito', () => {
		TestBed.configureTestingModule({
			providers: [provideHttpClient(), provideHttpClientTesting()],
		});

		expect(TestBed.inject(CollectionApi)).toBeInstanceOf(HttpCollectionApi);
	});

	it('deja que el doble sustituya la implementación por defecto', () => {
		TestBed.configureTestingModule({
			providers: [
				provideHttpClient(),
				provideHttpClientTesting(),
				provideCollectionApiMock(new StubCollectionApi(onoffCollectionsMock)),
			],
		});

		expect(TestBed.inject(CollectionApi)).toBeInstanceOf(StubCollectionApi);
	});
});
