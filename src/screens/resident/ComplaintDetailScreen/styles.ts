import { StyleSheet, Platform } from 'react-native';
import { ThemeColors } from '../../../theme/colors';

export const getStyles = (theme: ThemeColors) => StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.background },
  header: {
    padding: 24,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.surface,
    borderBottomWidth: 1,
    borderBottomColor: theme.border,
    paddingTop: Platform.OS === 'ios' ? 20 : 40,
  },
  backBtn: { marginRight: 16, padding: 4 },
  headerTitle: { fontSize: 20, fontWeight: '800', color: theme.textMain },
  scrollContent: { padding: 24 },
  
  // Status Banner Card
  statusCard: {
    backgroundColor: theme.surface,
    padding: 20,
    borderRadius: 16,
    marginBottom: 24,
    shadowColor: theme.shadow,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: theme.mode === 'dark' ? 0.2 : 0.05,
    shadowRadius: 12,
    elevation: 3,
  },
  metaRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  ticketId: { fontSize: 13, fontWeight: '700', color: theme.textMuted, letterSpacing: 1 },
  statusBadge: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 8 },
  statusText: { color: '#FFFFFF', fontSize: 12, fontWeight: '700', textTransform: 'uppercase' },
  title: { fontSize: 22, fontWeight: '800', color: theme.textMain, marginBottom: 12 },
  description: { fontSize: 15, color: theme.textMuted, lineHeight: 22 },
  
  // 🔥 Media Thumbnail & Video Overlay
  playIconOverlay: { 
    position: 'absolute', 
    top: '40%', 
    left: '42%', 
    backgroundColor: 'rgba(0,0,0,0.6)', 
    padding: 12, 
    borderRadius: 50 
  },
  
  // Assigned Professional (Worker) Card
  workerCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: theme.surface,
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: theme.border,
    elevation: 1,
    shadowColor: theme.shadow,
    shadowOpacity: 0.05,
    shadowRadius: 4,
  },
  workerLeft: { flexDirection: 'row', alignItems: 'center' },
  workerIconBg: { width: 44, height: 44, borderRadius: 12, backgroundColor: theme.primaryLight, alignItems: 'center', justifyContent: 'center', marginRight: 12 },
  workerName: { fontSize: 16, fontWeight: '700', color: theme.textMain },
  workerRole: { fontSize: 13, color: theme.textMuted, marginTop: 2 },
  callWorkerBtn: { backgroundColor: theme.primary, width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center', elevation: 3 },

  // Timeline Section
  sectionTitle: { fontSize: 16, fontWeight: '700', color: theme.textMain, marginBottom: 20, textTransform: 'uppercase', letterSpacing: 0.5 },
  timelineContainer: { paddingLeft: 8, marginBottom: 24 },
  timelineNode: { flexDirection: 'row', marginBottom: 24 },
  lineStructure: { alignItems: 'center', marginRight: 16 },
  circle: { width: 16, height: 16, borderRadius: 8, borderWidth: 3, backgroundColor: theme.surface },
  verticalLine: { width: 2, flex: 1, backgroundColor: theme.border, marginTop: 4, marginBottom: -20 },
  nodeContent: { flex: 1, paddingTop: -2 },
  nodeTitle: { fontSize: 16, fontWeight: '700', color: theme.textMain },
  nodeDate: { fontSize: 13, color: theme.textMuted, marginTop: 4 },
  
  // Resolver Notes / Comments
  commentBox: {
    backgroundColor: theme.primaryLight,
    padding: 16,
    borderRadius: 12,
    borderLeftWidth: 4,
    borderLeftColor: theme.primary,
    marginTop: 8,
  },
  commentText: { fontSize: 14, color: theme.textMain, fontStyle: 'italic', lineHeight: 20 },
});