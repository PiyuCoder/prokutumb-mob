import React, {useState, useEffect} from 'react';
import {useSelector} from 'react-redux';
import {axiosInstance} from '../api/axios';
import {Text, TouchableOpacity, View} from 'react-native';

const Notifications = () => {
  const userId = useSelector(state => state.auth?.user?._id);
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const response = await axiosInstance.get(
          `/api/notifications/${userId}`,
        );
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
    // Handle notification click (e.g., navigate to a user's profile or a message)
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

  if (loading) return <Text>Loading notifications...</Text>;

  return (
    <View style={{padding: 10}}>
      <Text style={{fontWeight: 'bold', fontSize: 24, color: 'black'}}>
        Notifications
      </Text>
      {notifications?.length === 0 ? (
        <Text>No notifications</Text>
      ) : (
        <View>
          {notifications.map(notification => (
            <TouchableOpacity
              key={notification._id}
              onPress={() => handleNotificationClick(notification)}
              style={{
                backgroundColor:
                  notification.status === 'unread' ? '#f0f0f0' : '#fff',
                padding: '10px',
                margin: '5px 0',
                borderRadius: '5px',
                cursor: 'pointer',
              }}>
              <Text>{notification?.message}</Text>
              {/* <button onClick={() => handleMarkAsRead(notification._id)}>
                Mark as read
              </button> */}
            </TouchableOpacity>
          ))}
        </View>
      )}
    </View>
  );
};

export default Notifications;
