
function rad (a) {
  return a * Math.PI/180;
}

function multiply (res, a, b) {
  const
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

//*****************************************************************************

GLX.Matrix = class {

  constructor (data) {
    this.data = new Float32Array(data ? data : [
      1, 0, 0, 0,
      0, 1, 0, 0,
      0, 0, 1, 0,
      0, 0, 0, 1
    ]);
  }

  multiply (m) {
    multiply(this.data, this.data, m.data);
    return this;
  }

  translateTo (x, y, z) {
    this.data[12] = x;
    this.data[13] = y;
    this.data[14] = z;
    return this;
  }

  translateBy (x, y, z) {
    multiply(this.data, this.data, [
      1, 0, 0, 0,
      0, 1, 0, 0,
      0, 0, 1, 0,
      x, y, z, 1
    ]);
    return this;
  }

  rotateX (angle) {
    const a = rad(angle), c = Math.cos(a), s = Math.sin(a);
    multiply(this.data, this.data, [
      1, 0, 0, 0,
      0, c, s, 0,
      0, -s, c, 0,
      0, 0, 0, 1
    ]);
    return this;
  }

  rotateY (angle) {
    const a = rad(angle), c = Math.cos(a), s = Math.sin(a);
    multiply(this.data, this.data, [
      c, 0, -s, 0,
      0, 1, 0, 0,
      s, 0, c, 0,
      0, 0, 0, 1
    ]);
    return this;
  }

  rotateZ (angle) {
    const a = rad(angle), c = Math.cos(a), s = Math.sin(a);
    multiply(this.data, this.data, [
      c, -s, 0, 0,
      s, c, 0, 0,
      0, 0, 1, 0,
      0, 0, 0, 1
    ]);
    return this;
  }

  scale (x, y, z) {
    multiply(this.data, this.data, [
      x, 0, 0, 0,
      0, y, 0, 0,
      0, 0, z, 0,
      0, 0, 0, 1
    ]);
    return this;
  }
};

GLX.Matrix.multiply = (a, b) => {
  const res = new Float32Array(16);
  multiply(res, a.data, b.data);
  return res;
};

// returns a perspective projection matrix with a field-of-view of 'fov'
// degrees, an width/height aspect ratio of 'aspect', the near plane at 'near'
// and the far plane at 'far'
GLX.Matrix.Perspective = class extends GLX.Matrix {
  constructor (fov, aspect, near, far) {
    const
      f = 1 / Math.tan(fov * (Math.PI / 180) / 2),
      nf = 1 / (near - far);

    super([
      f / aspect, 0, 0, 0,
      0, f, 0, 0,
      0, 0, (far + near) * nf, -1,
      0, 0, (2 * far * near) * nf, 0
    ]);
  }
};

// returns a perspective projection matrix with the near plane at 'near',
// the far plane at 'far' and the view rectangle on the near plane bounded
// by 'left', 'right', 'top', 'bottom'
GLX.Matrix.Frustum = class extends GLX.Matrix {
  constructor (left, right, top, bottom, near, far) {
    const rl = 1 / (right - left),
      tb = 1 / (top - bottom),
      nf = 1 / (near - far);

    super([
      (near * 2) * rl, 0, 0, 0,
      0, (near * 2) * tb, 0, 0,
      (right + left) * rl, (top + bottom) * tb, (far + near) * nf, -1,
      0, 0, (far * near * 2) * nf, 0
    ]);
  }
};

// based on http://www.songho.ca/opengl/gl_projectionmatrix.html
GLX.Matrix.Ortho = class extends GLX.Matrix {
  constructor (left, right, top, bottom, near, far) {
    super([
      2 / (right - left), 0, 0, 0,
      0, 2 / (top - bottom), 0, 0,
      0, 0, -2 / (far - near), 0,
      -(right + left) / (right - left), -(top + bottom) / (top - bottom), -(far + near) / (far - near), 1
    ]);
  }
};

GLX.Matrix.invert3 = a => {
  const
    a00 = a[0], a01 = a[1], a02 = a[2],
    a04 = a[4], a05 = a[5], a06 = a[6],
    a08 = a[8], a09 = a[9], a10 = a[10],

    l =  a10 * a05 - a06 * a09,
    o = -a10 * a04 + a06 * a08,
    m =  a09 * a04 - a05 * a08;

  let det = a00*l + a01*o + a02*m;

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

GLX.Matrix.transpose3 = a => {
  return new Float32Array([
    a[0], a[3], a[6],
    a[1], a[4], a[7],
    a[2], a[5], a[8]
  ]);
};

GLX.Matrix.transpose = a => {
  return new Float32Array([
    a[0], a[4],  a[8], a[12],
    a[1], a[5],  a[9], a[13],
    a[2], a[6], a[10], a[14],
    a[3], a[7], a[11], a[15]
  ]);
};

// GLX.Matrix.transform = (x, y, z, m) => {
//   const X = x*m[0] + y*m[4] + z*m[8]  + m[12];
//   const Y = x*m[1] + y*m[5] + z*m[9]  + m[13];
//   const Z = x*m[2] + y*m[6] + z*m[10] + m[14];
//   const W = x*m[3] + y*m[7] + z*m[11] + m[15];
//   return {
//     x: (X/W +1) / 2,
//     y: (Y/W +1) / 2
//   };
// };

GLX.Matrix.transform = m => {
  const X = m[12];
  const Y = m[13];
  const Z = m[14];
  const W = m[15];
  return {
    x: (X/W + 1) / 2,
    y: (Y/W + 1) / 2,
    z: (Z/W + 1) / 2
  };
};

GLX.Matrix.invert = a => {
  const
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
    b11 = a22 * a33 - a23 * a32;

  // Calculate the determinant
  let det = b00 * b11 - b01 * b10 + b02 * b09 + b03 * b08 - b04 * b07 + b05 * b06;

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

GLX.Matrix.identity = () => {
  return new GLX.Matrix([
    1, 0, 0, 0,
    0, 1, 0, 0,
    0, 0, 1, 0,
    0, 0, 0, 1
  ]);
};
