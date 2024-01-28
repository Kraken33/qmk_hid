const HID = require("node-hid");
const { intervals } = require("./timer");
const EventEmitter = require('node:events');

let kbd = null;
let status = 0;

const checkDeviceHasBeenConnected = () => {
    const devices = HID.devices();

    const DEFAULT_USAGE = {
        usage: 0x61,
        usagePage: 0xFF60
    }
    const readableDeviceName = (spec) =>
        [spec.MANUFACTURER, spec.PRODUCT]
            .filter(Boolean)
            .join(' ')

    const getTargetDevice = (target) => {
        const targetRe = new RegExp(target.toLowerCase())

        const targetDevice = DEVICES.filter(device =>
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
            (d.vendorId === target.VENDOR_ID &&
                d.productId === target.PRODUCT_ID) : true)
        &&
        d.usage === DEFAULT_USAGE.usage &&
        d.usagePage === DEFAULT_USAGE.usagePage);

    return device;
}

async function connect(device) {
    if (!device) {
        console.error('device not found (is the device connected? is raw HID enabled?)')
        console.error('following devices were detected:')
        console.log(devices)
    }

    const keyboardHid = await HID.HIDAsync.open(device.path);

    kbd = Object.create(keyboardHid);
    Object.assign(kbd, new EventEmitter());

    kbd.write = (...args) => {
        try {
            keyboardHid.write(...args);
        } catch (e) {
            status = 0;
            kbd.emit('disconnect');
        }
    }
    status = 1;

    console.log(`connected to ${device.manufacturer} ${device.product}`);

    return kbd;
}

function use() {
    return kbd;
}

function waitForDevice(cb) {
    const interval = setInterval(async () => {
        const device = checkDeviceHasBeenConnected();
        if (device) {
            clearInterval(interval);
            const kbd = await connect(device);
            kbd.on('disconnect', () => {
                intervals.stop();
                waitForDevice(cb);
            });
            cb(device);
        }
    }, 5000);
}

exports.keyboard = {
    waitForDevice,
    use,
}