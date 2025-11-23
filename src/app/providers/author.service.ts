// Core
import { Injectable } from '@angular/core';
import { from, Observable } from 'rxjs';

// Models
import { Author, AuthorTeaser } from '@models/author.model';

// tRPC
import { getTRPCClient } from './trpc';

@Injectable({
	providedIn: 'root',
})
export class AuthorService {
	private trpc = getTRPCClient();

	public getAll(): Observable<AuthorTeaser[]> {
		return from(this.trpc.author.getAll.query());
	}

	public getBySlug(slug: string): Observable<Author> {
		return from(this.trpc.author.getBySlug.query({ slug }));
	}
}
