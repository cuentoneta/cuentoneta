import { SpaceRecordingWidgetComponent } from './space-recording-widget.component';
import { PortableTextParserComponent } from '../portable-text-parser/portable-text-parser.component';
import { render, screen } from '@testing-library/angular';
import { CommonModule, DatePipe, NgOptimizedImage } from '@angular/common';
import { spaceRecordingMock } from '../../mocks/space-recording.mock';

describe('SpaceRecordingWidgetComponent', () => {
	const setup = async () => {
		return await render(SpaceRecordingWidgetComponent, {
			componentImports: [CommonModule, NgOptimizedImage, PortableTextParserComponent],
			componentProviders: [],
			inputs: {
				media: spaceRecordingMock,
			},
		});
	};

	test('should render SpaceRecordingWidgetComponent', async () => {
		expect(await setup()).toBeTruthy();
	});

	it('should display the correct title', async () => {
		await setup();
		expect(screen.getByText(spaceRecordingMock.title)).toBeInTheDocument();
	});

	it('should display the host name', async () => {
		await setup();
		expect(screen.getByText('@' + spaceRecordingMock.data.tweetBy.userName)).toBeInTheDocument();
	});

	it('should display the recording date', async () => {
		await setup();
		const datePipe = new DatePipe('en-US');
		const date = datePipe.transform(new Date(spaceRecordingMock.data.createdAt), 'MMMM d, YYYY') as string;
		expect(screen.getByText(date)).toBeInTheDocument();
	});

	it('should display the recording duration', async () => {
		await setup();
		expect(screen.getByText(spaceRecordingMock.data.duration)).toBeInTheDocument();
	});

	it('should have the correct href for the space recording', async () => {
		await setup();
		const link = screen.getByRole('link', { name: 'space-recording-href' });
		expect(link).toHaveAttribute('href', spaceRecordingMock.data.entities.urls[0]);
	});

	it('should display the "Play Recording on X" button', async () => {
		await setup();
		expect(screen.getByText('Reproducir Grabación en X')).toBeInTheDocument();
	});

	it('should render the profile image', async () => {
		await setup();
		const img = screen.getByRole('img');
		expect(img).toHaveAttribute('src', spaceRecordingMock.data.tweetBy.profileImage);
	});
});
