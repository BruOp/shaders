var scene, orthoCamera, camera, renderer, renderTargetTexture, height_field, mouse, rayCaster, intersect;

var WIDTH = 500, HEIGHT = 500;
window.onload = function() {
  var shaderLoader = new ShaderLoader();
  shaderLoader.loadShaders({
    passthrough_vertex: "/passthrough/vertex",
    passthrough_fragment: "/passthrough/fragment",
    sim_vertex: "/simulation/vertex",
    sim_fragment : "/simulation/fragment",
  }, "./shaders", start );

  function start() {
    
    raycaster = new THREE.Raycaster();
    intersect = new THREE.Vector2();
    mouse = new THREE.Vector2();
    
    renderer = new THREE.WebGLRenderer();
    renderer.setSize(WIDTH, HEIGHT);
    document.body.appendChild(renderer.domElement);
    
    var gl = renderer.getContext();

    //1 we need FLOAT Textures to store positions
    if (!gl.getExtension("OES_texture_float")){
        throw new Error( "float textures not supported" );
    }
    
    scene = new THREE.Scene();
    camera = new THREE.PerspectiveCamera(60, WIDTH/HEIGHT, 1,10000 );
    
    rttScene  = new THREE.Scene();
    orthoCamera = new THREE.OrthographicCamera(-1,1,1,-1,1/Math.pow( 2, 53 ),1 );
    
    var [rtPositionOld, rtPositionCur, rtPositionNew] = getRenderTargets();
    
    var simulationShader = new THREE.ShaderMaterial({
      uniforms: {
        position_old: { type: 't', value: rtPositionOld },
        position_cur: { type: 't', value: rtPositionCur },
        position_new: { type: 't', value: rtPositionNew },
        mouse: { type: "v2", value: intersect }
      },
      vertexShader: ShaderLoader.get("sim_vertex"),
      fragmentShader:  ShaderLoader.get("sim_fragment")
    });

    renderer.domElement.addEventListener('mousemove', onMouseMove)
    //5 the simulation:
    //create a bi-unit quadrilateral and uses the simulation material to update the Float Texture
    var geom = getSimulationGeom
    scene.add(new THREE.Mesh(geom, simulationShader));

    update();
  }
  
  function getRenderTargets() {
    var options = {
      minFilter: THREE.NearestFilter,//important as we want to sample square pixels
      magFilter: THREE.NearestFilter,//
      format: THREE.RGBFormat,//could be RGBAFormat
      type:THREE.FloatType//important as we need precise coordinates (not ints)
    };
    
    var dtPosition = generatePositionTexture(WIDTH, HEIGHT);
    return [1,2,3].map(function() {
      
    })
  }
  
  function passThroughRenderPass() {
    
  }
  
  //returns an array of random 3D coordinates
  function generatePositionTexture(width, height) {
		var arr = new Float32Array(width * height * 3);
    var texture = new THREE.DataTexture(arr, WIDTH, HEIGHT, THREE.RGBFormat, THREE.FloatType);
    texture.needsUpdate = true;		return texture;

	}
  
  function getSimulationGeometry() {
    //Might switch to just a PlaneBufferGeometry(width, height, widthSegments, heightSegments)
    var geom = new THREE.BufferGeometry();
    var vertices = new Float32Array([
      -1,-1,0, 1,-1,0,  1,1,0,
      -1,-1,0, 1, 1,0, -1,1,0
    ]);
    var uv = new Float32Array([
      0,1, 1,1, 1,0,
      0,1, 1,0, 0,0
    ])
    geom.addAttribute('position', new THREE.BufferAttribute(vertices, 3));
    geom.addAttribute('uv', new THREE.BufferAttribute(uv, 2));
    return geom;
  }
  
  function onMouseMove() {
    mouse.x = (event.offsetX / WIDTH) * 2 - 1;
    mouse.y = - (event.offsetY / HEIGHT) * 2 + 1;
    
    raycaster.setFromCamera(mouse, orthoCamera);
    
    var intersects = raycaster.intersectObjects(scene.children);
    if (intersects.length > 0) {
      intersect.copy(intersects[0].uv);
    }
  }
  
  //update loop
  function update()
  {
      requestAnimationFrame(update);
      
      //render the particles at the new location
      renderer.render( scene, orthoCamera );
  }
};