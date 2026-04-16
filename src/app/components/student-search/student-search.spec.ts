import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ContactSearch } from './student-search';

describe('StudentSearch', () => {
  let component: ContactSearch;
  let fixture: ComponentFixture<StudentSearch>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [StudentSearch]
    })
    .compileComponents();

    fixture = TestBed.createComponent(StudentSearch);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
