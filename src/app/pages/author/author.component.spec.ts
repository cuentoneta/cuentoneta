import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { render, screen, within } from '@testing-library/angular';
import AuthorComponent from './author.component';
import { authorMock } from '@mocks/author.mock';
import { provideAuthorApiMock } from '../../providers/author.mock';
import { provideStoryApiMock } from '../../providers/story.mock';

describe.skip('AuthorComponent', () => {
	let component: AuthorComponent;
	let fixture: ComponentFixture<AuthorComponent>;

	beforeEach(async () => {
		await TestBed.configureTestingModule({
			imports: [AuthorComponent],
		}).compileComponents();

		fixture = TestBed.createComponent(AuthorComponent);
		component = fixture.componentInstance;
		fixture.detectChanges();
	});

	it('should create', () => {
		expect(component).toBeTruthy();
	});
});

// La biografía llega como HTML ya saneado y se pinta con [innerHTML]: se verifica que el marcado
// llegue vivo al DOM, no solo el texto, porque un binding interpolado también mostraría la prosa.
describe('AuthorComponent — biografía', () => {
	it('should render the biography as HTML, preserving its markup', async () => {
		await render(AuthorComponent, {
			inputs: { slug: authorMock.slug, activeTab: 'about' },
			providers: [provideRouter([]), provideAuthorApiMock(), provideStoryApiMock()],
		});

		const biography = screen.getByTestId('author-biography');
		const boldedName = within(biography).getByText(authorMock.name);

		expect(boldedName.tagName).toBe('STRONG');
	});
});
