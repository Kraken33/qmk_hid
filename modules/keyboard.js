const HID = require("node-hid");
const fs = require('fs');

let kbd = null;
const DEVICES = fs.readdirSync(__dirname).map(path => require(`./${path}`))

exports.connect2Keyboard = () => {
    if (!kbd) {
        var devices = HID.devices();

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

        const onerror = (err) => {
            console.log(err)
            process.exit(1)
        }

        const targetSpec = process.argv[2]
        const target = targetSpec && getTargetDevice(targetSpec)

        const device = devices.find(d =>
            (target ?
                (d.vendorId === target.VENDOR_ID &&
                    d.productId === target.PRODUCT_ID) : true)
            &&
            d.usage === DEFAULT_USAGE.usage &&
            d.usagePage === DEFAULT_USAGE.usagePage
        )

        if (!device) {
            console.error('device not found (is the device connected? is raw HID enabled?)')
            console.error('following devices were detected:')
            console.log(devices)
            process.exit(2)
        }

        kbd = new HID.HID(device.path)
        kbd.on('error', onerror)

        console.log(`connected to ${device.manufacturer} ${device.product}`)
    }
    return kbd;
}