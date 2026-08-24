import React, { useState, useContext, useEffect } from 'react';
import { View, Text, SafeAreaView, ScrollView, TouchableOpacity, TextInput, StyleSheet, Platform, ActivityIndicator, Image } from 'react-native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { launchImageLibrary } from 'react-native-image-picker';
import { ThemeContext } from '../../context/ThemeContext';
import api from '../../services/api';

const SocietyBrandingScreen = ({ navigation }: any) => {
  const { theme } = useContext(ThemeContext);
  const styles = getStyles(theme);
  
  const [isLoading, setIsLoading] = useState(true);
  const [aboutText, setAboutText] = useState('');
  const [amenities, setAmenities] = useState('');
  const [logo, setLogo] = useState<any>(null);
  const [banner, setBanner] = useState<any>(null);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => { fetchBranding(); }, []);

  const fetchBranding = async () => {
    try {
      const res = await api.get('/admin/society/brand');
      const s = res.data.data.society;
      setAboutText(s.aboutText || '');
      setAmenities(s.amenities?.join(', ') || '');
    } catch (err) { console.log(err); } 
    finally { setIsLoading(false); }
  };

  const pickImage = (type: 'logo' | 'banner') => {
    launchImageLibrary({ mediaType: 'photo' }, (response) => {
      if (response.assets && response.assets.length > 0) {
        if (type === 'logo') setLogo(response.assets[0]);
        else setBanner(response.assets[0]);
      }
    });
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const formData = new FormData();
      if (aboutText) formData.append('aboutText', aboutText);
      if (amenities) formData.append('amenities', JSON.stringify(amenities.split(',').map(a => a.trim())));
      
      if (logo) formData.append('logo', { uri: Platform.OS === 'ios' ? logo.uri.replace('file://', '') : logo.uri, name: 'logo.jpg', type: 'image/jpeg' } as any);
      if (banner) formData.append('banners', { uri: Platform.OS === 'ios' ? banner.uri.replace('file://', '') : banner.uri, name: 'banner.jpg', type: 'image/jpeg' } as any);

      await api.patch('/admin/society/brand', formData, { headers: { 'Content-Type': 'multipart/form-data' } });
      alert('Branding Updated Successfully!');
      navigation.goBack();
    } catch (err: any) { alert(err.response?.data?.message || 'Failed to update branding'); } 
    finally { setIsSaving(false); }
  };

  if (isLoading) return <View style={styles.container}><ActivityIndicator color={theme.primary} size="large" /></View>;

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <MaterialCommunityIcons name="arrow-left" size={28} color={theme.textMain} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Society Branding</Text>
      </View>

      <ScrollView contentContainerStyle={{ padding: 20 }}>
        <Text style={styles.label}>Society Logo</Text>
        <TouchableOpacity style={styles.mediaBtn} onPress={() => pickImage('logo')}>
          {logo ? <Image source={{ uri: logo.uri }} style={styles.preview} /> : <MaterialCommunityIcons name="image-plus" size={40} color={theme.textMuted} />}
        </TouchableOpacity>

        <Text style={styles.label}>Banner Image</Text>
        <TouchableOpacity style={[styles.mediaBtn, { height: 120 }]} onPress={() => pickImage('banner')}>
          {banner ? <Image source={{ uri: banner.uri }} style={styles.preview} /> : <MaterialCommunityIcons name="image-multiple" size={40} color={theme.textMuted} />}
        </TouchableOpacity>

        <Text style={styles.label}>About Society</Text>
        <TextInput style={[styles.input, { minHeight: 80 }]} multiline textAlignVertical="top" placeholder="Write a brief intro..." value={aboutText} onChangeText={setAboutText} />

        <Text style={styles.label}>Amenities (Comma Separated)</Text>
        <TextInput style={styles.input} placeholder="e.g. Pool, Gym, Garden" value={amenities} onChangeText={setAmenities} />
      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity style={styles.submitBtn} onPress={handleSave} disabled={isSaving}>
          {isSaving ? <ActivityIndicator color="#FFF" /> : <Text style={styles.submitBtnText}>SAVE CHANGES</Text>}
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const getStyles = (theme: any) => StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.background },
  header: { padding: 24, paddingTop: Platform.OS === 'ios' ? 20 : 40, flexDirection: 'row', alignItems: 'center', backgroundColor: theme.surface, borderBottomWidth: 1, borderBottomColor: theme.border },
  headerTitle: { fontSize: 22, fontWeight: '800', color: theme.textMain, marginLeft: 16 },
  label: { fontSize: 13, fontWeight: '700', color: theme.textMuted, textTransform: 'uppercase', marginBottom: 8, marginTop: 16 },
  mediaBtn: { backgroundColor: theme.surface, borderRadius: 12, borderWidth: 1, borderColor: theme.border, height: 100, justifyContent: 'center', alignItems: 'center', overflow: 'hidden', borderStyle: 'dashed' },
  preview: { width: '100%', height: '100%' },
  input: { backgroundColor: theme.surface, borderRadius: 12, borderWidth: 1, borderColor: theme.border, paddingHorizontal: 16, paddingVertical: 12, fontSize: 16, color: theme.textMain, marginBottom: 16 },
  footer: { padding: 20, backgroundColor: theme.surface, borderTopWidth: 1, borderTopColor: theme.border },
  submitBtn: { backgroundColor: theme.primary, padding: 18, borderRadius: 12, alignItems: 'center' },
  submitBtnText: { color: '#FFF', fontWeight: 'bold', fontSize: 16 }
});

export default SocietyBrandingScreen;