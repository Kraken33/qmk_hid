import { UInt8t } from "../types/common";

const HID = require("node-hid");
const EventEmitter = require('node:events');
const { wait } = require("./wait");

type Device = { MANUFACTURER: string; PRODUCT: string };
type NodeHidDevice = {
    MANUFACTURER: string; PRODUCT: string;
    vendorId: string;
    productId: string;
    usage: number;
    usagePage: number;
}

let kbd: any = null;

const checkDeviceHasBeenConnected = () => {
    const devices: NodeHidDevice[] = HID.devices();

    const DEFAULT_USAGE = {
        usage: 0x61,
        usagePage: 0xFF60
    }
    const readableDeviceName = (spec: Device) =>
        [spec.MANUFACTURER, spec.PRODUCT]
            .filter(Boolean)
            .join(' ')

    const getTargetDevice = (target: string) => {
        const targetRe = new RegExp(target.toLowerCase())

        const targetDevice: Device[] = devices.filter((device: Device) =>
            readableDeviceName(device).toLowerCase().match(targetRe)
        )

        if (targetDevice.length === 0) {
            console.log('no such device known')
            process.exit(3)
        }
        else if (targetDevice.length > 1) {
            console.log('multiple devices matched:')
            console.log(targetDevice
                .map(spec =>
                    `  * ${readableDeviceName(spec)}`
                )
                .join('\n')
            )
            process.exit(4)
        }

        return targetDevice[0]
    }

    const targetSpec = process.argv[2]
    const target: any = targetSpec && getTargetDevice(targetSpec)

    const device = devices.find(d =>
        (target ?
            (d.vendorId === target.VENDOR_ID &&
                d.productId === target.PRODUCT_ID) : true)
        &&
        d.usage === DEFAULT_USAGE.usage &&
        d.usagePage === DEFAULT_USAGE.usagePage);

    return device;
}

async function connect(device: any) {
    if (!device) {
        console.error('device not found (is the device connected? is raw HID enabled?)')
    }

    const keyboardHid = await HID.HIDAsync.open(device.path);

    kbd = Object.create(keyboardHid);
    Object.assign(kbd as any, new EventEmitter());

    kbd.write = (data: UInt8t[]) => {
        keyboardHid.write(data).catch(() => {
            kbd.emit('disconnect');
        });
    }

    kbd.read = (delay: number) => {
        return keyboardHid.read(delay).catch(() => {
            kbd.emit('disconnect');
        });
    }

    console.log(`connected to ${device.manufacturer} ${device.product}`);

    return kbd;
}

function use() {
    return kbd;
}

function waitForDevice(cb: () => void, onDisconnect: () => void) {
    const interval = setInterval(async () => {
        const device = checkDeviceHasBeenConnected();
        if (device) {
            clearInterval(interval);
            const kbd = await connect(device);
            kbd.once('disconnect', onDisconnect);
            // wait when second half connected to master
            // @ToDo: add status when second half connect to master
            await wait(2000);
            debugger;
            cb();
        }
    }, 5000);
}

export const keyboard = {
    waitForDevice,
    use,
}