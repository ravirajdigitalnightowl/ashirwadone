
import { StyleSheet, Platform } from 'react-native';
import { ThemeColors } from '../../../theme/colors';

export const getStyles = (theme: ThemeColors) => StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.background },
  header: {
    padding: 24,
    backgroundColor: theme.surface,
    borderBottomWidth: 1,
    borderBottomColor: theme.border,
    paddingTop: Platform.OS === 'ios' ? 20 : 40,
  },
  headerTitle: { fontSize: 28, fontWeight: '800', color: theme.textMain },
  
  profileSection: { alignItems: 'center', paddingVertical: 30 },
  avatarContainer: {
    width: 100, height: 100, borderRadius: 50,
    backgroundColor: theme.primaryLight,
    alignItems: 'center', justifyContent: 'center',
    marginBottom: 16,
  },
  avatarText: { fontSize: 36, fontWeight: 'bold', color: theme.primary },
  userName: { fontSize: 24, fontWeight: '700', color: theme.textMain, marginBottom: 4 },
  flatDetails: { fontSize: 16, color: theme.textMuted, fontWeight: '500' },

  menuContainer: { paddingHorizontal: 20 },
  menuItem: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    backgroundColor: theme.surface,
    padding: 18,
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