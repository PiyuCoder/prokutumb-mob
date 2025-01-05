import {StyleSheet, Text, TouchableOpacity, View} from 'react-native';
import React, {useState} from 'react';
import LinearGradient from 'react-native-linear-gradient';
import QRCode from 'react-native-qrcode-svg';
import {useSelector} from 'react-redux';
import Octicons from 'react-native-vector-icons/Octicons';
import ProfilePicture from '../components/ProfilePicture';

const Ticket = ({navigation}) => {
  const {user} = useSelector(state => state.auth);
  const [isQR, setIsQR] = useState(true);
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
          Event Ticket
        </Text>
      </View>
      <View
        style={{
          flexDirection: 'row',
          justifyContent: 'space-around',
          marginBottom: 30,
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
        {/* <TouchableOpacity
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
        </TouchableOpacity> */}
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
            Strategy at Youtube
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
        <View>
          <Text>Scanner</Text>
        </View>
      )}
    </View>
  );
};

export default Ticket;

const styles = StyleSheet.create({});
