export default function Loading() {
  return (
    <div 
      id="route-loading" 
      className="fixed inset-0 z-[9999] flex items-center justify-center bg-white/80 backdrop-blur-sm"
      aria-live="polite"
    >
      <div className="flex flex-col items-center space-y-4">
        {/* Spinner */}
        <div className="relative">
          <div className="h-12 w-12 animate-spin rounded-full border-4 border-gray-200 border-t-blue-600" />
          <div className="absolute inset-0 h-12 w-12 animate-pulse rounded-full border-4 border-transparent border-t-blue-400 opacity-50" />
        </div>
        
        {/* Loading text */}
        <div className="text-sm font-medium text-gray-600 animate-pulse">
          Loading...
        </div>
      </div>
    </div>
  )
}