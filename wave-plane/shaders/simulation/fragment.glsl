varying vec2 vUv;

uniform float time;
uniform sampler2D height_field;

void main() {
  vec4 color = texture2D( height_field, vUv );
  gl_FragColor = vec4( color.rgb , 1.0 );
}
