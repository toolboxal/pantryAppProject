import { useState, useRef } from 'react'
import {
  StyleSheet,
  Text,
  View,
  TextInput,
  TouchableWithoutFeedback,
  Keyboard,
  Pressable,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from 'react-native'
import { getLocales } from 'expo-localization'
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { pantryItemsInsertSchema } from '@/db/schema'
import { gray, blue } from '@/constants/colors'
import { poppins, bitter, size } from '@/constants/fonts'
import { add, format } from 'date-fns'
import FormDateModal from './FormDateModal'
import { useQuery } from '@tanstack/react-query'
import { getTagOptions } from '@/db/seeding'
import Chips from '../UI/Chips'
import PagerView from 'react-native-pager-view'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { capitalize } from '@/utils/capitalize'
import FormAddBtn from '../UI/FormAddBtn'

const categoryArray = ['food', 'hygiene', 'supplies', 'miscellaneous']

const Form = () => {
  const { bottom } = useSafeAreaInsets()
  const pagerRef = useRef<PagerView>(null)
  const today = new Date()
  const [categorySelect, setCategorySelect] = useState(categoryArray[0])
  const [dateBought, setDateBought] = useState(today)
  const [dateExpiry, setDateExpiry] = useState(add(today, { months: 3 }))
  const [openModal, setOpenModal] = useState(false)
  const [openAddNewModal, setOpenAddNewModal] = useState(false)

  const [storeSelection, setstoreSelection] = useState({
    room: 'kitchen',
    noun: 'cabinet',
    direction: 'top',
  })
  const [dateOption, setDateOption] = useState(0)
  const { currencyCode } = getLocales()[0]

  const {
    data: tags,
    isLoading,
    refetch,
  } = useQuery({
    queryKey: ['tagOptions'],
    queryFn: getTagOptions,
  })
  // console.log(tags)
  const rooms = tags?.rooms ? [...tags.rooms].sort() : []
  const nouns = tags?.nouns ? [...tags.nouns].sort() : []
  const directions = tags?.directions ? [...tags.directions].sort() : []

  const { control, handleSubmit } = useForm({
    resolver: zodResolver(pantryItemsInsertSchema),
  })
  console.log(storeSelection)

  return (
    <PagerView ref={pagerRef} initialPage={0} style={{ flex: 1 }}>
      <View key={1}>
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
              <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                style={styles.keyboardAvoidView}
                keyboardVerticalOffset={75}
              >
                <Pressable
                  style={styles.nextBtn}
                  onPress={() => pagerRef.current?.setPage(1)}
                >
                  <Text style={styles.nextBtnTxt}>NEXT</Text>
                </Pressable>
              </KeyboardAvoidingView>
            </View>
          </View>
        </TouchableWithoutFeedback>
      </View>
      <View key={2}>
        <View style={styles.formSpine}>
          <View style={styles.locationContainer}>
            <Text style={styles.locationQn}>
              Where do you want to store this item?
            </Text>
            <Text style={styles.locationQn}>{`${capitalize(
              storeSelection.room
            )}, ${capitalize(storeSelection.direction)} ${capitalize(
              storeSelection.noun
            )}`}</Text>
            <View style={styles.locationLabelContainer}>
              <Text
                style={[
                  styles.locationQn,
                  { fontFamily: bitter.Bold, fontSize: size.sm },
                ]}
              >
                ROOM
              </Text>
              <FormAddBtn
                selectType={'room'}
                setOpenAddNewModal={setOpenAddNewModal}
              />
            </View>
            <View style={styles.chipsContainer}>
              {rooms.map((room) => {
                return (
                  <Chips
                    text={room}
                    key={room}
                    storePlace={storeSelection.room}
                    setStorePlace={setstoreSelection}
                    category={'room'}
                  />
                )
              })}
            </View>
          </View>
          <View style={styles.locationContainer}>
            <Text
              style={[
                styles.locationQn,
                { fontFamily: bitter.Bold, fontSize: size.sm },
              ]}
            >
              SPOT
            </Text>
            <View style={styles.chipsContainer}>
              {nouns.map((noun) => {
                const formatted = noun.split('_').join(' ').toUpperCase()
                return (
                  <Chips
                    text={noun}
                    key={noun}
                    storePlace={storeSelection.noun}
                    setStorePlace={setstoreSelection}
                    category={'noun'}
                  />
                )
              })}
            </View>
          </View>
          <View style={styles.locationContainer}>
            <Text
              style={[
                styles.locationQn,
                { fontFamily: bitter.Bold, fontSize: size.sm },
              ]}
            >
              EXACTLY WHERE
            </Text>
            <View style={styles.chipsContainer}>
              {directions.map((direction) => {
                const formatted = direction.split('_').join(' ').toUpperCase()
                return (
                  <Chips
                    text={direction}
                    key={direction}
                    storePlace={storeSelection.direction}
                    setStorePlace={setstoreSelection}
                    category={'direction'}
                  />
                )
              })}
            </View>
          </View>
        </View>
      </View>
    </PagerView>
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
    // backgroundColor: blue[50],
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
  locationContainer: {
    marginTop: 20,
  },
  locationQn: {
    fontFamily: bitter.Regular,
    fontSize: size.md,
    color: gray[700],
    marginBottom: 8,
  },
  locationLabelContainer: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 7,
    marginBottom: 5,
  },
  chipsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 5,
  },
  keyboardAvoidView: {
    position: 'absolute',
    bottom: 40,
    right: 10,
  },
  nextBtn: {
    paddingVertical: 8,
    paddingHorizontal: 15,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: gray[800],
  },
  nextBtnTxt: {
    fontFamily: poppins.Regular,
    fontSize: size.lg,
    color: gray[800],
  },
})
