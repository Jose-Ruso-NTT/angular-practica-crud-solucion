import { Dialog } from '@angular/cdk/dialog';
import { DatePipe, TitleCasePipe, UpperCasePipe } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  ElementRef,
  inject,
  input,
  signal,
  viewChild,
} from '@angular/core';
import { takeUntilDestroyed, toObservable } from '@angular/core/rxjs-interop';
import { NonNullableFormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { finalize, map, of, switchMap } from 'rxjs';
import { AuthStore } from '@core/stores/auth.store';
import { FeedbackStore } from '@core/stores/feedback.store';
import { ConfirmDialogComponent } from '@shared/components/confirm-dialog.component';
import { InlineMessageComponent } from '@shared/components/inline-message.component';
import { ButtonDirective } from '@shared/directives/button-directive';
import { IfAdminDirective } from '@shared/directives/if-admin-directive';
import { CAR_DOCUMENT_TYPES, CarDocument, CarDocumentType } from '@shared/models/car.models';
import { formatBytes } from '@shared/utils/date.utils';
import { downloadBlob } from '@shared/utils/file-download.utils';
import { getHttpErrorMessage, hasHttpStatus } from '@shared/utils/http-error.utils';
import { CarDocumentsApiService } from '@features/cars/services/car-documents-api.service';
import {
  CarDocumentUploadFormControls,
  CarDocumentUploadFormGroup,
} from '@features/cars/components/car-documents-section/car-documents-section.models';

const DOCUMENT_UPLOAD_ACCEPT = '.pdf,.txt,.doc,.docx,.png,.jpg,.jpeg';
const DOCUMENT_UPLOAD_ALLOWED_TYPES_LABEL = 'PDF, TXT, DOC, DOCX, PNG, JPG o JPEG';
const DOCUMENT_UPLOAD_MAX_SIZE_LABEL = '5 MB';
const DOCUMENT_UPLOAD_MAX_SIZE_BYTES = 5 * 1024 * 1024;

@Component({
  selector: 'app-car-documents-section',
  imports: [
    ReactiveFormsModule,
    ButtonDirective,
    IfAdminDirective,
    InlineMessageComponent,
    DatePipe,
    TitleCasePipe,
    UpperCasePipe,
  ],
  templateUrl: './car-documents-section.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CarDocumentsSectionComponent {
  private readonly destroyRef = inject(DestroyRef);
  private readonly documentsApi = inject(CarDocumentsApiService);
  private readonly dialog = inject(Dialog);
  private readonly feedbackStore = inject(FeedbackStore);
  private readonly fb = inject(NonNullableFormBuilder);
  protected readonly authStore = inject(AuthStore);

  readonly carId = input.required<string>();
  protected readonly documentLoading = signal(false);
  protected readonly documentError = signal<string | null>(null);
  protected readonly document = signal<CarDocument | null>(null);
  protected readonly downloadPending = signal(false);
  protected readonly uploadPending = signal(false);
  protected readonly uploadError = signal<string | null>(null);
  protected readonly selectedFileName = signal<string | null>(null);
  private readonly selectedFile = signal<File | null>(null);
  private readonly fileInput = viewChild<ElementRef<HTMLInputElement>>('fileInput');

  protected readonly documentTypes = CAR_DOCUMENT_TYPES;
  protected readonly documentUploadAccept = DOCUMENT_UPLOAD_ACCEPT;
  protected readonly documentUploadAllowedTypesLabel = DOCUMENT_UPLOAD_ALLOWED_TYPES_LABEL;
  protected readonly documentUploadMaxSizeLabel = DOCUMENT_UPLOAD_MAX_SIZE_LABEL;

  protected readonly uploadForm: CarDocumentUploadFormGroup =
    this.fb.group<CarDocumentUploadFormControls>({
      title: this.fb.control(''),
      documentType: this.fb.control('other' as CarDocumentType, {
        validators: Validators.required,
      }),
      description: this.fb.control(''),
    });

  constructor() {
    this.subscribeToCarDocument();
  }

  private subscribeToCarDocument(): void {
    toObservable(this.carId)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((carId) => this.loadDocument(carId));
  }

  protected formatBytes(value: number): string {
    return formatBytes(value);
  }

  protected onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0] ?? null;

    if (file && file.size > DOCUMENT_UPLOAD_MAX_SIZE_BYTES) {
      this.clearSelectedFile();
      this.uploadError.set(
        `El archivo supera el tamaño máximo permitido de ${DOCUMENT_UPLOAD_MAX_SIZE_LABEL}.`,
      );
      input.value = '';
      return;
    }

    this.selectedFile.set(file);
    this.selectedFileName.set(file?.name ?? null);
    this.uploadError.set(null);
  }

  protected downloadDocument(): void {
    if (!this.document() || this.downloadPending()) {
      return;
    }

    this.downloadPending.set(true);

    this.documentsApi
      .downloadDocument(this.carId())
      .pipe(
        takeUntilDestroyed(this.destroyRef),
        finalize(() => this.downloadPending.set(false)),
      )
      .subscribe({
        next: (blob) => {
          downloadBlob(blob, this.document()!.originalName);
        },
        error: (error: unknown) => {
          this.feedbackStore.error(
            getHttpErrorMessage(error, 'No se ha podido descargar el documento.'),
          );
        },
      });
  }

  protected uploadDocument(): void {
    if (!this.selectedFile()) {
      this.uploadError.set('Selecciona un archivo antes de subirlo.');
      return;
    }

    this.uploadPending.set(true);
    this.uploadError.set(null);

    this.documentsApi
      .uploadDocument(this.carId(), {
        ...this.uploadForm.getRawValue(),
        file: this.selectedFile()!,
      })
      .pipe(
        takeUntilDestroyed(this.destroyRef),
        finalize(() => this.uploadPending.set(false)),
      )
      .subscribe({
        next: (document) => {
          this.document.set(document);
          this.documentError.set(null);
          this.clearSelectedFile();
          this.resetUploadForm();
          this.feedbackStore.success('Documento subido correctamente.');
        },
        error: (error: unknown) => {
          this.uploadError.set(getHttpErrorMessage(error, 'No se ha podido subir el documento.'));
        },
      });
  }

  protected deleteDocument(): void {
    const dialogRef = this.dialog.open<boolean>(ConfirmDialogComponent, {
      panelClass: 'vehicle-dialog-panel',
      backdropClass: 'vehicle-dialog-backdrop',
      data: {
        title: 'Eliminar documento',
        description: 'Se borrara el documento actual asociado al coche.',
        confirmLabel: 'Eliminar documento',
      },
    });

    dialogRef.closed
      .pipe(
        takeUntilDestroyed(this.destroyRef),
        switchMap((confirmed) =>
          confirmed
            ? this.documentsApi.deleteDocument(this.carId()).pipe(map(() => true))
            : of(false),
        ),
      )
      .subscribe({
        next: (deleted) => {
          if (!deleted) {
            return;
          }

          this.document.set(null);
          this.documentError.set(null);
          this.feedbackStore.success('Documento eliminado correctamente.');
        },
        error: (error: unknown) => {
          this.feedbackStore.error(
            getHttpErrorMessage(error, 'No se ha podido borrar el documento.'),
          );
        },
      });
  }

  private loadDocument(carId: string): void {
    this.documentLoading.set(true);
    this.documentError.set(null);

    this.documentsApi
      .getDocument(carId)
      .pipe(
        takeUntilDestroyed(this.destroyRef),
        finalize(() => this.documentLoading.set(false)),
      )
      .subscribe({
        next: (document) => {
          this.document.set(document);
          this.documentError.set(null);
        },
        error: (error: unknown) => {
          if (hasHttpStatus(error, 404)) {
            this.document.set(null);
            this.documentError.set(null);
            return;
          }

          this.document.set(null);
          this.documentError.set(getHttpErrorMessage(error));
        },
      });
  }

  private resetUploadForm(): void {
    this.uploadForm.reset({
      title: '',
      documentType: 'other',
      description: '',
    });
  }

  private clearSelectedFile(): void {
    this.selectedFile.set(null);
    this.selectedFileName.set(null);
    const input = this.fileInput()?.nativeElement;
    if (input) {
      input.value = '';
    }
  }
}
