import { Injectable, signal } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class LoadingService {
  private loadingSignal = signal(false);
  private loadingCounter = 0;

  readonly isLoading = this.loadingSignal.asReadonly();

  setLoading(loading: boolean): void {
    if (loading) {
      this.loadingCounter++;
    } else {
      this.loadingCounter = Math.max(0, this.loadingCounter - 1);
    }

    this.loadingSignal.set(this.loadingCounter > 0);
  }

  forceStop(): void {
    this.loadingCounter = 0;
    this.loadingSignal.set(false);
  }
}
