
// src/screens/common/NotificationTroubleshootScreen.tsx
import React, { useContext } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Linking,
  Platform,
  NativeModules,
  Alert,
  SafeAreaView, 
} from 'react-native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import notifee from '@notifee/react-native'; 
import { ThemeContext } from '../../context/ThemeContext';

// Import Custom Kotlin Bridge
const { IntentManager } = NativeModules;

const NotificationTroubleshootScreen = ({ navigation }: any) => {
  const { theme } = useContext(ThemeContext);

  // 1. Autostart / Background Launch Settings (via Custom Kotlin Bridge)
  const openAutoStartSettings = async () => {
    if (Platform.OS !== 'android') return;

    const manufacturer = (Platform.constants as any)?.Manufacturer?.toLowerCase?.() || '';
    
    let targetPkg = '';
    let targetCls = '';

    if (manufacturer.includes('oneplus')) {
      targetPkg = 'com.oneplus.security';
      targetCls = 'com.oneplus.security.chainlaunch.view.ChainLaunchAppListActivity';
    } else if (manufacturer.includes('xiaomi') || manufacturer.includes('redmi') || manufacturer.includes('poco')) {
      targetPkg = 'com.miui.securitycenter';
      targetCls = 'com.miui.permcenter.autostart.AutoStartManagementActivity';
    } else if (manufacturer.includes('oppo') || manufacturer.includes('realme')) {
      targetPkg = 'com.coloros.safecenter';
      targetCls = 'com.coloros.safecenter.startupapp.StartupAppListActivity';
    } else if (manufacturer.includes('vivo')) {
      targetPkg = 'com.vivo.permissionmanager';
      targetCls = 'com.vivo.permissionmanager.activity.BgStartUpManagerActivity';
    }

    // If Kotlin Bridge is available and a matching package is found
    if (targetPkg && targetCls && IntentManager) {
      try {
        await IntentManager.startSpecificActivity(targetPkg, targetCls);
        return; // Return upon success
      } catch (err) {
        console.log('Autostart activity not found via bridge:', err);
      }
    }

    // Fallback: If the above fails or the device is unrecognized (e.g., Samsung, Motorola)
    Alert.alert(
      'Autostart Configuration',
      'Please navigate to your device Settings → Apps → Ashirwad Society, and enable "Autostart" or set battery usage to "Unrestricted".',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Open Settings', onPress: () => Linking.openSettings() }
      ]
    );
  };

  // 2. Android 14+ Lock Screen Popups (Full Screen Intent)
  const openFullScreenSettings = async () => {
    if (Platform.OS === 'android' && Platform.Version >= 34) {
      try {
        await notifee.openFullScreenIntentSettings();
      } catch (err) {
        Linking.openSettings();
      }
    } else {
      Alert.alert('Not Required', 'Your device\'s Android version does not require this manual configuration.');
    }
  };

  // 3. App Notification Settings
  const openNotificationSettings = async () => {
    if (Platform.OS !== 'android') return;
    try {
      await Linking.sendIntent('android.settings.APP_NOTIFICATION_SETTINGS', [
        { key: 'android.provider.extra.APP_PACKAGE', value: 'com.ashirwadone' },
      ]);
    } catch (err) {
      Linking.openSettings();
    }
  };

  // 4. Generic App Info Settings
  const openGeneralAppSettings = () => {
    Linking.openSettings();
  };

  const steps = [
    {
      icon: 'bell-ring-outline',
      title: '1. Allow Notifications',
      description: 'Ensure that the application has permission to send notifications. Sounds and pop-ups must also be enabled.',
      buttonLabel: 'Notification Settings',
      onPress: openNotificationSettings,
    },
    {
      icon: 'cellphone-lock',
      title: '2. Allow Lock-Screen Popups (Android 14+)',
      description: 'Enable "Full Screen Intents" to receive alerts when the screen is locked on Android 14+ devices.',
      buttonLabel: 'Popup Settings',
      onPress: openFullScreenSettings,
    },
    {
      icon: 'rocket-launch-outline',
      title: '3. Enable Autostart & Unrestricted Battery',
      description: 'Enable "Autostart" and set Battery usage to "Unrestricted" to prevent the OS from killing the app in the background.',
      buttonLabel: 'Autostart / App Info',
      onPress: openAutoStartSettings,
    },
    {
      icon: 'lock-outline',
      title: '4. Lock App in Recent Tasks',
      description: 'Open your "Recent Apps" screen, long-press the Ashirwad Society app card, and tap the "Lock" or pin icon to prevent it from being cleared.',
      buttonLabel: null,
      onPress: null,
    },
  ];

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
      {/* Header */}
      <View style={[styles.header, { backgroundColor: theme.surface, borderBottomColor: theme.border }]}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <MaterialCommunityIcons name="arrow-left" size={28} color={theme.textMain} />
        </TouchableOpacity>
        <Text style={[styles.headerTitleText, { color: theme.textMain }]}>Fix Notifications</Text>
      </View>

      <ScrollView contentContainerStyle={{ padding: 20, paddingBottom: 40 }} showsVerticalScrollIndicator={false}>
        <View style={styles.headerBlock}>
          <View style={[styles.iconCircle, { backgroundColor: theme.primaryLight }]}>
            <MaterialCommunityIcons name="bell-alert-outline" size={48} color={theme.primary} />
          </View>
          <Text style={[styles.headerTitle, { color: theme.textMain }]}>
            Not Receiving Gate Alerts Properly?
          </Text>
          <Text style={[styles.headerSubtitle, { color: theme.textMuted }]}>
            Some devices aggressively restrict background applications. Please follow the steps below to ensure uninterrupted gate alerts.
          </Text>
        </View>

        {steps.map((step, index) => (
          <View key={index} style={[styles.card, { backgroundColor: theme.surface, borderColor: theme.border }]}>
            <View style={styles.cardHeader}>
              <MaterialCommunityIcons name={step.icon} size={26} color={theme.primary} />
              <Text style={[styles.cardTitle, { color: theme.textMain }]}>{step.title}</Text>
            </View>
            <Text style={[styles.cardDescription, { color: theme.textMuted }]}>{step.description}</Text>
            
            {step.onPress && (
              <TouchableOpacity style={[styles.button, { backgroundColor: theme.primary }]} onPress={step.onPress} activeOpacity={0.8}>
                <Text style={styles.buttonText}>{step.buttonLabel}</Text>
                <MaterialCommunityIcons name="chevron-right" size={20} color="#FFFFFF" />
              </TouchableOpacity>
            )}
          </View>
        ))}

        <TouchableOpacity style={styles.allSettingsLink} onPress={openGeneralAppSettings}>
          <Text style={[styles.allSettingsText, { color: theme.primary }]}>
            Prefer to configure everything manually via App Settings?
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { padding: 24, paddingTop: Platform.OS === 'ios' ? 20 : 40, flexDirection: 'row', alignItems: 'center', borderBottomWidth: 1 },
  backBtn: { marginRight: 16 },
  headerTitleText: { fontSize: 22, fontWeight: '800' },
  headerBlock: { alignItems: 'center', marginBottom: 24, marginTop: 10 },
  iconCircle: { width: 96, height: 96, borderRadius: 48, alignItems: 'center', justifyContent: 'center', marginBottom: 16 },
  headerTitle: { fontSize: 20, fontWeight: '800', textAlign: 'center', marginBottom: 8 },
  headerSubtitle: { fontSize: 14, textAlign: 'center', lineHeight: 22 },
  card: { borderRadius: 16, borderWidth: 1, padding: 16, marginBottom: 16, elevation: 1 },
  cardHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 8, gap: 10 },
  cardTitle: { fontSize: 16, fontWeight: '700', flexShrink: 1 },
  cardDescription: { fontSize: 13, lineHeight: 20, marginBottom: 16 },
  button: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: 12, borderRadius: 10, gap: 4 },
  buttonText: { color: '#FFFFFF', fontWeight: '700', fontSize: 14 },
  allSettingsLink: { alignItems: 'center', marginTop: 10 },
  allSettingsText: { fontSize: 14, fontWeight: '600', textDecorationLine: 'underline' },
});

export default NotificationTroubleshootScreen;