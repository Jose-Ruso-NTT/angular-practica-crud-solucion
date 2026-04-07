import { Pipe, PipeTransform } from '@angular/core';
import { CAR_DOCUMENT_TYPE_LABELS, CarDocumentType } from '@shared/models/car.models';

@Pipe({
  name: 'carDocumentTypeLabel',
})
export class CarDocumentTypeLabelPipe implements PipeTransform {
  transform(value: CarDocumentType | null | undefined): string {
    if (!value) {
      return '';
    }

    return CAR_DOCUMENT_TYPE_LABELS[value] ?? value;
  }
}
