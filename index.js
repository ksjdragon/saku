//temp scaling 1 = 1 centimeter
// 1 centimeter = 100px

Saku = {
  Scene: function(canvas, pixelScale, globalScale) {
    //invalid
    this.canvas = canvas;
    this.globalScale = "centimeter";
    this.pixelScale = pixelScale || 1000;
    this.camera = undefined;
    this.objects = [];
    this.addObject = function(obj) {
      var invalid = [varType(obj) !== "Object", varType(obj)];
      if(varType(obj) !== "Object") throw TypeError("Expected Object as argument; Got " + invalid[1] + ".");

      this.objects.push(obj);
    }
    this.setCamera = function(cam) {
      //invalid
      this.camera = cam;
    }
  },
  Camera: function(pos, rot, foc, size) {
    //invalid
    this.position = pos || [0,0,0];
    this.rotation = rot || [0,0];
    this.focal = foc || 0.35;
    this.size = size || 0.32;
  },
  Face: function(vertices, options) {
    if(vertices === undefined) throw TypeError("Not enough arguments; Expected Array as argument.");
    var invalid = [[varType(vertices) !== "Array", varType(vertices)]];
    invalid[1] = vertices.every(function(element) { return varType(element) !== "Array"; });
    invalid[2] = invalid[1] || vertices.every(function(element) { return element.every(function(number) { return isNaN(number); }); });
    if(invalid[0][0]) throw TypeError("Expected Array as argument; Got " + invalid[0][1]);
    if(invalid[1]) throw TypeError("Expected Arrays as 1st dimensional element.");
    if(invalid[2]) throw TypeError("Expected Numbers as 2nd dimensional element.");

    this.name = options.name || "Unnamed Object Face";
    this.vertices = vertices;
    this.origin = options.origin || getOrigin(vertices);

    this.translateX = function(value) {
      this.vertices.forEach(function(ele, index, arr) {
        arr[index][0] = ele[0] + value;
      });
    }

    this.translateY = function(value) {
      this.vertices.forEach(function(ele, index, arr) {
        arr[index][1] = ele[1] + value;
      });
    }

    this.translateZ = function(value) {
      this.vertices.forEach(function(ele, index, arr) {
        arr[index][2] = ele[2] + value;
      });
    }

    this.translate = function(value) {
      this.vertices.forEach(function(ele, index, arr) {
        arr[index][0] = ele[0] + value;
        arr[index][1] = ele[1] + value;
        arr[index][2] = ele[2] + value;
      });
    }
  },
  Model: function(faces, connections, name) {
    this.name = options.name || "Unnamed Object Model";
    this.faces = faces;
    this.connections = connections;
  }
}

var ref = ["Triangle", "Square", "Pentagon", "Hexagon", "Heptagon", "Octagon", "Nonagon", "Decagon"];

Saku["Polygon"] = function(sides, name, size) {
  var defArray = [];
  var offset = !(sides%2)*Math.PI/sides;
  for(var i = 0; i < sides; i++) {
    defArray.push([
      Math.sin(i*-2*Math.PI/sides+offset),
      0,
      Math.cos(i*-2*Math.PI/sides+offset)
    ]);
  }

  defArray = Rnd(defArray,5);
  Saku.Face.call(this, defArray, {name: (name || (sides > 10) ? sides+"-gon" : ref[sides-3])});
  this.prototype = Object.create(Saku.Face.prototype);
}

ref.forEach(function(ele, index) {
  Saku[ele] = function(name) {
    Saku.Polygon.call(this, index+3, name);
    this.prototype = Object.create(Saku.Face.prototype);
  }
});

/*Saku["Cube"] = function(name) {
  var defArray = [
    [-0.5, -0.5, 0.5],
    [0.5, -0.5, 0.5],
    []
  ]
}*/

