import db from './db'
import { sql } from 'drizzle-orm'
import { locations } from './schema'

const defaultLocations = [
  { room: 'balcony', spotDirection: 'top', spotNoun: 'shelf' },
  { room: 'kitchen', spotDirection: 'beside', spotNoun: 'fridge' },
  { room: 'bathroom', spotDirection: 'under', spotNoun: 'sink' },
  { room: 'store_room', spotDirection: 'top', spotNoun: 'cabinet' },
  { room: 'laundry', spotDirection: 'above', spotNoun: 'washer' },
  { room: 'pantry', spotDirection: '1st', spotNoun: 'shelf' },
  { room: 'garage', spotDirection: 'left', spotNoun: 'rack' },
  { room: 'master_bedroom', spotDirection: 'under', spotNoun: 'bed' },
  { room: 'study_room', spotDirection: 'right', spotNoun: 'corner' },
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
  const directions = [...new Set(allLocations.map((l) => l.spotDirection))]
  const nouns = [...new Set(allLocations.map((l) => l.spotNoun))]
  return { rooms, directions, nouns }
}
