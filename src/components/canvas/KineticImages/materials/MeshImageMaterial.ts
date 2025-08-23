import * as THREE from 'three'

export class MeshImageMaterial extends THREE.MeshBasicMaterial {
  private _frontFacing: boolean = true
  private _backColor: THREE.Color = new THREE.Color(0.2, 0.2, 0.2)
  
  constructor(parameters?: THREE.MeshBasicMaterialParameters & {
    frontFacing?: boolean
    backColor?: THREE.ColorRepresentation
  }) {
    super(parameters)
    
    if (parameters?.frontFacing !== undefined) {
      this._frontFacing = parameters.frontFacing
    }
    if (parameters?.backColor) {
      this._backColor = new THREE.Color(parameters.backColor)
    }
  }
  
  onBeforeCompile = (shader: any) => {
    // Add uniforms
    shader.uniforms.uFrontFacing = { value: this._frontFacing }
    shader.uniforms.uBackColor = { value: this._backColor }
    
    // Modify fragment shader
    shader.fragmentShader = shader.fragmentShader.replace(
      '#include <common>',
      `
      #include <common>
      uniform bool uFrontFacing;
      uniform vec3 uBackColor;
      `
    )
    
    shader.fragmentShader = shader.fragmentShader.replace(
      '#include <color_fragment>',
      `
      #include <color_fragment>
      
      if (!gl_FrontFacing) {
        diffuseColor.rgb = mix(diffuseColor.rgb, uBackColor, 0.7);
      }
      `
    )
  }
  
  get frontFacing(): boolean {
    return this._frontFacing
  }
  
  set frontFacing(value: boolean) {
    this._frontFacing = value
    this.needsUpdate = true
  }
  
  get backColor(): THREE.Color {
    return this._backColor
  }
  
  set backColor(value: THREE.ColorRepresentation) {
    this._backColor = new THREE.Color(value)
    this.needsUpdate = true
  }
}