

import React, { useContext, useState } from 'react';
import { View, Text, SafeAreaView, TouchableOpacity, Switch, StyleSheet, ScrollView, Platform } from 'react-native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { ThemeContext } from '../../context/ThemeContext';
import { ThemeColors } from '../../theme/colors';

const SettingsScreen: React.FC<{ navigation: any }> = ({ navigation }) => {
  const { theme, isDarkMode, toggleTheme } = useContext(ThemeContext);
  const styles = getStyles(theme);

  const [notifications, setNotifications] = useState(true);
  const [emailAlerts, setEmailAlerts] = useState(false);

  const SettingItem = ({ icon, title, isSwitch, value, onToggle, onPress, danger }: any) => (
    <TouchableOpacity 
      style={styles.settingItem} 
      activeOpacity={isSwitch ? 1 : 0.7} 
      onPress={onPress}
    >
      <View style={styles.settingLeft}>
        <View style={[styles.iconBox, danger && styles.iconBoxDanger]}>
          <MaterialCommunityIcons name={icon} size={22} color={danger ? '#EF4444' : theme.primary} />
        </View>
        <Text style={[styles.settingText, danger && styles.textDanger]}>{title}</Text>
      </View>
      
      {isSwitch ? (
        <Switch
          value={value}
          onValueChange={onToggle}
          trackColor={{ false: theme.border, true: theme.primary }}
          thumbColor={Platform.OS === 'ios' ? '#FFFFFF' : (value ? theme.primaryLight : '#f4f3f4')}
        />
      ) : (
        <MaterialCommunityIcons name="chevron-right" size={24} color={theme.iconMuted} />
      )}
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <MaterialCommunityIcons name="arrow-left" size={26} color={theme.textMain} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Settings</Text>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <Text style={styles.sectionTitle}>App Preferences</Text>
        <View style={styles.card}>
          <SettingItem icon="bell-ring-outline" title="Push Notifications" isSwitch value={notifications} onToggle={() => setNotifications(!notifications)} />
          <View style={styles.divider} />
          <SettingItem icon="email-outline" title="Email Alerts" isSwitch value={emailAlerts} onToggle={() => setEmailAlerts(!emailAlerts)} />
          <View style={styles.divider} />
          <SettingItem icon="theme-light-dark" title="Dark Mode" isSwitch value={isDarkMode} onToggle={toggleTheme} />
        </View>

        <Text style={styles.sectionTitle}>Account & Security</Text>
        <View style={styles.card}>
          <SettingItem icon="lock-outline" title="Change Password" onPress={() => {}} />
          <View style={styles.divider} />
          <SettingItem icon="shield-check-outline" title="Privacy Policy" onPress={() => {}} />
          <View style={styles.divider} />
          <SettingItem icon="file-document-outline" title="Terms of Service" onPress={() => {}} />
        </View>

        <Text style={styles.sectionTitle}>Danger Zone</Text>
        <View style={styles.card}>
          <SettingItem icon="delete-outline" title="Delete Account" danger onPress={() => {}} />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const getStyles = (theme: ThemeColors) => StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.background },
  header: { flexDirection: 'row', alignItems: 'center', padding: 24, paddingTop: Platform.OS === 'ios' ? 20 : 40, backgroundColor: theme.surface, borderBottomWidth: 1, borderBottomColor: theme.border },
  backBtn: { marginRight: 16 },
  headerTitle: { fontSize: 20, fontWeight: '800', color: theme.textMain },
  scrollContent: { padding: 20, paddingBottom: 40 },
  sectionTitle: { fontSize: 14, fontWeight: '700', color: theme.textMuted, textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 10, marginTop: 10, marginLeft: 8 },
  card: { backgroundColor: theme.surface, borderRadius: 16, overflow: 'hidden', marginBottom: 20, shadowColor: theme.shadow, shadowOffset: { width: 0, height: 2 }, shadowOpacity: theme.mode === 'dark' ? 0.2 : 0.05, shadowRadius: 8, elevation: 2 },
  settingItem: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 16, backgroundColor: theme.surface },
  settingLeft: { flexDirection: 'row', alignItems: 'center' },
  iconBox: { width: 36, height: 36, borderRadius: 10, backgroundColor: theme.primaryLight, alignItems: 'center', justifyContent: 'center', marginRight: 14 },
  iconBoxDanger: { backgroundColor: '#FEE2E2' },
  settingText: { fontSize: 16, fontWeight: '600', color: theme.textMain },
  textDanger: { color: '#EF4444' },
  divider: { height: 1, backgroundColor: theme.border, marginLeft: 66 }, 
});

export default SettingsScreen;