import { Directive, ElementRef, HostListener, Input } from '@angular/core';
import { NgControl } from '@angular/forms';

@Directive({
    selector: 'input[disableKeyboardKey]'
})
export class DisableKeyboardKeyDirective {

    constructor(private _el: ElementRef) { }

    @HostListener('keydown', ['$event'])
    onkeydown(e: KeyboardEvent) {
        debugger;
        //console.log(this._el.nativeElement.value);
        //e.stopImmediatePropagation();
        e.preventDefault();
    }

}