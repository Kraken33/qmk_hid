import { QMK32BytePackage, QMKCommands, QMKPackageBody } from "../types/command";
import { UInt8t } from "../types/common";
import { Chunk } from "../types/oled";

export const addCommand = (commandId: QMKCommands)=>(chunk: QMK32BytePackage<QMKCommands, QMKPackageBody>)=>{
    return [commandId, ...chunk];
}