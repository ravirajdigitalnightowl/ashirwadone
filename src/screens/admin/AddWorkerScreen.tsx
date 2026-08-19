// src/screens/admin/AddWorkerScreen.tsx
import React, { useState, useContext } from 'react';
import { View, Text, SafeAreaView, ScrollView, TouchableOpacity, TextInput, StyleSheet, Platform, Alert, KeyboardAvoidingView, ActivityIndicator, Image } from 'react-native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { launchCamera, ImageLibraryOptions } from 'react-native-image-picker'; 
import { ThemeContext } from '../../context/ThemeContext';
import { ThemeColors } from '../../theme/colors';

import { useAddWorker, useDepartments } from '../../hooks/useAdmin';

const AddWorkerScreen = ({ navigation }: any) => {
  const { theme } = useContext(ThemeContext);
  const styles = getStyles(theme);

  // 🔥 UPDATE: Added new SaaS fields to state
  const [formData, setFormData] = useState({ 
    name: '', phone: '', email: '', password: '', 
    aadharNo: '', shiftStart: '09:00 AM', shiftEnd: '06:00 PM' 
  });
  const [selectedDept, setSelectedDept] = useState<string | null>(null);
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const [photo, setPhoto] = useState<any>(null); // 🔥 NAYA: Photo state

  const { mutate: addWorker, isPending } = useAddWorker(() => navigation.goBack());
  
  const { data: deptData, isLoading: loadingDepts } = useDepartments();
  const activeDepartments = deptData?.data?.departments?.filter((d: any) => d.isActive) || [];

  // 🔥 NAYA: Handle Camera Capture
  const handleTakePhoto = () => {
    const options: ImageLibraryOptions = { mediaType: 'photo', quality: 0.6, cameraType: 'back' };
    launchCamera(options, (response) => {
      if (response.didCancel) return;
      if (response.errorCode) {
        Alert.alert('Camera Error', response.errorMessage || 'Failed to open camera');
        return;
      }
      if (response.assets && response.assets.length > 0) {
        setPhoto(response.assets[0]);
      }
    });
  };

  const handleRegister = () => {
    if (!formData.name || !formData.phone || !formData.password || !selectedDept || !formData.aadharNo) {
      Alert.alert('Incomplete Fields', 'Please provide the worker name, phone number, password, Aadhar Number, and select a department.');
      return;
    }

    addWorker({
      ...formData,
      department: selectedDept,
      role: 'WORKER',
      photoUrl: photo ? photo.uri : undefined // Send URI; backend handles string saving
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
          
          {/* 🔥 NAYA: Profile Photo Capture */}
          <Text style={styles.sectionTitle}>Staff Photo (Optional)</Text>
          <TouchableOpacity style={styles.photoBtn} onPress={handleTakePhoto}>
            {photo ? (
              <Image source={{ uri: photo.uri }} style={styles.previewImage} />
            ) : (
              <>
                <MaterialCommunityIcons name="camera-plus" size={40} color={theme.primary} />
                <Text style={styles.photoText}>Capture Staff Photo</Text>
              </>
            )}
          </TouchableOpacity>

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

            {/* 🔥 NAYA: Aadhar Number Field */}
            <View style={styles.inputContainer}>
              <MaterialCommunityIcons name="card-account-details-outline" size={20} color={theme.iconMuted} style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="Aadhar Number"
                placeholderTextColor={theme.textMuted}
                keyboardType="number-pad"
                maxLength={12}
                value={formData.aadharNo}
                onChangeText={(text) => setFormData({ ...formData, aadharNo: text })}
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

            <View style={styles.inputContainer}>
              <MaterialCommunityIcons name="lock-outline" size={20} color={theme.iconMuted} style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="Set Initial Password"
                placeholderTextColor={theme.textMuted}
                secureTextEntry={!isPasswordVisible} 
                value={formData.password}
                onChangeText={(text) => setFormData({ ...formData, password: text })}
                editable={!isPending}
              />
              <TouchableOpacity onPress={() => setIsPasswordVisible(!isPasswordVisible)} style={{ padding: 8 }}>
                <MaterialCommunityIcons name={isPasswordVisible ? 'eye-off-outline' : 'eye-outline'} size={20} color={theme.iconMuted} />
              </TouchableOpacity>
            </View>
          </View>

          {/* 🔥 NAYA: Duty Shift Timings */}
          <View style={styles.formSection}>
            <Text style={styles.sectionTitle}>Shift Timings</Text>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
              <View style={[styles.inputContainer, { flex: 0.48 }]}>
                <MaterialCommunityIcons name="clock-in" size={20} color={theme.iconMuted} style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  placeholder="Start (09:00 AM)"
                  placeholderTextColor={theme.textMuted}
                  value={formData.shiftStart}
                  onChangeText={(text) => setFormData({ ...formData, shiftStart: text })}
                  editable={!isPending}
                />
              </View>
              <View style={[styles.inputContainer, { flex: 0.48 }]}>
                <MaterialCommunityIcons name="clock-out" size={20} color={theme.iconMuted} style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  placeholder="End (06:00 PM)"
                  placeholderTextColor={theme.textMuted}
                  value={formData.shiftEnd}
                  onChangeText={(text) => setFormData({ ...formData, shiftEnd: text })}
                  editable={!isPending}
                />
              </View>
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
  
  // 🔥 NEW: Photo Button Styles
  photoBtn: { backgroundColor: theme.surface, height: 160, borderRadius: 12, borderWidth: 1.5, borderColor: theme.border, alignItems: 'center', justifyContent: 'center', marginBottom: 24, overflow: 'hidden', borderStyle: 'dashed' },
  previewImage: { width: '100%', height: '100%' },
  photoText: { color: theme.primary, marginTop: 8, fontWeight: 'bold' },

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