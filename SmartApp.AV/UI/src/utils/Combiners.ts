export interface Combiner<Input, Output> {
    set(input: Input): Combiner<Input, Output>;
    result(): Output;
}

export class MeanCombiner implements Combiner<number, number> {
    private elements: Array<number> = new Array();

    public set(element: number): MeanCombiner {
        this.elements.push(element);
        return this;
    }

    public result(): number {
        if(this.elements.length == 0) {
            return 0;
        }

        return this.elements.reduce((sum, val) => sum + val, 0) / this.elements.length;
    }
}

export class WeightedMeanCombiner implements Combiner<{ element: number, weight: number }, number> {
    private elements: Array<{element: number, weight: number}> = new Array();

    public set(element: {element: number, weight: number}): WeightedMeanCombiner {
        this.elements.push(element);
        return this;
    }

    public result(): number {
        if(this.elements.length == 0) {
            return 0;
        }

        if(this.elements.length == 1) {
            return this.elements[0].weight * this.elements[0].element;
        }

        return this.elements.reduce((sum, val) => sum + val.element * val.weight, 0) / this.elements.reduce((sum, val) => sum + val.weight, 0);
    }
}

export class LinearCombiner implements Combiner<{ alpha: number, term: number }, number> {
    private elements: Array<{ alpha: number, term: number }> = new Array();

    public set(term: { alpha: number, term: number }): LinearCombiner {
        this.elements.push(term);
        return this;
    }

    public result(): number {
        return this.elements.reduce((sum, value) => sum + value.alpha * value.term, 0);
    }
}