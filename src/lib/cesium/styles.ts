// Add Cesium CSS to the document head
export const addCesiumCSS = () => {
  if (typeof document === 'undefined') return
  
  const cesiumCSSId = 'cesium-widgets-css'
  
  // Check if already added
  if (document.getElementById(cesiumCSSId)) return
  
  const link = document.createElement('link')
  link.id = cesiumCSSId
  link.rel = 'stylesheet'
  link.href = '/cesium/Widgets/widgets.css'
  document.head.appendChild(link)
}
