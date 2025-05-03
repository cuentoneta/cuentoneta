import { render, screen } from '@testing-library/angular';
import { ProgressBarComponent } from './progress-bar.component';

describe('ProgressBarComponent', () => {
	it('should render the progress bar', async () => {
		await render(ProgressBarComponent);
		const progressBar = screen.getByTestId('progress-bar');
		expect(progressBar).toBeInTheDocument();
	});
});
