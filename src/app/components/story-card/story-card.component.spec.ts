import {render} from '@testing-library/angular';

import { StoryCardComponent } from './story-card.component';

describe('StoryCardComponent', () => {
    it('should create', async() => {
        const component = await render(StoryCardComponent);

        expect(component).toBeTruthy();
    });
});
