import React, { useState, useContext } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, SafeAreaView, Alert, ActivityIndicator, Image, ScrollView, Platform } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { AuthContext } from '../context/AuthContext';
import axios from 'axios';
import api from '../utils/api';
import BASE_URL from '../utils/constants';
import { ArrowLeft, Upload, CheckCircle, CreditCard, Copy, Info } from 'lucide-react-native';

const PaymentScreen = ({ route, navigation }) => {
    const { movie, showtime, selectedSeats, totalAmount } = route.params;
    const { token } = useContext(AuthContext);
    
    const [image, setImage] = useState(null);
    const [loading, setLoading] = useState(false);

    const bankDetails = {
        bank: 'Bank of Ceylon (BOC)',
        accountName: 'MovieMate (Pvt) Ltd',
        accountNumber: '87654321',
        branch: 'Colombo Fort'
    };

    const pickImage = async () => {
        const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (status !== 'granted') {
            Alert.alert('Permission Denied', 'Sorry, we need camera roll permissions to upload the slip!');
            return;
        }

        let result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: true,
            quality: 0.8,
        });

        if (!result.canceled) {
            setImage(result.assets[0]);
        }
    };

    const handleConfirmBooking = async () => {
        if (!image) {
            Alert.alert('Error', 'Please upload your payment slip.');
            return;
        }

        setLoading(true);

        try {
            const formData = new FormData();
            formData.append('showtime', showtime.showtimeId);
            formData.append('time', showtime.time);
            formData.append('seats', JSON.stringify(selectedSeats.map(s => s.id)));
            formData.append('totalAmount', totalAmount.toString());
            
            if (Platform.OS === 'web') {
                // On web, we need to fetch the blob from the URI
                const response = await fetch(image.uri);
                const blob = await response.blob();
                formData.append('paymentSlip', blob, `slip-${Date.now()}.jpg`);
            } else {
                const uriParts = image.uri.split('.');
                const fileType = uriParts[uriParts.length - 1];
                formData.append('paymentSlip', {
                    uri: Platform.OS === 'ios' ? image.uri.replace('file://', '') : image.uri,
                    name: `slip-${Date.now()}.${fileType}`,
                    type: `image/${fileType}`,
                });
            }

            // Use clean axios to avoid default JSON headers from api instance
            const res = await axios.post(`${BASE_URL}/api/bookings`, formData, {
                headers: { 
                    Authorization: `Bearer ${token}`,
                    'Content-Type': 'multipart/form-data'
                }
            });
            
            if (res.data.success) {
                if (Platform.OS === 'web') {
                    window.alert('Booking Received! Your booking is pending admin verification. You can check the status in your bookings history.');
                    navigation.navigate('UserBookings');
                } else {
                    Alert.alert(
                        'Booking Received!', 
                        'Your booking is pending admin verification. You can check the status in your bookings history.',
                        [{ text: 'View My Bookings', onPress: () => navigation.navigate('UserBookings') }]
                    );
                }
            }
        } catch (err) {
            console.log('Upload Error DETAILS:', err.response?.data);
            const errorMsg = err.response?.data?.error || err.message;
            Alert.alert('Booking Error', errorMsg);
        } finally {
            setLoading(false);
        }
    };

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                    <ArrowLeft color="#fff" size={24} />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Payment Verification</Text>
                <View style={{ width: 44 }} />
            </View>

            <ScrollView contentContainerStyle={styles.content}>
                <View style={styles.summaryCard}>
                    <Text style={styles.summaryTitle}>{movie.title}</Text>
                    <Text style={styles.summaryText}>{showtime.date} • {showtime.time}</Text>
                    <Text style={styles.summaryText}>Seats: {selectedSeats.map(s => s.id).join(', ')}</Text>
                    <View style={styles.divider} />
                    <View style={styles.totalRow}>
                        <Text style={styles.totalLabel}>Total Payable</Text>
                        <Text style={styles.totalValue}>Rs. {totalAmount}</Text>
                    </View>
                </View>

                <View style={styles.sectionHeader}>
                    <CreditCard color="#3B82F6" size={20} />
                    <Text style={styles.sectionTitle}>Bank Transfer Details</Text>
                </View>

                <View style={styles.bankCard}>
                    <View style={styles.bankRow}>
                        <Text style={styles.bankLabel}>Bank</Text>
                        <Text style={styles.bankValue}>{bankDetails.bank}</Text>
                    </View>
                    <View style={styles.bankRow}>
                        <Text style={styles.bankLabel}>Name</Text>
                        <Text style={styles.bankValue}>{bankDetails.accountName}</Text>
                    </View>
                    <View style={styles.bankRow}>
                        <Text style={styles.bankLabel}>Acc No</Text>
                        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                            <Text style={styles.bankValue}>{bankDetails.accountNumber}</Text>
                            <TouchableOpacity style={{ marginLeft: 8 }}>
                                <Copy color="#6366F1" size={14} />
                            </TouchableOpacity>
                        </View>
                    </View>
                    <View style={styles.bankRow}>
                        <Text style={styles.bankLabel}>Branch</Text>
                        <Text style={styles.bankValue}>{bankDetails.branch}</Text>
                    </View>
                </View>

                <View style={styles.infoBox}>
                    <Info color="#94A3B8" size={16} />
                    <Text style={styles.infoText}>Please transfer the total amount and upload a screenshot or photo of the receipt below.</Text>
                </View>

                <View style={styles.sectionHeader}>
                    <Upload color="#10B981" size={20} />
                    <Text style={styles.sectionTitle}>Upload Transfer Slip</Text>
                </View>

                <TouchableOpacity style={styles.uploadArea} onPress={pickImage}>
                    {image ? (
                        <Image source={{ uri: image.uri }} style={styles.previewImage} resizeMode="contain" />
                    ) : (
                        <View style={styles.uploadPlaceholder}>
                            <Upload color="#475569" size={32} />
                            <Text style={styles.uploadText}>Tap to select image</Text>
                        </View>
                    )}
                </TouchableOpacity>
                
                {image && (
                    <TouchableOpacity onPress={() => setImage(null)} style={styles.removeBtn}>
                        <Text style={styles.removeText}>Remove & Select Another</Text>
                    </TouchableOpacity>
                )}

                <TouchableOpacity 
                    style={[styles.submitButton, (!image || loading) && styles.disabledButton]}
                    onPress={handleConfirmBooking}
                    disabled={!image || loading}
                >
                    {loading ? (
                        <ActivityIndicator color="#fff" />
                    ) : (
                        <>
                            <CheckCircle color="#fff" size={20} />
                            <Text style={styles.submitButtonText}>Submit for Verification</Text>
                        </>
                    )}
                </TouchableOpacity>
            </ScrollView>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#0F172A' },
    header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 20, backgroundColor: '#1E293B' },
    headerTitle: { fontSize: 18, fontWeight: 'bold', color: '#fff' },
    backButton: { padding: 10, backgroundColor: 'rgba(255,255,255,0.05)', borderRadius: 12 },
    content: { padding: 20 },
    summaryCard: { backgroundColor: '#1E293B', borderRadius: 24, padding: 20, marginBottom: 25, borderWidth: 1, borderColor: '#334155' },
    summaryTitle: { color: '#fff', fontSize: 18, fontWeight: 'bold', marginBottom: 8 },
    summaryText: { color: '#94A3B8', fontSize: 14, marginBottom: 4 },
    divider: { height: 1, backgroundColor: '#334155', marginVertical: 15 },
    totalRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
    totalLabel: { color: '#CBD5E1', fontSize: 15 },
    totalValue: { color: '#10B981', fontSize: 24, fontWeight: 'bold' },
    sectionHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 15 },
    sectionTitle: { color: '#fff', fontSize: 16, fontWeight: 'bold', marginLeft: 10 },
    bankCard: { backgroundColor: '#0F172A', borderRadius: 20, padding: 20, marginBottom: 20, borderWidth: 1, borderColor: '#1E293B' },
    bankRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 12 },
    bankLabel: { color: '#64748B', fontSize: 14 },
    bankValue: { color: '#E2E8F0', fontSize: 14, fontWeight: 'bold' },
    infoBox: { flexDirection: 'row', backgroundColor: 'rgba(56, 189, 248, 0.05)', padding: 15, borderRadius: 16, marginBottom: 25 },
    infoText: { color: '#94A3B8', fontSize: 12, marginLeft: 10, flex: 1, lineHeight: 18 },
    uploadArea: { width: '100%', height: 200, backgroundColor: '#1E293B', borderRadius: 24, borderWidth: 2, borderColor: '#334155', borderStyle: 'dashed', justifyContent: 'center', alignItems: 'center', overflow: 'hidden' },
    uploadPlaceholder: { alignItems: 'center' },
    uploadText: { color: '#475569', marginTop: 10, fontSize: 14 },
    previewImage: { width: '100%', height: '100%' },
    removeBtn: { alignSelf: 'center', marginTop: 10, padding: 5 },
    removeText: { color: '#EF4444', fontSize: 13 },
    submitButton: { flexDirection: 'row', backgroundColor: '#6366F1', padding: 18, borderRadius: 20, alignItems: 'center', justifyContent: 'center', marginTop: 30, marginBottom: 50 },
    disabledButton: { backgroundColor: '#334155', opacity: 0.7 },
    submitButtonText: { color: '#fff', fontSize: 16, fontWeight: 'bold', marginLeft: 10 }
});

export default PaymentScreen;
