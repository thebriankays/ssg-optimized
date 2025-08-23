// Type declaration for processedFonts.json
declare module '*/processedFonts.json' {
  interface FontData {
    family: string
    displayName: string
    category: string
    weights: string[]
    styles: string[]
    previewText: string
    popularity: number
  }
  
  const fonts: FontData[]
  export default fonts
}