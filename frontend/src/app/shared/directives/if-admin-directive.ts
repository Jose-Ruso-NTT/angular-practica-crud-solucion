import { Directive, TemplateRef, ViewContainerRef, effect, inject } from '@angular/core';
import { AuthStore } from '@core/stores/auth.store';

@Directive({
  selector: '[appIfAdmin]',
})
export class IfAdminDirective {
  private readonly templateRef = inject(TemplateRef<unknown>);
  private readonly viewContainerRef = inject(ViewContainerRef);
  private readonly authStore = inject(AuthStore);

  constructor() {
    effect(() => {
      if (this.authStore.isAdmin()) {
        if (this.viewContainerRef.length === 0) {
          this.viewContainerRef.createEmbeddedView(this.templateRef);
        }
        return;
      }

      this.viewContainerRef.clear();
    });
  }
}
