import React, { useState, useEffect, useContext } from 'react';
import { StyleSheet, Text, View, ScrollView, TouchableOpacity, Alert, SafeAreaView, ActivityIndicator, Image, TextInput } from 'react-native';
import { AuthContext } from '../context/AuthContext';
import api from '../utils/api';
import { ArrowLeft, BookOpen, Clock, User, Search, Ticket } from 'lucide-react-native';
import SkeletonLoader from '../components/SkeletonLoader';

const AdminBookingsScreen = ({ navigation }) => {
    const { token } = useContext(AuthContext);
    const [bookings, setBookings] = useState([]);
    const [searchQuery, setSearchQuery] = useState('');
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
            setBookings(res.data.data.reverse()); // Show newest first
        } catch (err) {
            Alert.alert('Error', 'Failed to load bookings');
        } finally {
            setLoading(false);
        }
    };

    // Calculate Summary Stats
    const totalRevenue = bookings.filter(b => b.status === 'Confirmed').reduce((acc, curr) => acc + curr.totalAmount, 0);
    const totalTickets = bookings.filter(b => b.status === 'Confirmed').length;

    // Filter Logic
    const filteredBookings = bookings.filter(b => {
        const query = searchQuery.toLowerCase();
        const userName = b.user?.name?.toLowerCase() || '';
        const movieTitle = b.showtime?.movie?.title?.toLowerCase() || '';
        const bookingId = b._id.toLowerCase();
        return userName.includes(query) || movieTitle.includes(query) || bookingId.includes(query);
    });

    // Nested Grouping: Date -> Movie Title -> Time
    const groupedBookings = filteredBookings.reduce((acc, curr) => {
        const title = curr.showtime?.movie?.title || 'Unknown Movie';
        
        let showDate = 'Unknown Date';
        if (curr.showtime?.date) {
            showDate = new Date(curr.showtime.date).toDateString(); 
        }

        const showTime = curr.time || '--:--';
        const showtimeId = curr.showtime?._id;

        if (!acc[showDate]) acc[showDate] = {};
        if (!acc[showDate][title]) acc[showDate][title] = {};
        if (!acc[showDate][title][showTime]) acc[showDate][title][showTime] = { showtimeId, bookings: [] };
        
        acc[showDate][title][showTime].bookings.push(curr);
        return acc;
    }, {});

    const dates = Object.keys(groupedBookings);

    const [expandedDate, setExpandedDate] = useState(null);
    const [expandedMovie, setExpandedMovie] = useState(null);
    const [expandedTime, setExpandedTime] = useState(null);

    const toggleDate = (d) => {
        if (expandedDate === d) {
            setExpandedDate(null);
            setExpandedMovie(null);
            setExpandedTime(null);
        } else {
            setExpandedDate(d);
            setExpandedMovie(null);
            setExpandedTime(null);
        }
    };

    const toggleMovie = (m) => {
        if (expandedMovie === m) {
            setExpandedMovie(null);
            setExpandedTime(null);
        } else {
            setExpandedMovie(m);
            setExpandedTime(null);
        }
    };

    const toggleTime = (t) => {
        setExpandedTime(expandedTime === t ? null : t);
    };

    const renderBookingCard = (item) => {
        const dateObj = new Date(item.createdAt);
        const poster = item.showtime?.movie?.poster;
        const isConfirmed = item.status === 'Confirmed';

        return (
            <TouchableOpacity 
                key={item._id}
                style={styles.card}
                activeOpacity={0.8}
                onPress={() => navigation.navigate('AdminSeatView', { booking: item })}
            >
                <View style={styles.cardContent}>
                    {poster ? (
                        <Image source={{ uri: `http://192.168.8.106:5000/uploads/movies/${poster}` }} style={styles.poster} />
                    ) : (
                        <View style={[styles.poster, { backgroundColor: '#334155', justifyContent: 'center', alignItems: 'center' }]}>
                            <Ticket color="#94A3B8" size={24} />
                        </View>
                    )}
                    
                    <View style={styles.details}>
                        <View style={styles.headerRow}>
                            <Text style={styles.movieTitle} numberOfLines={1}>{item.showtime?.movie?.title || 'Unknown'}</Text>
                            <View style={[styles.badge, !isConfirmed && { backgroundColor: 'rgba(239, 68, 68, 0.15)' }]}>
                                <Text style={[styles.badgeText, !isConfirmed && { color: '#EF4444' }]}>{item.status}</Text>
                            </View>
                        </View>
                        
                        <View style={styles.infoRow}>
                            <User color="#94A3B8" size={14} />
                            <Text style={styles.infoText}>{item.user?.name || 'Unknown User'}</Text>
                        </View>

                        <View style={styles.infoRow}>
                            <BookOpen color="#94A3B8" size={14} />
                            <Text style={styles.infoText}>Seats: <Text style={{color: '#fff', fontWeight: 'bold'}}>{item.seats.join(', ')}</Text></Text>
                        </View>

                        <View style={[styles.infoRow, { marginBottom: 0 }]}>
                            <Clock color="#94A3B8" size={14} />
                            <Text style={styles.infoText}>{dateObj.toLocaleString([], { dateStyle: 'short', timeStyle: 'short' })}</Text>
                        </View>
                    </View>
                </View>

                <View style={styles.cardFooter}>
                    <Text style={styles.idText}>ID: {item._id.substring(item._id.length - 8).toUpperCase()}</Text>
                    <Text style={styles.price}>Rs. {item.totalAmount}</Text>
                </View>
            </TouchableOpacity>
        );
    };

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                    <ArrowLeft color="#fff" size={24} />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>All Bookings</Text>
                <View style={{ width: 44 }} />
            </View>

            <View style={styles.statsContainer}>
                <View style={styles.statBox}>
                    <Text style={styles.statLabel}>Total Revenue</Text>
                    <Text style={styles.statValue}>Rs. {totalRevenue.toLocaleString()}</Text>
                </View>
                <View style={styles.statBox}>
                    <Text style={styles.statLabel}>Confirmed</Text>
                    <Text style={styles.statValue}>{totalTickets} Bookings</Text>
                </View>
            </View>

            <View style={styles.searchContainer}>
                <View style={styles.searchBar}>
                    <Search color="#94A3B8" size={20} />
                    <TextInput 
                        style={styles.searchInput}
                        placeholder="Search User, Movie or ID..."
                        placeholderTextColor="#94A3B8"
                        value={searchQuery}
                        onChangeText={setSearchQuery}
                    />
                </View>
            </View>

            {loading ? (
                <View style={{ padding: 20 }}>
                    {[1,2,3].map(i => (
                        <View key={i} style={{ flexDirection: 'row', backgroundColor: '#1E293B', borderRadius: 20, marginBottom: 16, padding: 16, borderWidth: 1, borderColor: '#334155' }}>
                            <SkeletonLoader width={70} height={100} borderRadius={10} />
                            <View style={{ flex: 1, marginLeft: 15, justifyContent: 'center' }}>
                                <SkeletonLoader width="80%" height={20} borderRadius={6} style={{ marginBottom: 12 }} />
                                <SkeletonLoader width="60%" height={14} borderRadius={4} style={{ marginBottom: 8 }} />
                                <SkeletonLoader width="50%" height={14} borderRadius={4} />
                            </View>
                        </View>
                    ))}
                </View>
            ) : dates.length === 0 ? (
                <View style={styles.center}>
                    <Text style={styles.emptyText}>No bookings match your search.</Text>
                </View>
            ) : (
                <ScrollView contentContainerStyle={styles.listContent} showsVerticalScrollIndicator={false}>
                    {dates.map(date => {
                        const moviesObj = groupedBookings[date];
                        const moviesList = Object.keys(moviesObj);
                        
                        return (
                            <View key={date} style={styles.accordionContainer}>
                                <TouchableOpacity 
                                    style={[styles.accDateHeader, expandedDate === date && styles.accDateHeaderActive]} 
                                    onPress={() => toggleDate(date)}
                                >
                                    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                                        <Clock color={expandedDate === date ? "#3B82F6" : "#94A3B8"} size={18} />
                                        <Text style={[styles.accDateText, expandedDate === date && { color: '#3B82F6' }]}>{date}</Text>
                                    </View>
                                    <Text style={styles.accArrow}>{expandedDate === date ? '▼' : '▶'}</Text>
                                </TouchableOpacity>

                                {expandedDate === date && (
                                    <View style={styles.accContent}>
                                        {moviesList.map(movie => {
                                            const timesObj = moviesObj[movie];
                                            const timesList = Object.keys(timesObj);

                                            return (
                                                <View key={movie} style={styles.accMovieBlock}>
                                                    <TouchableOpacity 
                                                        style={styles.accMovieHeader}
                                                        onPress={() => toggleMovie(movie)}
                                                    >
                                                        <Text style={styles.accMovieText}>🍿 {movie}</Text>
                                                        <Text style={styles.accArrowSmall}>{expandedMovie === movie ? '▼' : '▶'}</Text>
                                                    </TouchableOpacity>

                                                    {expandedMovie === movie && (
                                                        <View style={styles.accTimeContainer}>
                                                            {timesList.map(time => {
                                                                const timeData = timesObj[time];
                                                                const bookingsList = timeData.bookings;

                                                                return (
                                                                    <View key={time} style={styles.accTimeBlock}>
                                                                        <TouchableOpacity 
                                                                            style={styles.accTimeHeader}
                                                                            onPress={() => toggleTime(time)}
                                                                        >
                                                                            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                                                                                <Text style={styles.accArrowSmall}>{expandedTime === time ? '▼' : '▶'}</Text>
                                                                                <Text style={styles.accTimeText}>{time}</Text>
                                                                                <View style={styles.timeBadge}>
                                                                                    <Text style={styles.timeBadgeText}>{bookingsList.length} Bookings</Text>
                                                                                </View>
                                                                            </View>
                                                                            <TouchableOpacity 
                                                                                style={styles.viewSeatsBtn}
                                                                                onPress={() => navigation.navigate('AdminSeatView', { showtimeId: timeData.showtimeId, movieTitle: `${movie} • ${date} ${time}` })}
                                                                            >
                                                                                <Text style={styles.viewSeatsTxt}>View Seats</Text>
                                                                            </TouchableOpacity>
                                                                        </TouchableOpacity>

                                                                        {expandedTime === time && (
                                                                            <View style={styles.accBookingList}>
                                                                                {bookingsList.map(b => renderBookingCard(b))}
                                                                            </View>
                                                                        )}
                                                                    </View>
                                                                )
                                                            })}
                                                        </View>
                                                    )}
                                                </View>
                                            )
                                        })}
                                    </View>
                                )}
                            </View>
                        )
                    })}
                </ScrollView>
            )}
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#0F172A' },
    header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 20, paddingBottom: 10, backgroundColor: '#1E293B' },
    headerTitle: { fontSize: 18, fontWeight: 'bold', color: '#fff' },
    backButton: { padding: 10, backgroundColor: 'rgba(255,255,255,0.05)', borderRadius: 12 },
    statsContainer: { flexDirection: 'row', padding: 20, backgroundColor: '#1E293B', borderBottomWidth: 1, borderBottomColor: '#334155' },
    statBox: { flex: 1, backgroundColor: 'rgba(255,255,255,0.03)', padding: 16, borderRadius: 16, marginRight: 10, borderWidth: 1, borderColor: '#334155' },
    statLabel: { color: '#94A3B8', fontSize: 12, marginBottom: 4, textTransform: 'uppercase', fontWeight: 'bold' },
    statValue: { color: '#10B981', fontSize: 20, fontWeight: 'bold' },
    searchContainer: { paddingHorizontal: 20, marginTop: 20 },
    searchBar: { flexDirection: 'row', backgroundColor: '#1E293B', padding: 12, borderRadius: 14, alignItems: 'center', borderWidth: 1, borderColor: '#334155' },
    searchInput: { flex: 1, marginLeft: 10, color: '#fff', fontSize: 14 },
    listContent: { padding: 20, paddingBottom: 100 },
    card: { backgroundColor: '#1E293B', borderRadius: 20, marginBottom: 16, borderWidth: 1, borderColor: '#334155', overflow: 'hidden' },
    cardContent: { flexDirection: 'row', padding: 16 },
    poster: { width: 70, height: 100, borderRadius: 10 },
    details: { flex: 1, marginLeft: 15, justifyContent: 'center' },
    headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 },
    movieTitle: { fontSize: 16, fontWeight: 'bold', color: '#fff', flex: 1, marginRight: 10 },
    badge: { backgroundColor: 'rgba(16, 185, 129, 0.15)', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6 },
    badgeText: { color: '#10B981', fontWeight: 'bold', fontSize: 10, textTransform: 'uppercase' },
    infoRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 6 },
    infoText: { color: '#CBD5E1', fontSize: 13, marginLeft: 6 },
    cardFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: 'rgba(255,255,255,0.02)', padding: 12, paddingHorizontal: 16, borderTopWidth: 1, borderTopColor: '#334155' },
    idText: { color: '#64748B', fontSize: 12, fontWeight: 'bold' },
    price: { fontSize: 16, fontWeight: 'bold', color: '#10B981' },
    center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    emptyText: { color: '#94A3B8', fontSize: 16 },
    accordionContainer: { marginBottom: 15, backgroundColor: '#1E293B', borderRadius: 16, overflow: 'hidden', borderWidth: 1, borderColor: '#334155' },
    accDateHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 16, backgroundColor: '#1E293B' },
    accDateHeaderActive: { borderBottomWidth: 1, borderBottomColor: '#334155', backgroundColor: '#0F172A' },
    accDateText: { color: '#F8FAFC', fontSize: 16, fontWeight: 'bold', marginLeft: 10 },
    accArrow: { color: '#64748B', fontSize: 12 },
    accContent: { paddingBottom: 10 },
    accMovieBlock: { marginTop: 10 },
    accMovieHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20, paddingVertical: 12, backgroundColor: 'rgba(59, 130, 246, 0.05)' },
    accMovieText: { color: '#E2E8F0', fontSize: 15, fontWeight: 'bold' },
    accArrowSmall: { color: '#64748B', fontSize: 10, marginRight: 10 },
    accTimeContainer: { paddingLeft: 10 },
    accTimeBlock: { marginTop: 5 },
    accTimeHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 10, paddingHorizontal: 20 },
    accTimeText: { color: '#CBD5E1', fontSize: 14, fontWeight: 'bold' },
    timeBadge: { backgroundColor: 'rgba(16, 185, 129, 0.15)', paddingHorizontal: 8, paddingVertical: 2, borderRadius: 8, marginLeft: 10 },
    timeBadgeText: { color: '#10B981', fontSize: 10, fontWeight: 'bold' },
    viewSeatsBtn: { backgroundColor: '#3B82F6', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 8 },
    viewSeatsTxt: { color: '#fff', fontSize: 11, fontWeight: 'bold' },
    accBookingList: { padding: 15, backgroundColor: 'rgba(0,0,0,0.2)', borderTopWidth: 1, borderTopColor: '#334155' }
});

export default AdminBookingsScreen;
