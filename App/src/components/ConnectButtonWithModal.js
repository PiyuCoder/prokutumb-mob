import React, {useState} from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Modal,
  TextInput,
  StyleSheet,
  ImageBackground,
} from 'react-native';
import AntDesign from 'react-native-vector-icons/AntDesign';

const ConnectButtonWithModal = () => {
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [reason, setReason] = useState('');

  const openModal = () => setIsModalVisible(true);
  const closeModal = () => setIsModalVisible(false);

  const handleConnect = () => {
    // Add your connect logic here
    closeModal();
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity style={styles.connectBtn} onPress={openModal}>
        <Text style={styles.connectBtnText}>Add Friend</Text>
      </TouchableOpacity>

      <Modal
        visible={isModalVisible}
        transparent={true}
        animationType="slide"
        onRequestClose={closeModal}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <TouchableOpacity
              style={styles.modalCancelButton}
              onPress={closeModal}>
              <AntDesign name="close" size={30} color="#333" />
            </TouchableOpacity>
            <View style={styles.earthIconWrapper}>
              <ImageBackground
                style={styles.imageBackground}
                imageStyle={styles.imageBackgroundImage}
                source={require('../assets/majlis-earth.png')}
              />
            </View>
            <Text style={styles.modalTitle}>MajlisAI</Text>

            <View
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                gap: 10,
                marginTop: 20,
              }}>
              <View style={{height: 40, width: 40}}>
                <ImageBackground
                  style={styles.imageBackground}
                  imageStyle={styles.imageBackgroundImage}
                  source={require('../assets/majlis-earth.png')}
                />
              </View>
              <Text style={{fontSize: 18, fontWeight: 'bold', color: 'black'}}>
                Why to Connect:
              </Text>
            </View>
            <View style={{flexDirection: 'row', alignItems: 'center', gap: 10}}>
              <View style={{height: 40, width: 40}}>
                <ImageBackground
                  style={styles.imageBackground}
                  imageStyle={styles.imageBackgroundImage}
                  source={require('../assets/majlis-earth.png')}
                />
              </View>
              <Text style={{fontSize: 18, fontWeight: '400', color: 'black'}}>
                Reason to Connect
              </Text>
            </View>

            <TouchableOpacity
              style={[styles.connectBtn, {position: 'absolute', bottom: 20}]}
              onPress={handleConnect}>
              <Text style={styles.modalButtonText}>Connect</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
  },
  connectBtn: {
    backgroundColor: '#A274FF',
    width: '85%',
    paddingVertical: 5,
    borderRadius: 25,
    marginTop: 15,
    alignItems: 'center',
    alignSelf: 'center',
  },
  connectBtnText: {
    color: 'white',
    fontWeight: '500',
    fontSize: 15,
    textAlign: 'center',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.1)',
    justifyContent: 'flex-end',
  },
  earthIconWrapper: {
    height: 70,
    width: 70,
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'center',
  },
  imageBackground: {
    height: '100%',
    width: '100%',
  },
  imageBackgroundImage: {
    resizeMode: 'contain', // Ensures the entire image is visible without cropping
  },
  modalContainer: {
    height: '70%',
    backgroundColor: '#FFF',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 15,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
    textAlign: 'center',
    color: '#A274FF',
  },
  input: {
    borderWidth: 1,
    borderColor: '#CCC',
    borderRadius: 5,
    padding: 10,
    marginBottom: 20,
  },
  modalButton: {
    backgroundColor: '#007BFF',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 5,
    alignItems: 'center',
    marginBottom: 10,
  },
  modalButtonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  modalCancelButton: {
    alignSelf: 'flex-end',
    position: 'absolute',
    top: 20,
    right: 20,
  },
  modalCancelButtonText: {
    color: '#333',
    fontSize: 16,
  },
});

export default ConnectButtonWithModal;
