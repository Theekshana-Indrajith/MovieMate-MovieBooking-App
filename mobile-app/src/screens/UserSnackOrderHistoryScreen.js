import React, { useState, useEffect, useContext } from 'react';
import { StyleSheet, Text, View, FlatList, TouchableOpacity, SafeAreaView, ActivityIndicator, Alert, ScrollView } from 'react-native';
import { AuthContext } from '../context/AuthContext';
import api from '../utils/api';
import { ArrowLeft, Clock, ShoppingBag, MapPin, CheckCircle2, History } from 'lucide-react-native';
import SkeletonLoader from '../components/SkeletonLoader';

const UserSnackOrderHistoryScreen = ({ navigation }) => {
    const { token } = useContext(AuthContext);
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchOrders = async () => {
        try {
            const res = await api.get('/snacks/orders/my', {
                headers: { Authorization: `Bearer ${token}` }
            });
            setOrders(res.data.data);
        } catch (err) {
            console.log(err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchOrders();
        const unsubscribe = navigation.addListener('focus', fetchOrders);
        return unsubscribe;
    }, [navigation]);

    const getStatusColor = (status) => {
        switch (status) {
            case 'Pending': return '#F59E0B';
            case 'Preparing': return '#3B82F6';
            case 'Ready': return '#8B5CF6';
            case 'Delivered': return '#10B981';
            default: return '#94A3B8';
        }
    };

    const renderOrderItem = ({ item }) => (
        <View style={styles.card}>
            <View style={styles.cardHeader}>
                <View>
                    <Text style={styles.movieTitle}>{item.booking?.showtime?.movie?.title}</Text>
                    <Text style={styles.timeText}>{new Date(item.createdAt).toLocaleDateString()} • {new Date(item.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</Text>
                </View>
                <View style={[styles.statusBadge, { backgroundColor: `${getStatusColor(item.status)}15` }]}>
                    <Text style={[styles.statusText, { color: getStatusColor(item.status) }]}>{item.status}</Text>
                </View>
            </View>

            <View style={styles.deliveryInfo}>
                 <MapPin color="#94A3B8" size={14} />
                 <Text style={styles.infoText}>
                    {item.deliveryMethod === 'In-Seat' ? `In-Seat: ${item.seatNumber}` : 'Counter Pickup'}
                 </Text>
            </View>

            <View style={styles.divider} />

            <View style={styles.itemsList}>
                {item.items.map((it, idx) => (
                    <View key={idx} style={styles.itemRow}>
                        <Text style={styles.itemName}>{it.snack?.name} <Text style={{ color: '#64748B' }}>x{it.quantity}</Text></Text>
                        <Text style={styles.itemPrice}>Rs. {it.price * it.quantity}</Text>
                    </View>
                ))}
            </View>

            <View style={styles.cardFooter}>
                <Text style={styles.totalLabel}>Total Paid</Text>
                <Text style={styles.totalValue}>Rs. {item.totalAmount}</Text>
            </View>
        </View>
    );

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                    <ArrowLeft color="#fff" size={24} />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>My Snack Orders</Text>
                <View style={{ width: 44 }} />
            </View>

            {loading ? (
                <View style={{ padding: 20 }}>
                     {[1,2,3].map(i => (
                        <View key={i} style={[styles.card, { height: 180, padding: 20 }]}>
                             <SkeletonLoader width="70%" height={20} borderRadius={6} style={{ marginBottom: 15 }} />
                             <SkeletonLoader width="50%" height={15} borderRadius={4} style={{ marginBottom: 20 }} />
                             <SkeletonLoader width="100%" height={50} borderRadius={12} />
                        </View>
                     ))}
                </View>
            ) : orders.length === 0 ? (
                <View style={styles.center}>
                    <History color="#334155" size={60} />
                    <Text style={styles.emptyText}>You haven't ordered any snacks yet.</Text>
                    <TouchableOpacity style={styles.mainBtn} onPress={() => navigation.navigate('UserSnackMenu')}>
                        <Text style={styles.mainBtnText}>Order Now</Text>
                    </TouchableOpacity>
                </View>
            ) : (
                <FlatList
                    data={orders}
                    keyExtractor={(item) => item._id}
                    renderItem={renderOrderItem}
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
    listContent: { padding: 20 },
    card: { backgroundColor: '#1E293B', borderRadius: 24, marginBottom: 20, padding: 20, borderWidth: 1, borderColor: '#334155' },
    cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 },
    movieTitle: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
    timeText: { color: '#64748B', fontSize: 12, marginTop: 4 },
    statusBadge: { paddingHorizontal: 10, paddingVertical: 5, borderRadius: 10 },
    statusText: { fontSize: 10, fontWeight: 'bold', textTransform: 'uppercase' },
    deliveryInfo: { flexDirection: 'row', alignItems: 'center', marginBottom: 15 },
    infoText: { color: '#CBD5E1', fontSize: 12, marginLeft: 6, fontWeight: '600' },
    divider: { height: 1, backgroundColor: '#334155', marginBottom: 15 },
    itemsList: { marginBottom: 15 },
    itemRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 6 },
    itemName: { color: '#94A3B8', fontSize: 13 },
    itemPrice: { color: '#E2E8F0', fontSize: 13, fontWeight: 'bold' },
    cardFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: 'rgba(255,255,255,0.03)', padding: 12, borderRadius: 12 },
    totalLabel: { color: '#64748B', fontSize: 12, fontWeight: 'bold' },
    totalValue: { color: '#10B981', fontSize: 16, fontWeight: 'bold' },
    center: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 40 },
    emptyText: { color: '#64748B', fontSize: 16, textAlign: 'center', marginBottom: 20 },
    mainBtn: { backgroundColor: '#F59E0B', paddingHorizontal: 24, paddingVertical: 14, borderRadius: 14 },
    mainBtnText: { color: '#fff', fontWeight: 'bold' }
});

export default UserSnackOrderHistoryScreen;
