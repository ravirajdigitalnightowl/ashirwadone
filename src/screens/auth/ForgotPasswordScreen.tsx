import React, { useState, useContext } from 'react';
import { View, Text, TextInput, TouchableOpacity, SafeAreaView, StyleSheet, Platform } from 'react-native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { ThemeContext } from '../../context/ThemeContext';
import { ThemeColors } from '../../theme/colors';

interface Props { navigation: any; }

const ForgotPasswordScreen: React.FC<Props> = ({ navigation }) => {
  const { theme } = useContext(ThemeContext);
  const styles = getStyles(theme);
  const [email, setEmail] = useState('');

  const handleReset = () => {
    console.log('Reset link sent to:', email);
    navigation.goBack();
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <MaterialCommunityIcons name="arrow-left" size={28} color={theme.textMain} />
        </TouchableOpacity>

        <View style={styles.header}>
          <Text style={styles.title}>Reset Password</Text>
          <Text style={styles.subtitle}>Enter your email to receive a reset link</Text>
        </View>

        <View style={styles.form}>
          <View style={styles.inputContainer}>
            <MaterialCommunityIcons name="email-outline" size={20} color={theme.iconMuted} style={styles.inputIcon} />
            <TextInput
              style={styles.input}
              placeholder="Email Address"
              placeholderTextColor={theme.textMuted}
              keyboardType="email-address"
              autoCapitalize="none"
              value={email}
              onChangeText={setEmail}
            />
          </View>

          <TouchableOpacity activeOpacity={0.8} style={styles.button} onPress={handleReset}>
            <Text style={styles.buttonText}>SEND RESET LINK</Text>
          </TouchableOpacity>
        </View>

      </View>
    </SafeAreaView>
  );
};

const getStyles = (theme: ThemeColors) => StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.background },
  content: { flex: 1, padding: 24, paddingTop: 40 },
  backBtn: { marginBottom: 30, alignSelf: 'flex-start' },
  header: { marginBottom: 40 },
  title: { fontSize: 32, fontWeight: '800', color: theme.textMain, marginBottom: 8 },
  subtitle: { fontSize: 16, color: theme.textMuted, lineHeight: 22 },
  form: { marginBottom: 30 },
  inputContainer: { flexDirection: 'row', alignItems: 'center', backgroundColor: theme.surface, borderRadius: 12, borderWidth: 1, borderColor: theme.border, marginBottom: 24, paddingHorizontal: 16 },
  inputIcon: { marginRight: 12 },
  input: { flex: 1, paddingVertical: Platform.OS === 'ios' ? 16 : 12, fontSize: 16, color: theme.textMain },
  button: { backgroundColor: theme.primary, padding: 18, borderRadius: 12, alignItems: 'center', shadowColor: theme.primary, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 8, elevation: 5 },
  buttonText: { color: '#FFFFFF', fontSize: 16, fontWeight: 'bold', letterSpacing: 1 },
});

export default ForgotPasswordScreen;