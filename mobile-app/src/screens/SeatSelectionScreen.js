import React, { useState, useContext, useEffect } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, ScrollView, SafeAreaView, Alert, ActivityIndicator, Platform, Image } from 'react-native';
import { AuthContext } from '../context/AuthContext';
import api from '../utils/api';
import { ArrowLeft, CheckCircle, Info } from 'lucide-react-native';
import BASE_URL from '../utils/constants';

const SeatSelectionScreen = ({ route, navigation }) => {
    const { movie, showtime } = route.params;
    const { token } = useContext(AuthContext);
    
    const [seats, setSeats] = useState([]);
    const [selectedSeats, setSelectedSeats] = useState([]);
    const [categories, setCategories] = useState([]);
    const [activePreview, setActivePreview] = useState(null); // 'Normal' or 'VIP'
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

        const fetchCategories = async () => {
            try {
                const res = await api.get('/seats/categories');
                setCategories(res.data.data);
            } catch (err) {
                console.log('Failed to fetch categories');
            }
        };

        fetchSeatData();
        fetchCategories();
    }, [showtime.showtimeId, token]);

    const toggleSeat = (seat) => {
        if (seat.status === 'booked' || seat.status === 'maintenance') return;
        
        setActivePreview(seat.type); // Show preview for the tapped seat type

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

    const handleConfirmBooking = () => {
        if (selectedSeats.length === 0) {
            Alert.alert('Error', 'Please select at least one seat');
            return;
        }

        navigation.navigate('Payment', {
            movie,
            showtime: {
                showtimeId: showtime.showtimeId,
                date: showtime.date,
                time: showtime.time,
                price: showtime.price
            },
            selectedSeats: selectedSeats.map(s => ({ id: s.id, bonus: s.bonus })),
            totalAmount: calculateTotal()
        });
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

                {showtime.image && showtime.image !== 'default-theater.jpg' && (
                    <View style={styles.theaterImageContainer}>
                        <Image 
                            source={{ uri: `${BASE_URL}/uploads/showtimes/${showtime.image}` }} 
                            style={styles.theaterImage} 
                        />
                        <View style={styles.imgNote}>
                            <Info color="#6366F1" size={12} />
                            <Text style={styles.imgNoteText}>Theater Hall Preview / Interior Layout</Text>
                        </View>
                    </View>
                )}

                {fetchingSeats ? (
                    <View style={{ paddingVertical: 50, alignItems: 'center' }}>
                        <ActivityIndicator color="#3B82F6" size="large" />
                        <Text style={{ color: '#94A3B8', marginTop: 10 }}>Checking available seats...</Text>
                    </View>
                ) : (
                    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ alignSelf: 'center' }}>
                        <View style={styles.seatContainer}>
                            {/* Grouping seats by row and rendering with a middle aisle */}
                            {Array.from(new Set(seats.map(s => s.id.split('-')[0]))).sort().map(rowCode => {
                                const rowSeats = seats.filter(s => s.id.startsWith(`${rowCode}-`));
                                const midPoint = Math.ceil(rowSeats.length / 2);
                                const leftSection = rowSeats.slice(0, midPoint);
                                const rightSection = rowSeats.slice(midPoint);

                                return (
                                    <View key={rowCode} style={styles.rowLayout}>
                                        <View style={styles.rowLabelLeft}>
                                            <Text style={styles.rowLabelText}>{rowCode}</Text>
                                        </View>

                                        <View style={styles.seatsGroup}>
                                            {/* Left Section */}
                                            <View style={styles.seatBlock}>
                                                {leftSection.map(seat => {
                                                    const isSelected = selectedSeats.find(s => s.id === seat.id);
                                                    return (
                                                        <TouchableOpacity
                                                            key={seat.id}
                                                            style={[
                                                                styles.seat,
                                                                getSeatStyles(seat, isSelected).container,
                                                                seat.status === 'maintenance' && { borderStyle: 'dashed' }
                                                            ]}
                                                            onPress={() => toggleSeat(seat)}
                                                            activeOpacity={0.7}
                                                        >
                                                            {seat.status === 'maintenance' && <View style={styles.maintenanceCross} />}
                                                            <Text style={[styles.seatText, getSeatStyles(seat, isSelected).text]}>
                                                                {seat.id.split('-')[1]}
                                                            </Text>
                                                        </TouchableOpacity>
                                                    );
                                                })}
                                            </View>

                                            {/* Middle Aisle */}
                                            <View style={styles.aisle} />

                                            {/* Right Section */}
                                            <View style={styles.seatBlock}>
                                                {rightSection.map(seat => {
                                                    const isSelected = selectedSeats.find(s => s.id === seat.id);
                                                    return (
                                                        <TouchableOpacity
                                                            key={seat.id}
                                                            style={[
                                                                styles.seat,
                                                                getSeatStyles(seat, isSelected).container,
                                                                seat.status === 'maintenance' && { borderStyle: 'dashed' }
                                                            ]}
                                                            onPress={() => toggleSeat(seat)}
                                                            activeOpacity={0.7}
                                                        >
                                                            {seat.status === 'maintenance' && <View style={styles.maintenanceCross} />}
                                                            <Text style={[styles.seatText, getSeatStyles(seat, isSelected).text]}>
                                                                {seat.id.split('-')[1]}
                                                            </Text>
                                                        </TouchableOpacity>
                                                    );
                                                })}
                                            </View>
                                        </View>

                                        <View style={styles.rowLabelRight}>
                                            <Text style={styles.rowLabelText}>{rowCode}</Text>
                                        </View>
                                    </View>
                                );
                            })}
                        </View>
                    </ScrollView>
                )}

                {activePreview && (
                    <View style={styles.previewContainer}>
                        <View style={styles.previewHeaderRow}>
                            <Text style={styles.previewTitle}>{activePreview} Seat Preview</Text>
                            <TouchableOpacity onPress={() => setActivePreview(null)}>
                                <Text style={{ color: '#EF4444', fontWeight: 'bold' }}>Close</Text>
                            </TouchableOpacity>
                        </View>
                        <Image 
                            source={{ 
                                uri: categories.find(c => c.type === activePreview)?.image?.startsWith('default') 
                                    ? `https://placehold.jp/24/3b82f6/ffffff/300x200.png?text=${activePreview}+Seat+Preview`
                                    : `${BASE_URL}/uploads/seats/${categories.find(c => c.type === activePreview)?.image}` 
                            }} 
                            style={styles.previewImgLarge} 
                            resizeMode="cover"
                        />
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

// Helper function to determine seat styling
const getSeatStyles = (seat, isSelected) => {
    let bgColor = '#1E293B'; // Available
    let borderColor = '#334155';
    let textColor = '#94A3B8';

    if (seat.status === 'booked') {
        bgColor = '#334155'; 
        textColor = '#64748B';
    } else if (seat.status === 'maintenance') {
        bgColor = 'rgba(239, 68, 68, 0.05)';
        borderColor = '#EF4444';
        textColor = '#EF4444';
    } else if (isSelected) {
        bgColor = '#3B82F6'; 
        borderColor = '#3B82F6';
        textColor = '#fff';
    } else if (seat.type === 'VIP') {
        bgColor = 'rgba(245, 158, 11, 0.1)'; 
        borderColor = '#F59E0B';
        textColor = '#F59E0B';
    }

    return {
        container: { backgroundColor: bgColor, borderColor: borderColor },
        text: { color: textColor, fontWeight: isSelected ? 'bold' : 'normal' }
    };
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#0F172A' },
    header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 20, backgroundColor: '#1E293B' },
    headerTitle: { fontSize: 18, fontWeight: 'bold', color: '#fff' },
    headerSubtitle: { fontSize: 12, color: '#94A3B8', marginTop: 4 },
    backButton: { padding: 10, backgroundColor: 'rgba(255,255,255,0.05)', borderRadius: 12 },
    content: { padding: 20, paddingBottom: 100 },
    screenIndicator: { alignItems: 'center', marginBottom: 60, marginTop: 20 },
    screenVector: { 
        width: '90%', 
        height: 15, 
        backgroundColor: '#1E293B', 
        borderBottomWidth: 4,
        borderBottomColor: '#3B82F6',
        borderBottomLeftRadius: 100,
        borderBottomRightRadius: 100,
        // Standard RN shadows
        shadowColor: '#3B82F6',
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.8,
        shadowRadius: 15,
        elevation: 15
    },
    screenText: { color: '#3B82F6', marginTop: 15, fontSize: 12, letterSpacing: 8, fontWeight: 'bold' },
    seatGrid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center' },
    seatContainer: { paddingVertical: 20 },
    rowLayout: { flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
    rowLabelLeft: { width: 30, alignItems: 'center', marginRight: 10 },
    rowLabelRight: { width: 30, alignItems: 'center', marginLeft: 10 },
    rowLabelText: { color: '#475569', fontSize: 14, fontWeight: 'bold' },
    seatsGroup: { flexDirection: 'row', alignItems: 'center' },
    seatBlock: { flexDirection: 'row' },
    aisle: { width: 30 },
    seat: { width: 40, height: 40, borderWidth: 1, borderRadius: 10, justifyContent: 'center', alignItems: 'center', margin: 4 },
    seatText: { fontSize: 12 },
    maintenanceCross: { position: 'absolute', width: '140%', height: 2, backgroundColor: '#EF4444', transform: [{ rotate: '-45deg' }], zIndex: 1, left: '-20%', top: '45%' },
    legend: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', marginTop: 40, borderTopWidth: 1, borderTopColor: '#1E293B', paddingTop: 30 },
    legendItem: { flexDirection: 'row', alignItems: 'center', marginHorizontal: 15, marginBottom: 15 },
    legendBox: { width: 16, height: 16, borderRadius: 4, borderWidth: 1, marginRight: 8 },
    legendText: { color: '#94A3B8', fontSize: 12 },
    bottomBar: { position: 'absolute', bottom: 0, left: 0, right: 0, backgroundColor: '#1E293B', flexDirection: 'row', padding: 20, paddingTop: 15, borderTopWidth: 1, borderTopColor: '#334155', alignItems: 'center' },
    infoContainer: { flex: 1 },
    infoLabel: { color: '#94A3B8', fontSize: 12, marginBottom: 4 },
    priceValue: { color: '#fff', fontSize: 22, fontWeight: 'bold' },
    bookButton: { flexDirection: 'row', backgroundColor: '#10B981', paddingHorizontal: 24, paddingVertical: 14, borderRadius: 14, alignItems: 'center' },
    bookButtonDisabled: { backgroundColor: '#334155' },
    bookButtonText: { color: '#fff', fontSize: 16, fontWeight: 'bold', marginLeft: 8 },
    theaterImageContainer: { marginBottom: 30, borderRadius: 20, overflow: 'hidden', borderWidth: 1, borderColor: '#1F2937', backgroundColor: '#1E293B' },
    theaterImage: { width: '100%', height: 180, resizeMode: 'cover' },
    imgNote: { flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(99, 102, 241, 0.1)', paddingVertical: 8, paddingHorizontal: 12 },
    imgNoteText: { color: '#94A3B8', fontSize: 10, marginLeft: 6, fontWeight: 'bold' },
    previewContainer: { backgroundColor: '#161B2E', borderRadius: 24, padding: 15, marginBottom: 20, borderWidth: 1, borderColor: '#1F2937' },
    previewHeaderRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
    previewTitle: { color: '#fff', fontSize: 14, fontWeight: 'bold' },
    previewImgLarge: { width: '100%', height: 150, borderRadius: 16, backgroundColor: '#0A0F1D' }
});

export default SeatSelectionScreen;
