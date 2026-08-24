import { StyleSheet, Platform } from 'react-native';
import { ThemeColors } from '../../../theme/colors';

export const getStyles = (theme: ThemeColors) => StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.background },
  header: {
    paddingHorizontal: 24,
    paddingTop: Platform.OS === 'ios' ? 20 : 40,
    paddingBottom: 20,
    backgroundColor: theme.surface,
    borderBottomWidth: 1,
    borderBottomColor: theme.border,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  headerTextContainer: { flex: 1 },
  title: { fontSize: 28, fontWeight: '800', color: theme.textMain, letterSpacing: 0.5 },
  subtitle: { fontSize: 14, color: theme.textMuted, marginTop: 4 },
  themeIcon: { padding: 8, backgroundColor: theme.primaryLight, borderRadius: 20 },
  listContainer: { padding: 20, paddingBottom: 100 },
  card: {
    backgroundColor: theme.surface,
    padding: 20,
    borderRadius: 16,
    marginBottom: 16,
    shadowColor: theme.shadow,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: theme.mode === 'dark' ? 0.2 : 0.05, 
    shadowRadius: 12,
    elevation: 3,
  },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  categoryContainer: { flexDirection: 'row', alignItems: 'center', backgroundColor: theme.primaryLight, paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8 },
  categoryText: { color: theme.primary, fontSize: 12, fontWeight: '700', textTransform: 'uppercase', marginLeft: 4 },
  statusBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8 },
  statusText: { color: '#FFFFFF', fontSize: 12, fontWeight: '700' }, 
  cardTitle: { fontSize: 18, fontWeight: '700', color: theme.textMain, marginBottom: 8 },
  footerRow: { flexDirection: 'row', alignItems: 'center' },
  date: { fontSize: 13, color: theme.textMuted, fontWeight: '500', marginLeft: 4 },
  fab: {
    position: 'absolute', right: 24, bottom: 34,
    backgroundColor: theme.primary, width: 64, height: 64, borderRadius: 32,
    alignItems: 'center', justifyContent: 'center',
    shadowColor: theme.primary, shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.4, shadowRadius: 12, elevation: 8,
  },
  fabTouchArea: {
    ...StyleSheet.absoluteFillObject,
    borderRadius: 32, // Ensures ripple effect matches circle shape
  }
});