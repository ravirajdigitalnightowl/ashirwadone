import React, { useState, useContext } from 'react';
import { View, Text, SafeAreaView, ScrollView, TouchableOpacity, TextInput, Platform, KeyboardAvoidingView, ActivityIndicator, StyleSheet, Image, Alert } from 'react-native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { launchCamera, ImageLibraryOptions } from 'react-native-image-picker'; 
import { ThemeContext } from '../../context/ThemeContext';
import { ThemeColors } from '../../theme/colors';

// 🔥 Hooks Imports
import { useUpdateUser, useDepartments } from '../../hooks/useAdmin';

const EditWorkerScreen = ({ route, navigation }: any) => {
  const { worker } = route.params; 
  const { theme } = useContext(ThemeContext);
  const styles = getStyles(theme);

  // 🔥 UPDATE: Added new fields to state
  const [formData, setFormData] = useState({ 
    name: worker.name, 
    phone: worker.phone, 
    email: worker.email || '', 
    aadharNo: worker.aadharNo || '',       // 🔥 NAYA
    shiftStart: worker.shiftStart || '09:00 AM', // 🔥 NAYA
    shiftEnd: worker.shiftEnd || '06:00 PM',     // 🔥 NAYA
    password: '' 
  });
  const [selectedDept, setSelectedDept] = useState<string>(worker.department || '');

  // Photo State (Existing ya New)
  const [photo, setPhoto] = useState<any>(null);
  const [existingPhotoUrl] = useState<string>(worker.photoUrl || '');

  // ✅ NAYA: Password ko show/hide karne ke liye state
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);

  const { mutate: updateWorker, isPending } = useUpdateUser(() => navigation.goBack());
  
  // 🔥 Fetching Dynamic Departments
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

  const handleUpdate = () => {
    if (!formData.name || !formData.phone || !selectedDept) return;

    const updates: any = { 
      ...formData, 
      department: selectedDept 
    };
    
    // Agar nahi photo li hai toh uska URI bhejo, warna purana URL bhejo
    if (photo) updates.photoUrl = photo.uri; 
    else if (existingPhotoUrl) updates.photoUrl = existingPhotoUrl;

    if (!updates.password) delete updates.password; // Ignore empty password
    
    updateWorker({ userId: worker._id, updates });
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1 }}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn} disabled={isPending}>
            <MaterialCommunityIcons name="arrow-left" size={28} color={theme.textMain} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Edit Staff Profile</Text>
        </View>

        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>

          {/* 🔥 NAYA: Profile Photo Capture / Update */}
          <Text style={styles.sectionTitle}>Staff Photo</Text>
          <TouchableOpacity style={styles.photoBtn} onPress={handleTakePhoto} disabled={isPending}>
            {photo ? (
              <Image source={{ uri: photo.uri }} style={styles.previewImage} />
            ) : existingPhotoUrl ? (
              <Image source={{ uri: existingPhotoUrl }} style={styles.previewImage} />
            ) : (
              <>
                <MaterialCommunityIcons name="camera-plus" size={40} color={theme.primary} />
                <Text style={styles.photoText}>Update Staff Photo</Text>
              </>
            )}
          </TouchableOpacity>

          {/* 🔥 UPDATE: Personal Details Fields */}
          <Text style={styles.sectionTitle}>Personal Details</Text>
          {['name', 'phone', 'aadharNo', 'email', 'password'].map((field) => (
            <View key={field} style={styles.inputWrapper}>
              <Text style={styles.fieldLabel}>
                {field === 'password' ? 'Set New Password (Optional)' : 
                 field === 'aadharNo' ? 'Aadhar Number' : field}
              </Text>
              <View style={styles.inputContainer}>
                <TextInput
                  style={styles.input}
                  placeholder={`Update ${field === 'aadharNo' ? 'Aadhar Number' : field}`}
                  placeholderTextColor={theme.textMuted}
                  value={(formData as any)[field]}
                  onChangeText={(text) => setFormData({ ...formData, [field]: text })}
                  secureTextEntry={field === 'password' && !isPasswordVisible}
                  keyboardType={field === 'phone' || field === 'aadharNo' ? 'phone-pad' : field === 'email' ? 'email-address' : 'default'}
                  editable={!isPending}
                />
                
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

          {/* 🔥 NAYA: Duty Shift Timings */}
          <Text style={styles.sectionTitle}>Shift Timings</Text>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 16 }}>
            <View style={[styles.inputContainer, { flex: 0.48, marginBottom: 0 }]}>
              <MaterialCommunityIcons name="clock-in" size={20} color={theme.iconMuted} style={{ marginRight: 8 }} />
              <TextInput
                style={styles.input}
                placeholder="Start (09:00 AM)"
                placeholderTextColor={theme.textMuted}
                value={formData.shiftStart}
                onChangeText={(text) => setFormData({ ...formData, shiftStart: text })}
                editable={!isPending}
              />
            </View>
            <View style={[styles.inputContainer, { flex: 0.48, marginBottom: 0 }]}>
              <MaterialCommunityIcons name="clock-out" size={20} color={theme.iconMuted} style={{ marginRight: 8 }} />
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

          {/* Department Picker */}
          <Text style={styles.sectionTitle}>Department</Text>
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
                    disabled={isPending}
                    activeOpacity={0.8}
                  >
                    <Text style={[styles.chipText, isSelected && { color: '#FFFFFF' }]}>{dept.name}</Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          )}
        </ScrollView>

        <View style={styles.footer}>
          <TouchableOpacity style={styles.submitBtn} onPress={handleUpdate} disabled={isPending} activeOpacity={0.8}>
            {isPending ? <ActivityIndicator color="#FFF" /> : <Text style={styles.submitBtnText}>SAVE CHANGES</Text>}
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
  
  scrollContent: { padding: 20 },
  sectionTitle: { fontSize: 14, fontWeight: '700', color: theme.textMain, textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 12, marginLeft: 4 },
  
  // 🔥 NAYA: Photo Button Styles
  photoBtn: { backgroundColor: theme.surface, height: 160, borderRadius: 12, borderWidth: 1.5, borderColor: theme.border, alignItems: 'center', justifyContent: 'center', marginBottom: 24, overflow: 'hidden', borderStyle: 'dashed' },
  previewImage: { width: '100%', height: '100%' },
  photoText: { color: theme.primary, marginTop: 8, fontWeight: 'bold' },

  inputWrapper: { marginBottom: 16 },
  fieldLabel: { fontSize: 13, color: theme.textMuted, marginBottom: 6, textTransform: 'uppercase', fontWeight: 'bold', marginLeft: 4 },
  
  inputContainer: { flexDirection: 'row', alignItems: 'center', backgroundColor: theme.surface, borderRadius: 12, borderWidth: 1, borderColor: theme.border, paddingHorizontal: 16 },
  input: { flex: 1, paddingVertical: Platform.OS === 'ios' ? 16 : 14, fontSize: 16, color: theme.textMain },
  
  chipContainer: { flexDirection: 'row', flexWrap: 'wrap', marginTop: 4 },
  chip: { backgroundColor: theme.surface, borderWidth: 1.5, borderColor: theme.border, paddingVertical: 10, paddingHorizontal: 16, borderRadius: 20, marginRight: 12, marginBottom: 12 },
  chipText: { fontSize: 14, fontWeight: '600', color: theme.textMuted },
  
  footer: { padding: 20, backgroundColor: theme.surface, borderTopWidth: 1, borderTopColor: theme.border },
  submitBtn: { backgroundColor: theme.status.resolved, padding: 18, borderRadius: 12, alignItems: 'center', shadowColor: theme.status.resolved, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 8, elevation: 5 },
  submitBtnText: { color: '#FFF', fontWeight: 'bold', fontSize: 16, letterSpacing: 0.5 }
});

export default EditWorkerScreen;