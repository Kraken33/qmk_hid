import pipe from 'lodash/fp/pipe';
import concat from 'lodash/fp/concat';
import flatten from 'lodash/fp/flatten';

import { QMK32BytePackage, QMKCommands, QMKPackageBody, QMKPackage } from "../types/command";
import bytes from "./bytes";
import { addCommand } from "./command";
import { UInt8t } from '../types/common';
import hid from './hid';

const addOledBufferCommandId2Chunks = (chunks: QMK32BytePackage<QMKCommands.oledBuffer, QMKPackageBody>[]): QMKPackage[] => {
    const addOledBufferCommand = addCommand(QMKCommands.oledBuffer);
    const fillTo32ByteSize = bytes.fill2FixedSize(32);
    return chunks.map(pipe(
        addOledBufferCommand,
        fillTo32ByteSize
    ));
}

const addRenderBufferCommandPackage = ([x, y, size]: [UInt8t, UInt8t, UInt8t[]]) => (chunks: QMK32BytePackage<QMKCommands.oledBuffer, QMKPackageBody>[]) => {
    return concat<any>([bytes.fill2FixedSize(32)([QMKCommands.renderBuffer, x, y, ...size])])(chunks);
}

const render = (x: UInt8t, y: UInt8t) => (oledBytes: Array<UInt8t>) => {
    pipe(
        bytes.chunk(31),
        addOledBufferCommandId2Chunks,
        addRenderBufferCommandPackage([x, y, bytes.int2Bytes(oledBytes.length)]),
        flatten,
        hid.send
    )(oledBytes)
};

export const oled = {
    render,
}