import pipe from 'lodash/fp/pipe';
import concat from 'lodash/fp/concat';

import { QMK32BytePackage, QMKCommands, QMKPackageBody, QMKPackage } from "../types/command";
import bytes from "./bytes";
import { addCommand } from "./command";

const addOledBufferCommandId2Chunks = (chunks: QMK32BytePackage<QMKCommands.oledBuffer, QMKPackageBody>[]): QMKPackage[]=>{
    const addOledBufferCommand = addCommand(QMKCommands.oledBuffer);
    const fillTo32ByteSize = bytes.fill2FixedSize(32);
    return chunks.map(pipe(
        addOledBufferCommand,
        fillTo32ByteSize
    ));
}

const addRenderBufferCommandPackage = (chunks:QMK32BytePackage<QMKCommands.oledBuffer, QMKPackageBody>[])=>{
    return concat<any>(chunks)([bytes.fill2FixedSize(32)([QMKCommands.renderBuffer, 0, 0])]);
}

export default {
    addOledBufferCommandId2Chunks,
    addRenderBufferCommandPackage,
}