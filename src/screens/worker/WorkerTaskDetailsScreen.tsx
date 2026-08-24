
import React, { useState, useContext } from 'react';
import { View, Text, SafeAreaView, ScrollView, TouchableOpacity, TextInput, StyleSheet, Platform, Alert, KeyboardAvoidingView, ActivityIndicator, Image, Modal } from 'react-native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import Video from 'react-native-video';
import { ThemeContext } from '../../context/ThemeContext';
import { ThemeColors } from '../../theme/colors';

// Real Hooks Import
import { useWorkerTasks, useCompleteTask } from '../../hooks/useWorker';

const WorkerTaskDetailsScreen = ({ route, navigation }: any) => {
  const { ticketId } = route.params;
  const { theme } = useContext(ThemeContext);
  const styles = getStyles(theme);
  
  // 2 Alag states Worker ke 2 notes ke liye (Sirf naye tasks ke liye)
  const [workerNoteForAdmin, setWorkerNoteForAdmin] = useState('');
  const [workerNoteForResident, setWorkerNoteForResident] = useState('');
  
  const [mediaModalVisible, setMediaModalVisible] = useState(false);

  // Fetch from cached list
  const { data } = useWorkerTasks();
  const taskData = data?.data?.tasks?.find((t: any) => t._id === ticketId);

  // Mutation to complete task
  const { mutate: completeTask, isPending } = useCompleteTask(() => navigation.goBack());

  if (!taskData) return null;

  // 🔥 UPDATE: Task complete ho chuka hai ya nahi, uski state
  const isCompleted = taskData.status === 'Resolved';

  const handleCompleteJob = () => {
    if (!workerNoteForAdmin.trim() || !workerNoteForResident.trim()) {
      Alert.alert('Incomplete Details', 'Please add both internal (Admin) and external (Resident) completion notes before closing this ticket.');
      return;
    }
    
    completeTask({ 
      ticketId, 
      workerNoteForAdmin, 
      workerNoteForResident 
    });
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1 }}>
        
        <View style={styles.header}>
          <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()} disabled={isPending}>
            <MaterialCommunityIcons name="arrow-left" size={28} color={theme.textMain} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Task Overview</Text>
        </View>

        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          
          {/* Issue Details Card */}
          <View style={styles.card}>
            <View style={styles.cardHeader}>
              <Text style={styles.ticketId}>#{taskData._id.slice(-6).toUpperCase()}</Text>
              <View style={styles.timeBadge}>
                <MaterialCommunityIcons name="clock-outline" size={14} color={theme.primary} />
                <Text style={styles.timeText}>
                  {new Date(taskData.updatedAt || taskData.createdAt).toLocaleString([], { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                </Text>
              </View>
            </View>
            
            <Text style={styles.title}>{taskData.title}</Text>
            <Text style={styles.description}>{taskData.description}</Text>

            {/* ATTACHED MEDIA SECTION */}
            {taskData.mediaUrl ? (
              <View style={{ marginTop: 20 }}>
                <Text style={{ fontSize: 13, color: theme.textMuted, marginBottom: 8, fontWeight: 'bold' }}>
                  ATTACHED MEDIA
                </Text>
                <TouchableOpacity 
                  activeOpacity={0.8}
                  onPress={() => setMediaModalVisible(true)} 
                >
                  <Image
                    source={{ uri: taskData.mediaUrl.replace('.mp4', '.jpg').replace('.mov', '.jpg') }} 
                    style={styles.mediaThumbnail}
                    resizeMode="cover"
                  />
                  {(taskData.mediaUrl.includes('.mp4') || taskData.mediaUrl.includes('.mov')) && (
                    <View style={styles.playIconOverlay}>
                      <MaterialCommunityIcons name="play" size={32} color="#FFF" />
                    </View>
                  )}
                </TouchableOpacity>
              </View>
            ) : null}

            {/* ADMIN INSTRUCTIONS VIEWER */}
            {taskData.adminNoteForWorker && (
              <View style={styles.instructionBox}>
                <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 6 }}>
                  <MaterialCommunityIcons name="shield-alert-outline" size={18} color={theme.primary} style={{ marginRight: 6 }} />
                  <Text style={styles.instructionLabel}>Admin Instructions</Text>
                </View>
                <Text style={styles.instructionText}>{taskData.adminNoteForWorker}</Text>
              </View>
            )}
            
            <View style={styles.divider} />
            
            <Text style={styles.sectionTitle}>Resident Details</Text>
            <View style={styles.residentInfo}>
              <MaterialCommunityIcons name="map-marker-radius-outline" size={30} color={theme.primary} />
              <View style={styles.residentDetails}>
                <Text style={styles.residentName}>{taskData.createdBy?.name || 'Resident'}</Text>
                <Text style={styles.residentFlat}>
                  {taskData.createdBy?.tower ? `Tower ${taskData.createdBy.tower}, ` : ''}Flat {taskData.createdBy?.flatNo || 'N/A'}
                </Text>
              </View>
            </View>
          </View>

          {/* Action Center Card */}
          <Text style={styles.sectionLabel}>{isCompleted ? "Completion Report" : "Action Center"}</Text>
          <View style={styles.actionCard}>
            
            {/* 🔥 UPDATE: Read-only Mode if task is Completed */}
            {isCompleted ? (
              <View>
                <View style={styles.resolvedBadgeBox}>
                  <MaterialCommunityIcons name="check-decagram" size={24} color={theme.status.resolved} />
                  <Text style={styles.resolvedBadgeText}>Job Completed Successfully</Text>
                </View>
                
                <Text style={styles.inputLabel}>Internal Note (For Admin) 👨‍💼</Text>
                <View style={styles.readOnlyBox}>
                  <Text style={styles.readOnlyText}>{taskData.workerNoteForAdmin || 'No note provided.'}</Text>
                </View>

                <Text style={[styles.inputLabel, { marginTop: 16 }]}>Public Update (For Resident) 🏠</Text>
                <View style={[styles.readOnlyBox, { marginBottom: 0 }]}>
                  <Text style={styles.readOnlyText}>{taskData.workerNoteForResident || 'No note provided.'}</Text>
                </View>
              </View>
            ) : (
              // Editable Mode if task is In-Progress
              <>
                <Text style={styles.inputLabel}>Internal Note (For Admin) 👨‍💼</Text>
                <TextInput
                  style={styles.textArea}
                  placeholder="e.g. Changed the O-ring, need to order more supplies..."
                  placeholderTextColor={theme.textMuted}
                  multiline
                  textAlignVertical="top"
                  value={workerNoteForAdmin}
                  onChangeText={setWorkerNoteForAdmin}
                  editable={!isPending}
                />

                <Text style={styles.inputLabel}>Public Update (For Resident) 🏠</Text>
                <TextInput
                  style={[styles.textArea, { marginBottom: 24 }]}
                  placeholder="e.g. The leak is fixed and water is turned back on."
                  placeholderTextColor={theme.textMuted}
                  multiline
                  textAlignVertical="top"
                  value={workerNoteForResident}
                  onChangeText={setWorkerNoteForResident}
                  editable={!isPending}
                />
                
                <TouchableOpacity 
                  activeOpacity={0.8} 
                  style={[styles.completeBtn, isPending && { opacity: 0.7 }]} 
                  onPress={handleCompleteJob}
                  disabled={isPending}
                >
                  {isPending ? (
                    <ActivityIndicator color="#FFF" />
                  ) : (
                    <>
                      <MaterialCommunityIcons name="check-circle-outline" size={22} color="#FFF" style={{ marginRight: 8 }} />
                      <Text style={styles.completeBtnText}>MARK AS COMPLETED</Text>
                    </>
                  )}
                </TouchableOpacity>
              </>
            )}
            
          </View>

        </ScrollView>

        {/* MEDIA MODAL VIEWER */}
        <Modal visible={mediaModalVisible} transparent={true} animationType="fade" onRequestClose={() => setMediaModalVisible(false)}>
          <SafeAreaView style={{ flex: 1, backgroundColor: '#000' }}>
            <TouchableOpacity style={{ position: 'absolute', top: 40, right: 20, zIndex: 1 }} onPress={() => setMediaModalVisible(false)}>
              <MaterialCommunityIcons name="close-circle" size={36} color="#FFF" />
            </TouchableOpacity>
            <View style={{ flex: 1, justifyContent: 'center' }}>
              {(taskData.mediaUrl && (taskData.mediaUrl.includes('.mp4') || taskData.mediaUrl.includes('.mov'))) ? (
                <Video source={{ uri: taskData.mediaUrl }} style={{ width: '100%', height: 300 }} controls resizeMode="contain" />
              ) : (
                <Image source={{ uri: taskData.mediaUrl }} style={{ width: '100%', height: '80%' }} resizeMode="contain" />
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
  backBtn: { marginRight: 16 },
  headerTitle: { fontSize: 22, fontWeight: '800', color: theme.textMain },
  scrollContent: { padding: 20, paddingBottom: 40 },
  
  card: { backgroundColor: theme.surface, padding: 20, borderRadius: 16, elevation: 2, marginBottom: 20, shadowColor: theme.shadow, shadowOffset: { width: 0, height: 4 }, shadowOpacity: theme.mode === 'dark' ? 0.2 : 0.05, shadowRadius: 8 },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  ticketId: { fontSize: 14, fontWeight: '800', color: theme.primary },
  timeBadge: { flexDirection: 'row', alignItems: 'center', backgroundColor: theme.primaryLight, paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6 },
  timeText: { color: theme.primary, fontSize: 12, fontWeight: '700', marginLeft: 4 },
  title: { fontSize: 22, fontWeight: '700', color: theme.textMain, marginBottom: 12 },
  description: { fontSize: 15, color: theme.textMuted, lineHeight: 22 },
  
  mediaThumbnail: { width: '100%', height: 220, borderRadius: 12, backgroundColor: theme.border, borderWidth: 1, borderColor: theme.border },
  playIconOverlay: { position: 'absolute', top: '40%', left: '42%', backgroundColor: 'rgba(0,0,0,0.6)', padding: 12, borderRadius: 50 },

  instructionBox: { marginTop: 16, backgroundColor: theme.primaryLight, padding: 16, borderRadius: 12, borderWidth: 1, borderColor: theme.primary + '40' },
  instructionLabel: { fontWeight: 'bold', color: theme.primary, fontSize: 13, textTransform: 'uppercase' },
  instructionText: { color: theme.textMain, fontSize: 14, lineHeight: 20 },

  divider: { height: 1, backgroundColor: theme.border, marginVertical: 16 },
  sectionTitle: { fontSize: 13, fontWeight: '700', color: theme.textMuted, textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 12 },
  residentInfo: { flexDirection: 'row', alignItems: 'center' },
  residentDetails: { flex: 1, marginLeft: 12 },
  residentName: { fontSize: 16, fontWeight: '700', color: theme.textMain },
  residentFlat: { fontSize: 14, color: theme.textMuted, marginTop: 2 },
  
  sectionLabel: { fontSize: 14, fontWeight: '700', color: theme.textMain, textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 12, marginLeft: 4, marginTop: 10 },
  actionCard: { backgroundColor: theme.surface, padding: 20, borderRadius: 16, elevation: 2, shadowColor: theme.shadow, shadowOffset: { width: 0, height: 4 }, shadowOpacity: theme.mode === 'dark' ? 0.2 : 0.05, shadowRadius: 8 },
  
  inputLabel: { fontSize: 13, fontWeight: 'bold', color: theme.textMuted, marginBottom: 8, marginLeft: 4 },
  textArea: { backgroundColor: theme.background, padding: 16, borderRadius: 12, borderWidth: 1, borderColor: theme.border, fontSize: 15, color: theme.textMain, minHeight: 90, marginBottom: 20 },
  
  completeBtn: { flexDirection: 'row', backgroundColor: theme.status.resolved, padding: 18, borderRadius: 12, alignItems: 'center', justifyContent: 'center', shadowColor: theme.status.resolved, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 8, elevation: 5 },
  completeBtnText: { color: '#FFFFFF', fontSize: 16, fontWeight: 'bold', letterSpacing: 1 },

  // 🔥 NAYA: Styles for Read-Only Completed State
  resolvedBadgeBox: { flexDirection: 'row', alignItems: 'center', backgroundColor: theme.status.resolved + '15', padding: 14, borderRadius: 12, marginBottom: 20, borderWidth: 1, borderColor: theme.status.resolved },
  resolvedBadgeText: { color: theme.status.resolved, fontSize: 15, fontWeight: 'bold', marginLeft: 8 },
  readOnlyBox: { backgroundColor: theme.background, padding: 16, borderRadius: 12, borderWidth: 1, borderColor: theme.border, marginBottom: 20 },
  readOnlyText: { fontSize: 15, color: theme.textMain, lineHeight: 22 },
});

export default WorkerTaskDetailsScreen;