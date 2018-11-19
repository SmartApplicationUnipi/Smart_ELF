import { UIWidget } from '../../widget/UIWidget';

/**
 * Default widget that displays raw data.
 */
export class DefaultUIWidget implements UIWidget {
	constructor(private data: any) { }

	public getData() {
		return this.data;
	}

	render(): string {
		return JSON.stringify(this.data);
	}
}