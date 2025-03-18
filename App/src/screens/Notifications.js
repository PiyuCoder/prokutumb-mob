import React, {useState, useEffect} from 'react';
import {useSelector} from 'react-redux';
import {axiosInstance} from '../api/axios';
import {
  Text,
  TouchableOpacity,
  View,
  StyleSheet,
  ScrollView,
  RefreshControl,
  ToastAndroid,
  ActivityIndicator,
} from 'react-native';
import ProfilePicture from '../components/ProfilePicture';
import Loader from '../components/Loader';

const Notifications = ({navigation}) => {
  const userId = useSelector(state => state.auth?.user?._id);
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false); // ✅ Added state for pull-to-refresh

  const fetchNotifications = async () => {
    setLoading(true);
    try {
      const response = await axiosInstance.get(`/api/notifications/${userId}`);
      setNotifications(response.data);
    } catch (error) {
      console.error('Error fetching notifications:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, [userId]);

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchNotifications();
    setRefreshing(false);
  };

  const handleNotificationClick = notification => {
    handleMarkAsRead(notification?._id);
    if (notification?.type === 'connection request') {
      navigation.navigate('UserProfile', {userId: notification?.senderId?._id});
    }
  };

  const handleMarkAsRead = async notificationId => {
    try {
      await axiosInstance.post(`/api/notifications/mark-as-read`, {
        notificationId,
      });
      setNotifications(prev =>
        prev.map(n => (n._id === notificationId ? {...n, status: 'read'} : n)),
      );
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  const handleAccept = async notification => {
    try {
      if (!notification?.senderId) {
        ToastAndroid.show('User not found', ToastAndroid.SHORT);
        return;
      }
      setLoading(true);
      if (notification?.type === 'join_request') {
        const res = await axiosInstance.put(
          `/api/communities/accept/${notification?.communityId}`,
          {
            senderId: notification?.senderId,
          },
        );

        if (res.data?.success) {
          setNotifications(prev =>
            prev.map(n =>
              n._id === notification?._id ? {...n, status: 'read'} : n,
            ),
          );
        }
      }
    } catch (error) {
      console.error('Error accepting request:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDecline = async notificationId => {
    try {
      console.log('Declined request:', notificationId);
      handleMarkAsRead(notificationId);
    } catch (error) {
      console.error('Error declining request:', error);
    }
  };

  return (
    <ScrollView
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
      }
      style={styles.container}>
      <Text style={styles.header}>Notifications</Text>
      <Loader isLoading={loading} />

      {notifications.length === 0 ? (
        <Text style={styles.noNotificationsText}>No notifications</Text>
      ) : (
        notifications.map(notification => (
          <TouchableOpacity
            key={notification._id}
            onPress={() =>
              notification.type === 'join_request'
                ? navigation.navigate('UserProfile', {
                    userId: notification?.senderId?._id,
                  })
                : handleNotificationClick(notification)
            }>
            <View
              style={[
                styles.notificationCard,
                notification.status === 'unread' && styles.unreadNotification,
              ]}>
              <ProfilePicture
                profilePictureUri={notification.senderId?.profilePicture}
                width={40}
                height={40}
                borderRadius={20}
                marginRight={10}
              />
              <View style={styles.notificationContent}>
                <Text style={styles.notificationText}>
                  {notification.message}
                </Text>

                {notification.type === 'join_request' &&
                  notification.status === 'unread' && (
                    <View style={styles.actionButtons}>
                      <TouchableOpacity
                        onPress={() => handleAccept(notification)}
                        style={styles.acceptButton}>
                        <Text style={styles.acceptButtonText}>Accept</Text>
                      </TouchableOpacity>
                      <TouchableOpacity
                        onPress={() => handleDecline(notification._id)}
                        style={styles.declineButton}>
                        <Text style={styles.declineButtonText}>Decline</Text>
                      </TouchableOpacity>
                    </View>
                  )}
              </View>
            </View>
          </TouchableOpacity>
        ))
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {backgroundColor: 'white', flex: 1},
  header: {fontWeight: 'bold', fontSize: 24, margin: 15, color: 'black'},
  noNotificationsText: {textAlign: 'center', color: '#6c757d'},
  notificationCard: {
    padding: 15,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: '#EDF3FF',
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  unreadNotification: {backgroundColor: '#EDF3FF'},
  notificationContent: {flex: 1},
  notificationText: {fontSize: 16, marginBottom: 10, color: 'black'},
  actionButtons: {flexDirection: 'row', justifyContent: 'flex-start', gap: 10},
  acceptButton: {
    backgroundColor: '#2E70E8',
    paddingVertical: 8,
    paddingHorizontal: 20,
    borderRadius: 5,
  },
  acceptButtonText: {color: '#fff', fontWeight: 'bold'},
  declineButton: {
    backgroundColor: 'white',
    paddingVertical: 8,
    paddingHorizontal: 20,
    borderRadius: 5,
    borderWidth: 1,
    borderColor: '#475569',
  },
  declineButtonText: {color: '#475569', fontWeight: 'bold'},
});

export default Notifications;
