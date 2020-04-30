import {Util} from './util';
import {Api} from './api';
import {Controller} from './controller';

Util.ready(function () {


    const api: Api = new Api();
    
    const container: HTMLElement | null = document.getElementById('container');
    if (container === null) {
        throw new Error("Failed to find #container");
    }
    
    const controller: Controller = new Controller(api, container);
    
    const $durationCapControl = jQuery('#durationCap');
    $durationCapControl.on('change', (e: Event) => {
        e.preventDefault();

        const element: HTMLInputElement = <HTMLInputElement> e.target;
        const value = parseInt(element.value);
        controller.updateCap(value);
    });

    const initialCapRaw: string | number | string[] | undefined = $durationCapControl.val();
    let initialCap: number = 600;
    if (typeof initialCapRaw === 'string') {
        initialCap = parseInt(initialCapRaw);
    } else if (typeof initialCapRaw === 'number') {
        initialCap = initialCapRaw;
    }

    controller.render(initialCap);
});
