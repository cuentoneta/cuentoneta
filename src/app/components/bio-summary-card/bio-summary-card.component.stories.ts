import { Meta } from '@storybook/angular';
import { BioSummaryCardComponent } from './bio-summary-card.component';

export default {
  title: 'BioSummaryCardComponent',
  component: BioSummaryCardComponent,
} as Meta<BioSummaryCardComponent>;

export const Primary = {
  render: (args: BioSummaryCardComponent) => ({
    props: args,
  }),
  args: {},
};
