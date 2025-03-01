import db from './db'
import { sql } from 'drizzle-orm'
import { locations } from './schema'

const defaultLocations = [
  { room: 'balcony', direction: 'top', noun: 'shelf' },
  { room: 'kitchen', direction: 'beside', noun: 'fridge' },
  { room: 'bathroom', direction: 'under', noun: 'sink' },
  { room: 'store_room', direction: 'top', noun: 'cabinet' },
  { room: 'laundry', direction: 'above', noun: 'washer' },
  { room: 'pantry', direction: '1st', noun: 'shelf' },
  { room: 'garage', direction: 'left', noun: 'rack' },
  { room: 'master_bedroom', direction: 'under', noun: 'bed' },
  { room: 'study_room', direction: 'right', noun: 'corner' },
]

export const seedDatabase = async () => {
  const countResult = await db
    .select({ count: sql<number>`count(*)` })
    .from(locations)
  if (countResult[0].count === 0) {
    console.log('Seeding locations...')
    await db.insert(locations).values(defaultLocations)
    console.log('Seeding complete!')
  }
}

export const getTagOptions = async () => {
  const allLocations = await db.select().from(locations)
  const rooms = [...new Set(allLocations.map((l) => l.room))]
  const directions = [...new Set(allLocations.map((l) => l.direction))]
  const nouns = [...new Set(allLocations.map((l) => l.noun))]
  return { rooms, directions, nouns }
}
