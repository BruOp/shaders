varying vec2 vUv;

uniform float time;
uniform vec2 mouse;
uniform sampler2D height_field;

void main() {
  const float DRAW_RADIUS = 0.05;
  float mouse_distance = length(mouse - vUv);
  float color = max(sign(DRAW_RADIUS - mouse_distance), 0.0);
  gl_FragColor = vec4(color, 0.0, 0.0, 1.0);
}
