/// <reference types="zone.js" />
import { Inject, Injectable, InjectionToken, OnDestroy, Optional } from '@angular/core';
import { BehaviorSubject, Observable, of, Subject, Subscription } from 'rxjs';
import { finalize, switchMap, takeUntil, takeWhile, tap } from 'rxjs/operators';

export const MACRO_TASK_WRAPPER_OPTIONS = new InjectionToken<MacroTaskWrapperOptions>('MacroTaskWrapperOptions');

export interface MacroTaskWrapperOptions {
	wrapMacroTaskTooLongWarningThreshold?: number;
}

/*
 * These utilities help Angular Universal know when
 * the page is done loading by wrapping
 * Promises and Observables in ZoneJS Macro Tasks.
 *
 * See: https://gist.github.com/sparebytes/e2bc438e3cfca7f6687f1d61287f8d72
 * See: https://github.com/angular/angular/issues/20520
 * See: https://stackoverflow.com/a/54345373/787757
 *
 * Usage:
 *
  ```ts
  @Injectable
  class MyService {
    constructor(private macroTaskWrapper: MacroTaskWrapperService) {}

    doSomething(): Observable<any> {
      return this.macroTaskWrapper.wrapMacroTask("MyService.doSomething", getMyData())
    }
  }

  @Component
  class MyComponent {
    constructor(private macroTaskWrapper: MacroTaskWrapperService) {}

    ngOnInit() {
      // You can use wrapMacroTask here
      this.macroTaskWrapper.wrapMacroTask("MyComponent.ngOnInit", getMyData())

      // If any tasks have started outside of the component use this:
      this.macroTaskWrapper.awaitMacroTasks("MyComponent.ngOnInit");
    }
  }
  ```
 *
 */
@Injectable({ providedIn: 'root' })
export class MacroTaskWrapperService implements OnDestroy {
	/** Override this value to change the warning time */
	wrapMacroTaskTooLongWarningThreshold: number;

	constructor(@Inject(MACRO_TASK_WRAPPER_OPTIONS) @Optional() options?: MacroTaskWrapperOptions) {
		this.wrapMacroTaskTooLongWarningThreshold =
			options && options.wrapMacroTaskTooLongWarningThreshold != null
				? options.wrapMacroTaskTooLongWarningThreshold
				: 10000;
	}

	ngOnDestroy() {
		this.macroTaskCount.next(0);
		this.macroTaskCount.complete();
	}

	/**
	 * Useful for waiting for tasks that started outside of a Component
	 *
	 * awaitMacroTasks$().subscribe()
	 **/
	awaitMacroTasks$(label: string, stackTrace?: string): Observable<number> {
		return this._wrapMacroTaskObservable(
			'__awaitMacroTasks__' + label,
			of(null)
				// .pipe(delay(1))
				.pipe(switchMap(() => this.macroTaskCount))
				.pipe(takeWhile((v) => v > 0)),
			null,
			'complete',
			false,
			stackTrace,
		);
	}

	/**
	 * Useful for waiting for tasks that started outside of a Component
	 *
	 * awaitMacroTasks()
	 **/
	awaitMacroTasks(label: string, stackTrace?: string): Subscription {
		// return _awaitMacroTasksLogged();
		return this.awaitMacroTasks$(label, stackTrace).subscribe();
	}

	awaitMacroTasksLogged(label: string, stackTrace?: string): Subscription {
		console.error('MACRO START');
		return this.awaitMacroTasks$(label, stackTrace).subscribe(
			() => {},
			() => {},
			() => console.error('MACRO DONE'),
		);
	}

