var container, 
  controls,
  renderer, 
  raycaster,
  scene, 
  camera, 
  mouse,
  plane,
  intersectionPoint,
  mesh_array = [], 
  origin_line_array = [],
  mouse_origin_line_array = [],
  mouse_line_array = [],
  start = Date.now(),
  fov = 30;

var cardWidth = 12,
  cardHeight = 16;
  rowCount = 10;

var WIDTH = window.innerWidth,
  HEIGHT = window.innerHeight;


var dt = 0.032;
var power = 1;
var restoringCoeff = 20.0;
var repulsionCoeff = 50.0;
var dragCoeff = 1.50;

window.addEventListener('load', function() {



  // grab the container from the DOM
  container = document.getElementById( "container" );
  
  // create a scene
  scene = new THREE.Scene();

  // create a camera the size of the browser window
  // and place it 100 units away, looking towards the center of the scene
  camera = new THREE.PerspectiveCamera( 
    fov, 
    window.innerWidth / window.innerHeight, 
    1, 
    10000 );
  camera.target = new THREE.Vector3( 0, 0, 0 );
  camera.position.z = 200;

  scene.add( camera );

  light = new THREE.PointLight( 0xffffff, 1.25 );
  light.position.set( - 500, 900, 600 );
  light.castShadow = true;
  scene.add( light );
  

  scene.add( new THREE.AmbientLight( 0x606060 ) );
  
  var lineMaterial = new THREE.LineBasicMaterial({
    color: 0x0000ff,
    linewidth: 4
  });

  // create a wireframe material    
  green_mat = new THREE.MeshLambertMaterial( {
    color: 0x33cccc,
    opacity: 0.7,
    blending: THREE.MultiplyBlending,
    transparent: true,
    specular: 0x009900, 
    shininess: 30, 
    side: THREE.DoubleSide,
    shading: THREE.SmoothShading 
  } ); 

  yellow_mat = new THREE.MeshLambertMaterial( {
    color: 0xffcc00,
    opacity: 0.7,
    blending: THREE.MultiplyBlending,
    transparent: true,
    specular: 0x009900, 
    shininess: 30, 
    side: THREE.DoubleSide,
    shading: THREE.SmoothShading 
  } ); 
  // material = new THREE.MeshBasicMaterial( {color: 0xffff00, side: THREE.DoubleSide} );

  // create a sphere and assign the material
  for (var i = 0; i < rowCount; i++) {
    mesh_array[i] = new THREE.Mesh(new THREE.PlaneGeometry( 12, 16), yellow_mat);
    var pos = cardOrigin(i)
    mesh_array[i].origin = new THREE.Vector3(pos[0], pos[1], pos[2])
    mesh_array[i].position = mesh_array[i].origin;
    mesh_array[i].velocity = new THREE.Vector3(0.0, 0.0, 0.0);
    
    var lineGeometry = new THREE.Geometry();
    lineGeometry.vertices.push(mesh_array[i].position);    
    lineGeometry.vertices.push(new THREE.Vector3(0, 0, 0));
    origin_line_array[i] = new THREE.Line(lineGeometry, lineMaterial);
    origin_line_array[i].geometry.verticesNeedUpdate = true;
    
    var mouseLineGeometry = new THREE.Geometry();
    mouseLineGeometry.vertices.push(mesh_array[i].position);    
    mouseLineGeometry.vertices.push(new THREE.Vector3(0, 0, 0));
    mouse_line_array[i] = new THREE.Line(mouseLineGeometry, lineMaterial);
    mouse_line_array[i].geometry.verticesNeedUpdate = true;
    
    var mouseOriginGeometry = new THREE.Geometry();
    mouseOriginGeometry.vertices.push(mesh_array[i].position);    
    mouseOriginGeometry.vertices.push(new THREE.Vector3(0, 0, 0));
    mouse_origin_line_array[i] = new THREE.Line(mouseOriginGeometry, lineMaterial);
    mouse_origin_line_array[i].geometry.verticesNeedUpdate = true;
    scene.add( mesh_array[i] );
    scene.add( origin_line_array[i] );
    scene.add( mouse_line_array[i] );
    scene.add( mouse_origin_line_array[i] );
  }

  for (i = rowCount; i < rowCount * 2; i++) {
    mesh_array[i] = new THREE.Mesh(new THREE.PlaneGeometry( 12, 16), green_mat);
    var pos = cardOrigin(i)
    mesh_array[i].origin = new THREE.Vector3(pos[0], pos[1], pos[2])
    mesh_array[i].position = mesh_array[i].origin;
    mesh_array[i].velocity = new THREE.Vector3(0.0, 0.0, 0.0);

    var lineGeometry = new THREE.Geometry();
    lineGeometry.vertices.push(mesh_array[i].position);    
    lineGeometry.vertices.push(new THREE.Vector3(0, 0, 0));
    origin_line_array[i] = new THREE.Line(lineGeometry, lineMaterial);
    origin_line_array[i].geometry.verticesNeedUpdate = true;
    
    var mouseLineGeometry = new THREE.Geometry();
    mouseLineGeometry.vertices.push(mesh_array[i].position);    
    mouseLineGeometry.vertices.push(new THREE.Vector3(0, 0, 0));
    mouse_line_array[i] = new THREE.Line(mouseLineGeometry, lineMaterial);
    mouse_line_array[i].geometry.verticesNeedUpdate = true;
    
    var mouseOriginGeometry = new THREE.Geometry();
    mouseOriginGeometry.vertices.push(mesh_array[i].position);    
    mouseOriginGeometry.vertices.push(new THREE.Vector3(0, 0, 0));
    mouse_origin_line_array[i] = new THREE.Line(mouseOriginGeometry, lineMaterial);
    mouse_origin_line_array[i].geometry.verticesNeedUpdate = true;
    scene.add( mesh_array[i] );
    scene.add( origin_line_array[i] );
    scene.add( mouse_line_array[i] );
    scene.add( mouse_origin_line_array[i] );
  }

  var planeGeometry = new THREE.PlaneBufferGeometry( 1000, 1000 );

  plane = new THREE.Mesh( planeGeometry, new THREE.MeshBasicMaterial( { visible: false } ) );
  scene.add( plane );

  raycaster = new THREE.Raycaster();
  
  // create the renderer and attach it to the DOM
  renderer = new THREE.WebGLRenderer();
  renderer.setClearColor( 0xffffff, 1 );
  renderer.setSize( WIDTH, HEIGHT );
  
  container.appendChild( renderer.domElement );

  mouse = new THREE.Vector2( -100.124, 0 );

  raycaster.setFromCamera( mouse, camera );
  intersectionPoint = new THREE.Vector3( -100, 100, 0 );

  document.addEventListener( 'mousemove', updateMouse, false );

  animate();

} );


