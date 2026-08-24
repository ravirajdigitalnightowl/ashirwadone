import React, { useState, useContext } from 'react';
import { View, Text, SafeAreaView, ScrollView, TouchableOpacity, TextInput, Platform, KeyboardAvoidingView, ActivityIndicator, StyleSheet } from 'react-native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { ThemeContext } from '../../context/ThemeContext';
import { ThemeColors } from '../../theme/colors';

// 🔥 Hooks Imports
import { useUpdateUser, useDepartments } from '../../hooks/useAdmin';

const EditWorkerScreen = ({ route, navigation }: any) => {
  const { worker } = route.params; 
  const { theme } = useContext(ThemeContext);
  const styles = getStyles(theme);

  const [formData, setFormData] = useState({ 
    name: worker.name, 
    phone: worker.phone, 
    email: worker.email || '', 
    password: '' 
  });
  const [selectedDept, setSelectedDept] = useState<string>(worker.department || '');

  // ✅ NAYA: Password ko show/hide karne ke liye state
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);

  const { mutate: updateWorker, isPending } = useUpdateUser(() => navigation.goBack());
  
  // 🔥 Fetching Dynamic Departments
  const { data: deptData, isLoading: loadingDepts } = useDepartments();
  const activeDepartments = deptData?.data?.departments?.filter((d: any) => d.isActive) || [];

  const handleUpdate = () => {
    if (!formData.name || !formData.phone || !selectedDept) return;

    const updates: any = { 
      ...formData, 
      department: selectedDept 
    };
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
          {/* Personal Fields */}
          {['name', 'phone', 'email', 'password'].map((field) => (
            <View key={field} style={styles.inputWrapper}>
              <Text style={styles.fieldLabel}>
                {field === 'password' ? 'Set New Password (Optional)' : field}
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
                  
                  keyboardType={field === 'phone' ? 'phone-pad' : 'default'}
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

          {/* Department Picker */}
          <Text style={styles.fieldLabel}>Department</Text>
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
  inputWrapper: { marginBottom: 16 },
  fieldLabel: { fontSize: 13, color: theme.textMuted, marginBottom: 6, textTransform: 'uppercase', fontWeight: 'bold', marginLeft: 4 },
  inputContainer: { flexDirection: 'row', alignItems: 'center', backgroundColor: theme.surface, borderRadius: 12, borderWidth: 1, borderColor: theme.border, paddingHorizontal: 16 },
  input: { flex: 1, paddingVertical: 14, fontSize: 16, color: theme.textMain },
  chipContainer: { flexDirection: 'row', flexWrap: 'wrap', marginTop: 4 },
  chip: { backgroundColor: theme.surface, borderWidth: 1.5, borderColor: theme.border, paddingVertical: 10, paddingHorizontal: 16, borderRadius: 20, marginRight: 12, marginBottom: 12 },
  chipText: { fontSize: 14, fontWeight: '600', color: theme.textMuted },
  footer: { padding: 20, backgroundColor: theme.surface, borderTopWidth: 1, borderTopColor: theme.border },
  submitBtn: { backgroundColor: theme.status.resolved, padding: 18, borderRadius: 12, alignItems: 'center' },
  submitBtnText: { color: '#FFF', fontWeight: 'bold', fontSize: 16, letterSpacing: 0.5 }
});

export default EditWorkerScreen;