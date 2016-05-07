varying vec2 vUv;

uniform float time;
uniform vec2 mouse;
uniform sampler2D position_old;
uniform sampler2D position_cur;

void main() {
  vec3 texture_data = texture2D( position_cur, vUv ).xyz;
  const float DRAW_RADIUS = 0.01;
  float mouse_distance = length(mouse - vUv);
  float color = max(sign(DRAW_RADIUS - mouse_distance), 0.0);
  gl_FragColor = vec4(texture_data.r + color, texture_data.gb, 1.0);
}
