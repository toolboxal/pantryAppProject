import * as SQLite from 'expo-sqlite'
import { drizzle } from 'drizzle-orm/expo-sqlite'

export const expoDB = SQLite.openDatabaseSync('app.db')

const db = drizzle(expoDB)

export default db
