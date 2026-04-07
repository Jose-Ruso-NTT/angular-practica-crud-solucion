import { booleanAttribute, Directive, input } from '@angular/core';

type ButtonVariant = 'primary' | 'secondary' | 'danger' | 'danger-secondary' | 'ghost';
type ButtonSize = 'md' | 'sm' | 'xs' | 'icon' | 'icon-sm';

@Directive({
  selector: 'button[appButton], a[appButton]',
  host: {
    class: 'btn-base',
    '[class.btn-primary]': 'appButton() === "primary"',
    '[class.btn-secondary]': 'appButton() === "secondary"',
    '[class.btn-danger]': 'appButton() === "danger"',
    '[class.btn-danger-secondary]': 'appButton() === "danger-secondary"',
    '[class.btn-ghost]': 'appButton() === "ghost"',
    '[class.btn-loading]': 'appButtonLoading()',
    '[class.btn-md]': 'appButtonSize() === "md"',
    '[class.btn-sm]': 'appButtonSize() === "sm"',
    '[class.btn-xs]': 'appButtonSize() === "xs"',
    '[class.btn-icon]': 'appButtonSize() === "icon"',
    '[class.btn-icon-sm]': 'appButtonSize() === "icon-sm"',
    '[attr.aria-busy]': 'appButtonLoading() ? "true" : null',
    '[attr.aria-disabled]': 'appButtonLoading() ? "true" : null',
    '[attr.data-loading]': 'appButtonLoading() ? "true" : null',
  },
})
export class ButtonDirective {
  readonly appButton = input<ButtonVariant>('secondary');
  readonly appButtonSize = input<ButtonSize>('md');
  readonly appButtonLoading = input(false, { transform: booleanAttribute });
}
