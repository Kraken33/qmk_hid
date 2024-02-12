import { UInt8t } from "../types/common";
import { keyboard } from "./keyboard";

enum HIDQueueStatues {
    paused,
    executing,
}

type HIDSendQueue = {
    status: HIDQueueStatues;
    queueId: number;
    bytesQueue: UInt8t[][];
    add(b: UInt8t[]):void;
    exec(): void;
}

const createHIDSendQueue = ():HIDSendQueue=>{
    return {
        status: HIDQueueStatues.paused,
        queueId: 0,
        bytesQueue: [],
        add(bytes) {
            this.bytesQueue.push(bytes);
            if(this.status === 0)
                this.exec();
        },
        async exec() {
            const kbd = keyboard.use()
            this.status = HIDQueueStatues.executing;
            for(let i = 0, elem = this.bytesQueue[0]; elem; elem = this.bytesQueue[++i]){
                for(let byteId = 0, pack: UInt8t[] = [], packId = 0; byteId < elem.length; byteId++){
                    pack[packId++] = elem[byteId];
                    if(packId === 32) {
                        kbd.write(pack);
                        await kbd.read(1000);
                        // const [status] = new Uint8ClampedArray(responseBuffer);
                        // if (status !== 200) {
                        //     throw new Error(`HID: Status error: ${status}`);
                        // }
                        packId = 0;
                    }
                }
                delete this.bytesQueue[i];
            }
            this.bytesQueue = [];
            this.status = HIDQueueStatues.paused;
            this.queueId = 0;
        }
    }
} 

const hidQueue = createHIDSendQueue();

const send = async (bytesPackage: UInt8t[]) => {
    hidQueue.add(bytesPackage as any);
}

const resume = () => {
    const kbd = keyboard.use();
    return kbd.resume();
}

export const hid = {
    send,
    resume,
}