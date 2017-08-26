var canvas = document.getElementById("glCanvas");
ctx = canvas.getContext("2d");

objects = {};

camera = [[canvas.width/2,0,canvas.height/2],[1,1],1]; // [[Position],[Rotation(x,z)],Focal];
triangle = [
  [0,1,25],
  [25,1,50],
  [25,1,0]
]

function drawShape(shape) {
  ctx.beginPath();
  var newShape = [];
  var cP = camera[0]; // Camera Position
  console.log(cP);
  var cR = camera[1]; // Camera Rotation
  var cF = camera[2];
  // Camera direction vector
  var cV = [
    Rnd(cF*Math.sin(toRad(cR[1])),3), // 0 Degrees Z points straight to Y.
    Rnd(cF*Math.cos(toRad(cR[1])),3),
    Rnd(cF*Math.sin(toRad(cR[0])),3)  // 0 Degrees X points straight to Y.
  ];
  console.log("Camera Vector: ",cV);
  // Perspective mapping
  for(var i = 0; i < shape.length; i++) { // Each point in 3D
    var x = shape[i][0];
    var y = shape[i][1];
    var z = shape[i][2];
    var pV = [x-cP[0],y-cP[1],z-cP[2]]; // Point direction vector
    // Restricting to X and Z dimensions and comparing to Y.
    var distPX = mag(dim("XY",pV));
    var distPZ = mag(dim("ZY",pV));
    var distCX = mag(dim("XY",cV));
    var distCZ = mag(dim("ZY",cV));

    /* 
      sin(acos(x)) = sqrt(1-x^2)
      cos(acos(x)) = x
    */
    /*var thetaX = Rnd(Math.acos(
      dot(dim("XZ",cV),dim("XZ",pV)) /
      (distCX*distPX)
    ),5);
    var thetaY = Rnd(Math.acos(
      dot(dim("YZ",cV),dim("YZ",pV)) /
      (distCY*distPY)
    ),5);
    var oppX = distPX * Math.sin(thetaX);
    var oppY = distPY * Math.sin(thetaY);
    */

    var adjX = dot(dim("XY",cV),dim("XY",pV)) / distCX;
    var adjZ = dot(dim("ZY",cV),dim("ZY",pV)) / distCZ;
    
    var oppX = distPX * Math.sqrt(1-Math.pow(adjX/distPX,2));
    var oppZ = distPZ * Math.sqrt(1-Math.pow(adjZ/distPZ,2));

    var projOppX = distCX*oppX/adjX; // Represents X
    var projOppZ = distCZ*oppZ/adjZ; // Represents Y
    // If the dot product is greater than 0, b is on the right of a.
    if(adjX > 0) projOppX *= -1; 
    if(adjZ < 0) projOppZ *= -1;

    console.log("--------\nPoint Position: ", shape[i],
      "\nPosition Vector " + i + ": ", pV,
      "\nDistancePXY: ", distPX, 
      "\nDistancePZY: ", distPZ, 
      "\nDistanceCXY: ", distCX, 
      "\nDistanceCZY: ", distCZ,
      "\nAdjacentXY: ", adjX,
      "\nAdjacentZY: ", adjZ,
      "\nOppositeXY: ", oppX, 
      "\nOppositeZY: ", oppZ,
      "\nProjectedOppXY: ", projOppX,
      "\nProjectedOppZY: ", projOppZ
    );

    newShape.push([Rnd(cP[0]+projOppX,3),Rnd(cP[2]+projOppZ,3)]);
  }
  console.log(newShape);
  ctx.moveTo(newShape[0][0],newShape[0][1]);
  for(var i = 1; i < shape.length; i++) {
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

drawShape(triangle);
