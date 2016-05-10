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
  float left   = get_texture_values(vUv - vec2(offset, 0.)).r;
  float right  = get_texture_values(vUv + vec2(offset, 0.)).r;
  return fd_central(left, center, right);
}

float get_y_deriv(in float center) {
  float top    = get_texture_values(vUv - vec2(0., offset)).r;
  float bottom = get_texture_values(vUv + vec2(0., offset)).r;
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
  float color = mouse_magnitude * 0.01 * max(sign(draw_radius - mouse_distance), 0.0);
  float final_value = clamp(new_position + color, 0., 1.);
  gl_FragColor = vec4(final_value, cur_position, 0.0, 1.0);
}
