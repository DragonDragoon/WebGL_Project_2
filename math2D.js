/**
 * @author Zachary Wartell, ...
 * 
 * math2D.js is a set of 2D geometry related math functions and classes.
 * 
 * Students are given a initial set of classes and functions are expected to extend these and add
 * additional functions to this file.
 * 
 */

/**
 * Constructor of Mat2, a 2x2 matrix 
 * 
 * For efficiency we use a Typed Array.  Elements are stored in 'column major' layout, i.e.
 * for matrix M with math convention M_rc
 *    this.array = [ M_00, M_10,    // first column
 *                   M_01, M_11 ];  // second column
 *                   
 *                   
 * column major order is consistent with OpenGL and GLSL
 *                   
 * @param {null}                  
 * @returns {Mat2}
 */
var Mat2 = function () {
  this.array = new Float32Array(4);
  this.array.set([1.0, 0.0,
                  0.0, 1.0]);
};

/**
 * 'get' returns element in column c, row r of this Mat2
 * @param {Number} c - column
 * @param {Number} r - row
 * @returns {Number}
 */
Mat2.prototype.get = function (c, r) {
  return this.array[c * 2 + r];
};

/**
 * 'set' sets element at column c, row r to value 'val'.
 * @param {Number} c - column
 * @param {Number} r - row
 * @param {Number} val - value
 * @returns {Number}
 */
Mat2.prototype.set = function (c, r, val) {
  this.array[c * 2 + r] = val;
};

/**
 * 'det' return the determinant of this Mat2
 * @returns {Number}
 */
Mat2.prototype.det = function () {
  return this.array[0] * this.array[3] - this.array[1] * this.array[2];
};

/**
 * Constructor of Vec2. Vec2 is is used to represent coordinates of geometric points or vectors. 
 * 
 * @param {null | Vec2 | [Number, Number]}
 */
var Vec2 = function () {
  if (arguments.length === 0) {// no arguements, so initial to 0's
    this.array = new Float32Array(2);
    this.array.set([0.0, 0.0]);
  }
  else if (arguments.length === 1) {// 1 argument, ...
    if (arguments[0] instanceof Vec2) {// argument is Vec2, so copy it
      this.array = new Float32Array(arguments[0].array);
    }
    else if (arguments[0] instanceof Array) {// argument is Array, so copy it
      this.array = new Float32Array(arguments[0]);
    }
  }
};

/**
 *  Vec2 - provide alternate syntax for setting/getting x and y coordinates (see math2d_test for examples).
 */
var v = Vec2.prototype;
Object.defineProperties(Vec2.prototype,
        {
          "x": {
            get: function () {
              return this.array[0];
            },
            set: function (v) {
              this.array[0] = v;
            }
          },
          "y": {
            get: function () {
              return this.array[1];
            },
            set: function (v) {
              this.array[1] = v;
            }
          }
        }
);


/**
 * Add Vec2 'v' to this Vec2
 * @param {Vec2} v    
 */
Vec2.prototype.add = function (v) {
  //this.array.set([this.array[0] + v.array[0], this.array[1] + v.array[1]]);
  return new Vec2([this.array[0] + v.array[0], this.array[1] + v.array[1]]);
};

/**
 * Subtract Vec2 'v' from this Vec2
 * @param {Vec2} v    
 */
Vec2.prototype.sub = function (v) {
  /*
   * \todo needs to be implemented
   */
  return new Vec2([this.array[0] - v.array[0], this.array[1] - v.array[1]]);
};

/**
 * Treat this Vec2 as a column matrix and multiply it by Mat2 'm' to it's left, i.e.
 * 
 * v = m * v
 * 
 * @param {Mat2} m    
 */
Vec2.prototype.multiply = function (m) {
  //this.array.set([this.array[0] * m.array[0] + this.array[1] * m.array[2],
  //                this.array[0] * m.array[1] + this.array[1] * m.array[3]]);
  return new Vec2([this.array[0] * m.array[0] + this.array[1] * m.array[2], this.array[0] * m.array[1] + this.array[1] * m.array[3]]);
};

/**
 * Treat this Vec2 as a row matrix and multiply it by Mat2 'm' to it's right, i.e.
 * 
 * v = v * m
 * 
 * @param {Mat2} m
 */
Vec2.prototype.rightMultiply = function (m) {
  //this.array.set([this.array[0] * m.array[0] + this.array[1] * m.array[1],
  //                this.array[0] * m.array[2] + this.array[1] * m.array[3]]);
  return new Vect2([this.array[0] * m.array[0] + this.array[1] * m.array[1], this.array[0] * m.array[2] + this.array[1] * m.array[3]]);
};

/**
 * Return the dot product of this Vec2 with Vec2 'v'
 * @param {Vec2} v    
 * @return {Number}
 */
Vec2.prototype.dot = function (v) {
  /*
   * \todo needs to be implemented
   */
  return this.array[0] * v.array[0] + this.array[1] * v.array[1];
};

