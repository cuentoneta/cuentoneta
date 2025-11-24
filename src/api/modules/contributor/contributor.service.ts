import * as contributorRepository from './contributor.repository';
import { Contributor } from '@models/contributor.model';

export async function getAll(): Promise<Contributor[]> {
	return contributorRepository.getAll();
}
