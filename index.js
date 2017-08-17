var canvas = document.getElementById("glCanvas");
ctx = canvas.getContext("2d");

objects = {};

camera = [[(canvas.width/2)-50,canvas.height/2,0],[0,90]]; // [[Position],[Rotation]];

triangle = [
  [0,25,1],
  [25,50,1],
  [25,0,1]
]

function drawShape(shape) {
  ctx.beginPath();
  var newShape = [];
  var cP = camera[0];
  var cR = camera[1];
  // Camera direction vector
  var cV = [
    Rnd(Math.cos(toRad(cR[1])),3),
    Rnd(Math.sin(toRad(cR[0])),3),
    Rnd(Math.sin(toRad(cR[1])),3)
  ];
  console.log(cV);
  // Perspective mapping
  for(var i = 0; i < shape.length; i++) {
    var x = shape[i][0];
    var y = shape[i][1];
    var z = shape[i][2];
    var pV = [x-cV[0],y-cV[1],z-cV[1]];
    console.log(pV);
    var theta = Rnd(Math.acos((dot(cV,pV)/(mag(cV)*mag(pV)))),5);
    console.log(theta);
    
    var dZ = Math.abs(shape[i][2] - c[2]);
    newShape.push([c[0]+(x-c[0])/dZ,c[1]+(y-c[1])/dZ]);
  }
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
    //throw error
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

drawShape(triangle);