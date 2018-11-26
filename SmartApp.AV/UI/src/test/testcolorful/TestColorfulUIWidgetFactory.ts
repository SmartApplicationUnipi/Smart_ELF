import * as Logger from '../../log/Logger';

import { UIWidget, UIWidgetFactory } from '../../ui/widget/UIWidget';
import { IContent, SpeechContent, GenericContent } from '../../content/Content';
import { TextTestUIWidget } from './widget/TextTestUIWidget';
import { DefaultUIWidget } from './widget/DefaultTestUIWidget';

/**
 * Widget factory that builds widget for ElfColorfulUI
 */
export class TestColorfulUIWidgetFactory implements UIWidgetFactory {
    private logger = Logger.getInstance();

    create(content: IContent): Array<UIWidget> {
        if (content instanceof SpeechContent) {
            return [new TextTestUIWidget(content.getText())];
        } else if (content instanceof GenericContent) {
            return [new DefaultUIWidget(content.getData())];
        }

        Logger.getInstance().log(Logger.LEVEL.WARNING, "Content not recognized", content);
        return null;
    }
}
