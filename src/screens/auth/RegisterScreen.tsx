import React, { useState, useContext } from 'react';
import { View, Text, TextInput, TouchableOpacity, SafeAreaView, KeyboardAvoidingView, Platform, StyleSheet, ScrollView } from 'react-native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { ThemeContext } from '../../context/ThemeContext';
import { ThemeColors } from '../../theme/colors';

// AuthContext Import
import { AuthContext } from '../../context/AuthContext';

interface Props { navigation: any; }

const RegisterScreen: React.FC<Props> = ({ navigation }) => {
  const { theme } = useContext(ThemeContext);
  const styles = getStyles(theme);
  
  const [formData, setFormData] = useState({ name: '', email: '', phone: '', flatNo: '', password: '' });
  const [showPassword, setShowPassword] = useState(false);

  // Context se login function le rahe hain
  const { login } = useContext(AuthContext);

  const handleRegister = () => {
    console.log('Registering:', formData);
    // Yahan API aayegi baad mein. Abhi testing ke liye direct Resident role assign kar rahe hain.
    login('RESIDENT');
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          
          <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
            <MaterialCommunityIcons name="arrow-left" size={28} color={theme.textMain} />
          </TouchableOpacity>

          <View style={styles.header}>
            <Text style={styles.title}>Create Account</Text>
            <Text style={styles.subtitle}>Join your society network</Text>
          </View>

          <View style={styles.form}>
            {/* Full Name */}
            <View style={styles.inputContainer}>
              <MaterialCommunityIcons name="account-outline" size={20} color={theme.iconMuted} style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="Full Name"
                placeholderTextColor={theme.textMuted}
                value={formData.name}
                onChangeText={(text) => setFormData({ ...formData, name: text })}
              />
            </View>

            {/* Email */}
            <View style={styles.inputContainer}>
              <MaterialCommunityIcons name="email-outline" size={20} color={theme.iconMuted} style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="Email Address"
                placeholderTextColor={theme.textMuted}
                keyboardType="email-address"
                autoCapitalize="none"
                value={formData.email}
                onChangeText={(text) => setFormData({ ...formData, email: text })}
              />
            </View>

            {/* Phone */}
            <View style={styles.inputContainer}>
              <MaterialCommunityIcons name="phone-outline" size={20} color={theme.iconMuted} style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="Phone Number"
                placeholderTextColor={theme.textMuted}
                keyboardType="phone-pad"
                value={formData.phone}
                onChangeText={(text) => setFormData({ ...formData, phone: text })}
              />
            </View>

            {/* Flat Number */}
            <View style={styles.inputContainer}>
              <MaterialCommunityIcons name="home-outline" size={20} color={theme.iconMuted} style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="Flat/Villa No. (e.g. A-101)"
                placeholderTextColor={theme.textMuted}
                value={formData.flatNo}
                onChangeText={(text) => setFormData({ ...formData, flatNo: text })}
              />
            </View>

            {/* Password */}
            <View style={styles.inputContainer}>
              <MaterialCommunityIcons name="lock-outline" size={20} color={theme.iconMuted} style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="Password"
                placeholderTextColor={theme.textMuted}
                secureTextEntry={!showPassword}
                value={formData.password}
                onChangeText={(text) => setFormData({ ...formData, password: text })}
              />
              <TouchableOpacity onPress={() => setShowPassword(!showPassword)} style={styles.eyeIcon}>
                <MaterialCommunityIcons name={showPassword ? "eye-off-outline" : "eye-outline"} size={20} color={theme.iconMuted} />
              </TouchableOpacity>
            </View>

            <TouchableOpacity activeOpacity={0.8} style={styles.button} onPress={handleRegister}>
              <Text style={styles.buttonText}>REGISTER</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.footer}>
            <Text style={styles.footerText}>Already have an account? </Text>
            <TouchableOpacity onPress={() => navigation.goBack()}>
              <Text style={styles.linkText}>Login</Text>
            </TouchableOpacity>
          </View>

        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const getStyles = (theme: ThemeColors) => StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.background },
  scrollContent: { flexGrow: 1, padding: 24, paddingBottom: 40 },
  backBtn: { marginBottom: 20, alignSelf: 'flex-start' },
  header: { marginBottom: 30 },
  title: { fontSize: 32, fontWeight: '800', color: theme.textMain, marginBottom: 8 },
  subtitle: { fontSize: 16, color: theme.textMuted },
  form: { marginBottom: 20 },
  inputContainer: { flexDirection: 'row', alignItems: 'center', backgroundColor: theme.surface, borderRadius: 12, borderWidth: 1, borderColor: theme.border, marginBottom: 16, paddingHorizontal: 16 },
  inputIcon: { marginRight: 12 },
  input: { flex: 1, paddingVertical: Platform.OS === 'ios' ? 16 : 12, fontSize: 16, color: theme.textMain },
  eyeIcon: { padding: 8 },
  button: { backgroundColor: theme.primary, padding: 18, borderRadius: 12, alignItems: 'center', marginTop: 10, shadowColor: theme.primary, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 8, elevation: 5 },
  buttonText: { color: '#FFFFFF', fontSize: 16, fontWeight: 'bold', letterSpacing: 1 },
  footer: { flexDirection: 'row', justifyContent: 'center', marginTop: 10 },
  footerText: { color: theme.textMuted, fontSize: 15 },
  linkText: { color: theme.primary, fontSize: 15, fontWeight: 'bold' }
});

export default RegisterScreen;