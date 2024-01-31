import pipe from 'lodash/fp/pipe';
import dotenv from 'dotenv';
// @ts-ignore: Unreachable code error
import { keyboard } from './modules/keyboard';
import { asyncQueue } from './modules/func';
import { intervals } from './modules/timer';

import { currentTimeWidget } from './widgets/currentTime';
import { weatherWidget } from './widgets/weather';
import { socialQrWidget } from './widgets/socialQr';
import { rightScreenWedget } from './widgets/rightScreen';

dotenv.config();

const registerWidgets = (widgets: Array<() => void>) => pipe(...widgets);

const execWidgets = registerWidgets([
    currentTimeWidget,
    socialQrWidget,
    weatherWidget,
    rightScreenWedget,
]);

function onDisconnect() {
    intervals.stop();
    asyncQueue.clear();
    keyboard.waitForDevice(execWidgets, onDisconnect);
}

keyboard.waitForDevice(execWidgets, onDisconnect);

