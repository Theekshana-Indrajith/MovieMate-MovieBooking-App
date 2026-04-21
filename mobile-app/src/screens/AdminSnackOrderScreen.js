import React, { useState, useEffect, useContext } from 'react';
import { StyleSheet, Text, View, FlatList, TouchableOpacity, Alert, SafeAreaView, Platform, ScrollView, StatusBar } from 'react-native';
import { AuthContext } from '../context/AuthContext';
import api from '../utils/api';
import { ArrowLeft, Clock, ShoppingBag, User, MapPin, CheckCircle2, Loader2, Camera, Trash2, Image as ImageIcon } from 'lucide-react-native';
import * as ImagePicker from 'expo-image-picker';
import { Image } from 'react-native';
import SkeletonLoader from '../components/SkeletonLoader';
import BottomNav from '../components/BottomNav';

const AdminSnackOrderScreen = ({ navigation }) => {
    const { token } = useContext(AuthContext);
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedOrderProof, setSelectedOrderProof] = useState({}); // ID -> Image object
    const [uploading, setUploading] = useState(null); // ID of order currently uploading

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

    const pickProofImage = async (id) => {
        let result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ['images'],
            allowsEditing: true,
            aspect: [4, 3],
            quality: 0.7,
        });
        if (!result.canceled) {
            setSelectedOrderProof({ ...selectedOrderProof, [id]: result.assets[0] });
        }
    };

    const updateStatus = async (id, newStatus) => {
        const image = selectedOrderProof[id];

        // Ensure image is provided if marking as delivered
        if (newStatus === 'Delivered' && !image) {
            Alert.alert('Proof Required', 'Please attach a delivery proof photo before marking as Delivered.');
            return;
        }

        setUploading(id);
        const formData = new FormData();
        formData.append('status', newStatus);

        if (image) {
            if (Platform.OS === 'web') {
                const res = await fetch(image.uri);
                const blob = await res.blob();
                formData.append('paymentSlip', blob, 'proof.jpg'); // Using paymentSlip field as configured in router
            } else {
                formData.append('paymentSlip', { uri: image.uri, name: 'proof.jpg', type: 'image/jpeg' });
            }
        }

        try {
            await api.put(`/snacks/orders/${id}/status`, formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                    'Authorization': `Bearer ${token}`
                }
            });

            // Clear proof for this order after success
            const newProofs = { ...selectedOrderProof };
            delete newProofs[id];
            setSelectedOrderProof(newProofs);

            fetchOrders();
            if (Platform.OS === 'web') window.alert('Status updated!');
        } catch (err) {
            Alert.alert('Error', 'Failed to update status');
        } finally {
            setUploading(null);
        }
    };

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

    const renderOrder = ({ item }) => {
        const statuses = ['Pending', 'Preparing', 'Ready', 'Delivered', 'Cancelled'];

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

                {/* Assignment Requirement: Delivery Proof Image Selection */}
                <View style={styles.assignmentBox}>
                    <Text style={styles.assignmentTitle}>Proof of Delivery</Text>
                    <TouchableOpacity
                        style={[styles.proofPicker, selectedOrderProof[item._id] && styles.proofPickerHasImg]}
                        onPress={() => pickProofImage(item._id)}
                    >
                        {selectedOrderProof[item._id] ? (
                            <View style={styles.proofPreviewContainer}>
                                <Image source={{ uri: selectedOrderProof[item._id].uri }} style={styles.proofImage} />
                                <Text style={styles.proofName}>Ready to Upload</Text>
                            </View>
                        ) : (
                            <>
                                <Camera color="#64748B" size={16} />
                                <Text style={styles.proofText}>Attach Proof (Required for Delivered)</Text>
                            </>
                        )}
                    </TouchableOpacity>
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
                                disabled={uploading === item._id}
                            >
                                {uploading === item._id ? <Loader2 color="#fff" size={14} /> : (
                                    <Text style={[styles.statusBtnText, item.status === s && { color: '#fff' }]}>{s}</Text>
                                )}
                            </TouchableOpacity>
                        ))}
                    </ScrollView>
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
                <Text style={styles.headerTitle}>Snack Orders</Text>
                <TouchableOpacity style={styles.refreshBtn} onPress={fetchOrders}>
                    <Loader2 color="#fff" size={20} />
                </TouchableOpacity>
            </View>

            {loading ? (
                <View style={{ padding: 20 }}>
                    {[1, 2, 3].map(i => (
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
                    contentContainerStyle={[styles.listContent, { paddingBottom: 130 }]}
                    showsVerticalScrollIndicator={false}
                />
            )}
            <BottomNav />
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#030712' },
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
        elevation: 10
    },
    headerTitle: { fontSize: 22, fontWeight: '900', color: '#F8FAFC', letterSpacing: -0.5 },
    backButton: { padding: 12, backgroundColor: 'rgba(255,255,255,0.03)', borderRadius: 16, borderWidth: 1, borderColor: 'rgba(255,255,255,0.08)' },
    refreshBtn: { padding: 12, backgroundColor: 'rgba(99, 102, 241, 0.1)', borderRadius: 16 },
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
    cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 20 },
    orderId: { color: '#F8FAFC', fontSize: 17, fontWeight: '800', letterSpacing: 0.5 },
    timeText: { color: '#64748B', fontSize: 11, fontWeight: '600' },
    showtimeBadge: { 
        backgroundColor: 'rgba(255,255,255,0.02)', 
        paddingHorizontal: 15, 
        paddingVertical: 12, 
        borderRadius: 20, 
        marginTop: 15, 
        borderWidth: 1, 
        borderColor: 'rgba(255,255,255,0.05)' 
    },
    showtimeBadgeText: { color: '#F1F5F9', fontSize: 14, fontWeight: '800' },
    showtimeBadgeSub: { color: '#818CF8', fontSize: 11, marginTop: 4, fontWeight: '700', letterSpacing: 0.5 },
    statusBadge: { 
        flexDirection: 'row', 
        alignItems: 'center', 
        paddingHorizontal: 12, 
        paddingVertical: 6, 
        borderRadius: 12,
        borderWidth: 1
    },
    dot: { width: 6, height: 6, borderRadius: 3, marginRight: 8 },
    statusText: { fontSize: 10, fontWeight: '900', textTransform: 'uppercase', letterSpacing: 1 },
    customerInfo: { marginBottom: 15, marginTop: 10 },
    infoRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 8 },
    infoText: { color: '#CBD5E1', fontSize: 14, marginLeft: 10, fontWeight: '600' },
    divider: { height: 1, backgroundColor: 'rgba(255,255,255,0.03)', marginVertical: 15 },
    itemsList: { marginBottom: 15 },
    itemRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 10 },
    itemQty: { color: '#10B981', fontWeight: '900', width: 35, fontSize: 14 },
    itemName: { color: '#E2E8F0', flex: 1, fontSize: 14, fontWeight: '600' },
    itemPrice: { color: '#94A3B8', fontSize: 14, fontWeight: '700' },
    footer: { 
        flexDirection: 'row', 
        justifyContent: 'space-between', 
        alignItems: 'center', 
        marginBottom: 25, 
        backgroundColor: 'rgba(16, 185, 129, 0.03)', 
        padding: 15, 
        borderRadius: 20,
        borderWidth: 1,
        borderColor: 'rgba(16, 185, 129, 0.05)'
    },
    totalLabel: { color: '#10B981', fontSize: 13, fontWeight: '800', textTransform: 'uppercase' },
    totalValue: { color: '#10B981', fontSize: 20, fontWeight: '900' },
    assignmentBox: { 
        backgroundColor: 'rgba(99, 102, 241, 0.03)', 
        padding: 15, 
        borderRadius: 22, 
        marginBottom: 20, 
        borderStyle: 'dashed', 
        borderWidth: 1, 
        borderColor: 'rgba(99, 102, 241, 0.2)' 
    },
    assignmentTitle: { color: '#818CF8', fontSize: 11, fontWeight: '900', textTransform: 'uppercase', marginBottom: 12, letterSpacing: 1 },
    proofPicker: { 
        flexDirection: 'row', 
        alignItems: 'center', 
        backgroundColor: '#030712', 
        padding: 15, 
        borderRadius: 16, 
        borderWidth: 1, 
        borderColor: 'rgba(255,255,255,0.05)' 
    },
    proofPickerHasImg: { borderColor: '#10B981', backgroundColor: 'rgba(16, 185, 129, 0.02)' },
    proofText: { color: '#64748B', fontSize: 12, marginLeft: 10, fontWeight: '600' },
    proofPreviewContainer: { flexDirection: 'row', alignItems: 'center' },
    proofImage: { width: 35, height: 35, borderRadius: 8, marginRight: 12 },
    proofName: { color: '#10B981', fontSize: 13, fontWeight: '800' },
    actionContainer: { marginTop: 5 },
    updateLabel: { color: '#64748B', fontSize: 11, fontWeight: '900', marginBottom: 15, textTransform: 'uppercase', letterSpacing: 1.5 },
    statusScroll: { flexDirection: 'row', paddingBottom: 5 },
    statusBtn: { 
        paddingHorizontal: 18, 
        paddingVertical: 12, 
        borderRadius: 16, 
        backgroundColor: '#030712', 
        marginRight: 10, 
        borderWidth: 1, 
        borderColor: 'rgba(255,255,255,0.05)',
        minWidth: 100,
        alignItems: 'center'
    },
    statusBtnText: { fontSize: 12, fontWeight: '800', color: '#64748B' },
    center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    emptyText: { color: '#64748B', fontSize: 16, marginTop: 20, fontWeight: '600' }
});

export default AdminSnackOrderScreen;
