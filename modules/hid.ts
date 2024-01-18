import { UInt8t } from "../types/common";
// @ts-ignore: Unreachable code error
import { keyboard } from "./keyboard.js";
import { intervals } from "./timer";

const send = (bytesPackage: UInt8t[]) => {
    const kbd = keyboard.use();
    try {
        kbd.write(bytesPackage);
    } catch (e) {
        intervals.pause();
        keyboard.waitForDevice().then(() => {
            intervals.resume();
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