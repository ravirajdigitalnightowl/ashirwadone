import React, { useState, useContext, useEffect, useRef } from 'react';
import { View, Text, SafeAreaView, ScrollView, TouchableOpacity, Animated, Image, Modal, StyleSheet } from 'react-native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import Video from 'react-native-video';
import { getStyles } from './styles';
import { ThemeContext } from '../../../context/ThemeContext';

// Hook to read cached tickets
import { useMyTickets } from '../../../hooks/useResident';

const ComplaintDetailScreen: React.FC<{ navigation: any, route: any }> = ({ navigation, route }) => {
  const { ticketId } = route.params;
  const { theme } = useContext(ThemeContext);
  const styles = getStyles(theme);
  const fadeAnim = useRef(new Animated.Value(0)).current;

  // Media Modal State
  const [mediaModalVisible, setMediaModalVisible] = useState(false);

  // React Query Cache se ticket dhundna
  const { data } = useMyTickets();
  const ticketData = data?.data?.tickets?.find((t: any) => t._id === ticketId);

  useEffect(() => {
    Animated.timing(fadeAnim, { toValue: 1, duration: 400, useNativeDriver: true }).start();
  }, [fadeAnim]);

  if (!ticketData) return null;

  const getStatusColor = (status: string) => {
    if (status === 'Pending') return theme.status.pending;
    if (status === 'Resolved') return theme.status.resolved;
    return theme.status.inProgress;
  };

  const isVideo = ticketData.mediaUrl && (ticketData.mediaUrl.includes('.mp4') || ticketData.mediaUrl.includes('.mov'));

  // 🔥 NAYA FIX: Timeline se duplicate entries hatane ka logic
  // Agar admin/worker ne update button 2 baar daba diya, toh ye sirf latest entry dikhayega
  const cleanTimeline = ticketData.timeline?.reduce((acc: any[], current: any) => {
    const isAssign = current.title.toLowerCase().includes('assign');
    const isResolve = current.title.toLowerCase().includes('resol');

    if (isAssign) {
      const existingIndex = acc.findIndex(s => s.title.toLowerCase().includes('assign'));
      if (existingIndex !== -1) acc[existingIndex] = current; // Overwrite with latest
      else acc.push(current);
    } else if (isResolve) {
      const existingIndex = acc.findIndex(s => s.title.toLowerCase().includes('resol'));
      if (existingIndex !== -1) acc[existingIndex] = current; // Overwrite with latest
      else acc.push(current);
    } else {
      acc.push(current);
    }
    return acc;
  }, []);

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <MaterialCommunityIcons name="arrow-left" size={26} color={theme.textMain} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Ticket Details</Text>
      </View>

      <Animated.View style={{ flex: 1, opacity: fadeAnim }}>
        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          
          <View style={styles.statusCard}>
            <View style={styles.metaRow}>
              <Text style={styles.ticketId}>#{ticketData._id.slice(-6).toUpperCase()}</Text>
              <View style={[styles.statusBadge, { backgroundColor: getStatusColor(ticketData.status) }]}>
                <Text style={styles.statusText}>{ticketData.status}</Text>
              </View>
            </View>
            <Text style={styles.title}>{ticketData.title}</Text>
            <Text style={styles.description}>{ticketData.description}</Text>

            {/* ATTACHED MEDIA SECTION */}
            {ticketData.mediaUrl ? (
              <View style={{ marginTop: 20 }}>
                <Text style={{ fontSize: 13, color: theme.textMuted, marginBottom: 8, fontWeight: 'bold' }}>
                  ATTACHED MEDIA
                </Text>
                <TouchableOpacity 
                  activeOpacity={0.8}
                  onPress={() => setMediaModalVisible(true)} 
                >
                  <Image
                    source={{ uri: ticketData.mediaUrl.replace('.mp4', '.jpg').replace('.mov', '.jpg') }} 
                    style={{ width: '100%', height: 220, borderRadius: 12, backgroundColor: theme.border, borderWidth: 1, borderColor: theme.border }}
                    resizeMode="cover"
                  />
                  {isVideo && (
                    <View style={styles.playIconOverlay}>
                      <MaterialCommunityIcons name="play" size={32} color="#FFF" />
                    </View>
                  )}
                </TouchableOpacity>
              </View>
            ) : null}
          </View>

          {/* Assigned Worker Section */}
          {ticketData.assignedTo && ticketData.status !== 'Pending' && (
            <View style={{ marginBottom: 24 }}>
              <Text style={styles.sectionTitle}>Assigned Professional</Text>
              <View style={styles.workerCard}>
                <View style={styles.workerLeft}>
                  <View style={styles.workerIconBg}>
                    <MaterialCommunityIcons name="account-hard-hat" size={24} color={theme.primary} />
                  </View>
                  <View>
                    <Text style={styles.workerName}>{ticketData.assignedTo.name}</Text>
                    <Text style={styles.workerRole}>{ticketData.assignedTo.department || 'Staff'}</Text>
                  </View>
                </View>
              </View>
            </View>
          )}

          {/* Timeline Section */}
          <Text style={styles.sectionTitle}>Activity History</Text>
          <View style={styles.timelineContainer}>
            {/* 🔥 UPDATE: ticketData.timeline ki jagah ab cleanTimeline map ho raha hai */}
            {cleanTimeline?.map((step: any, index: number) => {
              const isLast = index === cleanTimeline.length - 1;
              let displayNote = step.notes;
              let noteLabel = "";
              let labelColor = theme.textMain;

              if (step.title.toLowerCase().includes('assign') && ticketData.adminNoteForResident) {
                displayNote = ticketData.adminNoteForResident;
                noteLabel = "Admin Update:"; 
                labelColor = theme.primary;
              } else if ((step.title.toLowerCase().includes('resol')) && ticketData.workerNoteForResident) {
                displayNote = ticketData.workerNoteForResident;
                noteLabel = "Staff Update:";
                labelColor = theme.status.resolved;
              }

              return (
                <View key={index} style={styles.timelineNode}>
                  <View style={styles.lineStructure}>
                    <View style={[styles.circle, { backgroundColor: theme.primary }]} />
                    {!isLast && <View style={[styles.verticalLine, { backgroundColor: theme.primary }]} />}
                  </View>
                  <View style={styles.nodeContent}>
                    <Text style={[styles.nodeTitle, { color: theme.textMain }]}>{step.title}</Text>
                    <Text style={styles.nodeDate}>
                      {new Date(step.date).toLocaleString([], { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                    </Text>
                    {displayNote ? (
                      <View style={[styles.commentBox, noteLabel ? { backgroundColor: labelColor + '1A', borderColor: labelColor + '30', borderWidth: 1 } : {}]}>
                        {noteLabel ? <Text style={{ fontSize: 12, fontWeight: 'bold', color: labelColor, marginBottom: 4 }}>{noteLabel}</Text> : null}
                        <Text style={[styles.commentText, { color: theme.textMain }]}>{displayNote}</Text>
                      </View>
                    ) : null}
                  </View>
                </View>
              );
            })}
          </View>
        </ScrollView>
      </Animated.View>

      {/* MEDIA MODAL VIEWER */}
      <Modal visible={mediaModalVisible} transparent={true} animationType="fade" onRequestClose={() => setMediaModalVisible(false)}>
        <View style={{ flex: 1, backgroundColor: '#000', justifyContent: 'center' }}>
          <TouchableOpacity style={{ position: 'absolute', top: 50, right: 20, zIndex: 1 }} onPress={() => setMediaModalVisible(false)}>
            <MaterialCommunityIcons name="close-circle" size={36} color="#FFF" />
          </TouchableOpacity>
          {isVideo ? (
            <Video source={{ uri: ticketData.mediaUrl }} style={{ width: '100%', height: 300 }} controls resizeMode="contain" />
          ) : (
            <Image source={{ uri: ticketData.mediaUrl }} style={{ width: '100%', height: '80%' }} resizeMode="contain" />
          )}
        </View>
      </Modal>
    </SafeAreaView>
  );
};

export default ComplaintDetailScreen;