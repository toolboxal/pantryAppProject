import { useEffect } from 'react'
import { Stack } from 'expo-router'
import * as SplashScreen from 'expo-splash-screen'
import { useDrizzleStudio } from 'expo-drizzle-studio-plugin'
import { SQLiteProvider } from 'expo-sqlite'
import {
  useFonts,
  Bitter_100Thin,
  Bitter_200ExtraLight,
  Bitter_300Light,
  Bitter_400Regular,
  Bitter_500Medium,
  Bitter_600SemiBold,
  Bitter_700Bold,
  Bitter_800ExtraBold,
  Bitter_900Black,
  Bitter_100Thin_Italic,
  Bitter_200ExtraLight_Italic,
  Bitter_300Light_Italic,
  Bitter_400Regular_Italic,
  Bitter_500Medium_Italic,
  Bitter_600SemiBold_Italic,
  Bitter_700Bold_Italic,
  Bitter_800ExtraBold_Italic,
  Bitter_900Black_Italic,
} from '@expo-google-fonts/bitter'
import {
  Poppins_100Thin,
  Poppins_100Thin_Italic,
  Poppins_200ExtraLight,
  Poppins_200ExtraLight_Italic,
  Poppins_300Light,
  Poppins_300Light_Italic,
  Poppins_400Regular,
  Poppins_400Regular_Italic,
  Poppins_500Medium,
  Poppins_500Medium_Italic,
  Poppins_600SemiBold,
  Poppins_600SemiBold_Italic,
  Poppins_700Bold,
  Poppins_700Bold_Italic,
  Poppins_800ExtraBold,
  Poppins_800ExtraBold_Italic,
  Poppins_900Black,
  Poppins_900Black_Italic,
} from '@expo-google-fonts/poppins'
import { migrate } from 'drizzle-orm/expo-sqlite/migrator'
import db, { expoDB } from '@/db/db'
import migrations from '@/drizzle/migrations'

SplashScreen.preventAutoHideAsync()

export default function RootLayout() {
  const [loaded, error] = useFonts({
    Poppins_400Regular,
    Poppins_500Medium,
    Poppins_600SemiBold,
    Poppins_700Bold,
    Bitter_400Regular,
    Bitter_500Medium,
    Bitter_600SemiBold,
    Bitter_700Bold,
  })
  useEffect(() => {
    async function prepare() {
      await migrate(db, migrations)
      if (loaded || error) {
        SplashScreen.hideAsync()
      }
    }
    prepare()
  }, [loaded, error])

  useDrizzleStudio(expoDB)

  if (!loaded && !error) {
    return null
  }
  return (
    <SQLiteProvider databaseName="app.db">
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="(tabs)" />
      </Stack>
    </SQLiteProvider>
  )
}
