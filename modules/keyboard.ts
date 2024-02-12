import HID from 'node-hid';
import EventEmitter from 'node:events';
import { wait } from "./wait";
import { UInt8t } from "../types/common";

let kbd: any = null;

const checkDeviceHasBeenConnected = () => {
    const devices = HID.devices();

    const DEFAULT_USAGE = {
        usage: 0x61,
        usagePage: 0xFF60
    }
    const readableDeviceName = (spec: HID.Device) =>
        [spec.manufacturer, spec.product]
            .filter(Boolean)
            .join(' ')

    const getTargetDevice = (target: string) => {
        const targetRe = new RegExp(target.toLowerCase())

        const targetDevice = devices.filter((device) =>
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
    const target = targetSpec && getTargetDevice(targetSpec)

    const device = devices.find(d =>
        (target ?
            (d.vendorId === target.vendorId &&
                d.productId === target.productId) : true)
        &&
        d.usage === DEFAULT_USAGE.usage &&
        d.usagePage === DEFAULT_USAGE.usagePage);

    return device;
}

async function connect(device: HID.Device) {
    if (!device) {
        console.error('device not found (is the device connected? is raw HID enabled?)')
    }

    console.log(device);

    const keyboardHid = device.path ? 
        await HID.HIDAsync.open(device.path) : await HID.HIDAsync.open(device.vendorId, device.productId);

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

async function waitForDevice(cb: () => void, onDisconnect: () => void) {
    const device = checkDeviceHasBeenConnected(); //require('../device.json');
    if (device) {
        const kbd = await connect(device);
        kbd.once('disconnect', onDisconnect);
        // wait when second half connected to master
        // @ToDo: add status when second half connect to master
        await wait(2000);
        cb();
    }
}

export const keyboard = {
    waitForDevice,
    use,
}