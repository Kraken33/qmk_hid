import { UInt8t } from "../types/common";
import { Widget } from "../types/widget";

export function parse(imageData: Widget) {
  var w = imageData.getWidth();
  var h = imageData.getHeight();

  let data: UInt8t[] = [];
  const lines = ~~(h / 8);
  let v: UInt8t;
  for (var line = 0; line < lines; line++) {
    for (var x = 0; x < w; x++) {
      v = 0;
      for (let i = 0; i < 8; i++) {
        const y = line * 8 + i;
        const b = imageData.getPixelColor(x, y) > 127 ? 1 : 0;
        v |= (b << i);
      }
      data.push(v as UInt8t);
    }
  }

  return data;
}