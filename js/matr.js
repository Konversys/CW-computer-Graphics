class Flame{
  constructor(xRes, yRes){
    this.xRes = xRes;
    this.yRes = yRes;
  }

  Calc(n, eqCount, it, method){
    var xRes = this.xRes;
    var yRes = this.yRes;
    var XMAX = xRes/yRes;
    var XMIN = -XMAX;
    var YMAX = 1;
    var YMIN = -1;

    var cfList = [];
    for (var i = 0; i < eqCount; i++) {
      do {var cf = new Coeff(math.random(-1,1), math.random(-1,1), math.random(-1.5, 1.5),
            math.random(-1,1), math.random(-1,1), math.random(-1.5,1.5),
            math.round(math.random(0, 255)), math.round(math.random(0, 255)), math.round(math.random(0, 255)));}
      while (cf.a == null);
      cfList.push(cf);
    }
    var pixels = new Array(yRes);
    for (var i = 0; i < yRes; i++) {
      pixels[i] = new Array(xRes);
      for (var j = 0; j < xRes; j++) {
        pixels[i][j] = new Point();
      }
    }

    for (var num = 0; num < n; num++) {
      var newX = math.random(XMIN, XMAX);
      var newY = math.random(YMIN, YMAX);
      for (var step = -20; step < it; step++) {
        var i = Math.round(math.random(0, eqCount-1));
        //var newL = this.Method(cfList[i], newX, newY, method, mult);
        var newX = cfList[i].a*newX + cfList[i].b*newY + cfList[i].c;
        var newY = cfList[i].d*newX + cfList[i].e*newY + cfList[i].f;
        var nL = this.Method(cfList[i], newX, newY, method, XMAX);
        newX = nL[0];
        newY = nL[1];
        if (step >= 0 && (newX >= XMIN && newX <= XMAX) && (newY >= YMIN && newY <= YMAX)) {
          var x1 = xRes - Math.trunc(((XMAX-newX)/(XMAX-XMIN))*xRes);
          var y1 = yRes - Math.trunc(((YMAX-newY)/(YMAX-YMIN))*yRes);
          if (x1<xRes && y1<yRes) {
            if (pixels[y1][x1].count == 0) {
              pixels[y1][x1].red = Math.trunc(cfList[i].red);
              pixels[y1][x1].green = Math.trunc(cfList[i].green);
              pixels[y1][x1].blue = Math.trunc(cfList[i].blue);
            }
            else{
              pixels[y1][x1].red = Math.trunc((pixels[y1][x1].red + cfList[i].red)/2);
              pixels[y1][x1].green = Math.trunc((pixels[y1][x1].green + cfList[i].green)/2);
              pixels[y1][x1].blue = Math.trunc((pixels[y1][x1].blue + cfList[i].blue)/2);
            }
            pixels[y1][x1].count++;
          }
        }
      }
    }
    return pixels
  }

  Render(element, n, eqCount, it, method, isCorrect, max, gamma){
    var canvas = document.getElementById(element);
    var canvasWidth = this.xRes;
    var canvasHeight = this.yRes;
    var ctx = canvas.getContext('2d');
    var canvasData = ctx.getImageData(0, 0, canvasWidth, canvasHeight);

    var pixels = this.Calc(n, eqCount, it, method);
    if (isCorrect) {
      pixels = this.Correction(pixels, max, gamma);
    }

    for (var i = 0; i < this.yRes; i++) {
      for (var j = 0; j < this.xRes; j++) {
        var index = (j + i * canvasWidth) * 4;
        canvasData.data[index + 0] = pixels[i][j].red;
        canvasData.data[index + 1] = pixels[i][j].green;
        canvasData.data[index + 2] = pixels[i][j].blue;
        canvasData.data[index + 3] = 256;
      }
    }
    ctx.putImageData(canvasData, 0, 0);
  }

  Correction(pixels, max, gamma){
    for (var i = 0; i < this.yRes; i++) {
      for (var j = 0; j < this.xRes; j++) {
        if (pixels[i][j].count != 0) {
          pixels[i][j].normal = Math.log10(pixels[i][j].count);
          if (pixels[i][j].normal > max) {
            max = pixels[i][j].normal;
          }
        }
      }
    }
    for (var i = 0; i < this.yRes; i++) {
      for (var j = 0; j < this.xRes; j++) {
        pixels[i][j].normal = pixels[i][j].normal / max;
        pixels[i][j].red *= Math.pow(pixels[i][j].normal, 1.0/gamma);
        pixels[i][j].green *= Math.pow(pixels[i][j].normal, 1.0/gamma);
        pixels[i][j].blue *= Math.pow(pixels[i][j].normal, 1.0/gamma);
      }
    }
    return pixels;
  }

  Method(coeff, x, y, method, XMAX){

    var ret = new Array();
    var e0 = Math.atan(x/y);
    var ef = Math.atan(x/y);
    var er = Math.pow(x*x+y*y, 1/2);

    switch (method) {
      case 'linear':
        var kx = x;
        var ky = y;
        break;
      case 'sin':
        var kx = Math.sin(x);
        var ky = Math.sin(y);
        break;
      case 'sphere':
        var kx = (x/(x*x+y*y));
        var ky = (y/(x*x+y*y));
        break;
      case 'polar':
        var kx = Math.atan(y/x)/Math.PI*2;
        var ky = Math.pow(x*x+y*y, 1/2)-1;
        break;
      case 'heart':
        var kx = Math.atan(y/x)/Math.PI;
        var ky = Math.pow(x*x+y*y, 1/2)-1;
        break;
      case 'disk':
        var kx = (1/Math.PI)*Math.atan(y/x)*Math.sin(Math.PI*Math.pow(x*x+y*y,1/2));
        var ky = (1/Math.PI)*Math.atan(y/x)*Math.cos(Math.PI*Math.pow(x*x+y*y,1/2));
        break;
      case 'hand':
        var kx = er*Math.sin(e0 + er);
        var ky = er*Math.cos(e0 - er)
        break;
      case 'julia':
        var q = Math.random()*Math.PI;
        var kx = Math.pow(er, 1/2)*Math.cos(e0/2+q);
        var ky = Math.pow(er, 1/2)*Math.sin(e0/2+q);
        break;
      default:
        var kx = x;
        var ky = y;
        break;
    }
    ret.push(kx);
    ret.push(ky);
    return ret;
  }
}


