import React, { useState, useEffect, useContext } from 'react';
import { StyleSheet, Text, View, FlatList, TouchableOpacity, Alert, SafeAreaView, Platform, ScrollView } from 'react-native';
import { AuthContext } from '../context/AuthContext';
import api from '../utils/api';
import { ArrowLeft, Clock, ShoppingBag, User, MapPin, CheckCircle2, Loader2 } from 'lucide-react-native';
import SkeletonLoader from '../components/SkeletonLoader';

const AdminSnackOrderScreen = ({ navigation }) => {
    const { token } = useContext(AuthContext);
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchOrders = async () => {
        try {
            const res = await api.get('/snacks/orders', {
                headers: { Authorization: `Bearer ${token}` }
            });
            setOrders(res.data.data);
        } catch (err) {
            Alert.alert('Error', 'Failed to fetch snack orders');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchOrders();
        const unsubscribe = navigation.addListener('focus', fetchOrders);
        return unsubscribe;
    }, [navigation]);

    const updateStatus = async (id, newStatus) => {
        try {
            await api.put(`/snacks/orders/${id}/status`, { status: newStatus }, {
                headers: { Authorization: `Bearer ${token}` }
            });
            fetchOrders();
            if (Platform.OS === 'web') window.alert('Status updated!');
        } catch (err) {
            Alert.alert('Error', 'Failed to update status');
        }
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'Pending': return '#F59E0B';
            case 'Preparing': return '#3B82F6';
            case 'Ready': return '#8B5CF6';
            case 'Delivered': return '#10B981';
            default: return '#94A3B8';
        }
    };

    const renderOrder = ({ item }) => {
        const statuses = ['Pending', 'Preparing', 'Ready', 'Delivered'];
        
        return (
            <View style={styles.card}>
                <View style={styles.cardHeader}>
                    <View>
                        <Text style={styles.orderId}>#ORDER-{item._id.substring(item._id.length - 6).toUpperCase()}</Text>
                        <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 4 }}>
                             <Clock color="#64748B" size={10} />
                             <Text style={styles.timeText}> {new Date(item.createdAt).toLocaleString()}</Text>
                        </View>
                        <View style={styles.showtimeBadge}>
                            <Text style={styles.showtimeBadgeText}>
                                🎟️ {item.booking?.showtime?.movie?.title}
                            </Text>
                            <Text style={styles.showtimeBadgeSub}>
                                📅 {item.booking?.showtime ? new Date(item.booking.showtime.date).toLocaleDateString() : 'N/A'} | ⏰ {item.booking?.time || 'N/A'}
                            </Text>
                        </View>
                    </View>
                    <View style={[styles.statusBadge, { backgroundColor: `${getStatusColor(item.status)}15` }]}>
                        <View style={[styles.dot, { backgroundColor: getStatusColor(item.status) }]} />
                        <Text style={[styles.statusText, { color: getStatusColor(item.status) }]}>{item.status}</Text>
                    </View>
                </View>

                <View style={styles.customerInfo}>
                    <View style={styles.infoRow}>
                        <User color="#94A3B8" size={14} />
                        <Text style={styles.infoText}>{item.user?.name}</Text>
                    </View>
                    <View style={styles.infoRow}>
                        <MapPin color="#94A3B8" size={14} />
                        <Text style={styles.infoText}>
                            {item.deliveryMethod}: <Text style={{ color: '#fff', fontWeight: 'bold' }}>{item.deliveryMethod === 'In-Seat' ? item.seatNumber : 'Pickup at Counter'}</Text>
                        </Text>
                    </View>
                </View>

                <View style={styles.divider} />

                <View style={styles.itemsList}>
                    {item.items.map((it, idx) => (
                        <View key={idx} style={styles.itemRow}>
                            <Text style={styles.itemQty}>{it.quantity}x</Text>
                            <Text style={styles.itemName}>{it.snack?.name}</Text>
                            <Text style={styles.itemPrice}>Rs. {it.price * it.quantity}</Text>
                        </View>
                    ))}
                </View>

                <View style={styles.footer}>
                    <Text style={styles.totalLabel}>Total Amount</Text>
                    <Text style={styles.totalValue}>Rs. {item.totalAmount}</Text>
                </View>

                <View style={styles.actionContainer}>
                    <Text style={styles.updateLabel}>Update Status:</Text>
                    <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.statusScroll}>
                        {statuses.map(s => (
                            <TouchableOpacity 
                                key={s} 
                                style={[
                                    styles.statusBtn, 
                                    item.status === s && { backgroundColor: getStatusColor(s) }
                                ]}
                                onPress={() => updateStatus(item._id, s)}
                            >
                                <Text style={[styles.statusBtnText, item.status === s && { color: '#fff' }]}>{s}</Text>
                            </TouchableOpacity>
                        ))}
                    </ScrollView>
                </View>
            </View>
        );
    };

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                    <ArrowLeft color="#fff" size={24} />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Snack Orders</Text>
                <TouchableOpacity style={styles.refreshBtn} onPress={fetchOrders}>
                    <Loader2 color="#fff" size={20} />
                </TouchableOpacity>
            </View>

            {loading ? (
                <View style={{ padding: 20 }}>
                    {[1,2,3].map(i => (
                        <View key={i} style={[styles.card, { height: 200, padding: 16 }]}>
                            <SkeletonLoader width="60%" height={20} borderRadius={6} style={{ marginBottom: 15 }} />
                            <SkeletonLoader width="80%" height={15} borderRadius={4} style={{ marginBottom: 10 }} />
                            <SkeletonLoader width="70%" height={15} borderRadius={4} style={{ marginBottom: 30 }} />
                            <SkeletonLoader width="100%" height={40} borderRadius={10} />
                        </View>
                    ))}
                </View>
            ) : orders.length === 0 ? (
                <View style={styles.center}>
                    <ShoppingBag color="#334155" size={60} />
                    <Text style={styles.emptyText}>No food orders yet.</Text>
                </View>
            ) : (
                <FlatList
                    data={orders}
                    keyExtractor={(item) => item._id}
                    renderItem={renderOrder}
                    contentContainerStyle={styles.listContent}
                    showsVerticalScrollIndicator={false}
                />
            )}
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#0F172A' },
    header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 20, backgroundColor: '#1E293B' },
    headerTitle: { fontSize: 18, fontWeight: 'bold', color: '#fff' },
    backButton: { padding: 10, backgroundColor: 'rgba(255,255,255,0.05)', borderRadius: 12 },
    refreshBtn: { padding: 10, backgroundColor: 'rgba(255,255,255,0.05)', borderRadius: 12 },
    listContent: { padding: 20 },
    card: { backgroundColor: '#1E293B', borderRadius: 24, marginBottom: 20, padding: 20, borderWidth: 1, borderColor: '#334155', overflow: 'hidden' },
    cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 15 },
    orderId: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
    timeText: { color: '#64748B', fontSize: 12 },
    showtimeBadge: { backgroundColor: 'rgba(255,255,255,0.05)', paddingHorizontal: 10, paddingVertical: 8, borderRadius: 12, marginTop: 10, alignSelf: 'flex-start' },
    showtimeBadgeText: { color: '#fff', fontSize: 13, fontWeight: 'bold' },
    showtimeBadgeSub: { color: '#94A3B8', fontSize: 11, marginTop: 4, fontWeight: '600' },
    statusBadge: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 12 },
    dot: { width: 8, height: 8, borderRadius: 4, marginRight: 8 },
    statusText: { fontSize: 11, fontWeight: 'bold', textTransform: 'uppercase' },
    customerInfo: { marginBottom: 15 },
    infoRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 6 },
    infoText: { color: '#CBD5E1', fontSize: 13, marginLeft: 8 },
    divider: { height: 1, backgroundColor: '#334155', marginVertical: 10 },
    itemsList: { marginBottom: 15 },
    itemRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 8 },
    itemQty: { color: '#10B981', fontWeight: 'bold', width: 30, fontSize: 14 },
    itemName: { color: '#E2E8F0', flex: 1, fontSize: 14 },
    itemPrice: { color: '#94A3B8', fontSize: 13 },
    footer: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20, backgroundColor: 'rgba(16, 185, 129, 0.05)', padding: 12, borderRadius: 12 },
    totalLabel: { color: '#10B981', fontSize: 13, fontWeight: 'bold' },
    totalValue: { color: '#10B981', fontSize: 18, fontWeight: 'bold' },
    actionContainer: {},
    updateLabel: { color: '#94A3B8', fontSize: 12, fontWeight: 'bold', marginBottom: 10, textTransform: 'uppercase' },
    statusScroll: { flexDirection: 'row' },
    statusBtn: { paddingHorizontal: 16, paddingVertical: 8, borderRadius: 10, backgroundColor: '#10192C', marginRight: 8, borderWidth: 1, borderColor: '#334155' },
    statusBtnText: { fontSize: 12, fontWeight: 'bold', color: '#94A3B8' },
    center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    emptyText: { color: '#64748B', fontSize: 16, marginTop: 15 }
});

export default AdminSnackOrderScreen;
