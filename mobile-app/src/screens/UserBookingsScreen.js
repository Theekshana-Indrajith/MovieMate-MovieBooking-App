import React, { useState, useEffect, useContext } from 'react';
import { StyleSheet, Text, View, FlatList, TouchableOpacity, Alert, SafeAreaView, ActivityIndicator, Image, Platform } from 'react-native';
import { AuthContext } from '../context/AuthContext';
import api from '../utils/api';
import { ArrowLeft, Clock, MapPin, Ticket, Calendar as CalIcon, Film, XCircle, Download } from 'lucide-react-native';
import SkeletonLoader from '../components/SkeletonLoader';
import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';
import BASE_URL from '../utils/constants';
import BottomNav from '../components/BottomNav';

const UserBookingsScreen = ({ navigation }) => {
    const { token } = useContext(AuthContext);
    const [bookings, setBookings] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchBookings();
        
        const unsubscribe = navigation.addListener('focus', () => {
            fetchBookings();
        });
        return unsubscribe;
    }, [navigation]);

    const fetchBookings = async () => {
        try {
            const res = await api.get('/bookings');
            // Show newest booking first
            setBookings(res.data.data.reverse());
        } catch (err) {
            Alert.alert('Error', 'Failed to load bookings');
        } finally {
            setLoading(false);
        }
    };

    const generatePDF = async (item) => {
        const { showtime, seats, totalAmount, _id } = item;
        const movie = showtime?.movie || {};
        
        const movieTitle = movie.title || 'Unknown Movie';
        const duration = movie.duration ? `${movie.duration} Mins` : '';
        const dateObj = new Date(item.createdAt);
        const dateString = dateObj.toDateString();
        const timeString = item.time || '';
        const bookingId = _id.substring(_id.length - 8).toUpperCase();
        
        const htmlContent = `
        <html>
          <head>
            <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, minimum-scale=1.0, user-scalable=no" />
            <style>
              body { font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; background-color: #f8fafc; padding: 40px; display: flex; justify-content: center; }
              .ticket { width: 100%; max-width: 600px; background: #fff; border-radius: 16px; box-shadow: 0 10px 25px rgba(0,0,0,0.1); overflow: hidden; display: flex; flex-direction: column; border: 2px solid #e2e8f0; }
              .header { background-color: #0f172a; color: #fff; padding: 20px; text-align: center; font-size: 24px; font-weight: bold; letter-spacing: 2px; }
              .content { padding: 30px; }
              .movie-title { font-size: 28px; font-weight: bold; color: #1e293b; margin-bottom: 5px; text-transform: uppercase; }
              .genre-duration { font-size: 14px; color: #64748b; margin-bottom: 25px; }
              .details-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-bottom: 25px; }
              .detail-box { background-color: #f1f5f9; padding: 15px; border-radius: 8px; border-left: 4px solid #3b82f6; }
              .detail-label { font-size: 12px; color: #64748b; text-transform: uppercase; font-weight: bold; margin-bottom: 5px; }
              .detail-value { font-size: 16px; color: #0f172a; font-weight: bold; }
              .dashed-line { border-top: 2px dashed #cbd5e1; margin: 0px 30px; }
              .footer { padding: 20px 30px; background-color: #f8fafc; display: flex; justify-content: space-between; align-items: center; }
              .booking-id { font-size: 14px; color: #64748b; }
              .total-amount { font-size: 20px; color: #10b981; font-weight: bold; }
            </style>
          </head>
          <body>
            <div class="ticket">
              <div class="header">MOVIEMATE E-TICKET</div>
              <div class="content">
                <div class="movie-title">${movieTitle}</div>
                <div class="genre-duration">${movie.genre || ''} ${duration ? '• ' + duration : ''}</div>
                <div class="details-grid">
                  <div class="detail-box"><div class="detail-label">Date</div><div class="detail-value">${dateString}</div></div>
                  <div class="detail-box"><div class="detail-label">Time</div><div class="detail-value">${timeString || '--:--'}</div></div>
                  <div class="detail-box"><div class="detail-label">Seats</div><div class="detail-value">${seats.join(', ')}</div></div>
                  <div class="detail-box"><div class="detail-label">Ticket Type</div><div class="detail-value">Standard</div></div>
                </div>
              </div>
              <div class="dashed-line"></div>
              <div class="footer">
                <div><div class="detail-label">Booking ID</div><div class="detail-value">${bookingId}</div></div>
                <div><div class="detail-label">Total Paid</div><div class="total-amount">Rs. ${totalAmount}</div></div>
              </div>
            </div>
          </body>
        </html>
        `;

        try {
            if (Platform.OS === 'web') {
                 // Direct download as an HTML E-Ticket on the web
                 const blob = new Blob([htmlContent], { type: 'text/html' });
                 const url = window.URL.createObjectURL(blob);
                 const link = document.createElement('a');
                 link.href = url;
                 link.setAttribute('download', `MovieMate_Ticket_${bookingId}.html`);
                 document.body.appendChild(link);
                 link.click();
                 link.parentNode.removeChild(link);
                 window.URL.revokeObjectURL(url);
            } else {
                 const { uri } = await Print.printToFileAsync({ html: htmlContent });
                 await Sharing.shareAsync(uri, { UTI: '.pdf', mimeType: 'application/pdf' });
            }
        } catch (error) {
            Alert.alert('Error', 'Failed to generate ticket. Try again later.');
        }
    };

    const handleCancelBooking = async (id) => {
        const executeCancel = async () => {
            try {
                const res = await api.put(`/bookings/${id}/cancel`, {}, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                if (res.data.success) {
                    Alert.alert('Success', 'Booking cancelled successfully.');
                    fetchBookings();
                }
            } catch (err) {
                Alert.alert('Cancellation Failed', err.response?.data?.error || 'Cannot cancel booking');
            }
        };

        if (Platform.OS === 'web') {
            if (window.confirm('Are you sure you want to cancel this booking? Refunds may take 3-5 days.')) {
                executeCancel();
            }
        } else {
            Alert.alert('Cancel Booking', 'Are you sure you want to cancel this booking? Refunds may take 3-5 days.', [
                { text: 'No', style: 'cancel' },
                { text: 'Yes, Cancel', style: 'destructive', onPress: executeCancel }
            ]);
        }
    };

    const renderTicket = ({ item }) => {
        const dateObj = new Date(item.createdAt);
        const poster = item.showtime?.movie?.poster;
        const isConfirmed = item.status === 'Confirmed';

        // Cancellation Logic
        const checkIsCancellable = () => {
            if (!item.showtime || !item.time) return false;
            
            const showDate = new Date(item.showtime.date);
            let hours = 0;
            let minutes = 0;
            
            const timeParts = item.time.match(/(\d+):(\d+)\s*(AM|PM)/i);
            if (timeParts) {
                hours = parseInt(timeParts[1], 10);
                minutes = parseInt(timeParts[2], 10);
                const ampm = timeParts[3].toUpperCase();
                if (ampm === 'PM' && hours < 12) hours += 12;
                if (ampm === 'AM' && hours === 12) hours = 0;
            }
            
            showDate.setHours(hours, minutes, 0, 0);
            const now = new Date();
            const fourHoursBefore = new Date(showDate.getTime() - (4 * 60 * 60 * 1000));
            
            return now < fourHoursBefore;
        };

        const canCancel = checkIsCancellable();

        return (
            <View style={styles.ticketCard}>
                <View style={styles.ticketTop}>
                    {poster ? (
                        <Image source={{ uri: `${BASE_URL}/uploads/movies/${poster}` }} style={styles.poster} resizeMode="cover" />
                    ) : (
                        <View style={[styles.poster, { justifyContent: 'center', alignItems: 'center' }]}>
                            <Film color="#94A3B8" size={24} />
                        </View>
                    )}
                    <View style={styles.movieDetails}>
                        <Text style={styles.movieTitle} numberOfLines={2}>{item.showtime?.movie?.title || 'Unknown Movie'}</Text>
                        <View style={[
                            styles.statusBadge, 
                            item.status === 'Pending' && { backgroundColor: 'rgba(245, 158, 11, 0.15)' },
                            item.status === 'Cancelled' && { backgroundColor: 'rgba(239, 68, 68, 0.15)' }
                        ]}>
                            <Text style={[
                                styles.statusText, 
                                item.status === 'Pending' && { color: '#F59E0B' },
                                item.status === 'Cancelled' && { color: '#EF4444' }
                            ]}>{item.status}</Text>
                        </View>
                        
                        <View style={styles.infoRow}>
                            <CalIcon color="#94A3B8" size={12} />
                            <Text style={styles.infoText}>{new Date(item.showtime?.date).toDateString()}</Text>
                            {item.time && (
                                <>
                                    <Text style={{ color: '#64748B', marginHorizontal: 6 }}>•</Text>
                                    <Clock color="#94A3B8" size={12} />
                                    <Text style={styles.infoText}>{item.time}</Text>
                                </>
                            )}
                        </View>
                        <View style={styles.infoRow}>
                            <MapPin color="#3B82F6" size={12} />
                            <Text style={styles.infoText}>Seats: <Text style={styles.boldText}>{item.seats.join(', ')}</Text></Text>
                        </View>
                    </View>
                </View>

                <View style={styles.separatorContainer}>
                    <View style={styles.circleLeft} />
                    <View style={styles.dashedLine} />
                    <View style={styles.circleRight} />
                </View>

                <View style={styles.ticketBottom}>
                    <View style={{ flex: 1 }}>
                        <Text style={styles.label}>Booking ID</Text>
                        <Text style={styles.value}>{item._id.substring(item._id.length - 8).toUpperCase()}</Text>
                        
                        <View style={{ flexDirection: 'row', marginTop: 10, alignItems: 'center' }}>
                            {item.status === 'Confirmed' ? (
                                <>
                                    <TouchableOpacity 
                                        style={styles.downloadBtn} 
                                        onPress={() => generatePDF(item)}
                                    >
                                        <Download color="#3B82F6" size={14} />
                                        <Text style={styles.downloadBtnText}>E-Ticket</Text>
                                    </TouchableOpacity>
                                    
                                    {canCancel ? (
                                        <TouchableOpacity 
                                            style={styles.cancelBtn} 
                                            onPress={() => handleCancelBooking(item._id)}
                                        >
                                            <XCircle color="#EF4444" size={14} />
                                            <Text style={styles.cancelBtnText}>Cancel</Text>
                                        </TouchableOpacity>
                                    ) : (
                                        <View style={styles.noteBox}>
                                            <Text style={styles.noteText}>Show started/near</Text>
                                        </View>
                                    )}
                                </>
                            ) : item.status === 'Pending' ? (
                                <View style={styles.statusInfoBox}>
                                    <Clock color="#F59E0B" size={14} />
                                    <Text style={styles.pendingNote}>Waiting for Admin Verification</Text>
                                </View>
                            ) : (
                                <Text style={[styles.value, { color: '#EF4444', fontSize: 12 }]}>This booking was cancelled</Text>
                            )}
                        </View>
                    </View>
                    <View style={{ alignItems: 'flex-end', justifyContent: 'flex-end' }}>
                        <Text style={styles.label}>Total Paid</Text>
                        <Text style={styles.price}>Rs. {item.totalAmount}</Text>
                    </View>
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
                <Text style={styles.headerTitle}>My Tickets</Text>
                <TouchableOpacity style={styles.backButton} disabled>
                    <Ticket color="#fff" size={20} opacity={0.5} />
                </TouchableOpacity>
            </View>

            {loading ? (
                <View style={{ padding: 20 }}>
                     {[1,2].map(i => (
                         <View key={i} style={styles.ticketCard}>
                             <View style={styles.ticketTop}>
                                 <SkeletonLoader width={80} height={110} borderRadius={12} />
                                 <View style={styles.movieDetails}>
                                     <SkeletonLoader width="80%" height={20} borderRadius={6} style={{ marginBottom: 15 }} />
                                     <SkeletonLoader width="40%" height={16} borderRadius={4} style={{ marginBottom: 8 }} />
                                     <SkeletonLoader width="60%" height={14} borderRadius={4} style={{ marginBottom: 6 }} />
                                     <SkeletonLoader width="50%" height={14} borderRadius={4} />
                                 </View>
                             </View>
                             <View style={styles.separatorContainer}>
                                 <View style={styles.circleLeft} />
                                 <View style={styles.dashedLine} />
                                 <View style={styles.circleRight} />
                             </View>
                             <View style={styles.ticketBottom}>
                                 <View>
                                     <SkeletonLoader width={60} height={12} borderRadius={4} style={{ marginBottom: 6 }} />
                                     <SkeletonLoader width={100} height={20} borderRadius={6} />
                                 </View>
                                 <View style={{ alignItems: 'flex-end' }}>
                                     <SkeletonLoader width={60} height={12} borderRadius={4} style={{ marginBottom: 6 }} />
                                     <SkeletonLoader width={80} height={24} borderRadius={6} />
                                 </View>
                             </View>
                         </View>
                     ))}
                </View>
            ) : bookings.length === 0 ? (
                <View style={styles.center}>
                    <Ticket color="#334155" size={60} style={{ marginBottom: 20 }} />
                    <Text style={styles.emptyTitle}>No Tickets Yet</Text>
                    <Text style={styles.emptyText}>Book your favorite movies now!</Text>
                </View>
            ) : (
                <FlatList
                    data={bookings}
                    keyExtractor={(item) => item._id}
                    renderItem={renderTicket}
                    contentContainerStyle={[styles.listContent, { paddingBottom: 120 }]}
                    showsVerticalScrollIndicator={false}
                />
            )}
            <BottomNav />
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#0F172A' },
    header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 20, paddingTop: 40, backgroundColor: '#1E293B', borderBottomLeftRadius: 24, borderBottomRightRadius: 24, marginBottom: 20 },
    headerTitle: { fontSize: 20, fontWeight: 'bold', color: '#fff' },
    backButton: { padding: 12, backgroundColor: 'rgba(255,255,255,0.05)', borderRadius: 14 },
    listContent: { padding: 20, paddingTop: 0 },
    ticketCard: { backgroundColor: '#1E293B', borderRadius: 24, marginBottom: 20, overflow: 'hidden' },
    ticketTop: { flexDirection: 'row', padding: 20 },
    poster: { width: 80, height: 110, borderRadius: 12, backgroundColor: '#334155' },
    movieDetails: { flex: 1, marginLeft: 16, justifyContent: 'center' },
    movieTitle: { fontSize: 18, fontWeight: 'bold', color: '#fff', marginBottom: 8 },
    statusBadge: { alignSelf: 'flex-start', backgroundColor: 'rgba(16, 185, 129, 0.15)', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8, marginBottom: 10 },
    statusText: { color: '#10B981', fontSize: 10, fontWeight: 'bold', textTransform: 'uppercase' },
    infoRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 4 },
    infoText: { color: '#CBD5E1', fontSize: 13, marginLeft: 6 },
    boldText: { color: '#fff', fontWeight: 'bold' },
    separatorContainer: { flexDirection: 'row', alignItems: 'center', height: 20, backgroundColor: '#1E293B' },
    circleLeft: { width: 20, height: 20, borderRadius: 10, backgroundColor: '#0F172A', marginLeft: -10 },
    circleRight: { width: 20, height: 20, borderRadius: 10, backgroundColor: '#0F172A', marginRight: -10 },
    dashedLine: { flex: 1, height: 1, borderWidth: 1, borderColor: '#334155', borderStyle: 'dashed', marginHorizontal: 10 },
    ticketBottom: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 20, backgroundColor: 'rgba(255,255,255,0.02)' },
    label: { color: '#64748B', fontSize: 11, fontWeight: 'bold', textTransform: 'uppercase', marginBottom: 4 },
    value: { color: '#fff', fontSize: 14, fontWeight: 'bold' },
    price: { color: '#10B981', fontSize: 18, fontWeight: 'bold' },
    cancelBtn: { flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(239, 68, 68, 0.1)', paddingHorizontal: 10, paddingVertical: 6, borderRadius: 8 },
    cancelBtnText: { color: '#EF4444', fontSize: 12, fontWeight: 'bold', marginLeft: 4 },
    downloadBtn: { flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(59, 130, 246, 0.15)', paddingHorizontal: 10, paddingVertical: 6, borderRadius: 8, marginRight: 10 },
    downloadBtnText: { color: '#3B82F6', fontSize: 12, fontWeight: 'bold', marginLeft: 4 },
    center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    emptyTitle: { color: '#fff', fontSize: 20, fontWeight: 'bold', marginBottom: 8 },
    emptyText: { color: '#94A3B8', fontSize: 14 },
    noteBox: { backgroundColor: 'rgba(255,255,255,0.05)', paddingHorizontal: 10, paddingVertical: 6, borderRadius: 8 },
    noteText: { color: '#64748B', fontSize: 11, fontWeight: 'bold' },
    statusInfoBox: { flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(245, 158, 11, 0.05)', paddingHorizontal: 10, paddingVertical: 6, borderRadius: 8 },
    pendingNote: { color: '#F59E0B', fontSize: 11, fontWeight: 'bold', marginLeft: 6 }
});

export default UserBookingsScreen;
