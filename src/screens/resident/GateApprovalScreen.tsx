// src/screens/resident/GateApprovalScreen.tsx
import React, { useContext, useEffect, useRef, useState } from 'react';
import { View, Text, SafeAreaView, TouchableOpacity, StyleSheet, Animated, ActivityIndicator, Alert, Image, Modal } from 'react-native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import notifee from '@notifee/react-native'; 
import { ThemeContext } from '../../context/ThemeContext';
import { ThemeColors } from '../../theme/colors';

// Hook for API call
import { useRespondToEntry } from '../../hooks/useVisitor';

const GateApprovalScreen = ({ route, navigation }: any) => {
  const { theme } = useContext(ThemeContext);
  const styles = getStyles(theme);

  // 🔥 UPDATE: purpose ko bhi destructure kiya gaya hai
  const { visitorId, visitorName, visitorType, purpose, vehicleNo, photoUrl } = route.params || { 
    visitorId: 'dummy', visitorName: 'Unknown', visitorType: 'Visitor', purpose: '', vehicleNo: '', photoUrl: null 
  };

  const [isImageModalVisible, setImageModalVisible] = useState(false);

  const { mutate: respondToEntry, isPending } = useRespondToEntry(() => {
    navigation.goBack(); 
  });

  // Pulse Animation
  const pulseAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, { toValue: 1.2, duration: 800, useNativeDriver: true }),
        Animated.timing(pulseAnim, { toValue: 1, duration: 800, useNativeDriver: true })
      ])
    ).start();
  }, [pulseAnim]);

  const handleResponse = async (status: 'Approved' | 'Denied') => {
    try {
      await notifee.cancelAllNotifications();
    } catch (error) {
      console.log('Error clearing notification:', error);
    }

    if (visitorId === 'dummy') {
      Alert.alert('Test Mode', `You clicked ${status}`);
      navigation.goBack();
      return;
    }
    respondToEntry({ visitorId, status });
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        
        {/* Top Section: Icon & Animation */}
        <View style={styles.topSection}>
          <Animated.View style={[styles.pulseCircle, { transform: [{ scale: pulseAnim }] }]} />
          <View style={styles.iconContainer}>
            {photoUrl ? (
              <TouchableOpacity 
                activeOpacity={0.8} 
                onPress={() => setImageModalVisible(true)}
              >
                <Image 
                  source={{ uri: photoUrl }} 
                  style={{ width: 120, height: 120, borderRadius: 60 }} 
                  resizeMode="cover"
                />
              </TouchableOpacity>
            ) : (
              <MaterialCommunityIcons 
                name={visitorType === 'Delivery' ? 'bike' : visitorType === 'Cab' ? 'car' : 'account-clock'} 
                size={60} 
                color="#FFF" 
              />
            )}
          </View>
        </View>

        {/* Middle Section: Details */}
        <View style={styles.detailsSection}>
          <Text style={styles.alertText}>GATE ENTRY REQUEST</Text>
          <Text style={styles.visitorName}>{visitorName}</Text>
          <View style={styles.badge}>
            <Text style={styles.badgeText}>{visitorType}</Text>
          </View>
          
          {/* 🔥 NAYA: Purpose display karna */}
          {purpose ? (
            <Text style={styles.purposeText}>Reason: {purpose}</Text>
          ) : null}

          {vehicleNo ? <Text style={styles.vehicleText}>Vehicle: {vehicleNo}</Text> : null}
          <Text style={styles.waitingText}>Waiting at the main gate...</Text>
        </View>

        {/* Bottom Section: Action Buttons */}
        <View style={styles.actionSection}>
          {isPending ? (
            <ActivityIndicator size="large" color="#FFF" />
          ) : (
            <>
              <TouchableOpacity 
                style={[styles.actionBtn, styles.denyBtn]} 
                activeOpacity={0.8}
                onPress={() => handleResponse('Denied')}
              >
                <MaterialCommunityIcons name="close" size={32} color="#FFF" />
                <Text style={styles.btnText}>DENY</Text>
              </TouchableOpacity>

              <TouchableOpacity 
                style={[styles.actionBtn, styles.approveBtn]} 
                activeOpacity={0.8}
                onPress={() => handleResponse('Approved')}
              >
                <MaterialCommunityIcons name="check" size={32} color="#FFF" />
                <Text style={styles.btnText}>APPROVE</Text>
              </TouchableOpacity>
            </>
          )}
        </View>

      </View>

      {/* Full Screen Image Viewer Modal */}
      {photoUrl && (
        <Modal 
          visible={isImageModalVisible} 
          transparent={true} 
          animationType="fade" 
          onRequestClose={() => setImageModalVisible(false)}
        >
          <SafeAreaView style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.95)' }}>
            <TouchableOpacity 
              style={{ position: 'absolute', top: 40, right: 20, zIndex: 1 }} 
              onPress={() => setImageModalVisible(false)}
            >
              <MaterialCommunityIcons name="close-circle" size={36} color="#FFF" />
            </TouchableOpacity>
            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
              <Image 
                source={{ uri: photoUrl }} 
                style={{ width: '100%', height: '80%' }} 
                resizeMode="contain" 
              />
            </View>
          </SafeAreaView>
        </Modal>
      )}

    </SafeAreaView>
  );
};

