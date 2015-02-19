function getWindowSize(){ // gets current window dimensions 
var w = window, d = document, e = d.documentElement, g = d.getElementsByTagName('body')[0], 
width = w.innerWidth || e.clientWidth || g.clientWidth, 
height = w.innerHeight|| e.clientHeight|| g.clientHeight;
return {'width': width, 'height': height}
}
HTMLCanvasElement.prototype.fit = function(){ // fit canvas to screen dimensions; 
var dimensions = getWindowSize(); 
this.setAttribute('width', dimensions.width); // setting node object property cvs.style.width distorts resolution and creates stretched image with reduced resolution, so must set HTML attributes to avoid this 
this.setAttribute('height', dimensions.height); 
this.style.left = '0px' 
this.style.top = '0px'
}
var paper = document.getElementById("paper"); 
var mask = document.getElementById("mask"); 
paper.fit(); 
window.onresize = function(){ // resize all canvases upon window resize 
paper.fit(); 
}; 
var ctx = paper.getContext('2d'); 
var maskCtx = document.getElementById("mask").getContext("2d"); 








//generic object handling 

function isObjectLiteral(object) { // tests if _obj is an object literal or not returning true or false 
return object && object.constructor === Object 
}
function clone(obj) { // clones object literal so changes to cloned object are not reflected in original version. However attributes which are objects are NOT cloned so that they can be references which can be changed 
if (null == obj || "object" != typeof obj) return obj; 
if (!isObjectLiteral(obj)){ // attributes which are objects are NOT cloned but returned as references 
return obj
}
var copy = new obj.constructor(); // make a blank copy of obj using it's constructor function 
for (var attr in obj) {
var sub_object = obj[attr]; 
if (isObjectLiteral(sub_object)){
copy[attr] = clone(sub_object)
}
else if (obj.hasOwnProperty(attr)){
copy[attr] = sub_object;
}; 
}
return copy;
}
function initialise(instance, objectLiteralsTuple){ // initialise instance attributes. Sets instance attributes as copies of those specified by object literals in objectLiteralsTuple (arbitrary in number) in order they are specified from left to right, thus initialising instance attributes. 
if (!arguments){return} 
for(var n = 1; n < arguments.length; n ++){ // loop through object literals
var objectLiteral = arguments[n]; 
if (!objectLiteral){continue}
for(var attribute_name in objectLiteral){ 
var attribute = objectLiteral[attribute_name]; 
if (isObjectLiteral(attribute)){
instance[attribute_name] = instance[attribute_name] || {}; // if no attribute to override then create new empty attribute 
initialise(instance[attribute_name], attribute); 
}
else if(attribute != undefined && attribute != null){ // else a primitive so set (unless undefined or null); 
instance[attribute_name] = clone(attribute); 
}
}
} 
}











// image handling 

// Image handling functions Image already exists as constructor; 
Image.availableIdNumber = 0; 
Image.dictionary = {}; 
Image.load = function(imageSettingsTuple){ // loads an image and sets dictionary entry for it. imageSettingsTuple = (imageSettings1 = {'id': imageId, 'src': src}, imageSettings2 = {'id': imageId2, 'src': src2}, ...). imageName is optional, default format: name = '#image' + image_number 
for (var imageIndex = 0; imageIndex < arguments.length; imageIndex++){ // loop through tuple of settings object literals 
var imageSettings = arguments[imageIndex]; 
imageSettings.id = imageSettings.id || '#image' + Image.availableIdNumber++; 
imageSettings.className = 'image'; 
var image = new Image(); 
initialise(image, imageSettings); 
Image.dictionary[image.id] = image; 
}
}
Image.create = function(imageSettings){ // creates blank canvas to be used as image, stores in dictionary, creates id if not given, returns canvas;
var image = document.createElement('canvas'); 
imageSettings = imageSettings || {}; 
imageSettings.id = imageSettings.id || '#image' + Image.availableIdNumber++; 
//image.className = 'image'; 
initialise(image, imageSettings); 
Image.dictionary[imageSettings.id] = image; 
image.ctx = image.getContext('2d'); 
return image; 
}

HTMLCanvasElement.prototype.show = function(){
//alert('show'); 
document.body.appendChild(this); 
}











// 3D stuff 

