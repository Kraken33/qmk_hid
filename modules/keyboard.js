const HID = require("node-hid");

let kbd = null;

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

function connect(device) {
    if (!device) {
        console.error('device not found (is the device connected? is raw HID enabled?)')
        console.error('following devices were detected:')
        console.log(devices)
    }

    kbd = new HID.HID(device.path);

    console.log(`connected to ${device.manufacturer} ${device.product}`);

    return kbd;
}

function use() {
        return kbd;
}

function waitForDevice() {
    return new Promise((res, rej) => {
        const interval = setInterval(() => {
            const device = checkDeviceHasBeenConnected();
            if (device) {
                clearInterval(interval);
                const kbd = connect(device);
                kbd.on('error', ()=>{
                    console.log('error');
                });
                res(device);
            }
        }, 5000);
    });
}

exports.keyboard = {
    waitForDevice,
    use,
}