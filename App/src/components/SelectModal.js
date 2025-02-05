import React, {useState} from 'react';
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  FlatList,
  StyleSheet,
} from 'react-native';

const SelectModal = ({visible, items, selectedItems, onClose, onSelect}) => {
  const [selected, setSelected] = useState(selectedItems);

  const toggleSelect = item => {
    if (selected.includes(item)) {
      setSelected(selected.filter(i => i !== item));
    } else {
      setSelected([...selected, item]);
    }
  };

  const handleDone = () => {
    onSelect(selected);
    onClose();
  };

  return (
    <Modal visible={visible} transparent={true} animationType="slide">
      <View style={styles.modalContainer}>
        <View style={styles.modalContent}>
          <FlatList
            data={items}
            keyExtractor={item => item}
            renderItem={({item}) => (
              <TouchableOpacity
                onPress={() => toggleSelect(item)}
                style={styles.item}>
                <Text
                  style={
                    selected.includes(item) ? styles.selectedText : styles.text
                  }>
                  {item}
                </Text>
              </TouchableOpacity>
            )}
          />
          <TouchableOpacity onPress={handleDone} style={styles.doneButton}>
            <Text style={styles.doneText}>Done</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    width: '80%',
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 20,
  },
  item: {
    padding: 10,
  },
  text: {
    fontSize: 16,
    color: 'black',
  },
  selectedText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#A274FF',
  },
  doneButton: {
    marginTop: 20,
    alignItems: 'center',
  },
  doneText: {
    fontSize: 18,
    color: '#A274FF',
  },
});

export default SelectModal;
