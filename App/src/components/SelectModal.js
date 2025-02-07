import React, {useState} from 'react';
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  FlatList,
  StyleSheet,
  TextInput,
} from 'react-native';

const SelectModal = ({visible, items, selectedItems, onClose, onSelect}) => {
  const [selected, setSelected] = useState(selectedItems);
  const [customItems, setCustomItems] = useState(items);
  const [newItem, setNewItem] = useState('');

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

  const handleAddItem = () => {
    if (newItem.trim() && !customItems.includes(newItem)) {
      setCustomItems([...customItems, newItem]); // Add new item to list
      setSelected([...selected, newItem]); // Select it automatically
      setNewItem(''); // Clear input
    }
  };

  return (
    <Modal visible={visible} transparent={true} animationType="slide">
      <View style={styles.modalContainer}>
        <View style={styles.modalContent}>
          {/* Input field to add new skills/interests */}
          <View style={styles.inputContainer}>
            <TextInput
              style={styles.input}
              placeholder="Add more..."
              value={newItem}
              onChangeText={setNewItem}
            />
            <TouchableOpacity onPress={handleAddItem} style={styles.addButton}>
              <Text style={styles.addButtonText}>Add</Text>
            </TouchableOpacity>
          </View>

          <FlatList
            data={customItems}
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
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  input: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    padding: 8,
    marginRight: 8,
  },
  addButton: {
    backgroundColor: '#007BFF',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
  },
  addButtonText: {
    color: '#fff',
    fontWeight: 'bold',
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
