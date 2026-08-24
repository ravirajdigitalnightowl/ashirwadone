import React, { useContext, useState } from 'react';
import { View, Text, SafeAreaView, FlatList, TouchableOpacity, StyleSheet, Platform, ActivityIndicator, RefreshControl, Image, Modal, TextInput, Alert } from 'react-native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { launchImageLibrary } from 'react-native-image-picker';
import { ThemeContext } from '../../context/ThemeContext';
import { useInfiniteQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../../services/api';

const AdminPostsListScreen = ({ navigation }: any) => {
  const { theme } = useContext(ThemeContext);
  const styles = getStyles(theme);
  const queryClient = useQueryClient();

  const [modalVisible, setModalVisible] = useState(false);
  const [type, setType] = useState('General');
  const [title, setTitle] = useState('');
  const [desc, setDesc] = useState('');
  const [photo, setPhoto] = useState<any>(null);

  const { data, isLoading, refetch, isRefetching, fetchNextPage, hasNextPage, isFetchingNextPage } = useInfiniteQuery({
    queryKey: ['adminPosts'],
    queryFn: ({ pageParam = 1 }) => api.get(`/admin/posts?page=${pageParam}&limit=10`).then(res => res.data),
    // 🔥 FIX: allPages.length + 1 use kiya gaya hai next page find karne ke liye
    getNextPageParam: (lastPage, allPages) => lastPage.hasMore ? allPages.length + 1 : undefined,
    initialPageParam: 1,
  });

  const posts = data?.pages?.flatMap(page => page?.data?.posts || []) || [];

  const pickImage = () => {
    launchImageLibrary({ mediaType: 'photo' }, (response) => {
      if (response.assets && response.assets.length > 0) setPhoto(response.assets[0]);
    });
  };

  const handleCreate = async () => {
    if (!title || !desc) return Alert.alert('Error', 'Title and Description are required.');
    const formData = new FormData();
    formData.append('title', title);
    formData.append('description', desc);
    formData.append('type', type);
    if (photo) {
      formData.append('media', { uri: Platform.OS === 'ios' ? photo.uri.replace('file://', '') : photo.uri, name: 'post.jpg', type: 'image/jpeg' } as any);
    }

    try {
      await api.post('/admin/posts', formData, { headers: { 'Content-Type': 'multipart/form-data' } });
      Alert.alert('Success', 'Post created successfully!');
      setModalVisible(false);
      setTitle(''); setDesc(''); setPhoto(null);
      queryClient.invalidateQueries({ queryKey: ['adminPosts'] });
    } catch (err) {
      Alert.alert('Error', 'Failed to create post.');
    }
  };

  const renderItem = ({ item }: any) => (
    <View style={styles.card}>
      {item.mediaUrl && <Image source={{ uri: item.mediaUrl }} style={styles.cardImage} />}
      <View style={styles.cardContent}>
        <Text style={styles.title}>{item.title}</Text>
        <Text style={styles.description} numberOfLines={2}>{item.description}</Text>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <MaterialCommunityIcons name="arrow-left" size={28} color={theme.textMain} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Notice Board</Text>
      </View>

      {isLoading ? (
        <ActivityIndicator size="large" color={theme.primary} style={{ marginTop: 40 }} />
      ) : (
        <FlatList
          data={posts}
          keyExtractor={(item) => item._id}
          renderItem={renderItem}
          contentContainerStyle={{ padding: 20 }}
          refreshControl={<RefreshControl refreshing={isRefetching} onRefresh={refetch} tintColor={theme.primary} />}
          onEndReached={() => hasNextPage && !isFetchingNextPage && fetchNextPage()}
          onEndReachedThreshold={0.5}
          ListFooterComponent={isFetchingNextPage ? <ActivityIndicator color={theme.primary} style={{ marginVertical: 20 }} /> : null}
        />
      )}

      <TouchableOpacity style={styles.fab} onPress={() => setModalVisible(true)}>
        <MaterialCommunityIcons name="plus" size={30} color="#FFF" />
      </TouchableOpacity>

      <Modal visible={modalVisible} transparent={true} animationType="slide" onRequestClose={() => setModalVisible(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Create Announcement</Text>
              <TouchableOpacity onPress={() => setModalVisible(false)}>
                <MaterialCommunityIcons name="close" size={24} color={theme.textMain} />
              </TouchableOpacity>
            </View>
            
            <View style={styles.chipContainer}>
              {['General', 'Event', 'Alert'].map((t) => (
                <TouchableOpacity key={t} style={[styles.chip, type === t && { backgroundColor: theme.primary, borderColor: theme.primary }]} onPress={() => setType(t)}>
                  <Text style={[styles.chipText, type === t && { color: '#FFF' }]}>{t}</Text>
                </TouchableOpacity>
              ))}
            </View>

            <TextInput style={styles.input} placeholder="Title" value={title} onChangeText={setTitle} />
            <TextInput style={[styles.input, { minHeight: 80 }]} multiline textAlignVertical="top" placeholder="Description" value={desc} onChangeText={setDesc} />
            
            <TouchableOpacity style={styles.mediaBtn} onPress={pickImage}>
              {photo ? <Image source={{ uri: photo.uri }} style={styles.preview} /> : <Text style={styles.mediaBtnText}>Attach Flyer/Image</Text>}
            </TouchableOpacity>

            <TouchableOpacity style={styles.submitBtn} onPress={handleCreate}>
              <Text style={styles.submitBtnText}>PUBLISH POST</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

const getStyles = (theme: any) => StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.background },
  header: { padding: 24, paddingTop: Platform.OS === 'ios' ? 20 : 40, flexDirection: 'row', alignItems: 'center', backgroundColor: theme.surface, borderBottomWidth: 1, borderBottomColor: theme.border },
  headerTitle: { fontSize: 22, fontWeight: '800', color: theme.textMain, marginLeft: 16 },
  card: { backgroundColor: theme.surface, borderRadius: 16, marginBottom: 16, overflow: 'hidden', elevation: 2 },
  cardImage: { width: '100%', height: 150 },
  cardContent: { padding: 16 },
  title: { fontSize: 18, fontWeight: 'bold', color: theme.textMain, marginBottom: 4 },
  description: { fontSize: 14, color: theme.textMuted, lineHeight: 20 },
  fab: { position: 'absolute', bottom: 30, right: 24, backgroundColor: theme.primary, width: 60, height: 60, borderRadius: 30, justifyContent: 'center', alignItems: 'center', elevation: 8 },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  modalContent: { backgroundColor: theme.surface, borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 24, maxHeight: '90%' },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  modalTitle: { fontSize: 18, fontWeight: 'bold', color: theme.textMain },
  chipContainer: { flexDirection: 'row', marginBottom: 16 },
  chip: { backgroundColor: theme.surface, borderWidth: 1, borderColor: theme.border, paddingVertical: 8, paddingHorizontal: 16, borderRadius: 20, marginRight: 10 },
  chipText: { fontSize: 14, fontWeight: '600', color: theme.textMuted },
  input: { backgroundColor: theme.background, borderRadius: 12, borderWidth: 1, borderColor: theme.border, paddingHorizontal: 16, paddingVertical: 12, fontSize: 16, color: theme.textMain, marginBottom: 16 },
  mediaBtn: { backgroundColor: theme.background, borderRadius: 12, borderWidth: 1, borderColor: theme.border, height: 100, justifyContent: 'center', alignItems: 'center', marginBottom: 16, overflow: 'hidden' },
  preview: { width: '100%', height: '100%' },
  mediaBtnText: { color: theme.primary, fontWeight: 'bold' },
  submitBtn: { backgroundColor: theme.primary, padding: 18, borderRadius: 12, alignItems: 'center' },
  submitBtnText: { color: '#FFF', fontWeight: 'bold', fontSize: 16 }
});

export default AdminPostsListScreen;