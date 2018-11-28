import { isString } from "util";

export class CSSClassHelper {
    private classes: Array<string>;

    private base: string = "";

    constructor(private element: HTMLElement) {
        this.classes = new Array<string>();
    }

    /**
     * Set a string that must be always included
     * @param c the base class name
     */
    public setBaseClass(c: string = ""): CSSClassHelper {
        this.base = c;
        return this;
    }

    /**
     * Returns the CSS rule
     */
    public getCSSValue() {
        return this.base + this.classes.reduce((aggr, current) => aggr + " " + current, "");
    }

    /**
     * Adds a new class to handle
     * @param c the new class name
     */
    public add(c: string): CSSClassHelper {
        if (this.classes.indexOf(c) == -1) {
            this.classes.push(c);
        }

        this.updateElement();

        return this;
    }

    /**
     * Remove a class
     * @param c the class to be removed
     */
    public remove(c: string|Array<string>): CSSClassHelper {
        var cl = c;
        if(isString(c)) {
            cl = [c];
        }
        this.classes = this.classes.filter(it => cl.indexOf(it) == -1);
        
        this.updateElement();

        return this;
    }

    /**
     * Removes all classes
     */
    public clear(): CSSClassHelper {
        this.classes = [];
        this.updateElement();
        return this;
    }

    /**
     * Update the underlying element with new CSS classes
     */
    private updateElement(): void {
        this.element.className = this.getCSSValue();
    }
}