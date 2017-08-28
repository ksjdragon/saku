Saku = {
  Scene: function() {
    this.objects = [];
    this.addObject = function(obj) {
      var invalid = [varType(obj) !== "Object", varType(obj)];
      if(varType(obj) !== "Object") throw TypeError("Expected Object as argument; Got " + invalid[1] + ".");

      this.objects.push(obj);
    }
  },
  Object: function(vertices, name) {
    if(vertices === undefined) throw TypeError("Not enough arguments; Expected Array as argument.");
    var invalid = [[varType(vertices) !== "Array", varType(vertices)]];
    invalid[1] = vertices.every(function(element) { return varType(element) !== "Array"; });
    invalid[2] = invalid[1] || vertices.every(function(element) { return element.every(function(number) { return isNaN(number); }); });
    if(invalid[0][0]) throw TypeError("Expected Array as argument; Got " + invalid[0][1]);
    if(invalid[1]) throw TypeError("Expected Arrays as 1st dimensional element.");
    if(invalid[2]) throw TypeError("Expected Number as 2nd dimensional element.");

    this.name = name || "Unnamed Object";
    this.vertices = vertices;

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
  }
}

Saku["Triangle"] = function(name) {
  Saku.Object.call(this, [
    [500,4,500],
    [250,4,800],
    [250,4,600]
  ], (name || "Triangle"));
  this.prototype = Object.create(Saku.Object.prototype);
}

Saku["Square"] = function(name) {
  Saku.Object.call(this, [
    [1000,4,600],
    [1500,4,600],
    [1500,4,1100],
    [1000,4,1100] 
  ], (name || "Square"));
  this.prototype = Object.create(Saku.Object.prototype);
}

function varType(variable) {
  var type = typeof variable;
  if(type === "object") {
      return (variable.constructor === Array) ? "Array" : "Object";  
  } else {
    return type[0].toUpperCase() + type.slice(1);
  }
}

function updateFrame() {
  ctx.clearRect(0,0,canvas.width,canvas.height)
  for(var i = 0; i < scene.objects.length; i++) {
    var object = scene.objects[i];
    object = projectObj(object);
    ctx.beginPath();
    ctx.moveTo(object[0][0],object[0][1]);
    for(var j = 1; j < object.length; j++) {
      ctx.lineTo(object[j][0],object[j][1]);
    } 
    ctx.fill();
    
  }
}

function projectObj(object) {
  var log = [];
  var newShape = [];
  var cP = camera[0]; // Camera Position
  var cR = camera[1]; // Camera Rotation
  var cF = camera[2];
  // Camera direction vector
  var cV = [
    Rnd(cF*Math.sin(toRad(cR[1])),3), // 0 Degrees Z points straight to Y.
    Rnd(cF*Math.cos(toRad(cR[1])),3),
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
        sin(arccosx) = sqrt(1-x^2)
    */

    var adjX = dot(dim("XY",cV),dim("XY",pV)) / distCX; 
    var adjZ = dot(dim("ZY",cV),dim("ZY",pV)) / distCZ;
    
    var oppX = distPX * Math.sqrt(1-Math.pow(adjX/distPX,2));
    var oppZ = distPZ * Math.sqrt(1-Math.pow(adjZ/distPZ,2));

    var projOppX = distCX*oppX/adjX; // Represents X in projective plane.
    var projOppZ = distCZ*oppZ/adjZ; // Represents Y in projective plane.
    // If the dot product is greater than 0, b is on the right of a.
    if(adjX > 0) projOppX *= -1; 
    if(adjZ < 0) projOppZ *= -1;

    var canvasPointX = Rnd(cP[0]+projOppX,3);
    var canvasPointY = Rnd(cP[2]+projOppZ,3)

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
        "ProjectedOppZY": projOppZ
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

function Rnd(num,fig) {
  return Math.round(num*Math.pow(10,fig))/Math.pow(10,fig);
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
  vec.forEach(function(part) {
    obj[ref[part]] = vec[part];
  });
  return obj;
}

var canvas = document.getElementById("glCanvas");
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;
ctx = canvas.getContext("2d");

drawObjects = [];
verbose = false;
camera = [[canvas.width/2,0,canvas.height/2],[0,0],1]; // [[Position],[Rotation(x,z)],Focal];

scene = new Saku.Scene();
var triangle = new Saku.Triangle();
var square = new Saku.Square();

scene.addObject(triangle);
scene.addObject(square);

setInterval(updateFrame, 500);