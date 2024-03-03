import dayjs from 'dayjs';
import flowRight from 'lodash/fp/flowRight';
import { widget } from '../modules/widget';
import { repeatEvery } from '../modules/timer';
import { render, useState } from '../modules/renderUtils';
import { asyncPipe } from '../modules/fp';

export const currentTimeWidget = flowRight(
    useState((setState: any) => {
        repeatEvery(60_000)(() => {
            setState({
                time: dayjs(Date.now()).format('HH:mm')
            })
        })
    }),
    render(async ({ time }) => {
        return asyncPipe(
            widget.create,
            widget.addText(time, { size: 17 }),
        )({ width: 32, height: 22 });
    }, { x: 14, y: 0, screenIndex: 1 }),
);