//alert("ok"); 
Array.prototype.dot = function(vector2){ // vector scalar product; 
var scalar_product = 0; 
for (var n = 0; n < this.length; n ++){
scalar_product += this[n]*vector2[n]; 
}; 
return scalar_product; 
}
Array.prototype.mod = function(){
return Math.sqrt(this.dot(this)); 
}
Array.prototype.times = function(scalar){ // multiply vector components by scalar; 
return [scalar*this[0], scalar*this[1], scalar*this[2]]; 
}
Array.prototype.normalise = function(){
return this.times(1/this.mod()); 
}
Array.prototype.cross = function(vector2){ // cross vector product; 
var x = this[1]*vector2[2] - this[2]*vector2[1]; 
var y = this[2]*vector2[0] - this[0]*vector2[2]; 
var z = this[0]*vector2[1] - this[1]*vector2[0]; 
return [x, y, z]; 
}
Array.prototype.add = function(vector2){ // vector addition; 
return [this[0] + vector2[0], this[1] + vector2[1], this[2] + vector2[2]]; 
}
Array.prototype.subtract = function(vector2){ // vector addition; 
return [this[0] - vector2[0], this[1] - vector2[1], this[2] - vector2[2]]; 
}
Array.prototype.getXHatDash = function(){ // this = zDashDirection = camera.direction; 
if (this[0] == 0 && this[1] == 0){ // if this || zHat; 
return [1, 0, 0]; 
}
return this.cross([0, 0, 1]).normalise(); 
}
Array.prototype.getSphericalAxes = function(){ // physics spherical polars axes object given Cartesian coord this; 
var rHat = this.normalise(), phiHat, thetaHat; 
if (this[0] == 0 && this[1] == 0){
thetaHat = [1, 0, 0]; 
phiHat = [0, 1, 0]; 
}
else{
phiHat = rHat.cross([0, 0, 1]).normalise(); 
thetaHat = phiHat.cross(rHat); 
}
return {'rHat': rHat, 'phiHat': phiHat, 'thetaHat': thetaHat}
}
Array.prototype.rotateAboutOrigin = function(angleDegrees, axisVector){ // rotates coordinate this=[x, y, z] about axis passing through [0, 0, 0] and point [axisVector[0], axisVector[1], axisVector[2]]; 
var zHatDash = axisVector.normalise(), xHatDash, yHatDash; 
if (zHatDash[0] == 0 && zHatDash[1] == 0){
xHatDash = [1, 0, 0]; 
yHatDash = [0, -zHatDash[2], 0]; 
}
else{
xHatDash = zHatDash.cross([0, 0, 1]).normalise(); 
yHatDash = zHatDash.cross(xHatDash); 
} 
var xDash = xHatDash.dot(this); 
var yDash = yHatDash.dot(this); 
var zDash = zHatDash.dot(this); 
var angleRadians = Math.PI*angleDegrees/180; 
var cos = Math.cos(angleRadians), sin = Math.sin(angleRadians); 
var newXDash = cos*xDash - sin*yDash; 
var newYDash = sin*xDash + cos*yDash; 
var rotated = xHatDash.times(newXDash).add(yHatDash.times(newYDash)).add(zHatDash.times(zDash)); 
return rotated; 
}
Array.prototype.rotate = function(angle, rotationAxis, rotationOrigin){
var subtracted = this.subtract(rotationOrigin);
var rotated = subtracted.rotateAboutOrigin(angle, rotationAxis); 
var added = rotated.add(rotationOrigin); 
return added; 
}









// rendering stuff
// context class default static settings; 
var lights = [
{
'direction': [1, 0, -1].normalise()
}
]
CanvasRenderingContext2D.settings = {
'*': {
'lineWidth': 1
}, 
'point3d': {
'strokeStyle': 'yellow' 
}, 
'path3d': {
'strokeStyle': 'green'
}, 
'sphere': {
'fillStyle': 'green'
}, 
'pixel': {
'rgba': [0, 0, 0, 255], 
'size': 20
}, 
'pixel3d': {
'rgba': [0, 0, 0, 255], 
'size': 20
}, 
'polygon3d': {
'strokeStyle': 'black', 
'fillStyle': 'rgba(0, 0, 255, 0.5)', 
'renderFunction': function(shape){
var coords = shape.coords; 
// get good normal vectors; 
if (coords.length == 3){
var edge1 = coords[1].subtract(coords[0]); 
var edge2 = coords[2].subtract(coords[1]); 
}
else if(coords.length == 4){ 
var edge1 = coords[2].subtract(coords[0]); 
var edge2 = coords[3].subtract(coords[1]); 
}
else{return}; 
var normal = edge1.cross(edge2).normalise(); 
var illumination
for (var lightIndex=0; lightIndex<lights.length; lightIndex++){
var light = lights[lightIndex]; 
illumination = Math.max(-normal.dot(light.direction), 0); 
}
var colour = Math.floor(255*illumination); 
this.lineWidth = 0; 
this.strokeStyle = "rgba(" + colour + ", " + colour + ", " + colour + ", 1)"; 
this.fillStyle = "rgba(" + colour + ", " + colour + ", " + colour + ", 1)"
} 
}
};
CanvasRenderingContext2D.prototype.point = function(point2D){
this.beginPath();
this.arc(point2D[0], point2D[1], 5, 0,2*Math.PI);
this.stroke();
}
CanvasRenderingContext2D.prototype.point3d = function(camera, point3d){
var retinaCoord = getRetinaCoord(camera, point3d.coord); 
point3d.magnification = retinaCoord.magnification;
this.point(retinaCoord); 
} 

