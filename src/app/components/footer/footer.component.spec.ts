import {render} from '@testing-library/angular';

import { FooterComponent } from './footer.component';

describe('FooterComponent', () => {
    it('should create', async () => {
        const component = await render(FooterComponent);
        expect(component).toBeTruthy();
    });
});
