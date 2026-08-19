
import React, { useContext } from 'react';
import { View, Text, SafeAreaView, TouchableOpacity, ScrollView, Switch, Alert } from 'react-native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { getStyles } from './styles';
import { ThemeContext } from '../../../context/ThemeContext';
import { AuthContext } from '../../../context/AuthContext';

const ProfileScreen: React.FC<{ navigation: any }> = ({ navigation }) => {
  const { theme, isDarkMode, toggleTheme } = useContext(ThemeContext);
  const styles = getStyles(theme);

  const { logout, userData } = useContext(AuthContext);

  const handleLogout = () => {
    logout();
  };

  const getInitials = (name: string) => {
    if (!name) return 'U';
    const parts = name.split(' ');
    if (parts.length > 1) return (parts[0][0] + parts[1][0]).toUpperCase();
    return name.substring(0, 2).toUpperCase();
  };

  const handleHelpPress = () => {
    Alert.alert(
      'Help & Support',
      'For any updates regarding your profile, contact details, or flat information, please reach out to the society administration office.',
      [{ text: 'OK', style: 'default' }]
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>My Profile</Text>
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.profileSection}>
          <View style={styles.avatarContainer}>
            <Text style={styles.avatarText}>{getInitials(userData?.name || '')}</Text>
          </View>
          <Text style={styles.userName}>{userData?.name || 'Resident'}</Text>
          <Text style={styles.flatDetails}>
            {userData?.flatNo 
              ? `${userData?.tower ? `Tower ${userData.tower}, ` : ''}Flat ${userData.flatNo}` 
              : 'Resident Member'}
          </Text>
        </View>

        <View style={styles.menuContainer}>
          
          {/* 🔥 NAYA BUTTON: Troubleshooting Notifications ke liye */}
          <TouchableOpacity 
            style={styles.menuItem} 
            activeOpacity={0.7} 
            onPress={() => navigation.navigate('NotificationTroubleshootScreen')}
          >
            <View style={styles.menuItemLeft}>
              <View style={[styles.menuIcon, { backgroundColor: theme.status.pending + '20' }]}>
                <MaterialCommunityIcons name="bell-alert-outline" size={22} color={theme.status.pending} />
              </View>
              <Text style={styles.menuText}>Fix Gate Alerts (Issues)</Text>
            </View>
            <MaterialCommunityIcons name="chevron-right" size={24} color={theme.iconMuted} />
          </TouchableOpacity>

          <View style={styles.menuItem}>
            <View style={styles.menuItemLeft}>
              <View style={styles.menuIcon}>
                <MaterialCommunityIcons name={isDarkMode ? 'weather-night' : 'weather-sunny'} size={22} color={theme.primary} />
              </View>
              <Text style={styles.menuText}>Dark Mode</Text>
            </View>
            <Switch
              value={isDarkMode}
              onValueChange={toggleTheme}
              trackColor={{ false: theme.border, true: theme.primary }}
              thumbColor={theme.surface}
            />
          </View>

          {/* Help & Support */}
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
              <View style={[styles.menuIcon, styles.logoutIconBg]}>
                <MaterialCommunityIcons name="logout" size={22} color="#EF4444" />
              </View>
              <Text style={[styles.menuText, styles.logoutText]}>Logout</Text>
            </View>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default ProfileScreen;