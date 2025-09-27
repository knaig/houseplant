// Performance monitoring utilities

export function measurePerformance(name: string, fn: () => void | Promise<void>) {
  const start = performance.now()
  
  const result = fn()
  
  if (result instanceof Promise) {
    return result.finally(() => {
      const end = performance.now()
      console.log(`⏱️ ${name}: ${(end - start).toFixed(2)}ms`)
    })
  } else {
    const end = performance.now()
    console.log(`⏱️ ${name}: ${(end - start).toFixed(2)}ms`)
    return result
  }
}

export function logPageLoad() {
  if (typeof window !== 'undefined') {
    window.addEventListener('load', () => {
      const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming
      console.log('📊 Page Load Performance:', {
        domContentLoaded: navigation.domContentLoadedEventEnd - navigation.domContentLoadedEventStart,
        loadComplete: navigation.loadEventEnd - navigation.loadEventStart,
        totalTime: navigation.loadEventEnd - navigation.fetchStart,
      })
    })
  }
}

export function logWebVitals() {
  if (typeof window !== 'undefined') {
    // Log Core Web Vitals
    const observer = new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        if (entry.entryType === 'largest-contentful-paint') {
          console.log('🎯 LCP:', entry.startTime)
        }
        if (entry.entryType === 'first-input') {
          console.log('⚡ FID:', entry.processingStart - entry.startTime)
        }
        if (entry.entryType === 'layout-shift') {
          console.log('📐 CLS:', (entry as any).value)
        }
      }
    })
    
    observer.observe({ entryTypes: ['largest-contentful-paint', 'first-input', 'layout-shift'] })
  }
}
