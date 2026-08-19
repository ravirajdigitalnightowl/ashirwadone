
import React, { useState, useContext } from 'react';
import { View, Text, SafeAreaView, ScrollView, TouchableOpacity, TextInput, StyleSheet, Platform, Alert, KeyboardAvoidingView, ActivityIndicator } from 'react-native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { ThemeContext } from '../../context/ThemeContext';
import { ThemeColors } from '../../theme/colors';

import { useAddWorker, useDepartments } from '../../hooks/useAdmin';

const AddWorkerScreen = ({ navigation }: any) => {
  const { theme } = useContext(ThemeContext);
  const styles = getStyles(theme);

  const [formData, setFormData] = useState({ name: '', phone: '', email: '', password: '' });
  const [selectedDept, setSelectedDept] = useState<string | null>(null);
  
  // ✅ NAYA: Password ko show/hide karne ke liye state
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);

  const { mutate: addWorker, isPending } = useAddWorker(() => navigation.goBack());
  
  const { data: deptData, isLoading: loadingDepts } = useDepartments();
  const activeDepartments = deptData?.data?.departments?.filter((d: any) => d.isActive) || [];

  const handleRegister = () => {
    if (!formData.name || !formData.phone || !formData.password || !selectedDept) {
      Alert.alert('Incomplete Fields', 'Please provide the worker name, phone number, password, and select a department.');
      return;
    }

    addWorker({
      ...formData,
      department: selectedDept,
      role: 'WORKER'
    });
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1 }}>
        <View style={styles.header}>
          <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()} disabled={isPending}>
            <MaterialCommunityIcons name="arrow-left" size={28} color={theme.textMain} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Add New Staff</Text>
        </View>

        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          <View style={styles.infoCard}>
            <MaterialCommunityIcons name="shield-key-outline" size={20} color={theme.primary} style={{ marginRight: 8 }} />
            <Text style={styles.infoText}>
              Set an initial password for the staff. Please share it with them manually so they can log in.
            </Text>
          </View>

          <View style={styles.formSection}>
            <Text style={styles.sectionTitle}>Personal Details</Text>
            
            <View style={styles.inputContainer}>
              <MaterialCommunityIcons name="account-outline" size={20} color={theme.iconMuted} style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="Full Name"
                placeholderTextColor={theme.textMuted}
                value={formData.name}
                onChangeText={(text) => setFormData({ ...formData, name: text })}
                editable={!isPending}
              />
            </View>

            <View style={styles.inputContainer}>
              <MaterialCommunityIcons name="phone-outline" size={20} color={theme.iconMuted} style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="Mobile Number"
                placeholderTextColor={theme.textMuted}
                keyboardType="phone-pad"
                maxLength={10}
                value={formData.phone}
                onChangeText={(text) => setFormData({ ...formData, phone: text })}
                editable={!isPending}
              />
            </View>

            <View style={styles.inputContainer}>
              <MaterialCommunityIcons name="email-outline" size={20} color={theme.iconMuted} style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="Email Address (Optional)"
                placeholderTextColor={theme.textMuted}
                keyboardType="email-address"
                autoCapitalize="none"
                value={formData.email}
                onChangeText={(text) => setFormData({ ...formData, email: text })}
                editable={!isPending}
              />
            </View>

            {/* ✅ UPDATE: Password Input Field with Eye Icon */}
            <View style={styles.inputContainer}>
              <MaterialCommunityIcons name="lock-outline" size={20} color={theme.iconMuted} style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="Set Initial Password"
                placeholderTextColor={theme.textMuted}
                
                // ✅ UPDATE: Hide/Show based on state
                secureTextEntry={!isPasswordVisible} 
                
                value={formData.password}
                onChangeText={(text) => setFormData({ ...formData, password: text })}
                editable={!isPending}
              />
              {/* ✅ NAYA: Password toggle button */}
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
            </View>
          </View>

          <View style={styles.deptSection}>
            <Text style={styles.sectionTitle}>Select Department</Text>
            {loadingDepts ? (
              <ActivityIndicator color={theme.primary} style={{ alignSelf: 'flex-start', marginTop: 10 }} />
            ) : (
              <View style={styles.chipContainer}>
                {activeDepartments.map((dept: any) => {
                  const isSelected = selectedDept === dept.name;
                  return (
                    <TouchableOpacity
                      key={dept._id}
                      style={[styles.chip, isSelected && { backgroundColor: theme.primary, borderColor: theme.primary }]}
                      onPress={() => setSelectedDept(dept.name)}
                      activeOpacity={0.8}
                      disabled={isPending}
                    >
                      <Text style={[styles.chipText, isSelected && { color: '#FFFFFF' }]}>{dept.name}</Text>
                    </TouchableOpacity>
                  );
                })}
                {activeDepartments.length === 0 && (
                  <Text style={{ color: theme.textMuted, fontStyle: 'italic' }}>No active departments found.</Text>
                )}
              </View>
            )}
          </View>
        </ScrollView>

        <View style={styles.footer}>
          <TouchableOpacity 
            style={[styles.submitBtn, isPending && { opacity: 0.7 }]} 
            activeOpacity={0.8} 
            onPress={handleRegister}
            disabled={isPending}
          >
            {isPending ? (
              <ActivityIndicator color="#FFF" />
            ) : (
              <>
                <MaterialCommunityIcons name="account-plus-outline" size={22} color="#FFF" style={{ marginRight: 8 }} />
                <Text style={styles.submitBtnText}>REGISTER STAFF</Text>
              </>
            )}
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const getStyles = (theme: ThemeColors) => StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.background },
  header: { padding: 24, paddingBottom: 16, flexDirection: 'row', alignItems: 'center', backgroundColor: theme.surface, borderBottomWidth: 1, borderBottomColor: theme.border, paddingTop: Platform.OS === 'ios' ? 20 : 40 },
  backBtn: { marginRight: 16 },
  headerTitle: { fontSize: 22, fontWeight: '800', color: theme.textMain },
  scrollContent: { padding: 20, paddingBottom: 40 },
  
  infoCard: { flexDirection: 'row', backgroundColor: theme.primaryLight, padding: 16, borderRadius: 12, marginBottom: 24, borderWidth: 1, borderColor: theme.primary + '30' },
  infoText: { flex: 1, fontSize: 13, color: theme.primary, lineHeight: 18, fontWeight: '500' },

  formSection: { marginBottom: 24 },
  sectionTitle: { fontSize: 14, fontWeight: '700', color: theme.textMain, textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 16, marginLeft: 4 },
  
  inputContainer: { flexDirection: 'row', alignItems: 'center', backgroundColor: theme.surface, borderRadius: 12, borderWidth: 1, borderColor: theme.border, marginBottom: 16, paddingHorizontal: 16 },
  inputIcon: { marginRight: 12 },
  input: { flex: 1, paddingVertical: Platform.OS === 'ios' ? 16 : 12, fontSize: 16, color: theme.textMain },

  deptSection: { marginBottom: 10 },
  chipContainer: { flexDirection: 'row', flexWrap: 'wrap', marginTop: 8 },
  chip: { backgroundColor: theme.surface, borderWidth: 1.5, borderColor: theme.border, paddingVertical: 10, paddingHorizontal: 16, borderRadius: 20, marginRight: 12, marginBottom: 12 },
  chipText: { fontSize: 14, fontWeight: '600', color: theme.textMuted },

  footer: { padding: 20, backgroundColor: theme.surface, borderTopWidth: 1, borderTopColor: theme.border },
  submitBtn: { flexDirection: 'row', backgroundColor: theme.primary, padding: 18, borderRadius: 12, alignItems: 'center', justifyContent: 'center', shadowColor: theme.primary, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 8, elevation: 5 },
  submitBtnText: { color: '#FFFFFF', fontSize: 16, fontWeight: 'bold', letterSpacing: 1 },
});

export default AddWorkerScreen;