CanvasRenderingContext2D.prototype.polygon = function(coords){
this.beginPath();
var pathStarted = false; 
for (var n = 1; n < coords.length; n++){ 
var coord1 = coords[n - 1], coord2 = coords[n], x1 = coord1[0], y1 = coord1[1], x2 = coord2[0], y2 = coord2[1]; 
!pathStarted && this.moveTo(x1, y1); 
pathStarted = true; 
this.lineTo(x2, y2); 
}
this.fill(); 
this.closePath(); 
this.stroke(); 
}
CanvasRenderingContext2D.prototype.path = function(coords){
this.beginPath();
for (var n = 1; n < coords.length; n++){ 
var coord1 = coords[n - 1], coord2 = coords[n], x1 = coord1[0], y1 = coord1[1], x2 = coord2[0], y2 = coord2[1];
var savedLineWidth = this.lineWidth; 
this.lineWidth = savedLineWidth*coords.magnification || savedLineWidth;
this.moveTo(x1, y1); 
this.lineTo(x2, y2); 
this.stroke(); 
this.lineWidth = savedLineWidth; 
}
}
CanvasRenderingContext2D.prototype.path3d = function(camera, path3d){
var path2d = getRetinaCoords(camera, path3d.coords); 
path3d.magnification = path3d.coords[0].magnification; 
path2d.magnification = path3d.coords[0].magnification; 
this.path(path2d); 
}
function getRandomPath(numPoints){
var points = []; 
for (var n = 0; n < numPoints+1; n++){
points.push([50*Math.random()-25, 50*Math.random()-25, 50*Math.random()-25]); 
}
return {'className': 'path3d', 'coords': points}; 
}
var randomPath = getRandomPath(20); 

// polygon and polyhedron rendering 
CanvasRenderingContext2D.prototype.polygon3d = function(camera, polygon3d){ 
var path2d = getRetinaCoords(camera, polygon3d.coords); 
polygon3d.magnification = polygon3d.coords[0].magnification; 
this.polygon(path2d); 
}
//alert("ok"); 
var e_x = [1, 0, 0], e_y = [0, 1, 0], e_z = [0, 0, 1]; 
var size = 50, s = size; 
var edge_x = e_x.times(size), edge_y = e_y.times(size), edge_y = e_y.times(size); 
var centre = [0, 0, 0], c = centre; 
var cube = [
[
[c[0]-s/2, c[1]-s/2, c[2]+s/2], [c[0]+s/2, c[1]-s/2, c[2]+s/2], [c[0]+s/2, c[1]-s/2, c[2]-s/2], [c[0]-s/2, c[1]-s/2, c[2]-s/2]
], 
[
[c[0]-s/2, c[1]+s/2, c[2]+s/2], [c[0]+s/2, c[1]+s/2, c[2]+s/2], [c[0]+s/2, c[1]+s/2, c[2]-s/2], [c[0]-s/2, c[1]+s/2, c[2]-s/2]
],
[
[c[0]-s/2, c[1]-s/2, c[2]+s/2], [c[0]+s/2, c[1]-s/2, c[2]+s/2], [c[0]+s/2, c[1]+s/2, c[2]+s/2], [c[0]-s/2, c[1]+s/2, c[2]+s/2],
], 
[
[c[0]-s/2, c[1]-s/2, c[2]-s/2], [c[0]+s/2, c[1]-s/2, c[2]-s/2], [c[0]+s/2, c[1]+s/2, c[2]-s/2], [c[0]-s/2, c[1]+s/2, c[2]-s/2],
]
]; 
function cubeData(){
var data = []; 
for (var axis = 0; axis < 3; axis ++){
var unitVec = [0, 0, 0]; 
unitVec[axis] = 1; 
}
}
// circles and spheres rendering 
CanvasRenderingContext2D.prototype.circle = function(circle){
this.beginPath();
this.arc(circle.x, circle.y, circle.r, 0,2*Math.PI);
this.fill(); 
this.stroke();
}
CanvasRenderingContext2D.prototype.circles = function(circles){
for (var n = 0; n < circles.length; n ++){
var circle = circles[n]; 
this.circle(circle); 
}
}
CanvasRenderingContext2D.prototype.sphere = function(camera, sphere, retinaDimensions){
var retinaDimensions = retinaDimensions || getWindowSize(); 
var retinaCoord = getRetinaCoord(camera, [sphere.x, sphere.y, sphere.z], retinaDimensions); 
//if (retinaCoord.magnification <= 0){return}; 
var circle = {'x': retinaCoord[0], 'y': retinaCoord[1], 'r': retinaCoord.magnification*sphere.r}; 
sphere.magnification = retinaCoord.magnification // an array property acquired when executing getRetinaCoord function; 
this.circle(circle); 
}
function getRandomSpheres3d(quantity){
var spheres = new Array(quantity); 
for (var n = 0; n < spheres.length; n++){
spheres[n] = {
'className': 'sphere', 
'x': 50*Math.random()-25, 
'y': 50*Math.random()-25, 
'z': 50*Math.random()-25, 
'r':10, 
'touchstart': function(){alert('this = ' + this.className); }
}; 
}
return spheres; 
}
var randomSpheres = getRandomSpheres3d(30); 

