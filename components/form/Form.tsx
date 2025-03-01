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
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { pantryItemsInsertSchema, locations, pantryItems } from '@/db/schema'
import db from '@/db/db'
import { eq, and } from 'drizzle-orm'
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
import AddLocModal from './AddLocModal'

const categoryArray = ['food', 'hygiene', 'supplies', 'miscellaneous'] as const
type CategoryType = (typeof categoryArray)[number]

const Form = () => {
  // const { bottom } = useSafeAreaInsets()
  const pagerRef = useRef<PagerView>(null)
  const today = new Date()
  const [categorySelect, setCategorySelect] = useState<CategoryType>(
    categoryArray[0]
  )
  const [dateBought, setDateBought] = useState(today)
  const [dateExpiry, setDateExpiry] = useState(add(today, { months: 3 }))
  const [openModal, setOpenModal] = useState(false)
  const [openAddNewModal, setOpenAddNewModal] = useState(false)
  const [toAddLoc, setToAddLoc] = useState<
    'room' | 'noun' | 'direction' | undefined
  >()

  const [storeSelection, setstoreSelection] = useState({
    room: 'kitchen',
    noun: 'cabinet',
    direction: 'top',
  })
  const [dateOption, setDateOption] = useState(0)
  const { currencyCode } = getLocales()[0]

  const { data: tags } = useQuery({
    queryKey: ['tagOptions'],
    queryFn: getTagOptions,
  })
  // console.log(tags)
  const rooms = tags?.rooms ? [...tags.rooms].sort() : []
  const nouns = tags?.nouns ? [...tags.nouns].sort() : []
  const directions = tags?.directions ? [...tags.directions].sort() : []

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(pantryItemsInsertSchema),
    defaultValues: {
      name: '',
      quantity: '1',
      cost: '',
      category: 'food',
      dateBought: format(today, 'yyyy-MM-dd'),
      dateExpiry: format(today, 'yyyy-MM-dd'),
    },
    mode: 'onChange',
    reValidateMode: 'onSubmit',
  })
  console.log(storeSelection)

  const onSubmit = async (data: z.infer<typeof pantryItemsInsertSchema>) => {
    console.log(data)
    try {
      // Step 1: Check if the location already exists
      const existingLocations = await db
        .select()
        .from(locations)
        .where(
          and(
            eq(locations.room, storeSelection.room),
            eq(locations.noun, storeSelection.noun),
            eq(locations.direction, storeSelection.direction)
          )
        )

      let locationId: number

      // Step 2: If location doesn't exist, create it
      if (existingLocations.length === 0) {
        // Insert new location
        const result = await db
          .insert(locations)
          .values({
            room: storeSelection.room,
            noun: storeSelection.noun,
            direction: storeSelection.direction,
          })
          .returning({ insertedId: locations.id })

        locationId = result[0].insertedId
      } else {
        // Use existing location's ID
        locationId = existingLocations[0].id
      }

      // Step 3: Insert pantry item with the locationId
      const pantryItemData = {
        name: data.name,
        dateBought: format(dateBought, 'yyyy-MM-dd'),
        dateExpiry: format(dateExpiry, 'yyyy-MM-dd'),
        cost: data.cost || '0',
        quantity: data.quantity,
        category: categorySelect as
          | 'food'
          | 'hygiene'
          | 'supplies'
          | 'miscellaneous',
        locationId: locationId,
      }

      console.log('Inserting pantry item:', pantryItemData)

      await db.insert(pantryItems).values(pantryItemData)

      // Step 4: Success handling (reset form, navigate, etc.)
      console.log('Item added successfully!')
      reset()
      pagerRef.current?.setPage(0)
    } catch (error) {
      console.error('Error adding item:', error)
    }
  }

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
                  <View style={styles.textInputBox}>
                    <TextInput
                      onChangeText={onChange}
                      value={value}
                      onBlur={onBlur}
                      style={styles.textInput}
                      placeholder="Product Name"
                      placeholderTextColor={gray[400]}
                    />
                    {errors.name && (
                      <Text style={styles.errorMsg}>{errors.name.message}</Text>
                    )}
                  </View>
                )}
              />
              <Controller
                name="quantity"
                control={control}
                render={({ field: { onChange, onBlur, value } }) => (
                  <View style={styles.textInputBox}>
                    <TextInput
                      onChangeText={onChange}
                      value={value?.toString() || ''}
                      onBlur={onBlur}
                      style={styles.textInput}
                      placeholder="Quantity"
                      placeholderTextColor={gray[400]}
                      keyboardType="number-pad"
                    />
                    {errors.quantity && (
                      <Text style={styles.errorMsg}>
                        {errors.quantity.message}
                      </Text>
                    )}
                  </View>
                )}
              />
              <View style={styles.costBox}>
                <Text style={styles.currency}>{currencyCode}</Text>
                <Controller
                  name="cost"
                  control={control}
                  render={({ field: { onChange, onBlur, value } }) => (
                    <View
                      style={[
                        styles.textInputBox,
                        { flex: 1, marginBottom: 0 },
                      ]}
                    >
                      <TextInput
                        onChangeText={onChange}
                        value={value?.toString() || ''}
                        onBlur={onBlur}
                        style={[styles.textInput, { marginBottom: 0 }]}
                        placeholder="Cost"
                        placeholderTextColor={gray[400]}
                        keyboardType="decimal-pad"
                      />
                      {errors.cost && (
                        <Text style={styles.errorMsg}>
                          {errors.cost.message}
                        </Text>
                      )}
                    </View>
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
              </View>
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
              <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                style={[styles.navigationBtn, { right: 10 }]}
                keyboardVerticalOffset={75}
              >
                <Pressable
                  style={styles.nextBtn}
                  onPress={() => pagerRef.current?.setPage(1)}
                >
                  <Text style={styles.nextBtnTxt}>Next</Text>
                </Pressable>
              </KeyboardAvoidingView>
            </View>
          </View>
        </TouchableWithoutFeedback>
      </View>
      <View key={2} style={{ flex: 1 }}>
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
                setOpenAddNewModal={setOpenAddNewModal}
                setToAddLoc={setToAddLoc}
                selectType="room"
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
            <View style={styles.locationLabelContainer}>
              <Text
                style={[
                  styles.locationQn,
                  { fontFamily: bitter.Bold, fontSize: size.sm },
                ]}
              >
                SPOT
              </Text>
              <FormAddBtn
                setOpenAddNewModal={setOpenAddNewModal}
                setToAddLoc={setToAddLoc}
                selectType="noun"
              />
            </View>
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
            <View style={styles.locationLabelContainer}>
              <Text
                style={[
                  styles.locationQn,
                  { fontFamily: bitter.Bold, fontSize: size.sm },
                ]}
              >
                EXACTLY WHERE
              </Text>
              <FormAddBtn
                setOpenAddNewModal={setOpenAddNewModal}
                setToAddLoc={setToAddLoc}
                selectType="direction"
              />
            </View>
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
          <AddLocModal
            openAddNewModal={openAddNewModal}
            setOpenAddNewModal={setOpenAddNewModal}
            toAddLoc={toAddLoc}
          />
          <View style={[styles.navigationBtn, { left: 10 }]}>
            <Pressable
              style={styles.nextBtn}
              onPress={() => pagerRef.current?.setPage(0)}
            >
              <Text style={styles.nextBtnTxt}>Back</Text>
            </Pressable>
          </View>
          <View style={[styles.navigationBtn, { right: 10 }]}>
            <Pressable style={styles.nextBtn} onPress={handleSubmit(onSubmit)}>
              <Text style={styles.nextBtnTxt}>Submit</Text>
            </Pressable>
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
  textInputBox: {
    backgroundColor: 'white',
    borderRadius: 12,
    paddingHorizontal: 18,
    paddingTop: 17,
    paddingBottom: 12,
    marginBottom: 10,
    position: 'relative',
  },
  textInput: {
    fontFamily: poppins.Regular,
    fontSize: size.md,
    backgroundColor: 'white',
    color: gray[700],
  },
  costBox: {
    flexDirection: 'row',
    alignItems: 'baseline',
    backgroundColor: 'white',
    borderRadius: 12,
    marginBottom: 10,
    paddingLeft: 15,
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
  navigationBtn: {
    position: 'absolute',
    bottom: 40,
    flex: 1,
    flexGrow: 0,
    justifyContent: 'center',
    alignItems: 'center',
  },
  nextBtn: {
    paddingVertical: 7,
    paddingHorizontal: 16,
    borderRadius: 30,
    borderWidth: 1,
    borderColor: gray[800],
  },
  nextBtnTxt: {
    fontFamily: poppins.Regular,
    fontSize: size.lg,
    color: gray[800],
  },
  errorMsg: {
    fontFamily: poppins.Regular,
    fontSize: size.xxs,
    color: gray[800],
    position: 'absolute',
    top: 2,
    left: 15,
  },
})
