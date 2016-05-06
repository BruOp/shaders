var scene, orthoCamera, renderer, rtt, height_field;

var WIDTH = 500, HEIGHT = 500;
window.onload = function() {
    var shaderLoader = new ShaderLoader();
    shaderLoader.loadShaders({
      vertex : "simulation/vertex.glsl",
      fragment : "simulation/fragment.glsl",
    }, "./shaders/simulation/", start );

  function start() {
    renderer = new THREE.WebGLRenderer();
    renderer.setSize(WIDTH, HEIGHT);
    document.body.appendChild(renderer.domElement);
    
    var gl = renderer.getContext();

    //1 we need FLOAT Textures to store positions
    if (!gl.getExtension("OES_texture_float")){
        throw new Error( "float textures not supported" );
    }
    
    //3 rtt setup
    scene = new THREE.Scene();
    orthoCamera = new THREE.OrthographicCamera(-1,1,1,-1,1/Math.pow( 2, 53 ),1 );

    //4 create a target texture
    var options = {
      minFilter: THREE.NearestFilter,//important as we want to sample square pixels
      magFilter: THREE.NearestFilter,//
      format: THREE.RGBFormat,//could be RGBAFormat
      type: THREE.FloatType//important as we need precise coordinates (not ints)
    };
    //rtt = new THREE.WebGLRenderTarget( width,height, options);
    
    height_field = generatePositionTexture(WIDTH, HEIGHT);
    
    
    var simulationShader = new THREE.ShaderMaterial({
      uniforms: {
        height_field: { type: "t", value: height_field }
      },
      vertexShader: ShaderLoader.get( "vertex" ),
      fragmentShader:  ShaderLoader.get( "fragment" )
    });

    renderer.domElement.addEventListener('mousemove', defineOnMouseMove(simulationShader))
    //5 the simulation:
    //create a bi-unit quadrilateral and uses the simulation material to update the Float Texture
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
    scene.add(new THREE.Mesh(geom, simulationShader));

    update();
  }
  //returns an array of random 3D coordinates
  function generatePositionTexture(width, height) {
		var a = new Float32Array( width * height * 3 );
		for ( var k = 0, kl = a.length; k < kl; k += 3 ) {
      // var temp = Math.random();
      var temp = 0;
			a[ k + 0 ] = temp;
			a[ k + 1 ] = temp;
			a[ k + 2 ] = temp;
		}

		var texture = new THREE.DataTexture( a, WIDTH, HEIGHT, THREE.RGBFormat, THREE.FloatType );
		texture.needsUpdate = true;

		return texture;

	}
  
  function defineOnMouseMove(shader) {
    return function(event) {
      var x = event.offsetX, 
          y = event.offsetY;
      
      shader.uniforms.height_field.image.data[(x + WIDTH * y) * 3] = 1;
      
    };
  }
  
  //update loop
  function update()
  {
      requestAnimationFrame(update);
      
      //render the particles at the new location
      renderer.render( scene, orthoCamera );
  }
};