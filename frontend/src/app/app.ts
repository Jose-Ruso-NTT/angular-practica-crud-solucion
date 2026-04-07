import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { NotificationCenterComponent } from '@shared/components/notification-center.component';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, NotificationCenterComponent],
  template: `
    <router-outlet />
    <app-notification-center />
  `,
})
export class App {}
