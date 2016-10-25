/**
 * @author Jialei Li, K.R. Subrmanian, Zachary Wartell
 * 
 * 
 */


/*****
 * 
 * GLOBALS
 * 
 *****/

// 'draw_mode' are names of the different user interaction modes.
// \todo Student Note: others are probably needed...
var draw_mode = { DrawLines: 0, DrawTriangles: 1, DrawQuads: 2, ClearScreen: 3, None: 4 };

// 'curr_draw_mode' tracks the active user interaction mode
var curr_draw_mode = draw_mode.DrawLines;

// GL array buffers for points, lines, and triangles
// \todo Student Note: need similar buffers for other draw modes...
var vBuffer_Pnt, vBuffer_Line, vBuffer_Triangle, vBuffer_Quad;

// Array's storing 2D vertex coordinates of points, lines, triangles, etc.
// Each array element is an array of size 2 storing the x,y coordinate.
// \todo Student Note: need similar arrays for other draw modes...
var points = [], line_verts = [], tri_verts = [], quad_verts = [];

// count number of points clicked for new objects
var num_pts_line = 0, num_pts_triangle = 0, num_pts_quad = 0;

// \todo need similar counters for other draw modes...

// Hold the currently selected type of object and the cycle iterator
var currently_selected_objects = [];
var current_object = 0;

// Hold the previously selected x and y coordinates
var prev_x = 0;
var prev_y = 0;

// Hold the draw type
var drawing_type = "None";

/*****
 * 
 * MAIN
 * 
 *****/
function main() {

  //math2d_test();

  /**
   **      Initialize WebGL Components
   **/

  // Retrieve <canvas> element
  var canvas = document.getElementById('webgl');

  // Get the rendering context for WebGL
  var gl = getWebGLContext(canvas);
  if (!gl) {
    console.log('Failed to get the rendering context for WebGL');
    return;
  }

  // Initialize shaders
  if (!initShadersFromID(gl, "vertex-shader", "fragment-shader")) {
    console.log('Failed to intialize shaders.');
    return;
  }

  // create GL buffer objects
  vBuffer_Pnt = gl.createBuffer();
  if (!vBuffer_Pnt) {
    console.log('Failed to create the buffer object');
    return -1;
  }

  // GL buffer for line mode
  vBuffer_Line = gl.createBuffer();
  if (!vBuffer_Line) {
    console.log('Failed to create the buffer object');
    return -1;
  }

  // GL buffer for triangle mode
  vBuffer_Triangle = gl.createBuffer();
  if (!vBuffer_Triangle) {
    console.log('Failed to create the buffer object');
    return -1;
  }

  // GL buffer for quad mode
  vBuffer_Quad = gl.createBuffer();
  if (!vBuffer_Quad) {
    console.log('Failed to create the buffer object');
    return -1;
  }

  var skeleton = true;
  if (skeleton) {
    document.getElementById("App_Title").innerHTML += "-Skeleton";
  }

  // \todo create buffers for triangles and quads...

  // Specify the color for clearing <canvas>
  gl.clearColor(0, 0, 0, 1);

  // Clear <canvas>
  gl.clear(gl.COLOR_BUFFER_BIT);

  // get GL shader variable locations
  var a_Position = gl.getAttribLocation(gl.program, 'a_Position');
  if (a_Position < 0) {
    console.log('Failed to get the storage location of a_Position');
    return -1;
  }

  var u_FragColor = gl.getUniformLocation(gl.program, 'u_FragColor');
  if (!u_FragColor) {
    console.log('Failed to get the storage location of u_FragColor');
    return;
  }

  /**
   **      Set Event Handlers
   **
   **  Student Note: the WebGL book uses an older syntax. The newer syntax, explicitly calling addEventListener, is preferred.
   **  See https://developer.mozilla.org/en-US/docs/Web/API/EventTarget/addEventListener
   **/
  // set event handlers buttons
  document.getElementById("LineButton").addEventListener("click", function () {
    curr_draw_mode = draw_mode.DrawLines;
  });

  document.getElementById("TriangleButton").addEventListener("click", function () {
    curr_draw_mode = draw_mode.DrawTriangles;
  });

  document.getElementById("QuadButton").addEventListener("click", function () {
    curr_draw_mode = draw_mode.DrawQuads;
  });

  document.getElementById("ClearScreenButton").addEventListener("click", function () {
    curr_draw_mode = draw_mode.ClearScreen;
    // clear the vertex arrays
    while (points.length > 0) {
      points.pop();
    }
    while (line_verts.length > 0) {
      line_verts.pop();
    }
    while (tri_verts.length > 0) {
      tri_verts.pop();
    }
    while (quad_verts.length > 0) {
      quad_verts.pop();
    }

    gl.clear(gl.COLOR_BUFFER_BIT);

    curr_draw_mode = draw_mode.DrawLines;
  });

  //\todo add event handlers for other buttons as required....            

  // set event handlers for color sliders
  /* \todo right now these just output to the console, code needs to be modified... */
  document.getElementById("RedRange").addEventListener("input", function () {
    console.log("RedRange:" + document.getElementById("RedRange").value);
  });

  document.getElementById("GreenRange").addEventListener("input", function () {
    console.log("GreenRange:" + document.getElementById("GreenRange").value);
  });

  document.getElementById("BlueRange").addEventListener("input", function () {
    console.log("BlueRange:" + document.getElementById("BlueRange").value);
  });

  // init sliders 
  // \todo this code needs to be modified ...
  document.getElementById("RedRange").value = 0;
  document.getElementById("GreenRange").value = 100;
  document.getElementById("BlueRange").value = 0;

  // Register function (event handler) to be called on a mouse press
  canvas.addEventListener("mousedown", function (ev) {
    handleMouseDown(ev, gl, canvas, a_Position, u_FragColor);
  });
}

