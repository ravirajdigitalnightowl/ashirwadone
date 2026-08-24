import React, { useState, useContext, useEffect } from 'react';
import { View, Text, SafeAreaView, ScrollView, TouchableOpacity, TextInput, StyleSheet, Platform, KeyboardAvoidingView, ActivityIndicator, Alert, Image } from 'react-native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { launchCamera, ImageLibraryOptions } from 'react-native-image-picker'; 
import { ThemeContext } from '../../context/ThemeContext';
import { ThemeColors } from '../../theme/colors';
import { useRequestEntry } from '../../hooks/useVisitor';
import api from '../../services/api';

const AddVisitorScreen = ({ navigation }: any) => {
  const { theme } = useContext(ThemeContext);
  const styles = getStyles(theme);

  // 🔥 NAYA: 'name' ko formData se nikal diya, 'purpose' add kar diya
  const [formData, setFormData] = useState({ visitorType: 'Delivery', purpose: '', phone: '', vehicleNo: '', tower: '', flatNo: '' });
  
  // 🔥 NAYE STATES: Multiple Names (Chips) handle karne ke liye
  const [namesList, setNamesList] = useState<string[]>([]);
  const [currentName, setCurrentName] = useState('');

  const [photo, setPhoto] = useState<any>(null);
  const [suggestions, setSuggestions] = useState<any[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [isSearching, setIsSearching] = useState(false);

  const { mutate: requestEntry, isPending } = useRequestEntry(() => navigation.goBack());

  // Flat suggestions logic
  useEffect(() => {
    const fetchSuggestions = async () => {
      if (!formData.tower && !formData.flatNo) {
        setSuggestions([]);
        setShowSuggestions(false);
        return;
      }
      setIsSearching(true);
      try {
        const res = await api.get(`/visitors/society-flats`, {
          params: { tower: formData.tower, flatNo: formData.flatNo }
        });
        setSuggestions(res.data.data.residents);
        setShowSuggestions(true);
      } catch (err) {
        console.log('Error fetching flat suggestions', err);
      } finally {
        setIsSearching(false);
      }
    };

    const delay = setTimeout(() => {
      fetchSuggestions();
    }, 500);

    return () => clearTimeout(delay);
  }, [formData.tower, formData.flatNo]);

  const handleSelectResident = (resident: any) => {
    setFormData({
      ...formData,
      tower: resident.tower || '',
      flatNo: resident.flatNo || ''
    });
    setShowSuggestions(false);
  };

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

  // 🔥 NAYA: Name add karna (Chip)
  const handleAddName = () => {
    if (currentName.trim() !== '') {
      setNamesList([...namesList, currentName.trim()]);
      setCurrentName(''); // Input clear kar do
    }
  };

  // 🔥 NAYA: Name remove karna
  const handleRemoveName = (index: number) => {
    setNamesList(namesList.filter((_, i) => i !== index));
  };

  // 🔥 NAYA: Name edit karna (Tap karne par wapas input mein layega)
  const handleEditName = (index: number) => {
    setCurrentName(namesList[index]);
    setNamesList(namesList.filter((_, i) => i !== index));
  };

  const handleSubmit = () => {
    // Agar user ne input me kuch likha hai par 'Add' nahi kiya, toh usko bhi consider karenge
    let finalNames = [...namesList];
    if (currentName.trim() !== '') {
      finalNames.push(currentName.trim());
    }

    const nameString = finalNames.join(', '); // Backend ke liye comma se jod diya

    if (!nameString || !formData.flatNo || !photo) {
      Alert.alert('Incomplete', 'At least one Name, Flat Number, and Visitor Photo are mandatory.');
      return;
    }

    const payload = new FormData();
    payload.append('name', nameString); // 🔥 Bheja gaya comma-separated string
    payload.append('visitorType', formData.visitorType);
    payload.append('purpose', formData.purpose); // 🔥 NAYA: Purpose bej rahe hain
    payload.append('phone', formData.phone);
    payload.append('vehicleNo', formData.vehicleNo);
    payload.append('tower', formData.tower);
    payload.append('flatNo', formData.flatNo);
    
    payload.append('photo', {
      uri: Platform.OS === 'ios' ? photo.uri.replace('file://', '') : photo.uri,
      name: photo.fileName || `visitor_${Date.now()}.jpg`,
      type: photo.type || 'image/jpeg',
    } as any);

    requestEntry(payload as any);
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1 }}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn} disabled={isPending}>
            <MaterialCommunityIcons name="arrow-left" size={28} color={theme.textMain} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>New Entry</Text>
        </View>

        <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
          
          <Text style={styles.sectionLabel}>Visitor Photo</Text>
          <TouchableOpacity style={styles.photoBtn} onPress={handleTakePhoto}>
            {photo ? (
              <Image source={{ uri: photo.uri }} style={styles.previewImage} />
            ) : (
              <>
                <MaterialCommunityIcons name="camera-plus" size={40} color={theme.primary} />
                <Text style={styles.photoText}>Capture Photo</Text>
              </>
            )}
          </TouchableOpacity>

          <Text style={styles.sectionLabel}>Visitor Type</Text>
          <View style={styles.chipContainer}>
            {['Delivery', 'Guest', 'Cab', 'Service', 'Other'].map((type) => (
              <TouchableOpacity 
                key={type} 
                style={[styles.chip, formData.visitorType === type && { backgroundColor: theme.primary, borderColor: theme.primary }]}
                onPress={() => setFormData({ ...formData, visitorType: type })}
              >
                <Text style={[styles.chipText, formData.visitorType === type && { color: '#FFF' }]}>{type}</Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* 🔥 NAYA UI: Multiple Names Tags / Chips */}
          <Text style={styles.sectionLabel}>Visitor Names *</Text>
          
          {namesList.length > 0 && (
            <View style={styles.namesWrapper}>
              {namesList.map((name, index) => (
                <View key={index} style={styles.nameChip}>
                  {/* Name par tap karne se Edit mode (wapas input me aayega) */}
                  <TouchableOpacity onPress={() => handleEditName(index)} activeOpacity={0.6}>
                    <Text style={styles.nameChipText}>{name}</Text>
                  </TouchableOpacity>
                  {/* Cross par tap karne se Delete hoga */}
                  <TouchableOpacity onPress={() => handleRemoveName(index)} style={styles.removeIcon}>
                    <MaterialCommunityIcons name="close" size={16} color={theme.primary} />
                  </TouchableOpacity>
                </View>
              ))}
            </View>
          )}

          <View style={[styles.inputContainer, styles.nameInputRow]}>
            <TextInput
              style={[styles.input, { flex: 1 }]}
              placeholder="Enter name"
              placeholderTextColor={theme.textMuted}
              value={currentName}
              onChangeText={setCurrentName}
              onSubmitEditing={handleAddName} // Keyboard enter par add
              returnKeyType="done"
            />
            <TouchableOpacity style={styles.addNameBtn} onPress={handleAddName}>
              <MaterialCommunityIcons name="plus" size={24} color={theme.primary} />
            </TouchableOpacity>
          </View>

          <Text style={styles.sectionLabel}>Additional Details</Text>
          {['purpose', 'phone', 'vehicleNo'].map((field) => (
            <View key={field} style={styles.inputContainer}>
              <TextInput
                style={styles.input}
                placeholder={
                  field === 'purpose' ? 'Purpose of visit (Optional)' : 
                  field === 'phone' ? 'Phone Number (Optional)' : 'Vehicle Number (Optional)'
                }
                placeholderTextColor={theme.textMuted}
                value={(formData as any)[field]}
                onChangeText={(text) => setFormData({ ...formData, [field]: text })}
                keyboardType={field === 'phone' ? 'phone-pad' : 'default'}
              />
            </View>
          ))}

          <Text style={styles.sectionLabel}>Destination Details</Text>
          <View style={{ zIndex: 10 }}>
            {['tower', 'flatNo'].map((field) => (
              <View key={field} style={styles.inputContainer}>
                <TextInput
                  style={styles.input}
                  placeholder={field === 'tower' ? 'Tower (e.g. A)' : 'Flat Number (e.g. 101) *'}
                  placeholderTextColor={theme.textMuted}
                  value={(formData as any)[field]}
                  onChangeText={(text) => setFormData({ ...formData, [field]: text })}
                  onFocus={() => setShowSuggestions(true)}
                />
              </View>
            ))}

            {showSuggestions && (formData.tower || formData.flatNo) ? (
              <View style={styles.suggestionsContainer}>
                {isSearching ? (
                  <ActivityIndicator size="small" color={theme.primary} style={{ padding: 16 }} />
                ) : suggestions.length > 0 ? (
                  suggestions.map((resident) => (
                    <TouchableOpacity 
                      key={resident._id} 
                      style={[styles.suggestionItem, { borderBottomColor: theme.border }]}
                      onPress={() => handleSelectResident(resident)}
                      activeOpacity={0.7}
                    >
                      <MaterialCommunityIcons name="home-account" size={24} color={theme.primary} style={{ marginRight: 12 }} />
                      <View>
                        <Text style={{ color: theme.textMain, fontWeight: 'bold', fontSize: 15 }}>
                          Tower {resident.tower} - Flat {resident.flatNo}
                        </Text>
                        <Text style={{ color: theme.textMuted, fontSize: 13, marginTop: 2 }}>
                          {resident.name}
                        </Text>
                      </View>
                    </TouchableOpacity>
                  ))
                ) : (
                  <Text style={{ padding: 16, color: theme.textMuted, textAlign: 'center', fontStyle: 'italic' }}>
                    No resident found for this address.
                  </Text>
                )}
              </View>
            ) : null}
          </View>

        </ScrollView>

        <View style={styles.footer}>
          <TouchableOpacity style={styles.submitBtn} onPress={handleSubmit} disabled={isPending}>
            {isPending ? <ActivityIndicator color="#FFF" /> : <Text style={styles.submitBtnText}>SEND APPROVAL REQUEST</Text>}
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const getStyles = (theme: ThemeColors) => StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.background },
  header: { padding: 24, flexDirection: 'row', alignItems: 'center', backgroundColor: theme.surface, borderBottomWidth: 1, borderBottomColor: theme.border, paddingTop: Platform.OS === 'ios' ? 20 : 40 },
  backBtn: { marginRight: 16 },
  headerTitle: { fontSize: 22, fontWeight: '800', color: theme.textMain },
  scrollContent: { padding: 20 },
  sectionLabel: { fontSize: 13, fontWeight: '700', color: theme.textMuted, textTransform: 'uppercase', marginBottom: 10, marginTop: 10 },
  
  photoBtn: { backgroundColor: theme.surface, height: 160, borderRadius: 12, borderWidth: 1, borderColor: theme.border, alignItems: 'center', justifyContent: 'center', marginBottom: 16, overflow: 'hidden' },
  previewImage: { width: '100%', height: '100%' },
  photoText: { color: theme.primary, marginTop: 8, fontWeight: 'bold' },

  chipContainer: { flexDirection: 'row', flexWrap: 'wrap', marginBottom: 20 },
  chip: { backgroundColor: theme.surface, borderWidth: 1, borderColor: theme.border, paddingVertical: 10, paddingHorizontal: 16, borderRadius: 20, marginRight: 10, marginBottom: 10 },
  chipText: { fontSize: 14, fontWeight: '600', color: theme.textMuted },
  
  inputContainer: { backgroundColor: theme.surface, borderRadius: 12, borderWidth: 1, borderColor: theme.border, marginBottom: 16, paddingHorizontal: 16 },
  input: { paddingVertical: 14, fontSize: 16, color: theme.textMain },
  
  // 🔥 NAMES CHIP STYLES
  namesWrapper: { flexDirection: 'row', flexWrap: 'wrap', marginBottom: 10 },
  nameChip: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    backgroundColor: theme.primaryLight || '#EEF2FF', // Fallback color
    borderWidth: 1, 
    borderColor: theme.primary,
    borderRadius: 20, 
    paddingVertical: 8, 
    paddingHorizontal: 14, 
    marginRight: 8, 
    marginBottom: 8 
  },
  nameChipText: { color: theme.primary, fontSize: 14, fontWeight: 'bold', marginRight: 6 },
  removeIcon: { padding: 2, backgroundColor: '#FFF', borderRadius: 10 },
  
  nameInputRow: { flexDirection: 'row', alignItems: 'center', paddingRight: 6 },
  addNameBtn: { padding: 8, borderRadius: 50, backgroundColor: theme.primaryLight || '#EEF2FF' },

  suggestionsContainer: { backgroundColor: theme.surface, borderRadius: 12, borderWidth: 1, borderColor: theme.border, marginTop: -10, marginBottom: 16, elevation: 5, shadowColor: theme.shadow || '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.15, shadowRadius: 8, overflow: 'hidden', maxHeight: 250 },
  suggestionItem: { flexDirection: 'row', alignItems: 'center', padding: 14, borderBottomWidth: 1 },

  footer: { padding: 20, backgroundColor: theme.surface, borderTopWidth: 1, borderTopColor: theme.border },
  submitBtn: { backgroundColor: theme.primary, padding: 18, borderRadius: 12, alignItems: 'center' },
  submitBtnText: { color: '#FFF', fontWeight: 'bold', fontSize: 16, letterSpacing: 0.5 },
});

export default AddVisitorScreen;