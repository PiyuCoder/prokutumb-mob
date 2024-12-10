import React, {useState, useEffect} from 'react';
import {useSelector} from 'react-redux';
import {axiosInstance} from '../api/axios';
import {Text, TouchableOpacity, View, Button} from 'react-native';

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
    <View style={{padding: 15, backgroundColor: '#f8f9fa', flex: 1}}>
      <Text style={{fontWeight: 'bold', fontSize: 24, marginBottom: 15}}>
        Notifications
      </Text>
      {notifications?.length === 0 ? (
        <Text style={{textAlign: 'center', color: '#6c757d'}}>
          No notifications
        </Text>
      ) : (
        <View>
          {notifications.map(notification => (
            <View
              key={notification._id}
              style={{
                backgroundColor:
                  notification.status === 'unread' ? '#e9ecef' : '#fff',
                padding: 15,
                marginBottom: 10,
                borderRadius: 10,
                shadowColor: '#000',
                shadowOffset: {width: 0, height: 2},
                shadowOpacity: 0.1,
                shadowRadius: 5,
                elevation: 3,
              }}>
              <Text style={{fontSize: 16, marginBottom: 10}}>
                {notification?.message}
              </Text>
              {notification.type === 'join request' &&
                notification.status !== 'read' && (
                  <View
                    style={{
                      flexDirection: 'row',
                      justifyContent: 'space-between',
                    }}>
                    <TouchableOpacity
                      onPress={() => handleAccept(notification)}
                      style={{
                        backgroundColor: '#28a745',
                        paddingVertical: 8,
                        paddingHorizontal: 20,
                        borderRadius: 5,
                      }}>
                      <Text style={{color: '#fff', fontWeight: 'bold'}}>
                        Accept
                      </Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      onPress={() => handleDecline(notification._id)}
                      style={{
                        backgroundColor: '#dc3545',
                        paddingVertical: 8,
                        paddingHorizontal: 20,
                        borderRadius: 5,
                      }}>
                      <Text style={{color: '#fff', fontWeight: 'bold'}}>
                        Decline
                      </Text>
                    </TouchableOpacity>
                  </View>
                )}
            </View>
          ))}
        </View>
      )}
    </View>
  );
};

export default Notifications;
