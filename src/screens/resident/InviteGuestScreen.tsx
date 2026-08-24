// // src/screens/resident/InviteGuestScreen.tsx
import React, { useState, useContext } from 'react';
import { View, Text, SafeAreaView, TouchableOpacity, TextInput, StyleSheet, ScrollView, Modal, Platform, ActivityIndicator, Alert } from 'react-native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { ThemeContext } from '../../context/ThemeContext';
import { ThemeColors } from '../../theme/colors';
import { useInviteVisitor } from '../../hooks/useVisitor';

const InviteGuestScreen = ({ navigation }: any) => {
  const { theme } = useContext(ThemeContext);
  const styles = getStyles(theme);

  // 🔥 NAYA: 'name' hataya, 'purpose' add kiya
  const [formData, setFormData] = useState({ visitorType: 'Guest', purpose: '', phone: '', vehicleNo: '' });
  
  // 🔥 NAYE STATES: Multiple Names (Chips) handle karne ke liye
  const [namesList, setNamesList] = useState<string[]>([]);
  const [currentName, setCurrentName] = useState('');

  const [generatedPasscode, setGeneratedPasscode] = useState<string | null>(null);

  const { mutate: inviteVisitor, isPending } = useInviteVisitor((data) => {
    setGeneratedPasscode(data.data.passcode); 
  });

  // 🔥 Name Add Karna
  const handleAddName = () => {
    if (currentName.trim() !== '') {
      setNamesList([...namesList, currentName.trim()]);
      setCurrentName('');
    }
  };

  // 🔥 Name Remove Karna
  const handleRemoveName = (index: number) => {
    setNamesList(namesList.filter((_, i) => i !== index));
  };

  // 🔥 Name Edit Karna
  const handleEditName = (index: number) => {
    setCurrentName(namesList[index]);
    setNamesList(namesList.filter((_, i) => i !== index));
  };

  const handleInvite = () => {
    let finalNames = [...namesList];
    if (currentName.trim() !== '') {
      finalNames.push(currentName.trim());
    }

    const nameString = finalNames.join(', ');

    if (!nameString) {
      Alert.alert('Missing Info', 'Please enter at least one guest name.');
      return;
    }

    // Backend payload mein comma-separated name aur purpose bhej rahe hain
    inviteVisitor({
      ...formData,
      name: nameString
    });
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <MaterialCommunityIcons name="arrow-left" size={28} color={theme.textMain} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Pre-Approve Entry</Text>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.infoText}>
          Generate a 6-digit passcode for your guest. They can show this at the main gate for instant entry without any calls.
        </Text>

        <Text style={styles.sectionLabel}>Visitor Type</Text>
        <View style={styles.chipContainer}>
          {['Guest', 'Delivery', 'Cab', 'Service', 'Other'].map((type) => (
            <TouchableOpacity 
              key={type} 
              style={[styles.typeChip, formData.visitorType === type && { backgroundColor: theme.primary, borderColor: theme.primary }]}
              onPress={() => setFormData({ ...formData, visitorType: type })}
            >
              <Text style={[styles.typeChipText, formData.visitorType === type && { color: '#FFF' }]}>{type}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* 🔥 NAYA UI: Multiple Names Tags / Chips */}
        <Text style={styles.sectionLabel}>Guest Names *</Text>
        
        {namesList.length > 0 && (
          <View style={styles.namesWrapper}>
            {namesList.map((name, index) => (
              <View key={index} style={styles.nameChip}>
                <TouchableOpacity onPress={() => handleEditName(index)} activeOpacity={0.6}>
                  <Text style={styles.nameChipText}>{name}</Text>
                </TouchableOpacity>
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
            onSubmitEditing={handleAddName}
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
                field === 'phone' ? 'Phone Number (Optional)' : 'Vehicle No (Optional)'
              }
              placeholderTextColor={theme.textMuted}
              keyboardType={field === 'phone' ? 'phone-pad' : 'default'}
              value={(formData as any)[field]}
              onChangeText={(t) => setFormData({ ...formData, [field]: t })}
            />
          </View>
        ))}

      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity 
          style={[styles.submitBtn, (namesList.length === 0 && currentName.trim() === '') && { opacity: 0.6 }]} 
          onPress={handleInvite} 
          disabled={isPending || (namesList.length === 0 && currentName.trim() === '')}
        >
          {isPending ? <ActivityIndicator color="#FFF" /> : <Text style={styles.submitBtnText}>GENERATE PASSCODE</Text>}
        </TouchableOpacity>
      </View>

      {/* 🔥 SUCCESS MODAL SHOWING PASSCODE */}
      <Modal visible={!!generatedPasscode} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.successIconBox}>
              <MaterialCommunityIcons name="check-decagram" size={60} color={theme.status.resolved} />
            </View>
            <Text style={styles.modalTitle}>Invite Created!</Text>
            
            {/* Conditional Subtitle for single/multiple guests */}
            <Text style={styles.modalSub}>
              Share this code with {namesList.length > 1 ? 'your guests' : (namesList[0] || currentName)}
            </Text>
            
            <View style={styles.passcodeBox}>
              <Text style={styles.passcodeText}>{generatedPasscode}</Text>
            </View>
            
            <TouchableOpacity 
              style={styles.doneBtn} 
              onPress={() => {
                setGeneratedPasscode(null);
                navigation.goBack(); 
              }}
            >
              <Text style={styles.doneBtnText}>DONE</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

    </SafeAreaView>
  );
};

const getStyles = (theme: ThemeColors) => StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.background },
  header: { padding: 24, paddingTop: Platform.OS === 'ios' ? 20 : 40, flexDirection: 'row', alignItems: 'center', backgroundColor: theme.surface, borderBottomWidth: 1, borderBottomColor: theme.border },
  backBtn: { marginRight: 16 },
  headerTitle: { fontSize: 22, fontWeight: '800', color: theme.textMain },
  content: { padding: 20 },
  infoText: { fontSize: 14, color: theme.textMuted, lineHeight: 22, marginBottom: 24, backgroundColor: theme.primaryLight + '20', padding: 16, borderRadius: 12, borderWidth: 1, borderColor: theme.primaryLight },
  sectionLabel: { fontSize: 13, fontWeight: '700', color: theme.textMuted, textTransform: 'uppercase', marginBottom: 10, marginTop: 10 },
  
  inputContainer: { backgroundColor: theme.surface, borderRadius: 12, borderWidth: 1, borderColor: theme.border, marginBottom: 16, paddingHorizontal: 16 },
  input: { paddingVertical: 14, fontSize: 16, color: theme.textMain },
  
  chipContainer: { flexDirection: 'row', flexWrap: 'wrap', marginBottom: 20 },
  typeChip: { backgroundColor: theme.surface, borderWidth: 1, borderColor: theme.border, paddingVertical: 10, paddingHorizontal: 16, borderRadius: 20, marginRight: 10, marginBottom: 10 },
  typeChipText: { fontSize: 14, fontWeight: '600', color: theme.textMuted },
  
  // 🔥 NAMES CHIP STYLES
  namesWrapper: { flexDirection: 'row', flexWrap: 'wrap', marginBottom: 10 },
  nameChip: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    backgroundColor: theme.primaryLight || '#EEF2FF', 
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

  footer: { padding: 20, backgroundColor: theme.surface, borderTopWidth: 1, borderTopColor: theme.border },
  submitBtn: { backgroundColor: theme.primary, padding: 18, borderRadius: 12, alignItems: 'center' },
  submitBtnText: { color: '#FFF', fontWeight: 'bold', fontSize: 16, letterSpacing: 0.5 },
  
  // Modal Styles
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.6)', justifyContent: 'center', alignItems: 'center', padding: 20 },
  modalContent: { backgroundColor: theme.surface, width: '100%', borderRadius: 24, padding: 24, alignItems: 'center', elevation: 10 },
  successIconBox: { marginBottom: 16 },
  modalTitle: { fontSize: 24, fontWeight: '800', color: theme.textMain, marginBottom: 8 },
  modalSub: { fontSize: 15, color: theme.textMuted, marginBottom: 24 },
  passcodeBox: { backgroundColor: theme.background, paddingVertical: 20, paddingHorizontal: 40, borderRadius: 16, borderWidth: 2, borderColor: theme.primary, borderStyle: 'dashed', marginBottom: 24 },
  passcodeText: { fontSize: 40, fontWeight: '900', color: theme.primary, letterSpacing: 8 },
  doneBtn: { backgroundColor: theme.textMain, width: '100%', padding: 16, borderRadius: 12, alignItems: 'center' },
  doneBtnText: { color: theme.background, fontWeight: 'bold', fontSize: 16 }
});

export default InviteGuestScreen;