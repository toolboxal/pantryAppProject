import {
  StyleSheet,
  Text,
  View,
  Modal,
  Pressable,
  TextInput,
  KeyboardAvoidingView,
  Platform,
} from 'react-native'
import { Controller, useForm } from 'react-hook-form'
import { gray } from '@/constants/colors'
import { poppins, size } from '@/constants/fonts'
import AntDesign from '@expo/vector-icons/AntDesign'
import { capitalize } from '@/utils/capitalize'
import { locationInsertSchema } from '@/db/schema'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import db from '@/db/db'
import { locations } from '@/db/schema'
import { useQueryClient } from '@tanstack/react-query'
import { eq } from 'drizzle-orm'

type Props = {
  openAddNewModal: boolean
  setOpenAddNewModal: React.Dispatch<React.SetStateAction<boolean>>
  toAddLoc: 'room' | 'noun' | 'direction' | undefined
}
const AddLocModal = ({
  openAddNewModal,
  setOpenAddNewModal,
  toAddLoc,
}: Props) => {
  const queryClient = useQueryClient()
  const {
    control,
    handleSubmit,
    reset,
    setError,
    formState: { errors },
  } = useForm<z.infer<typeof locationInsertSchema>>({
    resolver: zodResolver(locationInsertSchema),
    defaultValues: {
      room: '',
      noun: '',
      direction: '',
    },
  })

  const formatInput = (input: string): string => {
    return input.toLowerCase().replace(/\s+/g, '_')
  }

  const onSubmit = async (data: z.infer<typeof locationInsertSchema>) => {
    if (data[toAddLoc!] === '') {
      console.log('cannot be empty field')
      setError(toAddLoc!, { type: 'min', message: 'cannot be empty' })
      return
    } else if (data[toAddLoc!].length > 15) {
      console.log('too long!!!!')
      setError(toAddLoc!, { type: 'max', message: 'exceed 15 characters' })
      return
    }

    // Format the input data
    const formattedValue = formatInput(data[toAddLoc!])
    // Update the data object with the formatted value
    data = {
      ...data,
      [toAddLoc!]: formattedValue,
    }

    // Query to check if a location with the same value already exists
    const existingLocations = await db
      .select()
      .from(locations)
      .where(eq(locations[toAddLoc!], data[toAddLoc!]))

    // If any matching records are found, show an error
    if (existingLocations.length > 0) {
      console.log('Duplicate found:', data[toAddLoc!])
      setError(toAddLoc!, {
        type: 'duplicate',
        message: `This ${
          toAddLoc === 'room'
            ? 'room'
            : toAddLoc === 'noun'
            ? 'spot'
            : 'direction'
        } already exists`,
      })
      return
    }

    console.log(data)
    try {
      switch (toAddLoc) {
        case 'room':
          await db
            .insert(locations)
            .values({ ...data, noun: 'none', direction: 'none' })
          break
        case 'noun':
          await db
            .insert(locations)
            .values({ ...data, room: 'none', direction: 'none' })
          break
        case 'direction':
          await db
            .insert(locations)
            .values({ ...data, room: 'none', noun: 'none' })
          break
        default:
          console.error(`Unexpected location type: ${toAddLoc}`)
      }
      // Invalidate and refetch tagOptions query
      await queryClient.invalidateQueries({ queryKey: ['tagOptions'] })
      reset()
      setOpenAddNewModal(false)
    } catch (error) {
      console.error('Error submitting form:', error)
    }
  }

  const placeholderTxt =
    toAddLoc === 'noun'
      ? 'create a new spot'
      : toAddLoc === 'room'
      ? 'create a new room'
      : 'exactly where?'
  return (
    <Modal
      animationType="none"
      transparent={true}
      visible={openAddNewModal}
      onRequestClose={() => setOpenAddNewModal(false)}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
        keyboardVerticalOffset={0}
      >
        <Pressable
          style={styles.overlay}
          onPress={() => setOpenAddNewModal(false)}
        >
          <Pressable
            onPress={(e) => e.stopPropagation()}
            style={styles.InputContainer}
          >
            <Controller
              name={toAddLoc!}
              control={control}
              render={({ field: { onChange, onBlur, value } }) => (
                <TextInput
                  onChangeText={onChange}
                  value={value}
                  onBlur={onBlur}
                  style={styles.textInput}
                  placeholder={capitalize(placeholderTxt)}
                  placeholderTextColor={gray[400]}
                  autoFocus={true}
                />
              )}
            />
            <Pressable
              style={styles.submitBtn}
              onPress={handleSubmit(onSubmit)}
            >
              <AntDesign name="arrowright" size={24} color={gray[100]} />
            </Pressable>
            {errors[toAddLoc!] && (
              <Text style={styles.errorText}>
                {errors[toAddLoc!]?.message?.toString()}
              </Text>
            )}
          </Pressable>
        </Pressable>
      </KeyboardAvoidingView>
    </Modal>
  )
}
export default AddLocModal
const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  InputContainer: {
    backgroundColor: 'white',
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 15,
    paddingHorizontal: 12,
  },
  textInput: {
    flex: 1,
    fontFamily: poppins.Regular,
    fontSize: size.md,
    backgroundColor: 'white',
    borderRadius: 12,
    paddingHorizontal: 18,
    paddingBottom: 15,
    paddingTop: 20,
    color: gray[700],
    position: 'relative',
  },
  submitBtn: {
    padding: 5,
    backgroundColor: gray[950],
    borderRadius: 100,
    borderColor: gray[100],
    borderWidth: 1,
  },
  errorText: {
    fontFamily: poppins.Regular,
    fontSize: size.xs,
    position: 'absolute',
    top: 2,
    left: 30,
    color: gray[900],
  },
})
