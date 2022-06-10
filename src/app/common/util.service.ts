import { Injectable } from "@angular/core";

@Injectable({
    providedIn: 'root'
})
export class UtilService {
    constructor() {}

    getPureType(_value: any) {
        return Object.prototype.toString.call(_value).slice(8, -1);
    }
}