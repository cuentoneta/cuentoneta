import type { ImageUrlResolver } from '@api/_utils/functions';
import { localImagePathForImageSource } from '@mocks/onoff-image-assets.mock';

/**
 * Resuelve cada referencia de imagen al asset local que el corpus le asocia, en vez de a una URL de
 * `cdn.sanity.io` atada al dataset del entorno. Es lo que permite que los cruces del corpus de dominio
 * contra el ACL comparen las imágenes en vez de excluirlas. Una fuente irresoluble da `''`, como `urlFor`.
 */
export const stubImageUrlResolver: ImageUrlResolver = (source) => localImagePathForImageSource(source);
