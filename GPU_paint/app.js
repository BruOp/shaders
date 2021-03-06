var scene, orthoCamera, camera, renderer, renderTargetTexture,
    passThruShader, simMesh, mouse, rayCaster, intersect;

var rtPositionOld, rtPositionCur, rtPositionNew;

var WIDTH = 512, HEIGHT = 512;
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
    
    
    
    passThruShader = new THREE.ShaderMaterial({
      uniforms: {
    		texture: { type: "t", value: null }
      },
      vertexShader: ShaderLoader.get("passthrough_vertex"),
      fragmentShader: ShaderLoader.get("passthrough_fragment"),
    })

    renderer.domElement.addEventListener('mousemove', onMouseMove);
    
    //5 the simulation:
    //create a bi-unit quadrilateral and uses the simulation material to update the Float Texture
    var geom = getSimulationGeometry();
    passThroughMesh = new THREE.Mesh(geom, passThruShader);
    scene.add(passThroughMesh);

    [rtPositionOld, rtPositionCur, rtPositionNew] = getRenderTargets();
    
    var simulationShader = new THREE.ShaderMaterial({
      uniforms: {
        position_old: { type: 't', value: rtPositionOld },
        position_cur: { type: 't', value: rtPositionCur },
        mouse: { type: "v2", value: intersect }
      },
      vertexShader: ShaderLoader.get("sim_vertex"),
      fragmentShader:  ShaderLoader.get("sim_fragment")
    });
    
    geom = getSimulationGeometry();
    simMesh = new THREE.Mesh(geom, simulationShader);
    rttScene.add(simMesh);

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
      rtt = getRenderTarget()
      passThroughRender(dtPosition, rtt);
      return rtt;
    })
  }
  
  function passThroughRender(input, output) {
    passThroughMesh.material = passThruShader;
		passThroughMesh.material.uniforms.texture.value = input;
    if (!output) {
      renderer.render(scene, orthoCamera);
    } else {
      renderer.render(scene, orthoCamera, output);
    }
  }
  
  //returns an array of random 3D coordinates
  function generatePositionTexture(width, height) {
		var arr = new Float32Array(width * height * 3);
    // for (var i = 0; i < arr.length - 1; i += 3) {
    //   arr[i] = Math.random();
    //   arr[i+1] = Math.random();
    //   arr[i+2] = Math.random();
    // }
    var texture = new THREE.DataTexture(arr, WIDTH, HEIGHT, THREE.RGBFormat, THREE.FloatType);
    
    texture.needsUpdate = true;
    return texture;
	}
  
  function getRenderTarget() {
		var renderTarget = new THREE.WebGLRenderTarget(WIDTH, HEIGHT, {
			wrapS: THREE.RepeatWrapping,
			wrapT: THREE.RepeatWrapping,
			minFilter: THREE.NearestFilter,
			magFilter: THREE.NearestFilter,
			format: THREE.RGBFormat,
			type: THREE.FloatType,
			stencilBuffer: false
		});
		return renderTarget;
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
      renderer.render( rttScene, orthoCamera, rtPositionNew);
      passThroughRender( rtPositionNew, rtPositionCur );
      passThroughRender( rtPositionCur );
  }
};