var container, 
  controls,
  renderer, 
  scene, 
  camera, 
  mesh, 
  start = Date.now(),
  fov = 30;

window.addEventListener( 'load', function() {

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
  camera.position.z = 100;
  camera.target = new THREE.Vector3( 0, 0, 0 );

  scene.add( camera );
  controls = new THREE.OrbitControls( camera, container );

  // create a wireframe material    
  material = new THREE.ShaderMaterial( {
    uniforms: {
      time: { // float initialized to 0
        type: "f", 
        value: 0.0 
      }
    },
    vertexShader: document.getElementById( 'vertexShader' ).textContent,
    fragmentShader: document.getElementById( 'fragmentShader' ).textContent,
    side: THREE.DoubleSide
  } );
  // material = new THREE.MeshBasicMaterial( {color: 0xffff00, side: THREE.DoubleSide} );

  // create a sphere and assign the material
  mesh = new THREE.Mesh( 
    // new THREE.SphereGeometry( 32, 80, 80 ), 
    new THREE.PlaneGeometry( 32, 32, 64, 64 ), 
    // new THREE.TorusGeometry( 32, 32, 64, 64 ), 
    // new THREE.TorusKnotGeometry( 15, 3, 100, 10), 
    material 
  );
  scene.add( mesh );
  
  mesh.rotation.x = -1.0;
  // mesh.rotation.y = -0.3;

  // create the renderer and attach it to the DOM
  renderer = new THREE.WebGLRenderer();
  renderer.setSize( window.innerWidth, window.innerHeight );
  
  container.appendChild( renderer.domElement );

  animate();

} );

function animate() {

  requestAnimationFrame( animate );

  // let there be light
  material.uniforms[ 'time' ].value = .00025 * ( Date.now() - start )
  mesh.rotation.z += 0.005;
  renderer.render( scene, camera );
  
}
