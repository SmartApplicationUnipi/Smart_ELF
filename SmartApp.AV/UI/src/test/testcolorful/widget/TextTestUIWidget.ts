import { UIWidget } from '../../../ui/widget/UIWidget';

/**
 * Widget that display text.
 */
export class TextTestUIWidget implements UIWidget {
	constructor(private text: string) { }

	render(): string {
		return "<div>" + this.text + "</div>";
	}
}