CanvasRenderingContext2D.prototype.text = function(camera, text, retinaDimensions){ 
var retinaDimensions = retinaDimensions || getWindowSize(); 
var retinaCoord = getRetinaCoord(camera, text.coord, retinaDimensions); 
if (retinaCoord.magnification <= 0){return}; 
text.magnification = retinaCoord.magnification // an array property acquired when executing getRetinaCoord function; 
text.fontSize = parseInt(text.fontSize) || 5; 
text.fontFamily = text.fontFamily || "Helvetica"; 
this.font = Math.floor(text.magnification*text.fontSize) + "px " + text.fontFamily;
this.fillText(text.string || "Hello world!", retinaCoord[0], retinaCoord[1]);
}

var t = 3
CanvasRenderingContext2D.prototype.pixel = function(pixel){ 
try{
var x = pixel.coord[0], y = pixel.coord[1]; 
this.size = pixel.size || this.size;
var num_data_points = 4*this.size*this.size; 
this.rgba = pixel.rgba || this.rgba; 
var id = this.createImageData(this.size, this.size); // only do this once per page
var d = id.data; // only do this once per page
for (var n=0; n<num_data_points; n+=4){
d[n + 0] = this.rgba[0]; 
d[n + 1] = this.rgba[1]; 
d[n + 2] = this.rgba[2]; 
d[n + 3] = this.rgba[3]; 
}
this.putImageData(id, x, y); 
}catch(e){/*!t && alert('test: ' + e); t = true; */}
}

CanvasRenderingContext2D.prototype.pixel3d = function(camera, pixel3d, retinaDimensions){ 
var retinaDimensions = retinaDimensions || getWindowSize(); 
var retinaCoord = getRetinaCoord(camera, pixel3d.coord, retinaDimensions); 
var pixel = {'coord': [retinaCoord[0], retinaCoord[1]]}////, 'width': retinaCoord.magnification*pixel3d.width}; 
pixel3d.magnification = retinaCoord.magnification // an array property acquired when executing getRetinaCoord function; 
pixel.size = parseInt(this.size*retinaCoord.magnification) || 0; 
//(t > 0) && alert('test: pixel.size = ' + pixel.size); t--; 
this.pixel(pixel); 
}


//////////////////////////////////////////////















