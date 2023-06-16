import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of, throwError } from 'rxjs';
import { catchError, tap, map } from 'rxjs/operators';

@Injectable()
export class PagerService {

    public pageSize: number = 25;
    public pageNumber: number = 1;
    public selectedPageSize: number = 25;
    public pageOptions = [5, 10, 20, 25];//'5 10 20 25'.split(' ');

    public pageSizeView: number = 10;
    public pageNumberView: number = 1;
    public selectedPageSizeView: number = 10;
    public pageOptionsView = [5, 10, 20, 25];//'5 10 20 25'.split(' ');

    constructor(private http: HttpClient) {
    console.log('PagerService');
    }

    private handleError<T>(operation = 'operation', result?: T) { 
        return (error: any): Observable<T> => {
          console.error(error); 
          return of(result as T);
        };
      }

    getPager(totalItems: number, currentPage: number = 1, pageSize: number = this.pageSize  ) {
        // calculate total pages
        let totalPages = Math.ceil(totalItems / pageSize);

        // ensure current page isn't out of range
        if (currentPage < 1) { 
            currentPage = 1; 
        } else if (currentPage > totalPages) { 
            currentPage = totalPages; 
        }
        
        let startPage: number, endPage: number;
        if (totalPages <= 10) {
            // less than 10 total pages so show all
            startPage = 1;
            endPage = totalPages;
        } else {
            // more than 10 total pages so calculate start and end pages
            if (currentPage <= 6) {
                startPage = 1;
                endPage = 10;
            } else if (currentPage + 4 >= totalPages) {
                startPage = totalPages - 9;
                endPage = totalPages;
            } else {
                startPage = currentPage - 5;
                endPage = currentPage + 4;
            }
        }

       // calculate start and end item indexes
        let startIndex = (currentPage - 1) * pageSize;
        let endIndex = Math.min(startIndex + pageSize - 1, totalItems - 1);

        // create an array of pages to ng-repeat in the pager control
        let pages = Array.from(Array((endPage + 1) - startPage).keys()).map(i => startPage + i);

        // return object with all pager properties required by the view
        return {
            totalItems: totalItems,
            currentPage: currentPage,
            pageSize: pageSize,
            totalPages: totalPages,
            startPage: startPage,
            endPage: endPage,
            startIndex: startIndex,
            endIndex: endIndex,
            pages: pages
        };
    }
}
