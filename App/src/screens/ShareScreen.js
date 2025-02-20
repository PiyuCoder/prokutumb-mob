import {
  Alert,
  Linking,
  Modal,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import React, {useEffect, useRef, useState} from 'react';
import LinearGradient from 'react-native-linear-gradient';
import QRCode from 'react-native-qrcode-svg';
import {useSelector} from 'react-redux';
import Feather from 'react-native-vector-icons/Feather';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import {captureRef} from 'react-native-view-shot';
import Share from 'react-native-share';
import {
  Camera,
  useCameraDevice,
  useCodeScanner,
} from 'react-native-vision-camera';
// import {useScanBarcodes, BarcodeFormat} from 'vision-camera-code-scanner';

const ShareScreen = ({navigation}) => {
  const {user} = useSelector(state => state.auth);
  const [isQR, setIsQR] = useState(true);
  const [hasCameraPermission, setHasCameraPermission] = useState(false);
  const [permissionError, setPermissionError] = useState(false);
  const [lastScannedCode, setLastScannedCode] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [activeTab, setActiveTab] = useState('qr');

  const device = useCameraDevice('back');
  const qrRef = useRef();

  // Hook for barcode scanning
  // const [barcodes] = useScanBarcodes([BarcodeFormat.QR_CODE]);

  useEffect(() => {
    const checkPermissions = async () => {
      const status = await Camera.getCameraPermissionStatus();
      console.log('Initial permission status:', status);

      if (status !== 'authorized') {
        const newStatus = await Camera.requestCameraPermission();
        console.log('Updated permission status:', newStatus);

        if (newStatus === 'authorized') {
          setHasCameraPermission(true);
        } else {
          setPermissionError(true);
          // Alert.alert(
          //   'Permission Denied',
          //   'Camera access is required. Please enable it in app settings.',
          //   [
          //     {text: 'Cancel', style: 'cancel'},
          //     {text: 'Open Settings', onPress: () => Linking.openSettings()},
          //   ],
          // );
        }
      } else {
        setHasCameraPermission(true);
      }
    };

    checkPermissions();
  }, []);
  const isValidURL = str => {
    const pattern = new RegExp(
      '^(https?:\\/\\/)?' + // protocol
        '((([a-z\\d]([a-z\\d-]*[a-z\\d])*)\\.?)+[a-z]{2,}|' + // domain name
        '((\\d{1,3}\\.){3}\\d{1,3}))' + // OR ip (v4) address
        '(\\:\\d+)?(\\/[-a-z\\d%_.~+]*)*' + // port and path
        '(\\?[;&a-z\\d%_.~+=-]*)?' + // query string
        '(\\#[-a-z\\d_]*)?$',
      'i',
    );
    return !!pattern.test(str);
  };
  const handleCodeScanned = codes => {
    if (isProcessing) return; // Prevent multiple triggers
    setIsProcessing(true);

    const scannedValue = codes[0]?.value;
    if (scannedValue && scannedValue !== lastScannedCode) {
      setLastScannedCode(scannedValue);
      setModalVisible(true);
    }

    // Reset the processing state after a short delay
    setTimeout(() => {
      setIsProcessing(false);
    }, 2000);
  };

  const codeScanner = useCodeScanner({
    codeTypes: ['qr', 'ean-13'],
    onCodeScanned: handleCodeScanned,
  });

  const openLink = () => {
    if (isValidURL(lastScannedCode)) {
      Linking.openURL(lastScannedCode);
    } else {
      console.log('Not a valid URL');
    }
    setModalVisible(false);
  };

  const shareQRCode = async () => {
    try {
      const uri = await captureRef(qrRef, {
        format: 'png',
        quality: 0.9,
      });

      const shareOptions = {
        title: 'Scan this QR Code',
        message: 'Check out my profile by scanning this QR code!',
        url: uri, // Share the captured image
      };

      await Share.open(shareOptions);
    } catch (error) {
      console.error('Error sharing QR Code:', error);
    }
  };
  return (
    <View style={{flex: 1, backgroundColor: '#000000D6'}}>
      <StatusBar hidden />
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          padding: 20,
          // backgroundColor: 'white',
        }}>
        <TouchableOpacity
          style={{backgroundColor: '#333333', borderRadius: 10, padding: 5}}
          onPress={() => navigation.goBack()}>
          <Feather name="chevron-left" size={30} color="#FDB623" />
        </TouchableOpacity>
        <Text
          style={{
            color: 'white',
            fontSize: 20,
            fontWeight: '500',
            marginLeft: 40,
          }}>
          {activeTab === 'qr'
            ? 'QR Code'
            : activeTab === 'history'
            ? 'History'
            : 'Scanner'}
        </Text>
      </View>
      <View
        style={{
          position: 'absolute',
          bottom: 30,
          flexDirection: 'row',
          justifyContent: 'center',
          backgroundColor: '#333333',
          marginHorizontal: 40,
          zIndex: 20,
          borderRadius: 20,
          elevation: 5,
          gap: 100,
        }}>
        <TouchableOpacity
          activeOpacity={1}
          style={{
            alignItems: 'center',
            justifyContent: 'center',
            flex: 1,
            padding: 15,
          }}
          onPress={() => setActiveTab('qr')}>
          <MaterialIcons
            name="qr-code-2"
            size={30}
            color={activeTab !== 'qr' ? 'white' : '#FDB623'}
          />
          <Text
            style={{
              textAlign: 'center',
              color: activeTab !== 'qr' ? 'white' : '#FDB623',
            }}>
            Generate
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          activeOpacity={1}
          style={{
            flex: 1,
            padding: 5,
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: '#FDB623',
            height: 70,
            width: 70,
            borderRadius: 35,
            position: 'absolute',
            top: -35,
            alignSelf: 'center',
            elevation: 15,
            shadowColor: '#FDB623',
            shadowOffset: {width: 5, height: 5},
            shadowOpacity: 0.5,
            shadowRadius: 10,
          }}
          onPress={() => setActiveTab('scanner')}>
          <MaterialIcons name="qr-code-scanner" size={50} color="white" />
          <View style={{position: 'absolute'}}>
            <MaterialCommunityIcons
              name="line-scan"
              size={50}
              color="#333333"
            />
          </View>
        </TouchableOpacity>
        <TouchableOpacity
          activeOpacity={1}
          style={{
            flex: 1,
            padding: 5,
            alignItems: 'center',
            justifyContent: 'center',
          }}
          onPress={() => setActiveTab('history')}>
          <MaterialIcons
            name="history"
            size={30}
            color={activeTab !== 'history' ? 'white' : '#FDB623'}
          />
          <Text
            style={{
              textAlign: 'center',
              color: activeTab !== 'history' ? 'white' : '#FDB623',
            }}>
            History
          </Text>
        </TouchableOpacity>
      </View>

      {activeTab === 'qr' && (
        <>
          <View
            ref={qrRef}
            style={{
              alignItems: 'center',
              justifyContent: 'center',
              marginTop: 50,
              backgroundColor: 'white',
              padding: 30,
              marginHorizontal: 20,
              borderRadius: 20,
              elevation: 5,
              width: '60%',
              alignSelf: 'center',
            }}>
            <QRCode
              // value={`prokutumb://profile/${user?._id}`}
              value={`https://34.131.64.147/redirect.html?userId=${user?._id}`}
              size={180}
              color="black"
              backgroundColor="transparent"
            />
          </View>
          <View>
            <TouchableOpacity
              onPress={shareQRCode}
              style={{
                backgroundColor: '#A274FF',
                width: 60,
                height: 60,
                alignItems: 'center',
                justifyContent: 'center',
                borderRadius: 8,
                marginTop: 10,
                alignSelf: 'center',
              }}>
              <MaterialCommunityIcons
                name="share-variant"
                size={25}
                color="black"
              />
            </TouchableOpacity>
          </View>
        </>
      )}

      {activeTab === 'scanner' && (
        <View style={{flex: 1, justifyContent: 'center', alignItems: 'center'}}>
          {!hasCameraPermission ? (
            device ? (
              <Camera
                style={StyleSheet.absoluteFill}
                device={device}
                isActive={activeTab === 'scanner'}
                codeScanner={codeScanner}
              />
            ) : (
              <Text>Loading Camera...</Text>
            )
          ) : permissionError ? (
            <Text style={styles.centerText}>
              Permission denied. Please enable camera access in settings.
            </Text>
          ) : (
            <Text style={styles.centerText}>
              Requesting camera permission...
            </Text>
          )}
          <Modal
            visible={modalVisible}
            transparent
            animationType="slide"
            onRequestClose={() => setModalVisible(false)}>
            <View style={styles.modalContainer}>
              <View style={styles.modalContent}>
                <Text style={styles.modalTitle}>QR Code Detected</Text>
                <Text style={styles.modalText}>{lastScannedCode}</Text>
                {isValidURL(lastScannedCode) && (
                  <TouchableOpacity onPress={openLink}>
                    <Text style={styles.link}>Open Link</Text>
                  </TouchableOpacity>
                )}
                <TouchableOpacity
                  style={styles.closeButton}
                  onPress={() => setModalVisible(false)}>
                  <Text style={styles.closeButtonText}>Close</Text>
                </TouchableOpacity>
              </View>
            </View>
          </Modal>
        </View>
      )}

      {activeTab === 'history' && <View></View>}
    </View>
  );
};

export default ShareScreen;

const styles = StyleSheet.create({
  infoText: {
    fontSize: 16,
    marginBottom: 20,
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    width: '80%',
    padding: 20,
    backgroundColor: 'white',
    borderRadius: 10,
    alignItems: 'center',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  modalText: {
    fontSize: 16,
    marginBottom: 10,
    textAlign: 'center',
  },
  link: {
    color: 'blue',
    textDecorationLine: 'underline',
    fontSize: 16,
    marginBottom: 10,
  },
  closeButton: {
    backgroundColor: '#f05a5b',
    padding: 10,
    borderRadius: 5,
  },
  closeButtonText: {
    color: 'white',
    fontWeight: 'bold',
  },
});
