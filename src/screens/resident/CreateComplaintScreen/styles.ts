// import { StyleSheet, Platform } from 'react-native';
import { ThemeColors } from '../../../theme/colors';

export const getStyles = (theme: ThemeColors) => StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.background },
  
  header: { 
    padding: 24, 
    paddingBottom: 16, 
    flexDirection: 'row', 
    alignItems: 'center', 
    backgroundColor: theme.surface, 
    borderBottomWidth: 1, 
    borderBottomColor: theme.border, 
    paddingTop: Platform.OS === 'ios' ? 20 : 40 
  },
  backBtn: { marginRight: 16 },
  headerTitle: { fontSize: 22, fontWeight: '800', color: theme.textMain },
  
  scrollContent: { padding: 20, paddingBottom: 40 },
  
  inputContainer: { marginBottom: 24 },
  labelContainer: { flexDirection: 'row', alignItems: 'center', marginBottom: 10 },
  label: { fontSize: 14, fontWeight: '700', color: theme.textMain, marginLeft: 6 },
  
  input: {
    backgroundColor: theme.surface,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: theme.border,
    padding: 16,
    fontSize: 16,
    color: theme.textMain,
  },
  inputFocused: { 
    borderColor: theme.primary, 
    shadowColor: theme.primary, 
    shadowOffset: { width: 0, height: 0 }, 
    shadowOpacity: 0.1, 
    shadowRadius: 8, 
    elevation: 2 
  },
  textArea: { minHeight: 120, paddingTop: 16 }, // paddingTop important for iOS multiline
  
  chipContainer: { flexDirection: 'row', flexWrap: 'wrap', marginTop: 4 },
  chip: { 
    backgroundColor: theme.surface, 
    borderWidth: 1.5, 
    borderColor: theme.border, 
    paddingVertical: 10, 
    paddingHorizontal: 16, 
    borderRadius: 20, 
    marginRight: 12, 
    marginBottom: 12 
  },
  chipText: { fontSize: 14, fontWeight: '600', color: theme.textMuted },

  uploadBtn: {
    backgroundColor: theme.primaryLight,
    borderWidth: 1.5,
    borderColor: theme.primary + '50',
    borderStyle: 'dashed',
    padding: 20,
    borderRadius: 12,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 10, // Adjusted to bring helper text closer
    marginTop: 10,
  },
  uploadBtnText: { color: theme.primary, fontSize: 16, fontWeight: '700', marginLeft: 8 },
  
  helperText: {
    fontSize: 12, 
    color: theme.textMuted, 
    textAlign: 'center', 
    marginBottom: 30 
  },
  
  submitBtn: {
    backgroundColor: theme.primary,
    padding: 18,
    borderRadius: 12,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
    shadowColor: theme.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  submitBtnText: { color: '#FFFFFF', fontSize: 16, fontWeight: 'bold', letterSpacing: 0.5, marginLeft: 8 },
});