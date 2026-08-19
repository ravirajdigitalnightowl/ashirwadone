import React, { useState, useContext } from 'react';
import { View, Text, TextInput, TouchableOpacity, SafeAreaView, KeyboardAvoidingView, Platform, StyleSheet, Alert, ActivityIndicator } from 'react-native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { ThemeContext } from '../../context/ThemeContext';
import { ThemeColors } from '../../theme/colors';

// AuthContext Import
import { AuthContext } from '../../context/AuthContext';

const LoginScreen: React.FC<{ navigation: any }> = ({ navigation }) => {
  const { theme } = useContext(ThemeContext);
  const styles = getStyles(theme);
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false); 

  const { login } = useContext(AuthContext);

  const handleLogin = async () => {
    const trimmedEmail = email.toLowerCase().trim();

    // 1. Check karo ki input theek se trim ho raha hai ya nahi
    console.log('--- LOGIN ATTEMPT ---');
    console.log('Email:', trimmedEmail);
    console.log('Password length:', password.length);

    if (!trimmedEmail || !password) {
      console.log('Validation Failed: Empty email or password');
      Alert.alert('Validation Error', 'Please enter both email and password.');
      return;
    }

    setIsSubmitting(true);

    try {
      console.log('Calling login function from AuthContext...');
      
      await login(trimmedEmail, password);
      
      // 2. Agar success hua toh ye log print hoga
      console.log('✅ Login Successful! AuthContext state should update now.');
      
    } catch (error: any) {
      // 3. Error ki poori kundli yahan print hogi
      console.log('❌ Login Error Caught in Component:');
      console.log('Full Error Object:', error);
      console.log('Error Response Data:', error.response?.data);
      console.log('Error Status:', error.response?.status);

      const errorMessage = error.response?.data?.message || 'Login failed. Please try again.';
      Alert.alert('Login Failed', errorMessage);
    } finally {
      console.log('--- LOGIN FLOW FINISHED ---');
      setIsSubmitting(false); 
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.content}>
        
        <View style={styles.header}>
          <Text style={styles.title}>Welcome Back</Text>
          <Text style={styles.subtitle}>Login to Ashirwad Society</Text>
        </View>

        <View style={styles.form}>
          {/* Email Input */}
          <View style={styles.inputContainer}>
            <MaterialCommunityIcons name="email-outline" size={20} color={theme.iconMuted} style={styles.inputIcon} />
            <TextInput
              style={styles.input}
              placeholder="Email Address"
              placeholderTextColor={theme.textMuted}
              autoCapitalize="none"
              keyboardType="email-address"
              value={email}
              onChangeText={setEmail}
              editable={!isSubmitting} 
            />
          </View>

          {/* Password Input */}
          <View style={styles.inputContainer}>
            <MaterialCommunityIcons name="lock-outline" size={20} color={theme.iconMuted} style={styles.inputIcon} />
            <TextInput
              style={styles.input}
              placeholder="Password"
              placeholderTextColor={theme.textMuted}
              secureTextEntry={!showPassword}
              value={password}
              onChangeText={setPassword}
              editable={!isSubmitting}
            />
            <TouchableOpacity onPress={() => setShowPassword(!showPassword)} style={styles.eyeIcon}>
              <MaterialCommunityIcons name={showPassword ? "eye-off-outline" : "eye-outline"} size={20} color={theme.iconMuted} />
            </TouchableOpacity>
          </View>

          {/* Submit Button */}
          <TouchableOpacity 
            activeOpacity={0.8} 
            style={[styles.button, isSubmitting && { opacity: 0.7 }]} 
            onPress={handleLogin}
            disabled={isSubmitting} 
          >
            {isSubmitting ? (
              <ActivityIndicator color="#FFFFFF" size="small" />
            ) : (
              <Text style={styles.buttonText}>LOGIN</Text>
            )}
          </TouchableOpacity>
        </View>

      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const getStyles = (theme: ThemeColors) => StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.background },
  content: { flex: 1, padding: 24, justifyContent: 'center' },
  header: { marginBottom: 40 },
  title: { fontSize: 32, fontWeight: '800', color: theme.textMain, marginBottom: 8 },
  subtitle: { fontSize: 16, color: theme.textMuted },
  form: { marginBottom: 30 },
  inputContainer: { flexDirection: 'row', alignItems: 'center', backgroundColor: theme.surface, borderRadius: 12, borderWidth: 1, borderColor: theme.border, marginBottom: 16, paddingHorizontal: 16 },
  inputIcon: { marginRight: 12 },
  input: { flex: 1, paddingVertical: Platform.OS === 'ios' ? 16 : 12, fontSize: 16, color: theme.textMain },
  eyeIcon: { padding: 8 },
  button: { backgroundColor: theme.primary, padding: 18, borderRadius: 12, alignItems: 'center', justifyContent: 'center', height: 60 },
  buttonText: { color: '#FFFFFF', fontSize: 16, fontWeight: 'bold' }
});

export default LoginScreen;