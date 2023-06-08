
varying highp vec2 vTextureCoord;

uniform sampler2D uSampler;
uniform int uvsLengh;

void main(void) {
  precision mediump float;
  float x = vTextureCoord.x / float(uvsLengh);
  gl_FragColor = texture2D(uSampler, vec2(x, vTextureCoord.y));
}