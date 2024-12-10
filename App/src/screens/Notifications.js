import React, {useState, useEffect} from 'react';
import {useSelector} from 'react-redux';
import {axiosInstance} from '../api/axios';
import {Text, TouchableOpacity, View, Button, StyleSheet} from 'react-native';
import ProfilePicture from '../components/ProfilePicture';

const Notifications = ({navigation}) => {
  const userId = useSelector(state => state.auth?.user?._id);
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const response = await axiosInstance.get(
          `/api/notifications/${userId}`,
        );
        console.log(response.data);
        setNotifications(response.data);
      } catch (error) {
        console.error('Error fetching notifications:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchNotifications();
  }, [userId]);

  const handleNotificationClick = notification => {
    console.log('Notification clicked:', notification);
  };

  const handleMarkAsRead = async notificationId => {
    try {
      await axiosInstance.post(`/api/notifications/mark-as-read`, {
        notificationId,
      });
      setNotifications(prevNotifications =>
        prevNotifications.map(notification =>
          notification._id === notificationId
            ? {...notification, status: 'read'}
            : notification,
        ),
      );
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  const handleAccept = async notification => {
    try {
      console.log('Accepted request:', notification?._id);

      if (notification?.isCommunity) {
        const res = await axiosInstance.put(
          `/api/communities/accept/${notification?.communityId}`,
          {senderId: notification?.senderId},
        );

        if (res.data?.success) {
          // Find the notification index
          const notifIndex = notifications.findIndex(
            notif => notif?._id === notification?._id,
          );

          if (notifIndex !== -1) {
            // Update the specific notification
            const updatedNotifications = [...notifications];
            updatedNotifications[notifIndex] = {
              ...notifications[notifIndex],
              status: 'read', // Mark as read
            };

            // Update the state with the new notifications array
            setNotifications(updatedNotifications);
          }
        }
      }
    } catch (error) {
      console.error('Error accepting request:', error);
    }
  };

  const handleDecline = async notificationId => {
    try {
      // Handle decline logic (e.g., API call to decline the request)
      console.log('Declined request:', notificationId);
      handleMarkAsRead(notificationId);
    } catch (error) {
      console.error('Error declining request:', error);
    }
  };

  if (loading)
    return (
      <Text style={{textAlign: 'center', marginTop: 20}}>
        Loading notifications...
      </Text>
    );

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Notifications</Text>
      {notifications?.length === 0 ? (
        <Text style={styles.noNotificationsText}>No notifications</Text>
      ) : (
        <View>
          {notifications.map(notification => (
            <TouchableOpacity
              key={notification._id}
              onPress={() =>
                notification.type === 'join request' &&
                navigation.navigate('UserProfile', {
                  userId: notification.senderId._id,
                })
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
                  {/* <Text style={styles.timestamp}>
                    {new Date(notification.timestamp).toLocaleString()}
                  </Text> */}
                  {notification.type === 'join request' &&
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
          ))}
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#f8f9fa',
    flex: 1,
  },
  header: {
    fontWeight: 'bold',
    fontSize: 24,
    margin: 15,
    color: 'black',
  },
  noNotificationsText: {
    textAlign: 'center',
    color: '#6c757d',
  },
  notificationCard: {
    padding: 15,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: '#EDF3FF',
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  unreadNotification: {
    backgroundColor: '#EDF3FF',
  },
  notificationContent: {
    flex: 1,
  },
  notificationText: {
    fontSize: 16,
    marginBottom: 10,
    color: 'black',
  },
  timestamp: {
    fontSize: 12,
    color: '#6c757d',
    marginBottom: 10,
  },
  actionButtons: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
    gap: 10,
  },
  acceptButton: {
    backgroundColor: '#2E70E8',
    paddingVertical: 8,
    paddingHorizontal: 20,
    borderRadius: 5,
  },
  acceptButtonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  declineButton: {
    backgroundColor: 'white',
    paddingVertical: 8,
    paddingHorizontal: 20,
    borderRadius: 5,
    borderWidth: 1,
    borderColor: '#475569',
  },
  declineButtonText: {
    color: '#475569',
    fontWeight: 'bold',
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
export default Notifications;