const getStyles = (theme: ThemeColors) => StyleSheet.create({
  container: { flex: 1, backgroundColor: '#111827' }, 
  content: { flex: 1, justifyContent: 'space-between', padding: 24, paddingTop: 60, paddingBottom: 50 },
  
  topSection: { alignItems: 'center', marginTop: 40 },
  pulseCircle: { position: 'absolute', width: 160, height: 160, borderRadius: 80, backgroundColor: theme.primary, opacity: 0.3 },
  iconContainer: { width: 120, height: 120, borderRadius: 60, backgroundColor: theme.primary, alignItems: 'center', justifyContent: 'center', elevation: 10, shadowColor: theme.primary, shadowOpacity: 0.5, shadowRadius: 15, shadowOffset: { width: 0, height: 0 } },
  
  detailsSection: { alignItems: 'center' },
  alertText: { fontSize: 14, fontWeight: '800', color: theme.textMuted, letterSpacing: 2, marginBottom: 16 },
  visitorName: { fontSize: 36, fontWeight: '900', color: '#FFF', textAlign: 'center', marginBottom: 12 },
  badge: { backgroundColor: theme.primaryLight + '20', paddingHorizontal: 16, paddingVertical: 6, borderRadius: 20, borderWidth: 1, borderColor: theme.primary + '50', marginBottom: 12 },
  badgeText: { color: theme.primaryLight, fontSize: 14, fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: 1 },
  
  // 🔥 NAYA: Purpose text style
  purposeText: { fontSize: 16, color: theme.primaryLight, marginBottom: 8, fontStyle: 'italic', textAlign: 'center', paddingHorizontal: 20 },
  
  vehicleText: { fontSize: 16, color: '#D1D5DB', marginBottom: 12, fontWeight: '600' },
  waitingText: { fontSize: 16, color: '#9CA3AF', fontStyle: 'italic' },
  
  actionSection: { flexDirection: 'row', justifyContent: 'space-around', alignItems: 'center', paddingHorizontal: 10 },
  actionBtn: { width: 120, height: 120, borderRadius: 60, alignItems: 'center', justifyContent: 'center', elevation: 8, shadowOpacity: 0.3, shadowRadius: 10, shadowOffset: { width: 0, height: 5 } },
  denyBtn: { backgroundColor: '#EF4444', shadowColor: '#EF4444' },
  approveBtn: { backgroundColor: '#10B981', shadowColor: '#10B981' },
  btnText: { color: '#FFF', fontSize: 14, fontWeight: '800', marginTop: 8, letterSpacing: 1 },
});

export default GateApprovalScreen;