import { Component, signal } from '@angular/core';
import { render, screen, within } from '@testing-library/angular';
import userEvent from '@testing-library/user-event';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { faBrandYoutube } from '@ng-icons/font-awesome/brands';
import { clearAllMocks, fn } from '@test-utils';
import { ButtonGroupComponent, type ButtonGroupOption } from './button-group.component';

const options: ButtonGroupOption[] = [
	{ id: 'audio', label: 'Audio' },
	{ id: 'video', label: 'Video' },
	{ id: 'podcast', label: 'Podcast' },
];

describe('ButtonGroupComponent', () => {
	beforeEach(() => {
		clearAllMocks();
	});

	describe('rendering', () => {
		it('should render one button per option, named by its label', async () => {
			await render(ButtonGroupComponent, {
				inputs: { label: 'Formatos', options },
			});

			options.forEach((option) => expect(screen.getByRole('button', { name: option.label })).toBeInTheDocument());
		});

		it('should expose the group by its accessible name', async () => {
			await render(ButtonGroupComponent, {
				inputs: { label: 'Formatos', options },
			});

			expect(screen.getByRole('group', { name: 'Formatos' })).toBeInTheDocument();
		});

		it('should render the icon of an option without altering its accessible name', async () => {
			await render(ButtonGroupComponent, {
				inputs: {
					label: 'Formatos',
					options: [{ id: 'video', label: 'Video', iconName: 'faBrandYoutube' }],
				},
				imports: [NgIcon],
				providers: [provideIcons({ faBrandYoutube })],
			});

			// El ícono se busca dentro del botón, y no solo por el nombre accesible: la etiqueta lo
			// nombra igual con el ícono ausente, así que sin esta aserción el caso pasaría con la
			// plantilla del ícono borrada.
			const button = screen.getByRole('button', { name: 'Video' });
			expect(await within(button).findByTestId('option-icon')).toBeInTheDocument();
		});

		it('should render no icon when the option declares none', async () => {
			await render(ButtonGroupComponent, {
				inputs: { label: 'Formatos', options },
			});

			expect(screen.queryAllByTestId('option-icon')).toHaveLength(0);
		});

		// El ícono es decorativo: la etiqueta ya nombra la opción. Un ícono que se anunciara ensuciaría
		// el nombre accesible del botón, así que se afirma que ningún rol de imagen queda expuesto.
		it('should keep the icon out of the accessibility tree', async () => {
			await render(ButtonGroupComponent, {
				inputs: {
					label: 'Formatos',
					options: [{ id: 'video', label: 'Video', iconName: 'faBrandYoutube' }],
				},
				imports: [NgIcon],
				providers: [provideIcons({ faBrandYoutube })],
			});

			await screen.findByTestId('option-icon');
			expect(screen.queryAllByRole('img')).toHaveLength(0);
		});

		it('should render an empty group without failing', async () => {
			await render(ButtonGroupComponent, {
				inputs: { label: 'Formatos', options: [] },
			});

			expect(screen.getByRole('group', { name: 'Formatos' })).toBeInTheDocument();
			expect(screen.queryAllByRole('button')).toHaveLength(0);
		});
	});

	describe('selection', () => {
		it('should announce the current option as pressed', async () => {
			await render(ButtonGroupComponent, {
				inputs: { label: 'Formatos', options, selectedId: 'audio' },
			});

			expect(screen.getByRole('button', { name: 'Audio', pressed: true })).toBeInTheDocument();
		});

		// Las demás declaran `pressed: false` y no la ausencia del atributo: un grupo donde solo la
		// vigente lo declara se anuncia de forma inconsistente.
		it('should announce the remaining options as not pressed', async () => {
			await render(ButtonGroupComponent, {
				inputs: { label: 'Formatos', options, selectedId: 'audio' },
			});

			expect(screen.getAllByRole('button', { pressed: false })).toHaveLength(options.length - 1);
		});

		it('should leave every option unpressed when no id is current', async () => {
			await render(ButtonGroupComponent, {
				inputs: { label: 'Formatos', options },
			});

			expect(screen.getAllByRole('button', { pressed: false })).toHaveLength(options.length);
		});

		it('should tolerate a current id that matches no option', async () => {
			await render(ButtonGroupComponent, {
				inputs: { label: 'Formatos', options, selectedId: 'inexistente' },
			});

			expect(screen.getAllByRole('button', { pressed: false })).toHaveLength(options.length);
		});
	});

	describe('emission', () => {
		it('should emit the id of the clicked option', async () => {
			const optionSelected = fn();
			await render(ButtonGroupComponent, {
				inputs: { label: 'Formatos', options },
				on: { optionSelected },
			});

			await userEvent.click(screen.getByRole('button', { name: 'Video' }));

			expect(optionSelected).toHaveBeenCalledExactlyOnceWith('video');
		});

		// Suprimir la emisión sería decidir que "no cambió nada", y quién considera que algo cambió
		// es del consumidor.
		it('should emit again when the current option is clicked', async () => {
			const optionSelected = fn();
			await render(ButtonGroupComponent, {
				inputs: { label: 'Formatos', options, selectedId: 'audio' },
				on: { optionSelected },
			});

			await userEvent.click(screen.getByRole('button', { name: 'Audio' }));

			expect(optionSelected).toHaveBeenCalledExactlyOnceWith('audio');
		});

		it('should emit on keyboard activation', async () => {
			const optionSelected = fn();
			await render(ButtonGroupComponent, {
				inputs: { label: 'Formatos', options },
				on: { optionSelected },
			});

			screen.getByRole('button', { name: 'Podcast' }).focus();
			await userEvent.keyboard('{Enter}');

			expect(optionSelected).toHaveBeenCalledExactlyOnceWith('podcast');
		});
	});

	describe('controlled behaviour', () => {
		it('should not move the selection on its own', async () => {
			await render(ButtonGroupComponent, {
				inputs: { label: 'Formatos', options, selectedId: 'audio' },
			});

			await userEvent.click(screen.getByRole('button', { name: 'Video' }));

			expect(screen.getByRole('button', { name: 'Audio', pressed: true })).toBeInTheDocument();
			expect(screen.getByRole('button', { name: 'Video', pressed: false })).toBeInTheDocument();
		});

		it('should move the selection once the parent hands it back', async () => {
			await render(ControlledHostComponent);

			await userEvent.click(screen.getByRole('button', { name: 'Video' }));

			expect(screen.getByRole('button', { name: 'Video', pressed: true })).toBeInTheDocument();
			expect(screen.getByRole('button', { name: 'Audio', pressed: false })).toBeInTheDocument();
		});
	});
});

// El host que documenta el contrato de forma ejecutable: la elección vive acá, el grupo solo la
// pinta y la emite. Se declara con signal y no con `rerender` porque un re-render de la testing
// library no reevalúa los bindings del host del componente.
@Component({
	imports: [ButtonGroupComponent],
	template: `
		<cuentoneta-button-group
			(optionSelected)="selectedId.set($event)"
			[options]="options"
			[selectedId]="selectedId()"
			label="Formatos"
		/>
	`,
})
class ControlledHostComponent {
	protected readonly options = options;
	protected readonly selectedId = signal('audio');
}
