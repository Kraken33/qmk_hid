import Jimp from "jimp";
import path from "node:path";
import { Widget } from "../types/widget";

const create = ({ width, height }: { width: number, height: number }) => {
    return Jimp.read(width, height);
}

const createImage = (path: string) => {
    return Jimp.read(path);
}

const addText = (text: string) => async (widget: Widget) => {
    const font = await Jimp.loadFont(path.join(__dirname, '../assets/fonts/Pixolletta8px.fnt'));

    return new Promise((res, rej) => {
        const width = Jimp.measureText(font, text);
        const height = Jimp.measureTextHeight(font, text, width);
        const widgetWidth = widget.getWidth();
        const widgetHeight = widget.getHeight();
        if (width > widgetWidth || height > widgetHeight) {
            console.error('Text area larger then widget');
        }
        widget.print(
            font,
            0,
            0,
            {
                text,
            },
            width,
            height,
            (err, image) => res(image)
        )
    });
}

const combine = (widget: Widget, x: number, y: number) => (targetWidget: Widget) => {
    console.log(targetWidget, 'tw')
    return targetWidget.blit(widget, x, y);
}

export default {
    create,
    createImage,
    addText,
    combine,
}
