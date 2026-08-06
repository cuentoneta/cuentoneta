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
import { HttpCollectionApi } from './collection.provider';

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

	it('rebuilds every collection of the listing', async () => {
		const dto = toWire<CollectionDto[]>(onoffCollectionsMock);

		const collections = await request(api.getAll(), url, dto);

		expect(collections.map(({ slug }) => slug)).toEqual(onoffCollectionsMock.map(({ slug }) => slug));
	});

	it('rebuilds teasers that carry no works', async () => {
		const dto = toWire<CollectionTeaserDto[]>(onoffCollectionTeasersMock);

		const teasers = await request(api.getTeasers(), `${url}/teasers`, dto);

		expect(teasers).toHaveLength(onoffCollectionTeasersMock.length);
		teasers.forEach((teaser, index) => {
			expect(teaser.literaryWorks).toEqual([]);
			expect(teaser.count).toBe(onoffCollectionTeasersMock[index]?.count);
		});
	});

	// La unión discriminada cruza el wire como datos: sin validarla, el componente que la discrimina
	// recibiría una tupla incompleta y lo descubriría al renderizar.
	it('rejects a sample of imagery without three covers', async () => {
		const dto = { ...toWire<CollectionDto>(sampleCanon), imagery: { kind: 'sample', images: ['a.png', 'b.png'] } };

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