// disc; 
function getDisc(coord, normal, radius){
var numVertices = 10; 
var discCoords = [];
var disc = {'className': 'polygon3d'}; 
normal = normal.normalise(); 
var rx = normal.cross([1, 0, 0]).normalise(); // get vector in plane containing base; 
if (!rx[0] && !rx[1] && !rx[2]){ // in case normal || [1, 0, 0]; 
rx = normal.cross([0, 1, 0]).normalise();
}
var ry = normal.cross(rx); 
var dTheta = 2*Math.PI/numVertices; 
for (var n = 0; n < numVertices; n++){
var theta = n*dTheta; 
var relPerimeterCoordRx = rx.times(radius*Math.cos(theta)); 
var relPerimeterCoordRy = ry.times(radius*Math.sin(theta)); 
var perimeterCoord = coord.add(relPerimeterCoordRx).add(relPerimeterCoordRy); 
discCoords.push(perimeterCoord); 
}
return {'className': 'polygon3d', 'coords': discCoords}; 
}
//var disc = getDisc([1, 0, 0], [0, 0, 1], 50); 
// cone; 
function getCone(coord, normal, radius){ // coord is centre of base, normal has magnitude of cone height; 
var base = getDisc(coord, normal, radius); 
//alert('base = ' + JSON.stringify(base)); 
var cone = []; 
var coneTop = coord.add(normal); 
var numVertices = base.coords.length; 
for (var sideIndex = 0; sideIndex < numVertices; sideIndex++){
var side = {'className': 'polygon3d'}; 
var coords = [base.coords[sideIndex%numVertices], base.coords[(sideIndex+1)%numVertices], coneTop]; 
side.coords = coords; 
cone.push(side); 
}
return cone; 
}
var cone = getCone([0, 0, 0], [0 ,0, 15], 10); 
//alert('cone = ' + JSON.stringify(cone)); 
// cylinder; 
function getTube(coord, normal, radius){ // coord is centre of base, normal has magnitude of cylinder height; 
var base = getDisc(coord, normal, radius); 
var tube = []; 
var numVertices = base.coords.length; 
for (var sideIndex = 0; sideIndex < numVertices; sideIndex++){
var side = {'className': 'polygon3d'}; 
var coords = [base.coords[sideIndex%numVertices], base.coords[(sideIndex+1)%numVertices], base.coords[(sideIndex+1)%numVertices].add(normal), base.coords[sideIndex%numVertices].add(normal)]; 
side.coords = coords; 
tube.push(side); 
}
return tube; 
}
var tube = getTube([0, 0, 0], [0 ,0, 15], 10); 
//}catch(e){alert(e)}
function getAxes(scale){
var axes = []; 
var xAxis = [], yAxis = [], zAxis = [], increment = scale/10; 
for (var x = 0; x <= scale; x += increment){
var xInterval = {'className': 'path3d', coords:[[x, 0, 0], [x + increment, 0, 0]], 'strokeStyle': 'red', 'lineWidth': 2, 'lineCap': 'round'}; 
var yInterval = {'className': 'path3d', coords:[[0, x, 0], [0, x + increment, 0]], 'strokeStyle': 'green', 'lineWidth': 2, 'lineCap': 'round'}; 
var zInterval = {'className': 'path3d', coords:[[0, 0, x], [0, 0, x + increment]], 'strokeStyle': 'blue', 'lineWidth': 2, 'lineCap': 'round'}; 
xAxis.push(xInterval); 
yAxis.push(yInterval); 
zAxis.push(zInterval); 
}; 
//alert('xAxis = ' + JSON.stringify(xAxis)); 
axes = axes.concat(xAxis).concat(yAxis).concat(zAxis); 
var arrowX = getCone([scale, 0, 0], [5, 0, 0], 2); 
var arrowY = getCone([0, scale, 0], [0, 5, 0], 2); 
var arrowZ = getCone([0, 0, scale], [0, 0, 5], 2); 
var xLabel = {'className': 'text', 'coord': [scale + 8, 0, 0], 'string': 'x'}
var yLabel = {'className': 'text', 'coord': [0, scale + 8, 0], 'string': 'y'}
var zLabel = {'className': 'text', 'coord': [0, 0, scale + 8], 'string': 'z'}
//axes = axes.concat(arrowX).concat(arrowY).concat(arrowZ); 
axes = axes.concat(xLabel).concat(yLabel).concat(zLabel);
var dx = scale; 
var order = Math.floor(Math.log(dx)/Math.LN10);
dx = Math.pow(10, order); 
for(var x = 0; x <= scale; x += dx){
var textX = {'className': 'text', 'string': '__' + x, 'coord': [x, 0, 0], 'fontSize': dx/3}; 
var textY = {'className': 'text', 'string': '__' + x, 'coord': [0, x, 0], 'fontSize': dx/3}; 
var textZ = {'className': 'text', 'string': '__' + x, 'coord': [0, 0, x], 'fontSize': dx/3}
axes = axes.concat(textX).concat(textY).concat(textZ); 
}
return axes; 
}


var shapeDict = {}; // shapes looked up by hex string id; 
var availableIndex = 1; // hexId = "#" + hex value of availableIndex = mask colour string on canvas. NB background has hexId = "#000000"; 
function getHexId(){
var hex = availableIndex.toString(16);
availableIndex++; 
var hexLen = hex.length; 
var hexPadding = "#000000".slice(0, -hexLen); 
var hexId = hexPadding + hex; 
//alert(hexId); 
return hexId; 
}
function getId(redInt, greenInt, blueInt){
var hexR = redInt.toString(16); 
var hexG = greenInt.toString(16); 
var hexB = blueInt.toString(16); 
hexR = "00".slice(0, -hexR.length) + hexR; 
hexG = "00".slice(0, -hexG.length) + hexG; 
hexB = "00".slice(0, -hexB.length) + hexB; 
return "#" + hexR + hexG + hexB; 
}
CanvasRenderingContext2D.prototype.scene = function(camera, sceneObjects){
// apply custom global default context properties; 
initialise(this, CanvasRenderingContext2D.settings['*']); 
sceneObjects.sort(function(a, b){ // sort from farthest to nearest camera; 
return a.magnification - b.magnification; 
}); 
for (var n = 0; n < sceneObjects.length; n++){
var shape = sceneObjects[n]; 
//if (!shape){alert('scene')}
var className = shape.className || alert('CanvasRenderingContext2D.scene(): missing className string property from shape!\n\tshape = ' + JSON.stringify(shape)); 
this.save(); 
var shapeClassSettings = CanvasRenderingContext2D.settings[className]; 
initialise(this, shapeClassSettings, shape); 
this.renderFunction = shapeClassSettings && shapeClassSettings.renderFunction; 
this.renderFunction && this.renderFunction(shape); 
this[className] && this[className](camera, shape); 
if(shape.touchstart || shape.touchmove || shape.touchend){ // create mask on mask canvas;,
shape.hexId = shape.hexId || getHexId(); 
maskCtx.fillStyle = shape.hexId; 
maskCtx.strokeStyle = shape.hexId; 
maskCtx[className] && maskCtx[className](camera, shape); 
shapeDict[shape.hexId] = shape; 
}
this.restore(); 
}
}; 









