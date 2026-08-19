import { StyleSheet, Platform } from 'react-native';
import { ThemeColors } from '../../../theme/colors';

export const getStyles = (theme: ThemeColors) => StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.background },
  header: { padding: 24, paddingBottom: 10, flexDirection: 'row', alignItems: 'center' },
  backBtn: { marginRight: 16 },
  title: { fontSize: 24, fontWeight: '800', color: theme.textMain },
  scrollContent: { padding: 24 },
  
  inputContainer: { marginBottom: 20 },
  labelContainer: { flexDirection: 'row', alignItems: 'center', marginBottom: 8 },
  label: { fontSize: 14, fontWeight: '600', color: theme.textMain, textTransform: 'uppercase', letterSpacing: 0.5, marginLeft: 6 },
  
  input: {
    backgroundColor: theme.surface,
    paddingHorizontal: 16,
    paddingVertical: Platform.OS === 'ios' ? 16 : 12,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: theme.border,
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
  
  uploadBtn: {
    backgroundColor: theme.primaryLight,
    borderWidth: 1.5,
    borderColor: theme.primary,
    borderStyle: 'dashed',
    padding: 20,
    borderRadius: 12,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 30,
    marginTop: 10,
  },
  uploadBtnText: { color: theme.primary, fontSize: 16, fontWeight: '700', marginLeft: 8 },
  
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