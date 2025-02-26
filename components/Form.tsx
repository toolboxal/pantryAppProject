import { useState } from 'react'
import {
  StyleSheet,
  Text,
  View,
  TextInput,
  TouchableWithoutFeedback,
  Keyboard,
  Pressable,
} from 'react-native'
import { getLocales } from 'expo-localization'
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { pantryItemsInsertSchema } from '@/db/schema'
import { gray, blue, plum } from '@/constants/colors'
import { poppins, bitter, size } from '@/constants/fonts'
import { add, format } from 'date-fns'
import FormDateModal from './FormDateModal'

const categoryArray = ['food', 'hygiene', 'supplies', 'miscellaneous']

const Form = () => {
  const today = new Date()
  const [categorySelect, setCategorySelect] = useState(categoryArray[0])
  const [dateBought, setDateBought] = useState(today)
  const [dateExpiry, setDateExpiry] = useState(add(today, { months: 3 }))
  const [openModal, setOpenModal] = useState(false)
  const [dateOption, setDateOption] = useState(0)

  const { currencyCode } = getLocales()[0]
  const { control, handleSubmit } = useForm({
    resolver: zodResolver(pantryItemsInsertSchema),
  })

  return (
    <TouchableWithoutFeedback onPress={() => Keyboard.dismiss()}>
      <View style={styles.formContainer}>
        <View style={styles.formSpine}>
          <View style={styles.catContainer}>
            {categoryArray.map((category) => (
              <Pressable
                key={category}
                style={
                  category === categorySelect
                    ? styles.catBoxSelect
                    : styles.catBox
                }
                onPress={() => setCategorySelect(category)}
              >
                <Text
                  style={
                    category === categorySelect
                      ? styles.catTextSelect
                      : styles.catText
                  }
                >
                  {category}
                </Text>
              </Pressable>
            ))}
          </View>
          <Controller
            name="name"
            control={control}
            render={({ field: { onChange, onBlur, value } }) => (
              <TextInput
                onChangeText={onChange}
                value={value}
                onBlur={onBlur}
                style={styles.textInput}
                placeholder="Product Name"
                placeholderTextColor={gray[400]}
              />
            )}
          />
          <Controller
            name="quantity"
            control={control}
            render={({ field: { onChange, onBlur, value } }) => (
              <TextInput
                onChangeText={onChange}
                value={value?.toString() || ''}
                onBlur={onBlur}
                style={styles.textInput}
                placeholder="Quantity"
                placeholderTextColor={gray[400]}
                keyboardType="number-pad"
              />
            )}
          />
          <View style={styles.costBox}>
            <Text style={styles.currency}>{currencyCode}</Text>
            <Controller
              name="cost"
              control={control}
              render={({ field: { onChange, onBlur, value } }) => (
                <TextInput
                  onChangeText={onChange}
                  value={value?.toString() || ''}
                  onBlur={onBlur}
                  style={[styles.textInput, { flex: 1, marginBottom: 0 }]}
                  placeholder="Cost"
                  placeholderTextColor={gray[400]}
                  keyboardType="decimal-pad"
                />
              )}
            />
          </View>
          <View style={styles.datesContainer}>
            <Pressable
              style={styles.dateBox}
              onPress={() => {
                setDateOption(1)
                setOpenModal(true)
                Keyboard.dismiss()
              }}
            >
              <Text style={styles.dateText}>
                {format(dateBought, 'dd MMM yyyy')}
              </Text>
              <Text style={styles.dateLabels}>Date Bought</Text>
            </Pressable>
            <Pressable
              style={styles.dateBox}
              onPress={() => {
                setDateOption(2)
                setOpenModal(true)
                Keyboard.dismiss()
              }}
            >
              <Text style={styles.dateText}>
                {format(dateExpiry, 'dd MMM yyyy')}
              </Text>
              <Text style={styles.dateLabels}>Date Expiry</Text>
            </Pressable>
            <FormDateModal
              openModal={openModal}
              setOpenModal={setOpenModal}
              date={dateOption === 1 ? dateBought : dateExpiry}
              setDate={dateOption === 1 ? setDateBought : setDateExpiry}
              today={today}
              dateOption={dateOption}
              dateBought={dateBought}
              dateExpiry={dateExpiry}
            />
          </View>
        </View>
      </View>
    </TouchableWithoutFeedback>
  )
}
export default Form
const styles = StyleSheet.create({
  formContainer: {
    flex: 1,
    width: '100%',
  },
  formSpine: {
    width: '90%',
    margin: 'auto',
    // backgroundColor: blue[100],
    flex: 1,
  },
  catContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
    marginBottom: 10,
  },
  catBox: {
    width: '20%',
    aspectRatio: 1,
    backgroundColor: 'white',
    borderRadius: 12,
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 10,
  },
  catBoxSelect: {
    width: '20%',
    aspectRatio: 1,
    backgroundColor: blue[950],
    borderRadius: 12,
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 10,
  },
  catText: {
    fontFamily: bitter.Regular,
    fontSize: size.sm,
    textAlign: 'center',
    color: gray[800],
  },
  catTextSelect: {
    fontFamily: bitter.Regular,
    fontSize: size.sm,
    textAlign: 'center',
    color: 'white',
  },
  textInput: {
    fontFamily: poppins.Regular,
    fontSize: size.md,
    backgroundColor: 'white',
    borderRadius: 12,
    paddingHorizontal: 18,
    paddingVertical: 15,
    marginBottom: 10,
    color: gray[700],
  },
  costBox: {
    flexDirection: 'row',
    alignItems: 'baseline',
    backgroundColor: 'white',
    borderRadius: 12,
    marginBottom: 10,
    paddingLeft: 18,
  },
  currency: {
    fontFamily: poppins.Regular,
    fontSize: size.md,
    color: gray[700],
  },
  datesContainer: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 10,
    width: '100%',
    justifyContent: 'space-between',
  },
  dateBox: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: 'white',
    borderRadius: 12,
    paddingHorizontal: 15,
    paddingVertical: 15,
    // height: 40,
    position: 'relative',
  },
  dateLabels: {
    fontFamily: poppins.Regular,
    fontSize: size.xs,
    color: gray[700],
    textAlign: 'center',
    position: 'absolute',
    bottom: -20,
    left: 10,
  },
  dateText: {
    fontFamily: poppins.Regular,
    fontSize: size.md,
    color: gray[700],
  },
})
