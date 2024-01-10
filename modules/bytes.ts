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

export default {
    chunk,
    fill2FixedSize,
}