function cardOrigin(index) {
  var x = (( -0.5 * rowCount ) * cardWidth) + cardWidth + (cardWidth - 1) * (index % rowCount);
  var y = ((index < rowCount ? 1 : -1) * 0.5 * cardHeight) - (index < rowCount ? 1 : -1);
  var z = -0.1 * index / rowCount;
  return [x, y, z];
}

function updateMouse( event ) {
  mouse.x = ( event.clientX / WIDTH ) * 2 - 1;
  mouse.y = - ( event.clientY / HEIGHT ) * 2 + 1;

  if (mouse.length() != 0) {
    raycaster.setFromCamera( mouse, camera );

    var intersect = raycaster.intersectObject(plane);

    if ( intersect.length > 0 ) {
      intersectionPoint = intersect[0].point
    }
  }

}

function updatePosition(card, line, mouseLine, mouseOriginLine) {
  var displacementFromOrigin = new THREE.Vector3().subVectors(card.position, card.origin);
  var cardFromMouse = new THREE.Vector3().subVectors(intersectionPoint, card.position);
  var distanceToMouse = cardFromMouse.length();

  line.geometry.vertices[0] = card.origin;
  line.geometry.vertices[1] = card.position;
  line.geometry.verticesNeedUpdate = true;

  mouseOriginLine.geometry.vertices[0] = card.origin;
  mouseOriginLine.geometry.vertices[1] = intersectionPoint;
  mouseOriginLine.geometry.verticesNeedUpdate = true;

  mouseLine.geometry.vertices[0] = intersectionPoint;
  mouseLine.geometry.vertices[1] = card.position;
  mouseLine.geometry.verticesNeedUpdate = true;

  var unitVectorToMouse = new THREE.Vector3(cardFromMouse.x / distanceToMouse, cardFromMouse.y / distanceToMouse, cardFromMouse.z / distanceToMouse); 

  if (!(n % 30)) {
    console.log(distanceToMouse);
  }

  var newXValues = rk4(displacementFromOrigin.x, cardFromMouse.x / Math.pow(distanceToMouse, power), card.velocity.x, calculateForces, dt);
  var newYValues = rk4(displacementFromOrigin.y, cardFromMouse.y / Math.pow(distanceToMouse, power), card.velocity.y, calculateForces, dt);
  // var newZValues = rk4(displacementFromOrigin.z, cardFromMouse.z / distanceToMouse, card.velocity.z, calculateForces, dt);

  card.position.x = card.origin.x + newXValues[0];
  card.position.y = card.origin.y + newYValues[0];
  // card.position.z -= displacementFromOrigin.z - newZValues[0];

  card.velocity.x = newXValues[1];
  card.velocity.y = newYValues[1];
  // card.velocity.z = newZValues[1];

}

function calculateForces(x0, xM, v, dt) {
  //x0 is the distance from origin
  //xM is the distance from mouse
  //All scalars

  // + repulsionCoeff / (Math.pow(xM, 2) || 0.001)
  return  - restoringCoeff * x0 - repulsionCoeff * xM - dragCoeff * v
}

function rk4(x0, xM, v, a, dt) {
  // Returns final (position, velocity) array after time dt has passed.
  //        x: initial position
  //        v: initial velocity
  //        a: acceleration function a(x,v,dt) (must be callable)
  //        dt: timestep
  var x1 = x0;
  var xM1 = xM;
  var v1 = v;
  var a1 = a(x1, xM1, v1, 0);

  var x2 = x0 + 0.5*v1*dt;
  var xM2 = xM + 0.5*v1*dt;
  var v2 = v + 0.5*a1*dt;
  var a2 = a(x2, xM2, v2, dt/2);

  var x3 = x0 + 0.5*v2*dt;
  var xM3 = xM + 0.5*v2*dt;
  var v3 = v + 0.5*a2*dt;
  var a3 = a(x3, xM3, v3, dt/2);

  var x4 = x0 + v3*dt;
  var xM4 = xM + v3*dt;
  var v4 = v + a3*dt;
  var a4 = a(x4, xM4, v4, dt);

  var xf = x0 + (dt/6)*(v1 + 2*v2 + 2*v3 + v4);
  var vf = v + (dt/6)*(a1 + 2*a2 + 2*a3 + a4);

  return [xf, vf];
}

var n = 0;
function animate() {

  requestAnimationFrame( animate );
  n++;
  mesh_array.forEach(function(card, i) {
    updatePosition(card, origin_line_array[i], mouse_line_array[i], mouse_origin_line_array[i])
    
  })


  renderer.render( scene, camera );
  
}

