import { Pressable, StyleSheet, Text } from 'react-native'
import { gray } from '@/constants/colors'
import { poppins, size } from '@/constants/fonts'
import Entypo from '@expo/vector-icons/Entypo'

type StorePlaceObj = { room: string; noun: string; direction: string }

type Props = {
  text: string
  storePlace: string
  setStorePlace: React.Dispatch<React.SetStateAction<StorePlaceObj>>
  category: 'room' | 'noun' | 'direction'
}

const Chips = ({ text, storePlace, setStorePlace, category }: Props) => {
  const formatted = text.split('_').join(' ').toUpperCase()
  return (
    <Pressable
      style={storePlace === text ? styles.selectedChip : styles.chip}
      onPress={() => setStorePlace((prev) => ({ ...prev, [category]: text }))}
    >
      <Entypo
        name="dot-single"
        size={12}
        color={storePlace === text ? gray[50] : gray[900]}
      />
      <Text
        style={storePlace === text ? styles.selectedChipText : styles.chipText}
      >
        {formatted}
      </Text>
    </Pressable>
  )
}
export default Chips
const styles = StyleSheet.create({
  chip: {
    padding: 7,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: gray[500],
    alignSelf: 'flex-start',
    flexDirection: 'row',
    alignItems: 'center',
  },
  selectedChip: {
    padding: 7,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: gray[400],
    backgroundColor: gray[900],
    alignSelf: 'flex-start',
    flexDirection: 'row',
    alignItems: 'center',
  },
  chipText: {
    fontFamily: poppins.Regular,
    fontSize: size.xs,
    color: gray[500],
  },
  selectedChipText: {
    fontFamily: poppins.Regular,
    fontSize: size.xs,
    color: gray[50],
  },
})
