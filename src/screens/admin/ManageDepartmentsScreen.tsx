
import React, { useState, useContext } from 'react';
import { View, Text, SafeAreaView, FlatList, TouchableOpacity, TextInput, Switch, Alert, ActivityIndicator, Modal, StyleSheet, Platform } from 'react-native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { ThemeContext } from '../../context/ThemeContext';
import { useDepartments, useCreateDepartment, useUpdateDepartment } from '../../hooks/useAdmin';
import { ThemeColors } from '../../theme/colors';

const ManageDepartmentsScreen = ({ navigation }: any) => {
  const { theme } = useContext(ThemeContext);
  const styles = getStyles(theme);
  
  const [newDeptName, setNewDeptName] = useState('');
  
  // Edit Modal States
  const [isEditModalVisible, setIsEditModalVisible] = useState(false);
  const [editingDeptId, setEditingDeptId] = useState<string | null>(null);
  const [editDeptName, setEditDeptName] = useState('');

  const { data, isLoading } = useDepartments();
  const { mutate: createDept, isPending: isCreating } = useCreateDepartment();
  const { mutate: updateDept, isPending: isUpdating } = useUpdateDepartment();

  const departments = data?.data?.departments || [];

  const handleAdd = () => {
    if (!newDeptName.trim()) return Alert.alert('Error', 'Please enter a department name.');
    createDept({ name: newDeptName.trim() }, {
      onSuccess: () => setNewDeptName('')
    });
  };

  const handleToggle = (id: string, currentStatus: boolean) => {
    updateDept({ id, data: { isActive: !currentStatus } });
  };

  // 🔥 Edit Flow Handlers
  const openEditModal = (id: string, currentName: string) => {
    setEditingDeptId(id);
    setEditDeptName(currentName);
    setIsEditModalVisible(true);
  };

  const handleSaveEdit = () => {
    if (!editDeptName.trim()) return Alert.alert('Error', 'Department name cannot be empty.');
    
    updateDept(
      { id: editingDeptId!, data: { name: editDeptName.trim() } },
      {
        onSuccess: () => {
          setIsEditModalVisible(false);
          setEditingDeptId(null);
          setEditDeptName('');
        }
      }
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <MaterialCommunityIcons name="arrow-left" size={28} color={theme.textMain} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Departments</Text>
      </View>

      <View style={styles.inputSection}>
        <View style={styles.addInputContainer}>
          <TextInput 
            style={styles.addInput}
            placeholder="Add new department..."
            placeholderTextColor={theme.textMuted}
            value={newDeptName}
            onChangeText={setNewDeptName}
          />
          <TouchableOpacity onPress={handleAdd} disabled={isCreating}>
            {isCreating ? <ActivityIndicator color={theme.primary} /> : <MaterialCommunityIcons name="plus-circle" size={32} color={theme.primary} />}
          </TouchableOpacity>
        </View>
      </View>

      {isLoading ? (
        <ActivityIndicator size="large" color={theme.primary} style={{ marginTop: 20 }} />
      ) : (
        <FlatList
          data={departments}
          keyExtractor={(item) => item._id}
          contentContainerStyle={styles.listContainer}
          renderItem={({ item }) => (
            // 🔥 FIXED 1: Pure card se opacity hata di. Inactive hone par sirf background change hoga.
            <View style={[styles.deptCard, !item.isActive && { backgroundColor: theme.background }]}>
              
              {/* 🔥 FIXED 2: Opacity sirf left side (text area) par apply ki hai */}
              <View style={[{ flex: 1, marginRight: 10 }, !item.isActive && { opacity: 0.5 }]}>
                <Text style={[styles.deptName, !item.isActive && { textDecorationLine: 'line-through', color: theme.textMuted }]}>{item.name}</Text>
                <Text style={styles.deptStatus}>{item.isActive ? 'Active' : 'Hidden'}</Text>
              </View>
              
              <View style={styles.actionsContainer}>
                <TouchableOpacity 
                  style={styles.editBtn} 
                  onPress={() => openEditModal(item._id, item.name)}
                >
                  <MaterialCommunityIcons name="pencil-outline" size={20} color={theme.primary} />
                </TouchableOpacity>

                {/* 🔥 FIXED 3: Toggle colors exact ManageStaffScreen wale daal diye hain */}
                <Switch 
                  value={item.isActive} 
                  onValueChange={() => handleToggle(item._id, item.isActive)} 
                  trackColor={{ false: theme.border, true: theme.primary }}
                  thumbColor={theme.surface}
                />
              </View>
            </View>
          )}
        />
      )}

      {/* Edit Department Modal */}
      <Modal visible={isEditModalVisible} transparent={true} animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Edit Department</Text>
            
            <TextInput
              style={styles.modalInput}
              value={editDeptName}
              onChangeText={setEditDeptName}
              placeholder="Department Name"
              placeholderTextColor={theme.textMuted}
              autoFocus
            />

            <View style={styles.modalButtons}>
              <TouchableOpacity 
                style={[styles.modalBtn, { backgroundColor: theme.surface, borderWidth: 1, borderColor: theme.border }]} 
                onPress={() => setIsEditModalVisible(false)}
                disabled={isUpdating}
              >
                <Text style={[styles.modalBtnText, { color: theme.textMain }]}>Cancel</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={[styles.modalBtn, { backgroundColor: theme.primary, marginLeft: 10 }]} 
                onPress={handleSaveEdit}
                disabled={isUpdating}
              >
                {isUpdating ? <ActivityIndicator color="#FFF" /> : <Text style={[styles.modalBtnText, { color: '#FFF' }]}>Save</Text>}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

const getStyles = (theme: ThemeColors) => StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.background },
  header: { 
    padding: 24, 
    flexDirection: 'row', 
    alignItems: 'center', 
    backgroundColor: theme.surface,
    borderBottomWidth: 1,
    borderBottomColor: theme.border,
    paddingTop: Platform.OS === 'ios' ? 20 : 40 
  },
  backBtn: { marginRight: 15 },
  headerTitle: { fontSize: 22, fontWeight: 'bold', color: theme.textMain },
  
  inputSection: { padding: 20, paddingBottom: 10 },
  addInputContainer: { flexDirection: 'row', alignItems: 'center', backgroundColor: theme.surface, borderRadius: 12, borderWidth: 1, borderColor: theme.border, paddingHorizontal: 15 },
  addInput: { flex: 1, paddingVertical: 14, color: theme.textMain, fontSize: 16 },
  
  listContainer: { paddingHorizontal: 20, paddingBottom: 30 },
  deptCard: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', backgroundColor: theme.surface, padding: 16, borderRadius: 12, marginBottom: 12, elevation: 1, shadowColor: theme.shadow, shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.1, shadowRadius: 3 },
  deptName: { fontSize: 16, fontWeight: 'bold', color: theme.textMain, marginBottom: 4 },
  deptStatus: { fontSize: 12, color: theme.textMuted },
  
  actionsContainer: { flexDirection: 'row', alignItems: 'center' },
  editBtn: { padding: 6, backgroundColor: theme.primaryLight, borderRadius: 8, marginRight: 12 },

  // Modal Styles
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center', padding: 20 },
  modalContent: { width: '100%', backgroundColor: theme.surface, borderRadius: 16, padding: 24, elevation: 5 },
  modalTitle: { fontSize: 18, fontWeight: 'bold', color: theme.textMain, marginBottom: 16 },
  modalInput: { backgroundColor: theme.background, borderRadius: 10, borderWidth: 1, borderColor: theme.primary, padding: 14, fontSize: 16, color: theme.textMain, marginBottom: 20 },
  modalButtons: { flexDirection: 'row', justifyContent: 'flex-end' },
  modalBtn: { paddingVertical: 12, paddingHorizontal: 20, borderRadius: 10, minWidth: 90, alignItems: 'center' },
  modalBtnText: { fontSize: 15, fontWeight: 'bold' }
});

export default ManageDepartmentsScreen;