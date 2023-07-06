import { render } from '@testing-library/angular';

import { StoryEditionDateLabelComponent } from './story-edition-date-label.component';

describe('StoryEditionDateLabelComponent', () => {
    it('should create', async() => {
        const component = await render(StoryEditionDateLabelComponent);

        expect(component).toBeTruthy();
    });
});
