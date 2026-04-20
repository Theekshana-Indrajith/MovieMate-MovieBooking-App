import React, { useState, useEffect, useContext } from 'react';
import { StyleSheet, Text, View, FlatList, TouchableOpacity, Alert, SafeAreaView, ActivityIndicator, Image, Modal, StatusBar, ScrollView } from 'react-native';
import { AuthContext } from '../context/AuthContext';
import api from '../utils/api';
import { ArrowLeft, Clock, User, CreditCard, ChevronRight, CheckCircle, XCircle } from 'lucide-react-native';
import BASE_URL from '../utils/constants';
import BottomNav from '../components/BottomNav';

const AdminVerificationScreen = ({ navigation }) => {
    const { token } = useContext(AuthContext);
    const [bookings, setBookings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedBooking, setSelectedBooking] = useState(null);
    const [verifying, setVerifying] = useState(false);

    useEffect(() => {
        fetchPendingBookings();
        const unsubscribe = navigation.addListener('focus', fetchPendingBookings);
        return unsubscribe;
    }, [navigation]);

    const fetchPendingBookings = async () => {
        try {
            const res = await api.get('/bookings', { headers: { Authorization: `Bearer ${token}` } });
            // Only filter Pending bookings
            const pending = res.data.data.filter(b => b.status === 'Pending');
            setBookings(pending.reverse());
        } catch (err) {
            console.log(err);
        } finally {
            setLoading(false);
        }
    };

    const handleVerify = async (id, status) => {
        setVerifying(true);
        try {
            const res = await api.put(`/bookings/${id}/verify`, { status }, {
                headers: { Authorization: `Bearer ${token}` }
            });
            if (res.data.success) {
                Alert.alert('Success', `Payment ${status === 'Confirmed' ? 'approved' : 'rejected'}`);
                fetchPendingBookings();
                setSelectedBooking(null);
            }
        } catch (err) {
            Alert.alert('Error', err.response?.data?.error || 'Action failed');
        } finally {
            setVerifying(false);
        }
    };

    const renderPendingItem = ({ item }) => (
        <TouchableOpacity style={styles.itemCard} onPress={() => setSelectedBooking(item)}>
            <View style={styles.itemHeader}>
                <View style={styles.userBox}>
                    <View style={styles.avatar}><Text style={styles.avatarText}>{item.user?.name[0]}</Text></View>
                    <View style={{ marginLeft: 12 }}>
                        <Text style={styles.userName}>{item.user?.name}</Text>
                        <Text style={styles.userEmail}>{item.user?.email}</Text>
                    </View>
                </View>
                <ChevronRight color="#475569" size={20} />
            </View>
            
            <View style={styles.itemBody}>
                <View style={styles.infoCol}>
                    <Text style={styles.infoLabel}>Movie</Text>
                    <Text style={styles.infoValue} numberOfLines={1}>{item.showtime?.movie?.title}</Text>
                </View>
                <View style={styles.infoCol}>
                    <Text style={styles.infoLabel}>Amount</Text>
                    <Text style={styles.priceValue}>Rs. {item.totalAmount}</Text>
                </View>
            </View>

            <View style={styles.itemFooter}>
                <View style={styles.timeTag}>
                    <Clock color="#F59E0B" size={12} />
                    <Text style={styles.timeTagText}>Pending Verification</Text>
                </View>
                <Text style={styles.dateText}>{new Date(item.createdAt).toLocaleDateString()} • {new Date(item.createdAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</Text>
            </View>
        </TouchableOpacity>
    );

    return (
        <SafeAreaView style={styles.container}>
            <StatusBar barStyle="light-content" />
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                    <ArrowLeft color="#fff" size={24} />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Verify Payments</Text>
                <View style={styles.badgeCount}>
                    <Text style={styles.badgeText}>{bookings.length}</Text>
                </View>
            </View>

            {loading ? (
                <View style={styles.center}>
                    <ActivityIndicator color="#6366F1" size="large" />
                </View>
            ) : bookings.length === 0 ? (
                <View style={styles.center}>
                    <CheckCircle color="#10B981" size={60} style={{ marginBottom: 20 }} opacity={0.5} />
                    <Text style={styles.emptyTitle}>All Caught Up!</Text>
                    <Text style={styles.emptyText}>No pending payments to verify.</Text>
                </View>
            ) : (
                <FlatList
                    data={bookings}
                    keyExtractor={item => item._id}
                    renderItem={renderPendingItem}
                    contentContainerStyle={styles.list}
                    showsVerticalScrollIndicator={false}
                />
            )}

            {/* Verification Modal */}
            <Modal visible={!!selectedBooking} transparent animationType="slide">
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
                        <View style={styles.modalHeader}>
                            <Text style={styles.modalTitle}>Check Transfer Slip</Text>
                            <TouchableOpacity onPress={() => setSelectedBooking(null)}>
                                <XCircle color="#94A3B8" size={24} />
                            </TouchableOpacity>
                        </View>
                        
                        {selectedBooking && (
                            <ScrollView contentContainerStyle={styles.modalBody} showsVerticalScrollIndicator={false}>
                                {/* Movie Detail Header */}
                                <View style={styles.modalMovieCard}>
                                    <Image 
                                        source={{ uri: `${BASE_URL}/uploads/movies/${selectedBooking.showtime?.movie?.poster}` }} 
                                        style={styles.modalPoster} 
                                    />
                                    <View style={styles.modalMovieInfo}>
                                        <Text style={styles.modalMovieTitle}>{selectedBooking.showtime?.movie?.title}</Text>
                                        <View style={styles.modalMetaRow}>
                                            <Clock color="#94A3B8" size={14} />
                                            <Text style={styles.modalMetaText}>{new Date(selectedBooking.showtime?.date).toDateString()} • {selectedBooking.time}</Text>
                                        </View>
                                        <View style={styles.modalMetaRow}>
                                            <User color="#94A3B8" size={14} />
                                            <Text style={styles.modalMetaText}>{selectedBooking.user?.name}</Text>
                                        </View>
                                    </View>
                                </View>

                                <View style={styles.modalSummary}>
                                    <View>
                                        <Text style={styles.summaryLabel}>Total Amount</Text>
                                        <Text style={styles.summaryValue}>Rs. {selectedBooking.totalAmount}</Text>
                                    </View>
                                    <View style={{ alignItems: 'flex-end' }}>
                                        <Text style={styles.summaryLabel}>Seats Selected</Text>
                                        <Text style={styles.summaryValue}>{selectedBooking.seats?.join(', ')}</Text>
                                    </View>
                                </View>

                                <Text style={styles.slipLabel}>Uploaded Image:</Text>
                                <View style={styles.slipContainer}>
                                    <Image 
                                        source={{ uri: `${BASE_URL}/uploads/payments/${selectedBooking.paymentSlip}` }} 
                                        style={styles.slipImage}
                                        resizeMode="contain"
                                    />
                                </View>

                                <View style={styles.actionGrid}>
                                    <TouchableOpacity 
                                        style={[styles.actionBtn, styles.btnReject]} 
                                        onPress={() => handleVerify(selectedBooking._id, 'Cancelled')}
                                        disabled={verifying}
                                    >
                                        {verifying ? <ActivityIndicator color="#EF4444" /> : <Text style={styles.btnRejectTxt}>Reject</Text>}
                                    </TouchableOpacity>
                                    <TouchableOpacity 
                                        style={[styles.actionBtn, styles.btnConfirm]} 
                                        onPress={() => handleVerify(selectedBooking._id, 'Confirmed')}
                                        disabled={verifying}
                                    >
                                        {verifying ? <ActivityIndicator color="#fff" /> : <Text style={styles.btnConfirmTxt}>Approve Payment</Text>}
                                    </TouchableOpacity>
                                </View>
                            </ScrollView>
                        )}
                    </View>
                </View>
            </Modal>
            <BottomNav />
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#0A0F1D' },
    header: { flexDirection: 'row', alignItems: 'center', padding: 20, paddingTop: 40, backgroundColor: '#161B2E', borderBottomLeftRadius: 32, borderBottomRightRadius: 32 },
    headerTitle: { flex: 1, fontSize: 20, fontWeight: 'bold', color: '#fff', marginLeft: 15 },
    backButton: { padding: 10, backgroundColor: 'rgba(255,255,255,0.05)', borderRadius: 14 },
    badgeCount: { backgroundColor: '#F59E0B', paddingHorizontal: 12, paddingVertical: 4, borderRadius: 12 },
    badgeText: { color: '#000', fontWeight: 'bold', fontSize: 12 },
    center: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 40 },
    list: { padding: 20, paddingBottom: 120 },
    itemCard: { backgroundColor: '#161B2E', borderRadius: 24, padding: 20, marginBottom: 15, borderWidth: 1, borderColor: '#1F2937' },
    itemHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 15 },
    userBox: { flexDirection: 'row', alignItems: 'center', flex: 1 },
    avatar: { width: 40, height: 40, borderRadius: 12, backgroundColor: '#6366F1', justifyContent: 'center', alignItems: 'center' },
    avatarText: { color: '#fff', fontWeight: 'bold', fontSize: 16 },
    userName: { color: '#fff', fontWeight: 'bold', fontSize: 15 },
    userEmail: { color: '#64748B', fontSize: 12 },
    itemBody: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 15, borderTopWidth: 1, borderTopColor: '#1F2937', borderBottomWidth: 1, borderBottomColor: '#1F2937' },
    infoCol: { flex: 1 },
    infoLabel: { color: '#64748B', fontSize: 11, marginBottom: 4, textTransform: 'uppercase' },
    infoValue: { color: '#E2E8F0', fontSize: 14, fontWeight: 'bold' },
    priceValue: { color: '#10B981', fontSize: 16, fontWeight: 'bold' },
    itemFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 15 },
    timeTag: { flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(245, 158, 11, 0.1)', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8 },
    timeTagText: { color: '#F59E0B', fontSize: 10, fontWeight: 'bold', marginLeft: 6 },
    dateText: { color: '#475569', fontSize: 11 },
    emptyTitle: { color: '#fff', fontSize: 20, fontWeight: 'bold', marginBottom: 8 },
    emptyText: { color: '#64748B', fontSize: 14, textAlign: 'center' },
    modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.85)', justifyContent: 'flex-end' },
    modalContent: { backgroundColor: '#161B2E', borderTopLeftRadius: 36, borderTopRightRadius: 36, height: '90%' },
    modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 25, borderBottomWidth: 1, borderBottomColor: '#1F2937' },
    modalTitle: { color: '#fff', fontSize: 18, fontWeight: 'bold' },
    modalBody: { padding: 25 },
    modalSummary: { flexDirection: 'row', justifyContent: 'space-between', backgroundColor: '#0A0F1D', padding: 20, borderRadius: 24, marginBottom: 25 },
    summaryLabel: { color: '#64748B', fontSize: 11, marginBottom: 6, textTransform: 'uppercase' },
    summaryValue: { color: '#fff', fontSize: 18, fontWeight: 'bold' },
    slipLabel: { color: '#94A3B8', fontSize: 14, marginBottom: 15, fontWeight: 'bold' },
    slipContainer: { width: '100%', height: 400, backgroundColor: '#0A0F1D', borderRadius: 24, overflow: 'hidden', borderWidth: 1, borderColor: '#1F2937', marginBottom: 30 },
    slipImage: { width: '100%', height: '100%' },
    actionGrid: { flexDirection: 'row', justifyContent: 'space-between', gap: 15, marginBottom: 50 },
    actionBtn: { flex: 1, paddingVertical: 18, borderRadius: 20, alignItems: 'center', justifyContent: 'center' },
    btnReject: { backgroundColor: 'transparent', borderWidth: 1, borderColor: '#EF4444' },
    btnRejectTxt: { color: '#EF4444', fontWeight: 'bold' },
    btnConfirm: { backgroundColor: '#10B981' },
    btnConfirmTxt: { color: '#fff', fontWeight: 'bold' },
    modalMovieCard: { flexDirection: 'row', backgroundColor: 'rgba(255,255,255,0.03)', padding: 15, borderRadius: 24, marginBottom: 20, borderWidth: 1, borderColor: '#1F2937' },
    modalPoster: { width: 60, height: 90, borderRadius: 12, backgroundColor: '#0A0F1D' },
    modalMovieInfo: { flex: 1, marginLeft: 15, justifyContent: 'center' },
    modalMovieTitle: { color: '#fff', fontSize: 16, fontWeight: 'bold', marginBottom: 8 },
    modalMetaRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 4 },
    modalMetaText: { color: '#94A3B8', fontSize: 12, marginLeft: 6 }
});

export default AdminVerificationScreen;
