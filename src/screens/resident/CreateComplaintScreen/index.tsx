

import React, { useState, useContext } from 'react';
import { View, Text, TextInput, TouchableOpacity, SafeAreaView, ScrollView, KeyboardAvoidingView, Platform, Alert, ActivityIndicator, StyleSheet } from 'react-native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { launchImageLibrary, MediaType, ImageLibraryOptions } from 'react-native-image-picker'; 
import { ThemeContext } from '../../../context/ThemeContext';
import { ThemeColors } from '../../../theme/colors';

// Real Hooks Import
import { useCreateTicket, useCategories } from '../../../hooks/useResident';

const CreateComplaintScreen: React.FC<{ navigation: any }> = ({ navigation }) => {
  const { theme } = useContext(ThemeContext);
  const styles = getStyles(theme);
  
  const [formData, setFormData] = useState({ title: '', category: '', description: '' });
  const [focusedInput, setFocusedInput] = useState<string | null>(null);
  const [media, setMedia] = useState<any>(null);

  const { mutate: createTicket, isPending } = useCreateTicket(() => {
    navigation.goBack(); 
  });

  const { data: categoryData, isLoading: loadingCategories } = useCategories();
  const activeCategories = categoryData?.data?.departments?.filter((d: any) => d.isActive) || [];

  const pickMedia = () => {
    const options: ImageLibraryOptions = {
      mediaType: 'mixed' as MediaType,
      quality: 0.7,
      selectionLimit: 1,
    };

    launchImageLibrary(options, (response) => {
      if (response.didCancel) {
        console.log('User cancelled media picker');
      } else if (response.errorCode) {
        Alert.alert('Error', response.errorMessage || 'Something went wrong while picking media.');
      } else if (response.assets && response.assets.length > 0) {
        const asset = response.assets[0];

        // 🛑 1. File Size Validation (Max 50MB)
        const MAX_SIZE = 50 * 1024 * 1024; // 50MB in bytes
        if (asset.fileSize && asset.fileSize > MAX_SIZE) {
          Alert.alert(
            'File Too Large', 
            'The selected file is too large. Maximum allowed file size is 50MB.'
          );
          return;
        }

        // 🛑 2. File Format Validation (JPG, PNG, MP4, MOV)
        const filename = asset.fileName || asset.uri?.split('/').pop() || '';
        const ext = filename.split('.').pop()?.toLowerCase();
        const allowedExtensions = ['jpg', 'jpeg', 'png', 'mp4', 'mov'];

        if (ext && !allowedExtensions.includes(ext)) {
          Alert.alert(
            'Unsupported Format', 
            'Please select a valid file. Only JPG, PNG images and MP4, MOV videos are allowed.'
          );
          return;
        }

        // Agar sab sahi hai toh state me set karo
        setMedia(asset);
      }
    });
  };

  const handleSubmit = () => {
    if (!formData.title || !formData.category || !formData.description) {
      Alert.alert('Incomplete Details', 'Please fill out all the fields (Title, Category, and Description) before submitting.');
      return;
    }
    
    const payload = new FormData();
    payload.append('title', formData.title);
    payload.append('category', formData.category);
    payload.append('description', formData.description);

    if (media && media.uri) {
      const localUri = media.uri;
      const filename = media.fileName || localUri.split('/').pop() || `upload_${Date.now()}.jpg`;
      
      // 🔥 FIXED: Smart MIME Type Detection for Videos (Cloudinary Fix)
      let mimeType = media.type;
      if (!mimeType) {
        const ext = filename.split('.').pop()?.toLowerCase();
        if (ext === 'mp4') mimeType = 'video/mp4';
        else if (ext === 'mov') mimeType = 'video/quicktime';
        else mimeType = 'image/jpeg'; // Default fallback
      }

      payload.append('media', {
        uri: Platform.OS === 'ios' ? localUri.replace('file://', '') : localUri,
        name: filename,
        type: mimeType,
      } as any);
    }

    createTicket(payload);
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1 }}>
        
        <View style={styles.header}>
          <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()} disabled={isPending}>
            <MaterialCommunityIcons name="arrow-left" size={28} color={theme.textMain} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>New Request</Text>
        </View>

        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          
          {/* TITLE INPUT */}
          <View style={styles.inputContainer}>
            <View style={styles.labelContainer}>
              <MaterialCommunityIcons name="format-title" size={18} color={theme.iconPrimary} />
              <Text style={styles.label}>Issue Title</Text>
            </View>
            <TextInput
              style={[styles.input, focusedInput === 'title' && styles.inputFocused]}
              placeholder="e.g. Broken elevator glass"
              placeholderTextColor={theme.textMuted}
              onFocus={() => setFocusedInput('title')}
              onBlur={() => setFocusedInput(null)}
              onChangeText={(text) => setFormData({ ...formData, title: text })}
              value={formData.title}
              editable={!isPending}
            />
          </View>

          {/* DYNAMIC CATEGORY SELECTION */}
          <View style={styles.inputContainer}>
            <View style={styles.labelContainer}>
              <MaterialCommunityIcons name="tag-outline" size={18} color={theme.iconPrimary} />
              <Text style={styles.label}>Select Category</Text>
            </View>
            
            {loadingCategories ? (
              <ActivityIndicator color={theme.primary} style={{ alignSelf: 'flex-start', marginVertical: 10 }} />
            ) : (
              <View style={styles.chipContainer}>
                {activeCategories.map((cat: any) => {
                  const isSelected = formData.category === cat.name;
                  return (
                    <TouchableOpacity
                      key={cat._id}
                      style={[styles.chip, isSelected && { backgroundColor: theme.primary, borderColor: theme.primary }]}
                      onPress={() => setFormData({ ...formData, category: cat.name })}
                      activeOpacity={0.8}
                      disabled={isPending}
                    >
                      <Text style={[styles.chipText, isSelected && { color: '#FFFFFF' }]}>
                        {cat.name}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
                {activeCategories.length === 0 && (
                  <Text style={{ color: theme.textMuted, fontStyle: 'italic', marginTop: 8 }}>
                    No categories available.
                  </Text>
                )}
              </View>
            )}
          </View>

          {/* DESCRIPTION INPUT */}
          <View style={styles.inputContainer}>
            <View style={styles.labelContainer}>
              <MaterialCommunityIcons name="text-box-outline" size={18} color={theme.iconPrimary} />
              <Text style={styles.label}>Detailed Description</Text>
            </View>
            <TextInput
              style={[styles.input, styles.textArea, focusedInput === 'desc' && styles.inputFocused]}
              placeholder="Please explain the issue..."
              placeholderTextColor={theme.textMuted}
              multiline
              textAlignVertical="top"
              onFocus={() => setFocusedInput('desc')}
              onBlur={() => setFocusedInput(null)}
              onChangeText={(text) => setFormData({ ...formData, description: text })}
              value={formData.description}
              editable={!isPending}
            />
          </View>

          {/* MEDIA UPLOAD BUTTON */}
          <TouchableOpacity 
            activeOpacity={0.7} 
            style={styles.uploadBtn} 
            disabled={isPending}
            onPress={pickMedia}
          >
            {media ? (
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <MaterialCommunityIcons name="check-circle" size={24} color={theme.status.resolved} style={{ marginRight: 8 }} />
                <Text style={[styles.uploadBtnText, { color: theme.primary }]}>
                  Media Selected
                </Text>
              </View>
            ) : (
              <>
                <MaterialCommunityIcons name="image-plus" size={24} color={theme.primary} />
                <Text style={styles.uploadBtnText}>Attach Image/Video</Text>
              </>
            )}
          </TouchableOpacity>

          {/* 🔥 NEW: Validation Helper Text */}
          <Text style={{ 
            fontSize: 12, 
            color: theme.textMuted, 
            textAlign: 'center', 
            marginTop: -20, 
            marginBottom: 24 
          }}>
            Max size: 50MB • Supported formats: JPG, PNG, MP4, MOV
          </Text>

          {/* SUBMIT BUTTON */}
          <TouchableOpacity 
            activeOpacity={0.8} 
            style={[styles.submitBtn, isPending && { opacity: 0.7 }]} 
            onPress={handleSubmit}
            disabled={isPending}
          >
            {isPending ? (
              <ActivityIndicator color="#FFF" />
            ) : (
              <>
                <MaterialCommunityIcons name="send" size={20} color="#FFFFFF" style={{ marginRight: 8 }} />
                <Text style={styles.submitBtnText}>SUBMIT TICKET</Text>
              </>
            )}
          </TouchableOpacity>

        </ScrollView>
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
  
  inputContainer: { marginBottom: 24 },
  labelContainer: { flexDirection: 'row', alignItems: 'center', marginBottom: 10 },
  label: { fontSize: 14, fontWeight: '700', color: theme.textMain, marginLeft: 6 },
  
  input: { backgroundColor: theme.surface, borderRadius: 12, borderWidth: 1.5, borderColor: theme.border, padding: 16, fontSize: 16, color: theme.textMain },
  inputFocused: { borderColor: theme.primary },
  textArea: { minHeight: 120 },
  
  chipContainer: { flexDirection: 'row', flexWrap: 'wrap', marginTop: 4 },
  chip: { backgroundColor: theme.surface, borderWidth: 1.5, borderColor: theme.border, paddingVertical: 10, paddingHorizontal: 16, borderRadius: 20, marginRight: 12, marginBottom: 12 },
  chipText: { fontSize: 14, fontWeight: '600', color: theme.textMuted },

  uploadBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', backgroundColor: theme.primaryLight, padding: 16, borderRadius: 12, borderWidth: 1.5, borderColor: theme.primary + '50', marginBottom: 30, borderStyle: 'dashed' },
  uploadBtnText: { color: theme.primary, fontSize: 16, fontWeight: 'bold', marginLeft: 8 },
  
  submitBtn: { flexDirection: 'row', backgroundColor: theme.primary, padding: 18, borderRadius: 12, alignItems: 'center', justifyContent: 'center', shadowColor: theme.primary, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 8, elevation: 5 },
  submitBtnText: { color: '#FFFFFF', fontSize: 16, fontWeight: 'bold', letterSpacing: 1 },
});

export default CreateComplaintScreen;