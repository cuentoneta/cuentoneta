import { setupZonelessTestEnv } from 'jest-preset-angular/setup-env/zoneless';
import '@testing-library/jest-dom';
import { installIntersectionObserverStub } from './app/testing/intersection-observer.stub';

setupZonelessTestEnv();

// jsdom no implementa IntersectionObserver: se instala un stub global para todos los tests. Los specs que
// necesitan controlar el observer (simular overflow) reutilizan los helpers del mismo stub.
installIntersectionObserverStub();