function arrayOperation(item, operator, amount) {
  var operators = {
    "+": function(x,y) {return x+y},
    "-": function(x,y) {return x-y},
    "*": function(x,y) {return x*y},
    "/": function(x,y) {return x/y},
    "^": function(x,y) {return Math.pow(x,y)},
    "log": function(x,y) {return Math.log(x) / Math.log(y || 10)}
  }
  var type = varType(item);
  if(type === "Array") {
    var arr = [];
    for(var i = 0; i < item.length; i++) {
      arr[i] = arrayOperation(item[i], operator, amount);
    }
    return arr;
  } else if(type === "Number") {
    return operators[operator](item, amount);
  } else {
    throw new TypeError("Expected Numbers, got " + type + ".");
  }
}

function varType(variable) {
  var type = typeof variable;
  if(type === "object") {
      return (variable.constructor === Array) ? "Array" : "Object";  
  } else {
    return type[0].toUpperCase() + type.slice(1);
  }
}

function getOrigin(vert) {
  var origin = [0,0,0];
  for(var i = 0; i < vert[0].length; i++) {
    for(var j = 0; j < vert.length; j++) origin[i] += vert[j][i];
    origin[i] /= Rnd(vert.length,3);
  }
  return origin;
}

function updateFrame(scene) {
  var ctx = document.getElementById(scene.canvas).getContext("2d");
  ctx.clearRect(0,0,canvas.width,canvas.height)
  for(var i = 0; i < scene.objects.length; i++) {
    var object = scene.objects[i];
    object = projectObj(object, scene);

    ctx.beginPath();
    ctx.moveTo(object[0][0],object[0][1]);
    for(var j = 1; j < object.length; j++) {
      ctx.lineTo(object[j][0],object[j][1]);
    } 
    ctx.fill(); 
  }
}

function projectObj(object, scene) {
  var log = [];
  var newShape = [];
  var canvas = document.getElementById(scene.canvas);
  var cP = scene.camera.position;
  var cR = scene.camera.rotation;
  var cF = scene.camera.focal;
  // Camera direction vector
  var cV = [
    Rnd(cF*Math.cos(toRad(cR[0]))*Math.sin(toRad(cR[1])),3), // 0 Degrees Z points straight to Y.
    Rnd(cF*Math.cos(toRad(cR[0]))*Math.cos(toRad(cR[1])),3),
    Rnd(cF*Math.sin(toRad(cR[0])),3)  // 0 Degrees X points straight to Y.
  ];

  if(verbose) {
    log = {
      "Object Name": object.name,
      "Camera Position": vecToObj(cP),
      "Camera Rotation": {
        "X": cR[0],
        "Z": cR[1]
      },
      "Camera Focal": cF,
      "Camera Vector": vecToObj(cV),
      "Object Origin": vecToObj(object.origin),
      "Object Vertice Values": {},
      "Canvas Points": {}
    }
  }

  // Perspective mapping
  for(var i = 0; i < object.vertices.length; i++) { // Each point in 3D
    var x = object.vertices[i][0];
    var y = object.vertices[i][1];
    var z = object.vertices[i][2];
    var pV = [x-cP[0],y-cP[1],z-cP[2]]; // Point direction vector
    // Restricting to X and Z dimensions and comparing to Y.
    var distPX = mag(dim("XY",pV));
    var distPZ = mag(dim("ZY",pV));
    var distCX = mag(dim("XY",cV));
    var distCZ = mag(dim("ZY",cV));

    /* Adjacent and Opposite calculated with math simplifications 
        cos(arccosx) = x
        sin(arccosx) = sqrt(1-x^2) or Pythagorean theorem
    */

    var adjX = Rnd(dot(dim("XY",cV),dim("XY",pV)) / distCX,5); 
    var adjZ = Rnd(dot(dim("ZY",cV),dim("ZY",pV)) / distCZ,5);
    
    var oppX = Math.sqrt(Math.pow(distPX,2) - Math.pow(adjX,2));
    var oppZ = Math.sqrt(Math.pow(distPZ,2) - Math.pow(adjZ,2));

    var projOppX = Rnd(distCX*oppX/adjX,5); // Represents X in projective plane.
    var projOppZ = Rnd(distCZ*oppZ/adjZ,5); // Represents Y in projective plane.
    // If the dot product of a and (b rotated -pi/2) is greater than 0, b is on the right of a.
    var aheadX = dot([cV[0],cV[1]],[-pV[1],pV[0]]);
    var aheadZ = dot([cV[2],cV[1]],[-pV[1],pV[2]]);

    if(aheadX < 0) projOppX *= -1;
    if(aheadZ > 0) projOppZ *= -1;

    projOppX += scene.camera.size/2;
    projOppZ += (canvas.height/canvas.width)*scene.camera.size/2;

    var canvasPointX = Rnd(projOppX * canvas.width/scene.camera.size,3);
    var canvasPointY = Rnd(projOppZ * canvas.width/scene.camera.size,3);

    if(verbose) {
      var num  = "Point " + (i+1).toString();
      log["Object Vertice Values"][num] = {
        "Point Position": vecToObj(object.vertices[i]),
        "Position Vector": vecToObj(pV),
        "DistancePXY": distPX,
        "DistancePZY": distPZ, 
        "DistanceCXY": distCX, 
        "DistanceCZY": distCZ,
        "AdjacentXY": adjX,
        "AdjacentZY": adjZ,
        "OppositeXY": oppX, 
        "OppositeZY": oppZ,
        "ProjectedOppXY": projOppX,
        "ProjectedOppZY": projOppZ,
        "AheadXY": aheadX,
        "AheadZY": aheadZ
      };
      log["Canvas Points"][num] = vecToObj([canvasPointX, canvasPointY]);
    }
    newShape.push([canvasPointX, canvasPointY]);
  }
  if(verbose) console.log(log);
  return newShape;
}

