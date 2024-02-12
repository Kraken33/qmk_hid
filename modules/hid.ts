import { UInt8t } from "../types/common";
import { keyboard } from "./keyboard";
import { asyncQueue } from './func';

const createHidSendQueue = ()=>{
    return {
        status: 0,
        queueId: 0,
        bytesQueue: [] as any,
        add(bytes: UInt8t[]) {
            this.bytesQueue.push(bytes);
            if(this.status === 0){
                this.exec();
            }
        },
        async exec() {
            const kbd = keyboard.use()
            this.status = 1;
            for(let i = 0, elem = this.bytesQueue[0]; elem; elem = this.bytesQueue[++i]){
                for(let j = 0, pack: any = [], m = 0; j < elem.length; j++){
                    pack[m++] = elem[j];
                    if(m === 32) {
                        // console.log(pack, 'pl');
                        kbd.write(pack);
                        await kbd.read(1000);
                        // const [status] = new Uint8ClampedArray(responseBuffer);
                        // if (status !== 200) {
                        //     throw new Error(`HID: Status error: ${status}`);
                        // }
                        m = 0;
                    }
                }
                delete this.bytesQueue[i];
            }
            this.bytesQueue = [];
            this.status = 0;
            this.queueId = 0;
        }
    }
} 


// for(let i = 0; i<200; i++) {
//     bytesQueue.add([i as any]);
// }

// bytesQueue.exec();

const bytesQueue = createHidSendQueue();

const send = async (bytesPackage: UInt8t[]) => {
    bytesQueue.add(bytesPackage as any);
}

const resume = () => {
    const kbd = keyboard.use();
    return kbd.resume();
}

export const hid = {
    send,
    resume,
}