varying vec2 vUv;

uniform float time;
uniform float offset;
uniform float wave_speed;
uniform float damping_strength;
uniform float dt;
uniform vec2 mouse;
uniform sampler2D position_old;
uniform sampler2D position_cur;

float fd_central(float left, float center, float right) {
  return (right + left - 2.0 * center) * pow(offset, -2.);
}

float get_x_deriv(float center) {
  float left   = texture2D( position_cur, vUv + vec2(-offset, 0.)).r;
  float right  = texture2D( position_cur, vUv + vec2(offset, 0.)).r;
  return fd_central(left, right, center);
}

float get_y_deriv(float center) {
  float top    = texture2D( position_cur, vUv + vec2(0., offset)).r;
  float bottom = texture2D( position_cur, vUv + vec2(0., -offset)).r;
  return fd_central(bottom, center, top);
}

float get_next_timestep() {
  float cur_position = texture2D( position_cur, vUv ).r;
  float old_position = texture2D( position_old, vUv ).r;
  float gradient = get_x_deriv(cur_position) + get_y_deriv(cur_position);
  
  float damping_factor = 1. / (1. + damping_strength);
  return damping_factor * (
      (damping_strength - 1.) * old_position
      + 2. * cur_position
      + pow(wave_speed, 2.) * gradient);
}

void main() {
  const float DRAW_RADIUS = 0.01;
  float new_position = get_next_timestep();
  float mouse_distance = length(mouse - vUv);
  float color = max(sign(DRAW_RADIUS - mouse_distance), 0.0);
  gl_FragColor = vec4(min(1., new_position + color), 0., 0., 1.0);
}
