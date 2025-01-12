import {
  Alert,
  Linking,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import React, {useEffect, useState} from 'react';
import LinearGradient from 'react-native-linear-gradient';
import QRCode from 'react-native-qrcode-svg';
import {useSelector} from 'react-redux';
import Octicons from 'react-native-vector-icons/Octicons';
import ProfilePicture from '../components/ProfilePicture';
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
  const [qrCode, setQRCode] = useState(null);

  const device = useCameraDevice('back');

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
  const codeScanner = useCodeScanner({
    codeTypes: ['qr', 'ean-13'],
    onCodeScanned: codes => {
      if (isProcessing) return; // Prevent multiple alerts for the same QR
      setIsProcessing(true);

      const scannedValue = codes[0]?.value;
      if (scannedValue && scannedValue !== lastScannedCode) {
        setLastScannedCode(scannedValue);

        // Check if it's a valid URL
        if (isValidURL(scannedValue)) {
          Alert.alert('QR Code Detected', `Open Link: ${scannedValue}`, [
            {text: 'Cancel'},
            {
              text: 'Open',
              onPress: () => Linking.openURL(scannedValue),
            },
          ]);
        } else {
          Alert.alert('QR Code Detected', `Data: ${scannedValue}`);
        }
      }

      // Reset after a short delay
      setTimeout(() => {
        setIsProcessing(false);
      }, 2000); // 2-second cooldown to prevent multiple detections
    },
  });

  // Handle QR code detection
  // useEffect(() => {
  //   if (barcodes.length > 0) {
  //     const scannedQRCode = barcodes[0].content.data;
  //     Alert.alert('QR Code Detected', `Data: ${scannedQRCode}`, [{text: 'OK'}]);
  //   }
  // }, [barcodes]);

  // const handleQRCodeDetected = e => {
  //   setQRCode(e.data);
  //   Alert.alert('QR Code Scanned', `QR Code: ${e.data}`);
  // };
  return (
    <View style={{flex: 1, backgroundColor: '#E9E5DF'}}>
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          padding: 10,
          backgroundColor: 'white',
        }}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Octicons name="arrow-left" size={30} color="black" />
        </TouchableOpacity>
        <Text
          style={{
            color: 'black',
            fontSize: 20,
            fontWeight: '500',
            marginLeft: 40,
          }}>
          Majlis QR Code
        </Text>
      </View>
      <View
        style={{
          flexDirection: 'row',
          justifyContent: 'space-around',
          marginBottom: isQR ? 30 : 0,
        }}>
        <TouchableOpacity
          activeOpacity={1}
          style={{
            borderBottomWidth: isQR ? 2 : 0,
            borderColor: '#A274FF',
            flex: 1,
            padding: 5,
            backgroundColor: 'white',
          }}
          onPress={() => setIsQR(true)}>
          <Text
            style={{textAlign: 'center', color: !isQR ? 'black' : '#A274FF'}}>
            My Code
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          activeOpacity={1}
          style={{
            borderBottomWidth: !isQR ? 2 : 0,
            borderColor: '#A274FF',
            flex: 1,
            padding: 5,
            backgroundColor: 'white',
          }}
          onPress={() => setIsQR(false)}>
          <Text
            style={{textAlign: 'center', color: isQR ? 'black' : '#A274FF'}}>
            Scanner
          </Text>
        </TouchableOpacity>
      </View>

      {isQR ? (
        <View
          style={{
            alignItems: 'center',
            marginTop: 50,
            backgroundColor: 'white',
            padding: 30,
            marginHorizontal: 20,
            borderRadius: 20,
            elevation: 5,
          }}>
          <View style={{marginTop: -70}}>
            <ProfilePicture
              profilePictureUri={user?.profilePicture}
              height={80}
              width={80}
              borderRadius={40}
              borderWidth={1}
            />
          </View>
          <Text
            style={{
              color: 'black',
              fontSize: 17,
              fontWeight: '500',
            }}>
            {user?.name}
          </Text>
          <Text
            style={{
              marginBottom: 20,
              color: 'grey',
            }}>
            {user?.bio}
          </Text>
          <QRCode
            // value={`prokutumb://profile/${user?._id}`}
            value={`https://prokutumb-mob.onrender.com/redirect.html?userId=${user?._id}`}
            size={180}
            color="black"
            backgroundColor="transparent"
          />
        </View>
      ) : (
        <View style={{flex: 1, justifyContent: 'center', alignItems: 'center'}}>
          {!hasCameraPermission ? (
            device ? (
              <Camera
                style={StyleSheet.absoluteFill}
                device={device}
                isActive={!isQR}
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
        </View>
      )}
    </View>
  );
};

export default ShareScreen;

const styles = StyleSheet.create({});
