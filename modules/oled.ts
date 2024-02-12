import pipe from 'lodash/fp/pipe';
import concat from 'lodash/fp/concat';
import map from 'lodash/fp/map';

import { QMK32BytePackage, QMKCommands, QMKPackageBody, QMKPackage } from "../types/command";
import { bytes } from "./bytes";
import { UInt8t } from '../types/common';
import { hid } from './hid';

const addOledBufferCommandId2Chunks = ({ screenIndex }: { screenIndex: UInt8t }) => (chunks: QMK32BytePackage<QMKCommands.oledBuffer, QMKPackageBody>[]): QMKPackage[] => {
    const fillTo32ByteSize = bytes.fill2FixedSize(32);
    return map(pipe(
        concat([screenIndex, QMKCommands.oledBuffer]),
        fillTo32ByteSize
    ))(chunks);
}

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

const addRenderBufferCommandPackage = ({ screenIndex, x, y, size }: { screenIndex: UInt8t; x: UInt8t; y: UInt8t; size: UInt8t }) => (chunks: QMK32BytePackage<QMKCommands.oledBuffer, QMKPackageBody>[]) => {
    return concat([bytes.fill2FixedSize(32)([screenIndex, QMKCommands.renderBuffer, x, y, ...number2Bytes(size)])])(chunks);
}


const render = ({ x, y, screenIndex = 1 }: { x: UInt8t; y: UInt8t; screenIndex?: UInt8t }) => (oledBytes: Array<UInt8t>) => {
    const res = [];

    const fillTo32Bytes = (arr: any[])=>{
        if(arr.length%32 !== 0)
            for(let i = arr.length%32; i < 32; i++){
                arr.push(0);
            }

        return arr;
    }

    // console.log(oledBytes.length, 'len');
    res.push(screenIndex);
    res.push(QMKCommands.renderBuffer);
    res.push(x);
    res.push(y);
    const size = number2Bytes(oledBytes.length);
    size.forEach((elem)=>res.push(elem));
    fillTo32Bytes(res);
    for(let i = 0, j = 32; i < oledBytes.length; i++) {
        if(i % 30 === 0) {
            res.push(screenIndex);
            res.push(QMKCommands.oledBuffer);
            j+=2;
        }
        res[j] = oledBytes[i];
        j++;
    }
    fillTo32Bytes(res);

    hid.send(res as any);

    // console.log(res.length%32, 'res');
    // pipe(
    //     bytes.chunk(30),
    //     addOledBufferCommandId2Chunks({ screenIndex }),
    //     addRenderBufferCommandPackage({ x, y, size: oledBytes.length as UInt8t, screenIndex }),
    //     hid.send
    // )(oledBytes)
};

export const oled = {
    render,
}