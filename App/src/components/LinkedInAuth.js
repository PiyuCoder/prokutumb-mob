import React, {useState} from 'react';
import {View, Button, Text, StyleSheet} from 'react-native';
import {authorize} from 'react-native-app-auth';

// LinkedIn OAuth configuration
const config = {
  clientId: '86dvpoievc6jdx',
  clientSecret: 'WPL_AP1.ItYT2qO32AOtxQV8.KPUExQ==',
  redirectUrl: 'http://10.0.2.2:3001/auth/callback', // Replace with your redirect URL
  scopes: ['r_liteprofile', 'r_emailaddress'], // Scopes to access profile and email
  serviceConfiguration: {
    authorizationEndpoint: 'https://www.linkedin.com/oauth/v2/authorization',
    tokenEndpoint: 'https://www.linkedin.com/oauth/v2/accessToken',
  },
};

const LinkedInAuth = () => {
  const [accessToken, setAccessToken] = useState('');
  const [userInfo, setUserInfo] = useState(null);
  const [loading, setLoading] = useState(false);

  // Function to handle LinkedIn login
  const loginWithLinkedIn = async () => {
    try {
      setLoading(true);

      // Perform OAuth login
      const result = await authorize(config);

      // Get the access token
      const token = result.accessToken;
      setAccessToken(token);

      // Fetch user information using the access token
      fetchUserInfo(token);
    } catch (error) {
      console.error('LinkedIn Login Error:', error);
    } finally {
      setLoading(false);
    }
  };

  // Function to fetch user info from LinkedIn
  const fetchUserInfo = async token => {
    try {
      const response = await fetch('https://api.linkedin.com/v2/me', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const profileData = await response.json();
      setUserInfo(profileData);
    } catch (error) {
      console.error('Error fetching user info:', error);
    }
  };

  return (
    <View style={styles.container}>
      <Button
        title={loading ? 'Logging in...' : 'Login with LinkedIn'}
        onPress={loginWithLinkedIn}
        disabled={loading}
      />
      {accessToken && (
        <Text style={styles.token}>Access Token: {accessToken}</Text>
      )}
      {userInfo && (
        <View style={styles.userInfo}>
          <Text style={styles.userText}>User Profile Info:</Text>
          <Text>
            Name: {userInfo.localizedFirstName} {userInfo.localizedLastName}
          </Text>
          <Text>Headline: {userInfo.headline}</Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  token: {
    marginTop: 20,
    color: 'gray',
  },
  userInfo: {
    marginTop: 20,
    padding: 10,
    borderWidth: 1,
    borderColor: 'gray',
    width: '100%',
  },
  userText: {
    fontWeight: 'bold',
  },
});

export default LinkedInAuth;
