import React, { useState, useContext } from 'react';
import { View, Text, SafeAreaView, ScrollView, TouchableOpacity, TextInput, Platform, KeyboardAvoidingView, ActivityIndicator, StyleSheet } from 'react-native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { ThemeContext } from '../../context/ThemeContext';
import { ThemeColors } from '../../theme/colors';
import { useUpdateUser } from '../../hooks/useAdmin';

const EditResidentScreen = ({ route, navigation }: any) => {
  const { resident } = route.params; 
  const { theme } = useContext(ThemeContext);
  const styles = getStyles(theme);

  // 🔥 UPDATE: Added 'tower' field initialized with existing data
  const [formData, setFormData] = useState({ 
    name: resident.name, 
    phone: resident.phone, 
    email: resident.email || '', 
    tower: resident.tower || '', // Naya field
    flatNo: resident.flatNo || '',
    password: '' 
  });

  // ✅ NAYA: Password ko show/hide karne ke liye state
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);

  const { mutate: updateUser, isPending } = useUpdateUser(() => navigation.goBack());

  const handleUpdate = () => {
    const updates: any = { ...formData };
    if (!updates.password) delete updates.password; 
    
    updateUser({ userId: resident._id, updates });
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1 }}>
        
        {/* 🔥 FIXED: Header with proper platform paddings */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn} disabled={isPending}>
            <MaterialCommunityIcons name="arrow-left" size={28} color={theme.textMain} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Edit Profile</Text>
        </View>

        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          {/* 🔥 UPDATE: Added 'tower' to the array */}
          {['name', 'phone', 'email', 'tower', 'flatNo', 'password'].map((field) => (
            <View key={field} style={styles.inputWrapper}>
              <Text style={styles.fieldLabel}>
                {field === 'password' ? 'Set New Password (Optional)' : 
                 field === 'flatNo' ? 'Flat Number' : 
                 field === 'tower' ? 'Tower' : field}
              </Text>
              
              <View style={styles.inputContainer}>
                <TextInput
                  style={styles.input}
                  placeholder={`Update ${field}`}
                  placeholderTextColor={theme.textMuted}
                  value={(formData as any)[field]}
                  onChangeText={(text) => setFormData({ ...formData, [field]: text })}
                  
                  // ✅ UPDATE: Toggle logic ke mutabik hide/show hoga
                  secureTextEntry={field === 'password' && !isPasswordVisible}
                  
                  keyboardType={field === 'phone' ? 'phone-pad' : field === 'email' ? 'email-address' : 'default'}
                  editable={!isPending}
                />

                {/* ✅ NAYA: Password show/hide karne ka button */}
                {field === 'password' && (
                  <TouchableOpacity 
                    onPress={() => setIsPasswordVisible(!isPasswordVisible)} 
                    style={{ padding: 8 }}
                  >
                    <MaterialCommunityIcons 
                      name={isPasswordVisible ? 'eye-off-outline' : 'eye-outline'} 
                      size={20} 
                      color={theme.iconMuted} 
                    />
                  </TouchableOpacity>
                )}
              </View>
            </View>
          ))}
        </ScrollView>

        <View style={styles.footer}>
          <TouchableOpacity 
            style={[styles.submitBtn, isPending && { opacity: 0.7 }]} 
            onPress={handleUpdate} 
            disabled={isPending}
            activeOpacity={0.8}
          >
            {isPending ? <ActivityIndicator color="#FFF" /> : <Text style={styles.submitBtnText}>SAVE CHANGES</Text>}
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

// 🔥 EXTRACTED TO STYLESHEET FOR CONSISTENCY
const getStyles = (theme: ThemeColors) => StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.background },
  header: { 
    padding: 24, 
    paddingBottom: 16, 
    flexDirection: 'row', 
    alignItems: 'center', 
    backgroundColor: theme.surface, 
    borderBottomWidth: 1, 
    borderBottomColor: theme.border, 
    paddingTop: Platform.OS === 'ios' ? 20 : 40 // Yeh status bar cutting issue ko fix karega
  },
  backBtn: { marginRight: 16 },
  headerTitle: { fontSize: 22, fontWeight: '800', color: theme.textMain },
  
  scrollContent: { padding: 20 },
  inputWrapper: { marginBottom: 16 },
  fieldLabel: { fontSize: 13, color: theme.textMuted, marginBottom: 6, textTransform: 'uppercase', fontWeight: 'bold', marginLeft: 4 },
  
  inputContainer: { flexDirection: 'row', alignItems: 'center', backgroundColor: theme.surface, borderRadius: 12, borderWidth: 1, borderColor: theme.border, paddingHorizontal: 16 },
  input: { flex: 1, paddingVertical: Platform.OS === 'ios' ? 16 : 14, fontSize: 16, color: theme.textMain },
  
  footer: { padding: 20, backgroundColor: theme.surface, borderTopWidth: 1, borderTopColor: theme.border },
  submitBtn: { 
    backgroundColor: theme.status.resolved, 
    padding: 18, 
    borderRadius: 12, 
    alignItems: 'center',
    shadowColor: theme.status.resolved, 
    shadowOffset: { width: 0, height: 4 }, 
    shadowOpacity: 0.3, 
    shadowRadius: 8, 
    elevation: 5 
  },
  submitBtnText: { color: '#FFF', fontWeight: 'bold', fontSize: 16, letterSpacing: 0.5 }
});

export default EditResidentScreen;