// 3D stuff 

var test = true;
function getRetinaXY(parameterObject){ // maps 3d [x, y, z] coord to retina [x, y] coord given camera object; 
var camera = parameterObject && (parameterObject.camera || alert('getRetinaXY(): no camera specified!')); 
var coord = parameterObject && (parameterObject.coord || alert('getRetinaXY(): no coord specified!') ); 
var direction = camera.direction; 
var d = direction.mod(); 
var relVec = coord.subtract(camera.pupilCoord); 
var zHatDash = camera.direction.normalise(); 
var zHat = [0, 0, 1]; 
var xHatDash = direction.cross(zHat).normalise(); 
if (!xHatDash[0] || !xHatDash[1]){ // if direction || zHat then null components for xHatDash produced.
xHatDash = [1, 0, 0]
}
var yHatDash = xHatDash.cross(zHatDash); 
var magnification = d/zHatDash.dot(relVec); 
//// return empty coords for coords behind camera; 
if (magnification <=0){return []}
/////////////////
var xDash = magnification*xHatDash.dot(relVec); 
var yDash = magnification*yHatDash.dot(relVec); 
var retinaXY = [xDash, yDash]; 
coord.magnification = magnification; 
retinaXY.magnification = magnification; // extra info for spheres; 
return retinaXY;
}
function getRetinaCoord(cam, coord3d, retinaDimensions){ // maps 3d coord to retinaXY coord to screen where retinaXY = (0, 0) is middle of screen; 
retinaDimensions = retinaDimensions || getWindowSize(); 
var offSetX = retinaDimensions.width/2; 
var offSetY = retinaDimensions.height/2; 
var coord2d = getRetinaXY({
'camera': cam, 
'coord': coord3d
}); 
coord2d[0] = coord2d[0] + offSetX; 
coord2d[1] = offSetY - coord2d[1]; 
return coord2d; 
}
function getRetinaCoords(cam, coords3d, retinaDimensions){ // retinaDimensions = {'height': <height>, 'width': <width>}
retinaDimensions = retinaDimensions || getWindowSize(); 
var offSetX = retinaDimensions.width/2; 
var offSetY = retinaDimensions.height/2; 
var coords2d = []; 
for (var n = 0; n < coords3d.length; n ++){
var coord3d = coords3d[n]; 
coords2d.push(getRetinaCoord(cam, coord3d, retinaDimensions)); 
}; 
return coords2d; 
}









// user interface -->

var stat = document.getElementById("status"); 
var TWOPI = 2*Math.PI; 
function drawScene(){
paper.fit(); 
mask.fit(); 
ctx.scene(camera, scene); 
camera.d = camera.direction.mod(); 
stat.innerHTML = 'camera = ' + JSON.stringify(camera); 
}

