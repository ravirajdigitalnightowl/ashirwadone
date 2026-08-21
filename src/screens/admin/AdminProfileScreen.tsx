import React, { useContext } from 'react';
import { View, Text, SafeAreaView, TouchableOpacity, ScrollView, Switch, StyleSheet, Platform } from 'react-native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { ThemeContext } from '../../context/ThemeContext';
import { ThemeColors } from '../../theme/colors';
import { AuthContext } from '../../context/AuthContext';

interface AdminProfileProps {
  navigation: any;
}

const AdminProfileScreen: React.FC<AdminProfileProps> = ({ navigation }) => {
  const { theme, isDarkMode, toggleTheme } = useContext(ThemeContext);
  
  const { logout, userData } = useContext(AuthContext); 
  const styles = getStyles(theme);

  const handleLogout = () => {
    logout(); 
  };

  const MenuItem = ({ icon, title, isSwitch, value, onToggle, onPress, danger }: any) => (
    <TouchableOpacity 
      style={styles.menuItem} 
      activeOpacity={isSwitch ? 1 : 0.7}
      onPress={onPress}
    >
      <View style={styles.menuItemLeft}>
        <View style={[styles.menuIcon, danger && styles.logoutIconBg]}>
          <MaterialCommunityIcons name={icon} size={22} color={danger ? '#EF4444' : theme.primary} />
        </View>
        <Text style={[styles.menuText, danger && styles.logoutText]}>{title}</Text>
      </View>
      
      {isSwitch ? (
        <Switch
          value={value}
          onValueChange={onToggle}
          trackColor={{ false: theme.border, true: theme.primary }}
          thumbColor={theme.surface}
        />
      ) : (
        <MaterialCommunityIcons name="chevron-right" size={24} color={theme.iconMuted} />
      )}
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Admin Profile</Text>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        
        {/* Real Profile Info Section */}
        <View style={styles.profileSection}>
          <View style={styles.avatarContainer}>
            <MaterialCommunityIcons name="shield-crown-outline" size={50} color={theme.primary} />
          </View>
          
          <Text style={styles.userName}>{userData?.name || 'Admin User'}</Text>
          
          {/* 🔥 NAYA: Society Name Display */}
          {userData?.societyId?.name && (
            <Text style={styles.societyNameText}>{userData.societyId.name}</Text>
          )}
          
          <View style={styles.roleBadge}>
            <Text style={styles.roleText}>ADMINISTRATOR</Text>
          </View>

          {/* 🔥 PREMIUM CONTACT CARD */}
          <View style={styles.contactCard}>
            <View style={styles.contactRow}>
              <MaterialCommunityIcons name="email-outline" size={20} color={theme.primary} style={styles.contactIcon} />
              <Text style={styles.contactText}>{userData?.email || 'admin@society.com'}</Text>
            </View>
            
            {userData?.phone && (
              <>
                <View style={styles.contactDivider} />
                <View style={styles.contactRow}>
                  <MaterialCommunityIcons name="phone-outline" size={20} color={theme.primary} style={styles.contactIcon} />
                  <Text style={styles.contactText}>{userData.phone}</Text>
                </View>
              </>
            )}
          </View>

        </View>

        <View style={styles.menuContainer}>
          
          {/* 🔥 NAYA: Society Management Section */}
          <Text style={styles.sectionTitle}>Society Management</Text>
          <MenuItem 
            icon="palette-outline" 
            title="Society Branding" 
            onPress={() => navigation.navigate('SocietyBrandingScreen')} 
          />
          <MenuItem 
            icon="bullhorn-outline" 
            title="Notice Board" 
            onPress={() => navigation.navigate('AdminPostsListScreen')} 
          />
          <MenuItem 
            icon="clock-time-eight-outline" 
            title="Attendance Report" 
            onPress={() => navigation.navigate('AttendanceReportScreen')} 
          />

          <Text style={styles.sectionTitle}>App Settings</Text>
          
          <MenuItem 
            icon={isDarkMode ? 'weather-night' : 'weather-sunny'} 
            title="Dark Mode" 
            isSwitch 
            value={isDarkMode} 
            onToggle={toggleTheme} 
          />

          <Text style={styles.sectionTitle}>Account</Text>

          <MenuItem icon="logout" title="Logout" danger onPress={handleLogout} />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const getStyles = (theme: ThemeColors) => StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.background },
  header: {
    padding: 24,
    backgroundColor: theme.surface,
    borderBottomWidth: 1,
    borderBottomColor: theme.border,
    paddingTop: Platform.OS === 'ios' ? 20 : 40,
  },
  headerTitle: { fontSize: 28, fontWeight: '800', color: theme.textMain },
  scrollContent: { paddingBottom: 40 },
  
  profileSection: { alignItems: 'center', paddingVertical: 30, backgroundColor: theme.surface, borderBottomWidth: 1, borderBottomColor: theme.border, marginBottom: 20 },
  avatarContainer: {
    width: 100, height: 100, borderRadius: 50,
    backgroundColor: theme.primaryLight,
    alignItems: 'center', justifyContent: 'center',
    marginBottom: 16,
    borderWidth: 2, borderColor: theme.primary
  },
  userName: { fontSize: 24, fontWeight: '700', color: theme.textMain, marginBottom: 4 },
  // 🔥 NAYA: Society Name Style
  societyNameText: { 
    fontSize: 14, 
    color: theme.textMuted, 
    marginBottom: 10, 
    fontWeight: '500' 
  },
  roleBadge: { backgroundColor: theme.primaryLight, paddingHorizontal: 16, paddingVertical: 6, borderRadius: 20, marginBottom: 20 },
  roleText: { color: theme.primary, fontSize: 12, fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: 1 },
  
  // 🔥 NEW STYLES: Beautiful Contact Info Card
  contactCard: {
    width: '85%',
    backgroundColor: theme.background, 
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: theme.border,
  },
  contactRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 4,
  },
  contactIcon: {
    marginRight: 14,
  },
  contactText: {
    fontSize: 15,
    color: theme.textMain,
    fontWeight: '500',
    flex: 1,
  },
  contactDivider: {
    height: 1,
    backgroundColor: theme.border,
    marginVertical: 12,
    marginLeft: 34, 
  },
  
  menuContainer: { paddingHorizontal: 20 },
  sectionTitle: { fontSize: 13, fontWeight: '700', color: theme.textMuted, textTransform: 'uppercase', letterSpacing: 1, marginBottom: 10, marginTop: 10, marginLeft: 4 },
  
  menuItem: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    backgroundColor: theme.surface,
    padding: 16,
    borderRadius: 16,
    marginBottom: 12,
    shadowColor: theme.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: theme.mode === 'dark' ? 0.2 : 0.03,
    shadowRadius: 8,
    elevation: 2,
  },
  menuItemLeft: { flexDirection: 'row', alignItems: 'center' },
  menuIcon: { width: 40, height: 40, borderRadius: 10, backgroundColor: theme.primaryLight, alignItems: 'center', justifyContent: 'center', marginRight: 16 },
  menuText: { fontSize: 16, fontWeight: '600', color: theme.textMain },
  
  logoutText: { color: '#EF4444' },
  logoutIconBg: { backgroundColor: '#FEE2E2' },
});

export default AdminProfileScreen;