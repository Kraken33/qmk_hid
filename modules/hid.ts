import { UInt8t } from "../types/common";
// @ts-ignore: Unreachable code error
import { connect2Keyboard } from "./keyboard.js";

const send = (bytesPackage:UInt8t[]) => {
    const kbd = connect2Keyboard();

    return kbd.write(bytesPackage);
}

export default {
    send,
}