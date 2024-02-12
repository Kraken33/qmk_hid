import pipe from 'lodash/fp/pipe';

import { QMKCommands } from "../types/command";
import { UInt8t } from '../types/common';
import { hid } from './hid';

const number2Bytes = (num: number) => {
    if (num < 255)
        return [num as UInt8t];
    let result: UInt8t[] = [];
    let inputNumber = num;

    while (inputNumber > 0) {
        if (inputNumber > 255) {
            result.push(255);
            inputNumber -= 255;
        } else {
            result.push(inputNumber as UInt8t);
            inputNumber = 0;
        }
    }

    return result;
}

const muttableiFllTo32Bytes = (arr: any[])=>{
    if(arr.length%32 !== 0)
        for(let i = arr.length%32; i < 32; i++){
            arr.push(0);
        }

    return arr;
}

const muttableAddRenderBufferCommand = ({ screenIndex, x, y, size }: { screenIndex: UInt8t; x: UInt8t; y: UInt8t; size: number })=>(oledBytes: UInt8t[])=>{
    const oledCommands = [];
    oledCommands.push(screenIndex);
    oledCommands.push(QMKCommands.renderBuffer);
    oledCommands.push(x);
    oledCommands.push(y);
    const sizeBytes = number2Bytes(size);
    for(let elem of sizeBytes)
        oledCommands.push(elem);

    return {oledCommands, oledBytes};
}

const mullableAddOledBufferCommands = ({ screenIndex }: { screenIndex: UInt8t }) => ({oledBytes, oledCommands}: {oledBytes: UInt8t[], oledCommands: UInt8t[]})=>{
    muttableiFllTo32Bytes(oledCommands);
    for(let i = 0, j = 32; i < oledBytes.length; i++) {
        if(i % 30 === 0) {
            oledCommands.push(screenIndex);
            oledCommands.push(QMKCommands.oledBuffer);
            j+=2;
        }
        oledCommands[j] = oledBytes[i];
        j++;
    }
    muttableiFllTo32Bytes(oledCommands);

    return oledCommands;
}

const render = ({ x, y, screenIndex = 1 }: { x: UInt8t; y: UInt8t; screenIndex?: UInt8t }) => (oledBytes: Array<UInt8t>) => {
    pipe(
        muttableAddRenderBufferCommand({screenIndex, x, y, size: oledBytes.length}),
        mullableAddOledBufferCommands({screenIndex}),
        hid.send
    )(oledBytes);
};

export const oled = {
    render,
}