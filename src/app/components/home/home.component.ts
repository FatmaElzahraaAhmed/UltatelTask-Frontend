import { CommonModule } from '@angular/common';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { NgSelectModule } from '@ng-select/ng-select';
import { StudentService } from '../../services/student.service';
import Swal from 'sweetalert2';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { StudentModalComponent } from '../student-modal/student-modal.component';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [NgSelectModule, CommonModule, FormsModule, HttpClientModule],
  templateUrl: './home.component.html',
  styleUrl: './home.component.css',
})
export class HomeComponent {
  selectedCountry: any;
  selectedGender: any;
  selectedEntry: any;
  countries: any[] = [];
  students: any[] = [];
  filteredStudents: any[] = [];
  currentPage: number = 1;
  totalPages: number = 0;
  pageSize: number = 10;
  sortColumn: string = '';
  sortDirection: 'asc' | 'desc' = 'asc';

  selectedName: string = '';
  selectedMinAge: number | null = null;
  selectedMaxAge: number | null = null;

  genders = [
    { id: 1, name: 'Male' },
    { id: 2, name: 'Female' },
  ];
  entries = [
    { id: 1, name: '10' },
    { id: 2, name: '25' },
    { id: 3, name: '50' },
    { id: 4, name: '75' },
    { id: 5, name: '100' },
  ];

  constructor(
    private http: HttpClient,
    private router: Router,
    private studentService: StudentService,
    private modalService: NgbModal
  ) {}

  ngOnInit() {
    this.fetchCountries();
    this.fetchStudents();
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

  pagesArray(): number[] {
    return Array.from({ length: this.totalPages }, (_, i) => i + 1);
  }

  fetchStudents() {
    this.studentService.getAllStudents().subscribe({
      next: (data) => {
        this.students = data;
        this.filteredStudents = data;
        this.totalPages = Math.ceil(
          this.filteredStudents.length / this.pageSize
        );
      },
      error: (error) => {
        console.error('Error fetching students:', error);
      },
    });
  }

  logout() {
    Swal.fire({
      title: 'Are you sure?',
      text: `You are about to Logout`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Yes, Logout!',
      cancelButtonText: 'Cancel',
    }).then((result) => {
      if (result.isConfirmed) {
        localStorage.removeItem('token');
        this.router.navigate(['/login']);
      }
    });
  }

  onEntriesChange() {
    this.totalPages = Math.ceil(this.filteredStudents.length / this.pageSize);
    this.goToFirstPage();
  }

  onEntriesClear() {
    this.selectedEntry = 10;
    this.pageSize = 10;
    this.onEntriesChange();
  }

  sortTable(column: string, search: boolean = false) {
    if (this.sortColumn === column && search == false) {
      this.sortDirection = this.sortDirection === 'asc' ? 'desc' : 'asc';
    } else {
      this.sortColumn = column;
      this.sortDirection = 'asc';
    }

    this.filteredStudents.sort((a, b) => {
      const compareA =
        typeof a[column] === 'string' ? a[column].toLowerCase() : a[column];
      const compareB =
        typeof b[column] === 'string' ? b[column].toLowerCase() : b[column];

      if (compareA < compareB) {
        return this.sortDirection === 'asc' ? -1 : 1;
      } else if (compareA > compareB) {
        return this.sortDirection === 'asc' ? 1 : -1;
      } else {
        return 0;
      }
    });
  }

  goToPage(page: number) {
    if (page >= 1 && page <= this.totalPages) {
      this.currentPage = page;
    }
  }

  goToFirstPage() {
    this.goToPage(1);
  }

  goToLastPage() {
    this.goToPage(this.totalPages);
  }

  goToPreviousPage() {
    this.goToPage(this.currentPage - 1);
  }

  goToNextPage() {
    this.goToPage(this.currentPage + 1);
  }

  searchStudents() {
    this.filteredStudents = this.students.filter((student) => {
      const nameMatch = student.name
        .toLowerCase()
        .includes(this.selectedName?.toLowerCase() ?? '');
      const countryMatch = this.selectedCountry
        ? student.country === this.selectedCountry
        : true;
      const genderMatch = this.selectedGender
        ? student.gender === this.selectedGender
        : true;
      const ageMatch =
        (this.selectedMinAge ? student.age >= this.selectedMinAge : true) &&
        (this.selectedMaxAge ? student.age <= this.selectedMaxAge : true);

      return nameMatch && countryMatch && genderMatch && ageMatch;
    });
    this.totalPages = Math.ceil(this.filteredStudents.length / this.pageSize);
    this.goToFirstPage();

    this.sortTable(this.sortColumn, true);
  }

  resetFilters() {
    this.selectedName = '';
    this.selectedCountry = null;
    this.selectedMinAge = null;
    this.selectedMaxAge = null;
    this.selectedGender = null;
    this.filteredStudents = [...this.students];
    this.sortTable(this.sortColumn, true);
  }

  get paginatedStudents(): any[] {
    const startIndex = (this.currentPage - 1) * this.pageSize;
    return this.filteredStudents.slice(startIndex, startIndex + this.pageSize);
  }

  getMaxIndexDisplayed(): number {
    const endIndex = this.currentPage * this.pageSize;
    return Math.min(endIndex, this.filteredStudents.length);
  }

  confirmDelete(student: any) {
    Swal.fire({
      title: 'Are you sure?',
      text: `You are about to delete ${student.name}.`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Yes, delete it!',
      cancelButtonText: 'Cancel',
    }).then((result) => {
      if (result.isConfirmed) {
        this.deleteStudent(student.id);
      }
    });
  }

  deleteStudent(studentId: number) {
    this.studentService.deleteStudent(studentId).subscribe(
      () => {
        Swal.fire('Deleted!', 'The student has been deleted.', 'success');
        this.filteredStudents = this.filteredStudents.filter(
          (s) => s.id !== studentId
        );
        this.students = this.students.filter((s) => s.id !== studentId);
        if (this.paginatedStudents.length === 0 && this.currentPage > 1) {
          this.currentPage--;
        }
        this.totalPages = Math.ceil(
          this.filteredStudents.length / this.pageSize
        );
      },
      (error) => {
        Swal.fire('Error!', 'Failed to delete the student.', 'error');
        console.error('Error deleting student:', error);
      }
    );
  }

  openAddEditModal(isAddMode: boolean, student?: any) {
    const modalRef = this.modalService.open(StudentModalComponent, {
      size: 'lg',
    });

    modalRef.componentInstance.modalTitle = isAddMode
      ? 'Add Student'
      : 'Edit Student';
    modalRef.componentInstance.student = student ? { ...student } : {};

    modalRef.componentInstance.studentUpdated.subscribe(
      (updatedStudent: any) => {
        this.updateStudentInList(updatedStudent);
      }
    );

    modalRef.componentInstance.studentAdded.subscribe((newStudent: any) => {
      this.addStudentToList(newStudent);
    });

  }

  updateStudentInList(updatedStudent: any) {
    let index = this.students.findIndex((s) => s.id === updatedStudent.id);
    if (index !== -1) {
      this.students[index] = updatedStudent;
    }
    index = this.filteredStudents.findIndex((s) => s.id === updatedStudent.id);
    if (index !== -1) {
      this.filteredStudents[index] = updatedStudent;
    }
  }

  addStudentToList(newStudent: any) {
    this.students.push(newStudent);
    if (this.students.length != this.filteredStudents.length) {
      this.filteredStudents.push(newStudent);
    }
    this.sortTable(this.sortColumn, true);
  }
}
