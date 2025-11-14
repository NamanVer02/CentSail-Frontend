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
  private cache: Map<string, CacheEntry<any>> = new Map()
  
  // Default TTL values (in milliseconds)
  private readonly DEFAULT_TTL = {
    CATEGORIES: 5 * 60 * 1000, // 5 minutes
    ENTRIES: 2 * 60 * 1000, // 2 minutes
    ANALYTICS: 3 * 60 * 1000, // 3 minutes
    DASHBOARD: 2 * 60 * 1000, // 2 minutes
  }

  /**
   * Generate a cache key from parameters
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
          } else {
            normalizedParams[key] = value
          }
        }
      })
    
    if (Object.keys(normalizedParams).length === 0) {
      return prefix
    }
    
    const sortedParams = Object.keys(normalizedParams)
      .sort()
      .map(key => `${key}:${JSON.stringify(normalizedParams[key])}`)
      .join('|')
    return `${prefix}|${sortedParams}`
  }

  /**
   * Get data from cache if available and not expired
   */
  get<T>(key: string): T | null {
    const entry = this.cache.get(key)
    
    if (!entry) {
      if (process.env.NODE_ENV === 'development') {
        console.log(`[Cache MISS] ${key}`)
      }
      return null
    }

    const now = Date.now()
    const isExpired = now - entry.timestamp > entry.ttl

    if (isExpired) {
      this.cache.delete(key)
      if (process.env.NODE_ENV === 'development') {
        console.log(`[Cache EXPIRED] ${key}`)
      }
      return null
    }

    if (process.env.NODE_ENV === 'development') {
      console.log(`[Cache HIT] ${key}`)
    }
    return entry.data as T
  }

  /**
   * Set data in cache with TTL
   */
  set<T>(key: string, data: T, ttl?: number): void {
    const entry: CacheEntry<T> = {
      data,
      timestamp: Date.now(),
      ttl: ttl || this.DEFAULT_TTL.ENTRIES
    }
    this.cache.set(key, entry)
    if (process.env.NODE_ENV === 'development') {
      console.log(`[Cache SET] ${key}`, { ttl: entry.ttl / 1000 + 's' })
    }
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

export const cacheService = new CacheService()

