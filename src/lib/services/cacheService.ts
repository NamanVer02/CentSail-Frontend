/**
 * Frontend Cache Service
 * Provides caching with TTL (Time To Live) for frequently accessed data
 */

interface CacheEntry<T> {
  data: T
  timestamp: number
  ttl: number // Time to live in milliseconds
}

class CacheService {
  private cache: Map<string, CacheEntry<any>>
  
  // Default TTL values (in milliseconds)
  private readonly DEFAULT_TTL = {
    CATEGORIES: 5 * 60 * 1000, // 5 minutes
    ENTRIES: 2 * 60 * 1000, // 2 minutes
    ANALYTICS: 3 * 60 * 1000, // 3 minutes
    DASHBOARD: 2 * 60 * 1000, // 2 minutes
  }

  constructor() {
    // Use a global cache to persist across hot reloads in development
    if (typeof window !== 'undefined') {
      // @ts-ignore - Add cache to window for persistence
      if (!window.__cacheServiceInstance) {
        this.cache = new Map()
        // @ts-ignore
        window.__cacheServiceInstance = this.cache
      } else {
        // Reuse existing cache from previous hot reload
        // @ts-ignore
        this.cache = window.__cacheServiceInstance
      }
    } else {
      // Server-side: create new Map
      this.cache = new Map()
    }
  }

  /**
   * Generate a cache key from parameters
   * Uses consistent serialization to ensure keys match between get and set
   */
  private generateKey(prefix: string, params?: Record<string, any>): string {
    if (!params || Object.keys(params).length === 0) {
      return prefix
    }
    // Filter out undefined/null values and normalize
    const normalizedParams: Record<string, any> = {}
    Object.keys(params)
      .sort()
      .forEach(key => {
        const value = params[key]
        if (value !== undefined && value !== null) {
          // Normalize type to uppercase for consistency
          if (key === 'type' && typeof value === 'string') {
            normalizedParams[key] = value.toUpperCase()
          } else if (typeof value === 'object' && !Array.isArray(value)) {
            // For objects, sort keys and stringify consistently
            const sortedObj: Record<string, any> = {}
            Object.keys(value).sort().forEach(k => {
              if (value[k] !== undefined && value[k] !== null) {
                sortedObj[k] = value[k]
              }
            })
            normalizedParams[key] = sortedObj
          } else {
            normalizedParams[key] = value
          }
        }
      })
    
    if (Object.keys(normalizedParams).length === 0) {
      return prefix
    }
    
    // Use consistent serialization
    // For strings, we'll use the value directly (no quotes) to avoid escape sequence issues
    // For other types, use JSON.stringify
    const sortedParams = Object.keys(normalizedParams)
      .sort()
      .map(key => {
        const value = normalizedParams[key]
        let serialized: string
        if (typeof value === 'string') {
          // For strings, use the value directly without JSON.stringify to avoid quote issues
          serialized = value
        } else {
          // For other types (numbers, booleans, objects), use JSON.stringify
          serialized = JSON.stringify(value)
        }
        return `${key}:${serialized}`
      })
      .join('|')
    const key = `${prefix}|${sortedParams}`
    
    return key
  }

  /**
   * Get data from cache if available and not expired
   */
  get<T>(key: string): T | null {
    // Verify cache instance is correct
    const cacheSize = this.cache.size
    if (cacheSize === 0) {
      // Check if we lost the cache reference
      if (typeof window !== 'undefined') {
        // @ts-ignore
        const globalCache = window.__cacheServiceInstance
        if (globalCache && globalCache.size > 0) {
          this.cache = globalCache
        }
      }
    }
    
    const entry = this.cache.get(key)
    
    if (!entry) {
      return null
    }

    const now = Date.now()
    const isExpired = now - entry.timestamp > entry.ttl

    if (isExpired) {
      this.cache.delete(key)
      return null
    }

    return entry.data as T
  }

