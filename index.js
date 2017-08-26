var canvas = document.getElementById("glCanvas");
ctx = canvas.getContext("2d");

objects = {};
verbose = true;
camera = [[canvas.width/2,0,canvas.height/2],[1,1],1]; // [[Position],[Rotation(x,z)],Focal];

triangle = {
  "name": "Triangle",
  "vertices": [
    [0,1,25],
    [25,1,50],
    [25,1,0]
  ]
}

function drawShape(shape) {
  ctx.beginPath();
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
      "Shape Name": shape.name,
      "Camera Position": vecToObj(cP),
      "Camera Rotation": {
        "X": cR[0],
        "Z": cR[1]
      },
      "Camera Focal": cF,
      "Camera Vector": vecToObj(cV),
      "Shape Vertice Values": {},
      "Canvas Points": {}
    }
  }

  // Perspective mapping
  for(var i = 0; i < shape.vertices.length; i++) { // Each point in 3D
    var x = shape.vertices[i][0];
    var y = shape.vertices[i][1];
    var z = shape.vertices[i][2];
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
      log["Shape Vertice Values"][num] = {
        "Point Position": vecToObj(shape.vertices[i]),
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
  ctx.moveTo(newShape[0][0],newShape[0][1]);
  for(var i = 1; i < shape.vertices.length; i++) {
    ctx.lineTo(newShape[i][0],newShape[i][1]);
  } 
  ctx.fill();
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
  for(var i = 0; i < vec.length; i++) {
    obj[ref[i]] = vec[i];
  }
  return obj;
}

drawShape(triangle);
