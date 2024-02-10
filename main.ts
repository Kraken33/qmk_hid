import { pipe } from 'lodash/fp';
import { config as dotenvConfig } from 'dotenv';
import { spawn } from 'node:child_process';
import { keyboard } from './modules/keyboard';

import { currentTimeWidget } from './widgets/currentTime';
import { weatherWidget } from './widgets/weather';
import { socialQrWidget } from './widgets/socialQr';
import { rightScreenWedget } from './widgets/rightScreen';

console.log(process.pid);

dotenvConfig();

const registerWidgets = (widgets: Array<() => void>) => pipe(...widgets);

const execWidgets = registerWidgets([
    currentTimeWidget,
    socialQrWidget,
    weatherWidget,
    rightScreenWedget,
]);

function onDisconnect() {
    if (process.env.CPP_WATCHER_PWD) {
        const childProcess = spawn(process.env.CPP_WATCHER_PWD, {
            detached: true,
            stdio: ['ignore', 'ignore', 'ignore']
        });

        childProcess.unref();
    }
    process.exit();
}

keyboard.waitForDevice(execWidgets, onDisconnect);

