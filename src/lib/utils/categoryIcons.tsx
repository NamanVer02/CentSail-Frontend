import React from 'react'
import { 
  FiTag, FiShoppingCart, FiSend, FiFilm, FiShoppingBag, FiGlobe, FiAward, 
  FiAlertTriangle, FiWatch, FiTrendingUp, FiBarChart2, FiTarget, FiHome, 
  FiCoffee, FiDollarSign, FiCreditCard, FiPocket, FiBriefcase, FiGift, 
  FiHeart, FiMusic, FiCamera, FiBook, FiZap, FiUmbrella, FiTruck, FiPackage, 
  FiActivity, FiPieChart, FiUsers, FiStar, FiSmile 
} from 'react-icons/fi'
import { Category } from '@/lib/services/categoryService'

// Icon name to JSX element mapping
const iconMap: Record<string, React.ReactElement> = {
  'tag': <FiTag />,
  'shopping-cart': <FiShoppingCart />,
  'send': <FiSend />,
  'film': <FiFilm />,
  'shopping-bag': <FiShoppingBag />,
  'globe': <FiGlobe />,
  'award': <FiAward />,
  'alert-triangle': <FiAlertTriangle />,
  'watch': <FiWatch />,
  'trending-up': <FiTrendingUp />,
  'bar-chart-2': <FiBarChart2 />,
  'target': <FiTarget />,
  'home': <FiHome />,
  'coffee': <FiCoffee />,
  'dollar-sign': <FiDollarSign />,
  'credit-card': <FiCreditCard />,
  'pocket': <FiPocket />,
  'briefcase': <FiBriefcase />,
  'gift': <FiGift />,
  'heart': <FiHeart />,
  'music': <FiMusic />,
  'camera': <FiCamera />,
  'book': <FiBook />,
  'zap': <FiZap />,
  'umbrella': <FiUmbrella />,
  'truck': <FiTruck />,
  'package': <FiPackage />,
  'activity': <FiActivity />,
  'pie-chart': <FiPieChart />,
  'users': <FiUsers />,
  'star': <FiStar />,
  'smile': <FiSmile />
}

/**
 * Converts an icon name to a React icon component
 * @param iconName - The icon identifier (e.g., "shopping-cart", "send")
 * @returns React element for the icon, or default FiTag if not found
 */
export function getIconByName(iconName: string | null | undefined): React.ReactElement {
  if (!iconName) {
    return <FiTag />
  }
  return iconMap[iconName.trim()] || <FiTag />
}

/**
 * Gets the icon for a category, using the stored icon from the database
 * Falls back to default "tag" icon if no icon is stored
 * @param category - The category object (may be undefined)
 * @returns React element for the category icon
 */
export function getCategoryIcon(category: Category | null | undefined): React.ReactElement {
  if (!category) {
    return <FiTag />
  }
  
  // Always use the stored icon from the database
  if (category.icon) {
    return getIconByName(category.icon)
  }
  
  // Fallback to default icon if no icon is stored
  return <FiTag />
}

/**
 * Gets the icon for a category by its ID from a map of categories
 * @param categoryId - The category ID
 * @param categoryMap - Map of category ID to Category object
 * @returns React element for the category icon
 */
export function getCategoryIconById(
  categoryId: string | null | undefined,
  categoryMap: Map<string, Category> | Record<string, Category>
): React.ReactElement {
  if (!categoryId) {
    return <FiTag />
  }
  
  const category = categoryMap instanceof Map 
    ? categoryMap.get(categoryId)
    : categoryMap[categoryId]
  
  return getCategoryIcon(category)
}

/**
 * Available icons for the icon picker
 */
export const availableIcons = [
  { name: 'tag', label: 'Tag' },
  { name: 'shopping-cart', label: 'Shopping Cart' },
  { name: 'send', label: 'Send' },
  { name: 'film', label: 'Film' },
  { name: 'shopping-bag', label: 'Shopping Bag' },
  { name: 'globe', label: 'Globe' },
  { name: 'award', label: 'Award' },
  { name: 'alert-triangle', label: 'Alert' },
  { name: 'watch', label: 'Watch' },
  { name: 'trending-up', label: 'Trending Up' },
  { name: 'bar-chart-2', label: 'Chart' },
  { name: 'target', label: 'Target' },
  { name: 'home', label: 'Home' },
  { name: 'coffee', label: 'Coffee' },
  { name: 'dollar-sign', label: 'Dollar' },
  { name: 'credit-card', label: 'Credit Card' },
  { name: 'pocket', label: 'Pocket' },
  { name: 'briefcase', label: 'Briefcase' },
  { name: 'gift', label: 'Gift' },
  { name: 'heart', label: 'Heart' },
  { name: 'music', label: 'Music' },
  { name: 'camera', label: 'Camera' },
  { name: 'book', label: 'Book' },
  { name: 'zap', label: 'Zap' },
  { name: 'umbrella', label: 'Umbrella' },
  { name: 'truck', label: 'Truck' },
  { name: 'package', label: 'Package' },
  { name: 'activity', label: 'Activity' },
  { name: 'pie-chart', label: 'Pie Chart' },
  { name: 'users', label: 'Users' },
  { name: 'star', label: 'Star' },
  { name: 'smile', label: 'Smile' }
]

