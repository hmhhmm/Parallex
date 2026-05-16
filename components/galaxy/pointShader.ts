export const vertexShader = /* glsl */ `
  attribute float size;
  uniform float uTime;
  uniform float uDisperse;
  varying vec3 vColor;
  varying float vFade;

  void main() {
    vColor = color;

    // Ease-in the scatter so it accelerates as disperse increases
    float d2 = uDisperse * uDisperse;

    // Push each particle radially outward from its origin
    vec3 outDir = normalize(position + vec3(0.0001));
    vec3 pos = position + outDir * d2 * 14.0;

    vec4 mvPosition = modelViewMatrix * vec4(pos, 1.0);

    float pulse = 1.0 + 0.22 * sin(uTime * 0.55 + position.x * 1.8 + position.z * 1.4);
    // Size shrinks as particles scatter
    float sizeFade = max(0.0, 1.0 - d2 * 1.6);
    gl_PointSize = size * pulse * sizeFade * (520.0 / -mvPosition.z);
    gl_Position = projectionMatrix * mvPosition;

    // Alpha fades as particles scatter
    vFade = max(0.0, 1.0 - uDisperse * 1.5);
  }
`

export const fragmentShader = /* glsl */ `
  varying vec3 vColor;
  varying float vFade;

  void main() {
    vec2 uv = gl_PointCoord - vec2(0.5);
    float dist = length(uv);
    if (dist > 0.5) discard;

    float core = exp(-dist * dist * 16.0);
    float halo = exp(-dist * dist * 4.5) * 0.35;
    float alpha = (core + halo) * vFade;

    gl_FragColor = vec4(vColor * alpha, alpha);
  }
`
