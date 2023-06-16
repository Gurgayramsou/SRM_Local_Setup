import { Directive, ElementRef, HostListener, Input } from '@angular/core';
import { NgControl } from '@angular/forms';

@Directive({
    selector: 'input[decimalsOnly]'
})
export class DecimalDirective {

    constructor(private _el: ElementRef) { }

    @HostListener('keypress', ['$event'])
    onkeypress(e: KeyboardEvent) {
        debugger;
        const value = this._el.nativeElement.value;
        var decimalIndex = value.indexOf(".");
        if ((decimalIndex != -1 || e.keyCode != 46) && ((e.keyCode < 48 || e.keyCode > 57) && (e.keyCode != 0 && e.keyCode != 8))) {
            e.preventDefault();
        }
        if ((decimalIndex != -1) && (value.substring(value.indexOf('.')).length > 2) &&
            (e.keyCode != 0 && e.keyCode != 8) && (this._el.nativeElement.selectionStart >= value.length - 2)) {
            event.preventDefault();
        }

        var beforeDecimalLength = decimalIndex != -1 ? value.split(".")[0].length : value.length;
        var afterDecimalLength = decimalIndex != -1 ? value.split(".")[1].length : 0;
        if ((beforeDecimalLength >= 12) && (e.keyCode != 46) && (decimalIndex == -1)) {
            event.preventDefault();
        }
        else if ((beforeDecimalLength >= 12) && (decimalIndex != -1) && afterDecimalLength >= 2) {
            event.preventDefault();
        }
        else if ((beforeDecimalLength > 12) && (decimalIndex == -1) && afterDecimalLength >= 2) {
            event.preventDefault();
        }
    }

    @HostListener('input', ['$event']) onInputChange(event) {
        debugger;
        const initalValue = this._el.nativeElement.value;
        this._el.nativeElement.value = initalValue.replace(/[^0-9.]*/g, '');
        
        const value = this._el.nativeElement.value;
        var decimalIndex = value.indexOf(".");
        var beforeDecimalLength = decimalIndex != -1 ? value.split(".")[0].length : value.length;
        var afterDecimalLength = decimalIndex != -1 ? value.split(".")[1].length : 0;
        var decimalPOintCount = decimalIndex != -1 ? value.replace(/[^.]*/g, '').length : 0;
        if(beforeDecimalLength>12 || afterDecimalLength > 2 || decimalPOintCount > 1){
            this._el.nativeElement.value = null;
        }
        if(beforeDecimalLength == 0 && afterDecimalLength == 0){
            this._el.nativeElement.value = null;
        }
        if (initalValue !== this._el.nativeElement.value) {
            event.stopPropagation();
        }   
    }
}