function toRad(deg) {
  return deg/180*Math.PI;
}

function Rnd(item,fig) {
  if(varType(item) === "Array") {
    var arr = [];
    for(var i = 0; i < item.length; i++) {
      arr[i] = Rnd(item[i],fig);
    }
    return arr;
  } else if(varType(item) === "Number") {
    return Math.round(item*Math.pow(10,fig))/Math.pow(10,fig);
  } else {
    throw new TypeError("Expected Integers, got " + varType(item) + ".");
  }
}

function dot(vecOne, vecTwo) {
  if(vecOne.length !== vecTwo.length) {
      throw new SizeMismatch('VectorDimMismatch', [vecOne,vecTwo]);
    return;
  }
  var final = 0;
  for(var i = 0; i < vecOne.length; i++) {
    final += vecOne[i]*vecTwo[i];
  }
  return final;
}

function mag(vec) {
  var rad = 0;
  for(var i = 0; i < vec.length; i++) {
    rad += Math.pow(vec[i],2);
  }
  return Math.sqrt(rad);
}

function dim(dimensions, vector) {
  var newVec = [];
  var ref = {
    "x": 0,
    "y": 1,
    "z": 2
  };

  if(dimensions.constructor === Array) {
    for(var i = 0; i < dimensions.length; i++) {
      newVec.push(vector[dimensions[i]]);
    }
  } else if(dimensions.constructor === String) {
    for(var i = 0; i < dimensions.length; i++) {
      newVec.push(vector[ref[dimensions[i].toLowerCase()]]);
    }
  }
  return newVec;
}

function SizeMismatch(message, obj) {
  this.mesage = message;
  this.name = "SizeMismatch";
  this.matrix = obj;
}

function vecToObj(vec) {
  var obj = {};
  var ref = ["X","Y","Z"];
  vec.forEach(function(part, index) {
    obj[ref[index]] = part;
  });
  return obj;
}

var canvas = document.getElementById("glCanvas");
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

drawObjects = [];
verbose = false; // [[Position],[Rotation(x,z)],Focal];

scene = new Saku.Scene("glCanvas");
var polygon = new Saku.Polygon(3);
var camera = new Saku.Camera();
scene.setCamera(camera);

scene.addObject(polygon);
polygon.translateY(10);

setInterval(function() { updateFrame(scene); }, 500);

function verb() {
  verbose = true;
  setTimeout(function() { verbose = false; }, 600);
}
