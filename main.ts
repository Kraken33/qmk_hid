import { pipe } from 'lodash/fp';
import { config as dotenvConfig } from 'dotenv';
import { spawn } from 'node:child_process';
import { keyboard } from './modules/keyboard';

import { currentTimeWidget } from './widgets/currentTime';
import { weatherWidget } from './widgets/weather';
import { socialQrWidget } from './widgets/socialQr';
import { rightScreenWedget } from './widgets/rightScreen';
import { oled } from './modules/oled';

console.log(process.pid);

dotenvConfig();

const registerWidgets = (widgets: Array<() => void>) => pipe(...widgets);

const execWidgets = registerWidgets([
    // currentTimeWidget,
    // socialQrWidget,
    // weatherWidget,
    rightScreenWedget,
]);

// oled.render({x: 99, y: 99, screenIndex: 99})([0,0,0,0,0,0,0,0, 0,0,0,0,0,0,0,0, 0,0,0,0,0,0,0,0, 0,0,0,0, 0, 0, 0,0,0,0,0,0,0,0, 0,0,0,0,0,0,0,0, 0,0,0,0,0,0,0,0, 0,0,0,0, 0, 1]);

function onDisconnect() {
    console.error('Finish');
    process.exit();
}

keyboard.waitForDevice(execWidgets, onDisconnect);

