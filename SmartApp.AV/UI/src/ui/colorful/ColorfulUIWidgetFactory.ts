import * as Logger from '../../log/Logger';

import { UIWidget, UIWidgetFactory } from '../../ui/widget/UIWidget';
import { IContent, SpeechContent, GenericContent } from '../../content/Content';
import { TextUIWidget } from './widget/TextUIWidget';
import { DefaultUIWidget } from './widget/DefaultUIWidget';

/**
 * Widget factory that builds widget for ElfColorfulUI
 */
export class ColorfulUIWidgetFactory implements UIWidgetFactory {
    private logger = Logger.getInstance();

    create(content: IContent): Array<UIWidget> {
        if (content instanceof SpeechContent) {
            return [new TextUIWidget(content.getText())];
        } else if (content instanceof GenericContent) {
            return [new DefaultUIWidget(content.getData())];
        }

        Logger.getInstance().log(Logger.LEVEL.WARNING, "Content not recognized", content);
        return null;
    }
}
