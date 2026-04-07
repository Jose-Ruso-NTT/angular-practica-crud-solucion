import { Injectable, OnDestroy, signal } from '@angular/core';

export type FeedbackKind = 'success' | 'error' | 'info';

export interface FeedbackMessage {
  id: number;
  kind: FeedbackKind;
  text: string;
}

@Injectable({ providedIn: 'root' })
export class FeedbackStore implements OnDestroy {
  readonly messages = signal<FeedbackMessage[]>([]);
  private nextId = 1;
  private readonly removalTimers = new Map<number, ReturnType<typeof setTimeout>>();

  success(text: string): void {
    this.push('success', text);
  }

  error(text: string): void {
    this.push('error', text);
  }

  info(text: string): void {
    this.push('info', text);
  }

  remove(id: number): void {
    const timerId = this.removalTimers.get(id);
    if (timerId) {
      clearTimeout(timerId);
      this.removalTimers.delete(id);
    }

    this.messages.update((messages) => messages.filter((message) => message.id !== id));
  }

  ngOnDestroy(): void {
    for (const timerId of this.removalTimers.values()) {
      clearTimeout(timerId);
    }

    this.removalTimers.clear();
  }

  private push(kind: FeedbackKind, text: string): void {
    const id = this.nextId++;
    this.messages.update((messages) => [...messages, { id, kind, text }]);

    const timerId = setTimeout(() => {
      this.removalTimers.delete(id);
      this.remove(id);
    }, 4000);

    this.removalTimers.set(id, timerId);
  }
}
