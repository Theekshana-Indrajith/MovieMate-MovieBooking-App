import React, { useState, useContext, useEffect } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, ScrollView, SafeAreaView, ActivityIndicator, Platform } from 'react-native';
import { AuthContext } from '../context/AuthContext';
import api from '../utils/api';
import { ArrowLeft } from 'lucide-react-native';

const AdminSeatViewScreen = ({ route, navigation }) => {
    const { booking, showtimeId: passedShowtimeId, movieTitle } = route.params;
    const showtimeId = booking ? booking.showtime._id : passedShowtimeId;
    const bookingSeats = booking ? (booking.seats || []) : [];
    const title = booking ? (booking.showtime?.movie?.title || 'Unknown') : (movieTitle || 'Showtime Seats');

    const { token } = useContext(AuthContext);
    const [seats, setSeats] = useState([]);
    const [loading, setLoading] = useState(true);

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
                            status: row.status === 'Maintenance' ? 'maintenance' : 'available'
                        });
                    }
                });

                // Fetch booked seats for this showtime
                const bookedRes = await api.get(`/showtimes/${showtimeId}/booked-seats`, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                const allBookedIds = bookedRes.data.data;
                
                setSeats(generatedSeats.map(s => {
                    if (s.status === 'maintenance') return s;
                    if (bookingSeats.includes(s.id)) {
                        return { ...s, status: 'this_booking' }; // Highlight these
                    }
                    if (allBookedIds.includes(s.id)) {
                        return { ...s, status: 'booked' }; // General booked seats
                    }
                    return s;
                }));
            } catch (err) {
                console.log('Failed to fetch seat data');
            } finally {
                setLoading(false);
            }
        };

        fetchSeatData();
    }, [showtimeId, token]);

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                    <ArrowLeft color="#fff" size={24} />
                </TouchableOpacity>
                <View style={{ alignItems: 'center' }}>
                    <Text style={styles.headerTitle}>Booking Seats</Text>
                    <Text style={styles.headerSubtitle}>{title}</Text>
                </View>
                <View style={{ width: 44 }} />
            </View>

            <ScrollView contentContainerStyle={styles.content}>
                <View style={styles.screenIndicator}>
                    <View style={styles.screenVector} />
                    <Text style={styles.screenText}>SCREEN</Text>
                </View>

                {loading ? (
                    <View style={{ paddingVertical: 50, alignItems: 'center' }}>
                        <ActivityIndicator color="#3B82F6" size="large" />
                        <Text style={{ color: '#94A3B8', marginTop: 10 }}>Checking seats layout...</Text>
                    </View>
                ) : (
                    <View style={styles.seatGrid}>
                        {seats.map(seat => {
                            let bgColor = '#1E293B'; // Available
                            let borderColor = '#334155';
                            let textColor = '#94A3B8';

                            if (seat.status === 'booked') {
                                bgColor = '#334155'; // General booked
                                textColor = '#64748B';
                            } else if (seat.status === 'maintenance') {
                                bgColor = 'rgba(239, 68, 68, 0.1)'; 
                                borderColor = '#EF4444';
                                textColor = '#EF4444';
                            } else if (seat.status === 'this_booking') {
                                bgColor = '#10B981'; // Green for this booking
                                borderColor = '#10B981';
                                textColor = '#fff';
                            } else if (seat.type === 'VIP') {
                                bgColor = 'rgba(245, 158, 11, 0.1)'; 
                                borderColor = '#F59E0B';
                            }

                            return (
                                <View
                                    key={seat.id}
                                    style={[
                                        styles.seat, 
                                        { backgroundColor: bgColor, borderColor: borderColor },
                                        seat.status === 'maintenance' && { borderStyle: 'dashed' }
                                    ]}
                                >
                                    <View>
                                        {seat.status === 'maintenance' && (
                                            <View style={{ position: 'absolute', width: '140%', height: 2, backgroundColor: '#EF4444', transform: [{ rotate: '-45deg' }], zIndex: 1, left: '-20%', top: '45%' }} />
                                        )}
                                        <Text style={[styles.seatText, { color: textColor }, seat.status === 'this_booking' && { fontWeight: 'bold' }]}>
                                            {seat.id.split('-')[1]}
                                        </Text>
                                    </View>
                                </View>
                            );
                        })}
                    </View>
                )}

                <View style={styles.legend}>
                    {booking && (
                        <View style={styles.legendItem}>
                            <View style={[styles.legendBox, { backgroundColor: '#10B981', borderColor: '#10B981' }]} />
                            <Text style={styles.legendText}>This Booking</Text>
                        </View>
                    )}
                    <View style={styles.legendItem}>
                        <View style={[styles.legendBox, { backgroundColor: '#334155', borderColor: '#334155' }]} />
                        <Text style={styles.legendText}>Booked Seats</Text>
                    </View>
                    <View style={styles.legendItem}>
                        <View style={[styles.legendBox, { backgroundColor: '#1E293B', borderColor: '#334155' }]} />
                        <Text style={styles.legendText}>Available</Text>
                    </View>
                </View>

                {/* Booking Summary Card */}
                {booking && (
                    <View style={styles.summaryCard}>
                        <Text style={styles.summaryTitle}>Booking Info</Text>
                        <View style={styles.rowInfo}><Text style={styles.label}>User:</Text><Text style={styles.value}>{booking.user?.name}</Text></View>
                        <View style={styles.rowInfo}><Text style={styles.label}>ID:</Text><Text style={styles.value}>{booking._id.substring(booking._id.length - 8).toUpperCase()}</Text></View>
                        <View style={styles.rowInfo}><Text style={styles.label}>Seats:</Text><Text style={[styles.value, {color: '#10B981'}]}>{bookingSeats.join(', ')}</Text></View>
                    </View>
                )}
            </ScrollView>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#0F172A' },
    header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 20, backgroundColor: '#1E293B' },
    headerTitle: { fontSize: 18, fontWeight: 'bold', color: '#fff' },
    headerSubtitle: { fontSize: 12, color: '#94A3B8', marginTop: 4 },
    backButton: { padding: 10, backgroundColor: 'rgba(255,255,255,0.05)', borderRadius: 12 },
    content: { padding: 20 },
    screenIndicator: { alignItems: 'center', marginBottom: 40, marginTop: 20 },
    screenVector: { width: '80%', height: 5, backgroundColor: '#3B82F6', borderRadius: 10, ...Platform.select({ web: { boxShadow: '0px 10px 20px rgba(59, 130, 246, 0.5)' }, default: { shadowColor: '#3B82F6', shadowOffset: { width: 0, height: 10 }, shadowOpacity: 0.5, shadowRadius: 20, elevation: 10 }}) },
    screenText: { color: '#64748B', marginTop: 10, fontSize: 12, letterSpacing: 5 },
    seatGrid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', gap: 10 },
    seat: { width: 45, height: 45, borderWidth: 1, borderRadius: 10, justifyContent: 'center', alignItems: 'center', margin: 5 },
    seatText: { fontSize: 12 },
    legend: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', marginTop: 40, marginBottom: 30, gap: 15 },
    legendItem: { flexDirection: 'row', alignItems: 'center', marginHorizontal: 10, marginBottom: 10 },
    legendBox: { width: 16, height: 16, borderRadius: 4, borderWidth: 1, marginRight: 8 },
    legendText: { color: '#94A3B8', fontSize: 12 },
    summaryCard: { backgroundColor: '#1E293B', padding: 20, borderRadius: 16, borderWidth: 1, borderColor: '#334155' },
    summaryTitle: { color: '#fff', fontSize: 16, fontWeight: 'bold', borderBottomWidth: 1, borderBottomColor: '#334155', paddingBottom: 10, marginBottom: 10 },
    rowInfo: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 },
    label: { color: '#64748B', fontSize: 13 },
    value: { color: '#fff', fontSize: 13, fontWeight: 'bold' }
});

export default AdminSeatViewScreen;
