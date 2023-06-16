import { Component } from '@angular/core';
@Component({
    selector: 'rebar-home',
    templateUrl: './home.html'
})

export class HomeComponent {

    message = 'Home Page';
    user = 'REBAR';
    constructor() { }

    setMessage(newMessage: string) {
        this.message = newMessage;
    }


    clearMessage() {
        this.message = '';
    }
}

