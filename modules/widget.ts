import Jimp from "jimp";
import { join } from "node:path";
import { Widget } from "../types/widget";
import { UInt8t } from "../types/common";

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

const addText = (text: string, { size = 12, alignmentX = Jimp.HORIZONTAL_ALIGN_CENTER, alignmentY = Jimp.VERTICAL_ALIGN_MIDDLE, fontName }: { size?: number; alignmentX?: number; alignmentY?: number; fontName?: string; } = {}) => async (widget: Widget) => {
    const font = await Jimp.loadFont(join(__dirname, `../assets/fonts/${fontName || `PixelOperator${size}`}/index.fnt`));

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

const write = (path: string)=>(widget: Widget)=>{
    widget.writeAsync(path);
    return widget;
}

const convert2Bytes = (widget: Widget)=> {
    var w = widget.getWidth();
    var h = widget.getHeight();
  
    let data: UInt8t[] = [];
    const lines = ~~(h / 8);
    let v: UInt8t;
    for (var line = 0; line < lines; line++) {
      for (var x = 0; x < w; x++) {
        v = 0;
        for (let i = 0; i < 8; i++) {
          const y = line * 8 + i;
          const b = widget.getPixelColor(x, y) > 127 ? 1 : 0;
          v |= (b << i);
        }
        data.push(v as UInt8t);
      }
    }
  
    return data;
  }

export const widget = {
    create,
    createImage,
    addText,
    combine,
    resize,
    scale,
    convert2Bytes,
    rotate,
    write
}
