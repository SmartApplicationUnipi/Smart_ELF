import { UIWidget } from '../../widget/UIWidget';

/**
 * Widget that display text.
 */
export class TextUIWidget implements UIWidget {
	constructor(private text: string) { }

	render(): string {
		return "<div>" + this.text + "</div>";
	}
}