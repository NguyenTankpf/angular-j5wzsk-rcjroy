import {
  Component, ElementRef, OnInit, ViewChild
} from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators'
import { AlbumService } from './album.service';
import { UserService } from './user.service';
import { Album } from './album.model';
import { User } from './user.model';
import { FormArray, FormGroup, FormBuilder } from '@angular/forms';
import { MatTableDataSource } from '@angular/material';
import { MatSort, Sort } from "@angular/material/sort";
import {SelectionModel} from '@angular/cdk/collections';
@Component({
  selector: 'table-form-app',
  templateUrl: 'app.component.html'
})
export class AppComponent implements OnInit {
  form: FormGroup;
  users: User[] = [];
  dataSource: MatTableDataSource<any>;
  displayedColumns = ['select','id', 'userId', 'title'];
   @ViewChild(MatSort,{static: false} ) sort: MatSort;
  lastSort: Partial<Sort> = {
  };
selection = new SelectionModel<any>(true, []);

  constructor(
    private _albumService: AlbumService,
    private _userService: UserService,
    private _formBuilder: FormBuilder
    ) {}

  /** Whether the number of selected elements matches the total number of rows. */
  isAllSelected() {
    const numSelected = this.selection.selected.length;
    const numRows = this.dataSource.data.length;
    return numSelected === numRows;
  }

  /** Selects all rows if they are not all selected; otherwise clear selection. */
  masterToggle() {
    this.isAllSelected() ?
        this.selection.clear() :
        this.dataSource.data.forEach(row => this.selection.select(row));
  }

  /** The label for the checkbox on the passed row */
  checkboxLabel(row?: any): string {
    if (!row) {
      return `${this.isAllSelected() ? 'select' : 'deselect'} all`;
    }
    return `${this.selection.isSelected(row) ? 'deselect' : 'select'} row ${row.position + 1}`;
  }
  ngOnInit() {
    this.form = this._formBuilder.group({
      albums: this._formBuilder.array([])
    });
    this._albumService.getAllAsFormArray().subscribe(albums => {
      this.form.setControl('albums', albums);
      this.dataSource = new MatTableDataSource((this.form.get('albums') as FormArray).controls);
      this.dataSource.sort = this.sort;
      // this.dataSource.filterPredicate = (data: FormGroup, filter: string) => { 
      //     return Object.values(data.controls).some(x => x.value == filter); 
      //   };
    });
    this._userService.getAll().subscribe(users => {
      this.users = users;
    })
  }

  get albums(): FormArray {
    return this.form.get('albums') as FormArray;
  }

  // On user change I clear the title of that album 
  onUserChange(event, album: FormGroup) {
    const title = album.get('title');

    title.setValue(null);
    title.markAsUntouched();
    // Notice the ngIf at the title cell definition. The user with id 3 can't set the title of the albums
  }

   onAdd(){
      const ab = new Album();
      (this.form.get('albums') as FormArray).push(Album.asFormGroup(ab));
       this.dataSource = new MatTableDataSource((this.form.get('albums') as FormArray).controls);
   }
   onClone(){
     console.log(this.selection);
   }
   sortChangeHandler(evt: Sort): void {
    if (confirm("Confirm question?")) {
      this.lastSort = {
        active: this.sort.active,
        direction: this.sort.direction
      };
    } else {
      this.sort.active = this.lastSort.active;
      this.sort.direction = this.lastSort.direction;
    }
  }
}
