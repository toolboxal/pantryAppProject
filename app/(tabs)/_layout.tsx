import { StyleSheet, Text, View } from 'react-native'
import { Tabs } from 'expo-router'

const TabsLayout = () => {
  return (
    <Tabs screenOptions={{ headerShown: false }}>
      <Tabs.Screen name="formPage" />
      <Tabs.Screen name="index" />
    </Tabs>
  )
}
export default TabsLayout
const styles = StyleSheet.create({})