/*****
 * 
 * FUNCTIONS
 * 
 *****/

/*
 * Handle mouse button press event.
 * 
 * @param {MouseEvent} ev - event that triggered event handler
 * @param {Object} gl - gl context
 * @param {HTMLCanvasElement} canvas - canvas 
 * @param {Number} a_Position - GLSL (attribute) vertex location
 * @param {Number} u_FragColor - GLSL (uniform) color
 * @returns {undefined}
 */
function handleMouseDown(ev, gl, canvas, a_Position, u_FragColor) {
  var x = ev.clientX; // x coordinate of a mouse pointer
  var y = ev.clientY; // y coordinate of a mouse pointer
  var rect = ev.target.getBoundingClientRect();

  // Student Note: 'ev' is a MouseEvent (see https://developer.mozilla.org/en-US/docs/Web/API/MouseEvent)

  // convert from canvas mouse coordinates to GL normalized device coordinates
  x = ((x - rect.left) - canvas.width / 2) / (canvas.width / 2);
  y = (canvas.height / 2 - (y - rect.top)) / (canvas.height / 2);

  // If the left mouse button was clicked, draw stuff
  if (ev.button == 0) {
    // If user was in selection mode
    if (drawing_type == "Select") {
      // Clear selection GL_POINTS
      points.length = 0;
    }

    // Change drawing type to draw mode
    drawing_type = "Draw";

    if (curr_draw_mode !== draw_mode.None) {
      // add clicked point to 'points'
      points.push([x, y]);
    }

    // perform active drawing operation
    switch (curr_draw_mode) {
      case draw_mode.DrawLines:
        // in line drawing mode, so draw lines
        if (num_pts_line < 1) {
          // gathering points of new line segment, so collect points
          line_verts.push([x, y]);
          num_pts_line++;
        } else {
          // got final point of new line, so update the primitive arrays
          line_verts.push([x, y]);
          num_pts_line = 0;
          points.length = 0;
        }
        break;
      case draw_mode.DrawTriangles:
        // In triangle drawing mode
        if (num_pts_triangle < 2) {
          // Collect points until more than two
          tri_verts.push([x, y]);
          num_pts_triangle++;
        } else {
          // Collect third point and update primitive arrays
          tri_verts.push([x, y]);
          // Reset points
          num_pts_triangle = 0;
          points.length = 0;
        }
        break;
      case draw_mode.DrawQuads:
        // In quad drawing mode
        if (num_pts_quad < 3) {
          // Collect points until more than three
          quad_verts.push([x, y]);
          num_pts_quad++;
        } else {
          // Collect fourth point and update primitive arrays
          quad_verts.push([x, y]);
          // Reset points
          num_pts_quad = 0;
          points.length = 0;
        }
        break;
    }
  // Else if the right mouse button was clicked, select stuff
  } else if (ev.button == 2) {
    // Change drawing type to selection mode
    drawing_type = "Select";

    // Reset selected points
    points.length = 0;

    if (prev_x !== x && prev_y !== y) {
      // Hold clicked point
      var p = {
        "x": x,
        "y": y
      };

      // Reset currently selected type and object cycle iterator
      currently_selected_objects = [];
      current_object = 0;

      // Line segments
      var closest_line_segment = -1; // Hold the iterator of the closest line segment
      var closest_line_segment_distance = -1; // Hold the distance of the closest line segment
      for (var i = 0; i < line_verts.length; i = i + 2) { // For each line segment (two points per line segment)
        if (typeof line_verts[i] !== 'undefined' && typeof line_verts[i + 1] !== 'undefined') { // If neither points in line_verts are null
          // Hold the first point in the line segment
          var p0 = {
            "x": line_verts[i][0],
            "y": line_verts[i][1]
          };
          // Hold the second point in the line segment
          var p1 = {
            "x": line_verts[i + 1][0],
            "y": line_verts[i + 1][1]
          };
          // Find the shortest distance from clicked point to line segment (from math2D.js)
          var distance = pointLineDist(p0, p1, p);
          // If the distance is within a few pixels (assuming a distance of 0.02 is a few)
          if (distance < 0.02 && (distance < closest_line_segment_distance || closest_line_segment_distance == -1)) {
            // Save the line segment iterator and distance
            closest_line_segment = i;
            closest_line_segment_distance = distance;

            // Push object to currently selected objects
            currently_selected_objects.push(["Line Segment", closest_line_segment, closest_line_segment_distance]);
          }
        }
      }

      // Triangles
      var selected_triangle = -1; // Hold the iterator of the triangle selected
      for (var i = 0; i < tri_verts.length; i = i + 3) { // For each triangle (three points in triangle)
        if (typeof tri_verts[i] !== 'undefined' && typeof tri_verts[i + 1] !== 'undefined' && typeof tri_verts[i + 2] !== 'undefined') { // If no point in tri_verts are undefined
          // Hold the first point in the triangle
          var p0 = {
            "x": tri_verts[i][0],
            "y": tri_verts[i][1]
          };
          // Hold the second point in the triangle
          var p1 = {
            "x": tri_verts[i + 1][0],
            "y": tri_verts[i + 1][1]
          };
          // Hold the third point in the triangle
          var p2 = {
            "x": tri_verts[i + 2][0],
            "y": tri_verts[i + 2][1]
          };
          // Find the barycentric coordinates of p from triangle (from math2D.js)
          var bary = barycentric(p0, p1, p2, p);
          // If clicked inside triangle
          if ((bary[0] >= 0) && (bary[1] >= 0) && (bary[0] + bary[1] < 1)) {
            // Save the triangle iterator
            selected_triangle = i;
            
            // Push object to currently selected object
            currently_selected_objects.push(["Triangle", selected_triangle, bary]);
          }
        }
      }

      // Quad
      var selected_quad = -1; // Hold the iterator of the tri in the quad
      for (var i = 0; i < quad_verts.length; i = i + 1) { // For each tri in the quad
        if (typeof quad_verts[i] !== 'undefined' && typeof quad_verts[i + 1] !== 'undefined' && typeof quad_verts[i + 2] !== 'undefined') { // If no point in quad_verts are undefined
          // Hold the first point of the tri in the quad
          var p0 = {
            "x": quad_verts[i][0],
            "y": quad_verts[i][1]
          };
          // Hold the second point of the tri in the quad
          var p1 = {
            "x": quad_verts[i + 1][0],
            "y": quad_verts[i + 1][1]
          };
          // Hold the third point of the tri in the quad
          var p2 = {
            "x": quad_verts[i + 2][0],
            "y": quad_verts[i + 2][1]
          };
          // Find the barycentric coordinates of p from the tri in the quad (from math2D.js)
          var bary = barycentric(p0, p1, p2, p);
          // If clicked inside a tri in the quad
          if ((bary[0] >= 0) && (bary[1] >= 0) && (bary[0] + bary[1] < 1)) {
            // Save the triangle iterator in the quad
            selected_quad = i;

            // Push object to currently selected objects
            currently_selected_objects.push(["Quad", selected_quad, bary]);
          }
        }
      }

      // Set previous x and y for checking if we should select new object
      prev_x = x;
      prev_y = y;
    } else {
      // If the next selected object is not undefined
      if (typeof currently_selected_objects[current_object + 1] !== 'undefined') {
        // Cycle to next current object
        current_object++;
      } else {
        // Cycle to first selected object
        current_object = 0;
      }
    }
    
    // If there are any currently selected objects
    if (currently_selected_objects.length) {
      // Hold the current cycled object
      var obj = currently_selected_objects[current_object];

      // Switch depending on type of object selected
      switch (obj[0]) {
        case "Line Segment":
          // Log to console
          console.log("Selected line segment: (" + line_verts[obj[1]] + ") -> (" + line_verts[obj[1] + 1] + ") with distance: " + obj[2]);
          // Set currently selected type
          currently_selected_type = "Line Segment";
          // Push verts to point for display
          points.push(line_verts[obj[1]]);
          points.push(line_verts[obj[1] + 1]);
          break;
        case "Triangle":
          // Log to console
          console.log("Selected triangle: (" + tri_verts[obj[1]] + ") -> (" + tri_verts[obj[1] + 1] + ") -> (" + tri_verts[obj[1] + 2] + ") with barycentric coordinates: (" + obj[2] + ")");
          // Set currently selected type
          currently_selected_type = "Triangle";
          // Push verts to points for display
          points.push(tri_verts[obj[1]]);
          points.push(tri_verts[obj[1] + 1]);
          points.push(tri_verts[obj[1] + 2]);
          break;
        case "Quad":
          // Log to console
          console.log("Selected quad: selected tri in quad: (" + quad_verts[obj[1]] + ") -> (" + quad_verts[obj[1] + 1] + ") -> (" + quad_verts[obj[1] + 2] + ") with barycentric coordinates: (" + obj[2] + ")");
          // Set currently selected type
          currently_selected_type = "Quad";
          // Push verts to points for display
          points = quad_verts.slice(0);
          break;
      }
    }
  }

  drawObjects(gl, a_Position, u_FragColor);
}

