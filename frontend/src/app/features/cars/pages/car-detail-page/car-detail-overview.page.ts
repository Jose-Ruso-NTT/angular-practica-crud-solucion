import { CurrencyPipe, DatePipe, DecimalPipe, TitleCasePipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { ButtonDirective } from '@shared/directives/button-directive';
import { CarDetailPage } from '@features/cars/pages/car-detail-page/car-detail.page';

@Component({
  selector: 'app-car-detail-overview-page',
  imports: [RouterLink, ButtonDirective, CurrencyPipe, DatePipe, DecimalPipe, TitleCasePipe],
  templateUrl: './car-detail-overview.page.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CarDetailOverviewPage {
  protected readonly car = inject(CarDetailPage).car;
}
