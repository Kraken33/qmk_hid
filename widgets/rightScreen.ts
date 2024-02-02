import flowRight from 'lodash/fp/flowRight';
import { asyncPipe, memoize } from '../modules/fp';
import { widget } from '../modules/widget';
import { repeatEvery } from '../modules/timer';
import { renderRaw, useState } from '../modules/renderUtils';


const getAnimationFrame = memoize(async ({ frameId }) => {
    const text = await asyncPipe(
        widget.create,
        widget.addText('IN LOVE WITH TS', { size: 12 }),
        widget.rotate(90)
    )({ width: 124, height: 32 });
    return widget.convert2Bytes(widget.combine(await widget.createImage(`./hear/frame_${frameId}_delay-0.03s.png`), 0, 0)(text));
});

export const rightScreenWedget = flowRight(
    useState((setState) => {
        repeatEvery(6000)(() => {
            let frameId = 0;

            const interval: any = setInterval(() => {
                if (frameId === 31)
                    return clearInterval(interval);
                const frameNormalized = frameId < 10 ? '0' + frameId : frameId;
                frameId++;

                setState({ frameId: frameNormalized });
            }, 100);
        })
    }),
    renderRaw(async ({ frameId }) => {
        return getAnimationFrame({ frameId });
    }, { x: 0, y: 0, screenIndex: 2 })
);