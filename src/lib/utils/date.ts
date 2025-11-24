import { DateValue, FirestoreTimestamp } from '@/lib/types/date'

const isFirestoreTimestamp = (value: unknown): value is FirestoreTimestamp => {
  return Boolean(
    value &&
    typeof value === 'object' &&
    'seconds' in value &&
    typeof (value as { seconds?: unknown }).seconds === 'number'
  )
}

export const parseDateValue = (dateValue: DateValue): Date | null => {
  if (!dateValue) return null

  if (dateValue instanceof Date) {
    return isNaN(dateValue.getTime()) ? null : dateValue
  }

  if (isFirestoreTimestamp(dateValue)) {
    const milliseconds = dateValue.seconds * 1000 + Math.floor((dateValue.nanos ?? 0) / 1_000_000)
    return new Date(milliseconds)
  }

  if (typeof dateValue === 'string') {
    const parsed = new Date(dateValue)
    return isNaN(parsed.getTime()) ? null : parsed
  }

  return null
}

