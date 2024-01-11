import { UInt8t } from "../types/common";

const chunk = (size: number) => (array: UInt8t[]) => {
    const result: UInt8t[][] = [];
    for (let i = 0, len = Math.ceil(array.length / size); i < len; i++) {
        result.push(array.slice(i * size, (i + 1) * size));
    }

    return result;
}

const fill2FixedSize = (size: number)=>(array: UInt8t[])=>{
    const {length} = array;
    if(length === size){
        return array;
    }

    return [...array, ...([...new Array(size - length)].map(()=>0))];
}

const int2Bytes = (num: number)=> {
    const binary = num.toString(2);
    const paddedBinary = binary.padStart(Math.ceil(binary.length / 8) * 8, "0");
    const bytes = paddedBinary.match(/.{1,8}/g) as any[];
    const decimalBytes = bytes.map((byte) => parseInt(byte, 2));
    return [...[...new Array(4 - decimalBytes.length)].map(()=>0),...decimalBytes].reverse() as UInt8t[];
  }

export default {
    chunk,
    fill2FixedSize,
    int2Bytes,
}