  /**
   * Set data in cache with TTL
   */
  set<T>(key: string, data: T, ttl?: number): void {
    // Ensure we're using the persistent cache instance
    if (typeof window !== 'undefined') {
      // @ts-ignore
      const globalCache = window.__cacheServiceInstance
      if (globalCache && globalCache !== this.cache) {
        this.cache = globalCache
      }
    }
    
    const entry: CacheEntry<T> = {
      data,
      timestamp: Date.now(),
      ttl: ttl || this.DEFAULT_TTL.ENTRIES
    }
    this.cache.set(key, entry)
  }

  /**
   * Remove specific key from cache
   */
  delete(key: string): void {
    this.cache.delete(key)
  }

  /**
   * Remove all keys matching a prefix
   */
  deleteByPrefix(prefix: string): void {
    const keysToDelete: string[] = []
    for (const key of this.cache.keys()) {
      if (key.startsWith(prefix)) {
        keysToDelete.push(key)
      }
    }
    keysToDelete.forEach(key => this.cache.delete(key))
  }

  /**
   * Clear all cache
   */
  clear(): void {
    this.cache.clear()
  }

  /**
   * Get cache statistics (for debugging)
   */
  getStats(): { size: number; keys: string[] } {
    return {
      size: this.cache.size,
      keys: Array.from(this.cache.keys())
    }
  }

  /**
   * Cache categories
   */
  getCategories(type?: string, userId?: string): any[] | null {
    const key = this.generateKey('categories', { type, userId })
    return this.get<any[]>(key)
  }

  setCategories(data: any[], type?: string, userId?: string): void {
    const key = this.generateKey('categories', { type, userId })
    this.set(key, data, this.DEFAULT_TTL.CATEGORIES)
  }

  invalidateCategories(userId?: string): void {
    if (userId) {
      this.deleteByPrefix('categories|')
    } else {
      this.deleteByPrefix('categories')
    }
  }

  /**
   * Cache entries
   */
  getEntries(params: Record<string, any>): any | null {
    const key = this.generateKey('entries', params)
    return this.get<any>(key)
  }

  setEntries(data: any, params: Record<string, any>): void {
    const key = this.generateKey('entries', params)
    this.set(key, data, this.DEFAULT_TTL.ENTRIES)
  }

  invalidateEntries(userId?: string): void {
    if (userId) {
      this.deleteByPrefix('entries|')
    } else {
      this.deleteByPrefix('entries')
    }
  }

  /**
   * Cache analytics
   */
  getAnalytics(key: string): any | null {
    return this.get<any>(`analytics|${key}`)
  }

  setAnalytics(key: string, data: any): void {
    this.set(`analytics|${key}`, data, this.DEFAULT_TTL.ANALYTICS)
  }

  invalidateAnalytics(userId?: string): void {
    this.deleteByPrefix('analytics')
  }

  /**
   * Cache dashboard data
   */
  getDashboard(key: string): any | null {
    return this.get<any>(`dashboard|${key}`)
  }

  setDashboard(key: string, data: any): void {
    this.set(`dashboard|${key}`, data, this.DEFAULT_TTL.DASHBOARD)
  }

  invalidateDashboard(userId?: string): void {
    this.deleteByPrefix('dashboard')
  }
}

// Create singleton instance
// In Next.js, modules can be re-evaluated during hot reloading
// We use a global cache stored on window to persist across hot reloads
let cacheServiceInstance: CacheService | null = null

if (typeof window !== 'undefined') {
  // @ts-ignore
  if (!window.__cacheService) {
    cacheServiceInstance = new CacheService()
    // @ts-ignore
    window.__cacheService = cacheServiceInstance
  } else {
    // @ts-ignore
    cacheServiceInstance = window.__cacheService
  }
} else {
  // Server-side: create new instance
  cacheServiceInstance = new CacheService()
}

export const cacheService = cacheServiceInstance!

