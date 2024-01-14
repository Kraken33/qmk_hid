import { Widget } from "../types/widget";
import pipe from 'lodash/fp/pipe';
import flatten from 'lodash/fp/flatten';
import { UInt8t } from '../types/common';
import bytes from './bytes';
import oled from './oled';
import hid from './hid';
// @ts-ignore: Unreachable code error
import imageModule from './image';

const sendWidget = (x: UInt8t, y: UInt8t, size: number) => pipe(
    bytes.chunk(31),
    oled.addOledBufferCommandId2Chunks,
    oled.addRenderBufferCommandPackage([x, y, bytes.int2Bytes(size)]),
    flatten,
    hid.send
);

const create = (screenDefinition: Array<{ x: number; y: number; state: Record<string, any>; effect(s: Record<string, any>): void; render(s: Record<string, any>): Promise<Widget> }>) => {
    const screenE = screenDefinition.map((widget) => ({
        ...widget, __state: new Proxy(widget.state, {
            set(ob, name, value) {
                const ref = Reflect.set(ob, name, value);
                widget.render(ob).then((widgetResult)=>{
                    const widgetInBytes = imageModule.parse(widgetResult);
                    sendWidget(widget.x as UInt8t, widget.y as UInt8t, widgetInBytes.length)(widgetInBytes);
                });

                return ref;
            }
        })
    }));

    screenE.forEach(async (widget)=>{
        widget.effect(widget.__state);
        const widgetInBytes = imageModule.parse(await widget.render(widget.state));
        sendWidget(widget.x as UInt8t, widget.y as UInt8t, widgetInBytes.length)(widgetInBytes); 
    })
}

export default {
    create,
}