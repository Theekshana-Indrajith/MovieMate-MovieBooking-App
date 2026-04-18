import React, { useState, useContext, useEffect } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, ScrollView, SafeAreaView, Alert, ActivityIndicator, Platform } from 'react-native';
import { AuthContext } from '../context/AuthContext';
import api from '../utils/api';
import { ArrowLeft, CheckCircle } from 'lucide-react-native';

<<<<<<< HEAD
=======
// Main Screen for User Seat Selection and Booking Flow
>>>>>>> origin/anusara-IT24102789
const SeatSelectionScreen = ({ route, navigation }) => {
    const { movie, showtime } = route.params;
    const { token } = useContext(AuthContext);
    
    const [seats, setSeats] = useState([]);
    const [selectedSeats, setSelectedSeats] = useState([]);
    const [loading, setLoading] = useState(false);
    const [fetchingSeats, setFetchingSeats] = useState(true);

    useEffect(() => {
        const fetchSeatData = async () => {
            try {
                // Fetch dynamic layout
                const layoutRes = await api.get('/seats');
                const rowConfigs = layoutRes.data.data;

                let generatedSeats = [];
                rowConfigs.forEach(row => {
                    for(let i=1; i<=row.seatsCount; i++) {
                        generatedSeats.push({
                            id: `${row.rowCode}-${i}`,
                            type: row.type,
                            bonus: row.extraPrice,
                            status: row.status === 'Maintenance' ? 'maintenance' : 'available'
                        });
                    }
                });

                // Fetch booked seats
                const bookedRes = await api.get(`/showtimes/${showtime.showtimeId}/booked-seats`, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                const bookedIds = bookedRes.data.data;
                
                // Update generated seats with true booked status, preserving maintenance state
                setSeats(generatedSeats.map(s => ({
                    ...s,
                    status: s.status === 'maintenance' ? 'maintenance' : (bookedIds.includes(s.id) ? 'booked' : 'available')
                })));
            } catch (err) {
                console.log('Failed to fetch seat data');
            } finally {
                setFetchingSeats(false);
            }
        };

        fetchSeatData();
    }, [showtime.showtimeId, token]);

    const toggleSeat = (seat) => {
        if (seat.status === 'booked' || seat.status === 'maintenance') return;
        
        if (selectedSeats.find(s => s.id === seat.id)) {
            setSelectedSeats(selectedSeats.filter(s => s.id !== seat.id));
        } else {
            if (selectedSeats.length >= 6) {
                Alert.alert('Limit Reached', 'You can only select up to 6 seats.');
                return;
            }
            setSelectedSeats([...selectedSeats, seat]);
        }
    };

    // VIP gets extra dynamic bonus
    const calculateTotal = () => {
        return selectedSeats.reduce((total, seat) => {
            return total + showtime.price + (seat.bonus || 0);
        }, 0);
    };

    const handleConfirmBooking = async () => {
        if (selectedSeats.length === 0) {
            Alert.alert('Error', 'Please select at least one seat');
            return;
        }

        setLoading(true);

        const payload = {
            showtime: showtime.showtimeId,
            time: showtime.time,
            seats: selectedSeats.map(s => s.id),
            totalAmount: calculateTotal()
        };

        try {
            const res = await api.post('/bookings', payload, {
                headers: { Authorization: `Bearer ${token}` }
            });
            if (res.data.success) {
                if (Platform.OS === 'web') {
                    window.alert('Tickets Booked Successfully!');
                    navigation.navigate('Dashboard');
                } else {
                    Alert.alert('Success', 'Tickets Booked Successfully!', [
                        { text: 'Awesome', onPress: () => navigation.navigate('Dashboard') }
                    ]);
                }
            }
        } catch (err) {
            Alert.alert('Error', err.response?.data?.error || 'Booking failed');
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
                <View style={{ alignItems: 'center' }}>
                    <Text style={styles.headerTitle}>{movie.title}</Text>
                    <Text style={styles.headerSubtitle}>{showtime.date} • {showtime.time}</Text>
                </View>
                <View style={{ width: 44 }} />
            </View>

            <ScrollView contentContainerStyle={styles.content}>
                <View style={styles.screenIndicator}>
                    <View style={styles.screenVector} />
                    <Text style={styles.screenText}>SCREEN</Text>
                </View>

                {fetchingSeats ? (
                    <View style={{ paddingVertical: 50, alignItems: 'center' }}>
                        <ActivityIndicator color="#3B82F6" size="large" />
                        <Text style={{ color: '#94A3B8', marginTop: 10 }}>Checking available seats...</Text>
                    </View>
                ) : (
                    <View style={styles.seatGrid}>
                        {seats.map(seat => {
                            const isSelected = selectedSeats.find(s => s.id === seat.id);
                            let bgColor = '#1E293B'; // Available
                            let borderColor = '#334155';

                            if (seat.status === 'booked') {
                                bgColor = '#334155'; // Booked
                            } else if (seat.status === 'maintenance') {
                                bgColor = 'rgba(239, 68, 68, 0.1)'; // Maintenance red tint
                                borderColor = '#EF4444';
                            } else if (isSelected) {
                                bgColor = '#3B82F6'; // Selected
                                borderColor = '#3B82F6';
                            } else if (seat.type === 'VIP') {
                                bgColor = 'rgba(245, 158, 11, 0.1)'; // VIP Gold tint
                                borderColor = '#F59E0B';
                            }

                            return (
                                <TouchableOpacity
                                    key={seat.id}
                                    style={[
                                        styles.seat, 
                                        { backgroundColor: bgColor, borderColor: borderColor },
                                        seat.status === 'maintenance' && { borderStyle: 'dashed' }
                                    ]}
                                    onPress={() => toggleSeat(seat)}
                                    activeOpacity={0.7}
                                >
                                    <View>
                                        {seat.status === 'maintenance' && (
                                            <View style={{ position: 'absolute', width: '140%', height: 2, backgroundColor: '#EF4444', transform: [{ rotate: '-45deg' }], zIndex: 1, left: '-20%', top: '45%' }} />
                                        )}
                                        <Text style={[
                                            styles.seatText, 
                                            seat.status === 'booked' && { color: '#64748B' },
                                            seat.status === 'maintenance' && { color: '#EF4444' },
                                            isSelected && { color: '#fff', fontWeight: 'bold' }
                                        ]}>
                                            {seat.id.split('-')[1]}
                                        </Text>
                                    </View>
                                </TouchableOpacity>
                            );
                        })}
                    </View>
                )}

                <View style={styles.legend}>

                    <View style={styles.legendItem}>
                        <View style={[styles.legendBox, { backgroundColor: '#1E293B', borderColor: '#334155' }]} />
                        <Text style={styles.legendText}>Available</Text>
                    </View>
                    <View style={styles.legendItem}>
                        <View style={[styles.legendBox, { backgroundColor: '#3B82F6', borderColor: '#3B82F6' }]} />
                        <Text style={styles.legendText}>Selected</Text>
                    </View>
                    <View style={styles.legendItem}>
                        <View style={[styles.legendBox, { backgroundColor: 'rgba(245, 158, 11, 0.1)', borderColor: '#F59E0B' }]} />
                        <Text style={styles.legendText}>VIP (+500)</Text>
                    </View>
                    <View style={styles.legendItem}>
                        <View style={[styles.legendBox, { backgroundColor: 'rgba(239, 68, 68, 0.1)', borderColor: '#EF4444', borderStyle: 'dashed' }]} />
                        <Text style={styles.legendText}>Maintenance</Text>
                    </View>
                    <View style={styles.legendItem}>
                        <View style={[styles.legendBox, { backgroundColor: '#334155', borderColor: '#334155' }]} />
                        <Text style={styles.legendText}>Booked</Text>
                    </View>
                </View>
            </ScrollView>

            <View style={styles.bottomBar}>
                <View style={styles.infoContainer}>
                    <Text style={styles.infoLabel}>
                        {selectedSeats.length > 0 ? `Seats: ${selectedSeats.map(s => s.id).join(', ')}` : 'Select your seats'}
                    </Text>
                    <Text style={styles.priceValue}>Rs. {calculateTotal()}</Text>
                </View>
                <TouchableOpacity 
                    style={[styles.bookButton, selectedSeats.length === 0 && styles.bookButtonDisabled]} 
                    onPress={handleConfirmBooking}
                    disabled={selectedSeats.length === 0 || loading}
                >
                    {loading ? (
                        <ActivityIndicator color="#fff" />
                    ) : (
                        <>
                            <CheckCircle color="#fff" size={20} />
                            <Text style={styles.bookButtonText}>Pay Now</Text>
                        </>
                    )}
                </TouchableOpacity>
            </View>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#0F172A' },
    header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 20, backgroundColor: '#1E293B' },
    headerTitle: { fontSize: 18, fontWeight: 'bold', color: '#fff' },
    headerSubtitle: { fontSize: 12, color: '#94A3B8', marginTop: 4 },
    backButton: { padding: 10, backgroundColor: 'rgba(255,255,255,0.05)', borderRadius: 12 },
    content: { padding: 20, paddingBottom: 100 },
    screenIndicator: { alignItems: 'center', marginBottom: 40, marginTop: 20 },
    screenVector: { width: '80%', height: 5, backgroundColor: '#3B82F6', borderRadius: 10, ...Platform.select({ web: { boxShadow: '0px 10px 20px rgba(59, 130, 246, 0.5)' }, default: { shadowColor: '#3B82F6', shadowOffset: { width: 0, height: 10 }, shadowOpacity: 0.5, shadowRadius: 20, elevation: 10 }}) },
    screenText: { color: '#64748B', marginTop: 10, fontSize: 12, letterSpacing: 5 },
    seatGrid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', gap: 10 },
    seat: { width: 45, height: 45, borderWidth: 1, borderRadius: 10, justifyContent: 'center', alignItems: 'center', margin: 5 },
    seatText: { color: '#94A3B8', fontSize: 12 },
    legend: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', marginTop: 40, gap: 15 },
    legendItem: { flexDirection: 'row', alignItems: 'center', marginHorizontal: 10, marginBottom: 10 },
    legendBox: { width: 16, height: 16, borderRadius: 4, borderWidth: 1, marginRight: 8 },
    legendText: { color: '#94A3B8', fontSize: 12 },
    bottomBar: { position: 'absolute', bottom: 0, left: 0, right: 0, backgroundColor: '#1E293B', flexDirection: 'row', padding: 20, paddingTop: 15, borderTopWidth: 1, borderTopColor: '#334155', alignItems: 'center' },
    infoContainer: { flex: 1 },
    infoLabel: { color: '#94A3B8', fontSize: 12, marginBottom: 4 },
    priceValue: { color: '#fff', fontSize: 22, fontWeight: 'bold' },
    bookButton: { flexDirection: 'row', backgroundColor: '#10B981', paddingHorizontal: 24, paddingVertical: 14, borderRadius: 14, alignItems: 'center' },
    bookButtonDisabled: { backgroundColor: '#334155' },
    bookButtonText: { color: '#fff', fontSize: 16, fontWeight: 'bold', marginLeft: 8 }
});

export default SeatSelectionScreen;
