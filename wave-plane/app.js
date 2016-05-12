var scene, camera, renderer;
    
var mouse, rayCaster, intersect;



var WIDTH = 512, HEIGHT = 512;
window.onload = function() {
  var raycaster = new THREE.Raycaster();
  var intersect = new THREE.Vector2(0.5, 0.5);
  var mouse = new THREE.Vector2();
  
  renderer = new THREE.WebGLRenderer();
  renderer.setSize(WIDTH, HEIGHT);
  
  document.body.appendChild(renderer.domElement);
  
  scene = new THREE.Scene();
  camera = new THREE.PerspectiveCamera(60, WIDTH/HEIGHT, 1,10000 );
  
  function getRenderTarget() {
		var renderTarget = new THREE.WebGLRenderTarget(this.width, this.height, {
			wrapS: THREE.MirroredRepeatWrapping,
			wrapT: THREE.MirroredRepeatWrapping,
			minFilter: THREE.NearestFilter,
			magFilter: THREE.NearestFilter,
			format: THREE.RGBFormat,
			type: THREE.FloatType,
			stencilBuffer: false
		});
		return renderTarget;
	}
  
  function onMouseClick() {
    mouse.x = (event.offsetX / this.width) * 2 - 1;
    mouse.y = - (event.offsetY / this.height) * 2 + 1;
    
    raycaster.setFromCamera(mouse, orthoCamera);
    
    var intersects = raycaster.intersectObjects(scene.children);
    if (intersects.length > 0) {
      intersect.copy(intersects[0].uv);
      simMesh.material.uniforms.mouse_magnitude.value = 1.0;
    }
    
    
    renderer.domElement.addEventListener('click', onMouseClick);

  }

};