
import React, { useContext, useState, useEffect } from 'react';
import { View, Text, SafeAreaView, TouchableOpacity, Switch, StyleSheet, Platform, ScrollView, Alert } from 'react-native';
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
  
  const [isOnDuty, setIsOnDuty] = useState(true);

  useEffect(() => {
    if (userData && 'isOnDuty' in userData) {
      setIsOnDuty(userData.isOnDuty as boolean);
    }
  }, [userData]);

  const handleToggleDuty = (newValue: boolean) => {
    setIsOnDuty(newValue);
    toggleDuty();
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

      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.profileSection}>
          <View style={styles.avatarContainer}>
            <MaterialCommunityIcons name="account-hard-hat" size={50} color={theme.surface} />
          </View>
          <Text style={styles.userName}>{userData?.name || 'Staff Worker'}</Text>
          <View style={styles.deptBadge}>
            <Text style={styles.deptText}>{userData?.department || 'Operations'} Department</Text>
          </View>
          
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

          {/* 🔥 UPDATED: Help & Support with Alert */}
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
  avatarContainer: { width: 90, height: 90, borderRadius: 45, backgroundColor: theme.primary, alignItems: 'center', justifyContent: 'center', marginBottom: 16, elevation: 4 },
  userName: { fontSize: 24, fontWeight: '700', color: theme.textMain, marginBottom: 8 },
  deptBadge: { backgroundColor: theme.primaryLight, paddingHorizontal: 12, paddingVertical: 4, borderRadius: 12 },
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