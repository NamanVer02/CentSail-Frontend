export type FirestoreTimestamp = {
  seconds: number
  nanos?: number
}

export type DateValue = FirestoreTimestamp | string | Date | null | undefined