function touchStart(ev){
var left = this.style.left || 0, top = this.style.top || 0; 
var dragStatus = this.dragStatus; 
dragStatus.touchStart = true; 
ev = ev || event;
ev.preventDefault(); // stops touch screen sliding about!
dragStatus.x = ev.clientX /* non-touchscreen */ || (ev.touches && ev.touches[0] && ev.touches[0].pageX) /* touchstart or touchmove event */ || (ev.changedTouches && ev.changedTouches[0].clientX) /* touchend event */;
dragStatus.y = ev.clientY /* non-touchscreen */ || (ev.touches && ev.touches[0] && ev.touches[0].pageY) /* touchstart or touchmove event */|| (ev.changedTouches && ev.changedTouches[0].clientY) /* touchend event */;
dragStatus.relX = dragStatus.x - parseInt(left);
dragStatus.relY = dragStatus.y - parseInt(top);
dragStatus.coord = [dragStatus.relX, dragStatus.relY];
// handle slide start given updated dragStatus properties 
this.slideStart && (this.slideStart() || true) || alert("node.touchStart(): no node.slideStart() specified for node = " + this); 
}
function touchMove(ev){ 
var left = this.style.left || 0, top = this.style.top || 0; 
var dragStatus = this.dragStatus; 
if (!dragStatus.touchStart){return}; 
ev = ev || event; 
ev.preventDefault(); // stops touch screen sliding about! 
dragStatus.x = ev.clientX /* non-touchscreen */ || (ev.touches && ev.touches[0] && ev.touches[0].pageX) /* touchstart or touchmove event */ || (ev.changedTouches && ev.changedTouches[0].clientX) /* touchend event */; 
dragStatus.y = ev.clientY /* non-touchscreen */ || (ev.touches && ev.touches[0] && ev.touches[0].pageY) /* touchstart or touchmove event */|| (ev.changedTouches && ev.changedTouches[0].clientY) /* touchend event */; 
dragStatus.relX = dragStatus.x - parseInt(left); 
dragStatus.relY = dragStatus.y - parseInt(top); 
dragStatus.changeCoord = [dragStatus.relX - dragStatus.coord[0], dragStatus.coord[1] - dragStatus.relY]; 
dragStatus.cumCoord = [dragStatus.cumCoord[0] + dragStatus.changeCoord[0], dragStatus.cumCoord[1] + dragStatus.changeCoord[1]]; 
dragStatus.coord = [dragStatus.relX, dragStatus.relY]; 
// handle slide move given updated dragStatus properties 
this.slideMove && (this.slideMove() || true) || alert("node.touchMove(): no node.slideMove() specified for node = " + this); 
}
function touchEnd(ev){ 
var left = this.style.left || 0, top = this.style.top || 0; 
var dragStatus = this.dragStatus; 
dragStatus.touchStart = false; 
ev = ev || event; 
ev.preventDefault(); // stops touch screen sliding about! 
dragStatus.x = ev.clientX /* non-touchscreen */ || (ev.touches && ev.touches[0] && ev.touches[0].pageX) /* touchstart or touchmove event */ || (ev.changedTouches && ev.changedTouches[0].clientX) /* touchend event */; 
dragStatus.y = ev.clientY /* non-touchscreen */ || (ev.touches && ev.touches[0] && ev.touches[0].pageY) /* touchstart or touchmove event */|| (ev.changedTouches && ev.changedTouches[0].clientY) /* touchend event */; 
dragStatus.relX = dragStatus.x - parseInt(left); 
dragStatus.relY = dragStatus.y - parseInt(top); 
// handle slide end given updated dragStatus properties 
this.slideEnd && (this.slideEnd() || true) || alert("node.touchEnd(): no node.slideEnd() specified for node = " + this); 
}

function makeSlider(node){ // attach touch events to node to make a slider node; 
node.addEventListener('touchstart', touchStart);
node.addEventListener('mousedown', touchStart);
node.addEventListener('touchmove', touchMove); 
node.addEventListener('mousemove', touchMove); 
node.addEventListener('touchend', touchEnd);
node.addEventListener('mouseup', touchEnd);
}


paper.dragStatus = {
'cumCoord': [0, 0], 
'sensitivity': 0.8
}; 
paper.slideStart = function(){ // get shape from dragStatus and execute its attached touchstart function; 
var dragStatus = this.dragStatus; 
var pixels = maskCtx.getImageData(dragStatus.relX, dragStatus.relY, 1, 1).data; 
var hexId = getId(pixels[0], pixels[1], pixels[2]); 
var shape = shapeDict[hexId]; 
shape && shape.touchstart && shape.touchstart(); 
dragStatus.hexId = hexId; 
dragStatus.shape = shape; 
//stat.innerHTML = JSON.stringify(dragStatus); 
}
paper.slideMove = function(){ // get shape from dragStatus and execute its attached touchmove function; 
var sensitivity = this.dragStatus.sensitivity; 
var dPhi = this.dragStatus.changeCoord[0]*sensitivity; 
var dTheta = this.dragStatus.changeCoord[1]*sensitivity; 
var sphericalAxes = camera.pupilCoord.getSphericalAxes(); 

camera.pupilCoord = camera.pupilCoord.rotateAboutOrigin(dTheta, sphericalAxes.phiHat);
camera.pupilCoord = camera.pupilCoord.rotateAboutOrigin(dPhi, [0, 0, 1]); 
camera.direction = camera.direction.rotateAboutOrigin(dTheta, sphericalAxes.phiHat); 
camera.direction = camera.direction.rotateAboutOrigin(dPhi, [0, 0, 1]); 
////////
var pixels = maskCtx.getImageData(this.dragStatus.relX, this.dragStatus.relY, 1, 1).data; 
var hexId = getId(pixels[0], pixels[1], pixels[2]); 
var shape = shapeDict[hexId]; 
shape && shape.touchmove && shape.touchmove(); 
//stat.innerHTML = JSON.stringify(camera); 
}
paper.slideEnd = function(){ // get shape from dragStatus and execute its attached touchstart function; 
var dragStatus = this.dragStatus; 
var pixels = maskCtx.getImageData(dragStatus.relX, dragStatus.relY, 1, 1).data; 
var hexId = getId(pixels[0], pixels[1], pixels[2]); 
var shape = shapeDict[hexId]; 
shape && shape.touchend && shape.touchend(); 
}
makeSlider(paper); // enable paper interactivity; 
// console interactivity; 
var data = document.getElementById("data"); 
var data_obj, quads; 

