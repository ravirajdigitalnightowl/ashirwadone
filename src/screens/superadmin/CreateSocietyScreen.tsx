import React, { useState, useContext } from 'react';
import { View, Text, SafeAreaView, ScrollView, TouchableOpacity, TextInput, StyleSheet, Platform, KeyboardAvoidingView, ActivityIndicator } from 'react-native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons'; // 🔥 Import Icon
import { ThemeContext } from '../../context/ThemeContext';
import { useCreateSociety } from '../../hooks/useSuperAdmin';

const CreateSocietyScreen = ({ navigation }: any) => {
  const { theme } = useContext(ThemeContext);
  const styles = getStyles(theme);
  
  const [societyData, setSocietyData] = useState({ societyName: '', fullAddress: '', city: '', state: '', pincode: '' });
  const [adminData, setAdminData] = useState({ adminName: '', adminEmail: '', adminPhone: '', adminPassword: '' });
  
  // 🔥 NAYA: Password show/hide state
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);

  const { mutate: createSociety, isPending } = useCreateSociety(() => navigation.goBack());

  const handleCreate = () => {
    if (!societyData.societyName || !adminData.adminEmail || !adminData.adminPassword) return;
    createSociety({ ...societyData, ...adminData });
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1 }}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} disabled={isPending}>
            <MaterialCommunityIcons name="arrow-left" size={28} color={theme.textMain} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Onboard Society</Text>
        </View>

        <ScrollView contentContainerStyle={{ padding: 20 }} showsVerticalScrollIndicator={false}>
          <Text style={styles.sectionTitle}>🏢 Society Details</Text>
          {['societyName', 'fullAddress', 'city', 'state', 'pincode'].map((field) => (
            <View key={field} style={styles.inputContainer}>
              <TextInput
                style={styles.input}
                placeholder={field.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
                value={(societyData as any)[field]}
                onChangeText={(t) => setSocietyData({ ...societyData, [field]: t })}
              />
            </View>
          ))}

          <Text style={[styles.sectionTitle, { marginTop: 20 }]}>👑 Admin Details</Text>
          {['adminName', 'adminEmail', 'adminPhone', 'adminPassword'].map((field) => (
            <View key={field} style={[styles.inputContainer, field === 'adminPassword' && styles.passwordContainer]}> 
              <TextInput
                style={styles.input}
                placeholder={field.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
                value={(adminData as any)[field]}
                onChangeText={(t) => setAdminData({ ...adminData, [field]: t })}
                // 🔥 NAYA: Password hide/show logic
                secureTextEntry={field === 'adminPassword' && !isPasswordVisible}
                keyboardType={field === 'adminPhone' ? 'phone-pad' : 'default'}
              />
              {/* 🔥 NAYA: Eye Icon Button */}
              {field === 'adminPassword' && (
                <TouchableOpacity onPress={() => setIsPasswordVisible(!isPasswordVisible)} style={{ padding: 8 }}>
                  <MaterialCommunityIcons 
                    name={isPasswordVisible ? 'eye-off-outline' : 'eye-outline'} 
                    size={24} 
                    color={theme.textMuted} 
                  />
                </TouchableOpacity>
              )}
            </View>
          ))}
        </ScrollView>

        <View style={styles.footer}>
          <TouchableOpacity style={styles.submitBtn} onPress={handleCreate} disabled={isPending}>
            {isPending ? <ActivityIndicator color="#FFF" /> : <Text style={styles.submitBtnText}>CREATE SOCIETY</Text>}
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const getStyles = (theme: any) => StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.background },
  header: { padding: 24, paddingTop: Platform.OS === 'ios' ? 20 : 40, flexDirection: 'row', alignItems: 'center', backgroundColor: theme.surface, borderBottomWidth: 1, borderBottomColor: theme.border },
  headerTitle: { fontSize: 22, fontWeight: '800', color: theme.textMain, marginLeft: 16 },
  sectionTitle: { fontSize: 16, fontWeight: '700', color: theme.primary, marginBottom: 12 },
  inputContainer: { flexDirection: 'row', alignItems: 'center', backgroundColor: theme.surface, borderRadius: 12, borderWidth: 1, borderColor: theme.border, marginBottom: 16, paddingHorizontal: 16 },
  input: { flex: 1, paddingVertical: 14, fontSize: 16, color: theme.textMain },
  // 🔥 NAYA: Agar padding kam chahiye password mein toh
  passwordContainer: { paddingRight: 8 }, 
  footer: { padding: 20, backgroundColor: theme.surface, borderTopWidth: 1, borderTopColor: theme.border },
  submitBtn: { backgroundColor: theme.primary, padding: 18, borderRadius: 12, alignItems: 'center' },
  submitBtnText: { color: '#FFF', fontWeight: 'bold', fontSize: 16 }
});

export default CreateSocietyScreen;