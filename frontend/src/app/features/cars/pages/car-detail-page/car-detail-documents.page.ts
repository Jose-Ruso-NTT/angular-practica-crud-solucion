import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { CarDocumentsSectionComponent } from '@features/cars/components/car-documents-section/car-documents-section.component';
import { CarDetailPage } from '@features/cars/pages/car-detail-page/car-detail.page';

@Component({
  selector: 'app-car-detail-documents-page',
  imports: [CarDocumentsSectionComponent],
  templateUrl: './car-detail-documents.page.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CarDetailDocumentsPage {
  protected readonly car = inject(CarDetailPage).car;
}
