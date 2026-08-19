import React, { useState, useContext } from 'react';
import { View, Text, SafeAreaView, ScrollView, TouchableOpacity, TextInput, Platform, KeyboardAvoidingView, ActivityIndicator, Alert } from 'react-native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { ThemeContext } from '../../context/ThemeContext';
import { useAddResident } from '../../hooks/useAdmin';

const AddResidentScreen = ({ navigation }: any) => {
  const { theme } = useContext(ThemeContext);
  
  const [formData, setFormData] = useState({ name: '', phone: '', email: '', tower: '', flatNo: '', password: '' });
  
  // ✅ FIXED: Default state ko false rakha hai (taaki by default password hide rahe)
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);

  const { mutate: addResident, isPending } = useAddResident(() => navigation.goBack());

  const handleRegister = () => {
    if (!formData.name || !formData.phone || !formData.tower || !formData.flatNo || !formData.password) {
      Alert.alert('Incomplete Details', 'Please fill all the required fields including Tower, Flat No and Password.');
      return;
    }
    // Tower input ko clean (trim aur uppercase) karke bhejenge
    const formattedData = { 
      ...formData, 
      tower: formData.tower.trim().toUpperCase(),
      role: 'RESIDENT', 
      department: '' 
    };
    addResident(formattedData); 
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: theme.background }}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1 }}>
        
        {/* ✅ FIXED: Header cut problem solved by adding paddingTop */}
        <View style={{ padding: 24, paddingTop: Platform.OS === 'ios' ? 20 : 40, flexDirection: 'row', alignItems: 'center', backgroundColor: theme.surface, borderBottomWidth: 1, borderBottomColor: theme.border }}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={{ marginRight: 16 }}>
            <MaterialCommunityIcons name="arrow-left" size={28} color={theme.textMain} />
          </TouchableOpacity>
          <Text style={{ fontSize: 22, fontWeight: '800', color: theme.textMain }}>Add Resident</Text>
        </View>

        <ScrollView contentContainerStyle={{ padding: 20 }}>
          {['name', 'phone', 'email', 'tower', 'flatNo', 'password'].map((field) => (
            <View key={field} style={{ flexDirection: 'row', alignItems: 'center', backgroundColor: theme.surface, borderRadius: 12, borderWidth: 1, borderColor: theme.border, marginBottom: 16, paddingHorizontal: 16 }}>
              <MaterialCommunityIcons 
                name={
                  field === 'tower' ? 'office-building-outline' :
                  field === 'flatNo' ? 'home-outline' : 
                  field === 'phone' ? 'phone-outline' : 
                  field === 'email' ? 'email-outline' : 
                  field === 'password' ? 'lock-outline' : 'account-outline'
                } 
                size={20} color={theme.iconMuted} style={{ marginRight: 12 }} 
              />
              <TextInput
                style={{ flex: 1, paddingVertical: 14, fontSize: 16, color: theme.textMain }}
                placeholder={
                  field === 'tower' ? 'Tower(e.g. A, B, C)' :
                  field === 'flatNo' ? 'Flat(e.g. 101)' : 
                  field === 'password' ? 'Set Initial Password' : `Enter ${field}`
                }
                placeholderTextColor={theme.textMuted}
                value={(formData as any)[field]}
                onChangeText={(text) => setFormData({ ...formData, [field]: text })}
                keyboardType={field === 'phone' ? 'phone-pad' : 'default'}
                
                // ✅ FIXED: Logic ab bilkul logical hai (Hide rehne pe dots dikhenge)
                secureTextEntry={field === 'password' && !isPasswordVisible} 
                
                autoCapitalize={field === 'tower' ? 'characters' : 'none'}
              />
              
              {/* ✅ FIXED: JS comments removed to avoid rendering text & Icon logic corrected */}
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
          ))}
        </ScrollView>

        <View style={{ padding: 20, backgroundColor: theme.surface, borderTopWidth: 1, borderTopColor: theme.border }}>
          <TouchableOpacity style={{ backgroundColor: theme.primary, padding: 18, borderRadius: 12, alignItems: 'center' }} onPress={handleRegister} disabled={isPending}>
            {isPending ? <ActivityIndicator color="#FFF" /> : <Text style={{ color: '#FFF', fontWeight: 'bold' }}>REGISTER RESIDENT</Text>}
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

export default AddResidentScreen;