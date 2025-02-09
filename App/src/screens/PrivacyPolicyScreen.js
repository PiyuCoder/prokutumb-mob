import React from 'react';
import {View, Text, ScrollView, StyleSheet, Linking} from 'react-native';

const PrivacyPolicyScreen = () => {
  return (
    <ScrollView style={styles.container}>
      <Text style={styles.header}>Privacy Policy</Text>
      <Text style={styles.date}>Last Updated: 9th Feb 2025</Text>
      <Text style={styles.paragraph}>
        <Text style={styles.bold}>Majlis</Text> ("we," "our," or "us") is
        committed to protecting your privacy. This Privacy Policy explains how
        we collect, use, and safeguard your personal information when you use
        our AI-powered networking application ("App").
      </Text>

      <Text style={styles.sectionTitle}>1. Information We Collect</Text>
      <Text style={styles.paragraph}>
        When you use Majlis, we may collect the following types of information:
        {'\n\n'}• <Text style={styles.bold}>Personal Information:</Text> Name,
        email address, profile details, and networking preferences.
        {'\n'}• <Text style={styles.bold}>Usage Data:</Text> App interactions,
        event participation, and AI match preferences.
        {'\n'}• <Text style={styles.bold}>Device Information:</Text> IP address,
        device type, operating system version, and log data.
        {'\n'}• <Text style={styles.bold}>Location Data (Optional):</Text> If
        permitted, we may collect location data to improve networking
        recommendations.
      </Text>

      <Text style={styles.sectionTitle}>2. How We Use Your Information</Text>
      <Text style={styles.paragraph}>
        We use the collected data to:
        {'\n\n'}• Provide AI-powered networking recommendations.
        {'\n'}• Facilitate professional connections and event participation.
        {'\n'}• Improve app functionality, user experience, and security.
        {'\n'}• Prevent fraud and comply with legal requirements.
      </Text>

      <Text style={styles.sectionTitle}>3. Data Sharing and Security</Text>
      <Text style={styles.paragraph}>
        • We do not sell your personal information to third parties.
        {'\n'}• We may share limited data with trusted partners for AI matching,
        analytics, and essential app functionality.
        {'\n'}• Your data is stored securely with encryption and strict access
        controls.
      </Text>

      <Text style={styles.sectionTitle}>4. Your Rights and Choices</Text>
      <Text style={styles.paragraph}>
        • <Text style={styles.bold}>Access and Modification:</Text> You may
        review and update your profile information at any time.
        {'\n'}• <Text style={styles.bold}>Account Deletion:</Text> You can
        request account deletion by contacting our support team.
        {'\n'}• <Text style={styles.bold}>Opt-Out:</Text> Users can opt out of
        location tracking and certain AI features within the app settings.
      </Text>

      <Text style={styles.sectionTitle}>5. Third-Party Services</Text>
      <Text style={styles.paragraph}>
        Majlis may integrate with third-party services such as analytics
        providers and payment processors. These services operate independently
        and have their own privacy policies, which we encourage users to review.
      </Text>

      <Text style={styles.sectionTitle}>6. Changes to This Privacy Policy</Text>
      <Text style={styles.paragraph}>
        We may update this Privacy Policy periodically. Users will be notified
        of significant changes through the app or via email. Continued use of
        the app after policy updates constitutes acceptance of the revised
        terms.
      </Text>

      <Text style={styles.sectionTitle}>7. Contact Us</Text>
      <Text style={styles.paragraph}>
        If you have any questions regarding this Privacy Policy, please contact
        us at:
        {'\n\n'}Email: yatharthkherwork@gmail.com
        {'\n'}Website:{' '}
        <Text
          style={{color: 'blue'}}
          onPress={() => Linking.openURL('https://majlis.network')}>
          majlis.network
        </Text>
      </Text>
      <Text style={styles.paragraph}>
        {'\n'}
        This Privacy Policy is designed to comply with applicable data
        protection regulations. If you have concerns regarding data privacy,
        please reach out for further clarification.
        {'\n\n\n'}
      </Text>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#fff',
  },
  header: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 10,
    color: 'black',
  },
  date: {
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 20,
    color: 'gray',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: 20,
    marginBottom: 10,
    color: 'black',
  },
  paragraph: {
    fontSize: 16,
    lineHeight: 22,
    color: '#333',
  },
  bold: {
    fontWeight: 'bold',
    color: 'black',
  },
});

export default PrivacyPolicyScreen;
