import * as THREE from 'three'

export class MeshBannerMaterial extends THREE.MeshBasicMaterial {
  private _time: number = 0
  private _speed: number = 1
  private _gradientTexture: THREE.Texture | null = null
  
  constructor(parameters?: THREE.MeshBasicMaterialParameters & {
    gradientTexture?: THREE.Texture
    speed?: number
  }) {
    super(parameters)
    
    if (parameters?.gradientTexture) {
      this._gradientTexture = parameters.gradientTexture
      this.map = this._gradientTexture
    }
    
    if (parameters?.speed !== undefined) {
      this._speed = parameters.speed
    }
    
    this.transparent = true
    this.opacity = 0.8
  }
  
  onBeforeCompile = (shader: any) => {
    // Add uniforms
    shader.uniforms.uTime = { value: this._time }
    shader.uniforms.uSpeed = { value: this._speed }
    
    // Modify vertex shader
    shader.vertexShader = shader.vertexShader.replace(
      '#include <common>',
      `
      #include <common>
      uniform float uTime;
      uniform float uSpeed;
      `
    )
    
    shader.vertexShader = shader.vertexShader.replace(
      '#include <uv_vertex>',
      `
      #include <uv_vertex>
      
      // Animate UV coordinates
      vUv.x += uTime * uSpeed * 0.1;
      `
    )
    
    // Modify fragment shader for rainbow effect
    shader.fragmentShader = shader.fragmentShader.replace(
      '#include <color_fragment>',
      `
      #include <color_fragment>
      
      // Add shimmer effect
      float shimmer = sin(vUv.x * 20.0 + uTime * 5.0) * 0.1 + 0.9;
      diffuseColor.rgb *= shimmer;
      `
    )
  }
  
  updateTime(time: number) {
    this._time = time
    // Update uniforms if shader is compiled
    if ((this as any).userData.shader) {
      (this as any).userData.shader.uniforms.uTime.value = time
    }
  }
  
  get speed(): number {
    return this._speed
  }
  
  set speed(value: number) {
    this._speed = value
    if ((this as any).userData.shader) {
      (this as any).userData.shader.uniforms.uSpeed.value = value
    }
  }
  
  get gradientTexture(): THREE.Texture | null {
    return this._gradientTexture
  }
  
  set gradientTexture(texture: THREE.Texture | null) {
    this._gradientTexture = texture
    this.map = texture
    this.needsUpdate = true
  }
}