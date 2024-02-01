import { asyncPipe } from '../modules/fp';
import { widget } from '../modules/widget';
import { oled } from '../modules/oled';
import { Widget } from '../types/widget';
import { UInt8t } from '../types/common';

export const useState = <T>(stateCb: (cb: (state: T) => void) => void) => (widgetCb: (state: T) => Promise<void>) => {
    const setState = (state: T) => {
        widgetCb(state);
    }

    return stateCb(setState);
}

export const render = <T = any>(currentWidget: (state: T) => Promise<Widget>, { x, y, screenIndex }: { x: UInt8t, y: UInt8t, screenIndex: 1 | 2 }) => () => asyncPipe(
    currentWidget,
    widget.convert2Bytes,
    oled.render({ x, y, screenIndex })
)