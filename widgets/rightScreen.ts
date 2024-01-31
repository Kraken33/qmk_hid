import flowRight from 'lodash/fp/flowRight';
import fp from '../modules/fp';
import { widget } from '../modules/widget';
import { repeatEvery } from '../modules/timer';
import { render, useState } from '../modules/renderUtils';

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
    render(async ({ frameId }) => {
        const text = await fp.asyncPipe(
            widget.create,
            widget.addText('IN LOVE WITH TS', { size: 12 }),
            widget.rotate(90)
        )({ width: 124, height: 32 });
        return widget.combine(await widget.createImage(`./hear/frame_${frameId}_delay-0.03s.png`), 0, 0)(text);
    }, { x: 0, y: 0, screenIndex: 2 })
);