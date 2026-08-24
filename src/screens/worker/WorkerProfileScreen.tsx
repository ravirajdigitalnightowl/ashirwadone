import React, { useContext, useState, useEffect } from 'react';
import { View, Text, SafeAreaView, TouchableOpacity, Switch, StyleSheet, Platform, ScrollView, Alert, Image } from 'react-native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { ThemeContext } from '../../context/ThemeContext';
import { ThemeColors } from '../../theme/colors';
import { AuthContext } from '../../context/AuthContext';

import { useToggleDuty } from '../../hooks/useWorker';

const WorkerProfileScreen = ({ navigation }: any) => {
  const { theme, isDarkMode, toggleTheme } = useContext(ThemeContext);
  const styles = getStyles(theme);
  
  const { logout, userData } = useContext(AuthContext);
  const { mutate: toggleDuty } = useToggleDuty();
  
  const [isOnDuty, setIsOnDuty] = useState(false); // Default false, will update from userData

  useEffect(() => {
    if (userData && 'isOnDuty' in userData) {
      setIsOnDuty(userData.isOnDuty as boolean);
    }
  }, [userData]);

  const handleToggleDuty = (newValue: boolean) => {
    setIsOnDuty(newValue);
    toggleDuty(); // Backend attendance track karega
  };

  const handleLogout = () => {
    logout();
  };

  const handleHelpPress = () => {
    Alert.alert(
      'Help & Support',
      'For any updates regarding your profile, contact details, or department changes, please contact the society administration office.',
      [{ text: 'OK', style: 'default' }]
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Staff Profile</Text>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 40 }}>
        <View style={styles.profileSection}>
          {/* 🔥 NAYA: Profile Photo Display (agar backend se photoUrl aaya hai) */}
          <View style={styles.avatarContainer}>
            {userData?.photoUrl ? (
              <Image source={{ uri: userData.photoUrl }} style={styles.avatarImage} />
            ) : (
              <MaterialCommunityIcons name="account-hard-hat" size={50} color={theme.surface} />
            )}
          </View>
          
          <Text style={styles.userName}>{userData?.name || 'Staff Worker'}</Text>
          
          {/* 🔥 NAYA: Dynamic Society Name Display */}
          {userData?.societyId?.name && (
            <Text style={styles.societyNameText}>{userData.societyId.name}</Text>
          )}

          <View style={styles.deptBadge}>
            {/* 🔥 UPDATE: Designation bhi yahan dikhega */}
            <Text style={styles.deptText}>
              {userData?.designation ? `${userData.designation} • ` : ''}{userData?.department || 'Operations'} Department
            </Text>
          </View>
          
          {/* 🔥 NAYA: Shift Timings Display */}
          {(userData?.shiftStart || userData?.shiftEnd) && (
            <View style={styles.shiftBadge}>
              <MaterialCommunityIcons name="clock-outline" size={14} color={theme.primary} />
              <Text style={styles.shiftText}>Shift: {userData.shiftStart || 'N/A'} - {userData.shiftEnd || 'N/A'}</Text>
            </View>
          )}
          
          <View style={styles.contactInfo}>
            <View style={styles.contactRow}>
              <MaterialCommunityIcons name="phone-outline" size={16} color={theme.textMuted} />
              <Text style={styles.contactText}>{userData?.phone || 'N/A'}</Text>
            </View>
            {userData?.email ? (
              <View style={styles.contactRow}>
                <MaterialCommunityIcons name="email-outline" size={16} color={theme.textMuted} />
                <Text style={styles.contactText}>{userData.email}</Text>
              </View>
            ) : null}
          </View>
        </View>

        <View style={styles.menuContainer}>
          <View style={styles.menuItem}>
            <View style={styles.menuItemLeft}>
              <View style={[styles.menuIcon, { backgroundColor: isOnDuty ? theme.status.resolved + '20' : theme.status.pending + '20' }]}>
                <MaterialCommunityIcons name="power" size={22} color={isOnDuty ? theme.status.resolved : theme.status.pending} />
              </View>
              <View>
                <Text style={styles.menuText}>Duty Status</Text>
                <Text style={styles.statusSubText}>{isOnDuty ? 'Receiving tickets' : 'Currently off duty'}</Text>
              </View>
            </View>
            <Switch value={isOnDuty} onValueChange={handleToggleDuty} trackColor={{ false: theme.border, true: theme.status.resolved }} thumbColor={theme.surface} />
          </View>

          <View style={styles.menuItem}>
            <View style={styles.menuItemLeft}>
              <View style={styles.menuIcon}>
                <MaterialCommunityIcons name={isDarkMode ? 'weather-night' : 'weather-sunny'} size={22} color={theme.primary} />
              </View>
              <Text style={styles.menuText}>Dark Mode</Text>
            </View>
            <Switch value={isDarkMode} onValueChange={toggleTheme} trackColor={{ false: theme.border, true: theme.primary }} thumbColor={theme.surface} />
          </View>

          <TouchableOpacity style={styles.menuItem} activeOpacity={0.7} onPress={handleHelpPress}>
            <View style={styles.menuItemLeft}>
              <View style={styles.menuIcon}>
                <MaterialCommunityIcons name="help-circle-outline" size={22} color={theme.primary} />
              </View>
              <Text style={styles.menuText}>Help & Support</Text>
            </View>
            <MaterialCommunityIcons name="chevron-right" size={24} color={theme.iconMuted} />
          </TouchableOpacity>

          <TouchableOpacity style={styles.menuItem} activeOpacity={0.7} onPress={handleLogout}>
            <View style={styles.menuItemLeft}>
              <View style={[styles.menuIcon, { backgroundColor: '#FEE2E2' }]}>
                <MaterialCommunityIcons name="logout" size={22} color="#EF4444" />
              </View>
              <Text style={[styles.menuText, { color: '#EF4444' }]}>Logout</Text>
            </View>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const getStyles = (theme: ThemeColors) => StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.background },
  header: { padding: 24, paddingTop: Platform.OS === 'ios' ? 20 : 40, backgroundColor: theme.surface, borderBottomWidth: 1, borderBottomColor: theme.border },
  headerTitle: { fontSize: 28, fontWeight: '800', color: theme.textMain },
  
  profileSection: { alignItems: 'center', paddingVertical: 30, backgroundColor: theme.surface, borderBottomWidth: 1, borderBottomColor: theme.border, marginBottom: 20 },
  avatarContainer: { width: 90, height: 90, borderRadius: 45, backgroundColor: theme.primary, alignItems: 'center', justifyContent: 'center', marginBottom: 16, elevation: 4, overflow: 'hidden' },
  avatarImage: { width: '100%', height: '100%', borderRadius: 45 },
  userName: { fontSize: 24, fontWeight: '700', color: theme.textMain, marginBottom: 6 },
  
  // 🔥 NAYA: Society Name & Shift Badge Styles
  societyNameText: { fontSize: 14, color: theme.textMuted, marginBottom: 10, fontWeight: '500' },
  shiftBadge: { flexDirection: 'row', alignItems: 'center', backgroundColor: theme.primaryLight, paddingHorizontal: 12, paddingVertical: 4, borderRadius: 12, marginBottom: 10 },
  shiftText: { color: theme.primary, fontSize: 12, fontWeight: 'bold', marginLeft: 4 },

  deptBadge: { backgroundColor: theme.primaryLight, paddingHorizontal: 12, paddingVertical: 4, borderRadius: 12, marginBottom: 10 },
  deptText: { color: theme.primary, fontSize: 12, fontWeight: 'bold', textTransform: 'uppercase' },
  
  contactInfo: { marginTop: 16, alignItems: 'center' },
  contactRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 6 },
  contactText: { fontSize: 14, color: theme.textMuted, marginLeft: 8, fontWeight: '500' },

  menuContainer: { paddingHorizontal: 20 },
  menuItem: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', backgroundColor: theme.surface, padding: 16, borderRadius: 16, marginBottom: 12, elevation: 1 },
  menuItemLeft: { flexDirection: 'row', alignItems: 'center' },
  menuIcon: { width: 42, height: 42, borderRadius: 12, backgroundColor: theme.primaryLight, alignItems: 'center', justifyContent: 'center', marginRight: 16 },
  menuText: { fontSize: 16, fontWeight: '600', color: theme.textMain },
  statusSubText: { fontSize: 12, color: theme.textMuted, marginTop: 2 },
});

export default WorkerProfileScreen;