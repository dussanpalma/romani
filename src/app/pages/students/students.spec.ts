import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Contacts } from './students';

describe('Students', () => {
  let component: Contacts;
  let fixture: ComponentFixture<Students>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Students]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Students);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
