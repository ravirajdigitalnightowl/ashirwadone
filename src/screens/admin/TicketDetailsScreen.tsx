
import React, { useState, useContext, useEffect, useRef } from 'react';
import { View, Text, SafeAreaView, ScrollView, TouchableOpacity, TextInput, StyleSheet, Platform, Alert, Animated, KeyboardAvoidingView, ActivityIndicator, Image, Modal } from 'react-native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import Video from 'react-native-video';
import { ThemeContext } from '../../context/ThemeContext';
import { ThemeColors } from '../../theme/colors';

// Real Hooks Import
import { useTicketDetails, useWorkers, useAssignTicket, useDepartments } from '../../hooks/useAdmin';

interface RouteParams {
  route: { params: { ticketId: string } };
  navigation: any;
}

const TicketDetailsScreen: React.FC<RouteParams> = ({ route, navigation }) => {
  const { ticketId } = route.params;
  const { theme } = useContext(ThemeContext);
  const styles = getStyles(theme);

  // Data Fetching
  const { data: ticketRes, isLoading: loadingTicket } = useTicketDetails(ticketId);
  const ticketData = ticketRes?.data?.ticket;

  // FETCH DEPARTMENTS & WORKERS
  const { data: deptData, isLoading: loadingDepts } = useDepartments();
  const { data: workersRes } = useWorkers(); 
  
  const activeDepartments = deptData?.data?.departments?.filter((d: any) => d.isActive) || [];
  const availableWorkers = workersRes?.data?.workers || [];

  // Mutations
  const { mutate: assignTicket, isPending: isAssigning } = useAssignTicket(() => navigation.goBack());

  // Local States
  const [status, setStatus] = useState<string>('');
  const [selectedDept, setSelectedDept] = useState<string | null>(null);
  const [assignedWorker, setAssignedWorker] = useState<string | null>(null);
  const [adminNoteForWorker, setAdminNoteForWorker] = useState('');
  const [adminNoteForResident, setAdminNoteForResident] = useState('');
  
  // Media Modal State
  const [mediaModalVisible, setMediaModalVisible] = useState(false);
  
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (ticketData) {
      setStatus(ticketData.status);
      if (ticketData.assignedTo) {
        setAssignedWorker(ticketData.assignedTo._id);
        setSelectedDept(ticketData.assignedTo.department || null);
      } else {
        setSelectedDept(ticketData.category || null);
      }
      if (ticketData.adminNoteForWorker) setAdminNoteForWorker(ticketData.adminNoteForWorker);
      if (ticketData.adminNoteForResident) setAdminNoteForResident(ticketData.adminNoteForResident);
      Animated.timing(fadeAnim, { toValue: 1, duration: 400, useNativeDriver: true }).start();
    }
  }, [ticketData]);

  const filteredWorkers = availableWorkers.filter((worker: any) => worker.department === selectedDept);
  const isVideo = ticketData?.mediaUrl && (ticketData.mediaUrl.includes('.mp4') || ticketData.mediaUrl.includes('.mov'));

  const handleUpdate = () => {
    if (!assignedWorker) {
      Alert.alert('Missing Worker', 'Please select a department and assign a worker to this ticket.');
      return;
    }
    assignTicket({ ticketId, workerId: assignedWorker!, adminNoteForWorker, adminNoteForResident });
  };

  const StatusButton = ({ title, color, icon }: any) => {
    const isSelected = status === title;
    return (
      <TouchableOpacity 
        style={[styles.statusBtn, isSelected && { backgroundColor: color, borderColor: color }]}
        onPress={() => setStatus(title)}
        activeOpacity={0.8}
        disabled={isAssigning}
      >
        <MaterialCommunityIcons name={icon} size={18} color={isSelected ? '#FFF' : color} style={styles.statusIcon} />
        <Text style={[styles.statusBtnText, isSelected && { color: '#FFF' }]}>{title}</Text>
      </TouchableOpacity>
    );
  };

  if (loadingTicket) return <SafeAreaView style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}><ActivityIndicator size="large" color={theme.primary} /></SafeAreaView>;
  if (!ticketData) return null;

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1 }}>
        <View style={styles.header}>
          <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()} disabled={isAssigning}>
            <MaterialCommunityIcons name="arrow-left" size={28} color={theme.textMain} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Manage Ticket</Text>
        </View>

        <Animated.View style={{ flex: 1, opacity: fadeAnim }}>
          <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
            <View style={styles.card}>
              <View style={styles.cardHeader}>
                <Text style={styles.ticketId}>#{ticketData._id.slice(-6).toUpperCase()}</Text>
                {/* 🔥 UPDATE: Date ke sath time display kiya gaya hai */}
                <Text style={styles.dateText}>
                  {new Date(ticketData.createdAt).toLocaleString([], { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                </Text>
              </View>
              <Text style={styles.title}>{ticketData.title}</Text>
              <View style={styles.tagContainer}>
                <MaterialCommunityIcons name="tag-outline" size={14} color={theme.primary} />
                <Text style={styles.tagText}>{ticketData.category}</Text>
              </View>
              <Text style={styles.description}>{ticketData.description}</Text>

              {/* MEDIA SECTION */}
              {ticketData.mediaUrl ? (
                <View style={{ marginTop: 20 }}>
                  <Text style={{ fontSize: 13, color: theme.textMuted, marginBottom: 8, fontWeight: 'bold' }}>ATTACHED MEDIA</Text>
                  <TouchableOpacity activeOpacity={0.8} onPress={() => setMediaModalVisible(true)}>
                    <Image
                      source={{ uri: ticketData.mediaUrl.replace('.mp4', '.jpg').replace('.mov', '.jpg') }} 
                      style={{ width: '100%', height: 220, borderRadius: 12, backgroundColor: theme.border }}
                      resizeMode="cover"
                    />
                    {isVideo && <View style={styles.playIconOverlay}><MaterialCommunityIcons name="play" size={32} color="#FFF" /></View>}
                  </TouchableOpacity>
                </View>
              ) : null}

              <View style={styles.divider} />
              <View style={styles.residentInfo}>
                <MaterialCommunityIcons name="account-circle" size={40} color={theme.iconMuted} />
                <View style={styles.residentDetails}>
                  <Text style={styles.residentName}>{ticketData.createdBy?.name || 'Resident'}</Text>
                  <Text style={styles.residentFlat}>
                    {ticketData.createdBy?.tower ? `Tower ${ticketData.createdBy?.tower}, ` : ''}Flat {ticketData.createdBy?.flatNo || 'N/A'} • {ticketData.createdBy?.phone}
                  </Text>
                </View>
              </View>
            </View>

            <Text style={styles.sectionTitle}>1. Select Department</Text>
            {loadingDepts ? <ActivityIndicator size="small" color={theme.primary} /> : (
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.deptScroll}>
                {activeDepartments.map((dept: any) => (
                  <TouchableOpacity key={dept._id} style={[styles.deptChip, selectedDept === dept.name && { backgroundColor: theme.primary }]} onPress={() => { setSelectedDept(dept.name); setAssignedWorker(null); }}>
                    <Text style={[styles.deptChipText, selectedDept === dept.name && { color: '#FFF' }]}>{dept.name}</Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            )}

            <Text style={styles.sectionTitle}>2. Assign Staff</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.workerScroll}>
              {filteredWorkers.map((worker: any) => (
                <TouchableOpacity 
                  key={worker._id} 
                  style={[styles.workerChip, assignedWorker === worker._id && { backgroundColor: theme.primary, borderColor: theme.primary }]} 
                  onPress={() => { setAssignedWorker(worker._id); if (status === 'Pending') setStatus('In-Progress'); }}
                >
                  <View style={{ alignItems: 'flex-start' }}>
                    <Text style={[styles.workerChipText, assignedWorker === worker._id && { color: '#FFF' }]}>
                      {worker.name}
                    </Text>
                    
                    <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 4 }}>
                      <View style={{ width: 6, height: 6, borderRadius: 3, backgroundColor: worker.isOnDuty ? theme.status.resolved : theme.textMuted, marginRight: 4 }} />
                      <Text style={{ 
                        fontSize: 10, 
                        fontWeight: '700', 
                        color: assignedWorker === worker._id ? '#FFFFFF90' : (worker.isOnDuty ? theme.status.resolved : theme.textMuted) 
                      }}>
                        {worker.isOnDuty ? 'ON DUTY' : 'OFF Duty'}
                      </Text>
                    </View>
                  </View>
                </TouchableOpacity>
              ))}
            </ScrollView>

            <Text style={styles.sectionTitle}>Change Status</Text>
            <View style={styles.statusSelector}>
              <StatusButton title="Pending" color={theme.status.pending} icon="alert-circle-outline" />
              <StatusButton title="In-Progress" color={theme.status.inProgress} icon="tools" />
              <StatusButton title="Resolved" color={theme.status.resolved} icon="check-circle-outline" />
            </View>

            {/* COMMUNICATION SECTION */}
            <Text style={styles.sectionTitle}>Communication</Text>
            
            <Text style={styles.inputLabel}>Internal Note (For Staff) 👨‍🔧</Text>
            <TextInput 
              style={styles.textArea} 
              placeholder="e.g. Please check the leakage in the master bedroom." 
              value={adminNoteForWorker} 
              onChangeText={setAdminNoteForWorker} 
              multiline 
              textAlignVertical="top" 
            />
            
            <Text style={styles.inputLabel}>Public Update (For Resident) 🏠</Text>
            <TextInput 
              style={styles.textArea} 
              placeholder="e.g. A plumber has been assigned and will arrive shortly." 
              value={adminNoteForResident} 
              onChangeText={setAdminNoteForResident} 
              multiline 
              textAlignVertical="top" 
            />

          </ScrollView>

          <View style={styles.footer}>
            <TouchableOpacity style={styles.updateBtn} onPress={handleUpdate} disabled={isAssigning}>
              {isAssigning ? <ActivityIndicator color="#FFF" /> : <Text style={styles.updateBtnText}>ASSIGN & UPDATE</Text>}
            </TouchableOpacity>
          </View>
        </Animated.View>

        {/* MEDIA MODAL */}
        <Modal visible={mediaModalVisible} transparent={true} animationType="fade" onRequestClose={() => setMediaModalVisible(false)}>
          <SafeAreaView style={{ flex: 1, backgroundColor: '#000' }}>
            <TouchableOpacity style={{ position: 'absolute', top: 40, right: 20, zIndex: 1 }} onPress={() => setMediaModalVisible(false)}>
              <MaterialCommunityIcons name="close-circle" size={36} color="#FFF" />
            </TouchableOpacity>
            <View style={{ flex: 1, justifyContent: 'center' }}>
              {isVideo ? (
                <Video source={{ uri: ticketData.mediaUrl }} style={{ width: '100%', height: 300 }} controls resizeMode="contain" />
              ) : (
                <Image source={{ uri: ticketData.mediaUrl }} style={{ width: '100%', height: '80%' }} resizeMode="contain" />
              )}
            </View>
          </SafeAreaView>
        </Modal>

      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const getStyles = (theme: ThemeColors) => StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.background },
  header: { padding: 24, flexDirection: 'row', alignItems: 'center', backgroundColor: theme.surface, borderBottomWidth: 1, borderBottomColor: theme.border, paddingTop: Platform.OS === 'ios' ? 20 : 40 },
  headerTitle: { fontSize: 22, fontWeight: '800', color: theme.textMain },
  scrollContent: { padding: 20, paddingBottom: 40 },
  card: { backgroundColor: theme.surface, padding: 20, borderRadius: 16, marginBottom: 24 },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  ticketId: { fontSize: 14, fontWeight: '800', color: theme.primary },
  dateText: { fontSize: 12, color: theme.textMuted },
  title: { fontSize: 20, fontWeight: '700', color: theme.textMain, marginBottom: 8 },
  tagContainer: { flexDirection: 'row', alignItems: 'center', backgroundColor: theme.primaryLight, alignSelf: 'flex-start', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 6, marginBottom: 12 },
  tagText: { color: theme.primary, fontSize: 12, fontWeight: '700', marginLeft: 4 },
  description: { fontSize: 15, color: theme.textMuted, lineHeight: 22 },
  divider: { height: 1, backgroundColor: theme.border, marginVertical: 16 },
  residentInfo: { flexDirection: 'row', alignItems: 'center' },
  residentDetails: { flex: 1, marginLeft: 12 },
  residentName: { fontSize: 16, fontWeight: '700', color: theme.textMain },
  residentFlat: { fontSize: 13, color: theme.textMuted, marginTop: 2 },
  sectionTitle: { fontSize: 14, fontWeight: '700', color: theme.textMain, textTransform: 'uppercase', marginBottom: 12 },
  
  inputLabel: { fontSize: 13, fontWeight: 'bold', color: theme.textMuted, marginBottom: 8, marginLeft: 4 },
  
  deptScroll: { marginBottom: 20 },
  deptChip: { backgroundColor: theme.surface, borderWidth: 1.5, borderColor: theme.border, paddingVertical: 8, paddingHorizontal: 16, borderRadius: 20, marginRight: 12 },
  deptChipText: { fontSize: 13, fontWeight: '700', color: theme.textMuted },
  workerScroll: { marginBottom: 24 },
  workerChip: { flexDirection: 'column', justifyContent: 'center', backgroundColor: theme.surface, borderWidth: 1.5, borderColor: theme.border, paddingVertical: 10, paddingHorizontal: 16, borderRadius: 20, marginRight: 12 },
  workerChipText: { fontSize: 14, fontWeight: '600', color: theme.textMain },
  statusSelector: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 24 },
  statusBtn: { flex: 1, paddingVertical: 12, borderWidth: 1.5, borderColor: theme.border, borderRadius: 10, marginHorizontal: 4, alignItems: 'center' },
  statusBtnText: { fontSize: 12, fontWeight: '700', color: theme.textMuted },
  statusIcon: { marginRight: 4 },
  textArea: { backgroundColor: theme.surface, padding: 16, borderRadius: 12, borderWidth: 1.5, borderColor: theme.border, fontSize: 15, color: theme.textMain, minHeight: 90, marginBottom: 20 }, 
  footer: { padding: 20, backgroundColor: theme.surface, borderTopWidth: 1, borderTopColor: theme.border },
  updateBtn: { backgroundColor: theme.primary, padding: 18, borderRadius: 12, alignItems: 'center' },
  updateBtnText: { color: '#FFF', fontSize: 16, fontWeight: 'bold' },
  playIconOverlay: { position: 'absolute', top: '40%', left: '42%', backgroundColor: 'rgba(0,0,0,0.6)', padding: 12, borderRadius: 50 }
});

export default TicketDetailsScreen;