/*
 * Draw all objects
 * @param {Object} gl - WebGL context
 * @param {Number} a_Position - position attribute variable
 * @param {Number} u_FragColor - color uniform variable
 * @returns {undefined}
 */
function drawObjects(gl, a_Position, u_FragColor) {

  // Clear <canvas>
  gl.clear(gl.COLOR_BUFFER_BIT);

  // draw lines
  if (line_verts.length) {
    // enable the line vertex
    gl.bindBuffer(gl.ARRAY_BUFFER, vBuffer_Line);
    // set vertex data into buffer (inefficient)
    gl.bufferData(gl.ARRAY_BUFFER, flatten(line_verts), gl.STATIC_DRAW);
    // share location with shader
    gl.vertexAttribPointer(a_Position, 2, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(a_Position);

    gl.uniform4f(u_FragColor, 0.0, 1.0, 0.0, 1.0);
    // draw the lines
    gl.drawArrays(gl.LINES, 0, line_verts.length);
  }

  // \todo draw triangles
  if (tri_verts.length) {
    // Bind the triangle vertex buffer
    gl.bindBuffer(gl.ARRAY_BUFFER, vBuffer_Triangle);
    // Set triangle vertex data into buffer
    gl.bufferData(gl.ARRAY_BUFFER, flatten(tri_verts), gl.STATIC_DRAW);
    // Share location with shader
    gl.vertexAttribPointer(a_Position, 2, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(a_Position);

    gl.uniform4f(u_FragColor, 0.0, 1.0, 0.0, 1.0);
    // Draw triangles
    gl.drawArrays(gl.TRIANGLES, 0, tri_verts.length);
  }

  // \todo draw quads
  if (quad_verts.length > 3) { // Wait until four quad verts so it does not draw triangle on third vert
    // Bind the quad vertex buffer data
    gl.bindBuffer(gl.ARRAY_BUFFER, vBuffer_Quad);
    // Set quad vertex data into buffer
    gl.bufferData(gl.ARRAY_BUFFER, flatten(quad_verts), gl.STATIC_DRAW);
    // Share location with shader
    gl.vertexAttribPointer(a_Position, 2, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(a_Position);

    gl.uniform4f(u_FragColor, 0.0, 1.0, 0.0, 1.0);
    // Draw triangles that make up quad
    gl.drawArrays(gl.TRIANGLE_STRIP, 0, quad_verts.length);
  }

  // draw primitive creation vertices 
  gl.bindBuffer(gl.ARRAY_BUFFER, vBuffer_Pnt);
  gl.bufferData(gl.ARRAY_BUFFER, flatten(points), gl.STATIC_DRAW);
  gl.vertexAttribPointer(a_Position, 2, gl.FLOAT, false, 0, 0);
  gl.enableVertexAttribArray(a_Position);

  if (drawing_type == "Draw") {
    gl.uniform4f(u_FragColor, 1.0, 1.0, 1.0, 1.0);
  } else if (drawing_type == "Select") {
    gl.uniform4f(u_FragColor, 0.0, 0.0, 1.0, 1.0);
  }
  gl.drawArrays(gl.POINTS, 0, points.length);
}

/**
 * Converts 1D or 2D array of Number's 'v' into a 1D Float32Array.
 * @param {Number[] | Number[][]} v
 * @returns {Float32Array}
 */
function flatten(v) {
  var n = v.length;
  var elemsAreArrays = false;

  if (Array.isArray(v[0])) {
    elemsAreArrays = true;
    n *= v[0].length;
  }

  var floats = new Float32Array(n);

  if (elemsAreArrays) {
    var idx = 0;
    for (var i = 0; i < v.length; ++i) {
      for (var j = 0; j < v[i].length; ++j) {
        floats[idx++] = v[i][j];
      }
    }
  }
  else {
    for (var i = 0; i < v.length; ++i) {
      floats[i] = v[i];
    }
  }

  return floats;
}
