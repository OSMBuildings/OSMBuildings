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

/**
 * @param str, object can be in any of these: 'red', '#0099ff', 'rgb(64, 128, 255)', 'rgba(64, 128, 255, 0.5)', { r:0.2, g:0.3, b:0.9, a:1 }
 */
var Qolor = function(r, g, b, a) {
  this.r = clamp(r, 1);
  this.g = clamp(g, 1);
  this.b = clamp(b, 1);
  this.a = clamp(a, 1) || 1;

  this.isValid = this.r !== undefined && this.g !== undefined && this.b !== undefined;
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

Qolor.fromHSL = function(h, s, l, a) {
  // h = clamp(h, 360),
  // s = clamp(s, 1),
  // l = clamp(l, 1),

  // achromatic
  if (s === 0) {
    return new Qolor(l, l, l, a);
  }

  var
    q = l<0.5 ? l*(1 + s) : l + s - l*s,
    p = 2*l - q;

  h /= 360;

  return new Qolor(
    hue2rgb(p, q, h + 1/3),
    hue2rgb(p, q, h),
    hue2rgb(p, q, h - 1/3),
    a
  );
};

Qolor.prototype = {

  toHSL: function() {
    if (!this.isValid) {
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

    return { h: h, s: s, l: l, a: this.a };
  },

  toString: function() {
    if (!this.isValid) {
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
    return Qolor.fromHSL(hsl.h+h, hsl.s, hsl.l);
  },

  saturation: function(s) {
    var hsl = this.toHSL();
    return Qolor.fromHSL(hsl.h, hsl.s*s, hsl.l);
  },

  lightness: function(l) {
    var hsl = this.toHSL();
    return Qolor.fromHSL(hsl.h, hsl.s, hsl.l*l);
  },

  red: function(r) {
    return new Qolor(this.r*r, this.g, this.b, this.a);
  },

  green: function(g) {
    return new Qolor(this.r, this.g*g, this.b, this.a);
  },

  blue: function(b) {
    return new Qolor(this.r, this.g, this.b*b, this.a);
  },

  alpha: function(a) {
    return new Qolor(this.r, this.g, this.b, this.a*a);
  },

  copy: function() {
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


var Shaders = {"picking":{"vertex":"precision highp float;  //is default in vertex shaders anyway, using highp fixes #49\n#define halfPi 1.57079632679\nattribute vec4 aPosition;\nattribute vec3 aId;\nattribute vec4 aFilter;\nuniform mat4 uModelMatrix;\nuniform mat4 uMatrix;\nuniform float uFogRadius;\nuniform float uTime;\nvarying vec4 vColor;\nvoid main() {\n  float t = clamp((uTime-aFilter.r) / (aFilter.g-aFilter.r), 0.0, 1.0);\n  float f = aFilter.b + (aFilter.a-aFilter.b) * t;\n  if (f == 0.0) {\n    gl_Position = vec4(0.0, 0.0, 0.0, 0.0);\n    vColor = vec4(0.0, 0.0, 0.0, 0.0);\n  } else {\n    vec4 pos = vec4(aPosition.x, aPosition.y, aPosition.z*f, aPosition.w);\n    gl_Position = uMatrix * pos;\n    vec4 mPosition = vec4(uModelMatrix * pos);\n    float distance = length(mPosition);\n    if (distance > uFogRadius) {\n      vColor = vec4(0.0, 0.0, 0.0, 0.0);\n    } else {\n      vColor = vec4(aId, 1.0);\n    }\n  }\n}\n","fragment":"#ifdef GL_ES\n  precision mediump float;\n#endif\nvarying vec4 vColor;\nvoid main() {\n  gl_FragColor = vColor;\n}\n"},"buildings":{"vertex":"precision highp float;  //is default in vertex shaders anyway, using highp fixes #49\n#define halfPi 1.57079632679\nattribute vec4 aPosition;\nattribute vec2 aTexCoord;\nattribute vec3 aNormal;\nattribute vec3 aColor;\nattribute vec3 aId;\nattribute vec4 aFilter;\nattribute float aHeight;\nuniform mat4 uModelMatrix;\nuniform mat4 uMatrix;\nuniform mat3 uNormalTransform;\nuniform vec3 uLightDirection;\nuniform vec3 uLightColor;\nuniform vec3 uHighlightColor;\nuniform vec3 uHighlightId;\nuniform vec2 uViewDirOnMap;\nuniform vec2 uLowerEdgePoint;\nuniform float uTime;\nvarying vec3 vColor;\nvarying vec2 vTexCoord;\nvarying float verticalDistanceToLowerEdge;\nconst float gradientStrength = 0.4;\nvoid main() {\n  float t = clamp((uTime-aFilter.r) / (aFilter.g-aFilter.r), 0.0, 1.0);\n  float f = aFilter.b + (aFilter.a-aFilter.b) * t;\n  if (f == 0.0) {\n    gl_Position = vec4(0.0, 0.0, 0.0, 0.0);\n    vColor = vec3(0.0, 0.0, 0.0);\n  } else {\n    vec4 pos = vec4(aPosition.x, aPosition.y, aPosition.z*f, aPosition.w);\n    gl_Position = uMatrix * pos;\n    //*** highlight object ******************************************************\n    vec3 color = aColor;\n    if (uHighlightId == aId) {\n      color = mix(aColor, uHighlightColor, 0.5);\n    }\n    //*** light intensity, defined by light direction on surface ****************\n    vec3 transformedNormal = aNormal * uNormalTransform;\n    float lightIntensity = max( dot(transformedNormal, uLightDirection), 0.0) / 1.5;\n    color = color + uLightColor * lightIntensity;\n    vTexCoord = aTexCoord;\n    //*** vertical shading ******************************************************\n    float verticalShading = clamp(gradientStrength - ((pos.z*gradientStrength) / aHeight), 0.0, gradientStrength);\n    //***************************************************************************\n    vColor = color-verticalShading;\n    vec4 worldPos = uModelMatrix * pos;\n    vec2 dirFromLowerEdge = worldPos.xy / worldPos.w - uLowerEdgePoint;\n    verticalDistanceToLowerEdge = dot(dirFromLowerEdge, uViewDirOnMap);\n  }\n}\n","fragment":"#ifdef GL_ES\n  precision mediump float;\n#endif\nvarying vec3 vColor;\nvarying vec2 vTexCoord;\nvarying float verticalDistanceToLowerEdge;\nuniform vec3 uFogColor;\nuniform float uFogDistance;\nuniform float uFogBlurDistance;\nuniform sampler2D uWallTexIndex;\nvoid main() {\n    \n  float fogIntensity = (verticalDistanceToLowerEdge - uFogDistance) / uFogBlurDistance;\n  fogIntensity = clamp(fogIntensity, 0.0, 1.0);\n  gl_FragColor = vec4( vColor* texture2D(uWallTexIndex, vTexCoord).rgb, 1.0-fogIntensity);\n}\n"},"buildings.shadows":{"vertex":"precision highp float;  //is default in vertex shaders anyway, using highp fixes #49\n#define halfPi 1.57079632679\nattribute vec4 aPosition;\nattribute vec3 aNormal;\nattribute vec3 aColor;\nattribute vec2 aTexCoord;\nattribute vec3 aId;\nattribute vec4 aFilter;\nattribute float aHeight;\nuniform mat4 uModelMatrix;\nuniform mat4 uMatrix;\nuniform mat4 uSunMatrix;\nuniform mat3 uNormalTransform;\nuniform vec3 uHighlightColor;\nuniform vec3 uHighlightId;\nuniform vec2 uViewDirOnMap;\nuniform vec2 uLowerEdgePoint;\nuniform float uTime;\nvarying vec3 vColor;\nvarying vec2 vTexCoord;\nvarying vec3 vNormal;\nvarying vec3 vSunRelPosition;\nvarying float verticalDistanceToLowerEdge;\nfloat gradientStrength = 0.4;\nvoid main() {\n  float t = clamp((uTime-aFilter.r) / (aFilter.g-aFilter.r), 0.0, 1.0);\n  float f = aFilter.b + (aFilter.a-aFilter.b) * t;\n  if (f == 0.0) {\n    gl_Position = vec4(0.0, 0.0, 0.0, 0.0);\n    vColor = vec3(0.0, 0.0, 0.0);\n  } else {\n    vec4 pos = vec4(aPosition.x, aPosition.y, aPosition.z*f, aPosition.w);\n    gl_Position = uMatrix * pos;\n    //*** highlight object ******************************************************\n    vec3 color = aColor;\n    if (uHighlightId == aId) {\n      color = mix(aColor, uHighlightColor, 0.5);\n    }\n    //*** light intensity, defined by light direction on surface ****************\n    vNormal = aNormal;\n    vTexCoord = aTexCoord;\n    //vec3 transformedNormal = aNormal * uNormalTransform;\n    //float lightIntensity = max( dot(aNormal, uLightDirection), 0.0) / 1.5;\n    //color = color + uLightColor * lightIntensity;\n    //*** vertical shading ******************************************************\n    float verticalShading = clamp(gradientStrength - ((pos.z*gradientStrength) / aHeight), 0.0, gradientStrength);\n    //***************************************************************************\n    vColor = color-verticalShading;\n    vec4 worldPos = uModelMatrix * pos;\n    vec2 dirFromLowerEdge = worldPos.xy / worldPos.w - uLowerEdgePoint;\n    verticalDistanceToLowerEdge = dot(dirFromLowerEdge, uViewDirOnMap);\n    \n    // *** shadow mapping ********\n    vec4 sunRelPosition = uSunMatrix * pos;\n    vSunRelPosition = (sunRelPosition.xyz / sunRelPosition.w + 1.0) / 2.0;\n  }\n}\n","fragment":"\n#ifdef GL_FRAGMENT_PRECISION_HIGH\n  precision highp float;\n#else\n  precision mediump float;\n#endif\nvarying vec2 vTexCoord;\nvarying vec3 vColor;\nvarying vec3 vNormal;\nvarying vec3 vSunRelPosition;\nvarying float verticalDistanceToLowerEdge;\nuniform vec3 uFogColor;\nuniform vec2 uShadowTexDimensions;\nuniform sampler2D uShadowTexIndex;\nuniform sampler2D uWallTexIndex;\nuniform float uFogDistance;\nuniform float uFogBlurDistance;\nuniform float uShadowStrength;\nuniform vec3 uLightDirection;\nuniform vec3 uLightColor;\nfloat isSeenBySun(const vec2 sunViewNDC, const float depth, const float bias) {\n  if ( clamp( sunViewNDC, 0.0, 1.0) != sunViewNDC)  //not inside sun's viewport\n    return 1.0;\n  \n  float depthFromTexture = texture2D( uShadowTexIndex, sunViewNDC.xy).x;\n  \n  //compare depth values not in reciprocal but in linear depth\n  return step(1.0/depthFromTexture, 1.0/depth + bias);\n}\nvoid main() {\n  vec3 normal = normalize(vNormal); //may degenerate during per-pixel interpolation\n  float diffuse = dot(uLightDirection, normal);\n  diffuse = max(diffuse, 0.0);\n  // reduce shadow strength with:\n  // - lowering sun positions, to be consistent with the shadows on the basemap (there,\n  //   shadows are faded out with lowering sun positions to hide shadow artifacts caused\n  //   when sun direction and map surface are almost perpendicular\n  // - large angles between the sun direction and the surface normal, to hide shadow\n  //   artifacts that occur when surface normal and sun direction are almost perpendicular\n  float shadowStrength = pow( max( min(\n    dot(uLightDirection, vec3(0.0, 0.0, 1.0)),\n    dot(uLightDirection, normal)\n  ), 0.0), 1.5);\n  if (diffuse > 0.0 && shadowStrength > 0.0) {\n    // note: the diffuse term is also the cosine between the surface normal and the\n    // light direction\n    float bias = clamp(0.0007*tan(acos(diffuse)), 0.0, 0.01);\n    vec2 pos = fract( vSunRelPosition.xy * uShadowTexDimensions);\n    \n    vec2 tl = floor(vSunRelPosition.xy * uShadowTexDimensions) / uShadowTexDimensions;\n    float tlVal = isSeenBySun( tl,                           vSunRelPosition.z, bias);\n    float trVal = isSeenBySun( tl + vec2(1.0, 0.0) / uShadowTexDimensions, vSunRelPosition.z, bias);\n    float blVal = isSeenBySun( tl + vec2(0.0, 1.0) / uShadowTexDimensions, vSunRelPosition.z, bias);\n    float brVal = isSeenBySun( tl + vec2(1.0, 1.0) / uShadowTexDimensions, vSunRelPosition.z, bias);\n    float occludedBySun = mix( \n                            mix(tlVal, trVal, pos.x), \n                            mix(blVal, brVal, pos.x),\n                            pos.y);\n    diffuse *= 1.0 - (shadowStrength * (1.0 - occludedBySun));\n  }\n  vec3 color = vColor* texture2D( uWallTexIndex, vTexCoord.st).rgb +\n              (diffuse/1.5) * uLightColor;\n  float fogIntensity = (verticalDistanceToLowerEdge - uFogDistance) / uFogBlurDistance;\n  fogIntensity = clamp(fogIntensity, 0.0, 1.0);\n  //gl_FragColor = vec4( mix(color, uFogColor, fogIntensity), 1.0);\n  gl_FragColor = vec4( color, 1.0-fogIntensity);\n}\n"},"flatColor":{"vertex":"precision highp float;  //is default in vertex shaders anyway, using highp fixes #49\nattribute vec4 aPosition;\nuniform mat4 uMatrix;\nvoid main() {\n  gl_Position = uMatrix * aPosition;\n}\n","fragment":"#ifdef GL_ES\n  precision mediump float;\n#endif\nuniform vec4 uColor;\nvoid main() {\n  gl_FragColor = uColor;\n}\n"},"skywall":{"vertex":"precision highp float;  //is default in vertex shaders anyway, using highp fixes #49\n#define halfPi 1.57079632679\nattribute vec4 aPosition;\nattribute vec2 aTexCoord;\nuniform mat4 uMatrix;\nuniform float uAbsoluteHeight;\nvarying vec2 vTexCoord;\nvarying float vRelativeHeight;\nconst float gradientHeight = 10.0;\nconst float gradientStrength = 1.0;\nvoid main() {\n  gl_Position = uMatrix * aPosition;\n  vTexCoord = aTexCoord;\n  vRelativeHeight = aPosition.z / uAbsoluteHeight;\n}\n","fragment":"#ifdef GL_ES\n  precision mediump float;\n#endif\nuniform sampler2D uTexIndex;\nuniform vec3 uFogColor;\nvarying vec2 vTexCoord;\nvarying float vRelativeHeight;\nvoid main() {\n  float blendFactor = min(100.0 * vRelativeHeight, 1.0);\n  vec4 texColor = texture2D(uTexIndex, vTexCoord);\n  gl_FragColor = mix( vec4(uFogColor, 1.0), texColor,  blendFactor);\n}\n"},"basemap":{"vertex":"precision highp float;  //is default in vertex shaders anyway, using highp fixes #49\n#define halfPi 1.57079632679\nattribute vec4 aPosition;\nattribute vec2 aTexCoord;\nuniform mat4 uModelMatrix;\nuniform mat4 uViewMatrix;\nuniform mat4 uProjMatrix;\nuniform mat4 uMatrix;\nuniform vec2 uViewDirOnMap;\nuniform vec2 uLowerEdgePoint;\nvarying vec2 vTexCoord;\nvarying float verticalDistanceToLowerEdge;\nvoid main() {\n  gl_Position = uMatrix * aPosition;\n  vTexCoord = aTexCoord;\n  vec4 worldPos = uModelMatrix * aPosition;\n  vec2 dirFromLowerEdge = worldPos.xy / worldPos.w - uLowerEdgePoint;\n  verticalDistanceToLowerEdge = dot(dirFromLowerEdge, uViewDirOnMap);\n}\n","fragment":"#ifdef GL_ES\n  precision mediump float;\n#endif\nuniform sampler2D uTexIndex;\nuniform vec3 uFogColor;\nvarying vec2 vTexCoord;\nvarying float verticalDistanceToLowerEdge;\nuniform float uFogDistance;\nuniform float uFogBlurDistance;\nvoid main() {\n  float fogIntensity = (verticalDistanceToLowerEdge - uFogDistance) / uFogBlurDistance;\n  fogIntensity = clamp(fogIntensity, 0.0, 1.0);\n  gl_FragColor = vec4(texture2D(uTexIndex, vec2(vTexCoord.x, 1.0-vTexCoord.y)).rgb, 1.0-fogIntensity);\n}\n"},"texture":{"vertex":"precision highp float;  //is default in vertex shaders anyway, using highp fixes #49\nattribute vec4 aPosition;\nattribute vec2 aTexCoord;\nuniform mat4 uMatrix;\nvarying vec2 vTexCoord;\nvoid main() {\n  gl_Position = uMatrix * aPosition;\n  vTexCoord = aTexCoord;\n}\n","fragment":"#ifdef GL_ES\n  precision mediump float;\n#endif\nuniform sampler2D uTexIndex;\nvarying vec2 vTexCoord;\nvoid main() {\n  gl_FragColor = vec4(texture2D(uTexIndex, vTexCoord.st).rgb, 1.0);\n}\n"},"fogNormal":{"vertex":"precision highp float;  //is default in vertex shaders anyway, using highp fixes #49\nattribute vec4 aPosition;\nattribute vec4 aFilter;\nattribute vec3 aNormal;\nuniform mat4 uMatrix;\nuniform mat4 uModelMatrix;\nuniform mat3 uNormalMatrix;\nuniform vec2 uViewDirOnMap;\nuniform vec2 uLowerEdgePoint;\nvarying float verticalDistanceToLowerEdge;\nvarying vec3 vNormal;\nuniform float uTime;\nvoid main() {\n  float t = clamp((uTime-aFilter.r) / (aFilter.g-aFilter.r), 0.0, 1.0);\n  float f = aFilter.b + (aFilter.a-aFilter.b) * t;\n  if (f == 0.0) {\n    gl_Position = vec4(0.0, 0.0, 0.0, 0.0);\n    verticalDistanceToLowerEdge = 0.0;\n  } else {\n    vec4 pos = vec4(aPosition.x, aPosition.y, aPosition.z*f, aPosition.w);\n    gl_Position = uMatrix * pos;\n    vNormal = uNormalMatrix * aNormal;\n    vec4 worldPos = uModelMatrix * pos;\n    vec2 dirFromLowerEdge = worldPos.xy / worldPos.w - uLowerEdgePoint;\n    verticalDistanceToLowerEdge = dot(dirFromLowerEdge, uViewDirOnMap);\n  }\n}\n","fragment":"\n#ifdef GL_ES\n  precision mediump float;\n#endif\nuniform float uFogDistance;\nuniform float uFogBlurDistance;\nvarying float verticalDistanceToLowerEdge;\nvarying vec3 vNormal;\nvoid main() {\n  float fogIntensity = (verticalDistanceToLowerEdge - uFogDistance) / uFogBlurDistance;\n  gl_FragColor = vec4(normalize(vNormal) / 2.0 + 0.5, clamp(fogIntensity, 0.0, 1.0));\n}\n"},"ambientFromDepth":{"vertex":"precision highp float;  //is default in vertex shaders anyway, using highp fixes #49\nattribute vec4 aPosition;\nattribute vec2 aTexCoord;\nvarying vec2 vTexCoord;\nvoid main() {\n  gl_Position = aPosition;\n  vTexCoord = aTexCoord;\n}\n","fragment":"#ifdef GL_FRAGMENT_PRECISION_HIGH\n  // we need high precision for the depth values\n  precision highp float;\n#else\n  precision mediump float;\n#endif\nuniform sampler2D uDepthTexIndex;\nuniform sampler2D uFogTexIndex;\nuniform vec2 uInverseTexSize;   //in 1/pixels, e.g. 1/512 if the texture is 512px wide\nuniform float uEffectStrength;\nuniform float uNearPlane;\nuniform float uFarPlane;\nvarying vec2 vTexCoord;\n/* Retrieves the depth value 'offset' pixels away from 'pos' from texture 'uDepthTexIndex'. */\nfloat getDepth(vec2 pos, ivec2 offset)\n{\n  float z = texture2D(uDepthTexIndex, pos + float(offset) * uInverseTexSize).x;\n  return (2.0 * uNearPlane) / (uFarPlane + uNearPlane - z * (uFarPlane - uNearPlane)); // linearize depth\n}\n/* getOcclusionFactor() determines a heuristic factor (from [0..1]) for how \n * much the fragment at 'pos' with depth 'depthHere'is occluded by the \n * fragment that is (dx, dy) texels away from it.\n */\nfloat getOcclusionFactor(float depthHere, vec2 pos, ivec2 offset)\n{\n    float depthThere = getDepth(pos, offset);\n    /* if the fragment at (dx, dy) has no depth (i.e. there was nothing rendered there), \n     * then 'here' is not occluded (result 1.0) */\n    if (depthThere == 0.0)\n      return 1.0;\n    /* if the fragment at (dx, dy) is further away from the viewer than 'here', then\n     * 'here is not occluded' */\n    if (depthHere < depthThere )\n      return 1.0;\n      \n    float relDepthDiff = depthThere / depthHere;\n    float depthDiff = abs(depthThere - depthHere) * uFarPlane;\n    /* if the fragment at (dx, dy) is closer to the viewer than 'here', then it occludes\n     * 'here'. The occlusion is the higher the bigger the depth difference between the two\n     * locations is.\n     * However, if the depth difference is too high, we assume that 'there' lies in a\n     * completely different depth region of the scene than 'here' and thus cannot occlude\n     * 'here'. This last assumption gets rid of very dark artifacts around tall buildings.\n     */\n    return depthDiff < 50.0 ? mix(0.99, 1.0, 1.0 - clamp(depthDiff, 0.0, 1.0)) : 1.0;\n}\n/* This shader approximates the ambient occlusion in screen space (SSAO). \n * It is based on the assumption that a pixel will be occluded by neighboring \n * pixels iff. those have a depth value closer to the camera than the original\n * pixel itself (the function getOcclusionFactor() computes this occlusion \n * by a single other pixel).\n *\n * A naive approach would sample all pixels within a given distance. For an\n * interesting-looking effect, the sampling area needs to be at least 9 pixels \n * wide (-/+ 4), requiring 81 texture lookups per pixel for ambient occlusion.\n * This overburdens many GPUs.\n * To make the ambient occlusion computation faster, we do not consider all \n * texels in the sampling area, but only 16. This causes some sampling artifacts\n * that are later removed by blurring the ambient occlusion texture (this is \n * done in a separate shader).\n */\nvoid main() {\n  float depthHere = getDepth(vTexCoord, ivec2(0, 0));\n  float fogIntensity = texture2D(uFogTexIndex, vTexCoord).w;\n  if (depthHere == 0.0)\n  {\n\t//there was nothing rendered 'here' --> it can't be occluded\n    gl_FragColor = vec4(1.0);\n    return;\n  }\n  float occlusionFactor = 1.0;\n  \n  occlusionFactor *= getOcclusionFactor(depthHere, vTexCoord, ivec2(-1,  0));\n  occlusionFactor *= getOcclusionFactor(depthHere, vTexCoord, ivec2(+1,  0));\n  occlusionFactor *= getOcclusionFactor(depthHere, vTexCoord, ivec2( 0, -1));\n  occlusionFactor *= getOcclusionFactor(depthHere, vTexCoord, ivec2( 0, +1));\n  occlusionFactor *= getOcclusionFactor(depthHere, vTexCoord, ivec2(-2, -2));\n  occlusionFactor *= getOcclusionFactor(depthHere, vTexCoord, ivec2(+2, +2));\n  occlusionFactor *= getOcclusionFactor(depthHere, vTexCoord, ivec2(+2, -2));\n  occlusionFactor *= getOcclusionFactor(depthHere, vTexCoord, ivec2(-2, +2));\n  occlusionFactor *= getOcclusionFactor(depthHere, vTexCoord, ivec2(-4,  0));\n  occlusionFactor *= getOcclusionFactor(depthHere, vTexCoord, ivec2(+4,  0));\n  occlusionFactor *= getOcclusionFactor(depthHere, vTexCoord, ivec2( 0, -4));\n  occlusionFactor *= getOcclusionFactor(depthHere, vTexCoord, ivec2( 0, +4));\n  occlusionFactor *= getOcclusionFactor(depthHere, vTexCoord, ivec2(-4, -4));\n  occlusionFactor *= getOcclusionFactor(depthHere, vTexCoord, ivec2(+4, +4));\n  occlusionFactor *= getOcclusionFactor(depthHere, vTexCoord, ivec2(+4, -4));\n  occlusionFactor *= getOcclusionFactor(depthHere, vTexCoord, ivec2(-4, +4));\n  occlusionFactor = pow(occlusionFactor, 4.0) + 55.0/255.0; // empirical bias determined to let SSAO have no effect on the map plane\n  occlusionFactor = 1.0 - ((1.0 - occlusionFactor) * uEffectStrength * (1.0-fogIntensity));\n  gl_FragColor = vec4(vec3(occlusionFactor), 1.0);\n}\n"},"blur":{"vertex":"precision highp float;  //is default in vertex shaders anyway, using highp fixes #49\nattribute vec4 aPosition;\nattribute vec2 aTexCoord;\nvarying vec2 vTexCoord;\nvoid main() {\n  gl_Position = aPosition;\n  vTexCoord = aTexCoord;\n}\n","fragment":"#ifdef GL_ES\n  precision mediump float;\n#endif\nuniform sampler2D uTexIndex;\nuniform vec2 uInverseTexSize;   //in 1/pixels, e.g. 1/512 if the texture is 512px wide\nvarying vec2 vTexCoord;\n/* Retrieves the texel color 'offset' pixels away from 'pos' from texture 'uTexIndex'. */\nvec4 getTexel(vec2 pos, vec2 offset)\n{\n  return texture2D(uTexIndex, pos + offset * uInverseTexSize);\n}\nvoid main() {\n  vec4 center = texture2D(uTexIndex, vTexCoord);\n  vec4 nonDiagonalNeighbors = getTexel(vTexCoord, vec2(-1.0,  0.0)) +\n                              getTexel(vTexCoord, vec2(+1.0,  0.0)) +\n                              getTexel(vTexCoord, vec2( 0.0, -1.0)) +\n                              getTexel(vTexCoord, vec2( 0.0, +1.0));\n  vec4 diagonalNeighbors =    getTexel(vTexCoord, vec2(-1.0, -1.0)) +\n                              getTexel(vTexCoord, vec2(+1.0, +1.0)) +\n                              getTexel(vTexCoord, vec2(-1.0, +1.0)) +\n                              getTexel(vTexCoord, vec2(+1.0, -1.0));\n  \n  //approximate Gaussian blur (mean 0.0, stdev 1.0)\n  gl_FragColor = 0.2/1.0 * center + \n                 0.5/4.0 * nonDiagonalNeighbors + \n                 0.3/4.0 * diagonalNeighbors;\n}\n"},"basemap.shadows":{"vertex":"precision highp float;  //is default in vertex shaders anyway, using highp fixes #49\nattribute vec3 aPosition;\nattribute vec3 aNormal;\nuniform mat4 uModelMatrix;\nuniform mat4 uMatrix;\nuniform mat4 uSunMatrix;\nuniform vec2 uViewDirOnMap;\nuniform vec2 uLowerEdgePoint;\n//varying vec2 vTexCoord;\nvarying vec3 vSunRelPosition;\nvarying vec3 vNormal;\nvarying float verticalDistanceToLowerEdge;\nvoid main() {\n  vec4 pos = vec4(aPosition.xyz, 1.0);\n  gl_Position = uMatrix * pos;\n  vec4 sunRelPosition = uSunMatrix * pos;\n  vSunRelPosition = (sunRelPosition.xyz / sunRelPosition.w + 1.0) / 2.0;\n  vNormal = aNormal;\n  vec4 worldPos = uModelMatrix * pos;\n  vec2 dirFromLowerEdge = worldPos.xy / worldPos.w - uLowerEdgePoint;\n  verticalDistanceToLowerEdge = dot(dirFromLowerEdge, uViewDirOnMap);\n}\n","fragment":"\n#ifdef GL_FRAGMENT_PRECISION_HIGH\n  precision highp float;\n#else\n  precision mediump float;\n#endif\n/* This shader computes the diffuse brightness of the map layer. It does *not* \n * render the map texture itself, but is instead intended to be blended on top\n * of an already rendered map.\n * Note: this shader is not (and does not attempt to) be physically correct.\n *       It is intented to be a blend between a useful illustration of cast\n *       shadows and a mitigation of shadow casting artifacts occuring at\n *       low angles on incidence.\n *       Map brightness is only affected by shadows, not by light direction.\n *       Shadows are darkest when light comes from straight above (and thus\n *       shadows can be computed reliably) and become less and less visible\n *       with the light source close to the horizont (where moirC) and offset\n *       artifacts would otherwise be visible).\n */\n//uniform sampler2D uTexIndex;\nuniform sampler2D uShadowTexIndex;\nuniform vec3 uFogColor;\nuniform vec3 uDirToSun;\nuniform vec2 uShadowTexDimensions;\nuniform float uShadowStrength;\nvarying vec2 vTexCoord;\nvarying vec3 vSunRelPosition;\nvarying vec3 vNormal;\nvarying float verticalDistanceToLowerEdge;\nuniform float uFogDistance;\nuniform float uFogBlurDistance;\nfloat isSeenBySun( const vec2 sunViewNDC, const float depth, const float bias) {\n  if ( clamp( sunViewNDC, 0.0, 1.0) != sunViewNDC)  //not inside sun's viewport\n    return 1.0;\n  \n  float depthFromTexture = texture2D( uShadowTexIndex, sunViewNDC.xy).x;\n  \n  //compare depth values not in reciprocal but in linear depth\n  return step(1.0/depthFromTexture, 1.0/depth + bias);\n}\nvoid main() {\n  //vec2 tl = floor(vSunRelPosition.xy * uShadowTexDimensions) / uShadowTexDimensions;\n  //gl_FragColor = vec4(vec3(texture2D( uShadowTexIndex, tl).x), 1.0);\n  //return;\n  float diffuse = dot(uDirToSun, normalize(vNormal));\n  diffuse = max(diffuse, 0.0);\n  \n  float shadowStrength = uShadowStrength * pow(diffuse, 1.5);\n  if (diffuse > 0.0) {\n    // note: the diffuse term is also the cosine between the surface normal and the\n    // light direction\n    float bias = clamp(0.0007*tan(acos(diffuse)), 0.0, 0.01);\n    \n    vec2 pos = fract( vSunRelPosition.xy * uShadowTexDimensions);\n    \n    vec2 tl = floor(vSunRelPosition.xy * uShadowTexDimensions) / uShadowTexDimensions;\n    float tlVal = isSeenBySun( tl,                           vSunRelPosition.z, bias);\n    float trVal = isSeenBySun( tl + vec2(1.0, 0.0) / uShadowTexDimensions, vSunRelPosition.z, bias);\n    float blVal = isSeenBySun( tl + vec2(0.0, 1.0) / uShadowTexDimensions, vSunRelPosition.z, bias);\n    float brVal = isSeenBySun( tl + vec2(1.0, 1.0) / uShadowTexDimensions, vSunRelPosition.z, bias);\n    diffuse = mix( mix(tlVal, trVal, pos.x), \n                   mix(blVal, brVal, pos.x),\n                   pos.y);\n  }\n  diffuse = mix(1.0, diffuse, shadowStrength);\n  \n  float fogIntensity = (verticalDistanceToLowerEdge - uFogDistance) / uFogBlurDistance;\n  fogIntensity = clamp(fogIntensity, 0.0, 1.0);\n  float darkness = (1.0 - diffuse);\n  darkness *=  (1.0 - fogIntensity);\n  gl_FragColor = vec4(vec3(1.0 - darkness), 1.0);\n}\n"},"outlineMap":{"vertex":"precision highp float;  //is default in vertex shaders anyway, using highp fixes #49\nattribute vec4 aPosition;\nattribute vec2 aTexCoord;\nuniform mat4 uMatrix;\nvarying vec2 vTexCoord;\nvoid main() {\n  gl_Position = uMatrix * aPosition;\n  vTexCoord = aTexCoord;\n}\n","fragment":"#ifdef GL_FRAGMENT_PRECISION_HIGH\n  // we need high precision for the depth values\n  precision highp float;\n#else\n  precision mediump float;\n#endif\nuniform sampler2D uDepthTexIndex;\nuniform sampler2D uFogNormalTexIndex;\nuniform sampler2D uIdTexIndex;\nuniform vec2 uInverseTexSize;   //in 1/pixels, e.g. 1/512 if the texture is 512px wide\nuniform float uEffectStrength;\nuniform float uNearPlane;\nuniform float uFarPlane;\nvarying vec2 vTexCoord;\n/* Retrieves the depth value 'offset' pixels away from 'pos' from texture 'uDepthTexIndex'. */\nfloat getDepth(vec2 pos, vec2 offset)\n{\n  float z = texture2D(uDepthTexIndex, pos + offset * uInverseTexSize).x;\n  return (2.0 * uNearPlane) / (uFarPlane + uNearPlane - z * (uFarPlane - uNearPlane)); // linearize depth\n}\nvec3 getNormal(vec2 pos, vec2 offset)\n{\n  return normalize(texture2D(uFogNormalTexIndex, pos + offset * uInverseTexSize).xyz * 2.0 - 1.0);\n}\nvec3 getEncodedId(vec2 pos, vec2 offset)\n{\n  return texture2D(uIdTexIndex, pos + offset * uInverseTexSize).xyz;\n}\nvoid main() {\n  float fogIntensity = texture2D(uFogNormalTexIndex, vTexCoord).w;\n  vec3 normalHere =  getNormal(vTexCoord, vec2(0, 0));\n  vec3 normalRight = getNormal(vTexCoord, vec2(1, 0));\n  vec3 normalAbove = getNormal(vTexCoord, vec2(0,-1));\n  \n  float edgeStrengthFromNormal = \n    step( dot(normalHere, normalRight), 0.9) +\n    step( dot(normalHere, normalAbove), 0.9);\n  float depthHere =  getDepth(vTexCoord, vec2(0,  0));\n  float depthRight = getDepth(vTexCoord, vec2(1,  0));\n  float depthAbove = getDepth(vTexCoord, vec2(0, -1));\n  float depthDiffRight = abs(depthHere - depthRight) * 7500.0;\n  float depthDiffAbove = abs(depthHere - depthAbove) * 7500.0;\n  float edgeStrengthFromDepth = step(10.0, depthDiffRight) + \n                                step(10.0, depthDiffAbove);\n  \n  vec3 idHere = getEncodedId(vTexCoord, vec2(0,0));\n  vec3 idRight = getEncodedId(vTexCoord, vec2(1,0));\n  vec3 idAbove = getEncodedId(vTexCoord, vec2(0,-1));\n  float edgeStrengthFromId = (idHere != idRight || idHere != idAbove) ? 1.0 : 0.0;\n  \n  float edgeStrength = max( edgeStrengthFromId, max( edgeStrengthFromNormal, edgeStrengthFromDepth));\n  float occlusionFactor = 1.0 - (edgeStrength * uEffectStrength);\n  occlusionFactor = 1.0 - ((1.0- occlusionFactor) * (1.0-fogIntensity));\n  gl_FragColor = vec4(vec3(occlusionFactor), 1.0);\n}\n"}};

var GLX = (function() {
//var ext = GL.getExtension('WEBGL_lose_context');
//ext.loseContext();

var GLX = {};

GLX.getContext = function(canvas) {
  var options = {
    antialias: !APP.options.fastMode,
    depth: true,
    premultipliedAlpha: false
  };

  try {
    GL = canvas.getContext('webgl', options);
  } catch (ex) {}
  if (!GL) {
    try {
      GL = canvas.getContext('experimental-webgl', options);
    } catch (ex) {}
  }
  if (!GL) {
    throw new Error('WebGL not supported');
  }

  canvas.addEventListener('webglcontextlost', function(e) {
    console.warn('context lost');
  });

  canvas.addEventListener('webglcontextrestored', function(e) {
    console.warn('context restored');
  });

  GL.viewport(0, 0, APP.width, APP.height);
  GL.cullFace(GL.BACK);
  GL.enable(GL.CULL_FACE);
  GL.enable(GL.DEPTH_TEST);
  GL.clearColor(0.5, 0.5, 0.5, 1);

  if (!APP.options.fastMode) {
    GL.anisotropyExtension = GL.getExtension('EXT_texture_filter_anisotropic');
    if (GL.anisotropyExtension) {
      GL.anisotropyExtension.maxAnisotropyLevel = GL.getParameter(
        GL.anisotropyExtension.MAX_TEXTURE_MAX_ANISOTROPY_EXT
      );
    }

    GL.depthTextureExtension = GL.getExtension('WEBGL_depth_texture');
  }

  return GL;
};

GLX.start = function(render) {
  return setInterval(function() {
    requestAnimationFrame(render);
  }, 17);
};

GLX.stop = function(loop) {
  clearInterval(loop);
};

GLX.destroy = function() {
  if (GL !== undefined) {
    GL.canvas.parentNode.removeChild(GL.canvas);
    GL = undefined;
  }
};


GLX.util = {};

GLX.util.nextPowerOf2 = function(n) {
  n--;
  n |= n >> 1;  // handle  2 bit numbers
  n |= n >> 2;  // handle  4 bit numbers
  n |= n >> 4;  // handle  8 bit numbers
  n |= n >> 8;  // handle 16 bit numbers
  n |= n >> 16; // handle 32 bit numbers
  n++;
  return n;
};

GLX.util.calcNormal = function(ax, ay, az, bx, by, bz, cx, cy, cz) {
  var d1x = ax-bx;
  var d1y = ay-by;
  var d1z = az-bz;

  var d2x = bx-cx;
  var d2y = by-cy;
  var d2z = bz-cz;

  var nx = d1y*d2z - d1z*d2y;
  var ny = d1z*d2x - d1x*d2z;
  var nz = d1x*d2y - d1y*d2x;

  return this.calcUnit(nx, ny, nz);
};

GLX.util.calcUnit = function(x, y, z) {
  var m = Math.sqrt(x*x + y*y + z*z);

  if (m === 0) {
    m = 0.00001;
  }

  return [x/m, y/m, z/m];
};


GLX.Buffer = function(itemSize, data) {
  this.id = GL.createBuffer();
  this.itemSize = itemSize;
  this.numItems = data.length/itemSize;
  GL.bindBuffer(GL.ARRAY_BUFFER, this.id);
  GL.bufferData(GL.ARRAY_BUFFER, data, GL.STATIC_DRAW);
  data = null;
};

GLX.Buffer.prototype = {
  enable: function() {
    GL.bindBuffer(GL.ARRAY_BUFFER, this.id);
  },

  destroy: function() {
    GL.deleteBuffer(this.id);
    this.id = null;
  }
};


GLX.Framebuffer = function(width, height, useDepthTexture) {
  if (useDepthTexture && !GL.depthTextureExtension)
    throw "Depth textures are not supported by your GPU";
    
  this.useDepthTexture = !!useDepthTexture;
  this.setSize(width, height);
};

GLX.Framebuffer.prototype = {

  setSize: function(width, height) {
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
      this.depthTexture = new GLX.texture.Image();//GL.createTexture();
      this.depthTexture.enable(0);
      GL.texParameteri(GL.TEXTURE_2D, GL.TEXTURE_MIN_FILTER, GL.NEAREST);
      GL.texParameteri(GL.TEXTURE_2D, GL.TEXTURE_MAG_FILTER, GL.NEAREST);
      //CLAMP_TO_EDGE is required for NPOT textures
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

    this.renderTexture = new GLX.texture.Data(width, height);
    GL.bindTexture(GL.TEXTURE_2D, this.renderTexture.id);

    GL.texParameteri(GL.TEXTURE_2D, GL.TEXTURE_WRAP_S, GL.CLAMP_TO_EDGE); //necessary for NPOT textures
    GL.texParameteri(GL.TEXTURE_2D, GL.TEXTURE_WRAP_T, GL.CLAMP_TO_EDGE);
    GL.framebufferTexture2D(GL.FRAMEBUFFER, GL.COLOR_ATTACHMENT0, GL.TEXTURE_2D, this.renderTexture.id, 0);

    if (GL.checkFramebufferStatus(GL.FRAMEBUFFER) !== GL.FRAMEBUFFER_COMPLETE) {
      throw new Error('This combination of framebuffer attachments does not work');
    }

    GL.bindRenderbuffer(GL.RENDERBUFFER, null);
    GL.bindFramebuffer(GL.FRAMEBUFFER, null);
  },

  enable: function() {
    GL.bindFramebuffer(GL.FRAMEBUFFER, this.frameBuffer);

    if (!this.useDepthTexture) {
      GL.bindRenderbuffer(GL.RENDERBUFFER, this.depthRenderBuffer);
    }
  },

  disable: function() {
    GL.bindFramebuffer(GL.FRAMEBUFFER, null);
    if (!this.useDepthTexture) {
      GL.bindRenderbuffer(GL.RENDERBUFFER, null);
    }
  },

  getPixel: function(x, y) {
    var imageData = new Uint8Array(4);
    if (x < 0 || y < 0 || x >= this.width || y >= this.height) {
      return;
    }
    GL.readPixels(x, y, 1, 1, GL.RGBA, GL.UNSIGNED_BYTE, imageData);
    return imageData;
  },

  getData: function() {
    var imageData = new Uint8Array(this.width*this.height*4);
    GL.readPixels(0, 0, this.width, this.height, GL.RGBA, GL.UNSIGNED_BYTE, imageData);
    return imageData;
  },

  destroy: function() {
    if (this.renderTexture) {
      this.renderTexture.destroy();
    }
    
    if (this.depthTexture) {
      this.depthTexture.destroy();
    }
  }
};


GLX.Shader = function(config) {
  var i;

  this.shaderName = config.shaderName;
  this.id = GL.createProgram();

  this.attach(GL.VERTEX_SHADER,   config.vertexShader);
  this.attach(GL.FRAGMENT_SHADER, config.fragmentShader);

  GL.linkProgram(this.id);

  if (!GL.getProgramParameter(this.id, GL.LINK_STATUS)) {
    throw new Error(GL.getProgramParameter(this.id, GL.VALIDATE_STATUS) +'\n'+ GL.getError());
  }

  this.attributeNames = config.attributes || [];
  this.uniformNames   = config.uniforms || [];
  GL.useProgram(this.id);

  this.attributes = {};
  for (i = 0; i < this.attributeNames.length; i++) {
    this.locateAttribute(this.attributeNames[i]);
  }
  
  this.uniforms = {};
  for (i = 0; i < this.uniformNames.length; i++) {
    this.locateUniform(this.uniformNames[i]);
  }
};

GLX.Shader.warned = {};
GLX.Shader.prototype = {

  locateAttribute: function(name) {
    var loc = GL.getAttribLocation(this.id, name);
    if (loc < 0) {
      console.warn('unable to locate attribute "%s" in shader "%s"', name, this.shaderName);
      return;
    }
    this.attributes[name] = loc;
  },

  locateUniform: function(name) {
    var loc = GL.getUniformLocation(this.id, name);
    if (!loc) {
      console.warn('unable to locate uniform "%s" in shader "%s"', name, this.shaderName);
      return;
    }
    this.uniforms[name] = loc;
  },

  attach: function(type, src) {
    var shader = GL.createShader(type);
    GL.shaderSource(shader, src);
    GL.compileShader(shader);

    if (!GL.getShaderParameter(shader, GL.COMPILE_STATUS)) {
      throw new Error(GL.getShaderInfoLog(shader));
    }

    GL.attachShader(this.id, shader);
  },

  enable: function() {
    GL.useProgram(this.id);

    for (var name in this.attributes) {
      GL.enableVertexAttribArray(this.attributes[name]);
    }
    
    return this;
  },

  disable: function() {
    if (this.attributes) {
      for (var name in this.attributes) {
        GL.disableVertexAttribArray(this.attributes[name]);
      }
    }
  },
  
  bindBuffer: function(buffer, attribute) {
    if (this.attributes[attribute] === undefined) {
      var qualifiedName = this.shaderName + ":" + attribute;
      if ( !GLX.Shader.warned[qualifiedName]) {
        console.warn('attempt to bind VBO to invalid attribute "%s" in shader "%s"', attribute, this.shaderName);
        GLX.Shader.warned[qualifiedName] = true;
      }
      return;
    }
    
    buffer.enable();
    GL.vertexAttribPointer(this.attributes[attribute], buffer.itemSize, GL.FLOAT, false, 0, 0);
  },
  
  setUniform: function(uniform, type, value) {
    if (this.uniforms[uniform] === undefined) {
      var qualifiedName = this.shaderName + ":" + uniform;
      if ( !GLX.Shader.warned[qualifiedName]) {
        console.warn('attempt to bind to invalid uniform "%s" in shader "%s"', uniform, this.shaderName);
        GLX.Shader.warned[qualifiedName] = true;
      }

      return;
    }
    GL['uniform'+ type]( this.uniforms[uniform], value);
  },

  setUniforms: function(uniforms) {
    for (var i in uniforms) {
      this.setUniform(uniforms[i][0], uniforms[i][1], uniforms[i][2]);
    }
  },

  setUniformMatrix: function(uniform, type, value) {
    if (this.uniforms[uniform] === undefined) {
      var qualifiedName = this.shaderName + ":" + uniform;
      if ( !GLX.Shader.warned[qualifiedName]) {
        console.warn('attempt to bind to invalid uniform "%s" in shader "%s"', uniform, this.shaderName);
        GLX.Shader.warned[qualifiedName] = true;
      }
      return;
    }
    GL['uniformMatrix'+ type]( this.uniforms[uniform], false, value);
  },

  setUniformMatrices: function(uniforms) {
    for (var i in uniforms) {
      this.setUniformMatrix(uniforms[i][0], uniforms[i][1], uniforms[i][2]);
    }
  },
  
  bindTexture: function(uniform, textureUnit, glxTexture) {
    glxTexture.enable(textureUnit);
    this.setUniform(uniform, "1i", textureUnit);
  },

  destroy: function() {
    this.disable();
    this.id = null;
  }
};


GLX.Matrix = function(data) {
  this.data = new Float32Array(data ? data : [
    1, 0, 0, 0,
    0, 1, 0, 0,
    0, 0, 1, 0,
    0, 0, 0, 1
  ]);
};

GLX.Matrix.identity = function() {
  return new GLX.Matrix([
    1, 0, 0, 0,
    0, 1, 0, 0,
    0, 0, 1, 0,
    0, 0, 0, 1
  ]);
};

GLX.Matrix.identity3 = function() {
  return new GLX.Matrix([
    1, 0, 0,
    0, 1, 0,
    0, 0, 1
  ]);
};

(function() {

  function rad(a) {
    return a * Math.PI/180;
  }

  function multiply(res, a, b) {
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

    res[ 0] = a00*b00 + a01*b10 + a02*b20 + a03*b30;
    res[ 1] = a00*b01 + a01*b11 + a02*b21 + a03*b31;
    res[ 2] = a00*b02 + a01*b12 + a02*b22 + a03*b32;
    res[ 3] = a00*b03 + a01*b13 + a02*b23 + a03*b33;

    res[ 4] = a10*b00 + a11*b10 + a12*b20 + a13*b30;
    res[ 5] = a10*b01 + a11*b11 + a12*b21 + a13*b31;
    res[ 6] = a10*b02 + a11*b12 + a12*b22 + a13*b32;
    res[ 7] = a10*b03 + a11*b13 + a12*b23 + a13*b33;

    res[ 8] = a20*b00 + a21*b10 + a22*b20 + a23*b30;
    res[ 9] = a20*b01 + a21*b11 + a22*b21 + a23*b31;
    res[10] = a20*b02 + a21*b12 + a22*b22 + a23*b32;
    res[11] = a20*b03 + a21*b13 + a22*b23 + a23*b33;

    res[12] = a30*b00 + a31*b10 + a32*b20 + a33*b30;
    res[13] = a30*b01 + a31*b11 + a32*b21 + a33*b31;
    res[14] = a30*b02 + a31*b12 + a32*b22 + a33*b32;
    res[15] = a30*b03 + a31*b13 + a32*b23 + a33*b33;
  }

  GLX.Matrix.prototype = {

    multiply: function(m) {
      multiply(this.data, this.data, m.data);
      return this;
    },

    translate: function(x, y, z) {
      multiply(this.data, this.data, [
        1, 0, 0, 0,
        0, 1, 0, 0,
        0, 0, 1, 0,
        x, y, z, 1
      ]);
      return this;
    },

    rotateX: function(angle) {
      var a = rad(angle), c = Math.cos(a), s = Math.sin(a);
      multiply(this.data, this.data, [
        1, 0, 0, 0,
        0, c, s, 0,
        0, -s, c, 0,
        0, 0, 0, 1
      ]);
      return this;
    },

    rotateY: function(angle) {
      var a = rad(angle), c = Math.cos(a), s = Math.sin(a);
      multiply(this.data, this.data, [
        c, 0, -s, 0,
        0, 1, 0, 0,
        s, 0, c, 0,
        0, 0, 0, 1
      ]);
      return this;
    },

    rotateZ: function(angle) {
      var a = rad(angle), c = Math.cos(a), s = Math.sin(a);
      multiply(this.data, this.data, [
        c, -s, 0, 0,
        s, c, 0, 0,
        0, 0, 1, 0,
        0, 0, 0, 1
      ]);
      return this;
    },

    scale: function(x, y, z) {
      multiply(this.data, this.data, [
        x, 0, 0, 0,
        0, y, 0, 0,
        0, 0, z, 0,
        0, 0, 0, 1
      ]);
      return this;
    }
  };

  GLX.Matrix.multiply = function(a, b) {
    var res = new Float32Array(16);
    multiply(res, a.data, b.data);
    return res;
  };

  // returns a perspective projection matrix with a field-of-view of 'fov' 
  // degrees, an width/height aspect ratio of 'aspect', the near plane at 'near'
  // and the far plane at 'far'
  GLX.Matrix.Perspective = function(fov, aspect, near, far) {
    var f =  1 / Math.tan(fov*(Math.PI/180)/2), 
        nf = 1 / (near - far);
        
    return new GLX.Matrix([
      f/aspect, 0,               0,  0,
      0,        f,               0,  0,
      0,        0, (far + near)*nf, -1,
      0,        0, (2*far*near)*nf,  0]);
  };

  //returns a perspective projection matrix with the near plane at 'near',
  //the far plane at 'far' and the view rectangle on the near plane bounded
  //by 'left', 'right', 'top', 'bottom'
  GLX.Matrix.Frustum = function (left, right, top, bottom, near, far) {
    var rl = 1 / (right - left),
        tb = 1 / (top - bottom),
        nf = 1 / (near - far);
        
    return new GLX.Matrix( [
          (near * 2) * rl,                   0,                     0,  0,
                        0,     (near * 2) * tb,                     0,  0,
      (right + left) * rl, (top + bottom) * tb,     (far + near) * nf, -1,
                        0,                   0, (far * near * 2) * nf,  0]);
  };
  
  GLX.Matrix.OffCenterProjection = function (screenBottomLeft, screenTopLeft, screenBottomRight, eye, near, far) {
    var vRight = norm3(sub3( screenBottomRight, screenBottomLeft));
    var vUp    = norm3(sub3( screenTopLeft,     screenBottomLeft));
    var vNormal= normal( screenBottomLeft, screenTopLeft, screenBottomRight);
    
    var eyeToScreenBottomLeft = sub3( screenBottomLeft, eye);
    var eyeToScreenTopLeft    = sub3( screenTopLeft,    eye);
    var eyeToScreenBottomRight= sub3( screenBottomRight,eye);
    
    var d = - dot3(eyeToScreenBottomLeft, vNormal);
    
    var l = dot3(vRight, eyeToScreenBottomLeft) * near / d;
    var r = dot3(vRight, eyeToScreenBottomRight)* near / d;
    var b = dot3(vUp,    eyeToScreenBottomLeft) * near / d;
    var t = dot3(vUp,    eyeToScreenTopLeft)    * near / d;
    
    return GLX.Matrix.Frustum(l, r, t, b, near, far);
  };
  
  // based on http://www.songho.ca/opengl/gl_projectionmatrix.html
  GLX.Matrix.Ortho = function(left, right, top, bottom, near, far) {
    return new GLX.Matrix([
                   2/(right-left),                          0,                       0, 0,
                                0,           2/(top - bottom),                       0, 0,
                                0,                          0,         -2/(far - near), 0,
      - (right+left)/(right-left), -(top+bottom)/(top-bottom), - (far+near)/(far-near), 1
    ]);
  };

  GLX.Matrix.invert3 = function(a) {
    var
      a00 = a[0], a01 = a[1], a02 = a[2],
      a04 = a[4], a05 = a[5], a06 = a[6],
      a08 = a[8], a09 = a[9], a10 = a[10],

      l =  a10 * a05 - a06 * a09,
      o = -a10 * a04 + a06 * a08,
      m =  a09 * a04 - a05 * a08,

      det = a00*l + a01*o + a02*m;

    if (!det) {
      return null;
    }

    det = 1.0/det;

    return [
      l                    * det,
      (-a10*a01 + a02*a09) * det,
      ( a06*a01 - a02*a05) * det,
      o                    * det,
      ( a10*a00 - a02*a08) * det,
      (-a06*a00 + a02*a04) * det,
      m                    * det,
      (-a09*a00 + a01*a08) * det,
      ( a05*a00 - a01*a04) * det
    ];
  };

  GLX.Matrix.transpose3 = function(a) {
    return new Float32Array([
      a[0], a[3], a[6],
      a[1], a[4], a[7],
      a[2], a[5], a[8]
    ]);
  };

  GLX.Matrix.transpose = function(a) {
    return new Float32Array([
      a[0], a[4],  a[8], a[12], 
      a[1], a[5],  a[9], a[13], 
      a[2], a[6], a[10], a[14], 
      a[3], a[7], a[11], a[15]
    ]);
  };

  // GLX.Matrix.transform = function(x, y, z, m) {
  //   var X = x*m[0] + y*m[4] + z*m[8]  + m[12];
  //   var Y = x*m[1] + y*m[5] + z*m[9]  + m[13];
  //   var Z = x*m[2] + y*m[6] + z*m[10] + m[14];
  //   var W = x*m[3] + y*m[7] + z*m[11] + m[15];
  //   return {
  //     x: (X/W +1) / 2,
  //     y: (Y/W +1) / 2
  //   };
  // };

  GLX.Matrix.transform = function(m) {
    var X = m[12];
    var Y = m[13];
    var Z = m[14];
    var W = m[15];
    return {
      x: (X/W + 1) / 2,
      y: (Y/W + 1) / 2,
      z: (Z/W + 1) / 2
    };
  };

  GLX.Matrix.invert = function(a) {
    var
      res = new Float32Array(16),

      a00 = a[ 0], a01 = a[ 1], a02 = a[ 2], a03 = a[ 3],
      a10 = a[ 4], a11 = a[ 5], a12 = a[ 6], a13 = a[ 7],
      a20 = a[ 8], a21 = a[ 9], a22 = a[10], a23 = a[11],
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
      b11 = a22 * a33 - a23 * a32,

      // Calculate the determinant
      det = b00 * b11 - b01 * b10 + b02 * b09 + b03 * b08 - b04 * b07 + b05 * b06;

    if (!det) {
      return;
    }

    det = 1 / det;

    res[ 0] = (a11 * b11 - a12 * b10 + a13 * b09) * det;
    res[ 1] = (a02 * b10 - a01 * b11 - a03 * b09) * det;
    res[ 2] = (a31 * b05 - a32 * b04 + a33 * b03) * det;
    res[ 3] = (a22 * b04 - a21 * b05 - a23 * b03) * det;

    res[ 4] = (a12 * b08 - a10 * b11 - a13 * b07) * det;
    res[ 5] = (a00 * b11 - a02 * b08 + a03 * b07) * det;
    res[ 6] = (a32 * b02 - a30 * b05 - a33 * b01) * det;
    res[ 7] = (a20 * b05 - a22 * b02 + a23 * b01) * det;

    res[ 8] = (a10 * b10 - a11 * b08 + a13 * b06) * det;
    res[ 9] = (a01 * b08 - a00 * b10 - a03 * b06) * det;
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


GLX.texture.Image = function() {
  this.id = GL.createTexture();
  GL.bindTexture(GL.TEXTURE_2D, this.id);

//GL.texParameteri(GL.TEXTURE_2D, GL.TEXTURE_WRAP_S, GL.CLAMP_TO_EDGE);
//GL.texParameteri(GL.TEXTURE_2D, GL.TEXTURE_WRAP_T, GL.CLAMP_TO_EDGE);

  GL.bindTexture(GL.TEXTURE_2D, null);
};

GLX.texture.Image.prototype = {

  clamp: function(image, maxSize) {
    if (image.width <= maxSize && image.height <= maxSize) {
      return image;
    }

    var w = maxSize, h = maxSize;
    var ratio = image.width/image.height;
    // TODO: if other dimension doesn't fit to POT after resize, there is still trouble
    if (ratio < 1) {
      w = Math.round(h*ratio);
    } else {
      h = Math.round(w/ratio);
    }

    var canvas = document.createElement('CANVAS');
    canvas.width  = w;
    canvas.height = h;

    var context = canvas.getContext('2d');
    context.drawImage(image, 0, 0, canvas.width, canvas.height);
    return canvas;
  },

  load: function(url, callback) {
    var image = new Image();
    image.crossOrigin = '*';
    image.onload = function() {
      this.set(image);
      if (callback) {
        callback(image);
      }
    }.bind(this);
    image.onerror = function() {
      if (callback) {
        callback();
      }
    };
    image.src = url;
    return this;
  },

  color: function(color) {
    GL.bindTexture(GL.TEXTURE_2D, this.id);
    GL.texParameteri(GL.TEXTURE_2D, GL.TEXTURE_MIN_FILTER, GL.LINEAR);
    GL.texParameteri(GL.TEXTURE_2D, GL.TEXTURE_MAG_FILTER, GL.LINEAR);
    GL.texImage2D(GL.TEXTURE_2D, 0, GL.RGBA, 1, 1, 0, GL.RGBA, GL.UNSIGNED_BYTE, new Uint8Array([color[0]*255, color[1]*255, color[2]*255, (color[3] === undefined ? 1 : color[3])*255]));
    GL.bindTexture(GL.TEXTURE_2D, null);
    return this;
  },

  set: function(image) {
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

    if (GL.anisotropyExtension) {
      GL.texParameterf(GL.TEXTURE_2D, GL.anisotropyExtension.TEXTURE_MAX_ANISOTROPY_EXT, GL.anisotropyExtension.maxAnisotropyLevel);
    }

    GL.bindTexture(GL.TEXTURE_2D, null);
    return this;
  },

  enable: function(index) {
    if (!this.id) {
      return;
    }
    GL.activeTexture(GL.TEXTURE0 + (index || 0));
    GL.bindTexture(GL.TEXTURE_2D, this.id);
    return this;
  },

  destroy: function() {
    GL.bindTexture(GL.TEXTURE_2D, null);
    GL.deleteTexture(this.id);
    this.id = null;
  }
};


GLX.texture.Data = function(width, height, data, options) {
  //options = options || {};

  this.id = GL.createTexture();
  GL.bindTexture(GL.TEXTURE_2D, this.id);

  GL.texParameteri(GL.TEXTURE_2D, GL.TEXTURE_MIN_FILTER, GL.NEAREST);
  GL.texParameteri(GL.TEXTURE_2D, GL.TEXTURE_MAG_FILTER, GL.NEAREST);

  var bytes = null;

  if (data) {
    var length = width*height*4;
    bytes = new Uint8Array(length);
    bytes.set(data.subarray(0, length));
  }

  GL.texImage2D(GL.TEXTURE_2D, 0, GL.RGBA, width, height, 0, GL.RGBA, GL.UNSIGNED_BYTE, bytes);
  GL.bindTexture(GL.TEXTURE_2D, null);
};

GLX.texture.Data.prototype = {

  enable: function(index) {
    GL.activeTexture(GL.TEXTURE0 + (index || 0));
    GL.bindTexture(GL.TEXTURE_2D, this.id);
    return this;
  },

  destroy: function() {
    GL.bindTexture(GL.TEXTURE_2D, null);
    GL.deleteTexture(this.id);
    this.id = null;
  }
};

return GLX;
}());

//

var vec2 = {
  len: function(a) {
    return Math.sqrt(a[0]*a[0] + a[1]*a[1]);
  },

  add: function(a, b) {
    return [a[0]+b[0], a[1]+b[1]];
  },

  sub: function(a, b) {
    return [a[0]-b[0], a[1]-b[1]];
  },

  dot: function(a, b) {
    return a[1]*b[0] - a[0]*b[1];
  },

  scale: function(a, f) {
    return [a[0]*f, a[1]*f];
  },

  equals: function(a, b) {
    return (a[0] === b[0] && a[1] === b[1]);
  }
};


var vec3 = {
  len: function(a) {
    return Math.sqrt(a[0]*a[0] + a[1]*a[1] + a[2]*a[2]);
  },

  sub: function(a, b) {
    return [a[0]-b[0], a[1]-b[1], a[2]-b[2]];
  },

  unit: function(a) {
    var l = this.len(a);
    return [a[0]/l, a[1]/l, a[2]/l];
  },

  normal: function(a, b, c) {
    var d1 = this.sub(a, b);
    var d2 = this.sub(b, c);
    // normalized cross product of d1 and d2
    return this.unit([
      d1[1]*d2[2] - d1[2]*d2[1],
      d1[2]*d2[0] - d1[0]*d2[2],
      d1[0]*d2[1] - d1[1]*d2[0]
    ]);
  }
};


var earcut = (function() {

  function earcut(data, holeIndices, dim) {

    dim = dim || 2;

    var hasHoles = holeIndices && holeIndices.length,
      outerLen = hasHoles ? holeIndices[0]*dim : data.length,
      outerNode = linkedList(data, 0, outerLen, dim, true),
      triangles = [];

    if (!outerNode) return triangles;

    var minX, minY, maxX, maxY, x, y, size;

    if (hasHoles) outerNode = eliminateHoles(data, holeIndices, outerNode, dim);

    // if the shape is not too simple, we'll use z-order curve hash later; calculate polygon bbox
    if (data.length>80*dim) {
      minX = maxX = data[0];
      minY = maxY = data[1];

      for (var i = dim; i<outerLen; i += dim) {
        x = data[i];
        y = data[i + 1];
        if (x<minX) minX = x;
        if (y<minY) minY = y;
        if (x>maxX) maxX = x;
        if (y>maxY) maxY = y;
      }

      // minX, minY and size are later used to transform coords into integers for z-order calculation
      size = Math.max(maxX - minX, maxY - minY);
    }

    earcutLinked(outerNode, triangles, dim, minX, minY, size);

    return triangles;
  }

// create a circular doubly linked list from polygon points in the specified winding order
  function linkedList(data, start, end, dim, clockwise) {
    var i, last;

    if (clockwise === (signedArea(data, start, end, dim)>0)) {
      for (i = start; i<end; i += dim) last = insertNode(i, data[i], data[i + 1], last);
    } else {
      for (i = end - dim; i>=start; i -= dim) last = insertNode(i, data[i], data[i + 1], last);
    }

    if (last && equals(last, last.next)) {
      removeNode(last);
      last = last.next;
    }

    return last;
  }

// eliminate colinear or duplicate points
  function filterPoints(start, end) {
    if (!start) return start;
    if (!end) end = start;

    var p = start,
      again;
    do {
      again = false;

      if (!p.steiner && (equals(p, p.next) || area(p.prev, p, p.next) === 0)) {
        removeNode(p);
        p = end = p.prev;
        if (p === p.next) return null;
        again = true;

      } else {
        p = p.next;
      }
    } while (again || p !== end);

    return end;
  }

// main ear slicing loop which triangulates a polygon (given as a linked list)
  function earcutLinked(ear, triangles, dim, minX, minY, size, pass) {
    if (!ear) return;

    // interlink polygon nodes in z-order
    if (!pass && size) indexCurve(ear, minX, minY, size);

    var stop = ear,
      prev, next;

    // iterate through ears, slicing them one by one
    while (ear.prev !== ear.next) {
      prev = ear.prev;
      next = ear.next;

      if (size ? isEarHashed(ear, minX, minY, size) : isEar(ear)) {
        // cut off the triangle
        triangles.push(prev.i/dim);
        triangles.push(ear.i/dim);
        triangles.push(next.i/dim);

        removeNode(ear);

        // skipping the next vertice leads to less sliver triangles
        ear = next.next;
        stop = next.next;

        continue;
      }

      ear = next;

      // if we looped through the whole remaining polygon and can't find any more ears
      if (ear === stop) {
        // try filtering points and slicing again
        if (!pass) {
          earcutLinked(filterPoints(ear), triangles, dim, minX, minY, size, 1);

          // if this didn't work, try curing all small self-intersections locally
        } else if (pass === 1) {
          ear = cureLocalIntersections(ear, triangles, dim);
          earcutLinked(ear, triangles, dim, minX, minY, size, 2);

          // as a last resort, try splitting the remaining polygon into two
        } else if (pass === 2) {
          splitEarcut(ear, triangles, dim, minX, minY, size);
        }

        break;
      }
    }
  }

// check whether a polygon node forms a valid ear with adjacent nodes
  function isEar(ear) {
    var a = ear.prev,
      b = ear,
      c = ear.next;

    if (area(a, b, c)>=0) return false; // reflex, can't be an ear

    // now make sure we don't have other points inside the potential ear
    var p = ear.next.next;

    while (p !== ear.prev) {
      if (pointInTriangle(a.x, a.y, b.x, b.y, c.x, c.y, p.x, p.y) &&
        area(p.prev, p, p.next)>=0) return false;
      p = p.next;
    }

    return true;
  }

  function isEarHashed(ear, minX, minY, size) {
    var a = ear.prev,
      b = ear,
      c = ear.next;

    if (area(a, b, c)>=0) return false; // reflex, can't be an ear

    // triangle bbox; min & max are calculated like this for speed
    var minTX = a.x<b.x ? (a.x<c.x ? a.x : c.x) : (b.x<c.x ? b.x : c.x),
      minTY = a.y<b.y ? (a.y<c.y ? a.y : c.y) : (b.y<c.y ? b.y : c.y),
      maxTX = a.x>b.x ? (a.x>c.x ? a.x : c.x) : (b.x>c.x ? b.x : c.x),
      maxTY = a.y>b.y ? (a.y>c.y ? a.y : c.y) : (b.y>c.y ? b.y : c.y);

    // z-order range for the current triangle bbox;
    var minZ = zOrder(minTX, minTY, minX, minY, size),
      maxZ = zOrder(maxTX, maxTY, minX, minY, size);

    // first look for points inside the triangle in increasing z-order
    var p = ear.nextZ;

    while (p && p.z<=maxZ) {
      if (p !== ear.prev && p !== ear.next &&
        pointInTriangle(a.x, a.y, b.x, b.y, c.x, c.y, p.x, p.y) &&
        area(p.prev, p, p.next)>=0) return false;
      p = p.nextZ;
    }

    // then look for points in decreasing z-order
    p = ear.prevZ;

    while (p && p.z>=minZ) {
      if (p !== ear.prev && p !== ear.next &&
        pointInTriangle(a.x, a.y, b.x, b.y, c.x, c.y, p.x, p.y) &&
        area(p.prev, p, p.next)>=0) return false;
      p = p.prevZ;
    }

    return true;
  }

// go through all polygon nodes and cure small local self-intersections
  function cureLocalIntersections(start, triangles, dim) {
    var p = start;
    do {
      var a = p.prev,
        b = p.next.next;

      if (!equals(a, b) && intersects(a, p, p.next, b) && locallyInside(a, b) && locallyInside(b, a)) {

        triangles.push(a.i/dim);
        triangles.push(p.i/dim);
        triangles.push(b.i/dim);

        // remove two nodes involved
        removeNode(p);
        removeNode(p.next);

        p = start = b;
      }
      p = p.next;
    } while (p !== start);

    return p;
  }

// try splitting polygon into two and triangulate them independently
  function splitEarcut(start, triangles, dim, minX, minY, size) {
    // look for a valid diagonal that divides the polygon into two
    var a = start;
    do {
      var b = a.next.next;
      while (b !== a.prev) {
        if (a.i !== b.i && isValidDiagonal(a, b)) {
          // split the polygon in two by the diagonal
          var c = splitPolygon(a, b);

          // filter colinear points around the cuts
          a = filterPoints(a, a.next);
          c = filterPoints(c, c.next);

          // run earcut on each half
          earcutLinked(a, triangles, dim, minX, minY, size);
          earcutLinked(c, triangles, dim, minX, minY, size);
          return;
        }
        b = b.next;
      }
      a = a.next;
    } while (a !== start);
  }

// link every hole into the outer loop, producing a single-ring polygon without holes
  function eliminateHoles(data, holeIndices, outerNode, dim) {
    var queue = [],
      i, len, start, end, list;

    for (i = 0, len = holeIndices.length; i<len; i++) {
      start = holeIndices[i]*dim;
      end = i<len - 1 ? holeIndices[i + 1]*dim : data.length;
      list = linkedList(data, start, end, dim, false);
      if (list === list.next) list.steiner = true;
      queue.push(getLeftmost(list));
    }

    queue.sort(compareX);

    // process holes from left to right
    for (i = 0; i<queue.length; i++) {
      eliminateHole(queue[i], outerNode);
      outerNode = filterPoints(outerNode, outerNode.next);
    }

    return outerNode;
  }

  function compareX(a, b) {
    return a.x - b.x;
  }

// find a bridge between vertices that connects hole with an outer ring and and link it
  function eliminateHole(hole, outerNode) {
    outerNode = findHoleBridge(hole, outerNode);
    if (outerNode) {
      var b = splitPolygon(outerNode, hole);
      filterPoints(b, b.next);
    }
  }

// David Eberly's algorithm for finding a bridge between hole and outer polygon
  function findHoleBridge(hole, outerNode) {
    var p = outerNode,
      hx = hole.x,
      hy = hole.y,
      qx = -Infinity,
      m;

    // find a segment intersected by a ray from the hole's leftmost point to the left;
    // segment's endpoint with lesser x will be potential connection point
    do {
      if (hy<=p.y && hy>=p.next.y) {
        var x = p.x + (hy - p.y)*(p.next.x - p.x)/(p.next.y - p.y);
        if (x<=hx && x>qx) {
          qx = x;
          if (x === hx) {
            if (hy === p.y) return p;
            if (hy === p.next.y) return p.next;
          }
          m = p.x<p.next.x ? p : p.next;
        }
      }
      p = p.next;
    } while (p !== outerNode);

    if (!m) return null;

    if (hx === qx) return m.prev; // hole touches outer segment; pick lower endpoint

    // look for points inside the triangle of hole point, segment intersection and endpoint;
    // if there are no points found, we have a valid connection;
    // otherwise choose the point of the minimum angle with the ray as connection point

    var stop = m,
      mx = m.x,
      my = m.y,
      tanMin = Infinity,
      tan;

    p = m.next;

    while (p !== stop) {
      if (hx>=p.x && p.x>=mx &&
        pointInTriangle(hy<my ? hx : qx, hy, mx, my, hy<my ? qx : hx, hy, p.x, p.y)) {

        tan = Math.abs(hy - p.y)/(hx - p.x); // tangential

        if ((tan<tanMin || (tan === tanMin && p.x>m.x)) && locallyInside(p, hole)) {
          m = p;
          tanMin = tan;
        }
      }

      p = p.next;
    }

    return m;
  }

// interlink polygon nodes in z-order
  function indexCurve(start, minX, minY, size) {
    var p = start;
    do {
      if (p.z === null) p.z = zOrder(p.x, p.y, minX, minY, size);
      p.prevZ = p.prev;
      p.nextZ = p.next;
      p = p.next;
    } while (p !== start);

    p.prevZ.nextZ = null;
    p.prevZ = null;

    sortLinked(p);
  }

// Simon Tatham's linked list merge sort algorithm
// http://www.chiark.greenend.org.uk/~sgtatham/algorithms/listsort.html
  function sortLinked(list) {
    var i, p, q, e, tail, numMerges, pSize, qSize,
      inSize = 1;

    do {
      p = list;
      list = null;
      tail = null;
      numMerges = 0;

      while (p) {
        numMerges++;
        q = p;
        pSize = 0;
        for (i = 0; i<inSize; i++) {
          pSize++;
          q = q.nextZ;
          if (!q) break;
        }

        qSize = inSize;

        while (pSize>0 || (qSize>0 && q)) {

          if (pSize === 0) {
            e = q;
            q = q.nextZ;
            qSize--;
          } else if (qSize === 0 || !q) {
            e = p;
            p = p.nextZ;
            pSize--;
          } else if (p.z<=q.z) {
            e = p;
            p = p.nextZ;
            pSize--;
          } else {
            e = q;
            q = q.nextZ;
            qSize--;
          }

          if (tail) tail.nextZ = e;
          else list = e;

          e.prevZ = tail;
          tail = e;
        }

        p = q;
      }

      tail.nextZ = null;
      inSize *= 2;

    } while (numMerges>1);

    return list;
  }

// z-order of a point given coords and size of the data bounding box
  function zOrder(x, y, minX, minY, size) {
    // coords are transformed into non-negative 15-bit integer range
    x = 32767*(x - minX)/size;
    y = 32767*(y - minY)/size;

    x = (x | (x<<8)) & 0x00FF00FF;
    x = (x | (x<<4)) & 0x0F0F0F0F;
    x = (x | (x<<2)) & 0x33333333;
    x = (x | (x<<1)) & 0x55555555;

    y = (y | (y<<8)) & 0x00FF00FF;
    y = (y | (y<<4)) & 0x0F0F0F0F;
    y = (y | (y<<2)) & 0x33333333;
    y = (y | (y<<1)) & 0x55555555;

    return x | (y<<1);
  }

// find the leftmost node of a polygon ring
  function getLeftmost(start) {
    var p = start,
      leftmost = start;
    do {
      if (p.x<leftmost.x) leftmost = p;
      p = p.next;
    } while (p !== start);

    return leftmost;
  }

// check if a point lies within a convex triangle
  function pointInTriangle(ax, ay, bx, by, cx, cy, px, py) {
    return (cx - px)*(ay - py) - (ax - px)*(cy - py)>=0 &&
      (ax - px)*(by - py) - (bx - px)*(ay - py)>=0 &&
      (bx - px)*(cy - py) - (cx - px)*(by - py)>=0;
  }

// check if a diagonal between two polygon nodes is valid (lies in polygon interior)
  function isValidDiagonal(a, b) {
    return a.next.i !== b.i && a.prev.i !== b.i && !intersectsPolygon(a, b) &&
      locallyInside(a, b) && locallyInside(b, a) && middleInside(a, b);
  }

// signed area of a triangle
  function area(p, q, r) {
    return (q.y - p.y)*(r.x - q.x) - (q.x - p.x)*(r.y - q.y);
  }

// check if two points are equal
  function equals(p1, p2) {
    return p1.x === p2.x && p1.y === p2.y;
  }

// check if two segments intersect
  function intersects(p1, q1, p2, q2) {
    if ((equals(p1, q1) && equals(p2, q2)) ||
      (equals(p1, q2) && equals(p2, q1))) return true;
    return area(p1, q1, p2)>0 !== area(p1, q1, q2)>0 &&
      area(p2, q2, p1)>0 !== area(p2, q2, q1)>0;
  }

// check if a polygon diagonal intersects any polygon segments
  function intersectsPolygon(a, b) {
    var p = a;
    do {
      if (p.i !== a.i && p.next.i !== a.i && p.i !== b.i && p.next.i !== b.i &&
        intersects(p, p.next, a, b)) return true;
      p = p.next;
    } while (p !== a);

    return false;
  }

// check if a polygon diagonal is locally inside the polygon
  function locallyInside(a, b) {
    return area(a.prev, a, a.next)<0 ?
    area(a, b, a.next)>=0 && area(a, a.prev, b)>=0 :
    area(a, b, a.prev)<0 || area(a, a.next, b)<0;
  }

// check if the middle point of a polygon diagonal is inside the polygon
  function middleInside(a, b) {
    var p = a,
      inside = false,
      px = (a.x + b.x)/2,
      py = (a.y + b.y)/2;
    do {
      if (((p.y>py) !== (p.next.y>py)) && (px<(p.next.x - p.x)*(py - p.y)/(p.next.y - p.y) + p.x))
        inside = !inside;
      p = p.next;
    } while (p !== a);

    return inside;
  }

// link two polygon vertices with a bridge; if the vertices belong to the same ring, it splits polygon into two;
// if one belongs to the outer ring and another to a hole, it merges it into a single ring
  function splitPolygon(a, b) {
    var a2 = new Node(a.i, a.x, a.y),
      b2 = new Node(b.i, b.x, b.y),
      an = a.next,
      bp = b.prev;

    a.next = b;
    b.prev = a;

    a2.next = an;
    an.prev = a2;

    b2.next = a2;
    a2.prev = b2;

    bp.next = b2;
    b2.prev = bp;

    return b2;
  }

// create a node and optionally link it with previous one (in a circular doubly linked list)
  function insertNode(i, x, y, last) {
    var p = new Node(i, x, y);

    if (!last) {
      p.prev = p;
      p.next = p;

    } else {
      p.next = last.next;
      p.prev = last;
      last.next.prev = p;
      last.next = p;
    }
    return p;
  }

  function removeNode(p) {
    p.next.prev = p.prev;
    p.prev.next = p.next;

    if (p.prevZ) p.prevZ.nextZ = p.nextZ;
    if (p.nextZ) p.nextZ.prevZ = p.prevZ;
  }

  function Node(i, x, y) {
    // vertice index in coordinates array
    this.i = i;

    // vertex coordinates
    this.x = x;
    this.y = y;

    // previous and next vertice nodes in a polygon ring
    this.prev = null;
    this.next = null;

    // z-order curve value
    this.z = null;

    // previous and next nodes in z-order
    this.prevZ = null;
    this.nextZ = null;

    // indicates whether this is a steiner point
    this.steiner = false;
  }

// return a percentage difference between the polygon area and its triangulation area;
// used to verify correctness of triangulation
  earcut.deviation = function(data, holeIndices, dim, triangles) {
    var hasHoles = holeIndices && holeIndices.length;
    var outerLen = hasHoles ? holeIndices[0]*dim : data.length;
    var i, len;

    var polygonArea = Math.abs(signedArea(data, 0, outerLen, dim));
    if (hasHoles) {
      for (i = 0, len = holeIndices.length; i<len; i++) {
        var start = holeIndices[i]*dim;
        var end = i<len - 1 ? holeIndices[i + 1]*dim : data.length;
        polygonArea -= Math.abs(signedArea(data, start, end, dim));
      }
    }

    var trianglesArea = 0;
    for (i = 0, len = triangles.length; i < len; i += 3) {
      var a = triangles[i]*dim;
      var b = triangles[i + 1]*dim;
      var c = triangles[i + 2]*dim;
      trianglesArea += Math.abs(
        (data[a] - data[c])*(data[b + 1] - data[a + 1]) -
        (data[a] - data[b])*(data[c + 1] - data[a + 1]));
    }

    return polygonArea === 0 && trianglesArea === 0 ? 0 :
      Math.abs((trianglesArea - polygonArea)/polygonArea);
  };

  function signedArea(data, start, end, dim) {
    var sum = 0;
    for (var i = start, j = end - dim; i<end; i += dim) {
      sum += (data[j] - data[i])*(data[i + 1] + data[j + 1]);
      j = i;
    }
    return sum;
  }

// turn a polygon in a multi-dimensional array form (e.g. as in GeoJSON) into a form Earcut accepts
  earcut.flatten = function(data) {
    var dim = data[0][0].length,
      result = { vertices: [], holes: [], dimensions: dim },
      holeIndex = 0;

    for (var i = 0; i<data.length; i++) {
      for (var j = 0; j<data[i].length; j++) {
        for (var d = 0; d<dim; d++) result.vertices.push(data[i][j][d]);
      }
      if (i>0) {
        holeIndex += data[i - 1].length;
        result.holes.push(holeIndex);
      }
    }
    return result;
  };

  return earcut;

}(this));


function pointOnSegment(point, segment) {
  return (
    point[0] >= Math.min(segment[0][0], segment[1][0]) &&
    point[0] <= Math.max(segment[1][0], segment[0][0]) &&
    point[1] >= Math.min(segment[0][1], segment[1][1]) &&
    point[1] <= Math.max(segment[1][1], segment[0][1])
  );
}

function getVectorSegmentIntersection(point1, vector1, segment) {
  var
    point2 = segment[0],
    vector2 = [ segment[1][0]-segment[0][0], segment[1][1]-segment[0][1] ],
    n1, n2, m1, m2, xy;

  if (vector1[0] === 0 && vector2[0] === 0) {
    return;
  }
  if (vector1[0] !== 0) {
    m1 = vector1[1]/vector1[0];
    n1 = point1[1] - m1*point1[0];
  }
  if (vector2[0] !== 0) {
    m2 = vector2[1]/vector2[0];
    n2 = point2[1] - m2*point2[0];
  }
  if (vector1[0] === 0) {
    xy = [point1[0], m2*point1[0] + n2];
    if (pointOnSegment(xy, segment)) {
      return xy;
    }
  }
  if (vector2[0] === 0) {
    xy = [point2[0], m1*point2[0] + n1];
    if (pointOnSegment(xy, segment)) {
      return xy;
    }
  }
  if (m1 === m2) {
    return;
  }
  var x = (n2 - n1)/(m1 - m2);
  xy = [x, m1*x + n1];
  if (pointOnSegment(xy, segment)) {
    return xy;
  }
}


// function getVectorIntersection(point1, vector1, point2, vector2) {
//   var b1, b2, m1, m2, point;
//   if (vector1[0] === 0 && vector2[0] === 0) {
//     return false;
//   }
//   if (vector1[0] !== 0) {
//     m1 = vector1[1]/vector1[0];
//     b1 = point1[1] - m1*point1[0];
//   }
//   if (vector2[0] !== 0) {
//     m2 = vector2[1]/vector2[0];
//     b2 = point2[1] - m2*point2[0];
//   }
//   if (vector1[0] === 0) {
//     return [point1[0], m2*point1[0] + b2];
//   }
//   if (vector2[0] === 0) {
//     return [point2[0], m1*point2[0] + b1];
//   }
//   if (m1 === m2) {
//     return false;
//   }
//   point = [];
//   point[0] = (b2 - b1)/(m1 - m2);
//   point[1] = m1*point[0] + b1;
//   return point;
// }

function getDistanceToLine(point, line) {
  var
    r1 = line[0],
    r2 = line[1];
  if (r1[0] === r2[0] && r1[1] === r2[1]) {
    return;
  }

  var m1 = (r2[1] - r1[1]) / (r2[0] - r1[0]);
  var b1 = r1[1] - (m1*r1[0]);

  if (m1 === 0) {
    return Math.abs(b1-point[1]);
  }

  if (m1 === Infinity){
    return Math.abs(r1[0]-point[0]);
  }

  var m2 =- 1.0/m1;
  var b2 = point[1] - (m2*point[0]);

  var xs = (b2-b1)/(m1-m2);
  var ys = m1*xs+b1;

  var c1 = point[0]-xs;
  var c2 = point[1]-ys;

  return Math.sqrt(c1*c1+c2*c2);
}


var createRoof;

(function () {
  
  createRoof = function(triangles, properties, polygon, dim, roofColor, wallColor) {
    switch (properties.roofShape) {
      case 'cone':
        return ConeRoof(triangles, polygon, dim, roofColor);
      case 'dome':
        return DomeRoof(triangles, polygon, dim, roofColor);
      case 'pyramid':
        return PyramidRoof(triangles, properties, polygon, dim, roofColor);
      case 'skillion':
        return SkillionRoof(triangles, properties, polygon, dim, roofColor, wallColor);
      case 'gabled':
        return roofWithRidge(triangles, properties, polygon, 0, dim, roofColor, wallColor);
      case 'hipped':
        // temp solution with gabled roof was too bad
        return FlatRoof(triangles, properties, polygon, dim, roofColor);
      case 'half-hipped':
        // temp solution with gabled roof was too bad
        return FlatRoof(triangles, properties, polygon, dim, roofColor);
      case 'gambrel':
        return roofWithRidge(triangles, properties, polygon, 0, dim, roofColor, wallColor);
      case 'mansard':
        return roofWithRidge(triangles, properties, polygon, 0, dim, roofColor, wallColor);
      case 'round':
        return RoundRoof(triangles, properties, polygon, dim, roofColor, wallColor);
      case 'onion':
        return OnionRoof(triangles, polygon, dim, roofColor);
      // case 'flat':
      default:
        return FlatRoof(triangles, properties, polygon, dim, roofColor);
    }
  };

  function getRidgeIntersections(center, direction, polygon) {
    // create polygon intersections
    var index = [], point;
    for (var i = 0; i<polygon.length - 1; i++) {
      point = getVectorSegmentIntersection(center, direction, [polygon[i], polygon[i+1] ]);
      if (point !== undefined) {
        if (index.length === 2) {
          // more than 2 intersections: too complex for gabled roof, should be hipped+skeleton anyway
          return;
        }
        i++;
        polygon.splice(i, 0, point);
        index.push(i);
      }
    }

    // requires at least 2 intersections
    if (index.length <2) {
      return;
    }

    return { index: index, roof: polygon };
  }

  function roofWithRidge(triangles, properties, polygon, offset, dim, roofColor, wallColor) {
    offset = 0; // TODO

    // no gabled roofs for polygons with holes, roof direction required
    if (polygon.length>1 || properties.roofDirection === undefined) {
      return FlatRoof(triangles, properties, polygon, dim, roofColor);
    }

    var
      rad = properties.roofDirection*Math.PI/180,
      roofDirection = [Math.cos(rad), Math.sin(rad)];

    var ridge = getRidgeIntersections(dim.center, roofDirection, polygon[0]);
    if (!ridge) {
      return FlatRoof(triangles, properties, polygon, dim, roofColor);
    }

    var ridgeIndex = ridge.index, roofPolygon = ridge.roof;

    if (!offset) {
      var
        distances = [],
        maxDistance = 0,
        ridgeLine = [ roofPolygon[ridgeIndex[0]], roofPolygon[ridgeIndex[1]] ];

      for (var i = 0; i<roofPolygon.length; i++) {
        distances[i] = getDistanceToLine(roofPolygon[i], ridgeLine);
        maxDistance = Math.max(maxDistance, distances[i]);
      }

      // set z of all vertices
      for (i = 0; i<roofPolygon.length; i++) {
        roofPolygon[i][2] = (1 - distances[i]/maxDistance)*dim.roofHeight;
      }

      // create roof faces
      var roof;
      roof = roofPolygon.slice(ridgeIndex[0], ridgeIndex[1] + 1);
      split.polygon(triangles, [roof], dim.roofZ, roofColor);

      roof = roofPolygon.slice(ridgeIndex[1], roofPolygon.length - 1);
      roof = roof.concat(roofPolygon.slice(0, ridgeIndex[0] + 1));
      split.polygon(triangles, [roof], dim.roofZ, roofColor);

      // create extra wall faces
      for (i = 0; i<roofPolygon.length - 1; i++) {
        // skip degenerate quads - could even skip degenerate triangles
        if (roofPolygon[i][2] === 0 && roofPolygon[i + 1][2] === 0) {
          continue;
        }
        split.quad(
          triangles,
          [roofPolygon[i][0], roofPolygon[i][1], dim.roofZ + roofPolygon[i][2]],
          [roofPolygon[i][0], roofPolygon[i][1], dim.roofZ],
          [roofPolygon[i + 1][0], roofPolygon[i + 1][1], dim.roofZ],
          [roofPolygon[i + 1][0], roofPolygon[i + 1][1], dim.roofZ + roofPolygon[i + 1][2]],
          wallColor
        );
      }
    }
  }

  function FlatRoof(triangles, properties, polygon, dim, roofColor) {
    if (properties.shape === 'cylinder') {
      split.circle(triangles, dim.center, dim.radius, dim.roofZ, roofColor);
    } else {
      split.polygon(triangles, polygon, dim.roofZ, roofColor);
    }
  }

  function SkillionRoof(triangles, properties, polygon, dim, roofColor, wallColor) {
    // roof direction required
    if (properties.roofDirection === undefined) {
      return FlatRoof(triangles, properties, polygon, dim, roofColor);
    }

    var
      rad = properties.roofDirection*Math.PI/180,
      closestPoint, farthestPoint,
      minY = Infinity, maxY = -Infinity;

    polygon[0].forEach(function(point) {
      var y = point[1]*Math.cos(-rad) + point[0]*Math.sin(-rad);
      if (y < minY) {
        minY = y;
        closestPoint = point;
      }
      if (y > maxY) {
        maxY = y;
        farthestPoint = point;
      }
    });

    var
      outerPolygon = polygon[0],
      roofDirection = [Math.cos(rad), Math.sin(rad)],
      ridge = [closestPoint, [closestPoint[0]+roofDirection[0], closestPoint[1]+roofDirection[1]]],
      maxDistance = getDistanceToLine(farthestPoint, ridge);

    // modify vertical position of all points
    polygon.forEach(function(ring) {
      ring.forEach(function(point) {
        var distance = getDistanceToLine(point, ridge);
        point[2] = (distance/maxDistance)*dim.roofHeight;
      });
    });

    // create roof face
    split.polygon(triangles, [outerPolygon], dim.roofZ, roofColor);

    // create extra wall faces
    polygon.forEach(function(ring) {
      for (var i = 0; i < outerPolygon.length - 1; i++) {
        // skip degenerate quads - could even skip degenerate triangles
        if (ring[i][2] === 0 && ring[i + 1][2] === 0) {
          continue;
        }
        split.quad(
          triangles,
          [ring[i][0], ring[i][1], dim.roofZ + ring[i][2]],
          [ring[i][0], ring[i][1], dim.roofZ],
          [ring[i + 1][0], ring[i + 1][1], dim.roofZ],
          [ring[i + 1][0], ring[i + 1][1], dim.roofZ + ring[i + 1][2]],
          wallColor
        );
      }
    });
  }

  function ConeRoof(triangles, polygon, dim, roofColor) {
    split.polygon(triangles, polygon, dim.roofZ, roofColor);
    split.cylinder(triangles, dim.center, dim.radius, 0, dim.roofHeight, dim.roofZ, roofColor);
  }

  function DomeRoof(triangles, polygon, dim, roofColor) {
    split.polygon(triangles, polygon, dim.roofZ, roofColor);
    split.dome(triangles, dim.center, dim.radius, dim.roofHeight, dim.roofZ, roofColor);
  }

  function PyramidRoof(triangles, properties, polygon, dim, roofColor) {
    if (properties.shape === 'cylinder') {
      split.cylinder(triangles, dim.center, dim.radius, 0, dim.roofHeight, dim.roofZ, roofColor);
    } else {
      split.pyramid(triangles, polygon, dim.center, dim.roofHeight, dim.roofZ, roofColor);
    }
  }

  function RoundRoof(triangles, properties, polygon, dim, roofColor, wallColor) {
    // no round roofs for polygons with holes
    if (polygon.length>1 || properties.roofDirection === undefined) {
      return FlatRoof(triangles, properties, polygon, dim, roofColor);
    }

    return FlatRoof(triangles, properties, polygon, dim, roofColor);
    // var ridge = getRidgeIntersections(dim.center, properties.roofDirection, polygon[0]);
    // if (!ridge) {
    //   return FlatRoof(triangles, properties, polygon, dim, roofColor);
    // }
    //
    // var ridgeIndex = ridge.index, roofPolygon = ridge.roof;
    //
    //
    // //   zPos = zPos || 0;
    // var
    //   yNum = 12,
    //   currYAngle, nextYAngle,
    //   x1, y1,
    //   x2, y2,
    //   w1, w2,
    //   quarterCircle = Math.PI/2,
    //   circleOffset = -quarterCircle,
    //   newHeight, newZPos;
    //
    // // goes top-down
    // for (var i = 0; i < yNum; i++) {
    //   currYAngle = ( i/yNum)*quarterCircle + circleOffset;
    //
    //   x1 = Math.cos(currYAngle);
    //   y1 = Math.sin(currYAngle);
    //
    //   x2 = Math.cos(nextYAngle);
    //   y2 = Math.sin(nextYAngle);
    //
    //   w1 = x1*width;
    //   w2 = x2*width;
    //
    //   newHeight = (y2-y1)*height;
    //   newZPos = zPos - y2*height;
    // }
  }

  function OnionRoof(triangles, polygon, dim, roofColor) {
    split.polygon(triangles, polygon, dim.roofZ, roofColor);

    var rings = [
      { rScale: 0.8, hScale: 0 },
      { rScale: 0.9, hScale: 0.18 },
      { rScale: 0.9, hScale: 0.35 },
      { rScale: 0.8, hScale: 0.47 },
      { rScale: 0.6, hScale: 0.59 },
      { rScale: 0.5, hScale: 0.65 },
      { rScale: 0.2, hScale: 0.82 },
      { rScale: 0,   hScale: 1 }
    ];

    var h1, h2;
    for (var i = 0, il = rings.length - 1; i<il; i++) {
      h1 = dim.roofHeight*rings[i].hScale;
      h2 = dim.roofHeight*rings[i + 1].hScale;
      split.cylinder(triangles, dim.center, dim.radius*rings[i].rScale, dim.radius*rings[i + 1].rScale, h2 - h1, dim.roofZ + h1, roofColor);
    }
  }

  function HalfHippedRoof(tags, polygon) {
//   this.cap1part = [
//     interpolateBetween(this.cap1[0], this.cap1[1], 0.5 - this.ridgeOffset/this.cap1.getLength()),
//     interpolateBetween(this.cap1[0], this.cap1[1], 0.5 + this.ridgeOffset/this.cap1.getLength())
//   ];
//   this.cap2part = [
//     interpolateBetween(this.cap2[0], this.cap2[1], 0.5 - this.ridgeOffset/this.cap1.getLength()),
//     interpolateBetween(this.cap2[0], this.cap2[1], 0.5 + this.ridgeOffset/this.cap1.getLength())
//   ];
  }

  function GambrelRoof(tags, polygon) {
//   this.cap1part = [
//     interpolateBetween(this.cap1[0], this.cap1[1], 1/6.0),
//     interpolateBetween(this.cap1[0], this.cap1[1], 5/6.0)
//   ];
//   this.cap2part = [
//     interpolateBetween(this.cap2[0], this.cap2[1], 1/6.0),
//     interpolateBetween(this.cap2[0], this.cap2[1], 5/6.0)
//   ];
  }

  function MansardRoof(tags, polygon) {
//   this.mansardEdge1 = [
//     interpolateBetween(this.cap1[0], this.ridge[0], 1/3.0),
//     interpolateBetween(this.cap2[1], this.ridge[1], 1/3.0)
//   ];
//   this.mansardEdge2 = [
//     interpolateBetween(this.cap1[1], this.ridge[0], 1/3.0),
//     interpolateBetween(this.cap2[0], this.ridge[1], 1/3.0)
//   ];
  }

}());


var split = {

  NUM_Y_SEGMENTS: 24,
  NUM_X_SEGMENTS: 32,

  //function isVertical(a, b, c) {
  //  return Math.abs(normal(a, b, c)[2]) < 1/5000;
  //}

  quad: function(buffers, a, b, c, d, color) {
    this.triangle(buffers, a, b, c, color);
    this.triangle(buffers, c, d, a, color);
  },

  triangle: function(buffers, a, b, c, color) {
    var n = vec3.normal(a, b, c);
    [].push.apply(buffers.vertices, [].concat(a, c, b));
    [].push.apply(buffers.normals,  [].concat(n, n, n));
    [].push.apply(buffers.colors,   [].concat(color, color, color));
    buffers.texCoords.push(0.0, 0.0, 0.0, 0.0, 0.0, 0.0);
  },

  circle: function(buffers, center, radius, zPos, color) {
    zPos = zPos || 0;
    var u, v;
    for (var i = 0; i < this.NUM_X_SEGMENTS; i++) {
      u = i/this.NUM_X_SEGMENTS;
      v = (i+1)/this.NUM_X_SEGMENTS;
      this.triangle(
        buffers,
        [ center[0] + radius * Math.sin(u*Math.PI*2), center[1] + radius * Math.cos(u*Math.PI*2), zPos ],
        [ center[0],                                  center[1],                                  zPos ],
        [ center[0] + radius * Math.sin(v*Math.PI*2), center[1] + radius * Math.cos(v*Math.PI*2), zPos ],
        color
      );
    }
  },

  polygon: function(buffers, rings, zPos, color) {
    zPos = zPos || 0;
    var
      vertexBuffer = [], ringIndex = [],
      index = 0,
      i, il,
      j, jl,
      ri, rij;

    for (i = 0, il = rings.length; i < il; i++) {
      ri = rings[i];
      for (j = 0; j < ri.length; j++) {
        rij = ri[j];
        vertexBuffer.push(rij[0], rij[1], zPos + (rij[2] || 0));
      }
      if (i) {
        index += rings[i-1].length;
        ringIndex.push(index);
      }
    }

    var
      vertices = earcut(vertexBuffer, ringIndex, 3),
      v1, v2, v3;

    for (i = 0, il = vertices.length-2; i < il; i+=3) {
      v1 = vertices[i  ]*3;
      v2 = vertices[i+1]*3;
      v3 = vertices[i+2]*3;
      this.triangle(
        buffers,
        [ vertexBuffer[v1], vertexBuffer[v1+1], vertexBuffer[v1+2] ],
        [ vertexBuffer[v2], vertexBuffer[v2+1], vertexBuffer[v2+2] ],
        [ vertexBuffer[v3], vertexBuffer[v3+1], vertexBuffer[v3+2] ],
        color
      );
    }
  },

  //polygon3d: function(buffers, rings, color) {
  //  var ring = rings[0];
  //  var ringLength = ring.length;
  //  var vertices, t, tl;
  //
////  { r:255, g:0, b:0 }
//
  //  if (ringLength <= 4) { // 3: a triangle
  //    this.triangle(
  //      buffers,
  //      ring[0],
  //      ring[2],
  //      ring[1], color
  //    );
  //
  //    if (ringLength === 4) { // 4: a quad (2 triangles)
  //      this.triangle(
  //        buffers,
  //        ring[0],
  //        ring[3],
  //        ring[2], color
  //      );
  //    }
//      return;
  //  }
  //
  //  if (isVertical(ring[0], ring[1], ring[2])) {
  //    for (var i = 0, il = rings[0].length; i < il; i++) {
  //      rings[0][i] = [
  //        rings[0][i][2],
  //        rings[0][i][1],
  //        rings[0][i][0]
  //      ];
  //    }
  //
  //    vertices = earcut(rings);
  //    for (t = 0, tl = vertices.length-2; t < tl; t+=3) {
  //      this.triangle(
  //        buffers,
  //        [ vertices[t  ][2], vertices[t  ][1], vertices[t  ][0] ],
  //        [ vertices[t+1][2], vertices[t+1][1], vertices[t+1][0] ],
  //        [ vertices[t+2][2], vertices[t+2][1], vertices[t+2][0] ], color
  //      );
  //    }
//      return;
  //  }
  //
  //  vertices = earcut(rings);
  //  for (t = 0, tl = vertices.length-2; t < tl; t+=3) {
  //    this.triangle(
  //      buffers,
  //      [ vertices[t  ][0], vertices[t  ][1], vertices[t  ][2] ],
  //      [ vertices[t+1][0], vertices[t+1][1], vertices[t+1][2] ],
  //      [ vertices[t+2][0], vertices[t+2][1], vertices[t+2][2] ], color
  //    );
  //  }
  //},

  cube: function(buffers, sizeX, sizeY, sizeZ, X, Y, zPos, color) {
    X = X || 0;
    Y = Y || 0;
    zPos = zPos || 0;

    var a = [X,       Y,       zPos];
    var b = [X+sizeX, Y,       zPos];
    var c = [X+sizeX, Y+sizeY, zPos];
    var d = [X,       Y+sizeY, zPos];

    var A = [X,       Y,       zPos+sizeZ];
    var B = [X+sizeX, Y,       zPos+sizeZ];
    var C = [X+sizeX, Y+sizeY, zPos+sizeZ];
    var D = [X,       Y+sizeY, zPos+sizeZ];

    this.quad(buffers, b, a, d, c, color);
    this.quad(buffers, A, B, C, D, color);
    this.quad(buffers, a, b, B, A, color);
    this.quad(buffers, b, c, C, B, color);
    this.quad(buffers, c, d, D, C, color);
    this.quad(buffers, d, a, A, D, color);
  },

  cylinder: function(buffers, center, radius1, radius2, height, zPos, color) {
    zPos = zPos || 0;
    var
      currAngle, nextAngle,
      currSin, currCos,
      nextSin, nextCos,
      num = this.NUM_X_SEGMENTS,
      doublePI = Math.PI*2;

    for (var i = 0; i < num; i++) {
      currAngle = ( i   /num) * doublePI;
      nextAngle = ((i+1)/num) * doublePI;

      currSin = Math.sin(currAngle);
      currCos = Math.cos(currAngle);

      nextSin = Math.sin(nextAngle);
      nextCos = Math.cos(nextAngle);

      this.triangle(
        buffers,
        [ center[0] + radius1*currSin, center[1] + radius1*currCos, zPos ],
        [ center[0] + radius2*nextSin, center[1] + radius2*nextCos, zPos+height ],
        [ center[0] + radius1*nextSin, center[1] + radius1*nextCos, zPos ],
        color
      );

      if (radius2 !== 0) {
        this.triangle(
          buffers,
          [ center[0] + radius2*currSin, center[1] + radius2*currCos, zPos+height ],
          [ center[0] + radius2*nextSin, center[1] + radius2*nextCos, zPos+height ],
          [ center[0] + radius1*currSin, center[1] + radius1*currCos, zPos ],
          color
        );
      }
    }
  },

  dome: function(buffers, center, radius, height, zPos, color, flip) {
    zPos = zPos || 0;
    var
      currYAngle, nextYAngle,
      x1, y1,
      x2, y2,
      radius1, radius2,
      newHeight, newZPos,
      yNum = this.NUM_Y_SEGMENTS/2,
      quarterCircle = Math.PI/2,
      circleOffset = flip ? 0 : -quarterCircle;

    // goes top-down
    for (var i = 0; i < yNum; i++) {
      currYAngle = ( i/yNum)*quarterCircle + circleOffset;
      nextYAngle = ((i + 1)/yNum)*quarterCircle + circleOffset;

      x1 = Math.cos(currYAngle);
      y1 = Math.sin(currYAngle);

      x2 = Math.cos(nextYAngle);
      y2 = Math.sin(nextYAngle);

      radius1 = x1*radius;
      radius2 = x2*radius;

      newHeight = (y2-y1)*height;
      newZPos = zPos - y2*height;

      this.cylinder(buffers, center, radius2, radius1, newHeight, newZPos, color);
    }
  },

  sphere: function(buffers, center, radius, height, zPos, color) {
    zPos = zPos || 0;
    var vertexCount = 0;
    vertexCount += this.dome(buffers, center, radius, height/2, zPos+height/2, color, true);
    vertexCount += this.dome(buffers, center, radius, height/2, zPos+height/2, color);
    return vertexCount;
  },

  pyramid: function(buffers, polygon, center, height, zPos, color) {
    zPos = zPos || 0;
    polygon = polygon[0];
    for (var i = 0, il = polygon.length-1; i < il; i++) {
      this.triangle(
        buffers,
        [ polygon[i  ][0], polygon[i  ][1], zPos ],
        [ polygon[i+1][0], polygon[i+1][1], zPos ],
        [ center[0], center[1], zPos+height ],
        color
      );
    }
  },

  extrusion: function(buffers, polygon, height, zPos, color, texCoord) {
    zPos = zPos || 0;
    var
      ring, a, b,
      L,
      v0, v1, v2, v3, n,
      tx1, tx2,
      ty1 = texCoord[2]*height, ty2 = texCoord[3]*height,
      i, il,
      r, rl;

    for (i = 0, il = polygon.length; i < il; i++) {
      ring = polygon[i];
        for (r = 0, rl = ring.length-1; r < rl; r++) {
        a = ring[r];
        b = ring[r+1];
        L = vec2.len(vec2.sub(a, b));

        v0 = [ a[0], a[1], zPos];
        v1 = [ b[0], b[1], zPos];
        v2 = [ b[0], b[1], zPos+height];
        v3 = [ a[0], a[1], zPos+height];

        n = vec3.normal(v0, v1, v2);
        [].push.apply(buffers.vertices, [].concat(v0, v2, v1, v0, v3, v2));
        [].push.apply(buffers.normals,  [].concat(n, n, n, n, n, n));
        [].push.apply(buffers.colors,   [].concat(color, color, color, color, color, color));

        tx1 = (texCoord[0]*L) <<0;
        tx2 = (texCoord[1]*L) <<0;

        buffers.texCoords.push(
          tx1, ty2,
          tx2, ty1,
          tx2, ty2,

          tx1, ty2,
          tx1, ty1,
          tx2, ty1
        );
      }
    }
  }//,

  // extrusionXX: function(buffers, a, b, height, zPos, color) {
  //   zPos = zPos || 0;
  //   var v0, v1, v2, v3, n;
  //
  //   v0 = [ a[0], a[1], zPos];
  //   v1 = [ b[0], b[1], zPos];
  //   v2 = [ b[0], b[1], zPos+height+(b[2] || 0)];
  //   v3 = [ a[0], a[1], zPos+height+(a[2] || 0)];
  //
  //   n = vec3.normal(v0, v1, v2);
  //   [].push.apply(buffers.vertices, [].concat(v0, v2, v1, v0, v3, v2));
  //   [].push.apply(buffers.normals,  [].concat(n, n, n, n, n, n));
  //   [].push.apply(buffers.colors,   [].concat(color, color, color, color, color, color));
  //
  //   buffers.texCoords.push(0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0);
  // }

};


var triangulate = (function() {

  var
    DEFAULT_HEIGHT = 10,
    DEFAULT_COLOR = Qolor.parse('rgb(220, 210, 200)').toArray(),
    METERS_PER_LEVEL = 3;

  var MATERIAL_COLORS = {
    brick: '#cc7755',
    bronze: '#ffeecc',
    canvas: '#fff8f0',
    concrete: '#999999',
    copper: '#a0e0d0',
    glass: '#e8f8f8',
    gold: '#ffcc00',
    plants: '#009933',
    metal: '#aaaaaa',
    panel: '#fff8f0',
    plaster: '#999999',
    roof_tiles: '#f08060',
    silver: '#cccccc',
    slate: '#666666',
    stone: '#996666',
    tar_paper: '#333333',
    wood: '#deb887'
  };

  var BASE_MATERIALS = {
    asphalt: 'tar_paper',
    bitumen: 'tar_paper',
    block: 'stone',
    bricks: 'brick',
    glas: 'glass',
    glassfront: 'glass',
    grass: 'plants',
    masonry: 'stone',
    granite: 'stone',
    panels: 'panel',
    paving_stones: 'stone',
    plastered: 'plaster',
    rooftiles: 'roof_tiles',
    roofingfelt: 'tar_paper',
    sandstone: 'stone',
    sheet: 'canvas',
    sheets: 'canvas',
    shingle: 'tar_paper',
    shingles: 'tar_paper',
    slates: 'slate',
    steel: 'metal',
    tar: 'tar_paper',
    tent: 'canvas',
    thatch: 'plants',
    tile: 'roof_tiles',
    tiles: 'roof_tiles'
    // cardboard
    // eternit
    // limestone
    // straw
  };

  // number of windows per horizontal meter of building wall
  var WINDOWS_PER_METER = 0.5;

  // var EARTH_RADIUS_IN_METERS = 6378137;
  // var EARTH_CIRCUMFERENCE_IN_METERS = EARTH_RADIUS_IN_METERS * Math.PI * 2;
  // var METERS_PER_DEGREE_LATITUDE = EARTH_CIRCUMFERENCE_IN_METERS / 360;
  var METERS_PER_DEGREE_LATITUDE = 6378137 * Math.PI / 180;

  function triangulate(buffers, feature, origin, forcedColor, colorVariance) {
    var scale = [METERS_PER_DEGREE_LATITUDE*Math.cos(origin[1]/180*Math.PI), METERS_PER_DEGREE_LATITUDE];

    // a single feature might split into several items
    alignGeometry(feature.geometry).map(function(geometry) {
      var polygon = transform(geometry, origin, scale);
      addBuilding(buffers, feature.properties, polygon, forcedColor, colorVariance);
    });
  }

  //***************************************************************************

  // converts all coordinates of all rings in 'polygonRings' from lat/lon pairs to offsets from origin
  function transform(geometry, origin, scale) {
    return geometry.map(function(ring, i) {
      // outer ring (first ring) needs to be clockwise, inner rings
      // counter-clockwise. If they are not, make them by reverting order.
      if ((i === 0) !== isClockWise(ring)) {
        ring.reverse();
      }

      return ring.map(function(point) {
        return [
          (point[0]-origin[0])*scale[0],
          -(point[1]-origin[1])*scale[1]
        ];
      });
    });
  }

  function isClockWise(ring) {
    return 0 < ring.reduce(function(a, b, c, d) {
      return a + ((c < d.length - 1) ? (d[c+1][0] - b[0]) * (d[c+1][1] + b[1]) : 0);
    }, 0);
  }

  function getBBox(ring) {
    var
      x =  Infinity, y =  Infinity,
      X = -Infinity, Y = -Infinity;

    for (var i = 0; i < ring.length; i++) {
      x = Math.min(x, ring[i][0]);
      y = Math.min(y, ring[i][1]);

      X = Math.max(X, ring[i][0]);
      Y = Math.max(Y, ring[i][1]);
    }

    return { minX:x, minY:y, maxX:X, maxY:Y };
  }

  // TODO: handle GeometryCollection
  function alignGeometry(geometry) {
    switch (geometry.type) {
      case 'MultiPolygon': return geometry.coordinates;
      case 'Polygon': return [geometry.coordinates];
      default: return [];
    }
  }

  // TODO: colorVariance = (id/2%2 ? -1 : +1)*(id%2 ? 0.03 : 0.06)

  function getMaterialColor(str) {
    if (typeof str !== 'string') {
      return null;
    }
    str = str.toLowerCase();
    if (str[0] === '#') {
      return str;
    }
    return MATERIAL_COLORS[BASE_MATERIALS[str] || str] || null;
  }

  function varyColor(col, variance) {
    variance = variance || 0;
    var
      color = Qolor.parse(col),
      rgb;
    if (!color.isValid) {
      rgb = DEFAULT_COLOR;
    } else {
      rgb = color.lightness(1.2).saturation(0.66).toArray();
    }
    return [rgb[0]+variance, rgb[1]+variance, rgb[2]+variance];
  }

  //***************************************************************************

  // TODO: add floor polygons if items have minHeight
  function addBuilding(buffers, properties, polygon, forcedColor, colorVariance) {
    var
      dim = getDimensions(properties, getBBox(polygon[0])),
      wallColor = varyColor((forcedColor || properties.wallColor || properties.color || getMaterialColor(properties.material)), colorVariance),
      roofColor = varyColor((forcedColor || properties.roofColor || getMaterialColor(properties.roofMaterial)), colorVariance);

    //*** process buildings that don't require a roof *************************

    switch (properties.shape) {
      case 'cone':
        split.cylinder(buffers, dim.center, dim.radius, 0, dim.wallHeight, dim.wallZ, wallColor);
        return;

      case 'dome':
        split.dome(buffers, dim.center, dim.radius, dim.wallHeight, dim.wallZ, wallColor);
        return;

      case 'pyramid':
        split.pyramid(buffers, polygon, dim.center, dim.wallHeight, dim.wallZ, wallColor);
        return;

      case 'sphere':
        split.sphere(buffers, dim.center, dim.radius, dim.wallHeight, dim.wallZ, wallColor);
        return;
    }

    //*** process roofs *******************************************************

    createRoof(buffers, properties, polygon, dim, roofColor, wallColor);
    
    //*** process remaining buildings *****************************************

    switch(properties.shape) {
      case 'none':
        // no walls at all
        return;

      case 'cylinder':
        split.cylinder(buffers, dim.center, dim.radius, dim.radius, dim.wallHeight, dim.wallZ, wallColor);
        return;

      default: // extruded polygon
        var ty1 = 0.2;
        var ty2 = 0.4;
        // non-continuous windows
        if (properties.material !== 'glass') {
          ty1 = 0;
          ty2 = 0;
          if (properties.levels) {
            ty2 = (parseFloat(properties.levels) - parseFloat(properties.minLevel || 0))<<0;
          }
        }
        split.extrusion(buffers, polygon, dim.wallHeight, dim.wallZ, wallColor, [0, WINDOWS_PER_METER, ty1/dim.wallHeight, ty2/dim.wallHeight]);
    }
  }

  function getDimensions(properties, bbox) {
    var dim = {};

    dim.center = [bbox.minX + (bbox.maxX - bbox.minX)/2, bbox.minY + (bbox.maxY - bbox.minY)/2];
    dim.radius = (bbox.maxX - bbox.minX)/2;

    //*** roof height *********************************************************

    dim.roofHeight = properties.roofHeight || (properties.roofLevels ? properties.roofLevels*METERS_PER_LEVEL : 0);

    switch (properties.roofShape) {
      case 'cone':
      case 'pyramid':
      case 'dome':
      case 'onion':
        dim.roofHeight = dim.roofHeight || 1*dim.radius;
        break;

      case 'gabled':
      case 'hipped':
      case 'half-hipped':
      case 'skillion':
      case 'gambrel':
      case 'mansard':
      case 'round':
         dim.roofHeight = dim.roofHeight || 1*METERS_PER_LEVEL;
         break;

      case 'flat':
        dim.roofHeight = 0;
        break;

      default:
        // roofs we don't handle should not affect wallHeight
        dim.roofHeight = 0;
    }

    //*** wall height *********************************************************

    var maxHeight;
    dim.wallZ = properties.minHeight || (properties.minLevel ? properties.minLevel*METERS_PER_LEVEL : 0);

    if (properties.height !== undefined) {
      maxHeight = properties.height;
      dim.roofHeight = Math.min(dim.roofHeight, maxHeight); // we don't want negative wall heights after subtraction
      dim.roofZ = maxHeight-dim.roofHeight;
      dim.wallHeight = maxHeight - dim.roofHeight - dim.wallZ;
    } else if (properties.levels !== undefined) {
      maxHeight = properties.levels*METERS_PER_LEVEL;
      // dim.roofHeight remains unchanged
      dim.roofZ = maxHeight;
      dim.wallHeight = maxHeight - dim.wallZ;
    } else {
      switch (properties.shape) {
        case 'cone':
        case 'dome':
        case 'pyramid':
          maxHeight = 2*dim.radius;
          dim.roofHeight = 0;
          break;

        case 'sphere':
          maxHeight = 4*dim.radius;
          dim.roofHeight = 0;
          break;

        // case 'none': // no walls at all
        // case 'cylinder':
        default:
          maxHeight = DEFAULT_HEIGHT;
      }
      dim.roofZ = maxHeight;
      dim.wallHeight = maxHeight - dim.wallZ;
    }

    return dim;
  }

  return triangulate;

}());


if (CustomEvent === undefined) {
  var CustomEvent = function(type, params) {
    params = params || { bubbles: false, cancelable: false, detail: undefined };
    var e = document.createEvent('CustomEvent');
    e.initCustomEvent(type, params.bubbles, params.cancelable, params.detail );
    return e;
  };

  CustomEvent.prototype = window.Event.prototype;
}

var APP, GL; // TODO: make them local references

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
 * User defined callback function for getTarget()
 * @callback getTargetCallback
 * @param {Object} feature The feature
 */

/**
 * User defined callback function for screenshot()
 * @callback screenshotCallback
 * @param {Image} screenshot The screenshot
 */

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
 *       can accurately be represented within the limited accuracy of IEEE floats. */

/**
 * @class OSMBuildings
 * @param {Object} [options] OSMBuildings options
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
 * @param {String} [options.baseURL='.'] For locating assets. This is relative to calling html page
 * @param {Boolean} [options.showBackfaces=false] Render front and backsides of polygons. false increases performance, true might be needed for bad geometries
 * @param {String} [options.fogColor='#e8e0d8'] Color to be used for sky gradients and distance fog
 * @param {String} [options.backgroundColor='#efe8e0'] Overall background color
 * @param {String} [options.highlightColor='#f08000'] Default color for highlighting features
 * @param {Boolean} [options.fastMode=false] Enables faster rendering at cost of image quality. If performance is an issue, consider also removing effects
 * @param {Array} [options.effects=[]] Which effects to enable. The only effect at the moment is 'shadows'
 * @param {Object} [options.style] Sets the default building style
 * @param {String} [options.style.color='rgb(220, 210, 200)'] Sets the default building color
 */
var OSMBuildings = function(options) {
  APP = this; // refers to 'this'. Should make other globals obsolete.

  APP.options = (options || {});

  if (APP.options.style) {
    var style = APP.options.style;
    if (style.color || style.wallColor) {
      DEFAULT_COLOR = Qolor.parse(style.color || style.wallColor).toArray();
    }
  }

  APP.baseURL = APP.options.baseURL || '.';

  render.backgroundColor = Qolor.parse(APP.options.backgroundColor || BACKGROUND_COLOR).toArray();
  render.fogColor        = Qolor.parse(APP.options.fogColor        || FOG_COLOR).toArray();

  if (APP.options.highlightColor) {
    HIGHLIGHT_COLOR = Qolor.parse(APP.options.highlightColor).toArray();
  }

  render.Buildings.showBackfaces = APP.options.showBackfaces;

  render.effects = {};
  var effects = APP.options.effects || [];
  for (var i = 0; i < effects.length; i++) {
    render.effects[ effects[i] ] = true;
  }

  APP.attribution = APP.options.attribution || OSMBuildings.ATTRIBUTION;

  APP.minZoom = Math.max(parseFloat(APP.options.minZoom || MIN_ZOOM), MIN_ZOOM);
  APP.maxZoom = Math.min(parseFloat(APP.options.maxZoom || MAX_ZOOM), MAX_ZOOM);
  if (APP.maxZoom < APP.minZoom) {
    APP.minZoom = MIN_ZOOM;
    APP.maxZoom = MAX_ZOOM;
  }

  APP.bounds = APP.options.bounds;

  APP.position = APP.options.position || { latitude: 52.520000, longitude: 13.410000 };
  APP.zoom = APP.options.zoom || (APP.minZoom + (APP.maxZoom-APP.minZoom)/2);
  APP.rotation = APP.options.rotation || 0;
  APP.tilt = APP.options.tilt || 0;

  if (APP.options.disabled) {
    APP.setDisabled(true);
  }
};

/**
 * (String) OSMBuildings version
 * @static
 */
OSMBuildings.VERSION = '3.2.7';

/**
 * (String) OSMBuildings attribution
 * @static
 */
OSMBuildings.ATTRIBUTION = '<a href="https://osmbuildings.org/">© OSM Buildings</a>';

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


OSMBuildings.prototype = {

  /**
   * Adds OSMBuildings to DOM container
   * @param {HTMLElement|String} container A DOM Element or its id to append the map to
   * @param {Integer} [width] Enforce width of container
   * @param {Integer} [height] Enforce height of container
   */
  appendTo: function(container, width, height) {
    if (typeof container === 'string') {
      container = document.getElementById(container);
    }

    APP.container = document.createElement('DIV');
    APP.container.className = 'osmb';
    if (container.offsetHeight === 0) {
      container.style.height = '100%';
      console.warn('Map container height should be set. Now defaults to 100%.');
    }
    container.appendChild(APP.container);

    APP.width  = width  !== undefined ? width  : container.offsetWidth;
    APP.height = height !== undefined ? height : container.offsetHeight;

    var canvas = document.createElement('CANVAS');
    canvas.className = 'osmb-viewport';
    canvas.width = APP.width;
    canvas.height = APP.width;
    APP.container.appendChild(canvas);

    GL = GLX.getContext(canvas);

    Events.init(canvas);

    APP._getStateFromUrl();
    if (APP.options.state) {
      APP._setStateToUrl();
      APP.on('change', APP._setStateToUrl);
    }

    APP._attribution = document.createElement('DIV');
    APP._attribution.className = 'osmb-attribution';
    APP.container.appendChild(APP._attribution);
    APP._updateAttribution();

    APP.setDate(new Date());
    render.start();

    return APP;
  },

  /**
   * Adds an event listener
   * @param {String} type Event type to listen for
   * @param {eventCallback} fn Callback function
   */
  on: function(type, fn) {
    GL.canvas.addEventListener(type, fn);
    return APP; // DEPRECATED
  },

  /**
   * Removes event listeners
   * @param {String} type Event type to listen for
   * @param {eventCallback} [fn] If callback is given, only remove that particular listener
   */
  off: function(type, fn) {
    GL.canvas.removeEventListener(type, fn);
  },

  /**
   * Trigger a specific event
   * @param {String} event Event type to listen for
   * @param {any} [payload] Any kind of payload
   */
  emit: function(type, payload) {
    if (GL !== undefined) {
      var event = new CustomEvent(type, { detail: payload });
      GL.canvas.dispatchEvent(event);
    }
  },

  /**
   * Set date for shadow calculations
   * @param {Date} date
   */
  setDate: function(date) {
    Sun.setDate(typeof date === 'string' ? new Date(date) : date);
    return APP; // DEPRECATED
  },

  // TODO: this should be part of the underlying map engine
  /**
   * Get screen position from a 3d point
   * @param {Number} latitude Latitude of the point
   * @param {Number} longitude Longitude of the point
   * @param {Number} elevation Elevation of the point
   * @return {Object} Screen position in pixels { x, y }
   */
  project: function(latitude, longitude, elevation) {
    var
      metersPerDegreeLongitude = METERS_PER_DEGREE_LATITUDE *
                                 Math.cos(APP.position.latitude / 180 * Math.PI),
      worldPos = [ (longitude- APP.position.longitude) * metersPerDegreeLongitude,
                  -(latitude - APP.position.latitude)  * METERS_PER_DEGREE_LATITUDE,
                    elevation                          * HEIGHT_SCALE ];
    // takes current cam pos into account.
    var posNDC = transformVec3( render.viewProjMatrix.data, worldPos);
    posNDC = mul3scalar( add3(posNDC, [1, 1, 1]), 1/2); // from [-1..1] to [0..1]

    return { x:    posNDC[0]  * APP.width,
             y: (1-posNDC[1]) * APP.height,
             z:    posNDC[2]
    };
  },

  // TODO: this should be part of the underlying map engine
  /**
   * Turns a screen point (x, y) into a geographic position (latitude/longitude/elevation=0).
   * Returns 'undefined' if point would be invisible or lies above horizon.
   * @param {Number} x X position on screen
   * @param {Number} y Y position om screen
   * @return {Object} Geographic position { latitude, longitude }
   */
  unproject: function(x, y) {
    var inverse = GLX.Matrix.invert(render.viewProjMatrix.data);
    /* convert window/viewport coordinates to NDC [0..1]. Note that the browser
     * screen coordinates are y-down, while the WebGL NDC coordinates are y-up,
     * so we have to invert the y value here */
    var posNDC = [x/APP.width, 1-y/APP.height];
    posNDC = add2( mul2scalar(posNDC, 2.0), [-1, -1, -1]); // [0..1] to [-1..1];
    var worldPos = getIntersectionWithXYPlane(posNDC[0], posNDC[1], inverse);
    if (worldPos === undefined) {
      return;
    }
    var metersPerDegreeLongitude = METERS_PER_DEGREE_LATITUDE * Math.cos(APP.position.latitude / 180 * Math.PI);

    return {
      latitude:  APP.position.latitude - worldPos[1]/ METERS_PER_DEGREE_LATITUDE,
      longitude: APP.position.longitude+ worldPos[0]/ metersPerDegreeLongitude
    };
  },

  /**
   * Adds an 3D object (OBJ format) file to the map.<br>
   * <em>Important</em>: objects with exactly the same url are cached and only loaded once.<br>
   * In order to remove the object, use myObj.destroy()
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
  addOBJ: function(url, position, options) {
    return new mesh.OBJ(url, position, options);
  },

  /**
   * Adds a GeoJSON object to the map.<br>
   * In order to remove the object use myObj.destroy()
   * @param {String} url URL of the GeoJSON file or a JavaScript Object representing a GeoJSON FeatureCollection
   * @param {Object} [options] Options to apply to the GeoJSON being rendered
   * @param {Number} [options.scale=1] Scale the model by this value before rendering
   * @param {Number} [options.rotation=0] Rotate the model by this much before rendering
   * @param {Number} [options.elevation=<ground height>] The height above ground to place the model at
   * @param {String} [options.id] An identifier for the object. This is used for getting info about the object later
   * @param {String} [options.color] A color to apply to the model
   * @param {Number} [options.minZoom=14.5] Minimum zoom level to show this feature, defaults to and limited by global minZoom
   * @param {Number} [options.maxZoom=maxZoom] Maximum zoom level to show this feature, defaults to and limited by global maxZoom
   * @param {Boolean} [options.fadeIn=true] Fade GeoJSON features; if `false`, then display immediately
   * @return {Object} The added object
   */
  addGeoJSON: function(url, options) {
    return new mesh.GeoJSON(url, options);
  },

  // TODO: allow more data layers later on
  /**
   * Adds a GeoJSON tile layer to the map.<br>
   * This is for continuous building coverage.<br>
   * In order to remove the layer use myLayer.destroy()
   * @param {String} [url=https://{s}.data.osmbuildings.org/0.2/{k}/tile/{z}/{x}/{y}.json] url The URL of the GeoJSON tile server
   * @param {Object} [options]
   * @param {Number} [options.fixedZoom=15] Tiles are fetched for this zoom level only. Other zoom levels are scaled up/down to this value
   * @param {String} [options.color] A color to apply to all features on this layer
   * @param {Number} [options.minZoom=14.5] Minimum zoom level to show features from this layer. Defaults to and limited by global minZoom.
   * @param {Number} [options.maxZoom=maxZoom] Maximum zoom level to show features from this layer. Defaults to and limited by global maxZoom.
   * @param {Boolean} [options.fadeIn=true] Fade GeoJSON features. If `false`, then display immediately.
   * @return {Object} The added layer object
   */
  addGeoJSONTiles: function(url, options) {
    options = options || {};
    options.fixedZoom = options.fixedZoom || 15;
    APP.dataGrid = new Grid(url, data.Tile, options);
    return APP.dataGrid;
  },

  /**
   * Adds a 2d base map source. This renders below the buildings.<br>
   * In order to remove the layer use myLayer.destroy()
   * @param {String} url The URL of the map server. This could be from Mapbox or other tile servers
   * @return {Object} The added layer object
   */
  addMapTiles: function(url) {
    APP.basemapGrid = new Grid(url, basemap.Tile);
    return APP.basemapGrid;
  },

  /**
   * Highlight a given feature by id.<br>
   * Currently, the highlight can only be applied to one feature.<br>
   * Set id to `null` in order to un-highlight.
   * @param {String} id The feature's id. For OSM buildings, it's the OSM id. For other objects, it's whatever is defined in the options passed to it.
   * @param {String} highlightColor An optional color string to be used for highlighting
   */
  highlight: function(id, highlightColor) {
    render.Buildings.highlightId = id ? render.Picking.idToColor(id) : null;
    render.Buildings.highlightColor = id && highlightColor ? Qolor.parse(highlightColor).toArray() : HIGHLIGHT_COLOR;
    return APP; // DEPRECATED
  },

  // TODO: check naming. show() suggests it affects the layer rather than objects on it

  /**
   * Sets a function that selects objects to show on this layer
   * @param {selectorCallback} selector A function that will get run on each feature, and returns a boolean indicating whether or not to show the feature
   * @param {Integer} [duration=0] How long to fade out the feature
   */
  show: function(selector, duration) {
    Filter.remove('hidden', selector, duration);
    return APP; // DEPRECATED
  },

  // TODO: check naming. hide() suggests it affects the layer rather than objects on it

  /**
   * Sets a function that defines which objects to hide on this layer
   * @param {selectorCallback} selector A function that will get run on each feature, and returns a boolean indicating whether or not to hide the feature
   * @param {Integer} [duration=0] How long to fade in the feature
   */
  hide: function(selector, duration) {
    Filter.add('hidden', selector, duration);
    return APP; // DEPRECATED
  },

  /**
   * Returns the feature from a position on the screen. <em>Works asynchronous.</em>
   * @param {Integer} x X coordinate (in pixels) of position on the screen
   * @param {Integer} y Y coordinate (in pixels) of position on the screen
   * @param {getTargetCallback} callback Callback function that receives the object
   */
  getTarget: function(x, y, callback) {
    // TODO: use promises here
    render.Picking.getTarget(x, y, callback);
    return APP; // DEPRECATED
  },

  /**
   * Take a screenshot. <em>Works asynchronous.</em>
   * @param {screenshotCallback} callback Callback function that receives the screenshot
   */
  screenshot: function(callback) {
    // TODO: use promises here
    render.screenshotCallback = callback;
    return APP; // DEPRECATED
  },

  /**
   * @private
   */
  _updateAttribution: function() {
    var attribution = [];
    if (APP.attribution) {
      attribution.push(APP.attribution);
    }
    // for (var i = 0; i < APP.layers.length; i++) {
    //   if (APP.layers[i].attribution) {
    //     attribution.push(APP.layers[i].attribution);
    //   }
    // }
    APP._attribution.innerHTML = attribution.join(' · ');
  },

  /**
   * @private
   */
  _getStateFromUrl: function() {
    var
      query = location.search,
      state = {};
    if (query) {
      query.substring(1).replace(/(?:^|&)([^&=]*)=?([^&]*)/g, function($0, $1, $2) {
        if ($1) {
          state[$1] = $2;
        }
      });
    }

    APP.setPosition((state.lat !== undefined && state.lon !== undefined) ? { latitude:state.lat, longitude:state.lon } : APP.position);
    APP.setZoom(state.zoom !== undefined ? state.zoom : APP.zoom);
    APP.setRotation(state.rotation !== undefined ? state.rotation : APP.rotation);
    APP.setTilt(state.tilt !== undefined ? state.tilt : APP.tilt);
  },

  /**
   * @private
   */
  _setStateToUrl: function() {
    if (!history.replaceState || APP.stateDebounce) {
      return;
    }

    APP.stateDebounce = setTimeout(function() {
      APP.stateDebounce = null;
      var params = [];
      params.push('lat=' + APP.position.latitude.toFixed(6));
      params.push('lon=' + APP.position.longitude.toFixed(6));
      params.push('zoom=' + APP.zoom.toFixed(1));
      params.push('tilt=' + APP.tilt.toFixed(1));
      params.push('rotation=' + APP.rotation.toFixed(1));
      history.replaceState({}, '', '?' + params.join('&'));
    }, 1000);
  },

  setDisabled: function(flag) {
    Events.disabled = !!flag;
    return APP;
  },

  isDisabled: function() {
    return !!Events.disabled;
  },

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
  getBounds: function() {
    var viewQuad = render.getViewQuad(), res = [];
    for (var i in viewQuad) {
      res[i] = getPositionFromLocal(viewQuad[i]);
    }
    return res;
  },

  /**
   * Set zoom level
   * @emits OSMBuildings#zoom
   * @emits OSMBuildings#change
   * @param {Number} zoom The new zoom level
   */
  setZoom: function(zoom, e) {
    zoom = parseFloat(zoom);

    zoom = Math.max(zoom, APP.minZoom);
    zoom = Math.min(zoom, APP.maxZoom);

    if (APP.zoom !== zoom) {
      APP.zoom = zoom;

      /* if a screen position was given for which the geographic position displayed
       * should not change under the zoom */
      if (e) {
        // FIXME: add code; this needs to take the current camera (rotation and
        //        perspective) into account
        // NOTE:  the old code (comment out below) only works for north-up
        //        non-perspective views
        /*
         var dx = APP.container.offsetWidth/2  - e.clientX;
         var dy = APP.container.offsetHeight/2 - e.clientY;
         APP.center.x -= dx;
         APP.center.y -= dy;
         APP.center.x *= ratio;
         APP.center.y *= ratio;
         APP.center.x += dx;
         APP.center.y += dy;*/
      }

      APP.emit('zoom', { zoom: zoom });
      APP.emit('change');
    }

    return APP; // DEPRECATED
  },

  /**
   * Get current zoom level
   * @return {Number} zoom level
   */
  getZoom: function() {
    return APP.zoom;
  },

  /**
   * Set map's geographic position
   * @param {Object} pos The new position
   * @param {Number} pos.latitude
   * @param {Number} pos.longitude
   * @emits OSMBuildings#change
   */
  setPosition: function(pos) {
    var lat = parseFloat(pos.latitude);
    var lon = parseFloat(pos.longitude);
    if (isNaN(lat) || isNaN(lon)) {
      return;
    }
    APP.position = { latitude: clamp(lat, -90, 90), longitude: clamp(lon, -180, 180) };
    APP.emit('change');
    return APP; // DEPRECATED
  },

  /**
   * Get map's current geographic position
   * @return {Object} Geographic position { latitude, longitude }
   */
  getPosition: function() {
    return APP.position;
  },

  /**
   * Set map view's size in pixels
   * @public
   * @param {Object} size
   * @param {Integer} size.width
   * @param {Integer} size.height
   * @emits OSMBuildings#resize
   */
  setSize: function(size) {
    if (size.width !== APP.width || size.height !== APP.height) {
      APP.width = size.width;
      APP.height = size.height;
      APP.emit('resize', { width: APP.width, height: APP.height });
    }

    return APP; // DEPRECATED
  },

  /**
   * Get map's current view size in pixels
   * @return {Object} View size { width, height }
   */
  getSize: function() {
    return { width: APP.width, height: APP.height };
  },

  /**
   * Set map's rotation
   * @param {Number} rotation The new rotation angle in degrees
   * @emits OSMBuildings#rotate
   * @emits OSMBuildings#change
   */
  setRotation: function(rotation) {
    rotation = parseFloat(rotation)%360;
    if (APP.rotation !== rotation) {
      APP.rotation = rotation;
      APP.emit('rotate', { rotation: rotation });
      APP.emit('change');
    }

    return APP; // DEPRECATED
  },

  /**
   * Get map's current rotation
   * @return {Number} Rotation in degrees
   */
  getRotation: function() {
    return APP.rotation;
  },

  /**
   * Set map's tilt
   * @param {Number} tilt The new tilt in degree
   * @emits OSMBuildings#tilt
   * @emits OSMBuildings#change
   */
  setTilt: function(tilt) {
    tilt = clamp(parseFloat(tilt), 0, 45); // bigger max increases shadow moire on base map
    if (APP.tilt !== tilt) {
      APP.tilt = tilt;
      APP.emit('tilt', { tilt: tilt });
      APP.emit('change');
    }
    return APP; // DEPRECATED
  },

  /**
   * Get map's current tilt
   * @return {Number} Tilt in degrees
   */
  getTilt: function() {
    return APP.tilt;
  },

  /**
   * Destroys the map
   */
  destroy: function() {
    render.destroy();

    // APP.basemapGrid.destroy();
    // APP.dataGrid.destroy();

    // TODO: when taking over an existing canvas, better don't destroy it here
    GLX.destroy();

    data.Index.destroy();

    APP.container.innerHTML = '';
  }
};

//*****************************************************************************

if (typeof define === 'function') {
  define([], OSMBuildings);
} else if (typeof module === 'object') {
  module.exports = OSMBuildings;
} else {
  window.OSMBuildings = OSMBuildings;
}

// gesture polyfill adapted from https://raw.githubusercontent.com/seznam/JAK/master/lib/polyfills/gesturechange.js
// MIT License

/**
 * @private
 */
function add2(a, b) {
  return [a[0] + b[0], a[1] + b[1]];
}

/**
 * @private
 */
function mul2scalar(a, f) {
  return [a[0]*f, a[1]*f];
}

function getPos(e) {
  var el = e.target;

  if (el.getBoundingClientRect) {
    var box = el.getBoundingClientRect();
    if (box !== undefined) {
      return { x: e.x-box.left, y: e.y-box.top };
    }
  }

  var res = { x: 0, y: 0 };
  while (el.nodeType === 1) {
    res.x += el.offsetLeft;
    res.y += el.offsetTop;
    el = el.parentNode;
  }
  return { x: e.x-res.s, y: e.y-res.y };
}

/**
 * @private
 */
function cancelEvent(e) {
  if (e.preventDefault) {
    e.preventDefault();
  }
  //if (e.stopPropagation) {
  //  e.stopPropagation();
  //}
  e.returnValue = false;
}

/**
 * @private
 */
function addListener(target, type, fn) {
  target.addEventListener(type, fn, false);
}

/**
 * @private
 */
var Events = {};

/**
 * @private
 */
Events.disabled = false;

/**
 * @private
 */
Events.init = function(container) {

  if ('ontouchstart' in window) {
    addListener(container, 'touchstart', onTouchStart);
    addListener(document, 'touchmove', onTouchMoveDocument);
    addListener(container, 'touchmove', onTouchMove);
    addListener(document, 'touchend', onTouchEnd);
    addListener(document, 'gesturechange', onGestureChange);
  } else {
    addListener(container, 'mousedown', onMouseDown);
    addListener(document, 'mousemove', onMouseMoveDocument);
    addListener(container, 'mousemove', onMouseMove);
    addListener(document, 'mouseup', onMouseUp);
    addListener(container, 'dblclick', onDoubleClick);
    addListener(container, 'mousewheel', onMouseWheel);
    addListener(container, 'DOMMouseScroll', onMouseWheel);
    addListener(container, 'contextmenu', onContextMenu);
  }

  var resizeDebounce;
  addListener(window, 'resize', function() {
    if (resizeDebounce) {
      return;
    }
    resizeDebounce = setTimeout(function() {
      resizeDebounce = null;
      APP.setSize({ width: container.offsetWidth, height: container.offsetHeight });
    }, 250);
  });

  //***************************************************************************

  var
    startX = 0,
    startY = 0,
    prevX = 0,
    prevY = 0,
    startZoom = 0,
    prevRotation = 0,
    prevTilt = 0,
    button = 0;

  function onDoubleClick(e) {
    cancelEvent(e);
    if (!Events.disabled) {
      APP.setZoom(APP.zoom + 1, e);
    }
    var pos = getPos(e);
    APP.emit('doubleclick', { x: pos.x, y: pos.y, button: e.button, buttons: e.buttons });
  }

  function onMouseDown(e) {
    cancelEvent(e);

    startZoom = APP.zoom;
    prevRotation = APP.rotation;
    prevTilt = APP.tilt;

    startX = prevX = e.clientX;
    startY = prevY = e.clientY;

    if ((e.buttons === 1 && e.altKey) || e.buttons === 2) {
      button = 2;
    } else if (e.buttons === 1) {
      button = 1;
    }

    var pos = getPos(e);
    APP.emit('pointerdown', { x: pos.x, y: pos.y, button: e.button, buttons: e.buttons });
  }

  function onMouseMoveDocument(e) {
    if (button === 1) {
      moveMap(e);
    } else if (button === 2) {
      rotateMap(e);
    }

    prevX = e.clientX;
    prevY = e.clientY;
  }

  function onMouseMove(e) {
    APP.emit('pointermove', getPos(e));
  }

  function onMouseUp(e) {
    // prevents clicks on other page elements
    if (!button) {
      return;
    }

    if (button === 1) {
      moveMap(e);
    } else if (button === 2) {
      rotateMap(e);
    }

    button = 0;
    APP.emit('pointerup', { button: e.button, buttons: e.buttons });
  }

  function onMouseWheel(e) {
    cancelEvent(e);

    var delta = 0;
    if (e.wheelDeltaY) {
      delta = e.wheelDeltaY;
    } else if (e.wheelDelta) {
      delta = e.wheelDelta;
    } else if (e.detail) {
      delta = -e.detail;
    }

    if (!Events.disabled) {
      var adjust = 0.2*(delta>0 ? 1 : delta<0 ? -1 : 0);
      APP.setZoom(APP.zoom + adjust, e);
    }

    // we don't emit mousewheel here as we don't want to run into a loop of death
  }

  function onContextMenu(e) {
    e.preventDefault();
  }

  //***************************************************************************

  function moveMap(e) {
    if (Events.disabled) {
      return;
    }

    // FIXME: make movement exact
    // the constant 0.86 was chosen experimentally for the map movement to be
    // "pinned" to the cursor movement when the map is shown top-down
    var
      scale = 0.86*Math.pow(2, -APP.zoom),
      lonScale = 1/Math.cos(APP.position.latitude/180*Math.PI),
      dx = e.clientX - prevX,
      dy = e.clientY - prevY,
      angle = APP.rotation*Math.PI/180,
      vRight = [Math.cos(angle), Math.sin(angle)],
      vForward = [Math.cos(angle - Math.PI/2), Math.sin(angle - Math.PI/2)],
      dir = add2(mul2scalar(vRight, dx), mul2scalar(vForward, -dy));

    var newPosition = {
      longitude: APP.position.longitude - dir[0]*scale*lonScale,
      latitude: APP.position.latitude + dir[1]*scale
    };

    APP.setPosition(newPosition);
    APP.emit('move', newPosition);
  }

  function rotateMap(e) {
    if (Events.disabled) {
      return;
    }
    prevRotation += (e.clientX - prevX)*(360/innerWidth);
    prevTilt -= (e.clientY - prevY)*(360/innerHeight);
    APP.setRotation(prevRotation);
    APP.setTilt(prevTilt);
  }

  //***************************************************************************

  var
    dist1 = 0,
    angle1 = 0,
    gestureStarted = false;

  function emitGestureChange(e) {
    var
      t1 = e.touches[0],
      t2 = e.touches[1],
      dx = t1.clientX - t2.clientX,
      dy = t1.clientY - t2.clientY,
      dist2 = dx*dx + dy*dy,
      angle2 = Math.atan2(dy, dx);

    onGestureChange({ rotation: ((angle2 - angle1)*(180/Math.PI))%360, scale: Math.sqrt(dist2/dist1) });
  }

  function onTouchStart(e) {
    button = 1;
    cancelEvent(e);

    var t1 = e.touches[0];

    // gesturechange polyfill
    if (e.touches.length === 2 && !('ongesturechange' in window)) {
      var t2 = e.touches[1];
      var dx = t1.clientX - t2.clientX;
      var dy = t1.clientY - t2.clientY;
      dist1 = dx*dx + dy*dy;
      angle1 = Math.atan2(dy, dx);
      gestureStarted = true;
    }

    startZoom = APP.zoom;
    prevRotation = APP.rotation;
    prevTilt = APP.tilt;

    startX = prevX = t1.clientX;
    startY = prevY = t1.clientY;

    APP.emit('pointerdown', { x: e.x, y: e.y, button: 0, buttons: 1 });
  }

  function onTouchMoveDocument(e) {
    if (!button) {
      return;
    }

    var t1 = e.touches[0];

    if (e.touches.length>1) {
      APP.setTilt(prevTilt + (prevY - t1.clientY)*(360/innerHeight));
      prevTilt = APP.tilt;
      // gesturechange polyfill
      if (!('ongesturechange' in window)) {
        emitGestureChange(e);
      }
    } else {
      moveMap(t1);
    }
    prevX = t1.clientX;
    prevY = t1.clientY;
  }

  function onTouchMove(e) {
    if (e.touches.length === 1) {
      var pos = getPos(e.touches[0]);
      APP.emit('pointermove', { x: pos.x, y: pos.y, button: 0, buttons: 1 });
    }
  }

  function onTouchEnd(e) {
    if (!button) {
      return;
    }

    // gesturechange polyfill
    gestureStarted = false;

    var t1 = e.touches[0];

    if (e.touches.length === 0) {
      button = 0;
      APP.emit('pointerup', { button: 0, buttons: 1 });
    } else if (e.touches.length === 1) {
      // There is one touch currently on the surface => gesture ended. Prepare for continued single touch move
      prevX = t1.clientX;
      prevY = t1.clientY;
    }
  }

  function onGestureChange(e) {
    if (!button) {
      return;
    }

    cancelEvent(e);

    if (!Events.disabled) {
      APP.setZoom(startZoom + (e.scale - 1));
      APP.setRotation(prevRotation - e.rotation);
    }

    APP.emit('gesture', e);
  }
};


var Activity = {};

// TODO: could turn into a public loading handler
// OSMB.loader - stop(), start(), isBusy(), events..

(function() {

  var count = 0;
  var debounce;

  Activity.setBusy = function() {
    //console.log('setBusy', count);

    if (!count) {
      if (debounce) {
        clearTimeout(debounce);
        debounce = null;
      } else {
        APP.emit('busy');
      }
    }
    count++;
  };

  Activity.setIdle = function() {
    if (!count) {
      return;
    }

    count--;
    if (!count) {
      debounce = setTimeout(function() {
        debounce = null;
        APP.emit('idle');
      }, 33);
    }

    //console.log('setIdle', count);
  };

  Activity.isBusy = function() {
    return !!count;
  };

}());


var TILE_SIZE = 256;

var DEFAULT_HEIGHT = 10;
var HEIGHT_SCALE = 1.0;

var MIN_ZOOM = 14.5;
var MAX_ZOOM = 22;

var MAX_USED_ZOOM_LEVEL = 25;
var DEFAULT_COLOR = Qolor.parse('rgb(220, 210, 200)').toArray();
var HIGHLIGHT_COLOR = Qolor.parse('#f08000').toArray();
// #E8E0D8 is the background color of the current OSMBuildings map layer,
// and thus a good fog color to blend map tiles and buildings close to the horizont into
var FOG_COLOR = '#e8e0d8';
//var FOG_COLOR = '#f0f8ff';
var BACKGROUND_COLOR = '#efe8e0';

var document = window.document;

var EARTH_RADIUS_IN_METERS = 6378137;
var EARTH_CIRCUMFERENCE_IN_METERS = EARTH_RADIUS_IN_METERS * Math.PI * 2;
var METERS_PER_DEGREE_LATITUDE = EARTH_CIRCUMFERENCE_IN_METERS / 360;

/* the height of the skywall in meters */
var SKYWALL_HEIGHT = 2000.0;

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


// TODO: introduce promises

var Request = {};

(function() {

  function load(url, callback) {
    var req = new XMLHttpRequest();

    req.onreadystatechange = function() {
      if (req.readyState !== 4) {
        return;
      }

      if (!req.status || req.status<200 || req.status>299) {
        return;
      }

      callback(req);
    };

    req.open('GET', url);
    req.send(null);

    return {
      abort: function() {
        req.abort();
      }
    };
  }

  //***************************************************************************

  Request.getText = function(url, callback) {
    return load(url, function(res) {
      if (res.responseText !== undefined) {
        callback(res.responseText);
      }
    });
  };

  Request.getXML = function(url, callback) {
    return load(url, function(res) {
      if (res.responseXML !== undefined) {
        callback(res.responseXML);
      }
    });
  };

  Request.getJSON = function(url, callback) {
    return load(url, function(res) {
      if (res.responseText) {
        var json;
        try {
          json = JSON.parse(res.responseText);
        } catch(ex) {
          console.warn('Could not parse JSON from '+ url +'\n'+ ex.message);
        }
        callback(json);
      }
    });
  };

  Request.destroy = function() {};

}());

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


var Grid = function(source, tileClass, options) {
  this.tiles = {};
  this.buffer = 1;

  this.source = source;
  this.tileClass = tileClass;
  options = options || {};

  this.bounds = options.bounds;
  this.fixedZoom = options.fixedZoom;

  this.tileOptions = { color:options.color, fadeIn:options.fadeIn };

  this.minZoom = Math.max(parseFloat(options.minZoom || MIN_ZOOM), APP.minZoom);
  this.maxZoom = Math.min(parseFloat(options.maxZoom || MAX_ZOOM), APP.maxZoom);
  if (this.maxZoom < this.minZoom) {
    this.minZoom = MIN_ZOOM;
    this.maxZoom = MAX_ZOOM;
  }

  APP.on('change', this._onChange = function() {
    this.update(500);
  }.bind(this));

  APP.on('resize', this._onResize = this.update.bind(this));

  this.update();
};

Grid.prototype = {

  // strategy: start loading after delay (ms), skip any attempts until then
  // effectively loads in intervals during movement
  update: function(delay) {
    if (APP.zoom < this.minZoom || APP.zoom > this.maxZoom) {
      return;
    }

    if (!delay) {
      this.loadTiles();
      return;
    }

    if (!this.debounce) {
      this.debounce = setTimeout(function() {
        this.debounce = null;
        this.loadTiles();
      }.bind(this), delay);
    }
  },

  getURL: function(x, y, z) {
    var s = 'abcd'[(x+y) % 4];
    return pattern(this.source, { s:s, x:x, y:y, z:z });
  },
  
  getClosestTiles: function(tileList, referencePoint) {
    tileList.sort(function(a, b) {
      // tile coordinates correspond to the tile's upper left corner, but for
      // the distance computation we should rather use their center; hence the 0.5 offsets
      var distA = Math.pow(a[0] + 0.5 - referencePoint[0], 2.0) +
                  Math.pow(a[1] + 0.5 - referencePoint[1], 2.0);

      var distB = Math.pow(b[0] + 0.5 - referencePoint[0], 2.0) +
                  Math.pow(b[1] + 0.5 - referencePoint[1], 2.0);
      
      return distA > distB;
    });

    var prevX, prevY;

    // removes duplicates
    return tileList.filter(function(tile) {
      if (tile[0] === prevX && tile[1] === prevY) {
        return false;
      }
      prevX = tile[0];
      prevY = tile[1];
      return true;
    });
  },
  
  /* Returns a set of tiles based on 'tiles' (at zoom level 'zoom'),
   * but with those tiles recursively replaced by their respective parent tile
   * (tile from zoom level 'zoom'-1 that contains 'tile') for which said parent
   * tile covers less than 'pixelAreaThreshold' pixels on screen based on the 
   * current view-projection matrix.
   *
   * The returned tile set is duplicate-free even if there were duplicates in
   * 'tiles' and even if multiple tiles from 'tiles' got replaced by the same parent.
   */
  mergeTiles: function(tiles, zoom, pixelAreaThreshold) {
    var parentTiles = {};
    var tileSet = {};
    var tileList = [];
    var key;
    
    // if there is no parent zoom level
    if (zoom === 0 || zoom <= this.minZoom) {
      for (key in tiles) {
        tiles[key][2] = zoom;
      }
      return tiles;
    }
    
    for (key in tiles) {
      var tile = tiles[key];

      var parentX = (tile[0] <<0) / 2;
      var parentY = (tile[1] <<0) / 2;
      
      if (parentTiles[ [parentX, parentY] ] === undefined) { //parent tile screen size unknown
        var numParentScreenPixels = getTileSizeOnScreen(parentX, parentY, zoom-1, render.viewProjMatrix);
        parentTiles[ [parentX, parentY] ] = (numParentScreenPixels < pixelAreaThreshold);
      }
      
      if (! parentTiles[ [parentX, parentY] ]) { //won't be replaced by a parent tile -->keep
        if (tileSet[ [tile[0], tile[1]] ] === undefined) {  //remove duplicates
          tileSet[ [tile[0], tile[1]]] = true;
          tileList.push( [tile[0], tile[1], zoom]);
        }
      }
    }
    
    var parentTileList = [];
    
    for (key in parentTiles) {
      if (parentTiles[key]) {
        var parentTile = key.split(',');
        parentTileList.push( [parseInt(parentTile[0]), parseInt(parentTile[1]), zoom-1]);
      }
    }
    
    if (parentTileList.length > 0) {
      parentTileList = this.mergeTiles(parentTileList, zoom - 1, pixelAreaThreshold);
    }
      
    return tileList.concat(parentTileList);
  },

  loadTiles: function() {
    var zoom = Math.round(this.fixedZoom || APP.zoom);

    // TODO: if there are user defined bounds for this layer, respect these too
    //  if (this.fixedBounds) {
    //    var
    //      min = project(this.bounds.s, this.bounds.w, 1<<zoom),
    //      max = project(this.bounds.n, this.bounds.e, 1<<zoom);
    //
    //    var bounds = {
    //      zoom: zoom,
    //      minX: (min.x <<0) - this.buffer,
    //      minY: (min.y <<0) - this.buffer,
    //      maxX: (max.x <<0) + this.buffer,
    //      maxY: (max.y <<0) + this.buffer
    //    };
    //  }

    var
      tile, tileX, tileY, tileZoom,
      queue = [],
      i,
      viewQuad = render.getViewQuad(render.viewProjMatrix.data),
      mapCenterTile = [ long2tile(APP.position.longitude, zoom),
                        lat2tile (APP.position.latitude,  zoom)];

    for (i = 0; i < 4; i++) {
      viewQuad[i] = getTilePositionFromLocal(viewQuad[i], zoom);
    }

    var tiles = rasterConvexQuad(viewQuad);
    tiles = ( this.fixedZoom ) ?
      this.getClosestTiles(tiles, mapCenterTile) :
      this.mergeTiles(tiles, zoom, 0.5 * TILE_SIZE * TILE_SIZE);
    
    this.visibleTiles = {};
    for (i = 0; i < tiles.length; i++) {
      if (tiles[i][2] === undefined) {
        tiles[i][2] = zoom;
      }
      this.visibleTiles[ tiles[i] ] = true;
    }

    for (var key in this.visibleTiles) {
      tile = key.split(',');
      tileX = parseInt(tile[0]);
      tileY = parseInt(tile[1]);
      tileZoom = parseInt(tile[2]);

      if (this.tiles[key]) {
        continue;
      }

      this.tiles[key] = new this.tileClass(tileX, tileY, tileZoom, this.tileOptions, this.tiles);

      queue.push({ tile:this.tiles[key], dist:distance2([tileX, tileY], mapCenterTile) });
    }

    this.purge();

    queue.sort(function(a, b) {
      return a.dist-b.dist;
    });

    for (i = 0; i < queue.length; i++) {
      tile = queue[i].tile;
      tile.load(this.getURL(tile.x, tile.y, tile.zoom));
    }
  },

  purge: function() {
    var
      zoom = Math.round(APP.zoom),
      tile, parent;

    for (var key in this.tiles) {
      tile = this.tiles[key];
      // tile is visible: keep
      if (this.visibleTiles[key]) {
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
        parent = [tile.x/2<<0, tile.y/2<<0, zoom].join(',');
        if (this.visibleTiles[parent]) {
          continue;
        }
      }

      // any of tile's children would be visible: keep
      if (tile.zoom === zoom-1) {
        if (this.visibleTiles[[tile.x*2, tile.y*2, zoom].join(',')] ||
          this.visibleTiles[[tile.x*2 + 1, tile.y*2, zoom].join(',')] ||
          this.visibleTiles[[tile.x*2, tile.y*2 + 1, zoom].join(',')] ||
          this.visibleTiles[[tile.x*2 + 1, tile.y*2 + 1, zoom].join(',')]) {
          continue;
        }
      }

      // drop anything else
      delete this.tiles[key];
      continue;
    }
  },

  destroy: function() {
    APP.off('change', this._onChange);
    APP.off('resize', this._onResize);

    clearTimeout(this.debounce);
    for (var key in this.tiles) {
      this.tiles[key].destroy();
    }
    this.tiles = [];
    this.visibleTiles = {};
  }
};


var Filter = {

  start: Date.now(),
  now: 0,
  items: [],

  add: function(type, selector, duration) {
    duration = duration || 0;

    var filters = this.items;
    // if filter already exists, do nothing
    for (i = 0, il = filters.length; i < il; i++) {
      if (filters[i].type === type && filters[i].selector === selector) {
        return;
      }
    }

    filters.push({ type:type, selector:selector, duration:duration });

    // applies a single filter to all items
    // currently only suitable for 'hidden'
    var indexItem;
    var item;
    var j, jl;

    var start = this.getTime();
    var end = start+duration;

    for (var i = 0, il = data.Index.items.length; i<il; i++) {
      indexItem = data.Index.items[i];

      if (!indexItem.applyFilter) {
        continue;
      }

      for (j = 0, jl = indexItem.items.length; j < jl; j++) {
        item = indexItem.items[j];
        if (selector(item.id, item.data)) {
          item.filter = [start, end, item.filter ? item.filter[3] : 1, 0];
        }
      }

      indexItem.applyFilter();
    }
  },

  remove: function(type, selector, duration) {
    duration = duration || 0;

    var i, il;

    this.items = this.items.filter(function(item) {
      return (item.type !== type || item.selector !== selector);
    });

    // removes a single filter from all items
    // currently only suitable for 'hidden'
    var indexItem;
    var item;
    var j, jl;

    var start = this.getTime();
    var end = start+duration;

    for (i = 0, il = data.Index.items.length; i<il; i++) {
      indexItem = data.Index.items[i];

      if (!indexItem.applyFilter) {
        continue;
      }

      for (j = 0, jl = indexItem.items.length; j < jl; j++) {
        item = indexItem.items[j];
        if (selector(item.id, item.data)) {
          item.filter = [start, end, item.filter ? item.filter[3] : 0, 1];
        }
      }

      indexItem.applyFilter();
    }
  },

  // applies all existing filters to an item
  // currently only suitable for 'hidden'
  apply: function(indexItem) {
    var filters = this.items;
    var type, selector;
    var item;
    var j, jl;

    if (!indexItem.applyFilter) {
      return;
    }

    for (var i = 0, il = filters.length; i < il; i++) {
      type = filters[i].type;
      selector = filters[i].selector;

      for (j = 0, jl = indexItem.items.length; j < jl; j++) {
        item = indexItem.items[j];
        if (selector(item.id, item.data)) {
          item.filter = [0, 0, 0, 0];
        }
      }
    }

    indexItem.applyFilter();
  },

  getTime: function() {
    return this.now;
  },

  nextTick: function() {
    this.now = Date.now()-this.start;
  },

  destroy: function() {
    this.items = [];
  }
};


// TODO: collision check with bounding cylinders

var data = {
  Index: {
    items: [],

    add: function(item) {
      this.items.push(item);
    },

    remove: function(item) {
      this.items = this.items.filter(function(i) {
        return (i !== item);
      });
    },

    destroy: function() {
      // items are destroyed by grid
      this.items = [];
    }
  }
};


data.Tile = function(x, y, zoom, options) {
  this.x = x;
  this.y = y;
  this.zoom = zoom;
  this.key = [x, y, zoom].join(',');

  this.options = options;
};

data.Tile.prototype = {
  load: function(url) {
    this.mesh = new mesh.GeoJSON(url, this.options);
  },

  destroy: function() {
    if (this.mesh) {
      this.mesh.destroy();
    }
  }
};


var mesh = {};


mesh.GeoJSON = (function() {

  var FEATURES_PER_CHUNK = 90;
  var DELAY_PER_CHUNK = 75;

  function constructor(url, options) {
    options = options || {};

    this.forcedId = options.id;
    // no Qolor.toArray() needed as Triangulation does it internally
    this.forcedColor = options.color;

    this.replace      = !!options.replace;
    this.scale        = options.scale     || 1;
    this.rotation     = options.rotation  || 0;
    this.elevation    = options.elevation || 0;
    this.shouldFadeIn = 'fadeIn' in options ? !!options.fadeIn : true;

    this.minZoom = Math.max(parseFloat(options.minZoom || MIN_ZOOM), APP.minZoom);
    this.maxZoom = Math.min(parseFloat(options.maxZoom || MAX_ZOOM), APP.maxZoom);
    if (this.maxZoom < this.minZoom) {
      this.minZoom = MIN_ZOOM;
      this.maxZoom = MAX_ZOOM;
    }

    this.items = [];

    Activity.setBusy();
    if (typeof url === 'object') {
      var collection = url;
      this.setData(collection);
    } else {
      this.request = Request.getJSON(url, function(collection) {
        this.request = null;
        this.setData(collection);
      }.bind(this));
    }
  }

  constructor.prototype = {

    setData: function(collection) {
      if (!collection || !collection.features.length) {
        return;
      }

      var res = {
        vertices: [],
        normals: [],
        colors: [],
        texCoords: []
      };

      var
        resPickingColors = [],
        position = this.getOrigin(collection.features[0].geometry),
        startIndex = 0,
        numFeatures = collection.features.length,
        endIndex = startIndex + Math.min(numFeatures, FEATURES_PER_CHUNK);

      this.position = { latitude:position[1], longitude:position[0] };

      var process = function() {
        var
          feature, properties, id,
          vertexCountBefore, vertexCount, pickingColor;

        for (var i = startIndex; i < endIndex; i++) {
          feature = collection.features[i];

          APP.emit('loadfeature', feature);
          
          properties = feature.properties;
          id = this.forcedId || properties.relationId || feature.id || properties.id;

          vertexCountBefore = res.vertices.length;

          triangulate(res, feature, position, this.forcedColor);

          vertexCount = (res.vertices.length - vertexCountBefore)/3;

          pickingColor = render.Picking.idToColor(id);
          for (var j = 0; j < vertexCount; j++) {
            [].push.apply(resPickingColors, pickingColor);
          }

          this.items.push({ id:id, vertexCount:vertexCount, height:properties.height, data:properties.data });
        }

        if (endIndex === numFeatures) {
          this.vertexBuffer   = new GLX.Buffer(3, new Float32Array(res.vertices));
          this.normalBuffer   = new GLX.Buffer(3, new Float32Array(res.normals));
          this.colorBuffer    = new GLX.Buffer(3, new Float32Array(res.colors));
          this.texCoordBuffer = new GLX.Buffer(2, new Float32Array(res.texCoords));
          this.idBuffer       = new GLX.Buffer(3, new Float32Array(resPickingColors));
          this._initItemBuffers();

          Filter.apply(this);
          data.Index.add(this);

          this.isReady = true;
          Activity.setIdle();

          return;
        }

        startIndex = endIndex;
        endIndex = startIndex + Math.min((numFeatures-startIndex), FEATURES_PER_CHUNK);

        this.relaxTimer = setTimeout(process, DELAY_PER_CHUNK);
      }.bind(this);

      process();
    },

    _initItemBuffers: function() {
      var
        start = Filter.getTime(),
        end = start;

      if (this.shouldFadeIn) {
        start += 250;
        end += 750;
      }

      var
        filters = [],
        heights = [];

      this.items.forEach(function(item) {
        item.filter = [start, end, 0, 1];
        for (var i = 0; i < item.vertexCount; i++) {
          filters.push.apply(filters, item.filter);
          heights.push(item.height);
        }
      });

      this.filterBuffer = new GLX.Buffer(4, new Float32Array(filters));
      this.heightBuffer = new GLX.Buffer(1, new Float32Array(heights));
    },

    applyFilter: function() {
      var filters = [];
      this.items.forEach(function(item) {
        for (var i = 0; i < item.vertexCount; i++) {
          filters.push.apply(filters, item.filter);
        }
      });

      this.filterBuffer = new GLX.Buffer(4, new Float32Array(filters));
    },

    // TODO: switch to a notation like mesh.transform
    getMatrix: function() {
      var matrix = new GLX.Matrix();

      if (this.elevation) {
        matrix.translate(0, 0, this.elevation);
      }

      matrix.scale(this.scale, this.scale, this.scale*HEIGHT_SCALE);

      if (this.rotation) {
        matrix.rotateZ(-this.rotation);
      }

      // this position is available once geometry processing is complete.
      // should not be failing before because of this.isReady
      var dLat = this.position.latitude - APP.position.latitude;
      var dLon = this.position.longitude - APP.position.longitude;

      var metersPerDegreeLongitude = METERS_PER_DEGREE_LATITUDE * Math.cos(APP.position.latitude / 180 * Math.PI);

      matrix.translate( dLon*metersPerDegreeLongitude, -dLat*METERS_PER_DEGREE_LATITUDE, 0);

      return matrix;
    },

    getOrigin: function(geometry) {
      var coordinates = geometry.coordinates;
      switch (geometry.type) {
        case 'Point':
          return coordinates;

        case 'MultiPoint':
        case 'LineString':
          return coordinates[0];

        case 'MultiLineString':
        case 'Polygon':
          return coordinates[0][0];

        case 'MultiPolygon':
          return coordinates[0][0][0];
      }
    },

    destroy: function() {
      this.isReady = false;

      clearTimeout(this.relaxTimer);

      data.Index.remove(this);

      if (this.request) {
        this.request.abort();
      }

      this.items = [];

      if (this.isReady) {
        this.vertexBuffer.destroy();
        this.normalBuffer.destroy();
        this.colorBuffer.destroy();
        this.texCoordBuffer.destroy();
        this.idBuffer.destroy();
        this.heightBuffer.destroy();
      }
    }
  };

  return constructor;

}());


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

mesh.MapPlane = (function() {

  function constructor(options) {
    options = options || {};

    this.id = options.id;
    this.radius = options.radius || 5000;
    this.createGlGeometry();

    this.minZoom = APP.minZoom;
    this.maxZoom = APP.maxZoom;
  }

  constructor.prototype = {

    createGlGeometry: function() {
      /* This method creates front and back faces, in case rendering 
       * effect requires both. */
      var NUM_SEGMENTS = 50;
      var segmentSize = 2*this.radius / NUM_SEGMENTS;
      this.vertexBuffer = [];
      this.normalBuffer = [];
      this.filterBuffer = [];

      var normal = [0,0,1];
      var normals = [].concat(normal, normal, normal, normal, normal, normal);

      var filterEntry = [0, 1, 1, 1];
      var filterEntries = [].concat(filterEntry, filterEntry, filterEntry, filterEntry, filterEntry, filterEntry);
      
      for (var x = 0; x < NUM_SEGMENTS; x++)
        for (var y = 0; y < NUM_SEGMENTS; y++) {
          var baseX = -this.radius + x*segmentSize;
          var baseY = -this.radius + y*segmentSize;
          this.vertexBuffer.push( baseX,               baseY, 0,
                                  baseX + segmentSize, baseY + segmentSize, 0,
                                  baseX + segmentSize, baseY, 0,
                                  
                                  baseX,               baseY, 0,
                                  baseX,               baseY + segmentSize, 0,
                                  baseX + segmentSize, baseY + segmentSize, 0);

          this.vertexBuffer.push( baseX,               baseY, 0,
                                  baseX + segmentSize, baseY, 0,
                                  baseX + segmentSize, baseY + segmentSize, 0,

                                  baseX,               baseY, 0,
                                  baseX + segmentSize, baseY + segmentSize, 0,
                                  baseX,               baseY + segmentSize, 0);

          [].push.apply(this.normalBuffer, normals);
          [].push.apply(this.normalBuffer, normals);

          [].push.apply(this.filterBuffer, filterEntries);
          [].push.apply(this.filterBuffer, filterEntries);
      }
       
      this.vertexBuffer = new GLX.Buffer(3, new Float32Array(this.vertexBuffer));
      this.normalBuffer = new GLX.Buffer(3, new Float32Array(this.normalBuffer));
      this.filterBuffer = new GLX.Buffer(4, new Float32Array(this.filterBuffer));
    },

    // TODO: switch to a notation like mesh.transform
    getMatrix: function() {
      //var scale = Math.pow(2, APP.zoom - 16);

      var modelMatrix = new GLX.Matrix();
      //modelMatrix.scale(scale, scale, scale);
    
      return modelMatrix;
    },

    destroy: function() {
      this.vertexBuffer.destroy();
      this.normalBuffer.destroy();
      this.colorBuffer.destroy();
      this.idBuffer.destroy();
    }
  };

  return constructor;

}());


mesh.DebugQuad = (function() {

  function constructor(options) {
    options = options || {};

    this.id = options.id;
    /*if (options.color) {
      this.color = Qolor.parse(options.color).toArray();
    }*/

    this.v1 = this.v2 = this.v3 = this.v4 = [false, false, false];
    this.updateGeometry( [0,0,0], [0,0,0], [0,0,0], [0,0,0]);

    this.minZoom = APP.minZoom;
    this.maxZoom = APP.maxZoom;
  }

  constructor.prototype = {

    updateGeometry: function(v1, v2, v3, v4) {
      if (
        equal3(v1, this.v1) &&
        equal3(v2, this.v2) &&
        equal3(v3, this.v3) &&
        equal3(v4, this.v4)
      ) {
        return; //still up-to-date
      }

      this.v1 = v1;
      this.v2 = v2;
      this.v3 = v3;
      this.v4 = v4;
      
      if (this.vertexBuffer) {
        this.vertexBuffer.destroy();
      }

      var vertices = [].concat(v1, v2, v3, v1, v3, v4);
      this.vertexBuffer = new GLX.Buffer(3, new Float32Array(vertices));

      /*
      this.dummyMapPlaneTexCoords = new GLX.Buffer(2, new Float32Array([
        0.0, 0.0,
          1, 0.0,
          1,   1,
        
        0.0, 0.0,
          1,   1,
        0.0,   1]));*/

      if (this.normalBuffer) {
        this.normalBuffer.destroy();
      }

      this.normalBuffer = new GLX.Buffer(3, new Float32Array([
        0, 0, 1,
        0, 0, 1,
        0, 0, 1,
        
        0, 0, 1,
        0, 0, 1,
        0, 0, 1]));
      
      var color = [1, 0.5, 0.25];
      if (this.colorBuffer)
        this.colorBuffer.destroy();
        
      this.colorBuffer = new GLX.Buffer(3, new Float32Array(
        [].concat(color, color, color, color, color, color)));

      this.texCoordBuffer = new GLX.Buffer(2, new Float32Array(
        [0,0,0,0,0,0,0,0,0,0,0,0]));

      if (this.idBuffer)
        this.idBuffer.destroy();

      this.idBuffer = new GLX.Buffer(3, new Float32Array(
        [].concat(color, color, color, color, color, color)));

      if (this.heightBuffer)
        this.heightBuffer.destroy();

      this.heightBuffer = new GLX.Buffer(1, new Float32Array(
        [].concat(0, 0)));

      var filter = [0,1,1,1];
      
      this.filterBuffer = new GLX.Buffer(4, new Float32Array(
        [].concat(filter, filter, filter, filter, filter, filter)));
        
      //this.numDummyVertices = 6;
    },

    // TODO: switch to a notation like mesh.transform
    getMatrix: function() {
      //var scale = render.fogRadius/this.radius;
      var modelMatrix = new GLX.Matrix();
      //modelMatrix.scale(scale, scale, scale);
    
      return modelMatrix;
    },

    destroy: function() {
      this.vertexBuffer.destroy();
      this.normalBuffer.destroy();
      this.colorBuffer.destroy();
      this.texCoordBuffer.destroy();
      this.idBuffer.destroy();
      this.heightBuffer.destroy();
    }
  };

  return constructor;

}());

mesh.OBJ = (function() {

  function parseMTL(str) {
    var
      lines = str.split(/[\r\n]/g),
      cols,
      materials = {},
      data = null;

    for (var i = 0, il = lines.length; i < il; i++) {
      cols = lines[i].trim().split(/\s+/);

      switch (cols[0]) {
        case 'newmtl':
          storeMaterial(materials, data);
          data = { id:cols[1], color:{} };
          break;

        case 'Kd':
          data.color = [
            parseFloat(cols[1]),
            parseFloat(cols[2]),
            parseFloat(cols[3])
          ];
          break;

        case 'd':
          data.color[3] = parseFloat(cols[1]);
          break;
      }
    }

    storeMaterial(materials, data);
    str = null;

    return materials;
  }

  function storeMaterial(materials, data) {
    if (data !== null) {
      materials[ data.id ] = data.color;
    }
  }

  function parseOBJ(str, materials) {
    var
      vertexIndex = [],
      lines = str.split(/[\r\n]/g), cols,
      meshes = [],
      id,
      color,
      faces = [];

    for (var i = 0, il = lines.length; i < il; i++) {
      cols = lines[i].trim().split(/\s+/);

      switch (cols[0]) {
        case 'g':
        case 'o':
          storeOBJ(vertexIndex, meshes, id, color, faces);
          id = cols[1];
          faces = [];
          break;

        case 'usemtl':
          storeOBJ(vertexIndex, meshes, id, color, faces);
          if (materials[ cols[1] ]) {
            color = materials[ cols[1] ];
          }
          faces = [];
          break;

        case 'v':
          vertexIndex.push([parseFloat(cols[1]), parseFloat(cols[2]), parseFloat(cols[3])]);
          break;

        case 'f':
          faces.push([ parseFloat(cols[1])-1, parseFloat(cols[2])-1, parseFloat(cols[3])-1 ]);
          break;
      }
    }

    storeOBJ(vertexIndex, meshes, id, color, faces);
    str = null;

    return meshes;
  }

  function storeOBJ(vertexIndex, meshes, id, color, faces) {
    if (faces.length) {
      var geometry = createGeometry(vertexIndex, faces);
      meshes.push({
        vertices: geometry.vertices,
        normals: geometry.normals,
        color: color,
        texCoords: geometry.texCoords,
        id: id,
        height: geometry.height
      });
    }
  }

  function createGeometry(vertexIndex, faces) {
    var
      v0, v1, v2,
      nor,
      vertices = [],
      normals = [],
      texCoords = [],
      height = -Infinity;

    for (var i = 0, il = faces.length; i < il; i++) {
      v0 = vertexIndex[ faces[i][0] ];
      v1 = vertexIndex[ faces[i][1] ];
      v2 = vertexIndex[ faces[i][2] ];

      nor = normal(v0, v1, v2);

      vertices.push(
        v0[0], v0[2], v0[1],
        v1[0], v1[2], v1[1],
        v2[0], v2[2], v2[1]
      );

      normals.push(
        nor[0], nor[1], nor[2],
        nor[0], nor[1], nor[2],
        nor[0], nor[1], nor[2]
      );

      texCoords.push(
        0.0, 0.0,
        0.0, 0.0,
        0.0, 0.0
      );

      height = Math.max(height, v0[1], v1[1], v2[1]);
    }

    return { vertices:vertices, normals:normals, texCoords:texCoords, height:height };
  }

  //***************************************************************************

  function constructor(url, position, options) {
    options = options || {};

    this.forcedId = options.id;

    if (options.color) {
      this.forcedColor = Qolor.parse(options.color).toArray();
    }

    this.replace      = !!options.replace;
    this.scale        = options.scale     || 1;
    this.rotation     = options.rotation  || 0;
    this.elevation    = options.elevation || 0;
    this.position     = position;
    this.shouldFadeIn = 'fadeIn' in options ? !!options.fadeIn : true;

    this.minZoom = Math.max(parseFloat(options.minZoom || MIN_ZOOM), APP.minZoom);
    this.maxZoom = Math.min(parseFloat(options.maxZoom || MAX_ZOOM), APP.maxZoom);
    if (this.maxZoom < this.minZoom) {
      this.minZoom = MIN_ZOOM;
      this.maxZoom = MAX_ZOOM;
    }

    this.data = {
      vertices: [],
      normals: [],
      colors: [],
      texCoords: [],
      ids: []
    };

    Activity.setBusy();
    this.request = Request.getText(url, function(obj) {
      this.request = null;
      var match;
      if ((match = obj.match(/^mtllib\s+(.*)$/m))) {
        this.request = Request.getText(url.replace(/[^\/]+$/, '') + match[1], function(mtl) {
          this.request = null;
          this.onLoad(obj, parseMTL(mtl));
        }.bind(this));
      } else {
        this.onLoad(obj, null);
      }
    }.bind(this));
  }

  constructor.prototype = {
    onLoad: function(obj, mtl) {
      this.items = [];
      this.addItems( parseOBJ(obj, mtl) );
      this.onReady();
    },

    addItems: function(items) {
      items.forEach(function(feature) {
        /**
         * Fired when a 3d object has been loaded
         * @fires OSMBuildings#loadfeature
         */
        APP.emit('loadfeature', feature);

        [].push.apply(this.data.vertices,  feature.vertices);
        [].push.apply(this.data.normals,   feature.normals);
        [].push.apply(this.data.texCoords, feature.texCoords);

        var
          id = this.forcedId || feature.id,
          idColor = render.Picking.idToColor(id),
          colorVariance = (id/2 % 2 ? -1 : +1) * (id % 2 ? 0.03 : 0.06),
          color = this.forcedColor || feature.color || DEFAULT_COLOR;

        for (var i = 0; i < feature.vertices.length-2; i += 3) {
          [].push.apply(this.data.colors, add3scalar(color, colorVariance));
          [].push.apply(this.data.ids, idColor);
        }

        this.items.push({ id:id, vertexCount:feature.vertices.length/3, height:feature.height, data:feature.data });
      }.bind(this));
    },

    _initItemBuffers: function() {
      var
        start = Filter.getTime(),
        end = start;

      if (this.shouldFadeIn) {
        start += 250;
        end += 750;
      }

      var
        filters = [],
        heights = [];

      this.items.forEach(function(item) {
        item.filter = [start, end, 0, 1];
        for (var i = 0; i < item.vertexCount; i++) {
          filters.push.apply(filters, item.filter);
          heights.push(item.height);
        }
      });

      this.filterBuffer = new GLX.Buffer(4, new Float32Array(filters));
      this.heightBuffer = new GLX.Buffer(1, new Float32Array(heights));
    },

    applyFilter: function() {
      var filters = [];
      this.items.forEach(function(item) {
        for (var i = 0; i < item.vertexCount; i++) {
          filters.push.apply(filters, item.filter);
        }
      });

      this.filterBuffer = new GLX.Buffer(4, new Float32Array(filters));
    },

    onReady: function() {
      this.vertexBuffer   = new GLX.Buffer(3, new Float32Array(this.data.vertices));
      this.normalBuffer   = new GLX.Buffer(3, new Float32Array(this.data.normals));
      this.colorBuffer    = new GLX.Buffer(3, new Float32Array(this.data.colors));
      this.texCoordBuffer = new GLX.Buffer(2, new Float32Array(this.data.texCoords));
      this.idBuffer       = new GLX.Buffer(3, new Float32Array(this.data.ids));
      this._initItemBuffers();

      this.data = null;

      Filter.apply(this);
      data.Index.add(this);

      this.isReady = true;
      Activity.setIdle();
    },

    // TODO: switch to a notation like mesh.transform
    getMatrix: function() {
      var matrix = new GLX.Matrix();

      if (this.elevation) {
        matrix.translate(0, 0, this.elevation);
      }

      matrix.scale(this.scale, this.scale, this.scale);

      if (this.rotation) {
        matrix.rotateZ(-this.rotation);
      }

      var metersPerDegreeLongitude = METERS_PER_DEGREE_LATITUDE * 
                                     Math.cos(APP.position.latitude / 180 * Math.PI);

      var dLat = this.position.latitude - APP.position.latitude;
      var dLon = this.position.longitude- APP.position.longitude;
      
      matrix.translate( dLon * metersPerDegreeLongitude,
                       -dLat * METERS_PER_DEGREE_LATITUDE, 0);
      
      return matrix;
    },

    destroy: function() {
      data.Index.remove(this);

      if (this.request) {
        this.request.abort();
      }

      this.items = [];

      if (this.isReady) {
        this.vertexBuffer.destroy();
        this.normalBuffer.destroy();
        this.colorBuffer.destroy();
        this.texCoordBuffer.destroy();
        this.idBuffer.destroy();
        this.heightBuffer.destroy();
      }
    }
  };

  return constructor;

}());


function distance2(a, b) {
  var
    dx = a[0]-b[0],
    dy = a[1]-b[1];
  return dx*dx + dy*dy;
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
  var res1  = rasterTriangle(quad[0], quad[1], quad[2]);
  var res2 =  rasterTriangle(quad[0], quad[2], quad[3]);
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

/* returns the quadrilateral part of the XY plane that is currently visible on
 * screen. The quad is returned in tile coordinates for tile zoom level
 * 'tileZoomLevel', and thus can directly be used to determine which basemap
 * and geometry tiles need to be loaded.
 * Note: if the horizon is level (as should usually be the case for 
 * OSMBuildings) then said quad is also a trapezoid. */
function getViewQuad(viewProjectionMatrix, maxFarEdgeDistance, viewDirOnMap) {
  /* maximum distance from the map center at which
   * geometry is still visible */
  //console.log("FMED:", MAX_FAR_EDGE_DISTANCE);

  var inverse = GLX.Matrix.invert(viewProjectionMatrix);

  var vBottomLeft  = getIntersectionWithXYPlane(-1, -1, inverse);
  var vBottomRight = getIntersectionWithXYPlane( 1, -1, inverse);
  var vTopRight    = getIntersectionWithXYPlane( 1,  1, inverse);
  var vTopLeft     = getIntersectionWithXYPlane(-1,  1, inverse);

  /* If even the lower edge of the screen does not intersect with the map plane,
   * then the map plane is not visible at all.
   * (Or somebody screwed up the projection matrix, putting the view upside-down 
   *  or something. But in any case we won't attempt to create a view rectangle).
   */
  if (!vBottomLeft || !vBottomRight) {
    return;
  }

  var vLeftDir, vRightDir, vLeftPoint, vRightPoint;
  var f;

  /* The lower screen edge shows the map layer, but the upper one does not.
   * This usually happens when the camera is close to parallel to the ground
   * so that the upper screen edge lies above the horizon. This is not a bug
   * and can legitimately happen. But from a theoretical standpoint, this means 
   * that the view 'trapezoid' stretches infinitely toward the horizon. Since this
   * is not a practically useful result - though formally correct - we instead
   * manually bound that area.*/
  if (!vTopLeft || !vTopRight) {
    /* point on the left screen edge with the same y-value as the map center*/
    vLeftPoint = getIntersectionWithXYPlane(-1, -0.9, inverse);
    vLeftDir = norm2(sub2( vLeftPoint, vBottomLeft));
    f = dot2(vLeftDir, viewDirOnMap);
    vTopLeft = add2( vBottomLeft, mul2scalar(vLeftDir, maxFarEdgeDistance/f));
    
    vRightPoint = getIntersectionWithXYPlane( 1, -0.9, inverse);
    vRightDir = norm2(sub2(vRightPoint, vBottomRight));
    f = dot2(vRightDir, viewDirOnMap);
    vTopRight = add2( vBottomRight, mul2scalar(vRightDir, maxFarEdgeDistance/f));
  }

  /* if vTopLeft is further than maxFarEdgeDistance away vertically from the lower edge,
   * move it closer. */
 if (dot2( viewDirOnMap, sub2(vTopLeft, vBottomLeft)) > maxFarEdgeDistance) {
    vLeftDir = norm2(sub2( vTopLeft, vBottomLeft));
    f = dot2(vLeftDir, viewDirOnMap);
    vTopLeft = add2( vBottomLeft, mul2scalar(vLeftDir, maxFarEdgeDistance/f));
 }

 /* dito for vTopRight*/
 if (dot2( viewDirOnMap, sub2(vTopRight, vBottomRight)) > maxFarEdgeDistance) {
    vRightDir = norm2(sub2( vTopRight, vBottomRight));
    f = dot2(vRightDir, viewDirOnMap);
    vTopRight = add2( vBottomRight, mul2scalar(vRightDir, maxFarEdgeDistance/f));
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
  var pos = getPositionFromLocal(localXY);
  
  return [long2tile(pos.longitude, zoom), lat2tile(pos.latitude, zoom)];
}

//all four were taken from http://wiki.openstreetmap.org/wiki/Slippy_map_tilenames
function long2tile(lon,zoom) { return (lon+180)/360*Math.pow(2,zoom); }
function lat2tile(lat,zoom)  { return (1-Math.log(Math.tan(lat*Math.PI/180) + 1/Math.cos(lat*Math.PI/180))/Math.PI)/2 *Math.pow(2,zoom); }
function tile2lon(x,z) { return (x/Math.pow(2,z)*360-180); }
function tile2lat(y,z) { 
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


var render = {

  getViewQuad: function() {
    return getViewQuad( this.viewProjMatrix.data,
                       (this.fogDistance + this.fogBlurDistance),
                        this.viewDirOnMap);
  },

  start: function() {
    // disable effects if they rely on WebGL extensions
    // that the current hardware does not support
    if (!GL.depthTextureExtension) {
      console.log('[WARN] effects "shadows" and "outlines" disabled in OSMBuildings, because your GPU does not support WEBGL_depth_texture');
      //both effects rely on depth textures
      delete render.effects.shadows;
      delete render.effects.outlines;
    }

    APP.on('change', this._onChange = this.onChange.bind(this));
    APP.on('resize', this._onResize = this.onResize.bind(this));
    this.onResize();  //initialize view and projection matrix, fog distance, etc.

    GL.cullFace(GL.BACK);
    GL.enable(GL.CULL_FACE);
    GL.enable(GL.DEPTH_TEST);

    render.Picking.init(); // renders only on demand
    render.sky = new render.SkyWall();
    render.Buildings.init();
    render.Basemap.init();
    render.Overlay.init();
    render.AmbientMap.init();
    render.OutlineMap.init();
    render.blurredAmbientMap = new render.Blur();
    render.blurredOutlineMap = new render.Blur();
    //render.HudRect.init();
    //render.NormalMap.init();
    render.MapShadows.init();
    if (render.effects.shadows || render.effects.outlines) {
      render.cameraGBuffer = new render.DepthFogNormalMap();
    }
    
    if (render.effects.shadows) {
      render.sunGBuffer    = new render.DepthFogNormalMap();
      render.sunGBuffer.framebufferSize = [SHADOW_DEPTH_MAP_SIZE, SHADOW_DEPTH_MAP_SIZE];
    }

    //var quad = new mesh.DebugQuad();
    //quad.updateGeometry( [-100, -100, 1], [100, -100, 1], [100, 100, 1], [-100, 100, 1]);
    //data.Index.add(quad);

    requestAnimationFrame( this.renderFrame.bind(this));
  },
  
  renderFrame: function() {
    if (GL === undefined) {
      return;
    }
    Filter.nextTick();
    requestAnimationFrame( this.renderFrame.bind(this));

    this.onChange();    
    GL.clearColor(this.fogColor[0], this.fogColor[1], this.fogColor[2], 0.0);
    GL.clear(GL.COLOR_BUFFER_BIT | GL.DEPTH_BUFFER_BIT);

    if (APP.zoom < APP.minZoom || APP.zoom > APP.maxZoom) {
      return;
    }
    var viewTrapezoid = this.getViewQuad();
    /*
    quad.updateGeometry([viewTrapezoid[0][0], viewTrapezoid[0][1], 1.0],
                        [viewTrapezoid[1][0], viewTrapezoid[1][1], 1.0],
                        [viewTrapezoid[2][0], viewTrapezoid[2][1], 1.0],
                        [viewTrapezoid[3][0], viewTrapezoid[3][1], 1.0]);*/

    Sun.updateView(viewTrapezoid);
    render.sky.updateGeometry(viewTrapezoid);
    var viewSize = [APP.width, APP.height];

    if (!render.effects.shadows) {
      render.Buildings.render();
      render.Basemap.render();

      if (render.effects.outlines) {
        render.cameraGBuffer.render(this.viewMatrix, this.projMatrix, viewSize, true);
        render.Picking.render(viewSize);
        render.OutlineMap.render(
          render.cameraGBuffer.getDepthTexture(), 
          render.cameraGBuffer.getFogNormalTexture(), 
          render.Picking.framebuffer.renderTexture, viewSize, 1.0);
          render.blurredOutlineMap.render(render.OutlineMap.framebuffer.renderTexture, viewSize);
      }

      GL.enable(GL.BLEND);
      if (render.effects.outlines) {
        GL.blendFuncSeparate(GL.ZERO, GL.SRC_COLOR, GL.ZERO, GL.ONE);
        render.Overlay.render(render.blurredOutlineMap.framebuffer.renderTexture, viewSize);
      }

      GL.blendFuncSeparate(GL.ONE_MINUS_DST_ALPHA, GL.DST_ALPHA, GL.ONE, GL.ONE);
      GL.disable(GL.DEPTH_TEST);
      render.sky.render();
      GL.disable(GL.BLEND);
      GL.enable(GL.DEPTH_TEST);
    } else {
      render.cameraGBuffer.render(this.viewMatrix, this.projMatrix, viewSize, true);
      render.sunGBuffer.render(Sun.viewMatrix, Sun.projMatrix);
      render.AmbientMap.render(render.cameraGBuffer.getDepthTexture(), render.cameraGBuffer.getFogNormalTexture(), viewSize, 2.0);
      render.blurredAmbientMap.render(render.AmbientMap.framebuffer.renderTexture, viewSize);
      render.Buildings.render(render.sunGBuffer.framebuffer, 0.5);
      render.Basemap.render();

      if (render.effects.outlines) {
        render.Picking.render(viewSize);
        render.OutlineMap.render(
          render.cameraGBuffer.getDepthTexture(), 
          render.cameraGBuffer.getFogNormalTexture(), 
          render.Picking.framebuffer.renderTexture, viewSize, 1.0
        );
        render.blurredOutlineMap.render(render.OutlineMap.framebuffer.renderTexture, viewSize);
      }

      GL.enable(GL.BLEND);
      {
        // multiply DEST_COLOR by SRC_COLOR, keep SRC alpha
        // this aplies the shadow and SSAO effects (which selectively darken the scene)
        // while keeping the alpha channel (that corresponds to how much the
        // geometry should be blurred into the background in the next step) intact
        GL.blendFuncSeparate(GL.ZERO, GL.SRC_COLOR, GL.ZERO, GL.ONE);
        if (render.effects.outlines) {
          render.Overlay.render(render.blurredOutlineMap.framebuffer.renderTexture, viewSize);
        }

        render.MapShadows.render(Sun, render.sunGBuffer.framebuffer, 0.5);
        render.Overlay.render( render.blurredAmbientMap.framebuffer.renderTexture, viewSize);

        // linear interpolation between the colors of the current framebuffer 
        // ( =building geometries) and of the sky. The interpolation factor
        // is the geometry alpha value, which contains the 'foggyness' of each pixel
        // the alpha interpolation functions is set to GL.ONE for both operands
        // to ensure that the alpha channel will become 1.0 for each pixel after this
        // operation, and thus the whole canvas is not rendered partially transparently
        // over its background.
        GL.blendFuncSeparate(GL.ONE_MINUS_DST_ALPHA, GL.DST_ALPHA, GL.ONE, GL.ONE);
        GL.disable(GL.DEPTH_TEST);
        render.sky.render();
        GL.enable(GL.DEPTH_TEST);
      }
      GL.disable(GL.BLEND);

      //render.HudRect.render( render.sunGBuffer.getFogNormalTexture(), config );
    }

    if (this.screenshotCallback) {
      this.screenshotCallback(GL.canvas.toDataURL());
      this.screenshotCallback = null;
    }  
  },

  onChange: function() {
    var
      scale = 1.3567 * Math.pow(2, APP.zoom-17),
      width = APP.width,
      height = APP.height,
      refHeight = 1024,
      refVFOV = 45;

    GL.viewport(0, 0, width, height);

    this.viewMatrix = new GLX.Matrix()
      .rotateZ(APP.rotation)
      .rotateX(APP.tilt)
      .translate(0, 8/scale, 0) // corrective offset to match Leaflet's coordinate system (value was determined empirically)
      .translate(0, 0, -1220/scale); //move away to simulate zoom; -1220 scales APP tiles to ~256px

    this.viewDirOnMap = [ Math.sin(APP.rotation / 180* Math.PI),
                         -Math.cos(APP.rotation / 180* Math.PI)];

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
    var virtualDistance = refHeight/ (2 * Math.tan( (refVFOV/2) / 180 * Math.PI));
    var verticalFOV = 2* Math.atan((height/2.0)/virtualDistance) / Math.PI * 180;

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

    this.projMatrix = new GLX.Matrix()
      .translate(0, -height/(2.0*scale), 0) // 0, APP y offset to neutralize camera y offset, 
      .scale(1, -1, 1) // flip Y
      .multiply(new GLX.Matrix.Perspective(verticalFOV, width/height, 1, 7500))
      .translate(0, -1, 0); // camera y offset

    this.viewProjMatrix = new GLX.Matrix(GLX.Matrix.multiply(this.viewMatrix, this.projMatrix));

    //need to store this as a reference point to determine fog distance
    this.lowerLeftOnMap = getIntersectionWithXYPlane(-1, -1, GLX.Matrix.invert(this.viewProjMatrix.data));
    if (this.lowerLeftOnMap === undefined) {
      return;
    }

    var lowerLeftDistanceToCenter = len2(this.lowerLeftOnMap);

    /* fogDistance: closest distance at which the fog affects the geometry */
    this.fogDistance = Math.max(3000, lowerLeftDistanceToCenter);
    /* fogBlurDistance: closest distance *beyond* fogDistance at which everything is
     *                  completely enclosed in fog. */
    this.fogBlurDistance = 500;
  },

  onResize: function() {
    GL.canvas.width  = APP.width;
    GL.canvas.height = APP.height;
    this.onChange();
  },

  destroy: function() {
    APP.off('change', this._onChange);
    APP.off('resize', this._onResize);

    render.Picking.destroy();
    render.sky.destroy();
    render.Buildings.destroy();
    render.Basemap.destroy();

    if (render.cameraGBuffer) {
      render.cameraGBuffer.destroy();
    }
    
    if (render.sunGBuffer) {
      render.sunGBuffer.destroy();  
    }
    
    render.AmbientMap.destroy();
    render.blurredAmbientMap.destroy();
    render.blurredOutlineMap.destroy();
  }
};


// TODO: perhaps render only clicked area

render.Picking = {

  idMapping: [null],
  viewportSize: 512,

  init: function() {
    this.shader = new GLX.Shader({
      vertexShader: Shaders.picking.vertex,
      fragmentShader: Shaders.picking.fragment,
      shaderName: 'picking shader',
      attributes: ['aPosition', 'aId', 'aFilter'],
      uniforms: [
        'uModelMatrix',
        'uMatrix',
        'uFogRadius',
        'uTime'
      ]
    });

    this.framebuffer = new GLX.Framebuffer(this.viewportSize, this.viewportSize);
  },

  render: function(framebufferSize) {
    var
      shader = this.shader,
      framebuffer = this.framebuffer;

    framebuffer.setSize(framebufferSize[0], framebufferSize[1]);
    
    shader.enable();
    framebuffer.enable();
    GL.viewport(0, 0, framebufferSize[0], framebufferSize[1]);

    GL.clearColor(0, 0, 0, 1);
    GL.clear(GL.COLOR_BUFFER_BIT | GL.DEPTH_BUFFER_BIT);

    shader.setUniforms([
      ['uFogRadius', '1f', render.fogDistance],
      ['uTime',      '1f', Filter.getTime()]
    ]);

    var
      dataItems = data.Index.items,
      item,
      modelMatrix;

    for (var i = 0, il = dataItems.length; i<il; i++) {
      item = dataItems[i];

      if (APP.zoom < item.minZoom || APP.zoom > item.maxZoom) {
        continue;
      }

      if (!(modelMatrix = item.getMatrix())) {
        continue;
      }

      shader.setUniformMatrices([
        ['uModelMatrix', '4fv', modelMatrix.data],
        ['uMatrix',      '4fv', GLX.Matrix.multiply(modelMatrix, render.viewProjMatrix)]
      ]);

      shader.bindBuffer(item.vertexBuffer, 'aPosition');
      shader.bindBuffer(item.idBuffer, 'aId');
      shader.bindBuffer(item.filterBuffer, 'aFilter');

      GL.drawArrays(GL.TRIANGLES, 0, item.vertexBuffer.numItems);
    }

    this.shader.disable();
    this.framebuffer.disable();
    GL.viewport(0, 0, APP.width, APP.height);
  },
  
  // TODO: throttle calls
  getTarget: function(x, y, callback) {
    requestAnimationFrame(function() {
      this.render( [this.viewportSize, this.viewportSize] );

      x = x/APP.width *this.viewportSize <<0;
      y = y/APP.height*this.viewportSize <<0;

      this.framebuffer.enable();
      var imageData = this.framebuffer.getPixel(x, this.viewportSize - 1 - y);
      this.framebuffer.disable();

      if (imageData === undefined) {
        callback(undefined);
        return;
      }
      var color = imageData[0] | (imageData[1]<<8) | (imageData[2]<<16);

      callback(this.idMapping[color]);
    }.bind(this));
  },

  idToColor: function(id) {
    var index = this.idMapping.indexOf(id);
    if (index === -1) {
      this.idMapping.push(id);
      index = this.idMapping.length-1;
    }
    return [
      ( index        & 0xff) / 255,
      ((index >>  8) & 0xff) / 255,
      ((index >> 16) & 0xff) / 255
    ];
  },

  destroy: function() {}
};


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


render.SkyWall = function() {
    
  this.v1 = this.v2 = this.v3 = this.v4 = [false, false, false];
  this.updateGeometry( [[0,0,0], [0,0,0], [0,0,0], [0,0,0]]);

  this.shader = new GLX.Shader({
    vertexShader: Shaders.skywall.vertex,
    fragmentShader: Shaders.skywall.fragment,
    shaderName: 'sky wall shader',
    attributes: ['aPosition', 'aTexCoord'],
    uniforms: ['uAbsoluteHeight', 'uMatrix', 'uTexIndex', 'uFogColor']
  });
  
  this.floorShader = new GLX.Shader({
    vertexShader:   Shaders.flatColor.vertex,
    fragmentShader: Shaders.flatColor.fragment,
    attributes: ['aPosition'],
    uniforms:   ['uColor', 'uMatrix']
  });
  
  Activity.setBusy();
  var url = APP.baseURL + '/skydome.jpg';
  this.texture = new GLX.texture.Image().load(url, function(image) {
    Activity.setIdle();
    if (image) {
      this.isReady = true;
    }
  }.bind(this));
};

render.SkyWall.prototype.updateGeometry = function(viewTrapezoid) {
  
  var v1 = [viewTrapezoid[3][0], viewTrapezoid[3][1], 0.0];
  var v2 = [viewTrapezoid[2][0], viewTrapezoid[2][1], 0.0];
  var v3 = [viewTrapezoid[2][0], viewTrapezoid[2][1], SKYWALL_HEIGHT];
  var v4 = [viewTrapezoid[3][0], viewTrapezoid[3][1], SKYWALL_HEIGHT];

  if ( equal3(v1, this.v1) &&
       equal3(v2, this.v2) &&
       equal3(v3, this.v3) &&
       equal3(v4, this.v4))
     return; //still up-to-date

  this.v1 = v1;
  this.v2 = v2;
  this.v3 = v3;
  this.v4 = v4;

  if (this.vertexBuffer)
    this.vertexBuffer.destroy();

  var vertices = [].concat(v1, v2, v3, v1, v3, v4);
  this.vertexBuffer = new GLX.Buffer(3, new Float32Array(vertices));

  if (this.texCoordBuffer)
    this.texCoordBuffer.destroy();

  var inverse = GLX.Matrix.invert(render.viewProjMatrix.data);
  var vBottomCenter = getIntersectionWithXYPlane(0, -1, inverse);
  
  var vLeftDir = norm2(sub2( v1, vBottomCenter));
  var vRightDir =norm2(sub2( v2, vBottomCenter));
  var vLeftArc = Math.atan2(vLeftDir[1],  vLeftDir[0])/  (2*Math.PI);
  var vRightArc= Math.atan2(vRightDir[1], vRightDir[0])/ (2*Math.PI);
  
  if (vLeftArc > vRightArc)
    vRightArc +=1;
  //console.log(vLeftArc, vRightArc);

  // var visibleSkyDiameterFraction = Math.asin(dot2( vLeftDir, vRightDir))/ (2*Math.PI);
  var tcLeft = vLeftArc;//APP.rotation/360.0;
  var tcRight =vRightArc;//APP.rotation/360.0 + visibleSkyDiameterFraction*3;
        
  this.texCoordBuffer = new GLX.Buffer(2, new Float32Array(
    [tcLeft, 1, tcRight, 1, tcRight, 0, tcLeft, 1, tcRight, 0, tcLeft, 0]));
    
  v1 = [viewTrapezoid[0][0], viewTrapezoid[0][1], 1.0];
  v2 = [viewTrapezoid[1][0], viewTrapezoid[1][1], 1.0];
  v3 = [viewTrapezoid[2][0], viewTrapezoid[2][1], 1.0];
  v4 = [viewTrapezoid[3][0], viewTrapezoid[3][1], 1.0];
  
  if (this.floorVertexBuffer)
    this.floorVertexBuffer.destroy();
    
  this.floorVertexBuffer = new GLX.Buffer(3, new Float32Array(
    [].concat( v1, v2, v3, v4)));
};

render.SkyWall.prototype.render = function() {
  if (!this.isReady) {
    return;
  }

  var
    fogColor = render.fogColor,
    shader = this.shader;

  shader.enable();

  shader.setUniforms([
    ['uFogColor',       '3fv', fogColor],
    ['uAbsoluteHeight', '1f',  SKYWALL_HEIGHT*10.0]
  ]);

  shader.setUniformMatrix('uMatrix', '4fv', render.viewProjMatrix.data);

  shader.bindBuffer( this.vertexBuffer,   'aPosition');
  shader.bindBuffer( this.texCoordBuffer, 'aTexCoord');

  shader.bindTexture('uTexIndex', 0, this.texture);

  GL.drawArrays(GL.TRIANGLES, 0, this.vertexBuffer.numItems);
  shader.disable();
  

  this.floorShader.enable();
  this.floorShader.setUniform('uColor', '4fv', fogColor.concat([1.0]));
  this.floorShader.setUniformMatrix('uMatrix', '4fv', render.viewProjMatrix.data);
  this.floorShader.bindBuffer(this.floorVertexBuffer, 'aPosition');
  GL.drawArrays(GL.TRIANGLE_FAN, 0, this.floorVertexBuffer.numItems);
  
  this.floorShader.disable();
  
};

render.SkyWall.prototype.destroy = function() {
  this.texture.destroy();
};



render.Buildings = {

  init: function() {
  
    this.shader = !render.effects.shadows ?
      new GLX.Shader({
        vertexShader: Shaders.buildings.vertex,
        fragmentShader: Shaders.buildings.fragment,
        shaderName: 'building shader',
        attributes: ['aPosition', 'aTexCoord', 'aColor', 'aFilter', 'aNormal', 'aId', 'aHeight'],
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
          'uHighlightColor',
          'uHighlightId',
          'uTime',
          'uWallTexIndex'
        ]
      }) : new GLX.Shader({
        vertexShader: Shaders['buildings.shadows'].vertex,
        fragmentShader: Shaders['buildings.shadows'].fragment,
        shaderName: 'quality building shader',
        attributes: ['aPosition', 'aTexCoord', 'aColor', 'aFilter', 'aNormal', 'aId', 'aHeight'],
        uniforms: [
          'uFogDistance',
          'uFogBlurDistance',
          'uHighlightColor',
          'uHighlightId',
          'uLightColor',
          'uLightDirection',
          'uLowerEdgePoint',
          'uMatrix',
          'uModelMatrix',
          'uSunMatrix',
          'uShadowTexIndex',
          'uShadowTexDimensions',
          'uTime',
          'uViewDirOnMap',
          'uWallTexIndex'
        ]
    });
    
    this.wallTexture = new GLX.texture.Image();
    this.wallTexture.color( [1,1,1]);
    this.wallTexture.load( BUILDING_TEXTURE);
  },

  render: function(depthFramebuffer) {

    var shader = this.shader;
    shader.enable();

    if (this.showBackfaces) {
      GL.disable(GL.CULL_FACE);
    }

    shader.setUniforms([
      ['uFogDistance',     '1f',  render.fogDistance],
      ['uFogBlurDistance', '1f',  render.fogBlurDistance],
      ['uHighlightColor',  '3fv', this.highlightColor || [0, 0, 0]],
      ['uHighlightId',     '3fv', this.highlightId || [0, 0, 0]],
      ['uLightColor',      '3fv', [0.5, 0.5, 0.5]],
      ['uLightDirection',  '3fv', Sun.direction],
      ['uLowerEdgePoint',  '2fv', render.lowerLeftOnMap],
      ['uTime',            '1f',  Filter.getTime()],
      ['uViewDirOnMap',    '2fv', render.viewDirOnMap]
    ]);

    if (!render.effects.shadows) {
      shader.setUniformMatrix('uNormalTransform', '3fv', GLX.Matrix.identity3().data);
    }

    shader.bindTexture('uWallTexIndex', 0, this.wallTexture);
    
    if (depthFramebuffer) {
      shader.setUniform('uShadowTexDimensions', '2fv', [depthFramebuffer.width, depthFramebuffer.height]);
      shader.bindTexture('uShadowTexIndex', 1, depthFramebuffer.depthTexture);
    }

    var
      dataItems = data.Index.items,
      item,
      modelMatrix;

    for (var i = 0, il = dataItems.length; i < il; i++) {
      // no visibility check needed, Grid.purge() is taking care

      item = dataItems[i];

      if (APP.zoom < item.minZoom || APP.zoom > item.maxZoom || !(modelMatrix = item.getMatrix())) {
        continue;
      }

      shader.setUniformMatrices([
        ['uModelMatrix', '4fv', modelMatrix.data],
        ['uMatrix',      '4fv', GLX.Matrix.multiply(modelMatrix, render.viewProjMatrix)]
      ]);
      
      if (render.effects.shadows) {
        shader.setUniformMatrix('uSunMatrix', '4fv', GLX.Matrix.multiply(modelMatrix, Sun.viewProjMatrix));
      }

      shader.bindBuffer(item.vertexBuffer,   'aPosition');
      shader.bindBuffer(item.texCoordBuffer, 'aTexCoord');
      shader.bindBuffer(item.normalBuffer,   'aNormal');
      shader.bindBuffer(item.colorBuffer,    'aColor');
      shader.bindBuffer(item.idBuffer,       'aId');
      shader.bindBuffer(item.filterBuffer,   'aFilter');
      shader.bindBuffer(item.heightBuffer,   'aHeight');

      GL.drawArrays(GL.TRIANGLES, 0, item.vertexBuffer.numItems);
    }

    if (this.showBackfaces) {
      GL.enable(GL.CULL_FACE);
    }

    shader.disable();
  },

  destroy: function() {}
};


/* This object renders the shadow for the map layer. It only renders the shadow,
 * not the map itself. The intended use for this class is as a blended overlay
 * so that the map can be rendered independently from the shadows cast on it.
 */

render.MapShadows = {

  init: function() {
    this.shader = new GLX.Shader({
      vertexShader: Shaders['basemap.shadows'].vertex,
      fragmentShader: Shaders['basemap.shadows'].fragment,
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
    
    this.mapPlane = new mesh.MapPlane();
  },

  render: function(Sun, depthFramebuffer, shadowStrength) {
    var shader = this.shader;
    shader.enable();

    if (this.showBackfaces) {
      GL.disable(GL.CULL_FACE);
    }

    shader.setUniforms([
      ['uDirToSun', '3fv', Sun.direction],
      ['uViewDirOnMap', '2fv',   render.viewDirOnMap],
      ['uLowerEdgePoint', '2fv', render.lowerLeftOnMap],
      ['uFogDistance', '1f', render.fogDistance],
      ['uFogBlurDistance', '1f', render.fogBlurDistance],
      ['uShadowTexDimensions', '2fv', [depthFramebuffer.width, depthFramebuffer.height] ],
      ['uShadowStrength', '1f', shadowStrength]
    ]);

    shader.bindTexture('uShadowTexIndex', 0, depthFramebuffer.depthTexture);

    var item = this.mapPlane;
    if (APP.zoom < item.minZoom || APP.zoom > item.maxZoom) {
      return;
    }

    var modelMatrix;
    if (!(modelMatrix = item.getMatrix())) {
      return;
    }

    shader.setUniformMatrices([
      ['uModelMatrix', '4fv', modelMatrix.data],
      ['uMatrix',      '4fv', GLX.Matrix.multiply(modelMatrix, render.viewProjMatrix)],
      ['uSunMatrix',   '4fv', GLX.Matrix.multiply(modelMatrix, Sun.viewProjMatrix)]
    ]);

    shader.bindBuffer(item.vertexBuffer, 'aPosition');
    shader.bindBuffer(item.normalBuffer, 'aNormal');

    GL.drawArrays(GL.TRIANGLES, 0, item.vertexBuffer.numItems);

    if (this.showBackfaces) {
      GL.enable(GL.CULL_FACE);
    }

    shader.disable();
  },

  destroy: function() {}
};


render.Basemap = {

  init: function() {
    this.shader = new GLX.Shader({
      vertexShader: Shaders.basemap.vertex,
      fragmentShader: Shaders.basemap.fragment,
      shaderName: 'basemap shader',
      attributes: ['aPosition', 'aTexCoord'],
      uniforms: ['uModelMatrix', 'uMatrix', 'uTexIndex', 'uFogDistance', 'uFogBlurDistance', 'uLowerEdgePoint', 'uViewDirOnMap']
    });
  },

  render: function() {
    var layer = APP.basemapGrid;

    if (!layer) {
      return;
    }

    if (APP.zoom < layer.minZoom || APP.zoom > layer.maxZoom) {
      return;
    }

    var
      shader = this.shader,
      tile,
      zoom = Math.round(APP.zoom);

    shader.enable();
    
    shader.setUniforms([
      ['uFogDistance',     '1f',  render.fogDistance],
      ['uFogBlurDistance', '1f',  render.fogBlurDistance],
      ['uViewDirOnMap',    '2fv', render.viewDirOnMap],
      ['uLowerEdgePoint',  '2fv', render.lowerLeftOnMap]
    ]);
    
    for (var key in layer.visibleTiles) {
      tile = layer.tiles[key];

      if (tile && tile.isReady) {
        this.renderTile(tile, shader);
        continue;
      }

      var parent = [tile.x/2<<0, tile.y/2<<0, zoom-1].join(',');
      if (layer.tiles[parent] && layer.tiles[parent].isReady) {
        // TODO: there will be overlap with adjacent tiles or parents of adjacent tiles!
        this.renderTile(layer.tiles[ parent ], shader);
        continue;
      }

      var children = [
        [tile.x*2,   tile.y*2,   tile.zoom+1].join(','),
        [tile.x*2+1, tile.y*2,   tile.zoom+1].join(','),
        [tile.x*2,   tile.y*2+1, tile.zoom+1].join(','),
        [tile.x*2+1, tile.y*2+1, tile.zoom+1].join(',')
      ];

      for (var i = 0; i < 4; i++) {
        if (layer.tiles[ children[i] ] && layer.tiles[ children[i] ].isReady) {
          this.renderTile(layer.tiles[ children[i] ], shader);
        }
      }
    }

    shader.disable();
  },

  renderTile: function(tile, shader) {
    var metersPerDegreeLongitude = METERS_PER_DEGREE_LATITUDE * 
                                   Math.cos(APP.position.latitude / 180 * Math.PI);

    var modelMatrix = new GLX.Matrix();
    modelMatrix.translate( (tile.longitude- APP.position.longitude)* metersPerDegreeLongitude,
                          -(tile.latitude - APP.position.latitude) * METERS_PER_DEGREE_LATITUDE, 0);

    GL.enable(GL.POLYGON_OFFSET_FILL);
    GL.polygonOffset(MAX_USED_ZOOM_LEVEL - tile.zoom,
                     MAX_USED_ZOOM_LEVEL - tile.zoom);
                     
    shader.setUniforms([
      ['uViewDirOnMap', '2fv',   render.viewDirOnMap],
      ['uLowerEdgePoint', '2fv', render.lowerLeftOnMap]
    ]);

    shader.setUniformMatrices([
      ['uModelMatrix', '4fv', modelMatrix.data],
      ['uMatrix',      '4fv', GLX.Matrix.multiply(modelMatrix, render.viewProjMatrix)]
    ]);

    shader.bindBuffer(tile.vertexBuffer,  'aPosition');
    shader.bindBuffer(tile.texCoordBuffer,'aTexCoord');
    shader.bindTexture('uTexIndex', 0, tile.texture);

    GL.drawArrays(GL.TRIANGLE_STRIP, 0, tile.vertexBuffer.numItems);
    GL.disable(GL.POLYGON_OFFSET_FILL);
  },

  destroy: function() {}
};


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


/* 'DepthFogNormalMap' renders the depth buffer and the scene's camera-space 
   normals and fog intensities into textures. Depth is stored as a 24bit depth 
   texture using the WEBGL_depth_texture extension, and normals and fog 
   intensities are stored as the 'rgb' and 'a' of a shared 32bit texture.
   Note that there is no dedicated shader to create the depth texture. Rather,
   the depth buffer used by the GPU in depth testing while rendering the normals
   and fog intensities is itself a texture.
*/

render.DepthFogNormalMap = function() {
  this.shader = new GLX.Shader({
    vertexShader: Shaders.fogNormal.vertex,
    fragmentShader: Shaders.fogNormal.fragment,
    shaderName: 'fog/normal shader',
    attributes: ['aPosition', 'aFilter', 'aNormal'],
    uniforms: ['uMatrix', 'uModelMatrix', 'uNormalMatrix', 'uTime', 'uFogDistance', 'uFogBlurDistance', 'uViewDirOnMap', 'uLowerEdgePoint']
  });
  
  this.framebuffer = new GLX.Framebuffer(128, 128, /*depthTexture=*/true); //dummy sizes, will be resized dynamically

  this.mapPlane = new mesh.MapPlane();
};

render.DepthFogNormalMap.prototype.getDepthTexture = function() {
  return this.framebuffer.depthTexture;
};

render.DepthFogNormalMap.prototype.getFogNormalTexture = function() {
  return this.framebuffer.renderTexture;
};


render.DepthFogNormalMap.prototype.render = function(viewMatrix, projMatrix, framebufferSize, isPerspective) {

  var
    shader = this.shader,
    framebuffer = this.framebuffer,
    viewProjMatrix = new GLX.Matrix(GLX.Matrix.multiply(viewMatrix,projMatrix));

  framebufferSize = framebufferSize || this.framebufferSize;
  framebuffer.setSize( framebufferSize[0], framebufferSize[1] );
    
  shader.enable();
  framebuffer.enable();
  GL.viewport(0, 0, framebufferSize[0], framebufferSize[1]);

  GL.clearColor(0.0, 0.0, 0.0, 1);
  GL.clear(GL.COLOR_BUFFER_BIT | GL.DEPTH_BUFFER_BIT);

  var item, modelMatrix;

  shader.setUniform('uTime', '1f', Filter.getTime());

  // render all actual data items, but also a dummy map plane
  // Note: SSAO on the map plane has been disabled temporarily
  var dataItems = data.Index.items.concat([this.mapPlane]);

  for (var i = 0; i < dataItems.length; i++) {
    item = dataItems[i];

    if (APP.zoom < item.minZoom || APP.zoom > item.maxZoom) {
      continue;
    }

    if (!(modelMatrix = item.getMatrix())) {
      continue;
    }

    shader.setUniforms([
      ['uViewDirOnMap',    '2fv', render.viewDirOnMap],
      ['uLowerEdgePoint',  '2fv', render.lowerLeftOnMap],
      ['uFogDistance',     '1f',  render.fogDistance],
      ['uFogBlurDistance', '1f',  render.fogBlurDistance]
    ]);

    shader.setUniformMatrices([
      ['uMatrix',       '4fv', GLX.Matrix.multiply(modelMatrix, viewProjMatrix)],
      ['uModelMatrix',  '4fv', modelMatrix.data],
      ['uNormalMatrix', '3fv', GLX.Matrix.transpose3(GLX.Matrix.invert3(GLX.Matrix.multiply(modelMatrix, viewMatrix)))]
    ]);
    
    shader.bindBuffer(item.vertexBuffer, 'aPosition');
    shader.bindBuffer(item.normalBuffer, 'aNormal');
    shader.bindBuffer(item.filterBuffer, 'aFilter');

    GL.drawArrays(GL.TRIANGLES, 0, item.vertexBuffer.numItems);
  }

  shader.disable();
  framebuffer.disable();

  GL.viewport(0, 0, APP.width, APP.height);
};

render.DepthFogNormalMap.prototype.destroy = function() {};


render.AmbientMap = {

  init: function() {
    this.shader = new GLX.Shader({
      vertexShader:   Shaders.ambientFromDepth.vertex,
      fragmentShader: Shaders.ambientFromDepth.fragment,
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

    shader.setUniforms([
      ['uInverseTexSize', '2fv', [1/framebufferSize[0], 1/framebufferSize[1]]],
      ['uEffectStrength', '1f',  effectStrength],
      ['uNearPlane',      '1f',  1.0], //FIXME: use actual near and far planes of the projection matrix
      ['uFarPlane',       '1f',  7500.0]
    ]);

    shader.bindBuffer(this.vertexBuffer,   'aPosition');
    shader.bindBuffer(this.texCoordBuffer, 'aTexCoord');

    shader.bindTexture('uDepthTexIndex', 0, depthTexture);
    shader.bindTexture('uFogTexIndex',   1, fogTexture);

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
  
    var geometry = this.createGeometry();
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
    var vertices = [],
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

    var shader = this.shader;

    shader.enable();
    /* we are rendering an *overlay*, which is supposed to be rendered on top of the
     * scene no matter what its actual depth is. */
    GL.disable(GL.DEPTH_TEST);
    
    shader.setUniformMatrix('uMatrix', '4fv', GLX.Matrix.identity().data);

    shader.bindBuffer(this.vertexBuffer,  'aPosition');
    shader.bindBuffer(this.texCoordBuffer,'aTexCoord');
    shader.bindTexture('uTexIndex', 0, texture);

    GL.drawArrays(GL.TRIANGLES, 0, this.vertexBuffer.numItems);

    GL.enable(GL.DEPTH_TEST);
    shader.disable();
  },

  destroy: function() {}
};


render.OutlineMap = {

  init: function() {
    this.shader = new GLX.Shader({
      vertexShader:   Shaders.outlineMap.vertex,
      fragmentShader: Shaders.outlineMap.fragment,
      shaderName: 'outline map shader',
      attributes: ['aPosition', 'aTexCoord'],
      uniforms: ['uMatrix', 'uInverseTexSize', 'uNearPlane', 'uFarPlane', 'uDepthTexIndex', 'uFogNormalTexIndex', 'uIdTexIndex', 'uEffectStrength']
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

  render: function(depthTexture, fogNormalTexture, idTexture, framebufferSize, effectStrength) {

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

    GL.uniformMatrix4fv(shader.uniforms.uMatrix, false, GLX.Matrix.identity().data);

    shader.setUniforms([
      ['uInverseTexSize', '2fv', [1/framebufferSize[0], 1/framebufferSize[1]]],
      ['uEffectStrength', '1f',  effectStrength],
      ['uNearPlane',      '1f',  1.0], //FIXME: use actual near and far planes of the projection matrix
      ['uFarPlane',       '1f',  7500.0]      
    ]);

    shader.bindBuffer(this.vertexBuffer,   'aPosition');
    shader.bindBuffer(this.texCoordBuffer, 'aTexCoord');

    shader.bindTexture('uDepthTexIndex',    0, depthTexture);
    shader.bindTexture('uFogNormalTexIndex',1, fogNormalTexture);
    shader.bindTexture('uIdTexIndex',       2, idTexture);

    GL.drawArrays(GL.TRIANGLES, 0, this.vertexBuffer.numItems);

    shader.disable();
    framebuffer.disable();

    GL.viewport(0, 0, APP.width, APP.height);

  },

  destroy: function() {}
};


render.Blur = function() {
  this.shader = new GLX.Shader({
    vertexShader:   Shaders.blur.vertex,
    fragmentShader: Shaders.blur.fragment,
    shaderName: 'blur shader',
    attributes: ['aPosition', 'aTexCoord'],
    uniforms: ['uInverseTexSize', 'uTexIndex']
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
};

render.Blur.prototype.render = function(inputTexture, framebufferSize) {
  var
    shader = this.shader,
    framebuffer = this.framebuffer;

  framebuffer.setSize( framebufferSize[0], framebufferSize[1] );

  GL.viewport(0, 0, framebufferSize[0], framebufferSize[1]);
  shader.enable();
  framebuffer.enable();

  GL.clearColor(1.0, 0.0, 0, 1);
  GL.clear(GL.COLOR_BUFFER_BIT | GL.DEPTH_BUFFER_BIT);

  shader.setUniform('uInverseTexSize', '2fv', [1/framebuffer.width, 1/framebuffer.height]);
  shader.bindBuffer(this.vertexBuffer,  'aPosition');
  shader.bindBuffer(this.texCoordBuffer,'aTexCoord');
  shader.bindTexture('uTexIndex', 0, inputTexture);

  GL.drawArrays(GL.TRIANGLES, 0, this.vertexBuffer.numItems);

  shader.disable();
  framebuffer.disable();

  GL.viewport(0, 0, APP.width, APP.height);
};

render.Blur.prototype.destroy = function() 
{
  if (this.framebuffer) {
    this.framebuffer.destroy();
  }
};


var basemap = {};


basemap.Tile = function(x, y, zoom) {
  this.x = x;
  this.y = y;
  this.latitude = tile2lat(y, zoom);
  this.longitude= tile2lon(x, zoom);
  this.zoom = zoom;
  this.key = [x, y, zoom].join(',');

  // note: due to Mercator projection the tile width in meters is equal to tile height in meters.
  var size = getTileSizeInMeters(this.latitude, zoom);

  var vertices = [
    size, size, 0,
    size,    0, 0,
       0, size, 0,
       0,    0, 0
  ];

  var texCoords = [
    1, 0,
    1, 1,
    0, 0,
    0, 1
  ];

  this.vertexBuffer = new GLX.Buffer(3, new Float32Array(vertices));
  this.texCoordBuffer = new GLX.Buffer(2, new Float32Array(texCoords));
};

basemap.Tile.prototype = {
  load: function(url) {
    Activity.setBusy();
    this.texture = new GLX.texture.Image().load(url, function(image) {
      Activity.setIdle();
      if (image) {
        this.isReady = true;
        /* The whole texture will be mapped to fit the whole tile exactly. So
         * don't attempt to wrap around the texture coordinates. */
        GL.bindTexture(GL.TEXTURE_2D, this.texture.id);
        GL.texParameteri(GL.TEXTURE_2D, GL.TEXTURE_WRAP_S, GL.CLAMP_TO_EDGE);
        GL.texParameteri(GL.TEXTURE_2D, GL.TEXTURE_WRAP_T, GL.CLAMP_TO_EDGE);
      }
    }.bind(this));
  },

  destroy: function() {
    this.vertexBuffer.destroy();
    this.texCoordBuffer.destroy();
    if (this.texture) {
      this.texture.destroy();
    }
  }
};
}());
//# sourceMappingURL=OSMBuildings.debug.js.map