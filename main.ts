import pipe from 'lodash/fp/pipe';
import flatten from 'lodash/fp/flatten';
import dayjs from 'dayjs';
import { UInt8t } from './types/common';
import bytes from './modules/bytes';
import oled from './modules/oled';
import hid from './modules/hid';
import widget from './modules/widget';
import fp from './modules/fp';
// @ts-ignore: Unreachable code error
import imageModule from './modules/image';
import path from 'node:path';

(async function main() {

    setInterval(async () => {
        const clockWidget = await fp.asyncPipe(
            widget.create,
            widget.addText(dayjs(Date.now()).format('HH:mm'))
        )({ width: 32, height: 10 });

        const dateWidget = await fp.asyncPipe(
            widget.create,
            widget.addText(dayjs(Date.now()).format('dd') + ' ' + dayjs(Date.now()).format('DD'))
        )({ width: 32, height: 10 });
        const weatherWidgetBytes = await widget.createImage(path.join(__dirname, './assets/images/moon1.png'));

        const topWidget = await fp.asyncPipe(
            widget.create,
            widget.combine(weatherWidgetBytes, 0, 0),
            widget.combine(dateWidget, 0, 32),
            widget.combine(clockWidget, 0, 42),
        )({ width: 32, height: 60 });


        const clockWidgetBytes = imageModule.parse(topWidget);

        const sendWidget = (y: UInt8t, size: number) => pipe(
            bytes.chunk(31),
            oled.addOledBufferCommandId2Chunks,
            oled.addRenderBufferCommandPackage([0, y, bytes.int2Bytes(size)]),
            flatten,
            hid.send
        );

        sendWidget(0, clockWidgetBytes.length)(clockWidgetBytes);
    }, 60_000);
})();