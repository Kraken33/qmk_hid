import { FixedSizeArray, UInt8t } from "./common";

export enum QMKCommands {
    clear,
    renderBuffer,
    oledBuffer,
}

export type QMK32BytePackage <Command extends QMKCommands, Body extends FixedSizeArray<31, UInt8t>> = [Command, ...Body]; 
export type QMKPackage = (UInt8t | QMKCommands)[];
export type QMKPackageBody = FixedSizeArray<31, UInt8t>;