import React, { useState, useEffect, useContext } from 'react';
import { StyleSheet, Text, View, FlatList, TouchableOpacity, SafeAreaView, ActivityIndicator, Alert, ScrollView, StatusBar, Platform } from 'react-native';
import { AuthContext } from '../context/AuthContext';
import api from '../utils/api';
import { ArrowLeft, Clock, ShoppingBag, MapPin, CheckCircle2, History, ClipboardList } from 'lucide-react-native';
import SkeletonLoader from '../components/SkeletonLoader';
import BottomNav from '../components/BottomNav';
import BASE_URL from '../utils/constants';
import { Image } from 'react-native';

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
            case 'Cancelled': return '#EF4444';
            default: return '#94A3B8';
        }
    };

    const handleCancelOrder = async (orderId) => {
        try {
            const res = await api.put(`/snacks/orders/${orderId}/cancel`, {}, {
                headers: { Authorization: `Bearer ${token}` }
            });
            if (Platform.OS === 'web') {
                window.alert(res.data.message);
            } else {
                Alert.alert('Order Cancelled', res.data.message);
            }
            fetchOrders();
        } catch (err) {
            Alert.alert('Error', err.response?.data?.error || 'Failed to cancel order');
        }
    };

    const renderOrderItem = ({ item }) => {
        const isPending = item.status && item.status.trim() === 'Pending';
        
        return (
            <View style={styles.card}>
                <View style={styles.movieHeader}>
                    <Image 
                        source={{ uri: `${BASE_URL}/uploads/movies/${item.booking?.showtime?.movie?.poster}` }} 
                        style={styles.miniPoster} 
                    />
                    <View style={{ flex: 1, marginLeft: 12 }}>
                        <Text style={styles.movieTitle} numberOfLines={1}>{item.booking?.showtime?.movie?.title}</Text>
                        <Text style={styles.showtimeDetails}>
                            Show: {item.booking?.showtime?.date ? new Date(item.booking.showtime.date).toLocaleDateString() : 'N/A'} at {item.booking?.time || 'N/A'}
                        </Text>
                        <Text style={styles.orderTimeText}>ordered at {new Date(item.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</Text>
                    </View>
                    <View style={[
                        styles.statusBadge, 
                        { 
                            backgroundColor: `${getStatusColor(item.status)}15`, 
                            borderColor: `${getStatusColor(item.status)}40` 
                        }
                    ]}>
                        <Text style={[styles.statusText, { color: getStatusColor(item.status) }]}>{item.status}</Text>
                    </View>
                </View>

                <View style={styles.deliveryInfo}>
                    <MapPin color="#6366F1" size={14} />
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

                {item.proofImage && (
                    <View style={styles.proofContainer}>
                        <Text style={styles.proofLabel}>Delivery Confirmation:</Text>
                        <Image 
                            source={{ uri: `${BASE_URL}/uploads/payments/${item.proofImage}` }} 
                            style={styles.proofImg} 
                        />
                    </View>
                )}

                {isPending && (
                    <TouchableOpacity 
                        activeOpacity={0.7}
                        style={[styles.cancelBtn, { zIndex: 10 }]} 
                        onPress={() => {
                            console.log("Cancelling order:", item._id);
                            if (Platform.OS === 'web') {
                                if (window.confirm('Are you sure you want to cancel this order?')) {
                                    handleCancelOrder(item._id);
                                }
                            } else {
                                setTimeout(() => {
                                    Alert.alert(
                                        'Cancel Order',
                                        'Confirm refund process for this order?',
                                        [
                                            { text: 'Back', style: 'cancel' },
                                            { 
                                                text: 'Proceed', 
                                                style: 'destructive',
                                                onPress: () => handleCancelOrder(item._id)
                                            }
                                        ]
                                    );
                                }, 100);
                            }
                        }}
                    >
                        <Text style={styles.cancelBtnText}>Cancel Order & Request Refund</Text>
                    </TouchableOpacity>
                )}

                <View style={styles.cardFooter}>
                    <Text style={styles.totalLabel}>Total Paid</Text>
                    <Text style={styles.totalValue}>Rs. {item.totalAmount}</Text>
                </View>
            </View>
        );
    };

    return (
        <SafeAreaView style={styles.container}>
            <StatusBar barStyle="light-content" />
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                    <ArrowLeft color="#fff" size={24} />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Order History</Text>
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
                    <ClipboardList color="#334155" size={60} />
                    <Text style={styles.emptyText}>You haven't ordered any snacks yet.</Text>
                    <TouchableOpacity style={styles.mainBtn} onPress={() => navigation.navigate('UserSnackMenu')}>
                        <Text style={styles.mainBtnText}>Go to Menu</Text>
                    </TouchableOpacity>
                </View>
            ) : (
                <FlatList
                    data={orders}
                    keyExtractor={(item) => item._id}
                    renderItem={renderOrderItem}
                    contentContainerStyle={[styles.listContent, { paddingBottom: 130 }]}
                    showsVerticalScrollIndicator={false}
                />
            )}
            <BottomNav />
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#030712' }, // Deeper dark
    header: { 
        flexDirection: 'row', 
        justifyContent: 'space-between', 
        alignItems: 'center', 
        paddingHorizontal: 20, 
        paddingBottom: 25,
        paddingTop: Platform.OS === 'ios' ? 60 : 40,
        backgroundColor: '#0F172A', 
        borderBottomLeftRadius: 35, 
        borderBottomRightRadius: 35,
        shadowColor: '#6366F1',
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.1,
        shadowRadius: 20,
        elevation: 10,
        zIndex: 100
    },
    headerTitle: { fontSize: 24, fontWeight: '900', color: '#F8FAFC', letterSpacing: -0.5 },
    backButton: { 
        padding: 12, 
        backgroundColor: 'rgba(255,255,255,0.03)', 
        borderRadius: 16, 
        borderWidth: 1, 
        borderColor: 'rgba(255,255,255,0.08)' 
    },
    listContent: { padding: 20, paddingTop: 10 },
    card: { 
        backgroundColor: '#0F172A', 
        borderRadius: 30, 
        marginBottom: 20, 
        padding: 20, 
        borderWidth: 1, 
        borderColor: 'rgba(255,255,255,0.05)',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 10,
        elevation: 5
    },
    movieHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 20 },
    miniPoster: { width: 56, height: 80, borderRadius: 14, backgroundColor: '#1E293B', borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)' },
    movieTitle: { color: '#F8FAFC', fontSize: 18, fontWeight: '800', letterSpacing: -0.2 },
    showtimeDetails: { color: '#818CF8', fontSize: 12, fontWeight: '700', marginTop: 4, letterSpacing: 0.5 },
    orderTimeText: { color: '#64748B', fontSize: 11, marginTop: 4, fontWeight: '500' },
    statusBadge: { 
        paddingHorizontal: 12, 
        paddingVertical: 6, 
        borderRadius: 12, 
        borderWidth: 1 
    },
    statusText: { fontSize: 10, fontWeight: '900', textTransform: 'uppercase', letterSpacing: 1 },
    deliveryInfo: { 
        flexDirection: 'row', 
        alignItems: 'center', 
        backgroundColor: 'rgba(99, 102, 241, 0.05)', 
        padding: 12, 
        borderRadius: 18, 
        marginBottom: 20,
        borderWidth: 1,
        borderColor: 'rgba(99, 102, 241, 0.1)'
    },
    infoText: { color: '#CBD5E1', fontSize: 14, marginLeft: 10, fontWeight: '700' },
    divider: { height: 1, backgroundColor: 'rgba(255,255,255,0.03)', marginBottom: 15 },
    itemsList: { marginBottom: 10 },
    itemRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 10, alignItems: 'center' },
    itemName: { color: '#94A3B8', fontSize: 15, fontWeight: '500' },
    itemPrice: { color: '#F1F5F9', fontSize: 15, fontWeight: '800' },
    cardFooter: { 
        flexDirection: 'row', 
        justifyContent: 'space-between', 
        alignItems: 'center', 
        backgroundColor: 'rgba(16, 185, 129, 0.03)', 
        padding: 18, 
        borderRadius: 22,
        marginTop: 5,
        borderWidth: 1,
        borderColor: 'rgba(16, 185, 129, 0.05)'
    },
    totalLabel: { color: '#64748B', fontSize: 14, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 1 },
    totalValue: { color: '#10B981', fontSize: 22, fontWeight: '900' },
    proofContainer: { 
        marginTop: 20, 
        padding: 15, 
        backgroundColor: 'rgba(16, 185, 129, 0.05)', 
        borderRadius: 24, 
        borderWidth: 1, 
        borderColor: 'rgba(16, 185, 129, 0.15)',
        marginBottom: 10
    },
    proofLabel: { color: '#10B981', fontSize: 12, fontWeight: '900', marginBottom: 10, textTransform: 'uppercase', letterSpacing: 1 },
    proofImg: { width: '100%', height: 180, borderRadius: 18, backgroundColor: '#030712' },
    center: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 40 },
    emptyText: { color: '#64748B', fontSize: 16, textAlign: 'center', marginTop: 20, marginBottom: 30, fontWeight: '600' },
    mainBtn: { 
        backgroundColor: '#6366F1', 
        paddingHorizontal: 35, 
        paddingVertical: 18, 
        borderRadius: 22,
        shadowColor: '#6366F1',
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.3,
        shadowRadius: 15,
        elevation: 8
    },
    mainBtnText: { color: '#fff', fontWeight: '900', fontSize: 16, letterSpacing: 0.5 },
    cancelBtn: { 
        backgroundColor: 'rgba(239, 68, 68, 0.05)', 
        borderWidth: 1, 
        borderColor: 'rgba(239, 68, 68, 0.2)', 
        paddingVertical: 14, 
        borderRadius: 20, 
        marginTop: 15, 
        marginBottom: 20,
        alignItems: 'center',
        borderStyle: 'dashed'
    },
    cancelBtnText: { color: '#F87171', fontWeight: '800', fontSize: 13, textTransform: 'uppercase', letterSpacing: 1.2 }
});

export default UserSnackOrderHistoryScreen;
