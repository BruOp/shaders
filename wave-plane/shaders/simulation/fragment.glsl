varying vec2 vUv;

uniform float offset;
uniform float wave_speed;
uniform float damping_strength;
uniform float mouse_magnitude;
uniform float draw_radius;

uniform vec2 mouse;

uniform sampler2D position_texture;

vec4 get_texture_values(in vec2 tex_coords) {
  return texture2D(position_texture, tex_coords);
}

float fd_central(in float left, in float center, in float right) {
  return (right + left - (2.0 * center)) * pow(offset, -2.);
}

float get_x_deriv(in float center) {
  vec2 left_uv  = vUv - vec2(offset, 0.);
  vec2 right_uv = vUv + vec2(offset, 0.);
  float sign_left  = sign(left_uv.x);
  float sign_right = sign(1. - right_uv.x);
  float left   = clamp(-sign_left, 0., 1.) + sign_left * get_texture_values(left_uv).r;
  float right  = clamp(-sign_right, 0., 1.) + sign_right * get_texture_values(right_uv).r;
  return fd_central(left, center, right);
}

float get_y_deriv(in float center) {
  vec2 top_uv    = vUv + vec2(0., offset);
  vec2 bottom_uv = vUv - vec2(0., offset);
  float sign_top = sign(1. - top_uv.y);
  float sign_bot = sign(bottom_uv.y);
  float top    = clamp(-sign_top, 0., 1.) + sign_top * get_texture_values(top_uv).r;
  float bottom = clamp(-sign_bot, 0., 1.) + sign_bot * get_texture_values(bottom_uv).r;
  return fd_central(bottom, center, top);
}

float get_next_position() {
  float cur_position = get_texture_values(vUv).r;
  float old_position = get_texture_values(vUv).g;
  float gradient = get_x_deriv(cur_position) + get_y_deriv(cur_position);
  
  float damping_factor = 1. / (1. + damping_strength);
  return damping_factor * (
      (damping_strength - 1.) * old_position
      + 2. * cur_position
      + pow(wave_speed, 2.) * gradient);
}


void main() {
  float cur_position = get_texture_values(vUv).r;
  float new_position = get_next_position();
  
  float mouse_distance = length(mouse - vUv);
  float color = mouse_magnitude * 0.001 * max(sign(draw_radius - mouse_distance), 0.0);
  float final_value = clamp(new_position + color, 0., 1.);
  gl_FragColor = vec4(final_value, cur_position, 0.0, 1.0);
}
