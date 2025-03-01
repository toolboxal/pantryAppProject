import { Pressable, StyleSheet, Text, View } from 'react-native'
import MaterialIcons from '@expo/vector-icons/MaterialIcons'
import { gray } from '@/constants/colors'

type Props = {
  setOpenAddNewModal: React.Dispatch<React.SetStateAction<boolean>>
  setToAddLoc: React.Dispatch<
    React.SetStateAction<'room' | 'noun' | 'direction' | undefined>
  >
  selectType: 'room' | 'noun' | 'direction'
}

const FormAddBtn = ({ setOpenAddNewModal, setToAddLoc, selectType }: Props) => {
  return (
    <Pressable
      style={styles.addBtn}
      onPress={() => {
        setOpenAddNewModal(true)
        setToAddLoc(selectType)
      }}
    >
      <MaterialIcons name="add" size={15} color={gray[900]} />
    </Pressable>
  )
}
export default FormAddBtn
const styles = StyleSheet.create({
  addBtn: {
    padding: 2,
    borderColor: gray[900],
    borderWidth: 1,
    borderRadius: 100,
  },
})