var submit_data = document.getElementById("submit_data"); 
function submitData(){
data_obj = JSON.parse(data.value); 
quads = linesToQuads(data_obj); 
alert("quads = " + quads); 
}; 

submit_data.onclick = submitData; 
function linesToQuads (lines){ // turns lines = [line1=[point11, point12...], line2=[point21, point22, ...], ...] to quadrilaterals = [quad1=[vertex11, vertex12, vertex13, vertex14], quad2, ...]; 
var quadrilaterals = []; 
for (var lineIndex = 0; lineIndex < lines.length - 1; lineIndex ++){
var line1 = lines[lineIndex], line2 = lines[lineIndex+1]; 
for (var quadIndex = 0; quadIndex < line1.length - 1; quadIndex++){ 
var vertex1 = line1[quadIndex], vertex2 = line1[quadIndex+1], vertex3 = line2[quadIndex+1], vertex4 = line2[quadIndex]; 
var quad = {
'className': 'polygon3d', 
'coords': [vertex1, vertex2, vertex3, vertex4]
}; 
quadrilaterals = quadrilaterals.concat(quad); 
}
}
scene = scene.concat(quadrilaterals); 
return quadrilaterals; 
}

// zoom slider; 
var zoom = document.getElementById("zoom"); 
zoom.dragStatus = {
'cumCoord': [0, 0], 
'sensitivity': 1
};
zoom.slideStart = function(){ // get shape from dragStatus and execute its attached touchstart function; 
var dragStatus = this.dragStatus; 
}
zoom.slideMove = function(){ // get shape from dragStatus and execute its attached touchstart function; 
var dragStatus = this.dragStatus; 
var dZDash = camera.direction.normalise().times(dragStatus.sensitivity*dragStatus.changeCoord[1]); 
var xHatDash = camera.direction.getXHatDash(); 
var dXDash = xHatDash.times(-dragStatus.sensitivity*dragStatus.changeCoord[0]); 
var newCamCoord = camera.pupilCoord.add(dZDash).add(dXDash); 
camera.pupilCoord = newCamCoord; 
this.setAttribute('info', 'r=' + camera.pupilCoord.mod() + 'd=' + camera.direction.normalise());
//stat.innerHTML = JSON.stringify(dragStatus); 
}
zoom.slideEnd = function(){ // get shape from dragStatus and execute its attached touchstart function; 
var dragStatus = this.dragStatus; 
}
makeSlider(zoom); // enable zoom node interactivity; 


// angle slider; 
var angle = document.getElementById("angle"); 
angle.dragStatus = {
'cumCoord': [0, 0], 
'sensitivity': 0.1
};
angle.slideStart = function(){ // get shape from dragStatus and execute its attached touchstart function; 
var dragStatus = this.dragStatus; 
}
angle.slideMove = function(){ // get shape from dragStatus and execute its attached touchstart function; 
var sphericalAxes = camera.direction.getSphericalAxes(); 
var zHatDash = sphericalAxes.rHat; 
var xHatDash = sphericalAxes.phiHat; 
var yHatDash = sphericalAxes.thetaHat; 
var dHeading = -this.dragStatus.sensitivity*this.dragStatus.changeCoord[0]; 
var dElevation = this.dragStatus.sensitivity*this.dragStatus.changeCoord[1]; 

var sphericalAxes = camera.direction.getSphericalAxes(); 

camera.direction = camera.direction.rotateAboutOrigin(dHeading, sphericalAxes.thetaHat); 
camera.direction = camera.direction.rotateAboutOrigin(dElevation, sphericalAxes.phiHat); 

var direction = camera.direction; 
var elevation = 180*Math.atan(direction[2]/direction.dot([1, 1, 0]))/Math.PI || ''; 
var heading = 180*Math.atan(direction[1]/direction[0])/Math.PI || ''; 
this.setAttribute('info', 'heading=' + heading + '; elevation=' + elevation); 
}
angle.slideEnd = function(){ // get shape from dragStatus and execute its attached touchstart function; 
var dragStatus = this.dragStatus; 
}
makeSlider(angle); // enable angle control node interactivity; 



// continuously render geometries 
window.requestAnimationFrame = window.requestAnimationFrame || window.mozRequestAnimationFrame || window.webkitRequestAnimationFrame || window.msRequestAnimationFrame; 
function animate(timestamp){ // timestamp passed but not used as variable 
drawScene(); 
requestAnimationFrame(animate);
}
requestAnimationFrame(animate); // sets animate as function to execute every time rendering is complete 