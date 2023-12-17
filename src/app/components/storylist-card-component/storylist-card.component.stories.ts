import { Meta, moduleMetadata, StoryObj } from '@storybook/angular';
import { StorylistCardComponent } from './storylist-card.component';
import { NgOptimizedImage } from '@angular/common';

const meta: Meta<StorylistCardComponent> = {
  component: StorylistCardComponent,
  title: 'StorylistCardComponent',
  decorators: [
    moduleMetadata({
      imports: [NgOptimizedImage],
    }),
  ],
};
export default meta;
type Story = StoryObj<StorylistCardComponent>;

export const Primary: Story = {
  render: (args: StorylistCardComponent) => ({
    props: args,
  }),
  args: {
    storylist: {
      title: 'Cuentoneta 1.0',
      description: [
        'La colección “Cuentos de Verano” de la primera versión de La Cuentoneta: una selección de textos publicados diariamente entre el Año Nuevo y el Martes de Carnaval de 2022',
      ],
      publications: [],
      images: [
        {
          slug: 'image-1',
          url: 'https://cdn.sanity.io/images/s4dbqkc5/production/445f726810d3b0e39216db61fa40d663aaea3aa4-627x509.png',
        },
      ],
    },
  },
};
