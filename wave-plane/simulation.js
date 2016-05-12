function SimulationRenderer(width, height) {
  var shaderLoader = new ShaderLoader();
  shaderLoader.loadShaders({
    passthrough_vertex: "/passthrough/vertex",
    passthrough_fragment: "/passthrough/fragment",
    sim_vertex: "/simulation/vertex",
    sim_fragment : "/simulation/fragment",
  }, "./shaders", start.bind(this) );
  
  var renderer = new THREE.WebGLRenderer();
  //Scene stuff
  var passThroughScene, rttScene, orthoCamera,
  // Meshes
  var passThroughMesh, simMesh;
  // Shaders
  var passThruShader;
  // Render Targets
  var rtPositionCur, rtPositionNew;
  // Shader (Default) Values
  var mouseMagnitude = 0.0, mouseRadius = 0.02, waveSpeed = 0.0012;
  
  this.width = width;
  this.height = height;
  
  this.start() {
    renderer.setSize(this.width, this.height);

    var gl = renderer.getContext();
    //1 we need FLOAT Textures to store positions
    if (!gl.getExtension("OES_texture_float")){
      throw new Error( "float textures not supported" );
    }
    
    passThroughScene = new THREE.scene();
    rttScene  = new THREE.Scene();
    orthoCamera = new THREE.OrthographicCamera(-1,1,1,-1,1/Math.pow( 2, 53 ),1);

    passThruShader = new THREE.ShaderMaterial({
      uniforms: {
    		texture: { type: "t", value: null }
      },
      vertexShader: ShaderLoader.get("passthrough_vertex"),
      fragmentShader: ShaderLoader.get("passthrough_fragment"),
    });    
    //5 the simulation:
    //create a bi-unit quadrilateral and uses the simulation material to update the Float Texture
    var geom = getSimulationGeometry();
    passThroughMesh = new THREE.Mesh(geom, passThruShader);
    scene.add(passThroughMesh);

    [rtPositionCur, rtPositionNew] = getRenderTargets();
    var simulationShader = new THREE.ShaderMaterial({
      uniforms: {
        position_texture: { type: 't', value: rtPositionCur },
        mouse: { type: "v2", value: intersect },
        offset: { type: 'f', value: 1/this.width },
        wave_speed: { type: 'f', value: waveSpeed },
        damping_strength: { type: 'f', value: 0.005 },
        mouse_magnitude: { type: "f", value: mouseMagnitude },
        draw_radius: { type: "f", value: mouseRadius }
      },
      vertexShader: ShaderLoader.get("sim_vertex"),
      fragmentShader:  ShaderLoader.get("sim_fragment")
    });
    
    geom = getSimulationGeometry();
    simMesh = new THREE.Mesh(geom, simulationShader);
    rttScene.add(simMesh);

    this.render();
  }
  
  this.getRenderTargets = function() {
    var dtPosition = generatePositionTexture(this.width, this.height);
    return [1,2].map(function() {
      rtt = getRenderTarget()
      passThroughRender(dtPosition, rtt);
      return rtt;
    })
  }
  
  this.passThroughRender = function(input, output) {
    passThroughMesh.material = passThruShader;
		passThroughMesh.material.uniforms.texture.value = input;
    if (!output) {
      renderer.render(scene, orthoCamera);
    } else {
      renderer.render(scene, orthoCamera, output);
    }
  }
  
  //returns an array of random 3D coordinates
  this.generatePositionTexture = function(width, height) {
		var arr = new Float32Array(width * height * 3);
    for (var i = 0; i < arr.length - 1; i += 3) {
      arr[i] = 0.5;
      arr[i+1] = 0.5;
      arr[i+2] = 0.5;
    }
    // center = Math.floor(0.5 * this.height * this.width * 3) + Math.floor(0.5 * this.width * 3);
    // arr[center] = 0.4;
    
    var texture = new THREE.DataTexture(arr, width, height, THREE.RGBFormat, THREE.FloatType, THREE.UVMapping);
    
    texture.needsUpdate = true;
    return texture;
	}
    
  this.physicsTick = function() {
    renderer.render( rttScene, orthoCamera, rtPositionNew);
    simMesh.material.uniforms.position_texture.value = rtPositionNew;
    renderer.render( rttScene, orthoCamera, rtPositionCur);
    simMesh.material.uniforms.position_texture.value = rtPositionCur;
  }
  
  //update loop
  this.render = function {
      requestAnimationFrame(this.render);
      
      //render the particles at the new location
      physicsTick();
      passThroughRender( rtPositionCur );
      
      simMesh.material.uniforms.mouse_magnitude.value = 0;
  }
}