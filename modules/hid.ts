import { UInt8t } from "../types/common";
import { keyboard } from "./keyboard";
import { asyncQueue } from './func';

const send = async (bytesPackage: UInt8t[]) => {
    const kbd = keyboard.use();
    for (let i = 0; i < bytesPackage.length; i++) {
        asyncQueue.add(async () => {
            debugger;
            kbd.write(bytesPackage[i]);
            const responseBuffer = await kbd.read(1000);
            const [status] = new Uint8ClampedArray(responseBuffer);
            if (status !== 200) {
                throw new Error(`HID: Status error: ${status}`);
            }
        });
    }
}

const resume = () => {
    const kbd = keyboard.use();
    return kbd.resume();
}

export default {
    send,
    resume,
}