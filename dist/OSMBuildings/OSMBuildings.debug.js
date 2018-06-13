(function() {var Qolor = (function() {
var w3cColors = {
  aliceblue: '#f0f8ff',
  antiquewhite: '#faebd7',
  aqua: '#00ffff',
  aquamarine: '#7fffd4',
  azure: '#f0ffff',
  beige: '#f5f5dc',
  bisque: '#ffe4c4',
  black: '#000000',
  blanchedalmond: '#ffebcd',
  blue: '#0000ff',
  blueviolet: '#8a2be2',
  brown: '#a52a2a',
  burlywood: '#deb887',
  cadetblue: '#5f9ea0',
  chartreuse: '#7fff00',
  chocolate: '#d2691e',
  coral: '#ff7f50',
  cornflowerblue: '#6495ed',
  cornsilk: '#fff8dc',
  crimson: '#dc143c',
  cyan: '#00ffff',
  darkblue: '#00008b',
  darkcyan: '#008b8b',
  darkgoldenrod: '#b8860b',
  darkgray: '#a9a9a9',
  darkgrey: '#a9a9a9',
  darkgreen: '#006400',
  darkkhaki: '#bdb76b',
  darkmagenta: '#8b008b',
  darkolivegreen: '#556b2f',
  darkorange: '#ff8c00',
  darkorchid: '#9932cc',
  darkred: '#8b0000',
  darksalmon: '#e9967a',
  darkseagreen: '#8fbc8f',
  darkslateblue: '#483d8b',
  darkslategray: '#2f4f4f',
  darkslategrey: '#2f4f4f',
  darkturquoise: '#00ced1',
  darkviolet: '#9400d3',
  deeppink: '#ff1493',
  deepskyblue: '#00bfff',
  dimgray: '#696969',
  dimgrey: '#696969',
  dodgerblue: '#1e90ff',
  firebrick: '#b22222',
  floralwhite: '#fffaf0',
  forestgreen: '#228b22',
  fuchsia: '#ff00ff',
  gainsboro: '#dcdcdc',
  ghostwhite: '#f8f8ff',
  gold: '#ffd700',
  goldenrod: '#daa520',
  gray: '#808080',
  grey: '#808080',
  green: '#008000',
  greenyellow: '#adff2f',
  honeydew: '#f0fff0',
  hotpink: '#ff69b4',
  indianred: '#cd5c5c',
  indigo: '#4b0082',
  ivory: '#fffff0',
  khaki: '#f0e68c',
  lavender: '#e6e6fa',
  lavenderblush: '#fff0f5',
  lawngreen: '#7cfc00',
  lemonchiffon: '#fffacd',
  lightblue: '#add8e6',
  lightcoral: '#f08080',
  lightcyan: '#e0ffff',
  lightgoldenrodyellow: '#fafad2',
  lightgray: '#d3d3d3',
  lightgrey: '#d3d3d3',
  lightgreen: '#90ee90',
  lightpink: '#ffb6c1',
  lightsalmon: '#ffa07a',
  lightseagreen: '#20b2aa',
  lightskyblue: '#87cefa',
  lightslategray: '#778899',
  lightslategrey: '#778899',
  lightsteelblue: '#b0c4de',
  lightyellow: '#ffffe0',
  lime: '#00ff00',
  limegreen: '#32cd32',
  linen: '#faf0e6',
  magenta: '#ff00ff',
  maroon: '#800000',
  mediumaquamarine: '#66cdaa',
  mediumblue: '#0000cd',
  mediumorchid: '#ba55d3',
  mediumpurple: '#9370db',
  mediumseagreen: '#3cb371',
  mediumslateblue: '#7b68ee',
  mediumspringgreen: '#00fa9a',
  mediumturquoise: '#48d1cc',
  mediumvioletred: '#c71585',
  midnightblue: '#191970',
  mintcream: '#f5fffa',
  mistyrose: '#ffe4e1',
  moccasin: '#ffe4b5',
  navajowhite: '#ffdead',
  navy: '#000080',
  oldlace: '#fdf5e6',
  olive: '#808000',
  olivedrab: '#6b8e23',
  orange: '#ffa500',
  orangered: '#ff4500',
  orchid: '#da70d6',
  palegoldenrod: '#eee8aa',
  palegreen: '#98fb98',
  paleturquoise: '#afeeee',
  palevioletred: '#db7093',
  papayawhip: '#ffefd5',
  peachpuff: '#ffdab9',
  peru: '#cd853f',
  pink: '#ffc0cb',
  plum: '#dda0dd',
  powderblue: '#b0e0e6',
  purple: '#800080',
  rebeccapurple: '#663399',
  red: '#ff0000',
  rosybrown: '#bc8f8f',
  royalblue: '#4169e1',
  saddlebrown: '#8b4513',
  salmon: '#fa8072',
  sandybrown: '#f4a460',
  seagreen: '#2e8b57',
  seashell: '#fff5ee',
  sienna: '#a0522d',
  silver: '#c0c0c0',
  skyblue: '#87ceeb',
  slateblue: '#6a5acd',
  slategray: '#708090',
  slategrey: '#708090',
  snow: '#fffafa',
  springgreen: '#00ff7f',
  steelblue: '#4682b4',
  tan: '#d2b48c',
  teal: '#008080',
  thistle: '#d8bfd8',
  tomato: '#ff6347',
  turquoise: '#40e0d0',
  violet: '#ee82ee',
  wheat: '#f5deb3',
  white: '#ffffff',
  whitesmoke: '#f5f5f5',
  yellow: '#ffff00',
  yellowgreen: '#9acd32'
};

function hue2rgb(p, q, t) {
  if (t<0) t += 1;
  if (t>1) t -= 1;
  if (t<1/6) return p + (q - p)*6*t;
  if (t<1/2) return q;
  if (t<2/3) return p + (q - p)*(2/3 - t)*6;
  return p;
}

function clamp(v, max) {
  if (v === undefined) {
    return;
  }
  return Math.min(max, Math.max(0, v || 0));
}

//*****************************************************************************

/**
 * @param str, object can be in any of these: 'red', '#0099ff', 'rgb(64, 128, 255)', 'rgba(64, 128, 255, 0.5)', { r:0.2, g:0.3, b:0.9, a:1 }
 */
var Qolor = function(r, g, b, a) {
  this.r = clamp(r, 1);
  this.g = clamp(g, 1);
  this.b = clamp(b, 1);
  this.a = clamp(a, 1) || 1;
};

/**
 * @param str, object can be in any of these: 'red', '#0099ff', 'rgb(64, 128, 255)', 'rgba(64, 128, 255, 0.5)'
 */
Qolor.parse = function(str) {
  if (typeof str === 'string') {
    str = str.toLowerCase();
    str = w3cColors[str] || str;

    var m;

    if ((m = str.match(/^#?(\w{2})(\w{2})(\w{2})$/))) {
      return new Qolor(parseInt(m[1], 16)/255, parseInt(m[2], 16)/255, parseInt(m[3], 16)/255);
    }

    if ((m = str.match(/^#?(\w)(\w)(\w)$/))) {
      return new Qolor(parseInt(m[1]+m[1], 16)/255, parseInt(m[2]+m[2], 16)/255, parseInt(m[3]+m[3], 16)/255);
    }

    if ((m = str.match(/rgba?\((\d+)\D+(\d+)\D+(\d+)(\D+([\d.]+))?\)/))) {
      return new Qolor(
        parseFloat(m[1])/255,
        parseFloat(m[2])/255,
        parseFloat(m[3])/255,
        m[4] ? parseFloat(m[5]) : 1
      );
    }
  }

  return new Qolor();
};

Qolor.fromHSL = function(h, s, l) {
  var qolor = new Qolor().fromHSL(h, s, l);
  qolor.a = a;
  return qolor;
};

//*****************************************************************************

Qolor.prototype = {

  isValid: function() {
    return this.r !== undefined && this.g !== undefined && this.b !== undefined;
  },

  toHSL: function() {
    if (!this.isValid()) {
      return;
    }

    var
      max = Math.max(this.r, this.g, this.b),
      min = Math.min(this.r, this.g, this.b),
      h, s, l = (max + min)/2,
      d = max - min;

    if (!d) {
      h = s = 0; // achromatic
    } else {
      s = l>0.5 ? d/(2 - max - min) : d/(max + min);
      switch (max) {
        case this.r:
          h = (this.g - this.b)/d + (this.g<this.b ? 6 : 0);
          break;
        case this.g:
          h = (this.b - this.r)/d + 2;
          break;
        case this.b:
          h = (this.r - this.g)/d + 4;
          break;
      }
      h *= 60;
    }

    return { h: h, s: s, l: l };
  },

  fromHSL: function(h, s, l) {
    // h = clamp(h, 360),
    // s = clamp(s, 1),
    // l = clamp(l, 1),

    // achromatic
    if (s === 0) {
      this.r = this.g = this.b = l;
      return this;
    }

    var
      q = l<0.5 ? l*(1 + s) : l + s - l*s,
      p = 2*l - q;

    h /= 360;

    this.r = hue2rgb(p, q, h + 1/3);
    this.g = hue2rgb(p, q, h);
    this.b = hue2rgb(p, q, h - 1/3);

    return this;
  },

  toString: function() {
    if (!this.isValid()) {
      return;
    }

    if (this.a === 1) {
      return '#' + ((1<<24) + (Math.round(this.r*255)<<16) + (Math.round(this.g*255)<<8) + Math.round(this.b*255)).toString(16).slice(1, 7);
    }
    return 'rgba(' + [Math.round(this.r*255), Math.round(this.g*255), Math.round(this.b*255), this.a.toFixed(2)].join(',') + ')';
  },

  toArray: function() {
    if (!this.isValid) {
      return;
    }
    
    return [this.r, this.g, this.b];
  },

  hue: function(h) {
    var hsl = this.toHSL();
    return this.fromHSL(hsl.h+h, hsl.s, hsl.l);
  },

  saturation: function(s) {
    var hsl = this.toHSL();
    return this.fromHSL(hsl.h, hsl.s*s, hsl.l);
  },

  lightness: function(l) {
    var hsl = this.toHSL();
    return this.fromHSL(hsl.h, hsl.s, hsl.l*l);
  },

  clone: function() {
    return new Qolor(this.r, this.g, this.b, this.a);
  }
};

return Qolor;

}());

if (typeof module === 'object') { module.exports = Qolor; }

/*
 (c) 2011-2015, Vladimir Agafonkin
 SunCalc is a JavaScript library for calculating sun position and light phases.
 https://github.com/mourner/suncalc
*/

var suncalc = (function () {
  'use strict';

// shortcuts for easier to read formulas

  var PI = Math.PI,
    sin = Math.sin,
    cos = Math.cos,
    tan = Math.tan,
    asin = Math.asin,
    atan = Math.atan2,
    rad = PI/180;

// sun calculations are based on http://aa.quae.nl/en/reken/zonpositie.html formulas


// date/time constants and conversions

  var dayMs = 1000*60*60*24,
    J1970 = 2440588,
    J2000 = 2451545;

  function toJulian(date) {
    return date.valueOf()/dayMs - 0.5 + J1970;
  }

  function toDays(date) {
    return toJulian(date) - J2000;
  }


// general calculations for position

  var e = rad*23.4397; // obliquity of the Earth

  function rightAscension(l, b) {
    return atan(sin(l)*cos(e) - tan(b)*sin(e), cos(l));
  }

  function declination(l, b) {
    return asin(sin(b)*cos(e) + cos(b)*sin(e)*sin(l));
  }

  function azimuth(H, phi, dec) {
    return atan(sin(H), cos(H)*sin(phi) - tan(dec)*cos(phi));
  }

  function altitude(H, phi, dec) {
    return asin(sin(phi)*sin(dec) + cos(phi)*cos(dec)*cos(H));
  }

  function siderealTime(d, lw) {
    return rad*(280.16 + 360.9856235*d) - lw;
  }


// general sun calculations

  function solarMeanAnomaly(d) {
    return rad*(357.5291 + 0.98560028*d);
  }

  function eclipticLongitude(M) {

    var C = rad*(1.9148*sin(M) + 0.02*sin(2*M) + 0.0003*sin(3*M)), // equation of center
      P = rad*102.9372; // perihelion of the Earth

    return M + C + P + PI;
  }

  function sunCoords(d) {

    var M = solarMeanAnomaly(d),
      L = eclipticLongitude(M);

    return {
      dec: declination(L, 0),
      ra: rightAscension(L, 0)
    };
  }

// calculates sun position for a given date and latitude/longitude

  return function(date, lat, lng) {

    var lw = rad* -lng,
      phi = rad*lat,
      d = toDays(date),

      c = sunCoords(d),
      H = siderealTime(d, lw) - c.ra;

    return {
      azimuth: azimuth(H, phi, c.dec),
      altitude: altitude(H, phi, c.dec)
    };
  };

}());


const Shaders = {"picking":{"vertex":"precision highp float; //is default in vertex shaders anyway, using highp fixes #49\n#define halfPi 1.57079632679\nattribute vec4 aPosition;\nattribute vec3 aPickingColor;\nattribute float aZScale;\nuniform mat4 uModelMatrix;\nuniform mat4 uMatrix;\nuniform float uFogDistance;\nuniform float uFade;\nuniform float uIndex;\nvarying vec4 vColor;\nvoid main() {\nfloat f = clamp(uFade*aZScale, 0.0, 1.0);\nif (f == 0.0) {\ngl_Position = vec4(0.0, 0.0, 0.0, 0.0);\nvColor = vec4(0.0, 0.0, 0.0, 0.0);\n} else {\nvec4 pos = vec4(aPosition.x, aPosition.y, aPosition.z*f, aPosition.w);\ngl_Position = uMatrix * pos;\nvec4 mPosition = vec4(uModelMatrix * pos);\nfloat distance = length(mPosition);\nif (distance > uFogDistance) {\nvColor = vec4(0.0, 0.0, 0.0, 0.0);\n} else {\nvColor = vec4(clamp(uIndex, 0.0, 1.0), aPickingColor.g, aPickingColor.b, 1.0);\n}\n}\n}\n","fragment":"#ifdef GL_ES\nprecision mediump float;\n#endif\nvarying vec4 vColor;\nvoid main() {\ngl_FragColor = vColor;\n}\n"},"buildings":{"vertex":"precision highp float; //is default in vertex shaders anyway, using highp fixes #49\n#define halfPi 1.57079632679\nattribute vec4 aPosition;\nattribute vec2 aTexCoord;\nattribute vec3 aNormal;\nattribute vec3 aColor;\nattribute float aHeight;\nattribute vec4 aTintColor;\nattribute float aZScale;\nuniform mat4 uModelMatrix;\nuniform mat4 uMatrix;\nuniform mat3 uNormalTransform;\nuniform vec3 uLightDirection;\nuniform vec3 uLightColor;\nuniform vec2 uViewDirOnMap;\nuniform vec2 uLowerEdgePoint;\nuniform float uFade;\nvarying vec3 vColor;\nvarying vec2 vTexCoord;\nvarying float verticalDistanceToLowerEdge;\nconst float gradientStrength = 0.4;\nvoid main() {\nfloat f = clamp(uFade*aZScale, 0.0, 1.0);\nif (f == 0.0) {\ngl_Position = vec4(0.0, 0.0, 0.0, 0.0);\nvColor = vec3(0.0, 0.0, 0.0);\n} else {\nvec4 pos = vec4(aPosition.x, aPosition.y, aPosition.z*f, aPosition.w);\ngl_Position = uMatrix * pos;\nvec3 color = aColor;\n// tint ***********************************************\nif (aTintColor.a > 0.0) {\ncolor = mix(aColor, aTintColor.rgb, 0.5);\n}\n//*** light intensity, defined by light direction on surface ****************\nvec3 transformedNormal = aNormal * uNormalTransform;\nfloat lightIntensity = max( dot(transformedNormal, uLightDirection), 0.0) / 1.5;\ncolor = color + uLightColor * lightIntensity;\nvTexCoord = aTexCoord;\n//*** vertical shading ******************************************************\nfloat verticalShading = clamp(gradientStrength - ((pos.z*gradientStrength) / (aHeight * f)), 0.0, gradientStrength);\n//***************************************************************************\nvColor = color-verticalShading;\nvec4 worldPos = uModelMatrix * pos;\nvec2 dirFromLowerEdge = worldPos.xy / worldPos.w - uLowerEdgePoint;\nverticalDistanceToLowerEdge = dot(dirFromLowerEdge, uViewDirOnMap);\n}\n}\n","fragment":"#ifdef GL_ES\nprecision mediump float;\n#endif\nvarying vec3 vColor;\nvarying vec2 vTexCoord;\nvarying float verticalDistanceToLowerEdge;\nuniform vec3 uFogColor;\nuniform float uFogDistance;\nuniform float uFogBlurDistance;\nuniform sampler2D uWallTexIndex;\nvoid main() {\n\nfloat fogIntensity = (verticalDistanceToLowerEdge - uFogDistance) / uFogBlurDistance;\nfogIntensity = clamp(fogIntensity, 0.0, 1.0);\ngl_FragColor = vec4( vColor* texture2D(uWallTexIndex, vTexCoord).rgb, 1.0-fogIntensity);\n}\n"},"buildings_with_shadows":{"vertex":"precision highp float; //is default in vertex shaders anyway, using highp fixes #49\n#define halfPi 1.57079632679\nattribute vec4 aPosition;\nattribute vec3 aNormal;\nattribute vec3 aColor;\nattribute vec2 aTexCoord;\nattribute float aHeight;\nattribute vec4 aTintColor;\nattribute float aZScale;\nuniform mat4 uModelMatrix;\nuniform mat4 uMatrix;\nuniform mat4 uSunMatrix;\nuniform mat3 uNormalTransform;\nuniform vec2 uViewDirOnMap;\nuniform vec2 uLowerEdgePoint;\nuniform float uFade;\nvarying vec3 vColor;\nvarying vec2 vTexCoord;\nvarying vec3 vNormal;\nvarying vec3 vSunRelPosition;\nvarying float verticalDistanceToLowerEdge;\nfloat gradientStrength = 0.4;\nvoid main() {\nfloat f = clamp(uFade*aZScale, 0.0, 1.0);\nif (f == 0.0) {\ngl_Position = vec4(0.0, 0.0, 0.0, 0.0);\nvColor = vec3(0.0, 0.0, 0.0);\n} else {\nvec4 pos = vec4(aPosition.x, aPosition.y, aPosition.z*f, aPosition.w);\ngl_Position = uMatrix * pos;\nvec3 color = aColor;\n// tint ***********************************************\nif (aTintColor.a > 0.0) {\ncolor = mix(aColor, aTintColor.rgb, 0.5);\n}\n//*** light intensity, defined by light direction on surface ****************\nvNormal = aNormal;\nvTexCoord = aTexCoord;\n//vec3 transformedNormal = aNormal * uNormalTransform;\n//float lightIntensity = max( dot(aNormal, uLightDirection), 0.0) / 1.5;\n//color = color + uLightColor * lightIntensity;\n//*** vertical shading ******************************************************\nfloat verticalShading = clamp(gradientStrength - ((pos.z*gradientStrength) / (aHeight * f)), 0.0, gradientStrength);\n//***************************************************************************\nvColor = color-verticalShading;\nvec4 worldPos = uModelMatrix * pos;\nvec2 dirFromLowerEdge = worldPos.xy / worldPos.w - uLowerEdgePoint;\nverticalDistanceToLowerEdge = dot(dirFromLowerEdge, uViewDirOnMap);\n// *** shadow mapping ********\nvec4 sunRelPosition = uSunMatrix * pos;\nvSunRelPosition = (sunRelPosition.xyz / sunRelPosition.w + 1.0) / 2.0;\n}\n}\n","fragment":"\n#ifdef GL_FRAGMENT_PRECISION_HIGH\nprecision highp float;\n#else\nprecision mediump float;\n#endif\nvarying vec2 vTexCoord;\nvarying vec3 vColor;\nvarying vec3 vNormal;\nvarying vec3 vSunRelPosition;\nvarying float verticalDistanceToLowerEdge;\nuniform vec3 uFogColor;\nuniform vec2 uShadowTexDimensions;\nuniform sampler2D uShadowTexIndex;\nuniform sampler2D uWallTexIndex;\nuniform float uFogDistance;\nuniform float uFogBlurDistance;\nuniform float uShadowStrength;\nuniform vec3 uLightDirection;\nuniform vec3 uLightColor;\nfloat isSeenBySun(const vec2 sunViewNDC, const float depth, const float bias) {\nif ( clamp( sunViewNDC, 0.0, 1.0) != sunViewNDC) //not inside sun's viewport\nreturn 1.0;\n\nfloat depthFromTexture = texture2D( uShadowTexIndex, sunViewNDC.xy).x;\n\n//compare depth values not in reciprocal but in linear depth\nreturn step(1.0/depthFromTexture, 1.0/depth + bias);\n}\nvoid main() {\nvec3 normal = normalize(vNormal); //may degenerate during per-pixel interpolation\nfloat diffuse = dot(uLightDirection, normal);\ndiffuse = max(diffuse, 0.0);\n// reduce shadow strength with:\n// - lowering sun positions, to be consistent with the shadows on the basemap (there,\n// shadows are faded out with lowering sun positions to hide shadow artifacts caused\n// when sun direction and map surface are almost perpendicular\n// - large angles between the sun direction and the surface normal, to hide shadow\n// artifacts that occur when surface normal and sun direction are almost perpendicular\nfloat shadowStrength = pow( max( min(\ndot(uLightDirection, vec3(0.0, 0.0, 1.0)),\ndot(uLightDirection, normal)\n), 0.0), 1.5);\nif (diffuse > 0.0 && shadowStrength > 0.0) {\n// note: the diffuse term is also the cosine between the surface normal and the\n// light direction\nfloat bias = clamp(0.0007*tan(acos(diffuse)), 0.0, 0.01);\nvec2 pos = fract( vSunRelPosition.xy * uShadowTexDimensions);\n\nvec2 tl = floor(vSunRelPosition.xy * uShadowTexDimensions) / uShadowTexDimensions;\nfloat tlVal = isSeenBySun( tl, vSunRelPosition.z, bias);\nfloat trVal = isSeenBySun( tl + vec2(1.0, 0.0) / uShadowTexDimensions, vSunRelPosition.z, bias);\nfloat blVal = isSeenBySun( tl + vec2(0.0, 1.0) / uShadowTexDimensions, vSunRelPosition.z, bias);\nfloat brVal = isSeenBySun( tl + vec2(1.0, 1.0) / uShadowTexDimensions, vSunRelPosition.z, bias);\nfloat occludedBySun = mix(\nmix(tlVal, trVal, pos.x),\nmix(blVal, brVal, pos.x),\npos.y);\ndiffuse *= 1.0 - (shadowStrength * (1.0 - occludedBySun));\n}\nvec3 color = vColor* texture2D( uWallTexIndex, vTexCoord.st).rgb +\n(diffuse/1.5) * uLightColor;\nfloat fogIntensity = (verticalDistanceToLowerEdge - uFogDistance) / uFogBlurDistance;\nfogIntensity = clamp(fogIntensity, 0.0, 1.0);\n//gl_FragColor = vec4( mix(color, uFogColor, fogIntensity), 1.0);\ngl_FragColor = vec4( color, 1.0-fogIntensity);\n}\n"},"basemap":{"vertex":"precision highp float; // is default in vertex shaders anyway, using highp fixes #49\n#define halfPi 1.57079632679\nattribute vec4 aPosition;\nattribute vec2 aTexCoord;\nuniform mat4 uViewMatrix;\nuniform mat4 uModelMatrix;\nuniform vec2 uViewDirOnMap;\nuniform vec2 uLowerEdgePoint;\nvarying vec2 vTexCoord;\nvarying float verticalDistanceToLowerEdge;\nvoid main() {\ngl_Position = uViewMatrix * aPosition;\nvTexCoord = aTexCoord;\nvec4 worldPos = uModelMatrix * aPosition;\nvec2 dirFromLowerEdge = worldPos.xy / worldPos.w - uLowerEdgePoint;\nverticalDistanceToLowerEdge = dot(dirFromLowerEdge, uViewDirOnMap);\n}\n","fragment":"#ifdef GL_ES\nprecision mediump float;\n#endif\nuniform sampler2D uTexIndex;\nuniform vec3 uFogColor;\nvarying vec2 vTexCoord;\nvarying float verticalDistanceToLowerEdge;\nuniform float uFogDistance;\nuniform float uFogBlurDistance;\nvoid main() {\nfloat fogIntensity = (verticalDistanceToLowerEdge - uFogDistance) / uFogBlurDistance;\nfogIntensity = clamp(fogIntensity, 0.0, 1.0);\ngl_FragColor = vec4(texture2D(uTexIndex, vec2(vTexCoord.x, 1.0-vTexCoord.y)).rgb, 1.0-fogIntensity);\n}\n"},"basemap_with_shadows":{"vertex":"precision highp float; //is default in vertex shaders anyway, using highp fixes #49\nattribute vec3 aPosition;\nattribute vec3 aNormal;\nuniform mat4 uModelMatrix;\nuniform mat4 uMatrix;\nuniform mat4 uSunMatrix;\nuniform vec2 uViewDirOnMap;\nuniform vec2 uLowerEdgePoint;\n//varying vec2 vTexCoord;\nvarying vec3 vSunRelPosition;\nvarying vec3 vNormal;\nvarying float verticalDistanceToLowerEdge;\nvoid main() {\nvec4 pos = vec4(aPosition.xyz, 1.0);\ngl_Position = uMatrix * pos;\nvec4 sunRelPosition = uSunMatrix * pos;\nvSunRelPosition = (sunRelPosition.xyz / sunRelPosition.w + 1.0) / 2.0;\nvNormal = aNormal;\nvec4 worldPos = uModelMatrix * pos;\nvec2 dirFromLowerEdge = worldPos.xy / worldPos.w - uLowerEdgePoint;\nverticalDistanceToLowerEdge = dot(dirFromLowerEdge, uViewDirOnMap);\n}\n","fragment":"\n#ifdef GL_FRAGMENT_PRECISION_HIGH\nprecision highp float;\n#else\nprecision mediump float;\n#endif\n/* This shader computes the diffuse brightness of the map layer. It does *not*\n* render the map texture itself, but is instead intended to be blended on top\n* of an already rendered map.\n* Note: this shader is not (and does not attempt to) be physically correct.\n* It is intented to be a blend between a useful illustration of cast\n* shadows and a mitigation of shadow casting artifacts occuring at\n* low angles on incidence.\n* Map brightness is only affected by shadows, not by light direction.\n* Shadows are darkest when light comes from straight above (and thus\n* shadows can be computed reliably) and become less and less visible\n* with the light source close to horizon (where moirC) and offset\n* artifacts would otherwise be visible).\n*/\n//uniform sampler2D uTexIndex;\nuniform sampler2D uShadowTexIndex;\nuniform vec3 uFogColor;\nuniform vec3 uDirToSun;\nuniform vec2 uShadowTexDimensions;\nuniform float uShadowStrength;\nvarying vec2 vTexCoord;\nvarying vec3 vSunRelPosition;\nvarying vec3 vNormal;\nvarying float verticalDistanceToLowerEdge;\nuniform float uFogDistance;\nuniform float uFogBlurDistance;\nfloat isSeenBySun( const vec2 sunViewNDC, const float depth, const float bias) {\nif ( clamp( sunViewNDC, 0.0, 1.0) != sunViewNDC) //not inside sun's viewport\nreturn 1.0;\n\nfloat depthFromTexture = texture2D( uShadowTexIndex, sunViewNDC.xy).x;\n\n//compare depth values not in reciprocal but in linear depth\nreturn step(1.0/depthFromTexture, 1.0/depth + bias);\n}\nvoid main() {\n//vec2 tl = floor(vSunRelPosition.xy * uShadowTexDimensions) / uShadowTexDimensions;\n//gl_FragColor = vec4(vec3(texture2D( uShadowTexIndex, tl).x), 1.0);\n//return;\nfloat diffuse = dot(uDirToSun, normalize(vNormal));\ndiffuse = max(diffuse, 0.0);\n\nfloat shadowStrength = uShadowStrength * pow(diffuse, 1.5);\nif (diffuse > 0.0) {\n// note: the diffuse term is also the cosine between the surface normal and the\n// light direction\nfloat bias = clamp(0.0007*tan(acos(diffuse)), 0.0, 0.01);\n\nvec2 pos = fract( vSunRelPosition.xy * uShadowTexDimensions);\n\nvec2 tl = floor(vSunRelPosition.xy * uShadowTexDimensions) / uShadowTexDimensions;\nfloat tlVal = isSeenBySun( tl, vSunRelPosition.z, bias);\nfloat trVal = isSeenBySun( tl + vec2(1.0, 0.0) / uShadowTexDimensions, vSunRelPosition.z, bias);\nfloat blVal = isSeenBySun( tl + vec2(0.0, 1.0) / uShadowTexDimensions, vSunRelPosition.z, bias);\nfloat brVal = isSeenBySun( tl + vec2(1.0, 1.0) / uShadowTexDimensions, vSunRelPosition.z, bias);\ndiffuse = mix( mix(tlVal, trVal, pos.x),\nmix(blVal, brVal, pos.x),\npos.y);\n}\ndiffuse = mix(1.0, diffuse, shadowStrength);\n\nfloat fogIntensity = (verticalDistanceToLowerEdge - uFogDistance) / uFogBlurDistance;\nfogIntensity = clamp(fogIntensity, 0.0, 1.0);\nfloat darkness = (1.0 - diffuse);\ndarkness *= (1.0 - fogIntensity);\ngl_FragColor = vec4(vec3(1.0 - darkness), 1.0);\n}\n"},"texture":{"vertex":"precision highp float; //is default in vertex shaders anyway, using highp fixes #49\nattribute vec4 aPosition;\nattribute vec2 aTexCoord;\nuniform mat4 uMatrix;\nvarying vec2 vTexCoord;\nvoid main() {\ngl_Position = uMatrix * aPosition;\nvTexCoord = aTexCoord;\n}\n","fragment":"#ifdef GL_ES\nprecision mediump float;\n#endif\nuniform sampler2D uTexIndex;\nvarying vec2 vTexCoord;\nvoid main() {\ngl_FragColor = vec4(texture2D(uTexIndex, vTexCoord.st).rgb, 1.0);\n}\n"},"depth_normal":{"vertex":"precision highp float; //is default in vertex shaders anyway, using highp fixes #49\nattribute vec4 aPosition;\nattribute vec3 aNormal;\nattribute float aZScale;\nuniform mat4 uMatrix;\nuniform mat4 uModelMatrix;\nuniform mat3 uNormalMatrix;\nuniform vec2 uViewDirOnMap;\nuniform vec2 uLowerEdgePoint;\nuniform float uFade;\nvarying float verticalDistanceToLowerEdge;\nvarying vec3 vNormal;\nvoid main() {\nfloat f = clamp(uFade*aZScale, 0.0, 1.0);\nif (f == 0.0) {\ngl_Position = vec4(0.0, 0.0, 0.0, 0.0);\nverticalDistanceToLowerEdge = 0.0;\n} else {\nvec4 pos = vec4(aPosition.x, aPosition.y, aPosition.z*f, aPosition.w);\ngl_Position = uMatrix * pos;\nvNormal = uNormalMatrix * aNormal;\nvec4 worldPos = uModelMatrix * pos;\nvec2 dirFromLowerEdge = worldPos.xy / worldPos.w - uLowerEdgePoint;\nverticalDistanceToLowerEdge = dot(dirFromLowerEdge, uViewDirOnMap);\n}\n}\n","fragment":"\n#ifdef GL_ES\nprecision mediump float;\n#endif\nuniform float uFogDistance;\nuniform float uFogBlurDistance;\nvarying float verticalDistanceToLowerEdge;\nvarying vec3 vNormal;\nvoid main() {\nfloat fogIntensity = (verticalDistanceToLowerEdge - uFogDistance) / uFogBlurDistance;\ngl_FragColor = vec4(normalize(vNormal) / 2.0 + 0.5, clamp(fogIntensity, 0.0, 1.0));\n}\n"},"ambient_from_depth":{"vertex":"precision highp float; //is default in vertex shaders anyway, using highp fixes #49\nattribute vec4 aPosition;\nattribute vec2 aTexCoord;\nvarying vec2 vTexCoord;\nvoid main() {\ngl_Position = aPosition;\nvTexCoord = aTexCoord;\n}\n","fragment":"#ifdef GL_FRAGMENT_PRECISION_HIGH\n// we need high precision for the depth values\nprecision highp float;\n#else\nprecision mediump float;\n#endif\nuniform sampler2D uDepthTexIndex;\nuniform sampler2D uFogTexIndex;\nuniform vec2 uInverseTexSize; //in 1/pixels, e.g. 1/512 if the texture is 512px wide\nuniform float uEffectStrength;\nuniform float uNearPlane;\nuniform float uFarPlane;\nvarying vec2 vTexCoord;\n/* Retrieves the depth value 'offset' pixels away from 'pos' from texture 'uDepthTexIndex'. */\nfloat getDepth(vec2 pos, ivec2 offset)\n{\nfloat z = texture2D(uDepthTexIndex, pos + float(offset) * uInverseTexSize).x;\nreturn (2.0 * uNearPlane) / (uFarPlane + uNearPlane - z * (uFarPlane - uNearPlane)); // linearize depth\n}\n/* getOcclusionFactor() determines a heuristic factor (from [0..1]) for how\n* much the fragment at 'pos' with depth 'depthHere'is occluded by the\n* fragment that is (dx, dy) texels away from it.\n*/\nfloat getOcclusionFactor(float depthHere, vec2 pos, ivec2 offset) {\nfloat depthThere = getDepth(pos, offset);\n/* if the fragment at (dx, dy) has no depth (i.e. there was nothing rendered there),\n* then 'here' is not occluded (result 1.0) */\nif (depthThere == 0.0)\nreturn 1.0;\n/* if the fragment at (dx, dy) is further away from the viewer than 'here', then\n* 'here is not occluded' */\nif (depthHere < depthThere )\nreturn 1.0;\nfloat relDepthDiff = depthThere / depthHere;\nfloat depthDiff = abs(depthThere - depthHere) * uFarPlane;\n/* if the fragment at (dx, dy) is closer to the viewer than 'here', then it occludes\n* 'here'. The occlusion is the higher the bigger the depth difference between the two\n* locations is.\n* However, if the depth difference is too high, we assume that 'there' lies in a\n* completely different depth region of the scene than 'here' and thus cannot occlude\n* 'here'. This last assumption gets rid of very dark artifacts around tall buildings.\n*/\nreturn depthDiff < 50.0 ? mix(0.99, 1.0, 1.0 - clamp(depthDiff, 0.0, 1.0)) : 1.0;\n}\n/* This shader approximates the ambient occlusion in screen space (SSAO).\n* It is based on the assumption that a pixel will be occluded by neighboring\n* pixels iff. those have a depth value closer to the camera than the original\n* pixel itself (the function getOcclusionFactor() computes this occlusion\n* by a single other pixel).\n*\n* A naive approach would sample all pixels within a given distance. For an\n* interesting-looking effect, the sampling area needs to be at least 9 pixels\n* wide (-/+ 4), requiring 81 texture lookups per pixel for ambient occlusion.\n* This overburdens many GPUs.\n* To make the ambient occlusion computation faster, we do not consider all\n* texels in the sampling area, but only 16. This causes some sampling artifacts\n* that are later removed by blurring the ambient occlusion texture (this is\n* done in a separate shader).\n*/\nvoid main() {\nfloat depthHere = getDepth(vTexCoord, ivec2(0, 0));\nfloat fogIntensity = texture2D(uFogTexIndex, vTexCoord).w;\nif (depthHere == 0.0)\n{\n\t//there was nothing rendered 'here' --> it can't be occluded\ngl_FragColor = vec4(1.0);\nreturn;\n}\nfloat occlusionFactor = 1.0;\nocclusionFactor *= getOcclusionFactor(depthHere, vTexCoord, ivec2(-1, 0));\nocclusionFactor *= getOcclusionFactor(depthHere, vTexCoord, ivec2(+1, 0));\nocclusionFactor *= getOcclusionFactor(depthHere, vTexCoord, ivec2( 0, -1));\nocclusionFactor *= getOcclusionFactor(depthHere, vTexCoord, ivec2( 0, +1));\nocclusionFactor *= getOcclusionFactor(depthHere, vTexCoord, ivec2(-2, -2));\nocclusionFactor *= getOcclusionFactor(depthHere, vTexCoord, ivec2(+2, +2));\nocclusionFactor *= getOcclusionFactor(depthHere, vTexCoord, ivec2(+2, -2));\nocclusionFactor *= getOcclusionFactor(depthHere, vTexCoord, ivec2(-2, +2));\nocclusionFactor *= getOcclusionFactor(depthHere, vTexCoord, ivec2(-4, 0));\nocclusionFactor *= getOcclusionFactor(depthHere, vTexCoord, ivec2(+4, 0));\nocclusionFactor *= getOcclusionFactor(depthHere, vTexCoord, ivec2( 0, -4));\nocclusionFactor *= getOcclusionFactor(depthHere, vTexCoord, ivec2( 0, +4));\nocclusionFactor *= getOcclusionFactor(depthHere, vTexCoord, ivec2(-4, -4));\nocclusionFactor *= getOcclusionFactor(depthHere, vTexCoord, ivec2(+4, +4));\nocclusionFactor *= getOcclusionFactor(depthHere, vTexCoord, ivec2(+4, -4));\nocclusionFactor *= getOcclusionFactor(depthHere, vTexCoord, ivec2(-4, +4));\nocclusionFactor = pow(occlusionFactor, 4.0) + 55.0/255.0; // empirical bias determined to let SSAO have no effect on the map plane\nocclusionFactor = 1.0 - ((1.0 - occlusionFactor) * uEffectStrength * (1.0-fogIntensity));\ngl_FragColor = vec4(vec3(occlusionFactor), 1.0);\n}\n"},"flat_color":{"vertex":"precision highp float; // is default in vertex shaders anyway, using highp fixes #49\nattribute vec4 aPosition;\nuniform mat4 uMatrix;\nvoid main() {\ngl_Position = uMatrix * aPosition;\n}\n","fragment":"#ifdef GL_ES\nprecision mediump float;\n#endif\nuniform vec4 uColor;\nvoid main() {\ngl_FragColor = uColor;\n}\n"},"horizon":{"vertex":"precision highp float; // is default in vertex shaders anyway, using highp fixes #49\n#define halfPi 1.57079632679\nattribute vec4 aPosition;\nuniform mat4 uMatrix;\nuniform float uAbsoluteHeight;\nvarying vec2 vTexCoord;\nvarying float vRelativeHeight;\nvoid main() {\ngl_Position = uMatrix * aPosition;\nvRelativeHeight = aPosition.z / uAbsoluteHeight;\n}\n","fragment":"#ifdef GL_ES\nprecision mediump float;\n#endif\nuniform vec3 uFogColor;\nvarying float vRelativeHeight;\nvoid main() {\nfloat blendFactor = min(100.0 * vRelativeHeight, 1.0);\nvec4 skyColor = vec4(0.9, 0.85, 1.0, 1.0);\ngl_FragColor = mix(vec4(uFogColor, 1.0), skyColor, blendFactor);\n}\n"},"blur":{"vertex":"precision highp float; // is default in vertex shaders anyway, using highp fixes #49\nattribute vec4 aPosition;\nattribute vec2 aTexCoord;\nvarying vec2 vTexCoord;\nvoid main() {\ngl_Position = aPosition;\nvTexCoord = aTexCoord;\n}\n","fragment":"#ifdef GL_ES\nprecision mediump float;\n#endif\nuniform sampler2D uTexIndex;\nuniform vec2 uInverseTexSize; // as 1/n pixels, e.g. 1/512 if the texture is 512px wide\nvarying vec2 vTexCoord;\n// Retrieves the texel color 'offset' pixels away from 'pos' from texture 'uTexIndex'.\nvec4 getTexel(vec2 pos, vec2 offset) {\nreturn texture2D(uTexIndex, pos + offset * uInverseTexSize);\n}\nvoid main() {\nvec4 center = texture2D(uTexIndex, vTexCoord);\nvec4 nonDiagonalNeighbors = getTexel(vTexCoord, vec2(-1.0, 0.0)) +\ngetTexel(vTexCoord, vec2(+1.0, 0.0)) +\ngetTexel(vTexCoord, vec2( 0.0, -1.0)) +\ngetTexel(vTexCoord, vec2( 0.0, +1.0));\nvec4 diagonalNeighbors = getTexel(vTexCoord, vec2(-1.0, -1.0)) +\ngetTexel(vTexCoord, vec2(+1.0, +1.0)) +\ngetTexel(vTexCoord, vec2(-1.0, +1.0)) +\ngetTexel(vTexCoord, vec2(+1.0, -1.0));\n\n// approximate Gaussian blur (mean 0.0, stdev 1.0)\ngl_FragColor = 0.2/1.0 * center +\n0.5/4.0 * nonDiagonalNeighbors +\n0.3/4.0 * diagonalNeighbors;\n}\n"},"marker":{"vertex":"precision highp float; // is default in vertex shaders anyway, using highp fixes #49\nattribute vec4 aPosition;\n// uniform mat4 uMatrix;\nuniform mat4 uProjMatrix;\nuniform mat4 uViewMatrix;\nuniform mat4 uModelMatrix;\nattribute vec2 aTexCoord;\nvarying vec2 vTexCoord;\nuniform float markerSize;\nvoid main() {\nmat4 modelView = uViewMatrix * uModelMatrix;\nmodelView[0][0] = 1.0;\nmodelView[0][1] = 0.0;\nmodelView[0][2] = 0.0;\nmodelView[1][0] = 0.0;\nmodelView[1][1] = 1.0;\nmodelView[1][2] = 0.0;\nmodelView[2][0] = 0.0;\nmodelView[2][1] = 0.0;\nmodelView[2][2] = 1.0;\nmat4 mvp = uProjMatrix * modelView;\nfloat reciprScaleOnscreen = 0.02;\nfloat w = (mvp * vec4(0,0,0,1)).w;\nw *= reciprScaleOnscreen;\n// marker size is needed for a new offset after scaling the marker\nvec4 pos = vec4((aPosition.x * w), (aPosition.y * w) - (markerSize/2.0*w), aPosition.z * w , 1);\ngl_Position = mvp * pos;\nvTexCoord = aTexCoord;\n}\n","fragment":"#ifdef GL_ES\nprecision mediump float;\n#endif\nuniform sampler2D uTexIndex;\nvarying vec2 vTexCoord;\nvoid main() {\ngl_FragColor = texture2D(uTexIndex, vTexCoord);\n}\n"}};

const workerStr = 'class Request{static load(e,t){const r=new XMLHttpRequest,n=setTimeout(function(){4!==r.readyState&&(r.abort(),t("status"))},1e4);return r.onreadystatechange=(()=>{4===r.readyState&&(clearTimeout(n),!r.status||r.status<200||r.status>299?t("status"):t(null,r))}),r.open("GET",e),r.send(null),{abort:()=>{r.abort()}}}static getText(e,t){return this.load(e,(e,r)=>{e?t(e):void 0!==r.responseText?t(null,r.responseText):t("content")})}static getXML(e,t){return this.load(e,(e,r)=>{e?t(e):void 0!==r.responseXML?t(null,r.responseXML):t("content")})}static getJSON(e,t){return this.load(e,(r,n)=>{if(r)return void t(r);if(!n.responseText)return void t("content");let o;try{o=JSON.parse(n.responseText),t(null,o)}catch(r){console.warn(`Could not parse JSON from ${e}\\n${r.message}`),t("content")}})}}var Qolor=function(){var e={aliceblue:"#f0f8ff",antiquewhite:"#faebd7",aqua:"#00ffff",aquamarine:"#7fffd4",azure:"#f0ffff",beige:"#f5f5dc",bisque:"#ffe4c4",black:"#000000",blanchedalmond:"#ffebcd",blue:"#0000ff",blueviolet:"#8a2be2",brown:"#a52a2a",burlywood:"#deb887",cadetblue:"#5f9ea0",chartreuse:"#7fff00",chocolate:"#d2691e",coral:"#ff7f50",cornflowerblue:"#6495ed",cornsilk:"#fff8dc",crimson:"#dc143c",cyan:"#00ffff",darkblue:"#00008b",darkcyan:"#008b8b",darkgoldenrod:"#b8860b",darkgray:"#a9a9a9",darkgrey:"#a9a9a9",darkgreen:"#006400",darkkhaki:"#bdb76b",darkmagenta:"#8b008b",darkolivegreen:"#556b2f",darkorange:"#ff8c00",darkorchid:"#9932cc",darkred:"#8b0000",darksalmon:"#e9967a",darkseagreen:"#8fbc8f",darkslateblue:"#483d8b",darkslategray:"#2f4f4f",darkslategrey:"#2f4f4f",darkturquoise:"#00ced1",darkviolet:"#9400d3",deeppink:"#ff1493",deepskyblue:"#00bfff",dimgray:"#696969",dimgrey:"#696969",dodgerblue:"#1e90ff",firebrick:"#b22222",floralwhite:"#fffaf0",forestgreen:"#228b22",fuchsia:"#ff00ff",gainsboro:"#dcdcdc",ghostwhite:"#f8f8ff",gold:"#ffd700",goldenrod:"#daa520",gray:"#808080",grey:"#808080",green:"#008000",greenyellow:"#adff2f",honeydew:"#f0fff0",hotpink:"#ff69b4",indianred:"#cd5c5c",indigo:"#4b0082",ivory:"#fffff0",khaki:"#f0e68c",lavender:"#e6e6fa",lavenderblush:"#fff0f5",lawngreen:"#7cfc00",lemonchiffon:"#fffacd",lightblue:"#add8e6",lightcoral:"#f08080",lightcyan:"#e0ffff",lightgoldenrodyellow:"#fafad2",lightgray:"#d3d3d3",lightgrey:"#d3d3d3",lightgreen:"#90ee90",lightpink:"#ffb6c1",lightsalmon:"#ffa07a",lightseagreen:"#20b2aa",lightskyblue:"#87cefa",lightslategray:"#778899",lightslategrey:"#778899",lightsteelblue:"#b0c4de",lightyellow:"#ffffe0",lime:"#00ff00",limegreen:"#32cd32",linen:"#faf0e6",magenta:"#ff00ff",maroon:"#800000",mediumaquamarine:"#66cdaa",mediumblue:"#0000cd",mediumorchid:"#ba55d3",mediumpurple:"#9370db",mediumseagreen:"#3cb371",mediumslateblue:"#7b68ee",mediumspringgreen:"#00fa9a",mediumturquoise:"#48d1cc",mediumvioletred:"#c71585",midnightblue:"#191970",mintcream:"#f5fffa",mistyrose:"#ffe4e1",moccasin:"#ffe4b5",navajowhite:"#ffdead",navy:"#000080",oldlace:"#fdf5e6",olive:"#808000",olivedrab:"#6b8e23",orange:"#ffa500",orangered:"#ff4500",orchid:"#da70d6",palegoldenrod:"#eee8aa",palegreen:"#98fb98",paleturquoise:"#afeeee",palevioletred:"#db7093",papayawhip:"#ffefd5",peachpuff:"#ffdab9",peru:"#cd853f",pink:"#ffc0cb",plum:"#dda0dd",powderblue:"#b0e0e6",purple:"#800080",rebeccapurple:"#663399",red:"#ff0000",rosybrown:"#bc8f8f",royalblue:"#4169e1",saddlebrown:"#8b4513",salmon:"#fa8072",sandybrown:"#f4a460",seagreen:"#2e8b57",seashell:"#fff5ee",sienna:"#a0522d",silver:"#c0c0c0",skyblue:"#87ceeb",slateblue:"#6a5acd",slategray:"#708090",slategrey:"#708090",snow:"#fffafa",springgreen:"#00ff7f",steelblue:"#4682b4",tan:"#d2b48c",teal:"#008080",thistle:"#d8bfd8",tomato:"#ff6347",turquoise:"#40e0d0",violet:"#ee82ee",wheat:"#f5deb3",white:"#ffffff",whitesmoke:"#f5f5f5",yellow:"#ffff00",yellowgreen:"#9acd32"};function t(e,t,r){return r<0&&(r+=1),r>1&&(r-=1),r<1/6?e+6*(t-e)*r:r<.5?t:r<2/3?e+(t-e)*(2/3-r)*6:e}function r(e,t){if(void 0!==e)return Math.min(t,Math.max(0,e||0))}var n=function(e,t,n,o){this.r=r(e,1),this.g=r(t,1),this.b=r(n,1),this.a=r(o,1)||1};return n.parse=function(t){if("string"==typeof t){var r;if(t=t.toLowerCase(),r=(t=e[t]||t).match(/^#?(\\w{2})(\\w{2})(\\w{2})$/))return new n(parseInt(r[1],16)/255,parseInt(r[2],16)/255,parseInt(r[3],16)/255);if(r=t.match(/^#?(\\w)(\\w)(\\w)$/))return new n(parseInt(r[1]+r[1],16)/255,parseInt(r[2]+r[2],16)/255,parseInt(r[3]+r[3],16)/255);if(r=t.match(/rgba?\\((\\d+)\\D+(\\d+)\\D+(\\d+)(\\D+([\\d.]+))?\\)/))return new n(parseFloat(r[1])/255,parseFloat(r[2])/255,parseFloat(r[3])/255,r[4]?parseFloat(r[5]):1)}return new n},n.fromHSL=function(e,t,r){var o=(new n).fromHSL(e,t,r);return o.a=a,o},n.prototype={isValid:function(){return void 0!==this.r&&void 0!==this.g&&void 0!==this.b},toHSL:function(){if(this.isValid()){var e,t,r=Math.max(this.r,this.g,this.b),n=Math.min(this.r,this.g,this.b),o=(r+n)/2,a=r-n;if(a){switch(t=o>.5?a/(2-r-n):a/(r+n),r){case this.r:e=(this.g-this.b)/a+(this.g<this.b?6:0);break;case this.g:e=(this.b-this.r)/a+2;break;case this.b:e=(this.r-this.g)/a+4}e*=60}else e=t=0;return{h:e,s:t,l:o}}},fromHSL:function(e,r,n){if(0===r)return this.r=this.g=this.b=n,this;var o=n<.5?n*(1+r):n+r-n*r,a=2*n-o;return e/=360,this.r=t(a,o,e+1/3),this.g=t(a,o,e),this.b=t(a,o,e-1/3),this},toString:function(){if(this.isValid())return 1===this.a?"#"+((1<<24)+(Math.round(255*this.r)<<16)+(Math.round(255*this.g)<<8)+Math.round(255*this.b)).toString(16).slice(1,7):"rgba("+[Math.round(255*this.r),Math.round(255*this.g),Math.round(255*this.b),this.a.toFixed(2)].join(",")+")"},toArray:function(){if(this.isValid)return[this.r,this.g,this.b]},hue:function(e){var t=this.toHSL();return this.fromHSL(t.h+e,t.s,t.l)},saturation:function(e){var t=this.toHSL();return this.fromHSL(t.h,t.s*e,t.l)},lightness:function(e){var t=this.toHSL();return this.fromHSL(t.h,t.s,t.l*e)},clone:function(){return new n(this.r,this.g,this.b,this.a)}},n}();"object"==typeof module&&(module.exports=Qolor);class OBJ{constructor(e,t){this.materialIndex={},this.vertexIndex=[],t&&this.readMTL(t),this.meshes=[],this.readOBJ(e)}readMTL(e){let t,r=[];e.split(/[\\r\\n]/g).forEach(e=>{const n=e.trim().split(/\\s+/);switch(n[0]){case"newmtl":t&&(this.materialIndex[t]=r),t=n[1],r=[];break;case"Kd":r=[parseFloat(n[1]),parseFloat(n[2]),parseFloat(n[3])]}}),t&&(this.materialIndex[t]=r),e=null}readOBJ(e){let t,r,n=[];e.split(/[\\r\\n]/g).forEach(e=>{const o=e.trim().split(/\\s+/);switch(o[0]){case"g":case"o":this.storeMesh(t,r,n),t=o[1],n=[];break;case"usemtl":this.storeMesh(t,r,n),this.materialIndex[o[1]]&&(r=this.materialIndex[o[1]]),n=[];break;case"v":this.vertexIndex.push([parseFloat(o[1]),parseFloat(o[2]),parseFloat(o[3])]);break;case"f":n.push([parseFloat(o[1])-1,parseFloat(o[2])-1,parseFloat(o[3])-1])}}),this.storeMesh(t,r,n)}storeMesh(e,t,r){if(r.length){const n=this.createGeometry(r);this.meshes.push({...n,color:t,id:e})}}sub(e,t){return[e[0]-t[0],e[1]-t[1],e[2]-t[2]]}unit(e){const t=this.len(e);return[e[0]/t,e[1]/t,e[2]/t]}normal(e,t,r){const n=this.sub(e,t),o=this.sub(t,r);return this.unit([n[1]*o[2]-n[2]*o[1],n[2]*o[0]-n[0]*o[2],n[0]*o[1]-n[1]*o[0]])}createGeometry(e){const t=[],r=[],n=[];let o=-1/0;return e.forEach(e=>{const a=this.vertexIndex[e[0]],i=this.vertexIndex[e[1]],s=this.vertexIndex[e[2]],l=this.normal(a,i,s);t.push(a[0],a[2],a[1],i[0],i[2],i[1],s[0],s[2],s[1]),r.push(l[0],l[1],l[2],l[0],l[1],l[2],l[0],l[1],l[2]),n.push(0,0,0,0,0,0),o=Math.max(o,a[1],i[1],s[1])}),{vertices:t,normals:r,texCoords:n,height:o}}}OBJ.parse=function(e,t){return new OBJ(e,t).meshes};var createRoof,triangulate=function(){var e=10,t=[.8627450980392157,.8235294117647058,.7843137254901961];METERS_PER_LEVEL=3;var r={brick:"#cc7755",bronze:"#ffeecc",canvas:"#fff8f0",concrete:"#999999",copper:"#a0e0d0",glass:"#e8f8f8",gold:"#ffcc00",plants:"#009933",metal:"#aaaaaa",panel:"#fff8f0",plaster:"#999999",roof_tiles:"#f08060",silver:"#cccccc",slate:"#666666",stone:"#996666",tar_paper:"#333333",wood:"#deb887"},n={asphalt:"tar_paper",bitumen:"tar_paper",block:"stone",bricks:"brick",glas:"glass",glassfront:"glass",grass:"plants",masonry:"stone",granite:"stone",panels:"panel",paving_stones:"stone",plastered:"plaster",rooftiles:"roof_tiles",roofingfelt:"tar_paper",sandstone:"stone",sheet:"canvas",sheets:"canvas",shingle:"tar_paper",shingles:"tar_paper",slates:"slate",steel:"metal",tar:"tar_paper",tent:"canvas",thatch:"plants",tile:"roof_tiles",tiles:"roof_tiles"},o=.5,a=6378137*Math.PI/180;function i(e){return"string"!=typeof e?null:"#"===(e=e.toLowerCase())[0]?e:r[n[e]||e]||null}function s(e,r){r=r||0;var n,o=Qolor.parse(e);return[(n=o.isValid()?o.saturation(.7).toArray():t)[0]+r,n[1]+r,n[2]+r]}return function(t,r,n,l,f){var c=[a*Math.cos(n[1]/180*Math.PI),a];(function(e){switch(e.type){case"MultiPolygon":return e.coordinates;case"Polygon":return[e.coordinates];default:return[]}})(r.geometry).map(function(a){var u=function(e,t,r){return e.map(function(e,n){return 0===n!==function(e){return 0<e.reduce(function(e,t,r,n){return e+(r<n.length-1?(n[r+1][0]-t[0])*(n[r+1][1]+t[1]):0)},0)}(e)&&e.reverse(),e.map(function(e){return[(e[0]-t[0])*r[0],-(e[1]-t[1])*r[1]]})})}(a,n,c);!function(t,r,n,a,l){var f=function(t,r){var n,o={};switch(o.center=[r.minX+(r.maxX-r.minX)/2,r.minY+(r.maxY-r.minY)/2],o.radius=(r.maxX-r.minX)/2,o.roofHeight=t.roofHeight||(t.roofLevels?t.roofLevels*METERS_PER_LEVEL:0),t.roofShape){case"cone":case"pyramid":case"dome":case"onion":o.roofHeight=o.roofHeight||1*o.radius;break;case"gabled":case"hipped":case"half-hipped":case"skillion":case"gambrel":case"mansard":case"round":o.roofHeight=o.roofHeight||1*METERS_PER_LEVEL;break;case"flat":o.roofHeight=0;break;default:o.roofHeight=0}if(o.wallZ=t.minHeight||(t.minLevel?t.minLevel*METERS_PER_LEVEL:0),void 0!==t.height)n=t.height,o.roofHeight=Math.min(o.roofHeight,n),o.roofZ=n-o.roofHeight,o.wallHeight=n-o.roofHeight-o.wallZ;else if(void 0!==t.levels)n=t.levels*METERS_PER_LEVEL,o.roofZ=n,o.wallHeight=n-o.wallZ;else{switch(t.shape){case"cone":case"dome":case"pyramid":n=2*o.radius,o.roofHeight=0;break;case"sphere":n=4*o.radius,o.roofHeight=0;break;default:n=e}o.roofZ=n,o.wallHeight=n-o.wallZ}return o}(r,function(e){for(var t=1/0,r=1/0,n=-1/0,o=-1/0,a=0;a<e.length;a++)t=Math.min(t,e[a][0]),r=Math.min(r,e[a][1]),n=Math.max(n,e[a][0]),o=Math.max(o,e[a][1]);return{minX:t,minY:r,maxX:n,maxY:o}}(n[0])),c=s(a||r.wallColor||r.color||i(r.material),l),u=s(a||r.roofColor||i(r.roofMaterial),l);switch(r.shape){case"cone":return void split.cylinder(t,f.center,f.radius,0,f.wallHeight,f.wallZ,c);case"dome":return void split.dome(t,f.center,f.radius,f.wallHeight,f.wallZ,c);case"pyramid":return void split.pyramid(t,n,f.center,f.wallHeight,f.wallZ,c);case"sphere":return void split.sphere(t,f.center,f.radius,f.wallHeight,f.wallZ,c)}switch(createRoof(t,r,n,f,u,c),r.shape){case"none":return;case"cylinder":return void split.cylinder(t,f.center,f.radius,f.radius,f.wallHeight,f.wallZ,c);default:var h=.2,d=.4;"glass"!==r.material&&(h=0,d=0,r.levels&&(d=parseFloat(r.levels)-parseFloat(r.minLevel||0)<<0)),split.extrusion(t,n,f.wallHeight,f.wallZ,c,[0,o,h/f.wallHeight,d/f.wallHeight])}}(t,r.properties,u,l,f)})}}();function pointOnSegment(e,t){return e[0]>=Math.min(t[0][0],t[1][0])&&e[0]<=Math.max(t[1][0],t[0][0])&&e[1]>=Math.min(t[0][1],t[1][1])&&e[1]<=Math.max(t[1][1],t[0][1])}function getVectorSegmentIntersection(e,t,r){var n,o,a,i,s,l=r[0],f=[r[1][0]-r[0][0],r[1][1]-r[0][1]];if(0!==t[0]||0!==f[0]){if(0!==t[0]&&(a=t[1]/t[0],n=e[1]-a*e[0]),0!==f[0]&&(i=f[1]/f[0],o=l[1]-i*l[0]),0===t[0]&&pointOnSegment(s=[e[0],i*e[0]+o],r))return s;if(0===f[0]&&pointOnSegment(s=[l[0],a*l[0]+n],r))return s;if(a!==i){var c=(o-n)/(a-i);return pointOnSegment(s=[c,a*c+n],r)?s:void 0}}}function getDistanceToLine(e,t){var r=t[0],n=t[1];if(r[0]!==n[0]||r[1]!==n[1]){var o=(n[1]-r[1])/(n[0]-r[0]),a=r[1]-o*r[0];if(0===o)return Math.abs(a-e[1]);if(o===1/0)return Math.abs(r[0]-e[0]);var i=-1/o,s=(e[1]-i*e[0]-a)/(o-i),l=o*s+a,f=e[0]-s,c=e[1]-l;return Math.sqrt(f*f+c*c)}}!function(){function e(e,r,n,o,a,i,s){if(0,n.length>1||void 0===r.roofDirection)return t(e,r,n,a,i);var l=(r.roofDirection/180-.5)*Math.PI,f=[Math.cos(l),Math.sin(l)],c=function(e,t,r){for(var n,o=[],a=0;a<r.length-1;a++)if(void 0!==(n=getVectorSegmentIntersection(e,t,[r[a],r[a+1]]))){if(2===o.length)return;a++,r.splice(a,0,n),o.push(a)}if(!(o.length<2))return{index:o,roof:r}}(a.center,f,n[0]);if(!c)return t(e,r,n,a,i);for(var u,h=c.index,d=c.roof,p=[],g=0,v=[d[h[0]],d[h[1]]],x=0;x<d.length;x++)p[x]=getDistanceToLine(d[x],v),g=Math.max(g,p[x]);for(x=0;x<d.length;x++)d[x][2]=(1-p[x]/g)*a.roofHeight;for(u=d.slice(h[0],h[1]+1),split.polygon(e,[u],a.roofZ,i),u=(u=d.slice(h[1],d.length-1)).concat(d.slice(0,h[0]+1)),split.polygon(e,[u],a.roofZ,i),x=0;x<d.length-1;x++)0===d[x][2]&&0===d[x+1][2]||split.quad(e,[d[x][0],d[x][1],a.roofZ+d[x][2]],[d[x][0],d[x][1],a.roofZ],[d[x+1][0],d[x+1][1],a.roofZ],[d[x+1][0],d[x+1][1],a.roofZ+d[x+1][2]],s)}function t(e,t,r,n,o){"cylinder"===t.shape?split.circle(e,n.center,n.radius,n.roofZ,o):split.polygon(e,r,n.roofZ,o)}createRoof=function(r,n,o,a,i,s){switch(n.roofShape){case"cone":return function(e,t,r,n){split.polygon(e,t,r.roofZ,n),split.cylinder(e,r.center,r.radius,0,r.roofHeight,r.roofZ,n)}(r,o,a,i);case"dome":return function(e,t,r,n){split.polygon(e,t,r.roofZ,n),split.dome(e,r.center,r.radius,r.roofHeight,r.roofZ,n)}(r,o,a,i);case"pyramid":return function(e,t,r,n,o){"cylinder"===t.shape?split.cylinder(e,n.center,n.radius,0,n.roofHeight,n.roofZ,o):split.pyramid(e,r,n.center,n.roofHeight,n.roofZ,o)}(r,n,o,a,i);case"skillion":return function(e,r,n,o,a,i){if(void 0===r.roofDirection)return t(e,r,n,o,a);var s,l,f=r.roofDirection/180*Math.PI,c=1/0,u=-1/0;n[0].forEach(function(e){var t=e[1]*Math.cos(-f)+e[0]*Math.sin(-f);t<c&&(c=t,s=e),t>u&&(u=t,l=e)});var h=n[0],d=[Math.cos(f),Math.sin(f)],p=[s,[s[0]+d[0],s[1]+d[1]]],g=getDistanceToLine(l,p);n.forEach(function(e){e.forEach(function(e){var t=getDistanceToLine(e,p);e[2]=t/g*o.roofHeight})}),split.polygon(e,[h],o.roofZ,a),n.forEach(function(t){for(var r=0;r<t.length-1;r++)0===t[r][2]&&0===t[r+1][2]||split.quad(e,[t[r][0],t[r][1],o.roofZ+t[r][2]],[t[r][0],t[r][1],o.roofZ],[t[r+1][0],t[r+1][1],o.roofZ],[t[r+1][0],t[r+1][1],o.roofZ+t[r+1][2]],i)})}(r,n,o,a,i,s);case"gabled":return e(r,n,o,0,a,i,s);case"hipped":case"half-hipped":return t(r,n,o,a,i);case"gambrel":case"mansard":return e(r,n,o,0,a,i,s);case"round":return function(e,r,n,o,a,i){if(n.length>1||void 0===r.roofDirection)return t(e,r,n,o,a);return t(e,r,n,o,a)}(r,n,o,a,i);case"onion":return function(e,t,r,n){split.polygon(e,t,r.roofZ,n);for(var o,a,i=[{rScale:.8,hScale:0},{rScale:.9,hScale:.18},{rScale:.9,hScale:.35},{rScale:.8,hScale:.47},{rScale:.6,hScale:.59},{rScale:.5,hScale:.65},{rScale:.2,hScale:.82},{rScale:0,hScale:1}],s=0,l=i.length-1;s<l;s++)o=r.roofHeight*i[s].hScale,a=r.roofHeight*i[s+1].hScale,split.cylinder(e,r.center,r.radius*i[s].rScale,r.radius*i[s+1].rScale,a-o,r.roofZ+o,n)}(r,o,a,i);default:return t(r,n,o,a,i)}}}();var split={NUM_Y_SEGMENTS:24,NUM_X_SEGMENTS:32,quad:function(e,t,r,n,o,a){this.triangle(e,t,r,n,a),this.triangle(e,n,o,t,a)},triangle:function(e,t,r,n,o){var a=vec3.normal(t,r,n);[].push.apply(e.vertices,[].concat(t,n,r)),[].push.apply(e.normals,[].concat(a,a,a)),[].push.apply(e.colors,[].concat(o,o,o)),e.texCoords.push(0,0,0,0,0,0)},circle:function(e,t,r,n,o){var a,i;n=n||0;for(var s=0;s<this.NUM_X_SEGMENTS;s++)a=s/this.NUM_X_SEGMENTS,i=(s+1)/this.NUM_X_SEGMENTS,this.triangle(e,[t[0]+r*Math.sin(a*Math.PI*2),t[1]+r*Math.cos(a*Math.PI*2),n],[t[0],t[1],n],[t[0]+r*Math.sin(i*Math.PI*2),t[1]+r*Math.cos(i*Math.PI*2),n],o)},polygon:function(e,t,r,n){r=r||0;var o,a,i,s,l,f=[],c=[],u=0;for(o=0,a=t.length;o<a;o++){for(s=t[o],i=0;i<s.length;i++)l=s[i],f.push(l[0],l[1],r+(l[2]||0));o&&(u+=t[o-1].length,c.push(u))}var h,d,p,g=earcut(f,c,3);for(o=0,a=g.length-2;o<a;o+=3)h=3*g[o],d=3*g[o+1],p=3*g[o+2],this.triangle(e,[f[h],f[h+1],f[h+2]],[f[d],f[d+1],f[d+2]],[f[p],f[p+1],f[p+2]],n)},cube:function(e,t,r,n,o,a,i,s){var l=[o=o||0,a=a||0,i=i||0],f=[o+t,a,i],c=[o+t,a+r,i],u=[o,a+r,i],h=[o,a,i+n],d=[o+t,a,i+n],p=[o+t,a+r,i+n],g=[o,a+r,i+n];this.quad(e,f,l,u,c,s),this.quad(e,h,d,p,g,s),this.quad(e,l,f,d,h,s),this.quad(e,f,c,p,d,s),this.quad(e,c,u,g,p,s),this.quad(e,u,l,h,g,s)},cylinder:function(e,t,r,n,o,a,i){a=a||0;for(var s,l,f,c,u,h,d=this.NUM_X_SEGMENTS,p=2*Math.PI,g=0;g<d;g++)s=g/d*p,l=(g+1)/d*p,f=Math.sin(s),c=Math.cos(s),u=Math.sin(l),h=Math.cos(l),this.triangle(e,[t[0]+r*f,t[1]+r*c,a],[t[0]+n*u,t[1]+n*h,a+o],[t[0]+r*u,t[1]+r*h,a],i),0!==n&&this.triangle(e,[t[0]+n*f,t[1]+n*c,a+o],[t[0]+n*u,t[1]+n*h,a+o],[t[0]+r*f,t[1]+r*c,a],i)},dome:function(e,t,r,n,o,a,i){o=o||0;for(var s,l,f,c,u,h,d,p,g,v=this.NUM_Y_SEGMENTS/2,x=Math.PI/2,m=i?0:-x,y=0;y<v;y++)s=y/v*x+m,l=(y+1)/v*x+m,f=Math.cos(s),c=Math.sin(s),h=f*r,d=Math.cos(l)*r,p=((u=Math.sin(l))-c)*n,g=o-u*n,this.cylinder(e,t,d,h,p,g,a)},sphere:function(e,t,r,n,o,a){o=o||0;var i=0;return i+=this.dome(e,t,r,n/2,o+n/2,a,!0),i+=this.dome(e,t,r,n/2,o+n/2,a)},pyramid:function(e,t,r,n,o,a){o=o||0;for(var i=0,s=(t=t[0]).length-1;i<s;i++)this.triangle(e,[t[i][0],t[i][1],o],[t[i+1][0],t[i+1][1],o],[r[0],r[1],o+n],a)},extrusion:function(e,t,r,n,o,a){n=n||0;var i,s,l,f,c,u,h,d,p,g,v,x,m,y,b,M=a[2]*r,w=a[3]*r;for(x=0,m=t.length;x<m;x++)for(y=0,b=(i=t[x]).length-1;y<b;y++)s=i[y],l=i[y+1],f=vec2.len(vec2.sub(s,l)),c=[s[0],s[1],n],u=[l[0],l[1],n],h=[l[0],l[1],n+r],d=[s[0],s[1],n+r],p=vec3.normal(c,u,h),[].push.apply(e.vertices,[].concat(c,h,u,c,d,h)),[].push.apply(e.normals,[].concat(p,p,p,p,p,p)),[].push.apply(e.colors,[].concat(o,o,o,o,o,o)),g=a[0]*f<<0,v=a[1]*f<<0,e.texCoords.push(g,w,v,M,v,w,g,w,g,M,v,M)}},earcut=function(){function e(e,o,a){a=a||2;var i,s,c,h,d,p,g,v=o&&o.length,x=v?o[0]*a:e.length,m=t(e,0,x,a,!0),y=[];if(!m)return y;if(v&&(m=function(e,n,o,a){var i,s,c,h,d,p=[];for(i=0,s=n.length;i<s;i++)c=n[i]*a,h=i<s-1?n[i+1]*a:e.length,(d=t(e,c,h,a,!1))===d.next&&(d.steiner=!0),p.push(u(d));for(p.sort(l),i=0;i<p.length;i++)f(p[i],o),o=r(o,o.next);return o}(e,o,m,a)),e.length>80*a){i=c=e[0],s=h=e[1];for(var b=a;b<x;b+=a)d=e[b],p=e[b+1],d<i&&(i=d),p<s&&(s=p),d>c&&(c=d),p>h&&(h=p);g=Math.max(c-i,h-s)}return n(m,y,a,i,s,g),y}function t(e,t,r,n,o){var a,i;if(o===w(e,t,r,n)>0)for(a=t;a<r;a+=n)i=y(a,e[a],e[a+1],i);else for(a=r-n;a>=t;a-=n)i=y(a,e[a],e[a+1],i);return i&&g(i,i.next)&&(b(i),i=i.next),i}function r(e,t){if(!e)return e;t||(t=e);var r,n=e;do{if(r=!1,n.steiner||!g(n,n.next)&&0!==p(n.prev,n,n.next))n=n.next;else{if(b(n),(n=t=n.prev)===n.next)return null;r=!0}}while(r||n!==t);return t}function n(e,t,l,f,u,h,d){if(e){!d&&h&&function(e,t,r,n){var o=e;do{null===o.z&&(o.z=c(o.x,o.y,t,r,n)),o.prevZ=o.prev,o.nextZ=o.next,o=o.next}while(o!==e);o.prevZ.nextZ=null,o.prevZ=null,function(e){var t,r,n,o,a,i,s,l,f=1;do{for(r=e,e=null,a=null,i=0;r;){for(i++,n=r,s=0,t=0;t<f&&(s++,n=n.nextZ);t++);for(l=f;s>0||l>0&&n;)0===s?(o=n,n=n.nextZ,l--):0!==l&&n?r.z<=n.z?(o=r,r=r.nextZ,s--):(o=n,n=n.nextZ,l--):(o=r,r=r.nextZ,s--),a?a.nextZ=o:e=o,o.prevZ=a,a=o;r=n}a.nextZ=null,f*=2}while(i>1)}(o)}(e,f,u,h);for(var p,g,v=e;e.prev!==e.next;)if(p=e.prev,g=e.next,h?a(e,f,u,h):o(e))t.push(p.i/l),t.push(e.i/l),t.push(g.i/l),b(e),e=g.next,v=g.next;else if((e=g)===v){d?1===d?n(e=i(e,t,l),t,l,f,u,h,2):2===d&&s(e,t,l,f,u,h):n(r(e),t,l,f,u,h,1);break}}}function o(e){var t=e.prev,r=e,n=e.next;if(p(t,r,n)>=0)return!1;for(var o=e.next.next;o!==e.prev;){if(h(t.x,t.y,r.x,r.y,n.x,n.y,o.x,o.y)&&p(o.prev,o,o.next)>=0)return!1;o=o.next}return!0}function a(e,t,r,n){var o=e.prev,a=e,i=e.next;if(p(o,a,i)>=0)return!1;for(var s=o.x<a.x?o.x<i.x?o.x:i.x:a.x<i.x?a.x:i.x,l=o.y<a.y?o.y<i.y?o.y:i.y:a.y<i.y?a.y:i.y,f=o.x>a.x?o.x>i.x?o.x:i.x:a.x>i.x?a.x:i.x,u=o.y>a.y?o.y>i.y?o.y:i.y:a.y>i.y?a.y:i.y,d=c(s,l,t,r,n),g=c(f,u,t,r,n),v=e.nextZ;v&&v.z<=g;){if(v!==e.prev&&v!==e.next&&h(o.x,o.y,a.x,a.y,i.x,i.y,v.x,v.y)&&p(v.prev,v,v.next)>=0)return!1;v=v.nextZ}for(v=e.prevZ;v&&v.z>=d;){if(v!==e.prev&&v!==e.next&&h(o.x,o.y,a.x,a.y,i.x,i.y,v.x,v.y)&&p(v.prev,v,v.next)>=0)return!1;v=v.prevZ}return!0}function i(e,t,r){var n=e;do{var o=n.prev,a=n.next.next;!g(o,a)&&v(o,n,n.next,a)&&x(o,a)&&x(a,o)&&(t.push(o.i/r),t.push(n.i/r),t.push(a.i/r),b(n),b(n.next),n=e=a),n=n.next}while(n!==e);return n}function s(e,t,o,a,i,s){var l=e;do{for(var f=l.next.next;f!==l.prev;){if(l.i!==f.i&&d(l,f)){var c=m(l,f);return l=r(l,l.next),c=r(c,c.next),n(l,t,o,a,i,s),void n(c,t,o,a,i,s)}f=f.next}l=l.next}while(l!==e)}function l(e,t){return e.x-t.x}function f(e,t){if(t=function(e,t){var r,n=t,o=e.x,a=e.y,i=-1/0;do{if(a<=n.y&&a>=n.next.y){var s=n.x+(a-n.y)*(n.next.x-n.x)/(n.next.y-n.y);if(s<=o&&s>i){if(i=s,s===o){if(a===n.y)return n;if(a===n.next.y)return n.next}r=n.x<n.next.x?n:n.next}}n=n.next}while(n!==t);if(!r)return null;if(o===i)return r.prev;var l,f=r,c=r.x,u=r.y,d=1/0;n=r.next;for(;n!==f;)o>=n.x&&n.x>=c&&h(a<u?o:i,a,c,u,a<u?i:o,a,n.x,n.y)&&((l=Math.abs(a-n.y)/(o-n.x))<d||l===d&&n.x>r.x)&&x(n,e)&&(r=n,d=l),n=n.next;return r}(e,t)){var n=m(t,e);r(n,n.next)}}function c(e,t,r,n,o){return(e=1431655765&((e=858993459&((e=252645135&((e=16711935&((e=32767*(e-r)/o)|e<<8))|e<<4))|e<<2))|e<<1))|(t=1431655765&((t=858993459&((t=252645135&((t=16711935&((t=32767*(t-n)/o)|t<<8))|t<<4))|t<<2))|t<<1))<<1}function u(e){var t=e,r=e;do{t.x<r.x&&(r=t),t=t.next}while(t!==e);return r}function h(e,t,r,n,o,a,i,s){return(o-i)*(t-s)-(e-i)*(a-s)>=0&&(e-i)*(n-s)-(r-i)*(t-s)>=0&&(r-i)*(a-s)-(o-i)*(n-s)>=0}function d(e,t){return e.next.i!==t.i&&e.prev.i!==t.i&&!function(e,t){var r=e;do{if(r.i!==e.i&&r.next.i!==e.i&&r.i!==t.i&&r.next.i!==t.i&&v(r,r.next,e,t))return!0;r=r.next}while(r!==e);return!1}(e,t)&&x(e,t)&&x(t,e)&&function(e,t){var r=e,n=!1,o=(e.x+t.x)/2,a=(e.y+t.y)/2;do{r.y>a!=r.next.y>a&&o<(r.next.x-r.x)*(a-r.y)/(r.next.y-r.y)+r.x&&(n=!n),r=r.next}while(r!==e);return n}(e,t)}function p(e,t,r){return(t.y-e.y)*(r.x-t.x)-(t.x-e.x)*(r.y-t.y)}function g(e,t){return e.x===t.x&&e.y===t.y}function v(e,t,r,n){return!!(g(e,t)&&g(r,n)||g(e,n)&&g(r,t))||p(e,t,r)>0!=p(e,t,n)>0&&p(r,n,e)>0!=p(r,n,t)>0}function x(e,t){return p(e.prev,e,e.next)<0?p(e,t,e.next)>=0&&p(e,e.prev,t)>=0:p(e,t,e.prev)<0||p(e,e.next,t)<0}function m(e,t){var r=new M(e.i,e.x,e.y),n=new M(t.i,t.x,t.y),o=e.next,a=t.prev;return e.next=t,t.prev=e,r.next=o,o.prev=r,n.next=r,r.prev=n,a.next=n,n.prev=a,n}function y(e,t,r,n){var o=new M(e,t,r);return n?(o.next=n.next,o.prev=n,n.next.prev=o,n.next=o):(o.prev=o,o.next=o),o}function b(e){e.next.prev=e.prev,e.prev.next=e.next,e.prevZ&&(e.prevZ.nextZ=e.nextZ),e.nextZ&&(e.nextZ.prevZ=e.prevZ)}function M(e,t,r){this.i=e,this.x=t,this.y=r,this.prev=null,this.next=null,this.z=null,this.prevZ=null,this.nextZ=null,this.steiner=!1}function w(e,t,r,n){for(var o=0,a=t,i=r-n;a<r;a+=n)o+=(e[i]-e[a])*(e[a+1]+e[i+1]),i=a;return o}return e.deviation=function(e,t,r,n){var o,a,i=t&&t.length,s=i?t[0]*r:e.length,l=Math.abs(w(e,0,s,r));if(i)for(o=0,a=t.length;o<a;o++){var f=t[o]*r,c=o<a-1?t[o+1]*r:e.length;l-=Math.abs(w(e,f,c,r))}var u=0;for(o=0,a=n.length;o<a;o+=3){var h=n[o]*r,d=n[o+1]*r,p=n[o+2]*r;u+=Math.abs((e[h]-e[p])*(e[d+1]-e[h+1])-(e[h]-e[d])*(e[p+1]-e[h+1]))}return 0===l&&0===u?0:Math.abs((u-l)/l)},e.flatten=function(e){for(var t=e[0][0].length,r={vertices:[],holes:[],dimensions:t},n=0,o=0;o<e.length;o++){for(var a=0;a<e[o].length;a++)for(var i=0;i<t;i++)r.vertices.push(e[o][a][i]);o>0&&(n+=e[o-1].length,r.holes.push(n))}return r},e}(),vec3={len:function(e){return Math.sqrt(e[0]*e[0]+e[1]*e[1]+e[2]*e[2])},sub:function(e,t){return[e[0]-t[0],e[1]-t[1],e[2]-t[2]]},unit:function(e){var t=this.len(e);return[e[0]/t,e[1]/t,e[2]/t]},normal:function(e,t,r){var n=this.sub(e,t),o=this.sub(t,r);return this.unit([n[1]*o[2]-n[2]*o[1],n[2]*o[0]-n[0]*o[2],n[0]*o[1]-n[1]*o[0]])}},vec2={len:function(e){return Math.sqrt(e[0]*e[0]+e[1]*e[1])},add:function(e,t){return[e[0]+t[0],e[1]+t[1]]},sub:function(e,t){return[e[0]-t[0],e[1]-t[1]]},dot:function(e,t){return e[1]*t[0]-e[0]*t[1]},scale:function(e,t){return[e[0]*t,e[1]*t]},equals:function(e,t){return e[0]===t[0]&&e[1]===t[1]}};function getOrigin(e){const t=e.coordinates;switch(e.type){case"Point":return t;case"MultiPoint":case"LineString":return t[0];case"MultiLineString":case"Polygon":return t[0][0];case"MultiPolygon":return t[0][0][0]}}function getPickingColor(e){return[0,(255&++e)/255,(e>>8&255)/255]}function postResult(e,t,r){const n={items:e,position:t,vertices:new Float32Array(r.vertices),normals:new Float32Array(r.normals),colors:new Float32Array(r.colors),texCoords:new Float32Array(r.texCoords),heights:new Float32Array(r.heights),pickingColors:new Float32Array(r.pickingColors)};postMessage(n,[n.vertices.buffer,n.normals.buffer,n.colors.buffer,n.texCoords.buffer,n.heights.buffer,n.pickingColors.buffer])}function loadGeoJSON(e){"object"==typeof e.url?(postMessage("load"),processGeoJSON(e.url,e.options)):Request.getJSON(e.url,(t,r)=>{t?postMessage("error"):(postMessage("load"),processGeoJSON(r,e.options))})}function processGeoJSON(e,t){if(!e||!e.features.length)return void postMessage("error");const r={vertices:[],normals:[],colors:[],texCoords:[],heights:[],pickingColors:[]},n=[],o=getOrigin(e.features[0].geometry),a={latitude:o[1],longitude:o[0]};e.features.forEach((e,a)=>{const i=e.properties,s=t.id||e.id,l=getPickingColor(a);let f=r.vertices.length;triangulate(r,e,o),f=(r.vertices.length-f)/3;for(let e=0;e<f;e++)r.heights.push(i.height),r.pickingColors.push(...l);n.push({id:s,properties:i,vertexCount:f})}),postResult(n,a,r)}function loadOBJ(e){Request.getText(e.url,(e,t)=>{if(e)return void postMessage("error");let r=t.match(/^mtllib\\s+(.*)$/m);r?Request.getText(this.url.replace(/[^\\/]+$/,"")+r[1],(e,r)=>{e?postMessage("error"):(postMessage("load"),processOBJ(t,r))}):(postMessage("load"),processOBJ(t,null))})}function processOBJ(e,t,r){const n={vertices:[],normals:[],colors:[],texCoords:[],heights:[],pickingColors:[]},o=[],a=Qolor.parse(r.color).toArray(),s=r.position;OBJ.parse(e,t).forEach((e,t)=>{n.vertices.push(...e.vertices),n.normals.push(...e.normals),n.texCoords.push(...e.texCoords);const s=r.id||e.id,l=(s/2%2?-1:1)*(s%2?.03:.06),f=a||e.color||DEFAULT_COLOR,c=e.vertices.length/3,u=getPickingColor(i);for(let t=0;t<c;t++)n.colors.push(f[0]+l,f[1]+l,f[2]+l),n.heights.push(e.height),n.pickingColors.push(...u);o.push({id:s,properties:{},vertexCount:c})}),postResult(o,s,n)}onmessage=function(e){const t=e.data;"GeoJSON"===t.type&&loadGeoJSON(t),"OBJ"===t.type&&loadOBJ(t)};';


class GLX {

  constructor(canvas, quickRender) {
    let GL;

    const canvasOptions = {
      antialias: !quickRender,
      depth: true,
      premultipliedAlpha: false
    };

    try {
      GL = canvas.getContext('webgl', canvasOptions);
    } catch (ex) {}

    if (!GL) {
      try {
        GL = canvas.getContext('experimental-webgl', canvasOptions);
      } catch (ex) {}
    }

    if (!GL) {
      throw new Error('GL not supported');
    }

    canvas.addEventListener('webglcontextlost', e => {
      console.warn('context lost');
    });

    canvas.addEventListener('webglcontextrestored', e => {
      console.warn('context restored');
    });

    GL.viewport(0, 0, canvas.width, canvas.height);
    GL.cullFace(GL.BACK);
    GL.enable(GL.CULL_FACE);
    GL.enable(GL.DEPTH_TEST);
    GL.clearColor(0.5, 0.5, 0.5, 1);

    if (!quickRender) { // TODO OSMB4 always activate but use dynamically
      GL.anisotropyExtension = GL.getExtension('EXT_texture_filter_anisotropic');
      if (GL.anisotropyExtension) {
        GL.anisotropyExtension.maxAnisotropyLevel = GL.getParameter(GL.anisotropyExtension.MAX_TEXTURE_MAX_ANISOTROPY_EXT);
      }
      GL.depthTextureExtension = GL.getExtension('WEBGL_depth_texture');
    }

    this.GL = GL;
  }

  destroy () {
    const ext = this.GL.getExtension('WEBGL_lose_context');
    ext.loseContext();
    this.GL = null;
  }
}

GLX.Buffer = class {

  constructor (itemSize, data) {
    this.id = GL.createBuffer();
    this.itemSize = itemSize;
    this.numItems = data.length / itemSize;
    GL.bindBuffer(GL.ARRAY_BUFFER, this.id);
    GL.bufferData(GL.ARRAY_BUFFER, data, GL.STATIC_DRAW);
    data = null; // gc
  }

  // DEPRECATED
  enable () {
    GL.bindBuffer(GL.ARRAY_BUFFER, this.id);
  }

  use () {
    GL.bindBuffer(GL.ARRAY_BUFFER, this.id);
  }

  destroy () {
    GL.deleteBuffer(this.id);
    this.id = null;
  }
};


GLX.Framebuffer = class {

  constructor(width, height, useDepthTexture) {
    if (useDepthTexture && !GL.depthTextureExtension) {
      throw new Error('GL: Depth textures are not supported');
    }

    this.useDepthTexture = !!useDepthTexture;
    this.setSize(width, height);
  }

  setSize(width, height) {
    if (!this.frameBuffer) {
      this.frameBuffer = GL.createFramebuffer();
    } else if (width === this.width && height === this.height) { // already has the right size
      return;
    }

    GL.bindFramebuffer(GL.FRAMEBUFFER, this.frameBuffer);

    this.width  = width;
    this.height = height;
    
    if (this.depthRenderBuffer) {
      GL.deleteRenderbuffer(this.depthRenderBuffer);
      this.depthRenderBuffer = null;
    } 
    
    if (this.depthTexture) {
      this.depthTexture.destroy();
      this.depthTexture = null;
    }
    
    if (this.useDepthTexture) {
      this.depthTexture = new GLX.texture.Image(); // GL.createTexture();
      this.depthTexture.enable(0);
      GL.texParameteri(GL.TEXTURE_2D, GL.TEXTURE_MIN_FILTER, GL.NEAREST);
      GL.texParameteri(GL.TEXTURE_2D, GL.TEXTURE_MAG_FILTER, GL.NEAREST);
      // CLAMP_TO_EDGE is required for NPOT textures
      GL.texParameteri(GL.TEXTURE_2D, GL.TEXTURE_WRAP_S, GL.CLAMP_TO_EDGE);
      GL.texParameteri(GL.TEXTURE_2D, GL.TEXTURE_WRAP_T, GL.CLAMP_TO_EDGE);
      GL.texImage2D(GL.TEXTURE_2D, 0, GL.DEPTH_STENCIL, width, height, 0, GL.DEPTH_STENCIL, GL.depthTextureExtension.UNSIGNED_INT_24_8_WEBGL, null);
      GL.framebufferTexture2D(GL.FRAMEBUFFER, GL.DEPTH_STENCIL_ATTACHMENT, GL.TEXTURE_2D, this.depthTexture.id, 0);
    } else {
      this.depthRenderBuffer = GL.createRenderbuffer();
      GL.bindRenderbuffer(GL.RENDERBUFFER, this.depthRenderBuffer);
      GL.renderbufferStorage(GL.RENDERBUFFER, GL.DEPTH_COMPONENT16, width, height);
      GL.framebufferRenderbuffer(GL.FRAMEBUFFER, GL.DEPTH_ATTACHMENT, GL.RENDERBUFFER, this.depthRenderBuffer);
    }

    if (this.renderTexture) {
      this.renderTexture.destroy();
    }

    this.renderTexture = new GLX.texture.Data(GL, width, height);
    GL.bindTexture(GL.TEXTURE_2D, this.renderTexture.id);

    GL.texParameteri(GL.TEXTURE_2D, GL.TEXTURE_WRAP_S, GL.CLAMP_TO_EDGE); //necessary for NPOT textures
    GL.texParameteri(GL.TEXTURE_2D, GL.TEXTURE_WRAP_T, GL.CLAMP_TO_EDGE);
    GL.framebufferTexture2D(GL.FRAMEBUFFER, GL.COLOR_ATTACHMENT0, GL.TEXTURE_2D, this.renderTexture.id, 0);

    if (GL.checkFramebufferStatus(GL.FRAMEBUFFER) !== GL.FRAMEBUFFER_COMPLETE) {
      throw new Error('Combination of framebuffer attachments doesn\'t work');
    }

    GL.bindRenderbuffer(GL.RENDERBUFFER, null);
    GL.bindFramebuffer(GL.FRAMEBUFFER, null);
  }

  enable() {
    GL.bindFramebuffer(GL.FRAMEBUFFER, this.frameBuffer);

    if (!this.useDepthTexture) {
      GL.bindRenderbuffer(GL.RENDERBUFFER, this.depthRenderBuffer);
    }
  }

  disable() {
    GL.bindFramebuffer(GL.FRAMEBUFFER, null);
    if (!this.useDepthTexture) {
      GL.bindRenderbuffer(GL.RENDERBUFFER, null);
    }
  }

  getPixel(x, y) {
    if (x < 0 || y < 0 || x >= this.width || y >= this.height) {
      return;
    }
    const imageData = new Uint8Array(4);
    GL.readPixels(x, y, 1, 1, GL.RGBA, GL.UNSIGNED_BYTE, imageData);
    return imageData;
  }

  getData() {
    const imageData = new Uint8Array(this.width*this.height*4);
    GL.readPixels(0, 0, this.width, this.height, GL.RGBA, GL.UNSIGNED_BYTE, imageData);
    return imageData;
  }

  destroy() {
    if (this.renderTexture) {
      this.renderTexture.destroy();
    }
    
    if (this.depthTexture) {
      this.depthTexture.destroy();
    }
  }
};

GLX.Shader = class {

  constructor (config) {
    this.shaderName = config.shaderName;
    this.id = GL.createProgram();

    this.compile(GL.VERTEX_SHADER, config.vertexShader);
    this.compile(GL.FRAGMENT_SHADER, config.fragmentShader);

    GL.linkProgram(this.id);

    if (!GL.getProgramParameter(this.id, GL.LINK_STATUS)) {
      throw new Error(GL.getProgramParameter(this.id, GL.VALIDATE_STATUS) + '\n' + GL.getError());
    }

    GL.useProgram(this.id);

    this.attributes = {};
    (config.attributes || []).forEach(item => {
      this.locateAttribute(item);
    });

    this.uniforms = {};
    (config.uniforms || []).forEach(item => {
      this.locateUniform(item);
    });
  }

  locateAttribute (name) {
    const loc = GL.getAttribLocation(this.id, name);
    if (loc < 0) {
      throw new Error(`unable to locate attribute "${name}" in shader "${this.shaderName}"`);
    }
    this.attributes[name] = loc;
  }

  locateUniform (name) {
    const loc = GL.getUniformLocation(this.id, name);
    if (!loc) {
      throw new Error(`unable to locate uniform "${name}" in shader "${this.shaderName}"`);
    }
    this.uniforms[name] = loc;
  }

  compile (type, src) {
    const shader = GL.createShader(type);
    GL.shaderSource(shader, src);
    GL.compileShader(shader);

    if (!GL.getShaderParameter(shader, GL.COMPILE_STATUS)) {
      throw new Error(GL.getShaderInfoLog(shader));
    }

    GL.attachShader(this.id, shader);
  }

  enable () {
    GL.useProgram(this.id);
    for (let name in this.attributes) {
      GL.enableVertexAttribArray(this.attributes[name]);
    }
    return this;
  }

  disable () {
    if (this.attributes) {
      for (let name in this.attributes) {
        GL.disableVertexAttribArray(this.attributes[name]);
      }
    }
  }

  setBuffer (name, buffer) {
    if (this.attributes[name] === undefined) {
      throw new Error(`attempt to bind buffer to invalid attribute "${name}" in shader "${this.shaderName}"`);
    }
    buffer.enable();
    GL.vertexAttribPointer(this.attributes[name], buffer.itemSize, GL.FLOAT, false, 0, 0);
  }

  setParam (name, type, value) {
    if (this.uniforms[name] === undefined) {
      throw new Error(`attempt to bind to invalid uniform "${name}" in shader "${this.shaderName}"`);
    }
    GL['uniform' + type](this.uniforms[name], value);
  }

  setMatrix (name, type, value) {
    if (this.uniforms[name] === undefined) {
      throw new Error(`attempt to bind to invalid uniform "${name}" in shader "${this.shaderName}"`);
    }
    GL['uniformMatrix' + type](this.uniforms[name], false, value);
  }

  setTexture (uniform, textureUnit, glxTexture) {
    glxTexture.enable(textureUnit);
    this.setParam(uniform, '1i', textureUnit);
  }

  destroy () {
    this.disable();
    this.id = null;
  }
};

GLX.Matrix = function (data) {
  this.data = new Float32Array(data ? data : [
    1, 0, 0, 0,
    0, 1, 0, 0,
    0, 0, 1, 0,
    0, 0, 0, 1
  ]);
};

GLX.Matrix.identity = function () {
  return new GLX.Matrix([
    1, 0, 0, 0,
    0, 1, 0, 0,
    0, 0, 1, 0,
    0, 0, 0, 1
  ]);
};

GLX.Matrix.identity3 = function () {
  return new GLX.Matrix([
    1, 0, 0,
    0, 1, 0,
    0, 0, 1
  ]);
};

(function () {

  function rad (a) {
    return a * Math.PI / 180;
  }

  function multiply (res, a, b) {
    var
      a00 = a[0],
      a01 = a[1],
      a02 = a[2],
      a03 = a[3],
      a10 = a[4],
      a11 = a[5],
      a12 = a[6],
      a13 = a[7],
      a20 = a[8],
      a21 = a[9],
      a22 = a[10],
      a23 = a[11],
      a30 = a[12],
      a31 = a[13],
      a32 = a[14],
      a33 = a[15],

      b00 = b[0],
      b01 = b[1],
      b02 = b[2],
      b03 = b[3],
      b10 = b[4],
      b11 = b[5],
      b12 = b[6],
      b13 = b[7],
      b20 = b[8],
      b21 = b[9],
      b22 = b[10],
      b23 = b[11],
      b30 = b[12],
      b31 = b[13],
      b32 = b[14],
      b33 = b[15];

    res[0] = a00 * b00 + a01 * b10 + a02 * b20 + a03 * b30;
    res[1] = a00 * b01 + a01 * b11 + a02 * b21 + a03 * b31;
    res[2] = a00 * b02 + a01 * b12 + a02 * b22 + a03 * b32;
    res[3] = a00 * b03 + a01 * b13 + a02 * b23 + a03 * b33;

    res[4] = a10 * b00 + a11 * b10 + a12 * b20 + a13 * b30;
    res[5] = a10 * b01 + a11 * b11 + a12 * b21 + a13 * b31;
    res[6] = a10 * b02 + a11 * b12 + a12 * b22 + a13 * b32;
    res[7] = a10 * b03 + a11 * b13 + a12 * b23 + a13 * b33;

    res[8] = a20 * b00 + a21 * b10 + a22 * b20 + a23 * b30;
    res[9] = a20 * b01 + a21 * b11 + a22 * b21 + a23 * b31;
    res[10] = a20 * b02 + a21 * b12 + a22 * b22 + a23 * b32;
    res[11] = a20 * b03 + a21 * b13 + a22 * b23 + a23 * b33;

    res[12] = a30 * b00 + a31 * b10 + a32 * b20 + a33 * b30;
    res[13] = a30 * b01 + a31 * b11 + a32 * b21 + a33 * b31;
    res[14] = a30 * b02 + a31 * b12 + a32 * b22 + a33 * b32;
    res[15] = a30 * b03 + a31 * b13 + a32 * b23 + a33 * b33;
  }

  GLX.Matrix.prototype = {

    multiply: function (m) {
      multiply(this.data, this.data, m.data);
      return this;
    },

    translate: function (x, y, z) {
      multiply(this.data, this.data, [
        1, 0, 0, 0,
        0, 1, 0, 0,
        0, 0, 1, 0,
        x, y, z, 1
      ]);
      return this;
    },

    rotateX: function (angle) {
      var a = rad(angle), c = Math.cos(a), s = Math.sin(a);
      multiply(this.data, this.data, [
        1, 0, 0, 0,
        0, c, s, 0,
        0, -s, c, 0,
        0, 0, 0, 1
      ]);
      return this;
    },

    rotateY: function (angle) {
      var a = rad(angle), c = Math.cos(a), s = Math.sin(a);
      multiply(this.data, this.data, [
        c, 0, -s, 0,
        0, 1, 0, 0,
        s, 0, c, 0,
        0, 0, 0, 1
      ]);
      return this;
    },

    rotateZ: function (angle) {
      var a = rad(angle), c = Math.cos(a), s = Math.sin(a);
      multiply(this.data, this.data, [
        c, -s, 0, 0,
        s, c, 0, 0,
        0, 0, 1, 0,
        0, 0, 0, 1
      ]);
      return this;
    },

    scale: function (x, y, z) {
      multiply(this.data, this.data, [
        x, 0, 0, 0,
        0, y, 0, 0,
        0, 0, z, 0,
        0, 0, 0, 1
      ]);
      return this;
    }
  };

  GLX.Matrix.multiply = function (a, b) {
    var res = new Float32Array(16);
    multiply(res, a.data, b.data);
    return res;
  };

  // returns a perspective projection matrix with a field-of-view of 'fov' 
  // degrees, an width/height aspect ratio of 'aspect', the near plane at 'near'
  // and the far plane at 'far'
  GLX.Matrix.Perspective = function (fov, aspect, near, far) {
    var f = 1 / Math.tan(fov * (Math.PI / 180) / 2),
      nf = 1 / (near - far);

    return new GLX.Matrix([
      f / aspect, 0, 0, 0,
      0, f, 0, 0,
      0, 0, (far + near) * nf, -1,
      0, 0, (2 * far * near) * nf, 0]);
  };

  //returns a perspective projection matrix with the near plane at 'near',
  //the far plane at 'far' and the view rectangle on the near plane bounded
  //by 'left', 'right', 'top', 'bottom'
  GLX.Matrix.Frustum = function (left, right, top, bottom, near, far) {
    var rl = 1 / (right - left),
      tb = 1 / (top - bottom),
      nf = 1 / (near - far);

    return new GLX.Matrix([
      (near * 2) * rl, 0, 0, 0,
      0, (near * 2) * tb, 0, 0,
      (right + left) * rl, (top + bottom) * tb, (far + near) * nf, -1,
      0, 0, (far * near * 2) * nf, 0]);
  };

  GLX.Matrix.OffCenterProjection = function (screenBottomLeft, screenTopLeft, screenBottomRight, eye, near, far) {
    var vRight = norm3(sub3(screenBottomRight, screenBottomLeft));
    var vUp = norm3(sub3(screenTopLeft, screenBottomLeft));
    var vNormal = normal(screenBottomLeft, screenTopLeft, screenBottomRight);

    var eyeToScreenBottomLeft = sub3(screenBottomLeft, eye);
    var eyeToScreenTopLeft = sub3(screenTopLeft, eye);
    var eyeToScreenBottomRight = sub3(screenBottomRight, eye);

    var d = -dot3(eyeToScreenBottomLeft, vNormal);

    var l = dot3(vRight, eyeToScreenBottomLeft) * near / d;
    var r = dot3(vRight, eyeToScreenBottomRight) * near / d;
    var b = dot3(vUp, eyeToScreenBottomLeft) * near / d;
    var t = dot3(vUp, eyeToScreenTopLeft) * near / d;

    return GLX.Matrix.Frustum(l, r, t, b, near, far);
  };

  // based on http://www.songho.ca/opengl/gl_projectionmatrix.html
  GLX.Matrix.Ortho = function (left, right, top, bottom, near, far) {
    return new GLX.Matrix([
      2 / (right - left), 0, 0, 0,
      0, 2 / (top - bottom), 0, 0,
      0, 0, -2 / (far - near), 0,
      -(right + left) / (right - left), -(top + bottom) / (top - bottom), -(far + near) / (far - near), 1
    ]);
  };

  GLX.Matrix.invert3 = function (a) {
    var
      a00 = a[0], a01 = a[1], a02 = a[2],
      a04 = a[4], a05 = a[5], a06 = a[6],
      a08 = a[8], a09 = a[9], a10 = a[10],

      l = a10 * a05 - a06 * a09,
      o = -a10 * a04 + a06 * a08,
      m = a09 * a04 - a05 * a08,

      det = a00 * l + a01 * o + a02 * m;

    if (!det) {
      return null;
    }

    det = 1.0 / det;

    return [
      l * det,
      (-a10 * a01 + a02 * a09) * det,
      (a06 * a01 - a02 * a05) * det,
      o * det,
      (a10 * a00 - a02 * a08) * det,
      (-a06 * a00 + a02 * a04) * det,
      m * det,
      (-a09 * a00 + a01 * a08) * det,
      (a05 * a00 - a01 * a04) * det
    ];
  };

  GLX.Matrix.transpose3 = function (a) {
    return new Float32Array([
      a[0], a[3], a[6],
      a[1], a[4], a[7],
      a[2], a[5], a[8]
    ]);
  };

  GLX.Matrix.transpose = function (a) {
    return new Float32Array([
      a[0], a[4], a[8], a[12],
      a[1], a[5], a[9], a[13],
      a[2], a[6], a[10], a[14],
      a[3], a[7], a[11], a[15]
    ]);
  };

  GLX.Matrix.transform = function (m) {
    const X = m[12], Y = m[13], Z = m[14], W = m[15];
    return {
      x: (X / W + 1) / 2,
      y: (Y / W + 1) / 2,
      z: (Z / W + 1) / 2
    };
  };

  GLX.Matrix.invert = function (a) {
    const
      res = new Float32Array(16),

      a00 = a[0], a01 = a[1], a02 = a[2], a03 = a[3],
      a10 = a[4], a11 = a[5], a12 = a[6], a13 = a[7],
      a20 = a[8], a21 = a[9], a22 = a[10], a23 = a[11],
      a30 = a[12], a31 = a[13], a32 = a[14], a33 = a[15],

      b00 = a00 * a11 - a01 * a10,
      b01 = a00 * a12 - a02 * a10,
      b02 = a00 * a13 - a03 * a10,
      b03 = a01 * a12 - a02 * a11,
      b04 = a01 * a13 - a03 * a11,
      b05 = a02 * a13 - a03 * a12,
      b06 = a20 * a31 - a21 * a30,
      b07 = a20 * a32 - a22 * a30,
      b08 = a20 * a33 - a23 * a30,
      b09 = a21 * a32 - a22 * a31,
      b10 = a21 * a33 - a23 * a31,
      b11 = a22 * a33 - a23 * a32;

    // Calculate the determinant
    let det = b00 * b11 - b01 * b10 + b02 * b09 + b03 * b08 - b04 * b07 + b05 * b06;

    if (!det) {
      return;
    }

    det = 1 / det;

    res[0] = (a11 * b11 - a12 * b10 + a13 * b09) * det;
    res[1] = (a02 * b10 - a01 * b11 - a03 * b09) * det;
    res[2] = (a31 * b05 - a32 * b04 + a33 * b03) * det;
    res[3] = (a22 * b04 - a21 * b05 - a23 * b03) * det;

    res[4] = (a12 * b08 - a10 * b11 - a13 * b07) * det;
    res[5] = (a00 * b11 - a02 * b08 + a03 * b07) * det;
    res[6] = (a32 * b02 - a30 * b05 - a33 * b01) * det;
    res[7] = (a20 * b05 - a22 * b02 + a23 * b01) * det;

    res[8] = (a10 * b10 - a11 * b08 + a13 * b06) * det;
    res[9] = (a01 * b08 - a00 * b10 - a03 * b06) * det;
    res[10] = (a30 * b04 - a31 * b02 + a33 * b00) * det;
    res[11] = (a21 * b02 - a20 * b04 - a23 * b00) * det;

    res[12] = (a11 * b07 - a10 * b09 - a12 * b06) * det;
    res[13] = (a00 * b09 - a01 * b07 + a02 * b06) * det;
    res[14] = (a31 * b01 - a30 * b03 - a32 * b00) * det;
    res[15] = (a20 * b03 - a21 * b01 + a22 * b00) * det;

    return res;
  };

}());


GLX.texture = {};


GLX.texture.Image = class {
  constructor () {
    this.id = GL.createTexture();
    GL.bindTexture(GL.TEXTURE_2D, this.id);

//GL.texParameteri(GL.TEXTURE_2D, GL.TEXTURE_WRAP_S, GL.CLAMP_TO_EDGE);
//GL.texParameteri(GL.TEXTURE_2D, GL.TEXTURE_WRAP_T, GL.CLAMP_TO_EDGE);

    GL.bindTexture(GL.TEXTURE_2D, null);
  }

  clamp (image, maxSize) {
    if (image.width <= maxSize && image.height <= maxSize) {
      return image;
    }

    let w = maxSize, h = maxSize;
    const ratio = image.width/image.height;
    // TODO: if other dimension doesn't fit to POT after resize, there is still trouble
    if (ratio < 1) {
      w = Math.round(h*ratio);
    } else {
      h = Math.round(w/ratio);
    }

    const canvas = document.createElement('CANVAS');
    canvas.width  = w;
    canvas.height = h;

    const context = canvas.getContext('2d');
    context.drawImage(image, 0, 0, canvas.width, canvas.height);
    return canvas;
  }

  load (url, callback) {
    const image = new Image();
    image.crossOrigin = '*';
    image.onload = img => {
      this.set(image);
      if (callback) {
        callback(image);
      }
    };
    image.onerror = img => {
      if (callback) {
        callback();
      }
    };
    image.src = url;
    return this;
  }

  color (color) {
    GL.bindTexture(GL.TEXTURE_2D, this.id);
    GL.texParameteri(GL.TEXTURE_2D, GL.TEXTURE_MIN_FILTER, GL.LINEAR);
    GL.texParameteri(GL.TEXTURE_2D, GL.TEXTURE_MAG_FILTER, GL.LINEAR);
    GL.texImage2D(GL.TEXTURE_2D, 0, GL.RGBA, 1, 1, 0, GL.RGBA, GL.UNSIGNED_BYTE, new Uint8Array([color[0]*255, color[1]*255, color[2]*255, (color[3] === undefined ? 1 : color[3])*255]));
    GL.bindTexture(GL.TEXTURE_2D, null);
    return this;
  }

  set (image) {
    if (!this.id) {
      // texture has been destroyed
      return;
    }

    image = this.clamp(image, GL.getParameter(GL.MAX_TEXTURE_SIZE));

    GL.bindTexture(GL.TEXTURE_2D, this.id);
    GL.texParameteri(GL.TEXTURE_2D, GL.TEXTURE_MIN_FILTER, GL.LINEAR_MIPMAP_NEAREST);
    GL.texParameteri(GL.TEXTURE_2D, GL.TEXTURE_MAG_FILTER, GL.LINEAR);

    GL.texImage2D(GL.TEXTURE_2D, 0, GL.RGBA, GL.RGBA, GL.UNSIGNED_BYTE, image);
    GL.generateMipmap(GL.TEXTURE_2D);

    if (GL.anisotropyExtension) { // TODO OSMB4 use this dynamically
      GL.texParameterf(GL.TEXTURE_2D, GL.anisotropyExtension.TEXTURE_MAX_ANISOTROPY_EXT, GL.anisotropyExtension.maxAnisotropyLevel);
    }

    GL.bindTexture(GL.TEXTURE_2D, null);
    return this;
  }

  enable (index) {
    if (!this.id) {
      return;
    }
    GL.activeTexture(GL.TEXTURE0 + (index || 0));
    GL.bindTexture(GL.TEXTURE_2D, this.id);
    return this;
  }

  destroy () {
    GL.bindTexture(GL.TEXTURE_2D, null);
    GL.deleteTexture(this.id);
    this.id = null;
  }
};


GLX.texture.Data = class {

  constructor(GL, width, height, data) {
    this.id = GL.createTexture();
    GL.bindTexture(GL.TEXTURE_2D, this.id);

    GL.texParameteri(GL.TEXTURE_2D, GL.TEXTURE_MIN_FILTER, GL.NEAREST);
    GL.texParameteri(GL.TEXTURE_2D, GL.TEXTURE_MAG_FILTER, GL.NEAREST);

    let bytes = null;
    if (data) {
      const length = width*height*4;
      bytes = new Uint8Array(length);
      bytes.set(data.subarray(0, length));
    }

    GL.texImage2D(GL.TEXTURE_2D, 0, GL.RGBA, width, height, 0, GL.RGBA, GL.UNSIGNED_BYTE, bytes);
    GL.bindTexture(GL.TEXTURE_2D, null);

    this.GL = GL;
  }

  enable(index) {
    this.GL.activeTexture(this.GL.TEXTURE0 + (index || 0));
    this.GL.bindTexture(this.GL.TEXTURE_2D, this.id);
    return this;
  }

  destroy() {
    this.GL.bindTexture(this.GL.TEXTURE_2D, null);
    this.GL.deleteTexture(this.id);
    this.id = null;
  }
};


class Collection {

  constructor() {
    this.items = [];
  }

  add (item) {
    this.items.push(item);
  }

  remove (item) {
    this.items = this.items.filter(i => (i !== item));
  }

  forEach (fn) {
    this.items.forEach(fn);
  }

  destroy () {
    this.forEach(item => item.destroy());
    this.items = [];
  }
}

class Marker {

  constructor (options = {}) {

    this.offsetX = options.offsetX || 0;
    this.offsetY = options.offsetY || 0;
    this.position = options.position || { latitude: 0, longitude: 0 };
    this.elevation = options.elevation || 30;
    this.source = options.source;
    this.isReady = false;
    this.size = options.size || 1;

    APP.markers.add(this);
    this.load();
  }

  load () {

    const texCoords = [
      0, 0,
      1, 0,
      0, 1,
      1, 1,
      0, 1,
      1, 0
    ];

    const
      w2 = this.size / 2,
      h2 = this.size / 2;

    const vertices = [
      -w2, -h2, 0,
      w2, -h2, 0,
      -w2, h2, 0,
      w2, h2, 0,
      -w2, h2, 0,
      w2, -h2, 0
    ];

    this.texCoordBuffer = new GLX.Buffer(2, new Float32Array(texCoords));
    this.vertexBuffer = new GLX.Buffer(3, new Float32Array(vertices));

    if(this.source){
      this.texture = new GLX.texture.Image().load(this.source, image => {

        if (image) {

          /* Whole texture will be mapped to fit the tile exactly. So
           * don't attempt to wrap around the texture coordinates. */

          GL.pixelStorei(GL.UNPACK_PREMULTIPLY_ALPHA_WEBGL, true);
          GL.bindTexture(GL.TEXTURE_2D, this.texture.id);
          GL.texParameteri(GL.TEXTURE_2D, GL.TEXTURE_WRAP_S, GL.CLAMP_TO_EDGE);
          GL.texParameteri(GL.TEXTURE_2D, GL.TEXTURE_WRAP_T, GL.CLAMP_TO_EDGE);
          // fits texture to vertex
          GL.texParameteri(GL.TEXTURE_2D, GL.TEXTURE_MIN_FILTER, GL.LINEAR);

          this.isReady = true;
        }
        else {
          console.log("can not read marker source");
          this.loadStandardIcon();
        }
      });
    } else {
      console.log("no marker source");
      this.loadStandardIcon();
    }
  }


  loadStandardIcon(){
    this.texture = new GLX.texture.Image().load(MARKER_TEXTURE, image => {

      if (image) {

        /* Whole texture will be mapped to fit the tile exactly. So
         * don't attempt to wrap around the texture coordinates. */

        GL.pixelStorei(GL.UNPACK_PREMULTIPLY_ALPHA_WEBGL, true);
        GL.bindTexture(GL.TEXTURE_2D, this.texture.id);
        GL.texParameteri(GL.TEXTURE_2D, GL.TEXTURE_WRAP_S, GL.CLAMP_TO_EDGE);
        GL.texParameteri(GL.TEXTURE_2D, GL.TEXTURE_WRAP_T, GL.CLAMP_TO_EDGE);
        // fits texture to vertex
        GL.texParameteri(GL.TEXTURE_2D, GL.TEXTURE_MIN_FILTER, GL.LINEAR);

        this.isReady = true;
        this.source = 'Standard Icon';
      }
    });

  }


  destroy () {
    APP.markers.remove(this);

    this.texCoordBuffer.destroy();
    this.vertexBuffer.destroy();

    if (this.isReady) {
      this.texture.destroy();
    }
  }
}

class WorkerPool {

  constructor (path, num) {
    this.items = [];
    for (let i = 0; i < num; i++) {
      this.items[i] = new WorkerWrapper(path);
    }
  }

  get (callback) {
    // console.log(this.items.map(item => {
    //   return item.busy ? '▪' : '▫';
    // }).join(''));

    for (let i = 0; i < this.items.length; i++) {
      if (!this.items[i].busy) {
        this.items[i].busy = true;
        callback(this.items[i]);
        return;
      }
    }

    setTimeout(() => {
      this.get(callback);
    }, 50);
  }

  destroy () {
    this.items.forEach(item => item.destroy());
    this.items = [];
  }
}



class WorkerWrapper {

  constructor (path) {
    this.busy = false;
    this.thread = new Worker(path);
  }

  postMessage (message) {
    this.thread.postMessage(message);
  }

  onMessage (callback) {
    this.thread.onmessage = function (e) {
      callback(e.data);
    };
  }

  free () {
    this.thread.onmessage = function (e) {};
    this.busy = false;
  }

  destroy () {
    this.thread.close();
  }
}

/*
 * NOTE: OSMBuildings cannot use a single global world coordinate system.
 *       The numerical accuracy required for such a system would be about
 *       32bits to represent world-wide geometry faithfully within a few
 *       centimeters of accuracy. Most computations in OSMBuildings, however,
 *       are performed on a GPU where only IEEE floats with 23bits of accuracy
 *       (plus 8 bits of range) are available.
 *       Instead, OSMBuildings' coordinate system has a reference point
 *       (APP.position) at the viewport center, and all world positions are
 *       expressed as distances in meters from that reference point. The
 *       reference point itself shifts with map panning so that all world
 *       positions relevant to the part of the world curently rendered on-screen
 *       can accurately be represented within the limited accuracy of IEEE floats.
 */

let APP, GL;

/**
 * User defined function that will be called when an event is fired
 * @callback eventCallback
 * @param {String} type Event type
 * @param {any} [payload] Payload of any type
 */

/**
 * User defined function that will be called on each feature, for modification before rendering
 * @callback selectorCallback
 * @param {String} id The feature's id
 * @param {Object} feature The feature
 */

/**
 * @class OSMBuildings
 */



/**
 * Fired when a 3d object has been loaded
 * @event OSMBuildings#loadfeature
 */

/**
 * Fired when map has been zoomed
 * @event OSMBuildings#zoom
 */

/**
 * Fired when map view has been rotated
 * @event OSMBuildings#rotate
 */

/**
 * Fired when map view has been tilted
 * @event OSMBuildings#tilt
 */

/**
 * Fired when map view has been changed, i.e. zoom, pan, tilt, rotation
 * @event OSMBuildings#change
 */

/**
 * Fired when map container has been resized
 * @event OSMBuildings#resize
 */

/**
 * Fired when map container has been double clicked/tapped
 * @event OSMBuildings#doubleclick
 */

/**
 * Fired when map container has been clicked/tapped
 * @event OSMBuildings#pointerdown
 */

/**
 * Fired when mouse/finger has been moved
 * @event OSMBuildings#pointermove
 */

/**
 * Fired when mouse button/finger been lifted
 * @event OSMBuildings#pointerup
 */

/**
 * Fired when gesture has been performed on the map
 * @event OSMBuildings#gesture
 */

/**
 * Fired when data loading starts
 * @event OSMBuildings#busy
 */

/**
 * Fired when data loading ends
 * @event OSMBuildings#idle
 */

class OSMBuildings {
  /**
   * @constructor
   * @param {Object} [options] OSMBuildings options
   * @param {HTMLElement|String} [options.container] A DOM Element or its id to append the viewer to
   * @param {Number} [options.minZoom=14.5] Global minimum allowed zoom
   * @param {Number} [options.maxZoom=20] Global maximum allowed zoom
   * @param {Object} [options.bounds] A bounding box to restrict the map to
   * @param {Boolean} [options.state=false] Store the map state in the URL
   * @param {Boolean} [options.disabled=false] Disable user input
   * @param {String} [options.attribution] An attribution string
   * @param {Number} [options.zoom=minZoom..maxZoom] Initial zoom, default is middle between global minZoom and maxZoom
   * @param {Number} [options.rotation=0] Initial rotation
   * @param {Number} [options.tilt=0] Initial tilt
   * @param {Object} [options.position] Initial position
   * @param {Number} [options.position.latitude=52.520000] position latitude
   * @param {Number} [options.position.longitude=13.410000] Position longitude
   * @deprecated {String} [options.baseURL='.'] For locating assets. This is relative to calling html page
   * @deprecated {Boolean} [options.showBackfaces=false] Render front and backsides of polygons. false increases performance, true might be needed for bad geometries
   * @deprecated {String} [options.fogColor='#e8e0d8'] Color to be used for sky gradients and distance fog
   * @deprecated {String} [options.highlightColor='#f08000'] Default color for highlighting features
   * @deprecated {Array} [options.effects=[]] Which effects to enable. The only effect at the moment is 'shadows'
   * @param {String} [options.backgroundColor='#efe8e0'] Overall background color
   * @param {Boolean} [options.fastMode=false] Enables faster rendering at cost of image quality.
   * @param {Object} [options.style] Sets the default building style
   * @param {String} [options.style.color='rgb(220, 210, 200)'] Sets the default building color
   */
  constructor (options = {}) {
    APP = this; // refers to current instance. Should make other globals obsolete.

    if (options.style) {
      if (options.style.color || options.style.wallColor) {
        DEFAULT_COLOR = Qolor.parse(options.style.color || options.style.wallColor).toArray();
      }
    }

    render.backgroundColor = Qolor.parse(options.backgroundColor || BACKGROUND_COLOR).toArray();
    render.fogColor = Qolor.parse(options.fogColor || FOG_COLOR).toArray();

    this.attribution = options.attribution || OSMBuildings.ATTRIBUTION;

    this.minZoom = Math.max(parseFloat(options.minZoom || MIN_ZOOM), MIN_ZOOM);
    this.maxZoom = Math.min(parseFloat(options.maxZoom || MAX_ZOOM), MAX_ZOOM);
    if (this.maxZoom < this.minZoom) {
      this.minZoom = MIN_ZOOM;
      this.maxZoom = MAX_ZOOM;
    }

    this.bounds = options.bounds;

    this.position = options.position || { latitude: 52.520000, longitude: 13.410000 };
    this.zoom = options.zoom || (this.minZoom + (this.maxZoom - this.minZoom) / 2);
    this.rotation = options.rotation || 0;
    this.tilt = options.tilt || 0;

    if (options.disabled) {
      this.setDisabled(true);
    }

    const numProc = Math.min(window.navigator.hardwareConcurrency, 4);

    if (typeof workerStr === 'string') {
      const blob = new Blob([workerStr], { type: 'application/javascript' });
      this.workers = new WorkerPool(URL.createObjectURL(blob), numProc * 4);
    }

    //*** create container ********************************

    let container = options.container;
    if (typeof container === 'string') {
      container = document.getElementById(options.container);
    }

    this.container = document.createElement('DIV');
    this.container.className = 'osmb';
    if (container.offsetHeight === 0) {
      container.style.height = '100%';
      console.warn('Container height should be set. Now defaults to 100%.');
    }
    container.appendChild(this.container);

    //*** create canvas ***********************************

    this.canvas = document.createElement('CANVAS');
    this.canvas.className = 'osmb-viewport';

    // const devicePixelRatio = window.devicePixelRatio || 1;
    const devicePixelRatio = 1; // this also affects building height and zoom

    this.canvas.width = this.width = container.offsetWidth*devicePixelRatio;
    this.canvas.height = this.height = container.offsetHeight*devicePixelRatio;
    this.container.appendChild(this.canvas);

    this.glx = new GLX(this.canvas, options.fastMode);
    GL = this.glx.GL;

    this.features = new FeatureCollection();
    this.markers = new Collection();

    this.events = new Events(this.canvas);

    this._getStateFromUrl();
    if (options.state) {
      this._setStateToUrl();
      this.events.on('change', e => {
        this._setStateToUrl();
      });
    }

    this._attribution = document.createElement('DIV');
    this._attribution.className = 'osmb-attribution';
    this.container.appendChild(this._attribution);
    this._updateAttribution();

    this.setDate(new Date());
    render.start();

    this.emit('load', this);
  }

  /**
   * @deprecated
   */
  appendTo () {}

    /**
   * Adds an event listener
   * @param {String} type Event type to listen for
   * @param {eventCallback} fn Callback function
   */
  on (type, fn) {
    this.events.on(type, fn);
  }

  /**
   * Removes event listeners
   * @param {String} type Event type to listen for
   * @param {eventCallback} [fn] If callback is given, only remove that particular listener
   */
  off (type, fn) {
    this.events.off(type, fn);
  }

  /**
   * Trigger a specific event
   * @param {String} event Event type to listen for
   * @param {any} [payload] Any kind of payload
   */
  emit (type, payload) {
    this.events.emit(type, payload);
  }

  /**
   * Set date for shadow calculations
   * @param {Date} date
   */
  setDate (date) {
    Sun.setDate(typeof date === 'string' ? new Date(date) : date);
  }

  /**
   * Get screen position from a 3d point
   * @param {Number} latitude Latitude of the point
   * @param {Number} longitude Longitude of the point
   * @param {Number} elevation Elevation of the point
   * @return {Object} Screen position in pixels { x, y }
   */
  project (latitude, longitude, elevation) {
    const
      metersPerDegreeLongitude = METERS_PER_DEGREE_LATITUDE *  Math.cos(this.position.latitude / 180 * Math.PI),
      worldPos = [(longitude - this.position.longitude) * metersPerDegreeLongitude, -(latitude - this.position.latitude) * METERS_PER_DEGREE_LATITUDE, elevation];

    // takes current cam pos into account.
    let posNDC = transformVec3(render.viewProjMatrix.data, worldPos);
    posNDC = mul3scalar(add3(posNDC, [1, 1, 1]), 1 / 2); // from [-1..1] to [0..1]

    return {
      x: posNDC[0] * this.width,
      y: (1 - posNDC[1]) * this.height,
      z: posNDC[2]
    };
  }

  /**
   * Turns a screen point (x, y) into a geographic position (latitude/longitude/elevation=0).
   * Returns 'undefined' if point would be invisible or lies above horizon.
   * @param {Number} x X position on screen
   * @param {Number} y Y position om screen
   * @return {Object} Geographic position { latitude, longitude }
   */
  unproject (x, y) {
    const inverseViewMatrix = GLX.Matrix.invert(render.viewProjMatrix.data);
    // convert window/viewport coordinates to NDC [0..1]. Note that the browser
    // screen coordinates are y-down, while the WebGL NDC coordinates are y-up,
    // so we have to invert the y value here

    let posNDC = [x / this.width, 1 - y / this.height];
    posNDC = add2(mul2scalar(posNDC, 2.0), [-1, -1, -1]); // [0..1] to [-1..1];

    const worldPos = getIntersectionWithXYPlane(posNDC[0], posNDC[1], inverseViewMatrix);
    if (worldPos === undefined) {
      return;
    }

    const metersPerDegreeLongitude = METERS_PER_DEGREE_LATITUDE * Math.cos(this.position.latitude / 180 * Math.PI);

    return {
      latitude: this.position.latitude - worldPos[1] / METERS_PER_DEGREE_LATITUDE,
      longitude: this.position.longitude + worldPos[0] / metersPerDegreeLongitude
    };
  }

  /**
   * Removes an object from the map.
   */
  remove (item) {
    if (item.destroy) {
      item.destroy();
    }
  }

  /**
   * Adds an 3D object (OBJ format) file to the map.
   * <em>Important</em>: objects with exactly the same url are cached and only loaded once.
   * @param {String} url URL of the OBJ file
   * @param {Object} position Where to render the object
   * @param {Number} position.latitude Position latitude for the object
   * @param {Number} position.longitude Position longitude for the object
   * @param {Object} [options] Options for rendering the object
   * @param {Number} [options.scale=1] Scale the model by this value before rendering
   * @param {Number} [options.rotation=0] Rotate the model by this much before rendering
   * @param {Number} [options.elevation=<ground height>] The height above ground to place the model at
   * @param {String} [options.id] An identifier for the object. This is used for getting info about the object later
   * @param {String} [options.color] A color to apply to the model
   * @return {Object} The added object
   */
  addOBJ (url, position, options = {}) {
    options.position = position;
    return new Feature('OBJ', url, options);
  }

  /**
   * Adds a GeoJSON object to the map.
   * @param {String} url URL of the GeoJSON file or a JavaScript Object representing a GeoJSON FeatureCollection
   * @param {Object} [options] Options to apply to the GeoJSON being rendered
   * @param {Number} [options.scale=1] Scale the model by this value before rendering
   * @param {Number} [options.rotation=0] Rotate the model by this much before rendering
   * @param {Number} [options.elevation=<ground height>] The height above ground to place the model at
   * @param {String} [options.id] An identifier for the object. This is used for getting info about the object later
   * @param {String} [options.color] A color to apply to the model
   * @param {Number} [options.minZoom=14.5] Minimum zoom level to show this feature, defaults to and limited by global minZoom
   * @param {Number} [options.maxZoom=maxZoom] Maximum zoom level to show this feature, defaults to and limited by global maxZoom
   * @deprecated {Boolean} [options.fadeIn=true] Fade GeoJSON features; if `false`, then display immediately
   * @return {Object} The added object
   */
  addGeoJSON (url, options) {
    return new Feature('GeoJSON', url, options);
  }

  // TODO: allow more data layers later on
  /**
   * Adds a GeoJSON tile layer to the map.
   * This is for continuous building coverage.
   * @param {String} [url=https://{s}.data.osmbuildings.org/0.2/{k}/tile/{z}/{x}/{y}.json] url The URL of the GeoJSON tile server
   * @param {Object} [options]
   * @param {Number} [options.fixedZoom=15] Tiles are fetched for this zoom level only. Other zoom levels are scaled up/down to this value
   * @param {Number} [options.minZoom=14.5] Minimum zoom level to show features from this layer. Defaults to and limited by global minZoom.
   * @param {Number} [options.maxZoom=maxZoom] Maximum zoom level to show features from this layer. Defaults to and limited by global maxZoom.
   * @return {Object} The added layer object
   */
  addGeoJSONTiles (url, options = {}) {
    options.fixedZoom = options.fixedZoom || 15;
    this.dataGrid = new Grid(url, GeoJSONTile, options, 2);
    return this.dataGrid;
  }

  /**
   * Adds a 2d base map source. This renders below the buildings.
   * @param {String} url The URL of the map server. This could be from Mapbox or other tile servers
   * @return {Object} The added layer object
   */
  addMapTiles (url) {
    this.basemapGrid = new Grid(url, BitmapTile, {}, 4);
    return this.basemapGrid;
  }

  /**
   * This replaces any previous highlighting.
   * @example
   * osmb.highlight(building => {
   *   if (building.properties.height > 200) return 'red';
   *   if (building.properties.height > 100) return 'green';
   * });
   * @param callback {Function} A function that does user defined filtering and highlights by returning a color
   */
  highlight (tintCallback) {
    this.features.setTintCallback(tintCallback);
  }

  /**
   * This replaces any previous show/hide rule.
   * @example
   * osmb.hide(building => {
   *   if (building.properties.height < 100) return true;
   *   if (building.id == "B05417") return true;
   * });
   * @param callback {Function} A function that does user defined filtering and hides if return value is true
   */
  hide (zScaleCallback) {
    this.features.setZScaleCallback(zScaleCallback);
  }

  /**
   * @deprecated
   */
  show () {}

  /**
   * @deprecated
   */
  getTarget () {}

  /**
   * @deprecated
   */
  screenshot () {}

  /**
   * @private
   */
  _updateAttribution () {
    const attribution = [];
    if (this.attribution) {
      attribution.push(this.attribution);
    }
    // this.layers.forEach(layer => {
    //   if (layer.attribution) {
    //     attribution.push(layer.attribution);
    //   }
    // });
    this._attribution.innerHTML = attribution.join(' · ');
  }

  /**
   * @private
   */
  _getStateFromUrl () {
    const
      query = location.search,
      state = {};

    if (query) {
      query.substring(1).replace(/(?:^|&)([^&=]*)=?([^&]*)/g, ($0, $1, $2) => {
        if ($1) {
          state[$1] = $2;
        }
      });
    }

    this.setPosition((state.lat !== undefined && state.lon !== undefined) ? {
      latitude: state.lat,
      longitude: state.lon
    } : this.position);

    this.setZoom(state.zoom !== undefined ? state.zoom : this.zoom);
    this.setRotation(state.rotation !== undefined ? state.rotation : this.rotation);
    this.setTilt(state.tilt !== undefined ? state.tilt : this.tilt);
  }

  /**
   * @private
   */
  _setStateToUrl () {
    if (!history.replaceState || this.stateDebounce) {
      return;
    }

    this.stateDebounce = setTimeout(() => {
      this.stateDebounce = null;
      const params = [];
      params.push('lat=' + this.position.latitude.toFixed(6));
      params.push('lon=' + this.position.longitude.toFixed(6));
      params.push('zoom=' + this.zoom.toFixed(1));
      params.push('tilt=' + this.tilt.toFixed(1));
      params.push('rotation=' + this.rotation.toFixed(1));
      history.replaceState({}, '', '?' + params.join('&'));
    }, 1000);
  }

  setDisabled (flag) {
    this.events.isDisabled = !!flag;
  }

  isDisabled () {
    return !!this.events.isDisabled;
  }

  /**
   * Returns geographical bounds of the current view
   * - since the bounds are always axis-aligned they will contain areas that are
   *   not currently visible if the current view is not also axis-aligned.
   * - The bounds only contain the map area that OSMBuildings considers for rendering.
   *   OSMBuildings has a rendering distance of about 3.5km, so the bounds will
   *   never extend beyond that, even if the horizon is visible (in which case the
   *   bounds would mathematically be infinite).
   * - the bounds only consider ground level. For example, buildings whose top
   *   is seen at the lower edge of the screen, but whose footprint is outside
   * - The bounds only consider ground level. For example, buildings whose top
   *   is seen at the lower edge of the screen, but whose footprint is outside
   *   of the current view below the lower edge do not contribute to the bounds.
   *   so their top may be visible and they may still be out of bounds.
   * @return {Array} Bounding coordinates in unspecific order [{ latitude, longitude }, ...]
   */
  getBounds () {
    const viewQuad = render.getViewQuad();
    return viewQuad.map(point => getPositionFromLocal(point));
  }

  /**
   * Set zoom level
   * @emits OSMBuildings#zoom
   * @emits OSMBuildings#change
   * @param {Number} zoom The new zoom level
   */
  setZoom (zoom, e) {
    zoom = parseFloat(zoom);

    zoom = Math.max(zoom, this.minZoom);
    zoom = Math.min(zoom, this.maxZoom);

    if (this.zoom !== zoom) {
      this.zoom = zoom;

      /* if a screen position was given for which the geographic position displayed
       * should not change under the zoom */
      if (e) {
        // FIXME: add code; this needs to take the current camera (rotation and
        //        perspective) into account
        // NOTE:  the old code (comment out below) only works for north-up
        //        non-perspective views
        /*
         const dx = this.container.offsetWidth/2  - e.clientX;
         const dy = this.container.offsetHeight/2 - e.clientY;
         this.center.x -= dx;
         this.center.y -= dy;
         this.center.x *= ratio;
         this.center.y *= ratio;
         this.center.x += dx;
         this.center.y += dy;*/
      }

      this.events.emit('zoom', { zoom: zoom });
      this.events.emit('change');
    }
  }

  /**
   * Get current zoom level
   * @return {Number} zoom level
   */
  getZoom () {
    return this.zoom;
  }

  /**
   * Set map's geographic position
   * @param {Object} pos The new position
   * @param {Number} pos.latitude
   * @param {Number} pos.longitude
   * @emits OSMBuildings#change
   */
  setPosition (pos) {
    const
      lat = parseFloat(pos.latitude),
      lon = parseFloat(pos.longitude);
    if (isNaN(lat) || isNaN(lon)) {
      return;
    }
    this.position = { latitude: clamp(lat, -90, 90), longitude: clamp(lon, -180, 180) };
    this.events.emit('change');
  }

  /**
   * Get map's current geographic position
   * @return {Object} Geographic position { latitude, longitude }
   */
  getPosition () {
    return this.position;
  }

  /**
   * Set map view's size in pixels
   * @public
   * @deprecated {Object} size
   * @deprecated {Integer} size.width
   * @deprecated {Integer} size.height
   * @param {Integer} width
   * @param {Integer} height
   * @emits OSMBuildings#resize
   */
  setSize (width, height) {
    if (width !== this.width || height !== this.height) {
      this.width = width;
      this.height = height;
      this.events.emit('resize', { width: this.width, height: this.height });
    }
  }

  /**
   * Get map's current view size in pixels
   * @return {Object} View size { width, height }
   */
  getSize () {
    return { width: this.width, height: this.height };
  }

  /**
   * Set map's rotation
   * @param {Number} rotation The new rotation angle in degrees
   * @emits OSMBuildings#rotate
   * @emits OSMBuildings#change
   */
  setRotation (rotation) {
    rotation = parseFloat(rotation) % 360;
    if (this.rotation !== rotation) {
      this.rotation = rotation;
      this.events.emit('rotate', { rotation: rotation });
      this.events.emit('change');
    }
  }

  /**
   * Get map's current rotation
   * @return {Number} Rotation in degrees
   */
  getRotation () {
    return this.rotation;
  }

  /**
   * Set map's tilt
   * @param {Number} tilt The new tilt in degree
   * @emits OSMBuildings#tilt
   * @emits OSMBuildings#change
   */
  setTilt (tilt) {
    tilt = clamp(parseFloat(tilt), 0, MAX_TILT); // bigger max increases shadow moire on base map
    if (this.tilt !== tilt) {
      this.tilt = tilt;
      this.events.emit('tilt', { tilt: tilt });
      this.events.emit('change');
    }
  }

  /**
   * Get map's current tilt
   * @return {Number} Tilt in degrees
   */
  getTilt () {
    return this.tilt;
  }

  /**
   * Adds a WebGL Marker to the map.
   * * @return {Object} Marker
   */
  addMarker(options) {
   return new Marker(options);
  }

  /**
   * Destroys the map
   */
  destroy () {
    render.destroy();

    // this.basemapGrid.destroy();
    // this.dataGrid.destroy();

    this.events.destroy();

    this.glx.destroy();
    this.canvas.parentNode.removeChild(this.canvas);

    this.features.destroy();
    this.markers.destroy();

    this.container.innerHTML = '';
  }

  // destroyWorker () {
  //   this._worker.terminate();
  // }
}

/**
 * (String) OSMBuildings version
 * @static
 */
OSMBuildings.VERSION = '4.0.0';

/**
 * (String) OSMBuildings attribution
 * @static
 */
OSMBuildings.ATTRIBUTION = '<a href="https://osmbuildings.org/">© OSM Buildings</a>';


//*****************************************************************************

if (typeof define === 'function') {
  define([], OSMBuildings);
} else if (typeof module === 'object') {
  module.exports = OSMBuildings;
} else {
  window.OSMBuildings = OSMBuildings;
}


/**
 * @private
 */
function add2 (a, b) {
  return [a[0] + b[0], a[1] + b[1]];
}

/**
 * @private
 */
function mul2scalar (a, f) {
  return [a[0] * f, a[1] * f];
}

/**
 * @private
 */
function getEventXY (e) {
  const el = e.target;
  const box = el.getBoundingClientRect();
  return { x: e.x - box.left, y: e.y - box.top };
}

/**
 * @private
 */
function addListener (target, type, fn) {
  target.addEventListener(type, fn, false);
}


class Events {

  /**
   * @param container {HTMLElement} DOM element for local pointer events.
   */
  constructor (container) {
    this.window = top || window;

    this.listeners = {};
    this.isDisabled = false;

    this.prevX = 0;
    this.prevY = 0;
    this.startZoom = 0;
    this.prevRotation = 0;
    this.prevTilt = 0;
    this.startDist = 0;
    this.startAngle = 0;
    this.buttons = 0;

    this.addAllListeners(this.window, container);
  }

  addAllListeners (win, container) {
    const doc = win.document;

    if ('ontouchstart' in win) {
      addListener(container, 'touchstart', e => {
        this.onTouchStart(e);
      });

      addListener(doc, 'touchmove', e => {
        this.onTouchMoveDocument(e);
      });
      addListener(container, 'touchmove', e => {
        this.onTouchMove(e);
      });
      addListener(doc, 'touchend', e => {
        this.onTouchEndDocument(e);
      });
      addListener(doc, 'gesturechange', e => {
        this.onGestureChangeDocument(e);
      });
    } else {
      addListener(container, 'mousedown', e => {
        this.onMouseDown(e);
      });
      addListener(doc, 'mousemove', e => {
        this.onMouseMoveDocument(e);
      });
      addListener(container, 'mousemove', e => {
        this.onMouseMove(e);
      });
      addListener(doc, 'mouseup', e => {
        this.onMouseUpDocument(e);
      });
      addListener(container, 'mouseup', e => {
        this.onMouseUp(e);
      });
      addListener(container, 'dblclick', e => {
        this.onDoubleClick(e);
      });
      addListener(container, 'mousewheel', e => {
        this.onMouseWheel(e);
      });
      addListener(container, 'DOMMouseScroll', e => {
        this.onMouseWheel(e);
      });
      addListener(container, 'contextmenu', e => {
        this.onContextMenu(e);
      });
    }

    let resizeTimer;
    addListener(window, 'resize', e => {
      if (resizeTimer) {
        return;
      }
      resizeTimer = setTimeout(() => {
        resizeTimer = null;
        APP.setSize(APP.container.offsetWidth, APP.container.offsetHeight);
      }, 250);
    });
  }

  cancelEvent (e) {
    if (e.preventDefault) {
      e.preventDefault();
    }
    //if (e.stopPropagation) {
    //  e.stopPropagation();
    //}
    e.returnValue = false;
  }

  onDoubleClick (e) {
    render.speedUp();
    this.cancelEvent(e);

    this.emit('doubleclick', { ...getEventXY(e), buttons: e.buttons });

    if (!this.isDisabled) {
      APP.setZoom(APP.zoom + 1, e);
    }
  }

  onMouseDown (e) {
    render.speedUp();
    this.cancelEvent(e);

    this.startZoom = APP.zoom;
    this.prevRotation = APP.rotation;
    this.prevTilt = APP.tilt;

    this.prevX = e.clientX;
    this.prevY = e.clientY;

    if ((e.buttons === 1 && e.altKey) || e.buttons === 2) {
      this.buttons = 2;
    } else if (e.buttons === 1) {
      this.buttons = 1;
    }

    this.emit('pointerdown', { ...getEventXY(e), buttons: e.buttons });
  }

  onMouseMoveDocument (e) {
    if (this.buttons === 1) {
      render.speedUp(); // do it here because no button means the event is not related to us
      this.moveMap(e);
    } else if (this.buttons === 2) {
      render.speedUp(); // do it here because no button means the event is not related to us
      this.rotateMap(e);
    }

    this.prevX = e.clientX;
    this.prevY = e.clientY;
  }

  onMouseMove (e) {
    this.emit('pointermove', getEventXY(e));
  }

  onMouseUpDocument (e) {
    // prevents clicks on other page elements
    if (!this.buttons) {
      return;
    }

    if (this.buttons === 1) {
      this.moveMap(e);
    } else if (this.buttons === 2) {
      this.rotateMap(e);
    }

    this.buttons = 0;
  }

  onMouseUp (e) {
    const pos = getEventXY(e);
    render.Picking.getTargets(pos.x, pos.y, targets => {
      this.emit('pointerup', { buttons: e.buttons, targets: targets });
    });
  }

  onMouseWheel (e) {
    render.speedUp();
    this.cancelEvent(e);

    let delta = 0;
    if (e.wheelDeltaY) {
      delta = e.wheelDeltaY;
    } else if (e.wheelDelta) {
      delta = e.wheelDelta;
    } else if (e.detail) {
      delta = -e.detail;
    }

    if (!this.isDisabled) {
      const adjust = 0.2 * (delta > 0 ? 1 : delta < 0 ? -1 : 0);
      APP.setZoom(APP.zoom + adjust, e);
    }
  }

  onContextMenu (e) {
    this.cancelEvent(e);
  }

  //***************************************************************************

  moveMap (e) {
    if (this.isDisabled) {
      return;
    }

    // FIXME: make movement exact
    // the constant 0.86 was chosen experimentally for the map movement to be
    // "pinned" to the cursor movement when the map is shown top-down

    const
      scale = 0.86 * Math.pow(2, -APP.zoom),
      lonScale = 1 / Math.cos(APP.position.latitude / 180 * Math.PI),
      dx = e.clientX - this.prevX,
      dy = e.clientY - this.prevY,
      angle = APP.rotation * Math.PI / 180,
      vRight = [Math.cos(angle), Math.sin(angle)],
      vForward = [Math.cos(angle - Math.PI / 2), Math.sin(angle - Math.PI / 2)],
      dir = add2(mul2scalar(vRight, dx), mul2scalar(vForward, -dy));

    const newPosition = {
      longitude: APP.position.longitude - dir[0] * scale * lonScale,
      latitude: APP.position.latitude + dir[1] * scale
    };

    APP.setPosition(newPosition);
    this.emit('move', newPosition);
  }

  rotateMap (e) {
    if (this.isDisabled) {
      return;
    }

    this.prevRotation += (e.clientX - this.prevX) * (360 / this.window.innerWidth);
    this.prevTilt -= (e.clientY - this.prevY) * (360 / this.window.innerHeight);
    APP.setRotation(this.prevRotation);
    APP.setTilt(this.prevTilt);
  }

  emitGestureChange (e) {
    const
      t1 = e.touches[0],
      t2 = e.touches[1],
      dx = t1.clientX - t2.clientX,
      dy = t1.clientY - t2.clientY,
      dist = dx * dx + dy * dy,
      angle = Math.atan2(dy, dx);

    this.onGestureChangeDocument({ rotation: ((angle - this.startAngle) * (180 / Math.PI)) % 360, scale: Math.sqrt(dist / this.startDist) });
  }

  //***************************************************************************

  onTouchStart (e) {
    render.speedUp();
    this.cancelEvent(e);

    this.buttons = 1;

    const t1 = e.touches[0];

    // gesture polyfill adapted from https://raw.githubusercontent.com/seznam/JAK/master/lib/polyfills/gesturechange.js
    // MIT License
    if (e.touches.length === 2 && !('ongesturechange' in this.window)) {
      const t2 = e.touches[1];
      const dx = t1.clientX - t2.clientX;
      const dy = t1.clientY - t2.clientY;
      this.startDist = dx * dx + dy * dy;
      this.startAngle = Math.atan2(dy, dx);
    }

    this.startZoom = APP.zoom;
    this.prevRotation = APP.rotation;
    this.prevTilt = APP.tilt;

    this.prevX = t1.clientX;
    this.prevY = t1.clientY;

    this.emit('pointerdown', { x: e.x, y: e.y, buttons: 1 });
  }

  onTouchMoveDocument (e) {
    if (!this.buttons) {
      return;
    }

    render.speedUp();

    const t1 = e.touches[0];

    if (e.touches.length > 1) {
      APP.setTilt(this.prevTilt + (this.prevY - t1.clientY) * (360 / this.window.innerHeight));
      this.prevTilt = APP.tilt;
      if (!('ongesturechange' in this.window)) {
        this.emitGestureChange(e);
      }
    } else {
      this.moveMap(t1);
    }
    this.prevX = t1.clientX;
    this.prevY = t1.clientY;
  }

  onTouchMove (e) {
    if (e.touches.length === 1) {
      this.emit('pointermove', { ...getEventXY(e.touches[0]), buttons: 1 });
    }
  }

  onTouchEndDocument (e) {
    if (!this.buttons) {
      return;
    }

    const t1 = e.touches[0];

    if (e.touches.length === 0) {
      this.buttons = 0;

      const pos = getEventXY(e);
      render.Picking.getTargets(pos.x, pos.y, targets => {
        this.emit('pointerup', { buttons: 1, targets: targets });
      });

    } else if (e.touches.length === 1) {
      // There is one touch currently on the surface => gesture ended. Prepare for continued single touch move
      this.prevX = t1.clientX;
      this.prevY = t1.clientY;
    }
  }

  onGestureChangeDocument (e) {
    if (!this.buttons) {
      return;
    }

    render.speedUp();
    this.cancelEvent(e);

    if (!this.isDisabled) {
      APP.setZoom(this.startZoom + (e.scale - 1));
      APP.setRotation(this.prevRotation - e.rotation);
    }

    this.emit('gesture', e);
  }

  //***************************************************************************

  on (type, fn) {
    (this.listeners[type] || (this.listeners[type] = [])).push(fn);
  }

  off (type, fn) {
    this.listeners[type] = (this.listeners[type] || []).filter(item => item !== fn);
  }

  emit (type, payload) {
    if (this.listeners[type] === undefined) {
      return;
    }

    setTimeout(() => {
      this.listeners[type].forEach(listener => listener(payload));
    }, 0);
  }

  destroy() {
    // TODO: remove all DOM listeners
    this.listeners = {};
  }
}


const
  // MIN_ZOOM = 11,
  MIN_ZOOM = 14.5,
  MAX_ZOOM = 22,

  // MAX_TILT = 75;
  MAX_TILT = 55;


var TILE_SIZE = 256;

var DEFAULT_HEIGHT = 10;

var MAX_USED_ZOOM_LEVEL = 25;
var DEFAULT_COLOR = Qolor.parse('rgb(220, 210, 200)').toArray();

// #E8E0D8 is the background color of the current OSMBuildings map layer,
// and thus a good fog color to blend map tiles and buildings close to horizon into
var FOG_COLOR = '#e8e0d8';
//var FOG_COLOR = '#f0f8ff';
var BACKGROUND_COLOR = '#efe8e0';

var document = window.document;

var EARTH_RADIUS_IN_METERS = 6378137;
var EARTH_CIRCUMFERENCE_IN_METERS = EARTH_RADIUS_IN_METERS * Math.PI * 2;
var METERS_PER_DEGREE_LATITUDE = EARTH_CIRCUMFERENCE_IN_METERS / 360;

/* For shadow mapping, the camera rendering the scene as seen by the sun has
 * to cover everything that's also visible to the user. For this to work
 * reliably, we have to make assumptions on how high (in [m]) the buildings
 * can become.
 * Note: using a lower-than-accurate value will lead to buildings parts at the
 * edge of the viewport to have incorrect shadows. Using a higher-than-necessary
 * value will lead to an unnecessarily large view area and thus to poor shadow
 * resolution. */
var SHADOW_MAP_MAX_BUILDING_HEIGHT = 100;

/* for shadow mapping, the scene needs to be rendered into a depth map as seen
 * by the light source. This rendering can have arbitrary dimensions -
 * they need not be related to the visible viewport size in any way. The higher
 * the resolution (width and height) for this depth map the smaller are
 * the visual artifacts introduced by shadow mapping. But increasing the
 * shadow depth map size impacts rendering performance */
var SHADOW_DEPTH_MAP_SIZE = 2048;

//the building wall texture as a data url
var BUILDING_TEXTURE = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAEAAAABAAQMAAACQp+OdAAAACXBIWXMAAAsTAAALEwEAmpwYAAAAB3RJTUUH3wwCCAUQLpaUSQAAABl0RVh0Q29tbWVudABDcmVhdGVkIHdpdGggR0lNUFeBDhcAAAAGUExURebm5v///zFES9kAAAAcSURBVCjPY/gPBQyUMh4wAAH/KAPCoFaoDnYGAAKtZsamTRFlAAAAAElFTkSuQmCC';

//the Marker texture as a data url
var MARKER_TEXTURE = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAQAAAAEACAYAAABccqhmAAAACXBIWXMAAA3XAAAN1wFCKJt4AAAAB3RJTUUH4gUHDxACbf+ToAAABKBJREFUeNrt3YFtKjEURFGWBmiE/iuhka0AOgCxWpDte04DP/nxG88zkbJdWMLjdnv+89+77/vmf31+foiGXDgIAAy8QBAAGHiBIAAw9MJAAGDohYEAwNALAwGAwRcEAgCDLwgEAAZfEAgADL4gEAAGH0EgAAw+gkAAGHwEgQAw/AgBAWDwEQQCwPAjBASA4UcICACDjyAQAIYfISAADD9CQAAYfoSAADD4CAIBYPgRAgLA8CMEBIDhRwgIAMOPEBAAhh8hcIqrHzd0ZZLO7Y8WEA0Aw48QiAaA4UcIRAPA8CMEogFg+BECn/kUAMKWTDW3P1pANAAMP0LACgDUGoDbHy0gGgCGHyFgBQBqDcDtjxagAQC1BuD2RwvQAIBaA3D7owVoAECtAbj90QI0AKDWANz+aAEaAFBrAG5/tAANABAAQGYFUP+xBmgAgAAAMiuA+o81QAMABACQWQHUf6wBGgAgAAABAKz/BmD/xzuABgAIAEAAAOu/Adj/8Q6gAQACABAAgAAABAAgAIAjhv14wkeArGTUjwI1ALACAAIAEACAAAAEACAAAAEACABAAAACABAAgAAABAAgAAABAAgAQAAAAgAQAIAAAAQAIAAAAQD8zjbyF+ePg7CCUf8oiAYAVgBAAAACAOjYRv8CPQQys5EfADUAsAIAAgDwBuAdABr7vwYAVgDACmANgFT91wDACgAIAJUKBADQuawEAIRNV6t9GoDbXwMABACQWgGsAaj/GgBQDQC/EwAaALiUBABw1NRV2mMgbn8NACgGgMdA0ADAJSQAgG8tUaE9BuL21wCAYgPQAnD7awBAtQFoAbj9NQCgGgB+MQg0AHDJVANACwANAFwuAgB4Z9m67CNB3P4aAFBsAFoAbn8NAKg2AC0At78GAFQbgBaA218DAKoNQAvA7R8PACGA4bcCANUGoAXg9tcAgGoD0AJw+2sAQLUBaAG4/TUA0ADK37wWQPn21wBAA2jTAtz+5e9fA8DwCwCHAKwAVgEEvwYAaABaAG5/DQDQALQA3P4aABh+AeCQgBXAKoBg1wAADUALwO2vAYDhFwAOD1gBrAIIcA0A0AC0ANz+GgAYfgHgUIEAAEEtABwu+DMH+gAPggJaAwDDLwAcNrACWAUQyBoAGH4B4PCBAAAB7A3AWwCGXwNwGEEAgMAVAA4leAPwHoCg1QDA8AsAhxSsAFYBBKsGAIZfADi0IAAQpHgD8BZg+NEAHGIQAAhOrABWAcOPBuBQgwBAUGIFsAoYfjQAhxwEAIIRK4BVwPCjATj0IAAQhFYArAKGXwPAECAAQPBZAbAKGH4BgBAw/FYADAcCAAScFQCrgOHXADAsCAAQaFYArAKGXwPA8CAAQIBZAciuAoZfABANAcNvBcBQIQAQVFgBSKwChl8DwJAhABBMWAFIrAKGXwAQDQHDbwXA8CEAEEBYAUisAoZfA8BNjABA4GAFILEKGH4BQDQEDL8VAPUcAYBgwQpAYhUw/AKAaAgYfisAajsaALUmIEA0ALQHBACGGSsAiVVAYAgAoiFg+K0AWBUQABhyrAAkVgHBAMEQmPEPj3KeFy7fLVanpR7MAAAAAElFTkSuQmCC';

class Request {

  static load (url, callback) {
    const req = new XMLHttpRequest();

    const timer = setTimeout(function () {
      if (req.readyState !== 4) {
        req.abort();
        callback('status');
      }
    }, 10000);

    req.onreadystatechange = () => {
      if (req.readyState !== 4) {
        return;
      }

      clearTimeout(timer);

      if (!req.status || req.status < 200 || req.status > 299) {
        callback('status');
        return;
      }

      callback(null, req);
    };
console.log(url)
    req.open('GET', url);
    req.send(null);

    return {
      abort: () => {
        req.abort();
      }
    };
  }

  static getText (url, callback) {
    return this.load(url, (err, res) => {
      if (err) {
        callback(err);
        return;
      }
      if (res.responseText !== undefined) {
        callback(null, res.responseText);
      } else {
        callback('content');
      }
    });
  }

  static getXML (url, callback) {
    return this.load(url, (err, res) => {
      if (err) {
        callback(err);
        return;
      }
      if (res.responseXML !== undefined) {
        callback(null, res.responseXML);
      } else {
        callback('content');
      }
    });
  }

  static getJSON (url, callback) {
    return this.load(url, (err, res) => {
      if (err) {
        callback(err);
        return;
      }
      if (!res.responseText) {
        callback('content');
        return;
      }

      let json;
      try {
        json = JSON.parse(res.responseText);
        callback(null, json);
      } catch (ex) {
        console.warn(`Could not parse JSON from ${url}\n${ex.message}`);
        callback('content');
      }
    });
  }
}

/*function project(latitude, longitude, worldSize) {
  var
    x = longitude/360 + 0.5,
    y = Math.min(1, Math.max(0, 0.5 - (Math.log(Math.tan((Math.PI/4) + (Math.PI/2)*latitude/180)) / Math.PI) / 2));
  return { x: x*worldSize, y: y*worldSize };
}

function unproject(x, y, worldSize) {
  x /= worldSize;
  y /= worldSize;
  return {
    latitude: (2 * Math.atan(Math.exp(Math.PI * (1 - 2*y))) - Math.PI/2) * (180/Math.PI),
    longitude: x*360 - 180
  };
}*/

function pattern(str, param) {
  return str.replace(/\{(\w+)\}/g, function(tag, key) {
    return param[key] || tag;
  });
}

function assert(condition, message) {
  if (!condition) {
    throw message;
  }
}

/* returns a new list of points based on 'points' where the 3rd coordinate in
 * each entry is set to 'zValue'
 */
function substituteZCoordinate(points, zValue) {
  var res = [];
  for (var i in points) {
    res.push( [points[i][0], points[i][1], zValue] );
  }
  
  return res;
}

function clamp(value, min, max) {
  return Math.min(max, Math.max(value, min));
}


class Grid {

  constructor (source, tileClass, options = {}, maxThreads = 2) {
    this.source = source;
    this.tileClass = tileClass;

    this.tiles = {};
    this.buffer = 1;

    this.queue = [];
    // TODO: should be more flexible, also connected to # of webworkers, could increase when idle
    for (let i = 0; i < maxThreads; i++) {
      this.queueNext();
    }

    this.update();

    // TODO: get rid
    this.fixedZoom = options.fixedZoom;

    this.bounds = options.bounds || { w: -180, s: -90, e: 180, n: 90 };
    this.minZoom = Math.max(parseFloat(options.minZoom || APP.minZoom), APP.minZoom);
    this.maxZoom = Math.min(parseFloat(options.maxZoom || APP.maxZoom), APP.maxZoom);

    if (this.maxZoom < this.minZoom) {
      this.minZoom = APP.minZoom;
      this.maxZoom = APP.maxZoom;
    }
  }

  getURL (x, y, z) {
    const s = 'abcd'[(x + y) % 4];
    return pattern(this.source, { s: s, x: x, y: y, z: z });
  }

  getClosestTiles (tileList, referencePoint) {
    return tileList;

    // tileList.sort(function(a, b) {
    //   // tile coordinates correspond to the tile's upper left corner, but for
    //   // the distance computation we should rather use their center; hence the 0.5 offsets
    //   const distA = Math.pow(a[0] + 0.5 - referencePoint[0], 2.0) + Math.pow(a[1] + 0.5 - referencePoint[1], 2.0);
    //   const distB = Math.pow(b[0] + 0.5 - referencePoint[0], 2.0) + Math.pow(b[1] + 0.5 - referencePoint[1], 2.0);
    //   return distA > distB;
    // });
    //
    // // remove duplicates
    // let prevX, prevY;
    // return tileList.filter(tile => {
    //   if (tile[0] === prevX && tile[1] === prevY) {
    //     return false;
    //   }
    //   prevX = tile[0];
    //   prevY = tile[1];
    //   return true;
    // });
  }

  /* Returns a set of tiles based on 'tiles' (at zoom level 'zoom'),
   * but with those tiles recursively replaced by their respective parent tile
   * (tile from zoom level 'zoom'-1 that contains 'tile') for which said parent
   * tile covers less than 'pixelAreaThreshold' pixels on screen based on the
   * current view-projection matrix.
   *
   * The returned tile set is duplicate-free even if there were duplicates in
   * 'tiles' and even if multiple tiles from 'tiles' got replaced by the same parent.
   */
  mergeTiles (tiles, zoom, pixelAreaThreshold) {
    const
      parentTiles = {},
      tileSet = {},
      tileList = [];

    // if there is no parent zoom level
    let key;
    if (zoom === 0 || zoom <= this.minZoom) {
      for (key in tiles) {
        tiles[key][2] = zoom;
      }
      return tiles;
    }

    for (key in tiles) {
      const tile = tiles[key];

      const parentX = (tile[0] << 0) / 2;
      const parentY = (tile[1] << 0) / 2;

      if (parentTiles[[parentX, parentY]] === undefined) { //parent tile screen size unknown
        const numParentScreenPixels = getTileSizeOnScreen(parentX, parentY, zoom - 1, render.viewProjMatrix);
        parentTiles[[parentX, parentY]] = (numParentScreenPixels < pixelAreaThreshold);
      }

      if (!parentTiles[[parentX, parentY]]) { //won't be replaced by a parent tile -->keep
        if (tileSet[[tile[0], tile[1]]] === undefined) {  //remove duplicates
          tileSet[[tile[0], tile[1]]] = true;
          tileList.push([tile[0], tile[1], zoom]);
        }
      }
    }

    let parentTileList = [];

    for (key in parentTiles) {
      if (parentTiles[key]) {
        const parentTile = key.split(',');
        parentTileList.push([parseInt(parentTile[0]), parseInt(parentTile[1]), zoom - 1]);
      }
    }

    if (parentTileList.length > 0) {
      parentTileList = this.mergeTiles(parentTileList, zoom - 1, pixelAreaThreshold);
    }

    return tileList.concat(parentTileList);
  }

  getDistance (a, b) {
    const dx = a[0] - b[0], dy = a[1] - b[1];
    return dx * dx + dy * dy;
  }

  // getAnglePoint (point, angle, distance) {
  //   let rad = angle * Math.PI / 180;
  //   return [distance * Math.cos(rad) + point[0], distance * Math.sin(rad) + point[1]];
  // }
  //
  // // inspired by polygon.js (https://github.com/tmpvar/polygon.js/blob/master/polygon.js
  // pointInPolygon (point, polygon) {
  //   let
  //     res = false,
  //     curr, prev;
  //   for (let i = 1; i < polygon.length; i++) {
  //     curr = polygon[i];
  //     prev = polygon[i - 1];
  //
  //     ((prev[1] <= point[1] && point[1] < curr[1]) || (curr[1] <= point[1] && point[1] < prev[1]))
  //     && (point[0] < (curr[0] - prev[0]) * (point[1] - prev[1]) / (curr[1] - prev[1]) + prev[0])
  //     && (res = !res);
  //   }
  //   return res;
  // }

  update () {
    if (APP.zoom < this.minZoom || APP.zoom > this.maxZoom) {
      return;
    }

    const zoom = Math.round(this.fixedZoom || APP.zoom);
    // TODO: respect bounds
    // min = project(this.bounds.s, this.bounds.w, 1<<zoom),
    // max = project(this.bounds.n, this.bounds.e, 1<<zoom),
    // bounds = {
    //   zoom: zoom,
    //   minX: min.x <<0,
    //   minY: min.y <<0,
    //   maxX: max.x <<0,
    //   maxY: max.y <<0
    // };

    let
      viewQuad = render.getViewQuad(render.viewProjMatrix.data),
      center = project([APP.position.longitude, APP.position.latitude], 1<< zoom);

    for (let i = 0; i < 4; i++) {
      viewQuad[i] = getTilePositionFromLocal(viewQuad[i], zoom);
    }

    let tiles = rasterConvexQuad(viewQuad);
    tiles = ( this.fixedZoom ) ? this.getClosestTiles(tiles, center) : this.mergeTiles(tiles, zoom, 0.5 * TILE_SIZE * TILE_SIZE);

    const visibleTiles = {};
    tiles.forEach(pos => {
      if (pos[2] === undefined) {
        pos[2] = zoom;
      }
      visibleTiles[pos.join(',')] = true;
    });

    this.visibleTiles = visibleTiles; // TODO: remove from this. Currently needed for basemap renderer collecting items

    //*****************************************************
    //*****************************************************

    for (let key in visibleTiles) {
      const
        pos = key.split(','),
        x = parseInt(pos[0]),
        y = parseInt(pos[1]),
        zoom = parseInt(pos[2]);

      // TODO: check why some other zoom levels are loaded!

      if (this.tiles[key]) {
        continue;
      }

      // create tile if it doesn't exist
      this.tiles[key] = new this.tileClass(x, y, zoom);
      this.queue.push(this.tiles[key]);
    }

    this.purge(visibleTiles);

    // update all distances
    this.queue.forEach(tile => {
      tile.distance = this.getDistance([tile.x, tile.y], center);
    });

    this.queue.sort((a, b) => {
      return b.distance - a.distance;
    });

    setTimeout(() => {
      this.update();
    }, 100);
  }

  queueNext () {
    if (!this.queue.length) {
      setTimeout(this.queueNext.bind(this), 200);
      return;
    }

    const tile = this.queue.pop();

    tile.load(this.getURL(tile.x, tile.y, tile.zoom), () => {
      this.queueNext();
    });
  }

  purge (visibleTiles) {
    const zoom = Math.round(APP.zoom);

    for (let key in this.tiles) {
      let tile = this.tiles[key];

      // tile is visible: keep
      if (visibleTiles[key]) {
        continue;
      }

      // tile is not visible and due to fixedZoom there are no alternate zoom levels: drop
      if (this.fixedZoom) {
        this.tiles[key].destroy();
        delete this.tiles[key];
        continue;
      }

      // tile's parent would be visible: keep
      if (tile.zoom === zoom+1) {
        let parentKey = [tile.x/2<<0, tile.y/2<<0, zoom].join(',');
        if (visibleTiles[parentKey]) {
          continue;
        }
      }

      // any of tile's children would be visible: keep
      if (tile.zoom === zoom-1) {
        if (
          visibleTiles[[tile.x*2,     tile.y*2,     zoom].join(',')] ||
          visibleTiles[[tile.x*2 + 1, tile.y*2,     zoom].join(',')] ||
          visibleTiles[[tile.x*2,     tile.y*2 + 1, zoom].join(',')] ||
          visibleTiles[[tile.x*2 + 1, tile.y*2 + 1, zoom].join(',')]) {
          continue;
        }
      }

      // drop anything else
      delete this.tiles[key];
    }

    // remove dead tiles from queue
    this.queue = this.queue.filter(tile => !!tile);
  }

  destroy () {
    for (let key in this.tiles) {
      this.tiles[key].destroy();
    }
    this.tiles = {};
    this.queue = [];

    // TODO: stop update timer, stop queue timers
  }
}

class Tile {

  constructor (x, y, zoom) {
    this.x = x;
    this.y = y;
    this.zoom = zoom;
    this.key = [x, y, zoom].join(',');

    this.distance = Infinity;
  }

  load () {}

  destroy () {}
}

class BitmapTile extends Tile {

  constructor (x, y, zoom) {
    super(x, y, zoom);

    this.latitude = tile2lat(y, zoom);
    this.longitude = tile2lon(x, zoom);

    // note: due to Mercator projection the tile width in meters is equal to tile height in meters.
    const size = getTileSizeInMeters(this.latitude, zoom);

    const vertices = [
      size, size, 0,
      size, 0, 0,
      0, size, 0,
      0, 0, 0
    ];

    const texCoords = [
      1, 0,
      1, 1,
      0, 0,
      0, 1
    ];

    this.vertexBuffer = new GLX.Buffer(3, new Float32Array(vertices));
    this.texCoordBuffer = new GLX.Buffer(2, new Float32Array(texCoords));
  }

  load (url, callback) {
    this.texture = new GLX.texture.Image().load(url, image => {
      if (image) {

        /* Whole texture will be mapped to fit the tile exactly. So
         * don't attempt to wrap around the texture coordinates. */
        GL.bindTexture(GL.TEXTURE_2D, this.texture.id);
        GL.texParameteri(GL.TEXTURE_2D, GL.TEXTURE_WRAP_S, GL.CLAMP_TO_EDGE);
        GL.texParameteri(GL.TEXTURE_2D, GL.TEXTURE_WRAP_T, GL.CLAMP_TO_EDGE);

        this.isReady = true;
      }

      if (callback) {
        callback();
      }
    });
  }

  destroy () {
    this.vertexBuffer.destroy();
    this.texCoordBuffer.destroy();

    if (this.texture) {
      this.texture.destroy();
    }
  }
}


class GeoJSONTile extends Tile {

  constructor(x, y, zoom, options) {
    super(x, y, zoom);
    this.options = options;
  }

  load (url, callback) {
    this.content = new Feature('GeoJSON', url, this.options, callback);
  }

  destroy () {
    if (this.content) {
      this.content.destroy();
    }
  }
}


// TODO: collision check

class FeatureCollection extends Collection {

  constructor (...args) {
    super(...args);
    this.tintCallback = () => {};
    this.zScaleCallback = () => {};
  }

  setTintCallback (tintCallback) {
    this.tintCallback = tintCallback;
    this.forEach(item => {
      item.applyTintAndZScale();
    });
  }

  setZScaleCallback (zScaleCallback) {
    this.zScaleCallback = zScaleCallback;
    this.forEach(item => {
      item.applyTintAndZScale();
    });
  }
}


class Feature {

  constructor (type, url, options = {}, callback = function () {}) {
    this.type = type;
    this.url = url;
    this.options = options;
    this.callback = callback;

    this.id = options.id;
    this.color = options.color;

    this.matrix = new GLX.Matrix();
    this.translate(0, 0, options.elevation || 0);
    this.scale(options.scale || 1);
    this.rotate(options.rotation || 0);

    this.minZoom = Math.max(parseFloat(options.minZoom || MIN_ZOOM), APP.minZoom);
    this.maxZoom = Math.min(parseFloat(options.maxZoom || MAX_ZOOM), APP.maxZoom);

    if (this.maxZoom < this.minZoom) {
      this.minZoom = MIN_ZOOM;
      this.maxZoom = MAX_ZOOM;
    }

    this.load();
  }

  load () {
    APP.workers.get(worker => {
      worker.onMessage(res => {
        if (res === 'error') {
          this.callback();
          worker.free();
          return;
        }

        if (res === 'load') {
          this.callback();
          return;
        }

        this.onLoad(res);
        worker.free();
      });

      worker.postMessage({ type: this.type, url: this.url, options: this.options });
    });
  }

  onLoad (res) {

    this.position = res.position;
    this.prevX = 0;
    this.prevY = 0;

    //****** init buffers *********************************

    // this cascade ralaxes rendering a lot when new tile data arrives
    // TODO: destroy properly, even while this cascade might run -> make each step abortable
    this.vertexBuffer = new GLX.Buffer(3, res.vertices);
    this.timer = setTimeout(() => {
      this.normalBuffer = new GLX.Buffer(3, res.normals);
      this.timer = setTimeout(() => {
        this.colorBuffer = new GLX.Buffer(3, res.colors);
        this.timer = setTimeout(() => {
          this.texCoordBuffer = new GLX.Buffer(2, res.texCoords);
          this.timer = setTimeout(() => {
            this.heightBuffer = new GLX.Buffer(1, res.heights);
            this.timer = setTimeout(() => {
              this.pickingBuffer = new GLX.Buffer(3, res.pickingColors);
              this.timer = setTimeout(() => {
                this.items = res.items;
                this.applyTintAndZScale();
                APP.features.add(this);
                this.fade = 0;
              }, 20);
            }, 20);
          }, 20);
        }, 20);
      }, 20);
    }, 20);
  }

  translate (x = 0, y = 0, z = 0) {
    this.matrix.translate(x, y, z);
  }

  scale (scaling) {
    this.matrix.scale(scaling, scaling, scaling);
  }

  rotate (angle) {
    this.matrix.rotateZ(-angle);
  }

  getMatrix () {
    const
      currX = (this.position.longitude - APP.position.longitude),
      currY = (this.position.latitude - APP.position.latitude),
      dx = currX - this.prevX,
      dy = currY - this.prevY;

    // TODO: calc this once per renderFrame()
    const metersPerDegreeLongitude = METERS_PER_DEGREE_LATITUDE * Math.cos(APP.position.latitude / 180 * Math.PI);

    this.matrix.translate(dx * metersPerDegreeLongitude, -dy * METERS_PER_DEGREE_LATITUDE, 0);

    this.prevX = currX;
    this.prevY = currY;

    return this.matrix;
  }

  getFade () {
    if (this.fade >= 1) {
      return 1;
    }

    render.speedUp();

    const fade = this.fade;
    this.fade += 1 / (1 * 60); // (duration * fps)

    return fade;
  }

  applyTintAndZScale () {
    const tintColors = [];
    const tintCallback = APP.features.tintCallback;
    const zScales = [];
    const zScaleCallback = APP.features.zScaleCallback;

    this.items.forEach(item => {
      const f = { id: item.id, properties: item.properties }; // perhaps pass center/bbox as well
      const tintColor = tintCallback(f);
      const col = tintColor ? [...Qolor.parse(tintColor).toArray(), 1] : [0, 0, 0, 0];
      const hideFlag = zScaleCallback(f);
      for (let i = 0; i < item.vertexCount; i++) {
        tintColors.push(...col);
        zScales.push(hideFlag ? 0 : 1);
      }
    });

    // perhaps mix colors in JS and transfer just one color buffer
    this.tintBuffer = new GLX.Buffer(4, new Float32Array(tintColors));
    this.zScaleBuffer = new GLX.Buffer(1, new Float32Array(zScales));
  }

  destroy () {
    APP.features.remove(this);

    // if (this.request) {
    //   this.request.abort(); // TODO: signal to workers
    // }

    clearTimeout(this.timer);

    this.vertexBuffer && this.vertexBuffer.destroy();
    this.normalBuffer && this.normalBuffer.destroy();
    this.colorBuffer && this.colorBuffer.destroy();
    this.texCoordBuffer && this.texCoordBuffer.destroy();
    this.heightBuffer && this.heightBuffer.destroy();
    this.pickingBuffer && this.pickingBuffer.destroy();
    this.tintBuffer && this.tintBuffer.destroy();
    this.zScaleBuffer && this.zScaleBuffer.destroy();

    this.items = [];
  }
}


/* A 'MapPlane' object is a rectangular mesh in the X/Y plane (Z=0) that is
 * guaranteed to cover all of the area of that plane that is inside the skydome.
 *
 * A 'MapPlane' is untextured and featureless. Its intended use is as a stand-in
 * for a 'BaseMap' in situations where either using the actual BaseMap would be
 * inefficient (e.g. when the BaseMap would be rendered without a texture) or
 * no BaseMap is present (e.g. if OSMBuildings is used as an overlay to Leaflet
 * or MapBoxGL). This mostly applies to creating depth and normal textures of the
 * scene, not to the actual shaded scene rendering.
 */

class MapPlane {

  constructor () {
    this.size = 5000;

    this.minZoom = APP.minZoom;
    this.maxZoom = APP.maxZoom;

    this.matrix = new GLX.Matrix();

    this.createGeometry();
  }

  createGeometry () {
    const
      NUM_SEGMENTS = 50,
      segmentSize = 2*this.size / NUM_SEGMENTS,
      normal = [0, 0, 1],
      quadNormals = [...normal, ...normal, ...normal, ...normal, ...normal, ...normal],
      vertices = [],
      normals = [],
      zScale = [];

    for (let x = 0; x < NUM_SEGMENTS; x++) {
      for (let y = 0; y < NUM_SEGMENTS; y++) {
        const
          baseX = -this.size + x * segmentSize,
          baseY = -this.size + y * segmentSize;

        vertices.push(
          baseX, baseY, 0,
          baseX + segmentSize, baseY + segmentSize, 0,
          baseX + segmentSize, baseY, 0,

          baseX, baseY, 0,
          baseX, baseY + segmentSize, 0,
          baseX + segmentSize, baseY + segmentSize, 0);

        normals.push(...quadNormals);

        // vertices.push(
        //   baseX, baseY, 0,
        //   baseX + segmentSize, baseY, 0,
        //   baseX + segmentSize, baseY + segmentSize, 0,
        //
        //   baseX, baseY, 0,
        //   baseX + segmentSize, baseY + segmentSize, 0,
        //   baseX, baseY + segmentSize, 0);
        //
        // normals.push(...quadNormals);

        zScale.push(1, 1, 1, 1, 1, 1);
      }
    }

    this.vertexBuffer = new GLX.Buffer(3, new Float32Array(vertices));
    this.normalBuffer = new GLX.Buffer(3, new Float32Array(normals));
    this.zScaleBuffer = new GLX.Buffer(1, new Float32Array(zScale));
  }

  getFade () {
    return 1;
  }

  getMatrix () {
    // const scale = Math.pow(2, APP.zoom - 16);
    // this.matrix.scale(scale, scale, scale);
    return this.matrix;
  }

  destroy () {
    this.vertexBuffer.destroy();
    this.normalBuffer.destroy();
  }
}


function assert(condition, message) {
  if (!condition) {
    throw message;
  }
}

/* Returns the distance of point 'p' from line 'line1'->'line2'.
 * based on http://mathworld.wolfram.com/Point-LineDistance2-Dimensional.html
 */
 /*
function getDistancePointLine2( line1, line2, p) {

  //v: a unit-length vector perpendicular to the line;
  var v = norm2( [ line2[1] - line1[1], line1[0] - line2[0] ] );
  var r = sub2( line1, p);
  return Math.abs(dot2(v, r));
} */

/*  given a pixel's (integer) position through which the line 'segmentStart' ->
 *  'segmentEnd' passes, this method returns the one neighboring pixel of 
 *  'currentPixel' that would be traversed next if the line is followed in 
 *  the direction from 'segmentStart' to 'segmentEnd' (even if the next point
 *  would lie beyond 'segmentEnd'. )
 */
function getNextPixel(segmentStart, segmentEnd, currentPixel) {

  var vInc = [segmentStart[0] < segmentEnd[0] ? 1 : -1, 
              segmentStart[1] < segmentEnd[1] ? 1 : -1];
         
  var nextX = currentPixel[0] + (segmentStart[0] < segmentEnd[0] ?  +1 : 0);
  var nextY = currentPixel[1] + (segmentStart[1] < segmentEnd[1] ?  +1 : 0);
  
  // position of the edge to the next pixel on the line 'segmentStart'->'segmentEnd'
  var alphaX = (nextX - segmentStart[0])/ (segmentEnd[0] - segmentStart[0]);
  var alphaY = (nextY - segmentStart[1])/ (segmentEnd[1] - segmentStart[1]);
  
  // neither value is valid
  if ((alphaX <= 0.0 || alphaX > 1.0) && (alphaY <= 0.0 || alphaY > 1.0)) {
    return [undefined, undefined];
  }
    
  if (alphaX <= 0.0 || alphaX > 1.0) { // only alphaY is valid
    return [currentPixel[0], currentPixel[1] + vInc[1]];
  }

  if (alphaY <= 0.0 || alphaY > 1.0) { // only alphaX is valid
    return [currentPixel[0] + vInc[0], currentPixel[1]];
  }
    
  return alphaX < alphaY ? [currentPixel[0]+vInc[0], currentPixel[1]] :
                           [currentPixel[0],         currentPixel[1] + vInc[1]];
}

/* returns all pixels that are at least partially covered by the triangle
 * p1-p2-p3. 
 * Note: the returned array of pixels *will* contain duplicates that may need 
 * to be removed.
 */
function rasterTriangle(p1, p2, p3) {
  var points = [p1, p2, p3];
  points.sort(function(p, q) {
    return p[1] < q[1];
  });
  p1 = points[0];
  p2 = points[1];
  p3 = points[2];
  
  if (p1[1] == p2[1])
    return rasterFlatTriangle( p1, p2, p3);
    
  if (p2[1] == p3[1])
    return rasterFlatTriangle( p2, p3, p1);

  var alpha = (p2[1] - p1[1]) / (p3[1] - p1[1]);
  //point on the line p1->p3 with the same y-value as p2
  var p4 = [p1[0] + alpha*(p3[0]-p1[0]), p2[1]];
  
  /*  P3
   *   |\
   *   | \
   *  P4--P2
   *   | /
   *   |/
   *   P1
   * */
  return rasterFlatTriangle(p4, p2, p1).concat(rasterFlatTriangle(p4, p2, p3));
}

/* Returns all pixels that are at least partially covered by the triangle
 * flat0-flat1-other, where the points flat0 and flat1 need to have the
 * same y-value. This method is used internally for rasterTriangle(), which
 * splits a general triangle into two flat triangles, and calls this method
 * for both parts.
 * Note: the returned array of pixels will contain duplicates.
 *
 * other
 *  | \_
 *  |   \_
 *  |     \_
 * f0/f1--f1/f0  
 */
function rasterFlatTriangle( flat0, flat1, other ) {

  //console.log("RFT:\n%s\n%s\n%s", String(flat0), String(flat1), String(other));
  var points = [];
  assert(flat0[1] === flat1[1], 'not a flat triangle');
  assert(other[1] !== flat0[1], 'not a triangle');
  assert(flat0[0] !== flat1[0], 'not a triangle');

  if (flat0[0] > flat1[0]) //guarantees that flat0 is always left of flat1
  {
    var tmp = flat0;
    flat0 = flat1;
    flat1 = tmp;
  }
  
  var leftRasterPos = [other[0] <<0, other[1] <<0];
  var rightRasterPos = leftRasterPos.slice(0);
  points.push(leftRasterPos.slice(0));
  var yDir = other[1] < flat0[1] ? +1 : -1;
  var yStart = leftRasterPos[1];
  var yBeyond= (flat0[1] <<0) + yDir;
  var prevLeftRasterPos;
  var prevRightRasterPos;

  for (var y = yStart; (y*yDir) < (yBeyond*yDir); y+= yDir) {
    do {
      points.push( leftRasterPos.slice(0));
      prevLeftRasterPos = leftRasterPos;
      leftRasterPos = getNextPixel(other, flat0, leftRasterPos);
    } while (leftRasterPos[1]*yDir <= y*yDir);
    leftRasterPos = prevLeftRasterPos;
    
    do {
      points.push( rightRasterPos.slice(0));
      prevRightRasterPos = rightRasterPos;
      rightRasterPos = getNextPixel(other, flat1, rightRasterPos);
    } while (rightRasterPos[1]*yDir <= y*yDir);
    rightRasterPos = prevRightRasterPos;
    
    for (var x = leftRasterPos[0]; x <= rightRasterPos[0]; x++) {
      points.push([x, y]);
    }
  }
  
  return points;
}

/* Returns an array of all pixels that are at least partially covered by the
 * convex quadrilateral 'quad'. If the passed quadrilateral is not convex,
 * then the return value of this method is undefined.
 */
function rasterConvexQuad(quad) {
  assert(quad.length == 4, 'Error: Quadrilateral with more or less than four vertices');
  var res1 = rasterTriangle(quad[0], quad[1], quad[2]);
  var res2 = rasterTriangle(quad[0], quad[2], quad[3]);
  return res1.concat(res2);
}

// computes the normal vector of the triangle a-b-c
function normal(a, b, c) {
  var d1 = sub3(a, b);
  var d2 = sub3(b, c);
  // normalized cross product of d1 and d2.
  return norm3([ d1[1]*d2[2] - d1[2]*d2[1],
                 d1[2]*d2[0] - d1[0]*d2[2],
                 d1[0]*d2[1] - d1[1]*d2[0] ]);
}



/**
 * returns the quadrilateral part of the XY plane that is currently visible on
 * screen. The quad is returned in tile coordinates for tile zoom level
 * 'tileZoomLevel', and thus can directly be used to determine which basemap
 * and geometry tiles need to be loaded.
 * Note: if the horizon is level (as should usually be the case for 
 * OSMBuildings) then said quad is also a trapezoid.
 */
function getViewQuad(viewProjectionMatrix, maxFarEdgeDistance, viewDirOnMap) {
  // maxFarEdgeDistance: maximum distance from the map center at which geometry is still visible

  const inverseViewMatrix = GLX.Matrix.invert(viewProjectionMatrix);

  let
    vBottomLeft  = getIntersectionWithXYPlane(-1, -1, inverseViewMatrix),
    vBottomRight = getIntersectionWithXYPlane( 1, -1, inverseViewMatrix),
    vTopRight    = getIntersectionWithXYPlane( 1,  1, inverseViewMatrix),
    vTopLeft     = getIntersectionWithXYPlane(-1,  1, inverseViewMatrix);

  // If even the lower edge of the screen does not intersect with the map plane,
  // then the map plane is not visible at all. We won't attempt to create a view rectangle.

  if (!vBottomLeft || !vBottomRight) {
    return;
  }

  let
    vLeftDir, vRightDir, vLeftPoint, vRightPoint,
    f;

  // The lower screen edge intersects map plane, but the upper one does not.
  // Usually happens when the camera is close to parallel to the ground
  // so that the upper screen edge lies above the horizon. This is not a bug
  // and can legitimately happen. But from a theoretical standpoint, this means
  // that the view 'trapezoid' stretches infinitely toward the horizon. Since this
  // is not useful we manually limit that area.

  if (!vTopLeft || !vTopRight) {
    // point on the left screen edge with the same y-value as the map center*/
    vLeftPoint = getIntersectionWithXYPlane(-1, -0.9, inverseViewMatrix);
    vLeftDir = norm2(sub2(vLeftPoint, vBottomLeft));
    f = dot2(vLeftDir, viewDirOnMap);
    vTopLeft = add2( vBottomLeft, mul2scalar(vLeftDir, maxFarEdgeDistance/f));
    
    vRightPoint = getIntersectionWithXYPlane( 1, -0.9, inverseViewMatrix);
    vRightDir = norm2(sub2(vRightPoint, vBottomRight));
    f = dot2(vRightDir, viewDirOnMap);
    vTopRight = add2( vBottomRight, mul2scalar(vRightDir, maxFarEdgeDistance/f));
  }

  // If vTopLeft is further than maxFarEdgeDistance away vertically from the lower edge, move it closer.
  if (dot2(viewDirOnMap, sub2(vTopLeft, vBottomLeft)) > maxFarEdgeDistance) {
    vLeftDir = norm2(sub2(vTopLeft, vBottomLeft));
    f = dot2(vLeftDir, viewDirOnMap);
    vTopLeft = add2(vBottomLeft, mul2scalar(vLeftDir, maxFarEdgeDistance/f));
  }

  // Same for vTopRight
  if (dot2(viewDirOnMap, sub2(vTopRight, vBottomRight)) > maxFarEdgeDistance) {
    vRightDir = norm2(sub2(vTopRight, vBottomRight));
    f = dot2(vRightDir, viewDirOnMap);
    vTopRight = add2(vBottomRight, mul2scalar(vRightDir, maxFarEdgeDistance/f));
  }
 
  return [vBottomLeft, vBottomRight, vTopRight, vTopLeft];
}


/* Returns an orthographic projection matrix whose view rectangle contains all
 * points of 'points' when watched from the position given by targetViewMatrix.
 * The depth range of the returned matrix is [near, far].
 * The 'points' are given as euclidean coordinates in [m] distance to the 
 * current reference point (APP.position). 
 */
function getCoveringOrthoProjection(points, targetViewMatrix, near, far, height) {
  var p0 = transformVec3(targetViewMatrix.data, points[0]);
  var left = p0[0];
  var right= p0[0];
  var top  = p0[1];
  var bottom=p0[1];

  for (var i = 0; i < points.length; i++) {
    var p =  transformVec3(targetViewMatrix.data, points[i]);
    left = Math.min( left,  p[0]);
    right= Math.max( right, p[0]);
    top  = Math.max( top,   p[1]);
    bottom=Math.min( bottom,p[1]);
  }
  
  return new GLX.Matrix.Ortho(left, right, top, bottom, near, far);
}

/* transforms the 3D vector 'v' according to the transformation matrix 'm'.
 * Internally, the vector 'v' is interpreted as a 4D vector
 * (v[0], v[1], v[2], 1.0) in homogenous coordinates. The transformation is
 * performed on that vector, yielding a 4D homogenous result vector. That
 * vector is then converted back to a 3D Euler coordinates by dividing
 * its first three components each by its fourth component */
function transformVec3(m, v) {
  var x = v[0]*m[0] + v[1]*m[4] + v[2]*m[8]  + m[12];
  var y = v[0]*m[1] + v[1]*m[5] + v[2]*m[9]  + m[13];
  var z = v[0]*m[2] + v[1]*m[6] + v[2]*m[10] + m[14];
  var w = v[0]*m[3] + v[1]*m[7] + v[2]*m[11] + m[15];
  return [x/w, y/w, z/w]; //convert homogenous to Euler coordinates
}

/* returns the point (in OSMBuildings' local coordinates) on the XY plane (z==0)
 * that would be drawn at viewport position (screenNdcX, screenNdcY).
 * That viewport position is given in normalized device coordinates, i.e.
 * x==-1.0 is the left screen edge, x==+1.0 is the right one, y==-1.0 is the lower
 * screen edge and y==+1.0 is the upper one.
 */
function getIntersectionWithXYPlane(screenNdcX, screenNdcY, inverseTransform) {
  var v1 = transformVec3(inverseTransform, [screenNdcX, screenNdcY, 0]);
  var v2 = transformVec3(inverseTransform, [screenNdcX, screenNdcY, 1]);

  // direction vector from v1 to v2
  var vDir = sub3(v2, v1);

  if (vDir[2] >= 0) // ray would not intersect with the plane
  {
    return;
  }
  /* ray equation for all world-space points 'p' lying on the screen-space NDC position
   * (screenNdcX, screenNdcY) is:  p = v1 + λ*vDirNorm
   * For the intersection with the xy-plane (-> z=0) holds: v1[2] + λ*vDirNorm[2] = p[2] = 0.0.
   * Rearranged, this reads:   */
  var lambda = -v1[2]/vDir[2];
  var pos = add3( v1, mul3scalar(vDir, lambda));

  return [pos[0], pos[1]];  // z==0 
}

/* Returns: the number of screen pixels that would be covered by the tile 
 *          tileZoom/tileX/tileY *if* the screen would not end at the viewport
 *          edges. The intended use of this method is to return a measure of 
 *          how detailed the tile should be rendered.
 * Note: This method does not clip the tile to the viewport. So the number
 *       returned will be larger than the number of screen pixels covered iff.
 *       the tile intersects with a viewport edge. 
 */
function getTileSizeOnScreen(tileX, tileY, tileZoom, viewProjMatrix) {
  var metersPerDegreeLongitude = METERS_PER_DEGREE_LATITUDE * 
                                 Math.cos(APP.position.latitude / 180 * Math.PI);
  var tileLon = tile2lon(tileX, tileZoom);
  var tileLat = tile2lat(tileY, tileZoom);
  
  var modelMatrix = new GLX.Matrix();
  modelMatrix.translate( (tileLon - APP.position.longitude)* metersPerDegreeLongitude,
                        -(tileLat - APP.position.latitude) * METERS_PER_DEGREE_LATITUDE, 0);

  var size = getTileSizeInMeters( APP.position.latitude, tileZoom);
  
  var mvpMatrix = GLX.Matrix.multiply(modelMatrix, viewProjMatrix);
  var tl = transformVec3(mvpMatrix, [0   , 0   , 0]);
  var tr = transformVec3(mvpMatrix, [size, 0   , 0]);
  var bl = transformVec3(mvpMatrix, [0   , size, 0]);
  var br = transformVec3(mvpMatrix, [size, size, 0]);
  var verts = [tl, tr, bl, br];
  for (var i in verts) { 
    // transformation from NDC [-1..1] to viewport [0.. width/height] coordinates
    verts[i][0] = (verts[i][0] + 1.0) / 2.0 * APP.width;
    verts[i][1] = (verts[i][1] + 1.0) / 2.0 * APP.height;
  }
  
  return getConvexQuadArea( [tl, tr, br, bl]);
}

function getTriangleArea(p1, p2, p3) {
  //triangle edge lengths
  var a = len2(sub2( p1, p2));
  var b = len2(sub2( p1, p3));
  var c = len2(sub2( p2, p3));
  
  //Heron's formula
  var s = 0.5 * (a+b+c);
  return Math.sqrt( s * (s-a) * (s-b) * (s-c));
}

function getConvexQuadArea(quad) {
  return getTriangleArea( quad[0], quad[1], quad[2]) + 
         getTriangleArea( quad[0], quad[2], quad[3]);
}

function getTileSizeInMeters( latitude, zoom) {
  return EARTH_CIRCUMFERENCE_IN_METERS * Math.cos(latitude / 180 * Math.PI) / 
         Math.pow(2, zoom);
}

function getPositionFromLocal(localXY) {
  var metersPerDegreeLongitude = METERS_PER_DEGREE_LATITUDE * 
                                 Math.cos(APP.position.latitude / 180 * Math.PI);

  return {
    longitude: APP.position.longitude + localXY[0]/metersPerDegreeLongitude,
    latitude: APP.position.latitude - localXY[1]/METERS_PER_DEGREE_LATITUDE
  };
}

function getTilePositionFromLocal(localXY, zoom) {
  const pos = getPositionFromLocal(localXY);
  return project([pos.longitude,  pos.latitude], 1<<zoom);
}

function project(point, scale = 1) {
  return [
    (point[0]/360 + 0.5) * scale,
    (1-Math.log(Math.tan(point[1] * Math.PI / 180) + 1 / Math.cos(point[1] * Math.PI/180)) / Math.PI)/2 * scale
  ];
}

function tile2lon(x, z) {
  return (x/Math.pow(2,z)*360-180);
}

function tile2lat(y, z) {
  var n = Math.PI-2*Math.PI*y/Math.pow(2,z);
  return (180/Math.PI*Math.atan(0.5*(Math.exp(n)-Math.exp(-n))));
}

function len2(a)   { return Math.sqrt( a[0]*a[0] + a[1]*a[1]);}
function dot2(a,b) { return a[0]*b[0] + a[1]*b[1];}
function sub2(a,b) { return [a[0]-b[0], a[1]-b[1]];}
function add2(a,b) { return [a[0]+b[0], a[1]+b[1]];}
function mul2scalar(a,f) { return [a[0]*f, a[1]*f];}
function norm2(a)  { var l = len2(a); return [a[0]/l, a[1]/l]; }

function dot3(a,b) { return a[0]*b[0] + a[1]*b[1] + a[2]*b[2];}
function sub3(a,b) { return [a[0]-b[0], a[1]-b[1], a[2]-b[2]];}
function add3(a,b) { return [a[0]+b[0], a[1]+b[1], a[2]+b[2]];}
function add3scalar(a,f) { return [a[0]+f, a[1]+f, a[2]+f];}
function mul3scalar(a,f) { return [a[0]*f, a[1]*f, a[2]*f];}
function len3(a)   { return Math.sqrt( a[0]*a[0] + a[1]*a[1] + a[2]*a[2]);}
function squaredLength(a) { return a[0]*a[0] + a[1]*a[1] + a[2]*a[2];}
function norm3(a)  { var l = len3(a); return [a[0]/l, a[1]/l, a[2]/l]; }
function dist3(a,b){ return len3(sub3(a,b));}
function equal3(a, b) { return a[0] === b[0] && a[1] === b[1] && a[2] === b[2];}


class render {

  constructor(){
    this.metersPerDegreeLongitude = METERS_PER_DEGREE_LATITUDE * Math.cos(APP.position.latitude / 180 * Math.PI);
  }

  static getViewQuad () {
    return getViewQuad(this.viewProjMatrix.data,  (this.fogDistance + this.fogBlurDistance), this.viewDirOnMap);
  }

  static start () {
    render.effects = { shadows: true };

    this.metersPerDegreeLongitude = METERS_PER_DEGREE_LATITUDE * Math.cos(APP.position.latitude / 180 * Math.PI);

    // disable effects if they rely on WebGL extensions
    // that the current hardware does not support
    if (!GL.depthTextureExtension) {
      console.warn('Shadows are disabled because your GPU does not support WEBGL_depth_texture');
      render.effects.shadows = false;
    }

    this.setupViewport();

    GL.cullFace(GL.BACK);
    GL.enable(GL.CULL_FACE);
    GL.enable(GL.DEPTH_TEST);

    render.Picking = new Picking(); // renders only on demand
    render.Horizon = new Horizon();
    render.Buildings = new Buildings();
    render.Marker = new MarkerRender();
    render.Basemap = new Basemap();

    render.Overlay.init();
    render.AmbientMap.init();
    render.blurredAmbientMap = new Blur();
    render.MapShadows = new MapShadows();
    if (render.effects.shadows) {
      render.cameraGBuffer = new DepthNormal();
      render.sunGBuffer = new DepthNormal();
    }

    this.speedUp();

    this.renderFrame();
  }

  static renderFrame () {
    if (APP.zoom >= APP.minZoom && APP.zoom <= APP.maxZoom) {
      requestAnimationFrame(() => {

        this.setupViewport();
        this.metersPerDegreeLongitude = METERS_PER_DEGREE_LATITUDE * Math.cos(APP.position.latitude / 180 * Math.PI);
        GL.clearColor(this.fogColor[0], this.fogColor[1], this.fogColor[2], 0.0);
        GL.clear(GL.COLOR_BUFFER_BIT | GL.DEPTH_BUFFER_BIT);

        const viewSize = [APP.width, APP.height];

        if (!render.effects.shadows) {
          render.Buildings.render();
          render.MarkerRender.render();

          GL.enable(GL.BLEND);

          GL.blendFuncSeparate(GL.ONE_MINUS_DST_ALPHA, GL.DST_ALPHA, GL.ONE, GL.ONE);
          GL.disable(GL.DEPTH_TEST);
          render.Horizon.render();
          GL.disable(GL.BLEND);
          GL.enable(GL.DEPTH_TEST);

          render.Basemap.render();
        } else {
          const viewTrapezoid = this.getViewQuad();

          Sun.updateView(viewTrapezoid);
          render.Horizon.updateGeometry(viewTrapezoid);

          render.cameraGBuffer.render(this.viewMatrix, this.projMatrix, viewSize, true);
          render.sunGBuffer.render(Sun.viewMatrix, Sun.projMatrix, [SHADOW_DEPTH_MAP_SIZE, SHADOW_DEPTH_MAP_SIZE]);
          render.AmbientMap.render(render.cameraGBuffer.framebuffer.depthTexture, render.cameraGBuffer.framebuffer.renderTexture, viewSize, 2.0);
          render.blurredAmbientMap.render(render.AmbientMap.framebuffer.renderTexture, viewSize);
          render.Buildings.render(render.sunGBuffer.framebuffer);
          render.Basemap.render();

          GL.enable(GL.BLEND);

          // multiply DEST_COLOR by SRC_COLOR, keep SRC alpha
          // this applies the shadow and SSAO effects (which selectively darken the scene)
          // while keeping the alpha channel (that corresponds to how much the
          // geometry should be blurred into the background in the next step) intact
          GL.blendFuncSeparate(GL.ZERO, GL.SRC_COLOR, GL.ZERO, GL.ONE);

          render.MapShadows.render(Sun, render.sunGBuffer.framebuffer, 0.5);
          render.Overlay.render(render.blurredAmbientMap.framebuffer.renderTexture, viewSize);

          // linear interpolation between the colors of the current framebuffer
          // ( =building geometries) and of the sky. The interpolation factor
          // is the geometry alpha value, which contains the 'foggyness' of each pixel
          // the alpha interpolation functions is set to GL.ONE for both operands
          // to ensure that the alpha channel will become 1.0 for each pixel after this
          // operation, and thus the whole canvas is not rendered partially transparently
          // over its background.
          GL.blendFuncSeparate(GL.ONE_MINUS_DST_ALPHA, GL.DST_ALPHA, GL.ONE, GL.ONE);


          GL.disable(GL.DEPTH_TEST);
          render.Horizon.render();
          GL.enable(GL.DEPTH_TEST);

          GL.disable(GL.BLEND);

          render.Marker.render();

          // render.HudRect.render( render.sunGBuffer.getFogNormalTexture(), config );
        }

        // APP.markers.updateMarkerView();

        if (this.isFast) {
          this.renderFrame();
          // setTimeout(() => {
          //   this.renderFrame();
          // }, 5);
        } else {
          setTimeout(() => {
            this.renderFrame();
          }, 250);
        }

      }); // end requestAnimationFrame()
    }
  }

  // initialize view and projection matrix, fog distance, etc.
  static setupViewport () {
    if (GL.canvas.width !== APP.width) {
      GL.canvas.width = APP.width;
    }
    if (GL.canvas.height !== APP.height) {
      GL.canvas.height = APP.height;
    }

    const
      scale = 1.3567 * Math.pow(2, APP.zoom - 17),
      width = APP.width,
      height = APP.height,
      refHeight = 1024,
      refVFOV = 45;

    GL.viewport(0, 0, width, height);

    this.viewMatrix = new GLX.Matrix()
      .rotateZ(APP.rotation)
      .rotateX(APP.tilt)
      .translate(0, 8 / scale, 0) // corrective offset to match Leaflet's coordinate system (value was determined empirically)
      .translate(0, 0, -1220 / scale); //move away to simulate zoom; -1220 scales APP tiles to ~256px

    this.viewDirOnMap = [Math.sin(APP.rotation / 180 * Math.PI), -Math.cos(APP.rotation / 180 * Math.PI)];

    // First, we need to determine the field-of-view so that our map scale does
    // not change when the viewport size changes. The map scale is given by the
    // 'refFOV' (e.g. 45°) at a WebGL viewport height of 'refHeight' pixels.
    // Since our viewport will not usually be 1024 pixels high, we'll need to
    // find the FOV that corresponds to our viewport height.
    // The half viewport height and half FOV form a leg and the opposite angle
    // of a right triangle (see sketch below). Since the relation between the
    // two is non-linear, we cannot simply scale the reference FOV by the ratio
    // of reference height to actual height to get the desired FOV.
    // But be can use the reference height and reference FOV to determine the
    // virtual distance to the camera and then use that virtual distance to
    // compute the FOV corresponding to the actual height.
    //
    //                   ____/|
    //              ____/     |
    //         ____/          | refHeight/2
    //    ____/  \            |
    //   /refFOV/2|           |
    //  ----------------------|
    //     "virtual distance"
    const virtualDistance = refHeight / (2 * Math.tan((refVFOV / 2) / 180 * Math.PI));
    const verticalFOV = 2 * Math.atan((height / 2.0) / virtualDistance) / Math.PI * 180;

    // OSMBuildings' perspective camera is ... special: The reference point for
    // camera movement, rotation and zoom is at the screen center (as usual).
    // But the center of projection is not at the screen center as well but at
    // the bottom center of the screen. This projection was chosen for artistic
    // reasons so that when the map is seen from straight above, vertical building
    // walls would not be seen to face towards the screen center but would
    // uniformly face downward on the screen.

    // To achieve this projection, we need to
    // 1. shift the whole geometry up half a screen (so that the desired
    //    center of projection aligns with the view center) *in world coordinates*.
    // 2. perform the actual perspective projection (and flip the y coordinate for
    //    internal reasons).
    // 3. shift the geometry back down half a screen now *in screen coordinates*

    this.nearPlane = 1;
    this.farPlane = 30000;

    this.projMatrix = new GLX.Matrix()
      .translate(0, -height / (2.0 * scale), 0) // 0, APP y offset to neutralize camera y offset,
      .scale(1, -1, 1) // flip Y
      .multiply(new GLX.Matrix.Perspective(verticalFOV, width / height, this.nearPlane, this.farPlane))
      .translate(0, -1, 0); // camera y offset

    this.viewProjMatrix = new GLX.Matrix(GLX.Matrix.multiply(this.viewMatrix, this.projMatrix));

    // need to store this as a reference point to determine fog distance
    this.lowerLeftOnMap = getIntersectionWithXYPlane(-1, -1, GLX.Matrix.invert(this.viewProjMatrix.data));
    if (this.lowerLeftOnMap === undefined) {
      return;
    }

    // const lowerLeftDistanceToCenter = len2(this.lowerLeftOnMap);

    // fogDistance: closest distance at which the fog affects the geometry
    // this.fogDistance = Math.max(5000, lowerLeftDistanceToCenter);

    this.fogDistance = 5000;

    // fogBlurDistance: closest distance *beyond* fogDistance at which everything is completely enclosed in fog.
    this.fogBlurDistance = 10000;
  }

  static speedUp () {
    this.isFast = true;
    // console.log('FAST');
    clearTimeout(this.speedTimer);
    this.speedTimer = setTimeout(() => {
      this.isFast = false;
      // console.log('SLOW');
    }, 1000);
  }

  static destroy () {
    render.Picking.destroy();
    render.Horizon.destroy();
    render.Buildings.destroy();
    render.Marker.destroy();
    render.Basemap.destroy();
    render.MapShadows.destroy();

    if (render.cameraGBuffer) {
      render.cameraGBuffer.destroy();
    }

    if (render.sunGBuffer) {
      render.sunGBuffer.destroy();
    }

    render.AmbientMap.destroy();
    render.blurredAmbientMap.destroy();

    clearTimeout(this.speedTimer);
  }
}

// TODO: perhaps render only clicked area
// TODO: no picking if too far, too small (zoom levels)

class Picking {

  constructor () {

    this.size = [512, 512];

    this.shader = new GLX.Shader({
      vertexShader: Shaders.picking.vertex,
      fragmentShader: Shaders.picking.fragment,
      shaderName: 'picking shader',
      attributes: ['aPosition', 'aPickingColor', 'aZScale'],
      uniforms: [
        'uModelMatrix',
        'uMatrix',
        'uFogDistance',
        'uFade',
        'uIndex'
      ]
    });

    this.framebuffer = new GLX.Framebuffer(this.size[0], this.size[1]);
  }

  getTargets (x, y, callback) {
    requestAnimationFrame(() => {
      const shader = this.shader;

      shader.enable();
      this.framebuffer.enable();

      GL.viewport(0, 0, this.size[0], this.size[1]);

      GL.clearColor(0, 0, 0, 1);
      GL.clear(GL.COLOR_BUFFER_BIT | GL.DEPTH_BUFFER_BIT);

      shader.setParam('uFogDistance', '1f', render.fogDistance);

      const renderedItems = [];
      APP.features.forEach(item => {
        if (APP.zoom < item.minZoom || APP.zoom > item.maxZoom) {
          return;
        }

        let modelMatrix = item.getMatrix();
        if (!modelMatrix) {
          return;
        }

        renderedItems.push(item.items);

        shader.setParam('uFade', '1f', item.getFade());
        shader.setParam('uIndex', '1f', renderedItems.length / 256);

        shader.setMatrix('uModelMatrix', '4fv', modelMatrix.data);
        shader.setMatrix('uMatrix', '4fv', GLX.Matrix.multiply(modelMatrix, render.viewProjMatrix));

        shader.setBuffer('aPosition', item.vertexBuffer);
        shader.setBuffer('aPickingColor', item.pickingBuffer);
        shader.setBuffer('aZScale', item.zScaleBuffer);

        GL.drawArrays(GL.TRIANGLES, 0, item.vertexBuffer.numItems);
      });

      shader.disable();
      GL.viewport(0, 0, APP.width, APP.height);

      //***************************************************

      const
        X = x / APP.width * this.size[0] << 0,
        Y = y / APP.height * this.size[1] << 0;

      const imgData = this.framebuffer.getPixel(X, this.size[1] - 1 - Y);
      this.framebuffer.disable();

      if (!imgData) {
        callback();
        return;
      }

      const
        i = imgData[0] - 1,
        f = (imgData[1] | (imgData[2] << 8)) - 1;

      if (!renderedItems[i] || !renderedItems[i][f]) {
        callback();
        return;
      }

      const feature = renderedItems[i][f];
      // callback({ id: feature.id, properties: feature.properties });

      // find related items - across tiles
      const res = { id: feature.id, properties: feature.properties, parts: [] };
      const id = feature.properties.building || feature.id;
      APP.features.forEach(item => {
        item.items.forEach(feature => {
          if (feature.id === id || feature.properties.building === id) {
            res.parts.push({ id: feature.id, properties: feature.properties });
          }
        });
      });

      callback(res);

    }); // end requestAnimationFrame()
  }

  destroy () {
    this.shader.destroy();
    this.framebuffer.destroy();
  }
}

var Sun = {

  setDate: function(date) {
    var pos = suncalc(date, APP.position.latitude, APP.position.longitude);
    this.direction = [
      -Math.sin(pos.azimuth) * Math.cos(pos.altitude),
       Math.cos(pos.azimuth) * Math.cos(pos.altitude),
                               Math.sin(pos.altitude)
    ];

    var rotationInDeg = pos.azimuth / (Math.PI/180);
    var tiltInDeg     = 90 - pos.altitude / (Math.PI/180);

    this.viewMatrix = new GLX.Matrix()
      .rotateZ(rotationInDeg)
      .rotateX(tiltInDeg)
      .translate(0, 0, -5000)
      .scale(1, -1, 1); // flip Y
  },
  
  updateView: function(coveredGroundVertices) {
    // TODO: could parts be pre-calculated?
    this.projMatrix = getCoveringOrthoProjection(
      substituteZCoordinate(coveredGroundVertices, 0.0).concat(substituteZCoordinate(coveredGroundVertices,SHADOW_MAP_MAX_BUILDING_HEIGHT)),
      this.viewMatrix,
      1000,
      7500
    );

    this.viewProjMatrix = new GLX.Matrix(GLX.Matrix.multiply(this.viewMatrix, this.projMatrix));
  }
};


class Buildings {

  constructor () {
    this.shader = !render.effects.shadows ?
      new GLX.Shader({
        vertexShader: Shaders.buildings.vertex,
        fragmentShader: Shaders.buildings.fragment,
        shaderName: 'building shader',
        attributes: ['aPosition', 'aTexCoord', 'aColor', 'aNormal', 'aHeight', 'aTintColor', 'aZScale'],
        uniforms: [
          'uModelMatrix',
          'uViewDirOnMap',
          'uMatrix',
          'uNormalTransform',
          'uLightColor',
          'uLightDirection',
          'uLowerEdgePoint',
          'uFogDistance',
          'uFogBlurDistance',
          'uFade',
          'uWallTexIndex'
        ]
      }) : new GLX.Shader({
      vertexShader: Shaders['buildings_with_shadows'].vertex,
      fragmentShader: Shaders['buildings_with_shadows'].fragment,
      shaderName: 'quality building shader',
      attributes: ['aPosition', 'aTexCoord', 'aColor', 'aNormal', 'aHeight', 'aTintColor', 'aZScale'],
      uniforms: [
        'uFogDistance',
        'uFogBlurDistance',
        'uLightColor',
        'uLightDirection',
        'uLowerEdgePoint',
        'uMatrix',
        'uModelMatrix',
        'uSunMatrix',
        'uShadowTexIndex',
        'uShadowTexDimensions',
        'uFade',
        'uViewDirOnMap',
        'uWallTexIndex'
      ]
    });

    this.wallTexture = new GLX.texture.Image();
    this.wallTexture.color([1,1,1]);
    this.wallTexture.load(BUILDING_TEXTURE);
  }

  render (depthFramebuffer) {
    const shader = this.shader;
    shader.enable();

    // if (this.showBackfaces) {
    //   GL.disable(GL.CULL_FACE);
    // }

    shader.setParam('uFogDistance',     '1f',  render.fogDistance);
    shader.setParam('uFogBlurDistance', '1f',  render.fogBlurDistance);
    shader.setParam('uLightColor',      '3fv', [0.5, 0.5, 0.5]);
    shader.setParam('uLightDirection',  '3fv', Sun.direction);
    shader.setParam('uLowerEdgePoint',  '2fv', render.lowerLeftOnMap);
    shader.setParam('uViewDirOnMap',    '2fv', render.viewDirOnMap);

    if (!render.effects.shadows) {
      shader.setMatrix('uNormalTransform', '3fv', GLX.Matrix.identity3().data);
    }

    shader.setTexture('uWallTexIndex', 0, this.wallTexture);

    if (depthFramebuffer) {
      shader.setParam('uShadowTexDimensions', '2fv', [depthFramebuffer.width, depthFramebuffer.height]);
      shader.setTexture('uShadowTexIndex', 1, depthFramebuffer.depthTexture);
    }

    APP.features.forEach(item => {
      // no visibility check needed, Grid.purge() is taking care
      // TODO: but not for individual objects (and markers)!

      if (APP.zoom < item.minZoom || APP.zoom > item.maxZoom) {
        return;
      }

      const modelMatrix = item.getMatrix();

      if (!modelMatrix) {
        return;
      }

      shader.setParam('uFade', '1f', item.getFade());

      shader.setMatrix('uModelMatrix', '4fv', modelMatrix.data);
      shader.setMatrix('uMatrix',      '4fv', GLX.Matrix.multiply(modelMatrix, render.viewProjMatrix));

      if (render.effects.shadows) {
        shader.setMatrix('uSunMatrix', '4fv', GLX.Matrix.multiply(modelMatrix, Sun.viewProjMatrix));
      }

      shader.setBuffer('aPosition', item.vertexBuffer);
      shader.setBuffer('aTexCoord', item.texCoordBuffer);
      shader.setBuffer('aNormal', item.normalBuffer);
      shader.setBuffer('aColor', item.colorBuffer);
      shader.setBuffer('aHeight', item.heightBuffer);
      shader.setBuffer('aTintColor',  item.tintBuffer);
      shader.setBuffer('aZScale',  item.zScaleBuffer);

      GL.drawArrays(GL.TRIANGLES, 0, item.vertexBuffer.numItems);
    });

    // if (this.showBackfaces) {
    //   GL.enable(GL.CULL_FACE);
    // }

    shader.disable();
  }

  destroy () {}
}


/**
 * This renders shadow for the map layer. It only renders the shadow,
 * not the map itself. Result is used as a blended overlay
 * so that the map can be rendered independently from the shadows cast on it.
 */

class MapShadows {

  constructor () {
    this.shader = new GLX.Shader({
      vertexShader: Shaders['basemap_with_shadows'].vertex,
      fragmentShader: Shaders['basemap_with_shadows'].fragment,
      shaderName: 'map shadows shader',
      attributes: ['aPosition', 'aNormal'],
      uniforms: [
        'uModelMatrix',
        'uViewDirOnMap',
        'uMatrix',
        'uDirToSun',
        'uLowerEdgePoint',
        'uFogDistance',
        'uFogBlurDistance',
        'uShadowTexDimensions', 
        'uShadowStrength',
        'uShadowTexIndex',
        'uSunMatrix',
      ]
    });
    
    this.mapPlane = new MapPlane();
  }

  render (Sun, depthFramebuffer, shadowStrength) {
    const item = this.mapPlane;
    if (APP.zoom < item.minZoom || APP.zoom > item.maxZoom) {
      return;
    }

    const shader = this.shader;

    shader.enable();

    GL.disable(GL.CULL_FACE);

    shader.setParam('uDirToSun', '3fv', Sun.direction);
    shader.setParam('uViewDirOnMap', '2fv',   render.viewDirOnMap);
    shader.setParam('uLowerEdgePoint', '2fv', render.lowerLeftOnMap);
    shader.setParam('uFogDistance', '1f', render.fogDistance);
    shader.setParam('uFogBlurDistance', '1f', render.fogBlurDistance);
    shader.setParam('uShadowTexDimensions', '2fv', [depthFramebuffer.width, depthFramebuffer.height] );
    shader.setParam('uShadowStrength', '1f', shadowStrength);

    shader.setTexture('uShadowTexIndex', 0, depthFramebuffer.depthTexture);

    let modelMatrix;
    if (!(modelMatrix = item.getMatrix())) {
      return;
    }

    shader.setMatrix('uModelMatrix', '4fv', modelMatrix.data);
    shader.setMatrix('uMatrix',      '4fv', GLX.Matrix.multiply(modelMatrix, render.viewProjMatrix));
    shader.setMatrix('uSunMatrix',   '4fv', GLX.Matrix.multiply(modelMatrix, Sun.viewProjMatrix));

    shader.setBuffer('aPosition', item.vertexBuffer);
    shader.setBuffer('aNormal', item.normalBuffer);

    GL.drawArrays(GL.TRIANGLES, 0, item.vertexBuffer.numItems);

    shader.disable();
  }

  destroy () {
    this.mapPlane.destroy();
  }
}


class Basemap {

  constructor () {
    this.shader = new GLX.Shader({
      vertexShader: Shaders.basemap.vertex,
      fragmentShader: Shaders.basemap.fragment,
      shaderName: 'basemap shader',
      attributes: ['aPosition', 'aTexCoord'],
      uniforms: ['uViewMatrix', 'uModelMatrix', 'uTexIndex', 'uFogDistance', 'uFogBlurDistance', 'uLowerEdgePoint', 'uViewDirOnMap']
    });
  }

  render () {
    const layer = APP.basemapGrid;

    if (!layer) {
      return;
    }

    if (APP.zoom < layer.minZoom || APP.zoom > layer.maxZoom) {
      return;
    }

    const shader = this.shader;

    shader.enable();

    shader.setParam('uFogDistance',     '1f',  render.fogDistance);
    shader.setParam('uFogBlurDistance', '1f',  render.fogBlurDistance);
    shader.setParam('uLowerEdgePoint',  '2fv', render.lowerLeftOnMap);
    shader.setParam('uViewDirOnMap',    '2fv', render.viewDirOnMap);

    const zoom = Math.round(APP.zoom);

    let tile;
    for (let key in layer.visibleTiles) { // TODO: do not refer to layer.visibleTiles
      tile = layer.tiles[key];

      if (tile && tile.isReady) {
        this.renderTile(tile);
        continue;
      }

      const parentKey = [tile.x/2<<0, tile.y/2<<0, zoom-1].join(',');
      if (layer.tiles[parentKey] && layer.tiles[parentKey].isReady) {
        // TODO: there will be overlap with adjacent tiles or parents of adjacent tiles!
        this.renderTile(layer.tiles[parentKey]);
        continue;
      }

      const children = [
        [tile.x*2,   tile.y*2,   tile.zoom+1].join(','),
        [tile.x*2+1, tile.y*2,   tile.zoom+1].join(','),
        [tile.x*2,   tile.y*2+1, tile.zoom+1].join(','),
        [tile.x*2+1, tile.y*2+1, tile.zoom+1].join(',')
      ];

      for (let i = 0; i < 4; i++) {
        if (layer.tiles[ children[i] ] && layer.tiles[ children[i] ].isReady) {
          this.renderTile(layer.tiles[ children[i] ]);
        }
      }
    }

    shader.disable();
  }

  renderTile (tile) {
    const shader = this.shader;

    const metersPerDegreeLongitude = METERS_PER_DEGREE_LATITUDE * Math.cos(APP.position.latitude / 180 * Math.PI);

    const modelMatrix = new GLX.Matrix();

    modelMatrix.translate( (tile.longitude- APP.position.longitude)* metersPerDegreeLongitude,
                          -(tile.latitude - APP.position.latitude) * METERS_PER_DEGREE_LATITUDE, 0);

    GL.enable(GL.POLYGON_OFFSET_FILL);
    GL.polygonOffset(MAX_USED_ZOOM_LEVEL - tile.zoom, MAX_USED_ZOOM_LEVEL - tile.zoom);

    shader.setMatrix('uModelMatrix', '4fv', modelMatrix.data);
    shader.setMatrix('uViewMatrix',  '4fv', GLX.Matrix.multiply(modelMatrix, render.viewProjMatrix));

    shader.setBuffer('aPosition', tile.vertexBuffer);
    shader.setBuffer('aTexCoord', tile.texCoordBuffer);
    shader.setTexture('uTexIndex', 0, tile.texture);

    GL.drawArrays(GL.TRIANGLE_STRIP, 0, tile.vertexBuffer.numItems);
    GL.disable(GL.POLYGON_OFFSET_FILL);
  }

  destroy () {}
}


/* 'HudRect' renders a textured rectangle to the top-right quarter of the viewport.
   The intended use is visualize render-to-texture effects during development.
 */
render.HudRect = {

  init: function() {
  
    var geometry = this.createGeometry();
    this.vertexBuffer   = new GLX.Buffer(3, new Float32Array(geometry.vertices));
    this.texCoordBuffer = new GLX.Buffer(2, new Float32Array(geometry.texCoords));

    this.shader = new GLX.Shader({
      vertexShader: Shaders.texture.vertex,
      fragmentShader: Shaders.texture.fragment,
      shaderName: 'HUD rectangle shader',
      attributes: ['aPosition', 'aTexCoord'],
      uniforms: [ 'uMatrix', 'uTexIndex']
    });
  },

  createGeometry: function() {
    var vertices = [],
        texCoords= [];
    vertices.push(0, 0, 1E-5,
                  1, 0, 1E-5,
                  1, 1, 1E-5);
    
    vertices.push(0, 0, 1E-5,
                  1, 1, 1E-5,
                  0, 1, 1E-5);

    texCoords.push(0.5,0.5,
                   1.0,0.5,
                   1.0,1.0);

    texCoords.push(0.5,0.5,
                   1.0,1.0,
                   0.5,1.0);

    return { vertices: vertices , texCoords: texCoords };
  },

  render: function(texture) {
    var shader = this.shader;

    shader.enable();
    
    GL.uniformMatrix4fv(shader.uniforms.uMatrix, false, GLX.Matrix.identity().data);
    this.vertexBuffer.enable();

    GL.vertexAttribPointer(shader.attributes.aPosition, this.vertexBuffer.itemSize, GL.FLOAT, false, 0, 0);

    this.texCoordBuffer.enable();
    GL.vertexAttribPointer(shader.attributes.aTexCoord, this.texCoordBuffer.itemSize, GL.FLOAT, false, 0, 0);

    texture.enable(0);
    GL.uniform1i(shader.uniforms.uTexIndex, 0);

    GL.drawArrays(GL.TRIANGLES, 0, this.vertexBuffer.numItems);

    shader.disable();
  },

  destroy: function() {}
};


// Renders the depth buffer and normals into textures.
// Depth is stored as a 24bit depth texture using the WEBGL_depth_texture extension,
// and normals are stored as the 'rgb' and 'a' of a shared 32bit texture.
// Note that there is no dedicated shader to create the depth texture. Rather,
// the depth buffer used by the GPU in depth testing while rendering the normals
// to a dedicated texture.

class DepthNormal {

  constructor () {
    this.shader = new GLX.Shader({
      vertexShader: Shaders.depth_normal.vertex,
      fragmentShader: Shaders.depth_normal.fragment,
      shaderName: 'depth/normal shader',
      attributes: ['aPosition', 'aNormal', 'aZScale'],
      uniforms: ['uMatrix', 'uModelMatrix', 'uNormalMatrix', 'uFade', 'uFogDistance', 'uFogBlurDistance', 'uViewDirOnMap', 'uLowerEdgePoint']
    });

    this.framebuffer = new GLX.Framebuffer(128, 128, /*depthTexture=*/true); // dummy sizes, will be resized dynamically
    this.mapPlane = new MapPlane();
  }

  render (viewMatrix, projMatrix, framebufferSize) {
    const
      shader = this.shader,
      framebuffer = this.framebuffer,
      viewProjMatrix = new GLX.Matrix(GLX.Matrix.multiply(viewMatrix, projMatrix));

    framebuffer.setSize(framebufferSize[0], framebufferSize[1]);

    shader.enable();
    framebuffer.enable();

    GL.viewport(0, 0, framebufferSize[0], framebufferSize[1]);

    GL.clearColor(0.0, 0.0, 0.0, 1);
    GL.clear(GL.COLOR_BUFFER_BIT | GL.DEPTH_BUFFER_BIT);

    shader.setParam('uViewDirOnMap', '2fv', render.viewDirOnMap);
    shader.setParam('uLowerEdgePoint', '2fv', render.lowerLeftOnMap);
    shader.setParam('uFogDistance', '1f', render.fogDistance);
    shader.setParam('uFogBlurDistance', '1f', render.fogBlurDistance);

    // render all data items, but also a dummy map plane
    // Note: SSAO on the map plane has been disabled temporarily TODO: check

    const features = APP.features.items.concat([this.mapPlane]);

    features.forEach(item => {
      if (APP.zoom < item.minZoom || APP.zoom > item.maxZoom) {
        return;
      }

      const modelMatrix = item.getMatrix();

      if (!modelMatrix) {
        return;
      }

      shader.setParam('uFade', '1f', item.getFade());

      shader.setMatrix('uMatrix', '4fv', GLX.Matrix.multiply(modelMatrix, viewProjMatrix));
      shader.setMatrix('uModelMatrix', '4fv', modelMatrix.data);
      shader.setMatrix('uNormalMatrix', '3fv', GLX.Matrix.transpose3(GLX.Matrix.invert3(GLX.Matrix.multiply(modelMatrix, viewMatrix))));

      shader.setBuffer('aPosition', item.vertexBuffer);
      shader.setBuffer('aNormal', item.normalBuffer);
      shader.setBuffer('aZScale', item.zScaleBuffer);

      GL.drawArrays(GL.TRIANGLES, 0, item.vertexBuffer.numItems);
    });

    shader.disable();
    framebuffer.disable();

    GL.viewport(0, 0, APP.width, APP.height);
  }

  destroy () {
    this.shader.destroy();
    this.framebuffer.destroy();
    this.mapPlane.destroy();
  }
}


render.AmbientMap = {

  init: function() {
    this.shader = new GLX.Shader({
      vertexShader:   Shaders.ambient_from_depth.vertex,
      fragmentShader: Shaders.ambient_from_depth.fragment,
      shaderName: 'SSAO shader',
      attributes: ['aPosition', 'aTexCoord'],
      uniforms: ['uInverseTexSize', 'uNearPlane', 'uFarPlane', 'uDepthTexIndex', 'uFogTexIndex', 'uEffectStrength']
    });

    this.framebuffer = new GLX.Framebuffer(128, 128); //dummy value, size will be set dynamically
    
    this.vertexBuffer = new GLX.Buffer(3, new Float32Array([
      -1, -1, 1E-5,
       1, -1, 1E-5,
       1,  1, 1E-5,
      -1, -1, 1E-5,
       1,  1, 1E-5,
      -1,  1, 1E-5
    ]));
       
    this.texCoordBuffer = new GLX.Buffer(2, new Float32Array([
      0,0,
      1,0,
      1,1,
      0,0,
      1,1,
      0,1
    ]));
  },

  render: function(depthTexture, fogTexture, framebufferSize, effectStrength) {

    var
      shader = this.shader,
      framebuffer = this.framebuffer;

    if (effectStrength === undefined) {
      effectStrength = 1.0;
    }

    framebuffer.setSize( framebufferSize[0], framebufferSize[1] );

    GL.viewport(0, 0, framebufferSize[0], framebufferSize[1]);
    shader.enable();
    framebuffer.enable();

    GL.clearColor(1.0, 0.0, 0.0, 1);
    GL.clear(GL.COLOR_BUFFER_BIT | GL.DEPTH_BUFFER_BIT);

    shader.setParam('uInverseTexSize', '2fv', [1/framebufferSize[0], 1/framebufferSize[1]]);
    shader.setParam('uEffectStrength', '1f',  effectStrength);
    shader.setParam('uNearPlane',      '1f',  render.nearPlane);
    shader.setParam('uFarPlane',       '1f',  render.farPlane);

    shader.setBuffer('aPosition', this.vertexBuffer);
    shader.setBuffer('aTexCoord', this.texCoordBuffer);

    shader.setTexture('uDepthTexIndex', 0, depthTexture);
    shader.setTexture('uFogTexIndex',   1, fogTexture);

    GL.drawArrays(GL.TRIANGLES, 0, this.vertexBuffer.numItems);

    shader.disable();
    framebuffer.disable();

    GL.viewport(0, 0, APP.width, APP.height);

  },

  destroy: function() {}
};


/* 'Overlay' renders part of a texture over the whole viewport.
   The intended use is for compositing of screen-space effects.
 */
render.Overlay = {

  init: function() {
  
    const geometry = this.createGeometry();
    this.vertexBuffer   = new GLX.Buffer(3, new Float32Array(geometry.vertices));
    this.texCoordBuffer = new GLX.Buffer(2, new Float32Array(geometry.texCoords));

    this.shader = new GLX.Shader({
      vertexShader: Shaders.texture.vertex,
      fragmentShader: Shaders.texture.fragment,
      shaderName: 'overlay texture shader',
      attributes: ['aPosition', 'aTexCoord'],
      uniforms: ['uMatrix', 'uTexIndex']
    });
  },

  createGeometry: function() {
    const vertices = [],
        texCoords= [];
    vertices.push(-1,-1, 1E-5,
                   1,-1, 1E-5,
                   1, 1, 1E-5);
    
    vertices.push(-1,-1, 1E-5,
                   1, 1, 1E-5,
                  -1, 1, 1E-5);

    texCoords.push(0.0,0.0,
                   1.0,0.0,
                   1.0,1.0);

    texCoords.push(0.0,0.0,
                   1.0,1.0,
                   0.0,1.0);

    return { vertices: vertices , texCoords: texCoords };
  },

  render: function(texture, framebufferSize) {

    const shader = this.shader;

    shader.enable();
    /* we are rendering an *overlay*, which is supposed to be rendered on top of the
     * scene no matter what its actual depth is. */
    GL.disable(GL.DEPTH_TEST);
    
    shader.setMatrix('uMatrix', '4fv', GLX.Matrix.identity().data);

    shader.setBuffer('aPosition', this.vertexBuffer);
    shader.setBuffer('aTexCoord', this.texCoordBuffer);

    shader.setTexture('uTexIndex', 0, texture);

    GL.drawArrays(GL.TRIANGLES, 0, this.vertexBuffer.numItems);

    GL.enable(GL.DEPTH_TEST);
    shader.disable();
  },

  destroy: function() {}
};


class Horizon {

  constructor () {
    this.HORIZON_HEIGHT = 2000;

    this.skyShader = new GLX.Shader({
      vertexShader: Shaders.horizon.vertex,
      fragmentShader: Shaders.horizon.fragment,
      shaderName: 'sky wall shader',
      attributes: ['aPosition'],
      uniforms: ['uAbsoluteHeight', 'uMatrix', 'uFogColor']
    });

    this.v1 = this.v2 = this.v3 = this.v4 = [false, false, false];
    this.updateGeometry([[0, 0, 0], [0, 0, 0], [0, 0, 0], [0, 0, 0]]);

    this.floorShader = new GLX.Shader({
      vertexShader: Shaders.flat_color.vertex,
      fragmentShader: Shaders.flat_color.fragment,
      attributes: ['aPosition'],
      uniforms: ['uColor', 'uMatrix']
    });
  }

  updateGeometry (viewTrapezoid) {
    let
      v1 = [viewTrapezoid[3][0], viewTrapezoid[3][1], 0.0],
      v2 = [viewTrapezoid[2][0], viewTrapezoid[2][1], 0.0],
      v3 = [viewTrapezoid[2][0], viewTrapezoid[2][1], this.HORIZON_HEIGHT],
      v4 = [viewTrapezoid[3][0], viewTrapezoid[3][1], this.HORIZON_HEIGHT];

    if (
      equal3(v1, this.v1) &&
      equal3(v2, this.v2) &&
      equal3(v3, this.v3) &&
      equal3(v4, this.v4)) {
      return; //still up-to-date
    }

    this.v1 = v1;
    this.v2 = v2;
    this.v3 = v3;
    this.v4 = v4;

    if (this.skyVertexBuffer) {
      this.skyVertexBuffer.destroy();
    }

    const vertices = [...v1, ...v2, ...v3, ...v1, ...v3, ...v4];
    this.skyVertexBuffer = new GLX.Buffer(3, new Float32Array(vertices));

    v1 = [viewTrapezoid[0][0], viewTrapezoid[0][1], 1];
    v2 = [viewTrapezoid[1][0], viewTrapezoid[1][1], 1];
    v3 = [viewTrapezoid[2][0], viewTrapezoid[2][1], 1];
    v4 = [viewTrapezoid[3][0], viewTrapezoid[3][1], 1];

    if (this.floorVertexBuffer) {
      this.floorVertexBuffer.destroy();
    }

    this.floorVertexBuffer = new GLX.Buffer(3, new Float32Array([...v1, ...v2, ...v3, ...v4]));
  }

  render () {
    const
      skyShader = this.skyShader,
      floorShader = this.floorShader,
      fogColor = render.fogColor;

    skyShader.enable();

    skyShader.setParam('uFogColor', '3fv', fogColor);
    skyShader.setParam('uAbsoluteHeight', '1f', this.HORIZON_HEIGHT * 10.0);
    skyShader.setMatrix('uMatrix', '4fv', render.viewProjMatrix.data);
    skyShader.setBuffer('aPosition', this.skyVertexBuffer);

    GL.drawArrays(GL.TRIANGLES, 0, this.skyVertexBuffer.numItems);
    
    skyShader.disable();

    
    floorShader.enable();

    floorShader.setParam('uColor', '4fv', [...fogColor, 1.0]);
    floorShader.setMatrix('uMatrix', '4fv', render.viewProjMatrix.data);
    floorShader.setBuffer('aPosition', this.floorVertexBuffer);

    GL.drawArrays(GL.TRIANGLE_FAN, 0, this.floorVertexBuffer.numItems);

    floorShader.disable();
  }

  destroy () {
    this.skyVertexBuffer.destroy();
    this.skyShader.destroy();

    this.floorVertexBuffer.destroy();
    this.floorShader.destroy();
  }
}

class Blur {

  constructor () {
    this.shader = new GLX.Shader({
      vertexShader: Shaders.blur.vertex,
      fragmentShader: Shaders.blur.fragment,
      shaderName: 'blur shader',
      attributes: ['aPosition', 'aTexCoord'],
      uniforms: ['uInverseTexSize', 'uTexIndex']
    });

    this.framebuffer = new GLX.Framebuffer(128, 128); // dummy value, size will be set dynamically

    this.vertexBuffer = new GLX.Buffer(3, new Float32Array([
      -1, -1, 1E-5,
      1, -1, 1E-5,
      1, 1, 1E-5,
      -1, -1, 1E-5,
      1, 1, 1E-5,
      -1, 1, 1E-5
    ]));

    this.texCoordBuffer = new GLX.Buffer(2, new Float32Array([
      0, 0,
      1, 0,
      1, 1,
      0, 0,
      1, 1,
      0, 1
    ]));
  }

  render (texture, size) {
    this.framebuffer.setSize(size[0], size[1]);
    GL.viewport(0, 0, size[0], size[1]);

    this.shader.enable();
    this.framebuffer.enable();

    GL.clearColor(1, 0, 0, 1);
    GL.clear(GL.COLOR_BUFFER_BIT | GL.DEPTH_BUFFER_BIT);

    this.shader.setParam('uInverseTexSize', '2fv', [1 / this.framebuffer.width, 1 / this.framebuffer.height]);

    this.shader.setBuffer('aPosition', this.vertexBuffer);
    this.shader.setBuffer('aTexCoord', this.texCoordBuffer);

    this.shader.setTexture('uTexIndex', 0, texture);

    GL.drawArrays(GL.TRIANGLES, 0, this.vertexBuffer.numItems);

    this.shader.disable();
    this.framebuffer.disable();

    GL.viewport(0, 0, APP.width, APP.height);
  }

  destroy () {
    this.shader.destroy();
    this.framebuffer.destroy();
    this.vertexBuffer.destroy();
    this.texCoordBuffer.destroy();
  }
}

// TODO: handle multiple markers
// A: cluster them into 'tiles' that give close reference point and allow simpler visibility tests or
// B: handle them as individual objects

class MarkerRender {

  constructor () {

    this.shader = new GLX.Shader({
      vertexShader: Shaders.marker.vertex,
      fragmentShader: Shaders.marker.fragment,
      shaderName: 'marker shader',
      attributes: ['aPosition', 'aTexCoord'], //
      uniforms: [
        'uProjMatrix',
        'uViewMatrix',
        'uModelMatrix',
        'uTexIndex',
        'markerSize'
      ]
    });
  }

  render () {
    const shader = this.shader;

    shader.enable();

    const metersPerDegreeLongitude = render.metersPerDegreeLongitude;

    GL.disable(GL.DEPTH_TEST);
    GL.enable(GL.BLEND);
    GL.blendFunc(GL.SRC_ALPHA, GL.ONE_MINUS_SRC_ALPHA);

    APP.markers.forEach(item => {
      if (!item.isReady) {
        return;
      }

      const modelMatrix = new GLX.Matrix();
      modelMatrix.translate(
        (item.position.longitude - APP.position.longitude) * metersPerDegreeLongitude,
        -(item.position.latitude - APP.position.latitude) * METERS_PER_DEGREE_LATITUDE,
        item.elevation
      );

      shader.setParam('markerSize', '1f', item.size);
      shader.setMatrix('uProjMatrix', '4fv', render.projMatrix.data);
      shader.setMatrix('uViewMatrix', '4fv', render.viewMatrix.data);
      shader.setMatrix('uModelMatrix', '4fv', modelMatrix.data);
      shader.setBuffer('aPosition', item.vertexBuffer);

      shader.setBuffer('aTexCoord', item.texCoordBuffer);
      shader.setTexture('uTexIndex', 0, item.texture);

      GL.drawArrays(GL.TRIANGLES, 0, item.vertexBuffer.numItems);
    });

    GL.disable(GL.BLEND);
    GL.enable(GL.DEPTH_TEST);

    shader.disable();
  }

  destroy () {
    this.shader.destroy();
  }
}
}());