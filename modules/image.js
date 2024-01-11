function parse(imageData) {
  var w = imageData.getWidth();
  var h = imageData.getHeight();

  let data = [];
  lines = ~~(h / 8);
  for (var line = 0; line < lines; line++) {
    for (var x = 0; x < w; x++) {
      v = 0;
      for (i = 0; i < 8; i++) {
        y = line * 8 + i;
        b = imageData.getPixelColor(x, y) > 127 ? 1 : 0;
        console.log(b);
        v |= (b << i);
      }
      data.push(v);
    }
  }

  return data;
}

module.exports = {
  parse,
}