import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, RefreshControl } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import api from '../api/client';
import { colors } from '../theme/colors';
import Card from '../components/Card';

export default function NotificationsScreen() {
  const [items, setItems] = useState([]);
  const [refreshing, setRefreshing] = useState(false);

  const load = async () => {
    try {
      const { data } = await api.get('/notifications');
      setItems(data.notifications || data || []);
    } catch (e) {
      setItems([]);
    }
  };

  useFocusEffect(useCallback(() => { load(); }, []));

  const markRead = async (id) => {
    try {
      await api.put(`/notifications/${id}/read`);
      setItems((prev) => prev.map((n) => n._id === id ? { ...n, read: true, isRead: true } : n));
    } catch (e) {
      // non-blocking
    }
  };

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <FlatList
        data={items}
        keyExtractor={(i) => i._id}
        contentContainerStyle={{ padding: 20 }}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={async () => { setRefreshing(true); await load(); setRefreshing(false); }} />}
        ListEmptyComponent={<Text style={{ textAlign: 'center', color: colors.gray, marginTop: 40 }}>No notifications</Text>}
        renderItem={({ item }) => (
          <TouchableOpacity onPress={() => !item.read && markRead(item._id)}>
            <Card style={{ borderLeftWidth: 4, borderLeftColor: item.read ? colors.lightGray : colors.careGreen }}>
              <Text style={{ fontWeight: item.read ? '500' : '700', color: colors.ink }}>{item.title}</Text>
              <Text style={{ fontSize: 13, color: colors.gray, marginTop: 4 }}>{item.message}</Text>
            </Card>
          </TouchableOpacity>
        )}
      />
    </View>
  );
}