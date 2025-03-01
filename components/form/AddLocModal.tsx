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
  const { control, handleSubmit, reset } = useForm<
    z.infer<typeof locationInsertSchema>
  >({
    resolver: zodResolver(locationInsertSchema),
    defaultValues: {
      room: '',
      noun: '',
      direction: '',
    },
  })

  const onSubmit = async (data: z.infer<typeof locationInsertSchema>) => {
    try {
      switch (toAddLoc) {
        case 'room':
          await db
            .insert(locations)
            .values({ ...data, noun: '', direction: '' })
          break
        case 'noun':
          await db
            .insert(locations)
            .values({ ...data, room: '', direction: '' })
          break
        case 'direction':
          await db.insert(locations).values({ ...data, room: '', noun: '' })
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
    paddingHorizontal: 10,
    // paddingVertical: 10,
  },
  textInput: {
    flex: 1,
    fontFamily: poppins.Regular,
    fontSize: size.md,
    backgroundColor: 'white',
    borderRadius: 12,
    paddingHorizontal: 18,
    paddingVertical: 15,
    color: gray[700],
  },
  submitBtn: {
    padding: 5,
    backgroundColor: gray[950],
    borderRadius: 100,
    borderColor: gray[100],
    borderWidth: 1,
  },
})