/**
 * Return the magnitude (i.e. length) of of this Vec2 
 * @return {Number}
 */
Vec2.prototype.mag = function () {
  /*
   * \todo needs to be implemented
   */
  return Math.sqrt(Math.pow(this.array[0], 2) + Math.pow(this.array[1], 2));
};

/**
 * Return the vector scaled by a scalar
 * @return {Number}
 */
Vec2.prototype.scale = function(s) {
  return new Vec2([s * this.array[0], s * this.array[1]]);
}

/**
 * Compute the barycentric coordinate of point 'p' with respect to barycentric coordinate system
 * defined by points p0,p1,p2.
 * 
 * @param {Vec2} p0 - first point of barycentric coordinate system
 * @param {Vec2} p1 - second point of barycentric coordinate system
 * @param {Vec2} p2 - third point of barycentric coordinate system
 * @param {Vec2} p  - point to compute the barycentric coordinate of
 * @returns {[Number, Number, Number]} - array with barycentric coordinates of 'p'
 */
function barycentric(p0, p1, p2, p) {
  /*
   * \todo needs to be implemented
   */
  // Hold vector p1 - p0
  var v0 = new Vec2([p1.x - p0.x, p1.y - p0.y]);
  // Hold vector p2 - p0
  var v1 = new Vec2([p2.x - p0.x, p2.y - p0.y]);
  // Hold vector p - p0
  var v2 = new Vec2([p.x - p0.x, p.y - p0.y]);
  // Dot products to set up u, v, and w
  var v0_dot_v0 = v0.dot(v0);
  var v0_dot_v1 = v0.dot(v1);
  var v1_dot_v1 = v1.dot(v1);
  var v2_dot_v0 = v2.dot(v0);
  var v2_dot_v1 = v2.dot(v1);
  // b_coord to set up u, v, and w
  var b_coord = v0_dot_v0 * v1_dot_v1 - v0_dot_v1 * v0_dot_v1;
  // alpha = ((v1 (dot) v1) * (v2 (dot) v0) - (v1 (dot) v0) * (v2 (dot) v1)) / ((v0 (dot) v0) * (v1 (dot) v1) - (v0 (dot) v1) * (v1 (dot) v0))
  var a = (v1_dot_v1 * v2_dot_v0 - v0_dot_v1 * v2_dot_v1) / b_coord;
  // beta = ((v0 (dot) v0) * (v2 (dot) v1) - (v0 (dot) v1) * (v2 (dot) v0)) / ((v0 (dot) v0) * (v1 (dot) v1) - (v0 (dot) v1) * (v1 (dot) v0))
  var b = (v0_dot_v0 * v2_dot_v1 - v0_dot_v1 * v2_dot_v0) / b_coord;
  // gamma
  var g = 1.0 - a - b;
  return [a, b, g];
}

/**
 * Compute distance between point 'p' and the line through points 'p0' and 'p1'
 * @param {Vec2} p0 - first point on line
 * @param {Vec2} p1 - second point on line
 * @param {Vec2} p  - point for which we are computing distance
 * @returns {Number} - shortest distance from point P to line segment P1_P0
 */
function pointLineDist(p0, p1, p) {
  /*
  * \todo needs to be implemented
  */
  // Hold Vec2 P, the point to find closest distance to
  var P = new Vec2([p.x, p.y]);
  // Hold Vec2 B, a point on the line segment
  var B = new Vec2([p0.x, p0.y]);
  // Hold Vec2 M, the direction of the line segment
  var M = new Vec2([p1.x - p0.x, p1.y - p0.y]);
  // Hold t0 = (M (dot) (P - B)) / (M (dot) M)
  var t0 = M.dot(P.sub(B)) / M.dot(M);
  // Set t0 to be within constraint [0, 1]
  t0 = Math.max(0, Math.min(1, t0));
  // Hold D = P - (B + t0 * M)
  var D = P.sub(B.add(M.scale(t0)));
  // Return magnitude of D (distance)
  return D.mag();
}

/**
 * This contains misc. code for testing the functions in this file.
 * 
 * Students can optionally use this function for testing their code...
 * @returns {undefined}
 */
function math2d_test() {
  var M1 = new Mat2();
  var v0 = new Vec2(), v1 = new Vec2([5.0, 5.0]), v2,
          vx = new Vec2([1.0, 0.0]),
          vy = new Vec2([0.0, 1.0]);

  var rad = 45 * Math.PI / 180;
  M1.set(0, 0, Math.cos(rad)); M1.set(1, 0, -Math.sin(rad));
  M1.set(0, 1, Math.sin(rad)); M1.set(1, 1, Math.cos(rad));


  v0.x = 1.0;
  v0.y = 2.0;
  v0.y += 1.0;
  v2 = new Vec2(v0);
  v2.add(v1);

  vx.multiply(M1);
  vy.multiply(M1);

  console.log(JSON.stringify(M1));
  console.log(JSON.stringify(v2));
  console.log(v0.dot(v1));
  console.log(v0.mag());
}
