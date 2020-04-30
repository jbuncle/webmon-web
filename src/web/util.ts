export type Map<T> = {[key: string]: T;};
export type NumericMap<T> = {[key: number]: T;};

export class Util {

    private readonly elements: NodeListOf<Element>;

    public constructor(selector: string) {
        this.elements = document.querySelectorAll(selector);
    }

    public first(): Element | undefined {
        if (this.elements.length) {
            return this.elements.item(0);
        }
        return undefined;
    }
    public value(): string | undefined {
        const first: Element | undefined = this.first();
        if (first !== undefined) {
            return (<HTMLInputElement> first).value;
        }
        return undefined;
    }
    public on(event: string, handler: EventListener): Util {
        for (let index = 0; index < this.elements.length; index++) {
            const element: Element = this.elements[index]
            element.addEventListener(event, handler);
        }
        return this;
    }

    public static objectSort<T>(
        unordered: {[data: string]: T},
        callback: (a: string, b: string) => number
    ): {[data: string]: T} {
        const ordered: {[data: string]: T} = {};
        Object.keys(unordered).sort(callback).forEach(function (key) {
            ordered[key] = unordered[key];
        });
        return ordered;
    }
    public static arrayUnique<T>(data: Array<T>): Array<T> {
        return data.filter((value, index, self) => {
            return self.indexOf(value) === index;
        });
    }

    public static getAll<T>(
        urls: string[],
        success: (data: {[data: string]: T | undefined}) => void,
        error: (error: Event | number) => void
    ): void {

        const allData: {[data: string]: T | undefined} = {};

        Util.each(urls, (index, url: string) => {
            Util.get(url, (data: T) => {
                urls.splice(urls.indexOf(url), 1)
                allData[url] = data;
                if (urls.length < 1) {
                    success(allData);
                }
            }, (err: ErrorEvent) => {
                urls.splice(urls.indexOf(url))
                allData[url] = undefined;
                if (urls.length < 1) {
                    success(allData);
                }

                error(err);
            });
        });
    }

    public static promiseGet<T>(url: string): Promise<T> {
        return new Promise((resolutionFunc, rejectionFunc) => {
            Util.get(url, resolutionFunc, rejectionFunc);
        });
    }

    public static get(
        url: string,
        success: (data: any) => void,
        error: (error: any) => void
    ) {
        const request: XMLHttpRequest = new XMLHttpRequest();
        request.open('GET', url, true);
        request.onload = function () {
            if (this.status >= 200 && this.status < 400) {
                // Success!
                success(this.response);
            } else {
                // We reached our target server, but it returned an error
                error(this.status);
            }
        };
        request.onerror = (e: Event) => {
            // There was a connection error of some sort
            error(e);
        };
        request.send();

    }



    public static each<T>(arr: Array<T> | NumericMap<T>, fn: (index: number, item: T) => void): void {
        if (Array.isArray(arr)) {
            for (var index = 0; index < arr.length; index++) {
                var item = arr[index];
                fn.call(item, index, item);
            }
        } else {
            for (let key in arr) {
                fn.call(arr[key], key, arr[key]);
            }
        }
    }
    public static items<T>(arr: Map<T>, fn: (index: string, item: T) => void): void {
        for (let key in arr) {
            fn.call(arr[key], key, arr[key]);
        }
    }

    public static ready(fn) {
        if (document.readyState != 'loading') {
            fn();
        } else {
            document.addEventListener('DOMContentLoaded', fn);
        }
    }
};
