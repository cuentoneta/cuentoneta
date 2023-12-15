import type { Meta, StoryObj } from '@storybook/angular';
import { StorylistCardComponent } from './storylist-card.component';

const meta: Meta<StorylistCardComponent> = {
  component: StorylistCardComponent,
  title: 'StorylistCardComponent',
};
export default meta;
type Story = StoryObj<StorylistCardComponent>;

export const Primary: Story = {
  args: {},
};
