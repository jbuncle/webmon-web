import { Util } from "./util";

export class SelectBox {
 
 
    public constructor(
        private readonly element: HTMLSelectElement,
    ) {
        
    }
    
    public onChange(eventListener: EventListener): void {
        this.element.addEventListener("change", eventListener);
    }
    
    public getValue() :string {
        return this.element.value;
    }
    
    public addOption(label: string, value: string): void {
        const document : HTMLDocument | null= this.element.ownerDocument;
        
        if (document=== null) {
            throw new Error("Failed to get doc");
        }
        const option: HTMLOptionElement =document.createElement("option");
        option.text = label;
        option.value = value;
        this.element.appendChild(option);
    }
    
}