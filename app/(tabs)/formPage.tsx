import Form from '@/components/Form'
import { StyleSheet, Text, View } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { blue, gray } from '@/constants/colors'

const formPage = () => {
  return (
    <SafeAreaView style={styles.form} edges={['top']}>
      <Form />
    </SafeAreaView>
  )
}
export default formPage
const styles = StyleSheet.create({
  form: {
    height: '100%',
    backgroundColor: gray[100],
  },
})
