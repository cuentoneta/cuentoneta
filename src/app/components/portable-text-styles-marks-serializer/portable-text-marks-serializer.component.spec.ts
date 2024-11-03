import { render, screen } from '@testing-library/angular';
import { PortableTextMarksSerializerComponent } from './portable-text-marks-serializer.component';
import { portableTextMarksSerializerMock } from 'src/app/mocks/portable-text-marks-serializer.mock';

describe('PortableTextMarksSerializerComponent', () => {
	const setup = async () =>
		await render(PortableTextMarksSerializerComponent, {
			inputs: {
				text: [portableTextMarksSerializerMock],
			},
		});

	it('should render the component', async () => {
		const { container } = await setup();

		expect(container).toBeInTheDocument();
	});

	it('should diply the text', async () => {
		await setup();

		expect(screen.getByText(portableTextMarksSerializerMock)).toBeInTheDocument();
	});
});
