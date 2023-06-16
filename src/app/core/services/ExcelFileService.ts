import { Injectable } from '@angular/core';  
import * as FileSaver from 'file-saver';  
import * as XLSX from 'xlsx';  
const EXCEL_TYPE = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8';  
const EXCEL_EXTENSION = '.xlsx';  
import { DatePipe } from '@angular/common';

@Injectable()  

export class ExcelFileService { 

  constructor(private datepipe: DatePipe) { }  

  public exportAsExcelFile(json: any[], excelFileName: string): void {     
    const worksheet: XLSX.WorkSheet = XLSX.utils.json_to_sheet(json);
    const workbook: XLSX.WorkBook = { Sheets: { 'Data': worksheet }, SheetNames: ['Data'] };
    const excelBuffer: any = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });  
    this.saveAsExcelFile(excelBuffer, excelFileName);  

    
  }  

  private saveAsExcelFile(buffer: any, fileName: string): void {  
     const data: Blob = new Blob([buffer], {type: EXCEL_TYPE});  
     FileSaver.saveAs(data, fileName + this.datepipe.transform(new Date(), 'dd-MM-yyyy hh:mm:ss') + EXCEL_EXTENSION);  
  }  
}  