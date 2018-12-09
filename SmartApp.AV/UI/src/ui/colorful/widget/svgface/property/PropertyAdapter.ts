import { ISBEEmotion } from "../../../../../emotion/Emotion";
import { WeightedMeanCombiner } from "../../../../../utils/Combiners";

export abstract class PropertyAdapter {
    public getPropertyValues(emotion: ISBEEmotion): object {
        let values: Array<{ alpha: number, value: object }> = [
            { alpha: emotion.getSadness(), value: this.sadness(emotion.getSadness()) },
            { alpha: emotion.getDisgust(), value: this.disgust(emotion.getDisgust()) },
            { alpha: emotion.getAnger(), value: this.anger(emotion.getAnger()) },
            { alpha: emotion.getSurprise(), value: this.surprise(emotion.getSurprise()) },
            { alpha: emotion.getFear(), value: this.fear(emotion.getFear()) },
            { alpha: emotion.getHappiness(), value: this.happiness(emotion.getHappiness()) },
            { alpha: emotion.getCalm(), value: this.calm(emotion.getCalm()) }
        ];

        let combiners = values.reduce((dict, val) => {
            Object.keys(val.value).map(property => {
                if (!dict[property]) {
                    dict[property] = new WeightedMeanCombiner(); // TODO: Let the concrete class choose the Combiner
                }

                dict[property].set({ weight: val.alpha, element: val.value[property] });
            });

            return dict;
        }, {});

        Object.keys(combiners).forEach(key => {
            combiners[key] = combiners[key].result();
        })

        return combiners;
    }

    abstract sadness(sadness: number): object;
    abstract disgust(disgust: number): object;
    abstract anger(anger: number): object;
    abstract surprise(surprise: number): object;
    abstract fear(fear: number): object;
    abstract happiness(happiness: number): object;
    abstract calm(calm: number): object;
    abstract defensive(defensive: number): object;
}