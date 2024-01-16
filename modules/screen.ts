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

const create = (screenDefinition: Array<{ x: number; y: number; initialState: Record<string, any>; effect(s: Record<string, any>, up: (p: Record<string, any>)=> Record<string, any>): Promise<void> | void; render(s: Record<string, any>): Promise<Widget> }>) => {
    const screenRoot = screenDefinition.map((widget) => {
        const widgetRoot = {
            ...widget, currentState: widget.initialState, update: (state: any) => {
                const nextState = {
                    ...widgetRoot.currentState,
                    ...state,
                }

                widgetRoot.currentState = nextState;
                widget.render(nextState).then((widgetResult) => {
                    const widgetInBytes = imageModule.parse(widgetResult);
                    sendWidget(widget.x as UInt8t, widget.y as UInt8t, widgetInBytes.length)(widgetInBytes);
                });

                return nextState;
            }
        }

        return widgetRoot;
    });

    screenRoot.forEach(async (widget) => {
        await widget.effect(widget.currentState, widget.update);
        const widgetInBytes = imageModule.parse(await widget.render(widget.currentState));
        sendWidget(widget.x as UInt8t, widget.y as UInt8t, widgetInBytes.length)(widgetInBytes);
    })
}

export default {
    create,
}