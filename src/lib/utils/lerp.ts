/**
 * Linear interpolation function
 * @param start - Starting value
 * @param end - Target value
 * @param factor - Interpolation factor (0-1)
 * @param deltaTime - Optional delta time for frame-rate independent lerp
 * @returns Interpolated value
 */
export function lerp(start: number, end: number, factor: number, deltaTime?: number): number {
  const t = deltaTime ? 1 - Math.pow(1 - factor, deltaTime * 60) : factor
  return start + (end - start) * t
}

export default lerp