	/**
	 * Starts a Macro Task for a promise or an observable
	 */
	wrapMacroTask<T>(
		label: string,
		request: Promise<T>,
		warnIfTakingTooLongThreshold?: number | null,
		isDoneOn?: IWaitForObservableIsDoneOn<T> | null,
		stackTrace?: string | null,
	): Promise<T>;
	wrapMacroTask<T>(
		label: string,
		request: Observable<T>,
		warnIfTakingTooLongThreshold?: number | null,
		isDoneOn?: IWaitForObservableIsDoneOn<T> | null,
		stackTrace?: string | null,
	): Observable<T>;
	wrapMacroTask<T>(
		/** Label the task for debugging purposes */
		label: string,
		/** The observable or promise to watch */
		request: Promise<T> | Observable<T>,
		/** Warn us if the request takes too long. Set to 0 to disable */
		warnIfTakingTooLongThreshold?: number | null,
		/** When do we know the request is done */
		isDoneOn?: IWaitForObservableIsDoneOn<T> | null,
		/** Stack trace to log if the task takes too long */
		stackTrace?: string | null,
	): Promise<T> | Observable<T> {
		if (request instanceof Promise) {
			return this.wrapMacroTaskPromise(label, request, warnIfTakingTooLongThreshold, stackTrace);
		} else if (request instanceof Observable) {
			return this.wrapMacroTaskObservable(label, request, warnIfTakingTooLongThreshold, isDoneOn, stackTrace);
		}

		// Backup type check
		if ('then' in request && typeof (request as any).then === 'function') {
			return this.wrapMacroTaskPromise(label, request, warnIfTakingTooLongThreshold, stackTrace);
		} else {
			return this.wrapMacroTaskObservable(
				label,
				request as Observable<T>,
				warnIfTakingTooLongThreshold,
				isDoneOn,
				stackTrace,
			);
		}
	}

	/**
	 * Starts a Macro Task for a promise
	 */
	async wrapMacroTaskPromise<T>(
		/** Label the task for debugging purposes */
		label: string,
		/** The Promise to watch */
		request: Promise<T>,
		/** Warn us if the request takes too long. Set to 0 to disable */
		warnIfTakingTooLongThreshold?: number | null,
		/** Stack trace to log if the task takes too long */
		stackTrace?: string | null,
	): Promise<T> {
		// Initialize warnIfTakingTooLongThreshold
		if (typeof warnIfTakingTooLongThreshold !== 'number') {
			warnIfTakingTooLongThreshold = this.wrapMacroTaskTooLongWarningThreshold;
		}

		// Start timer for warning
		let hasTakenTooLong = false;
		let takingTooLongTimeout: any = null;
		if (warnIfTakingTooLongThreshold! > 0 && takingTooLongTimeout == null) {
			takingTooLongTimeout = setTimeout(() => {
				hasTakenTooLong = true;
				clearTimeout(takingTooLongTimeout);
				takingTooLongTimeout = null;
				console.warn(
					`wrapMacroTaskPromise: Promise is taking too long to complete. Longer than ${warnIfTakingTooLongThreshold}ms.`,
				);
				console.warn('Task Label: ', label);
				if (stackTrace) {
					console.warn('Task Stack Trace: ', stackTrace);
				}
			}, warnIfTakingTooLongThreshold!);
		}

		// Start the task
		const task: MacroTask = Zone.current.scheduleMacroTask(
			'wrapMacroTaskPromise',
			() => {},
			{},
			() => {},
			() => {},
		);
		this.macroTaskStarted();

		// Prepare function for ending the task
		const endTask = () => {
			task.invoke();
			this.macroTaskEnded();

			// Kill the warning timer
			if (takingTooLongTimeout != null) {
				clearTimeout(takingTooLongTimeout);
				takingTooLongTimeout = null;
			}

			if (hasTakenTooLong) {
				console.warn('Long Running Macro Task is Finally Complete: ', label);
			}
		};

		// Await the promise
		try {
			const result = await request;
			endTask();
			return result;
		} catch (ex) {
			endTask();
			throw ex;
		}
	}

	/**
	 * Starts a Macro Task for an observable
	 */
	wrapMacroTaskObservable<T>(
		/** Label the task for debugging purposes */
		label: string,
		/** The observable to watch */
		request: Observable<T>,
		/** Warn us if the request takes too long. Set to 0 to disable */
		warnIfTakingTooLongThreshold?: number | null,
		/** When do we know the request is done */
		isDoneOn?: IWaitForObservableIsDoneOn<T> | null,
		/** Stack trace to log if the task takes too long */
		stackTrace?: string | null,
	): Observable<T> {
		return this._wrapMacroTaskObservable(label, request, warnIfTakingTooLongThreshold, isDoneOn, true, stackTrace);
	}

