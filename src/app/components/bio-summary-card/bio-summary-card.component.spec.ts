import {render} from '@testing-library/angular';

import { BioSummaryCardComponent } from './bio-summary-card.component';
import { Author } from 'src/app/models/author.model';

const mockAuthor: Author = {
    id: 0,
    name: "Poe",
    imageUrl: "mockUrl",
    nationality:{
        country: "Baltimore", 
        flag: "USA"
    },
    fullBioUrl: "mockUrl"
};

describe('BioSummaryCardComponent', () => {
    it('should create', async () => {
        const component = await render(BioSummaryCardComponent, {
            componentProperties: {author: mockAuthor},
        });

        expect(component).toBeTruthy();
    });
});
