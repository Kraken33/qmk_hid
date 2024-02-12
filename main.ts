import { pipe } from 'lodash/fp';
import { config as dotenvConfig } from 'dotenv';
import { keyboard } from './modules/keyboard';

import { currentTimeWidget } from './widgets/currentTime';
import { weatherWidget } from './widgets/weather';
import { socialQrWidget } from './widgets/socialQr';
import { rightScreenWedget } from './widgets/rightScreen';

console.log(process.pid);

dotenvConfig({path: './.env'});

const registerWidgets = (widgets: Array<() => void>) => pipe(...widgets);

const execWidgets = registerWidgets([
    currentTimeWidget,
    socialQrWidget,
    weatherWidget,
    rightScreenWedget,
]);

function onDisconnect() {
    process.exit();
}

keyboard.waitForDevice(execWidgets, onDisconnect);

