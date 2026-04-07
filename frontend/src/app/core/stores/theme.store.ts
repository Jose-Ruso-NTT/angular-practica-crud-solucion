import { DOCUMENT } from '@angular/common';
import { computed, inject, Injectable, signal } from '@angular/core';

export type ThemeMode = 'light' | 'dark';

const THEME_STORAGE_KEY = 'vehicle-catalog-theme';

@Injectable({ providedIn: 'root' })
export class ThemeStore {
  private readonly document = inject(DOCUMENT);
  private readonly storage = this.document.defaultView?.localStorage ?? null;
  private readonly mediaQuery = this.document.defaultView?.matchMedia?.(
    '(prefers-color-scheme: dark)',
  );

  readonly theme = signal<ThemeMode>('light');
  readonly isDark = computed(() => this.theme() === 'dark');

  initialize(): void {
    this.applyTheme(this.getInitialTheme());
  }

  toggleTheme(): void {
    this.setTheme(this.isDark() ? 'light' : 'dark');
  }

  setTheme(theme: ThemeMode): void {
    this.applyTheme(theme);
    this.storage?.setItem(THEME_STORAGE_KEY, theme);
  }

  private getInitialTheme(): ThemeMode {
    const storedTheme = this.storage?.getItem(THEME_STORAGE_KEY);

    if (storedTheme === 'light' || storedTheme === 'dark') {
      return storedTheme;
    }

    return this.mediaQuery?.matches ? 'dark' : 'light';
  }

  private applyTheme(theme: ThemeMode): void {
    this.theme.set(theme);
    this.document.documentElement.classList.toggle('dark', theme === 'dark');
    this.document.documentElement.style.colorScheme = theme;
  }
}
