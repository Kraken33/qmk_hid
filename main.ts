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
    if (process.env.CXX_WATCHER_PWD && process.env.CXXWATCHER) {
        const childProcess = spawn(process.env.CXX_WATCHER_PWD, {
            detached: true,
            stdio: ['ignore', 'ignore', 'ignore']
        });

        childProcess.unref();
    }

    process.exit();
}

console.log(process.env.PID);

keyboard.waitForDevice(execWidgets, onDisconnect);

