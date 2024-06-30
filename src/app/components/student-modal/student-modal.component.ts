import { Component, Input, Output, EventEmitter, inject } from '@angular/core';
import { NgbActiveModal, NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { CommonModule } from '@angular/common';
import {
  FormsModule,
  ReactiveFormsModule,
  FormBuilder,
  FormGroup,
  Validators,
} from '@angular/forms';
import { NgSelectModule } from '@ng-select/ng-select';
import { NgbDatepickerModule, NgbDateStruct } from '@ng-bootstrap/ng-bootstrap';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { StudentService } from '../../services/student.service';
import Swal from 'sweetalert2';
import { catchError, map } from 'rxjs/operators';
import { throwError } from 'rxjs';

@Component({
  selector: 'app-student-modal',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    CommonModule,
    FormsModule,
    NgSelectModule,
    NgbModule,
    NgbDatepickerModule,
    HttpClientModule,
  ],
  providers: [StudentService],
  templateUrl: './student-modal.component.html',
  styleUrl: './student-modal.component.css',
})
export class StudentModalComponent {
  @Input() modalTitle: string = '';
  @Input() student: any;
  @Output() studentUpdated = new EventEmitter<any>();
  @Output() studentAdded = new EventEmitter<any>();
  countries: any[] = [];
  isEditMode: boolean = false;
  studentId: any = '';
  dateOfBirth: NgbDateStruct | null = null;
  studentForm: FormGroup;
  originalStudentData: any;
  minDate!: NgbDateStruct;
  maxDate!: NgbDateStruct;

  genders = [
    { id: 1, name: 'Male' },
    { id: 2, name: 'Female' },
  ];

  constructor(
    public activeModal: NgbActiveModal,
    private http: HttpClient,
    private fb: FormBuilder,
    private studentService: StudentService
  ) {
    this.studentForm = this.fb.group({
      firstName: ['', Validators.required],
      lastName: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      gender: ['', Validators.required],
      country: ['', Validators.required],
      dateOfBirth: [null, Validators.required],
    });

    const today = new Date();
    const currentYear = today.getFullYear();
    const currentMonth = today.getMonth() + 1;
    const currentDay = today.getDate();

    this.maxDate = {
      year: currentYear - 14,
      month: currentMonth,
      day: currentDay,
    };
    this.minDate = {
      year: currentYear - 24,
      month: currentMonth,
      day: currentDay,
    };
  }

  ngOnInit() {
    if (this.student?.id) {
      this.isEditMode = true;
      this.studentId = this.student.id;
      this.originalStudentData = { ...this.student };
      this.student.dateOfBirth = this.dateStringToNgbDateStruct(
        this.student.dateOfBirth
      );
      this.originalStudentData.dateOfBirth = this.dateStringToNgbDateStruct(
        this.originalStudentData.dateOfBirth
      );
    }
    this.fetchCountries();
  }

  fetchCountries() {
    this.http.get<any[]>('assets/countries.json').subscribe({
      next: (data) => {
        this.countries = data;
      },
      error: (error) => {
        console.error('Error loading countries:', error);
      },
    });
  }

  dateStringToNgbDateStruct(dateString: string): NgbDateStruct | null {
    if (!dateString) return null;
    const date = new Date(dateString);
    return {
      year: date.getFullYear(),
      month: date.getMonth() + 1,
      day: date.getDate(),
    };
  }

  populateFormForSave(student: any) {
    this.studentForm.patchValue({
      firstName: student.firstName,
      lastName: student.lastName,
      email: student.email,
      gender: student.gender,
      country: student.country,
      dateOfBirth: this.dateStructToString(student.dateOfBirth),
    });
  }

  markAllAsTouched(formGroup: FormGroup) {
    Object.values(formGroup.controls).forEach((control) => {
      control.markAsTouched();
      if (control instanceof FormGroup) {
        this.markAllAsTouched(control);
      }
    });
  }

  dateStructToString(dateStruct: NgbDateStruct | null): string | null {
    if (!dateStruct) return null;
    const date = new Date(
      dateStruct.year,
      dateStruct.month - 1,
      dateStruct.day
    );
    return date.toISOString().split('T')[0];
  }

  closeModal() {
    this.activeModal.dismiss('Cross click');
  }

  save() {
    this.populateFormForSave(this.student);

    if (this.studentForm.valid) {
      const formData = this.studentForm.value;
      if (this.isEditMode && this.student) {
        if (this.isFormValueChanged(this.student, this.originalStudentData)) {
          this.studentService
            .updateStudent(this.studentId, formData)
            .pipe(
              catchError((error) => {
                if (error.error.message === 'Email is already taken') {
                  Swal.fire({
                    icon: 'error',
                    title: 'Error',
                    text: 'Email is already taken',
                    confirmButtonText: 'OK',
                  });
                }
                throw error;
              })
            )
            .subscribe((response) => {
              Swal.fire({
                icon: 'success',
                title: 'Student Updated',
                text: 'Student updated successfully!',
                confirmButtonText: 'OK',
              }).then(() => {
                this.activeModal.close(response);
                this.studentUpdated.emit(response);
              });
            });
        } else {
          this.activeModal.dismiss('cancel');
        }
      } else {
        this.studentService
          .createStudent(formData)
          .pipe(
            catchError((error) => {
              if (error.error.message === 'Email is already taken') {
                Swal.fire({
                  icon: 'error',
                  title: 'Error',
                  text: 'Email is already taken',
                  confirmButtonText: 'OK',
                });
              }
              throw error;
            })
          )
          .subscribe((response) => {
            Swal.fire({
              icon: 'success',
              title: 'Student Created',
              text: 'Student created successfully!',
              confirmButtonText: 'OK',
            }).then(() => {
              this.activeModal.close(response);
              this.studentAdded.emit(response);
            });
          });
      }
    } else {
      this.markAllAsTouched(this.studentForm);
    }
  }
  isFormValueChanged(newData: any, originalData: any): boolean {
    return JSON.stringify(newData) !== JSON.stringify(originalData);
  }

  clearGender() {
    this.studentForm.patchValue({
      gender: '',
    });
  }

  clearCountry() {
    this.studentForm.patchValue({
      country: '',
    });
  }
}