	protected _wrapMacroTaskObservable<T>(
		label: string,
		request: Observable<T>,
		warnIfTakingTooLongThreshold?: number | null,
		isDoneOn?: IWaitForObservableIsDoneOn<T> | null,
		isCounted: boolean = true,
		stackTrace?: string | null,
	): Observable<T> {
		return of(null).pipe(
			switchMap(() => {
				let counts = 0;

				// Determine emitPredicate
				let emitPredicate: (d: T) => boolean;
				if (isDoneOn == null || isDoneOn === 'complete') {
					emitPredicate = alwaysFalse;
				} else if (isDoneOn === 'first-emit') {
					emitPredicate = makeEmitCountPredicate(1);
				} else if ('emitCount' in isDoneOn) {
					emitPredicate = makeEmitCountPredicate(isDoneOn.emitCount);
				} else if ('emitPredicate' in isDoneOn) {
					emitPredicate = isDoneOn.emitPredicate;
				} else {
					console.warn("wrapMacroTaskObservable: Invalid isDoneOn value given. Defaulting to 'complete'.", isDoneOn);
					emitPredicate = alwaysFalse;
				}

				// Initialize warnIfTakingTooLongThreshold
				if (typeof warnIfTakingTooLongThreshold !== 'number') {
					warnIfTakingTooLongThreshold = this.wrapMacroTaskTooLongWarningThreshold;
				}

				/** When task is null it means it hasn't been scheduled */
				let task: MacroTask | null = null;
				let takingTooLongTimeout: any = null;
				let hasTakenTooLong = false;

				/** Function to call when we have determined the request is complete */
				const endTask = () => {
					if (task != null) {
						task.invoke();
						task = null;
						if (hasTakenTooLong) {
							console.warn('Long Running Macro Task is Finally Complete: ', label);
						}
					}

					this.macroTaskEnded(counts);
					counts = 0;

					// Kill the warning timer
					if (takingTooLongTimeout != null) {
						clearTimeout(takingTooLongTimeout);
						takingTooLongTimeout = null;
					}
				};

				/** Used if the task is cancelled */
				const unsubSubject = new Subject();
				function unsub() {
					// @ts-ignore
					unsubSubject.next();
					unsubSubject.complete();
				}

				return of(null)
					.pipe(
						tap(() => {
							// Start the task if one hasn't started yet
							if (task == null) {
								task = Zone.current.scheduleMacroTask(
									'wrapMacroTaskObservable',
									() => {},
									{},
									() => {},
									unsub,
								);
							}
							if (isCounted) {
								this.macroTaskStarted();
								counts++;
							}

							// Start timer for warning
							if (warnIfTakingTooLongThreshold! > 0 && takingTooLongTimeout == null) {
								takingTooLongTimeout = setTimeout(() => {
									hasTakenTooLong = true;
									clearTimeout(takingTooLongTimeout);
									takingTooLongTimeout = null;
									console.warn(
										`wrapMacroTaskObservable: Observable is taking too long to complete. Longer than ${warnIfTakingTooLongThreshold}ms.`,
									);
									console.warn('Task Label: ', label);
									if (stackTrace) {
										console.warn('Task Stack Trace: ', stackTrace);
									}
								}, warnIfTakingTooLongThreshold!);
							}
						}),
					)
					.pipe(switchMap(() => request.pipe(takeUntil(unsubSubject))))
					.pipe(
						tap((v) => {
							if (task != null) {
								if (emitPredicate(v)) {
									endTask();
								}
							}
						}),
					)
					.pipe(
						finalize(() => {
							endTask();
							unsubSubject.complete();
						}),
					);
			}),
		);
	}

	protected macroTaskCount = new BehaviorSubject(0);

	protected macroTaskStarted(counts: number = 1) {
		const nextTaskCount = this.macroTaskCount.value + counts;
		this.macroTaskCount.next(nextTaskCount);
		// console.log("Macro Task Count + ", counts, " = ", nextTaskCount);
	}
	protected macroTaskEnded(counts: number = 1) {
		const nextTaskCount = this.macroTaskCount.value - counts;
		this.macroTaskCount.next(nextTaskCount);
		// console.log("Macro Task Count - ", counts, " = ", nextTaskCount);
	}
}

export type IWaitForObservableIsDoneOn<T = any> =
	| 'complete'
	| 'first-emit'
	| { emitCount: number }
	| { emitPredicate: (d: T) => boolean };

// Utilities:

function makeEmitCountPredicate(emitCount: number) {
	let count = 0;
	return () => {
		count++;
		return count >= emitCount;
	};
}

function alwaysFalse() {
	return false;
}
