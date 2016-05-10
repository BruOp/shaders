varying vec2 vUv;

uniform float time;
uniform float offset;
uniform float wave_speed;
uniform float damping_strength;
uniform vec2 mouse;
uniform float mouse_is_clicked;
uniform sampler2D position_old;
uniform sampler2D position_cur;
// uniform sampler2D uv_texture;

float fd_central(in float left, in float center, in float right) {
  return (right + left - (2.0 * center)) * pow(offset, -2.);
}

float get_x_deriv(in float center) {
  float left   = texture2D( position_cur, vUv - vec2(offset, 0.)).r;
  float right  = texture2D( position_cur, vUv + vec2(offset, 0.)).r;
  return fd_central(left, center, right);
}

float get_y_deriv(in float center) {
  float top    = texture2D( position_cur, vUv - vec2(0., offset)).r;
  float bottom = texture2D( position_cur, vUv + vec2(0., offset)).r;
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
  const float DRAW_RADIUS = 0.02;
  // vec3 uv_value = texture2D( uv_texture, vUv ).rgb;
  float new_position = get_next_timestep();
  float mouse_distance = length(mouse - vUv);
  float color = mouse_is_clicked * 0.01 * max(sign(DRAW_RADIUS - mouse_distance), 0.0);
  float final_value = max(0.0, min(new_position + color, 1.0));
  gl_FragColor = vec4(final_value, 0., 0., 1.0);
}
