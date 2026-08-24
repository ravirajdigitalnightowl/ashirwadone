import React, { useContext, useState } from 'react';
import { View, Text, SafeAreaView, FlatList, TouchableOpacity, StyleSheet, Platform, ActivityIndicator, RefreshControl, Image, Modal, ScrollView } from 'react-native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { ThemeContext } from '../../context/ThemeContext';
import { useInfiniteQuery } from '@tanstack/react-query';
import residentService from '../../services/residentService';

const NoticeBoardScreen = ({ navigation }: any) => {
  const { theme } = useContext(ThemeContext);
  const styles = getStyles(theme);
  
  const [selectedPost, setSelectedPost] = useState<any>(null);
  const [modalVisible, setModalVisible] = useState(false);

  const { data, isLoading, refetch, isRefetching, fetchNextPage, hasNextPage, isFetchingNextPage } = useInfiniteQuery({
    queryKey: ['residentPosts'],
    queryFn: ({ pageParam = 1 }) => residentService.getAllPosts({ pageParam, limit: 10 }),
    // 🔥 FIX: allPages.length + 1 use kiya gaya hai next page find karne ke liye
    getNextPageParam: (lastPage, allPages) => lastPage.hasMore ? allPages.length + 1 : undefined,
    initialPageParam: 1,
  });

  const posts = data?.pages?.flatMap(page => page?.data?.posts || []) || [];

  const getTypeColor = (type: string) => type === 'Alert' ? '#EF4444' : type === 'Event' ? '#8B5CF6' : theme.primary;

  const openPost = (post: any) => { setSelectedPost(post); setModalVisible(true); };

  const renderItem = ({ item }: any) => (
    <TouchableOpacity style={styles.card} onPress={() => openPost(item)}>
      {item.mediaUrl && <Image source={{ uri: item.mediaUrl }} style={styles.cardImage} />}
      <View style={styles.cardContent}>
        <View style={[styles.badge, { backgroundColor: getTypeColor(item.type) + '20' }]}>
          <Text style={[styles.badgeText, { color: getTypeColor(item.type) }]}>{item.type}</Text>
        </View>
        <Text style={styles.title}>{item.title}</Text>
        <Text style={styles.description} numberOfLines={2}>{item.description}</Text>
        <View style={styles.footer}>
          <MaterialCommunityIcons name="clock-outline" size={14} color={theme.textMuted} />
          <Text style={styles.date}>{new Date(item.createdAt).toLocaleDateString()}</Text>
        </View>
      </View>
    </TouchableOpacity>
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
          ListEmptyComponent={<Text style={{ textAlign: 'center', color: theme.textMuted, marginTop: 40 }}>No notices found.</Text>}
        />
      )}

      <Modal visible={modalVisible} transparent={true} animationType="slide" onRequestClose={() => setModalVisible(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Announcement</Text>
              <TouchableOpacity onPress={() => setModalVisible(false)}>
                <MaterialCommunityIcons name="close" size={24} color={theme.textMain} />
              </TouchableOpacity>
            </View>
            {selectedPost && (
              <ScrollView>
                {selectedPost.mediaUrl && <Image source={{ uri: selectedPost.mediaUrl }} style={styles.modalImage} />}
                <Text style={styles.modalTitleText}>{selectedPost.title}</Text>
                <Text style={styles.modalDesc}>{selectedPost.description}</Text>
              </ScrollView>
            )}
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
  badge: { alignSelf: 'flex-start', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6, marginBottom: 8 },
  badgeText: { fontSize: 11, fontWeight: 'bold' },
  title: { fontSize: 18, fontWeight: 'bold', color: theme.textMain, marginBottom: 4 },
  description: { fontSize: 14, color: theme.textMuted, lineHeight: 20 },
  footer: { flexDirection: 'row', alignItems: 'center', marginTop: 12 },
  date: { fontSize: 12, color: theme.textMuted, marginLeft: 4 },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  modalContent: { backgroundColor: theme.surface, borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 24, maxHeight: '90%' },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  modalTitle: { fontSize: 18, fontWeight: 'bold', color: theme.textMain },
  modalImage: { width: '100%', height: 200, borderRadius: 12, marginBottom: 16 },
  modalTitleText: { fontSize: 22, fontWeight: 'bold', color: theme.textMain, marginBottom: 8 },
  modalDesc: { fontSize: 15, color: theme.textMuted, lineHeight: 22 }
});

export default NoticeBoardScreen;