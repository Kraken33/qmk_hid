import Jimp from "jimp";
import { join } from "node:path";
import { Widget } from "../types/widget";
// @ts-ignore: Unreachable code error
import imageModule from './image';

const create = ({ width, height }: { width: number, height: number }) => {
    return Jimp.read(width, height);
}

const createImage = (path: string) => {
    return Jimp.read(join(__dirname, "../assets/images/", path));
}

const resize = (w: number, h: number) => (widget: Widget) => {
    return widget.resize(w, h);
}

const scale = (w: number) => (widget: Widget) => {
    return widget.scale(w);
}

const rotate = (deg: number) => (widget: Widget) => {
    return widget.rotate(deg);
}

const addText = (text: string, { size = 10, alignmentX = Jimp.HORIZONTAL_ALIGN_CENTER, alignmentY = Jimp.VERTICAL_ALIGN_MIDDLE }: { size?: number; alignmentX?: number; alignmentY?: number } = {}) => async (widget: Widget) => {
    const font = await Jimp.loadFont(join(__dirname, `../assets/fonts/PixelOperator${size}/index.fnt`));

    return new Promise((res, rej) => {
        const width = Jimp.measureText(font, text);
        const height = Jimp.measureTextHeight(font, text, width);
        const widgetWidth = widget.getWidth();
        const widgetHeight = widget.getHeight();

        widget.print(
            font,
            0,
            0,
            {
                text,
                alignmentX,
                alignmentY,
            },
            width > widgetWidth ? width : widgetWidth,
            height > widgetHeight ? height : widgetHeight,
            (err, image) => {
                res(image)
            }
        )
    });
}

const combine = (widget: Widget, x: number, y: number) => (targetWidget: Widget) => {
    return targetWidget.blit(widget, x, y);
}

const convert2Bytes = (widget: Widget) => imageModule.parse(widget);

export const widget = {
    create,
    createImage,
    addText,
    combine,
    resize,
    scale,
    convert2Bytes,
    rotate,
}