class Coeff{
  constructor(a, b, c, d, e, f, red, green, blue)
  {
    if (a < -1) {
      this.a = -1;
    }
    if (b < -1) {
      this.a = -1;
    }
    if (c < -1.5) {
      this.a = -1.5;
    }
    if (d < -1) {
      this.a = -1;
    }
    if (e < -1) {
      this.a = -1;
    }
    if (f < -1.5) {
      this.a = -1.5;

    }
    if (a > 1) {
      this.a = 1;
    }
    if (b > 1) {
      this.b = 1;
    }
    if (c > 1.5) {
      this.c = 1.5;
    }
    if (d > 1) {
      this.d = 1;
    }
    if (e > 1) {
      this.e = 1;
    }
    if (f > 1.5) {
      this.f = 1.5;
    }
    if (a*a + d*d >= 1) {
      return NaN;
    }
    if (b*b + e*e >= 1) {
      return NaN;
    }
    if (a*a + b*b + d*d + e*e >= 1 + (a*e - b*d)**2) {
      return NaN;
    }
    this.a = a;
    this.b = b;
    this.c = c;
    this.d = d;
    this.e = e;
    this.f = f;
    this.red = red;
    this.green = green;
    this.blue = blue;
  }
}
class Point{
  constructor()
  {
    this.red = -1;
    this.green = -1;
    this.blue = -1;
    this.count = 0;
    this.normal = 0;
  }
}
