import React, {useState, useEffect} from 'react';
import {
  View,
  Button,
  Text,
  StyleSheet,
  Linking,
  ImageBackground,
} from 'react-native';

const clientId = '86dvpoievc6jdx'; // Your LinkedIn app client ID
const clientSecret = 'WPL_AP1.ItYT2qO32AOtxQV8.KPUExQ=='; // Your LinkedIn app client secret
const redirectUri = 'https://majlisserver.com/backend/auth/callback'; // Your redirect URI
const scope = 'openid profile email'; // Scopes as per documentation
const state = Math.random().toString(36).substring(2, 15); // Generate random state

// Authorization URL
const authorizationUrl = `https://www.linkedin.com/oauth/v2/authorization?response_type=code&client_id=${clientId}&redirect_uri=${encodeURIComponent(
  redirectUri,
)}&state=${state}&scope=${encodeURIComponent(scope)}`;

const LinkedInAuth = () => {
  const [accessToken, setAccessToken] = useState('');
  const [userInfo, setUserInfo] = useState(null);
  const [loading, setLoading] = useState(false);

  const loginWithLinkedIn = async () => {
    try {
      setLoading(true);
      await Linking.openURL(authorizationUrl); // Open LinkedIn login page
    } catch (error) {
      console.error('Error opening LinkedIn login:', error);
    } finally {
      setLoading(false);
    }
  };

  const extractQueryParams = url => {
    const queryParamsString = url.split('?')[1]; // Extract query string
    if (!queryParamsString) {
      return {};
    }
    return queryParamsString.split('&').reduce((params, param) => {
      const [key, value] = param.split('=');
      params[key] = decodeURIComponent(value);
      return params;
    }, {});
  };

  const fetchAllLinkedInInfo = async accessToken => {
    try {
      console.log('token in all info: ', accessToken);
      const response = await fetch(
        `https://api.linkedin.com/v1/people/~:(id,first-name,last-name,headline,picture-url,industry,summary,specialties,positions:(id,title,summary,start-date,end-date,is-current,company:(id,name,type,size,industry,ticker)),educations:(id,school-name,field-of-study,start-date,end-date,degree,activities,notes),associations,interests,num-recommenders,date-of-birth,publications:(id,title,publisher:(name),authors:(id,name),date,url,summary),patents:(id,title,summary,number,status:(id,name),office:(name),inventors:(id,name),date,url),languages:(id,language:(name),proficiency:(level,name)),skills:(id,skill:(name)),certifications:(id,name,authority:(name),number,start-date,end-date),courses:(id,name,number),recommendations-received:(id,recommendation-type,recommendation-text,recommender),honors-awards,three-current-positions,three-past-positions,volunteer)?oauth2_access_token=${accessToken}`,
        {
          headers: {
            'Content-Type': 'application/json',
            'x-li-format': 'json',
          },
        },
      );
      if (!response.ok) {
        throw new Error(`Error fetching LinkedIn data: ${response.status}`);
      }
      const data = await response.json();
      console.log('LinkedIn User Info:', data);
      setUserInfo(data);
      return data;
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const fetchUserInfo = async token => {
    try {
      const response = await fetch('https://api.linkedin.com/v2/userinfo', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const data = await response.json();
      setUserInfo(data);
    } catch (error) {
      console.error('Error fetching user info:', error);
    }
  };

  useEffect(() => {
    const handleRedirect = event => {
      if (event.url.startsWith('prokutumb://auth/callback')) {
        const params = extractQueryParams(event.url);
        console.log('This is event: ', event);
        console.log('This is params: ', params);
        const token = params.token;
        console.log('Extracted token:', token);

        if (token) {
          setAccessToken(token); // Save access token
          // fetchUserInfo(token); // Fetch user info
          fetchAllLinkedInInfo(token);
        } else {
          console.error('Access token not found in redirect URL');
        }
      }
    };

    const subscription = Linking.addEventListener('url', handleRedirect);

    Linking.getInitialURL().then(initialUrl => {
      if (initialUrl) {
        handleRedirect({url: initialUrl});
      }
    });

    return () => subscription.remove();
  }, []);

  return (
    <View style={styles.container}>
      <Button
        title={loading ? 'Logging in...' : 'Login with LinkedIn'}
        onPress={loginWithLinkedIn}
        disabled={loading}
      />
      {/* {accessToken && (
        <Text style={styles.token}>Access Token: {accessToken}</Text>
      )} */}
      {userInfo && (
        <View style={styles.userInfo}>
          <Text style={styles.userText}>User Profile Info:</Text>
          <Text>
            Name: {userInfo?.given_name} {userInfo?.family_name}
          </Text>
          <Text>Email: {userInfo.email}</Text>
          <ImageBackground
            style={{height: 30, width: 30}}
            source={{uri: userInfo?.picture}}
          />
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
