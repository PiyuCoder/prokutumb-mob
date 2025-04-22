const passwordValidator = (password, Alert) => {
  if (password.length < 6) {
    Alert.alert('Error', 'Password must be at least 6 characters long');
    return false;
  }
  if (!/\d/.test(password)) {
    Alert.alert('Error', 'Password must contain at least one number');
    return false;
  }
  if (!/[a-z]/.test(password)) {
    Alert.alert('Error', 'Password must contain at least one lowercase letter');
    return false;
  }
  if (!/[A-Z]/.test(password)) {
    Alert.alert('Error', 'Password must contain at least one uppercase letter');
    return false;
  }
  if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
    Alert.alert(
      'Error',
      'Password must contain at least one special character',
    );
    return false;
  }
  if (password.includes(' ')) {
    Alert.alert('Error', 'Password cannot contain spaces');
    return false;
  }

  return true;
};

module.exports = passwordValidator;
