import React, { useState, useEffect, useContext } from 'react';
import { StyleSheet, Text, View, ScrollView, TouchableOpacity, Alert, SafeAreaView, ActivityIndicator, Image, TextInput, StatusBar } from 'react-native';
import { AuthContext } from '../context/AuthContext';
import api from '../utils/api';
import { ArrowLeft, BookOpen, Clock, User, Search, Ticket } from 'lucide-react-native';
import SkeletonLoader from '../components/SkeletonLoader';
import BottomNav from '../components/BottomNav';
import BASE_URL from '../utils/constants';

const AdminBookingsScreen = ({ navigation }) => {
    const { token } = useContext(AuthContext);
    const [bookings, setBookings] = useState([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedFilter, setSelectedFilter] = useState('All');
    const [loading, setLoading] = useState(true);
    const [expandedDate, setExpandedDate] = useState(null);
    const [expandedMovie, setExpandedMovie] = useState(null);
    const [expandedTime, setExpandedTime] = useState(null);

    useEffect(() => {
        fetchBookings();
        const unsubscribe = navigation.addListener('focus', fetchBookings);
        return unsubscribe;
    }, [navigation]);

    const fetchBookings = async () => {
        try {
            const res = await api.get('/bookings', { headers: { Authorization: `Bearer ${token}` } });
            setBookings(res.data.data.reverse());
        } catch (err) {
            console.log(err);
        } finally {
            setLoading(false);
        }
    };

    const filters = ['All', 'Today', 'This Week', 'Pending', 'Confirmed'];

    const totalRevenue = bookings.filter(b => b.status === 'Confirmed').reduce((acc, curr) => acc + curr.totalAmount, 0);
    const totalBookingsCount = bookings.filter(b => b.status === 'Confirmed').length;

    const filteredBookings = bookings.filter(b => {
        const query = searchQuery.toLowerCase();
        const matchesSearch = (b.user?.name?.toLowerCase() || '').includes(query) || 
                             (b.showtime?.movie?.title?.toLowerCase() || '').includes(query) || 
                             b._id.toLowerCase().includes(query);
        
        if (!matchesSearch) return false;

        const bookingDate = b.showtime?.date ? new Date(b.showtime.date) : null;
        const now = new Date();
        const todayStr = now.toDateString();

        if (selectedFilter === 'Today') {
            return bookingDate?.toDateString() === todayStr;
        }
        if (selectedFilter === 'This Week') {
            const weekAgo = new Date();
            weekAgo.setDate(now.getDate() - 7);
            return bookingDate >= weekAgo;
        }
        if (selectedFilter === 'Pending') {
            return b.status === 'Pending';
        }
        if (selectedFilter === 'Confirmed') {
            return b.status === 'Confirmed';
        }

        return true;
    });

    const groupedBookings = filteredBookings.reduce((acc, curr) => {
        const title = curr.showtime?.movie?.title || 'Unknown Movie';
        const showDate = curr.showtime?.date ? new Date(curr.showtime.date).toDateString() : 'Unknown Date';
        const showTime = curr.time || '--:--';
        const showtimeId = curr.showtime?._id;

        if (!acc[showDate]) acc[showDate] = {};
        if (!acc[showDate][title]) acc[showDate][title] = {};
        if (!acc[showDate][title][showTime]) acc[showDate][title][showTime] = { showtimeId, bookings: [] };
        
        acc[showDate][title][showTime].bookings.push(curr);
        return acc;
    }, {});

    const dates = Object.keys(groupedBookings);

    const toggleDate = (d) => {
        setExpandedDate(expandedDate === d ? null : d);
        setExpandedMovie(null);
        setExpandedTime(null);
    };

    const toggleMovie = (m) => {
        setExpandedMovie(expandedMovie === m ? null : m);
        setExpandedTime(null);
    };

    const toggleTime = (t) => {
        setExpandedTime(expandedTime === t ? null : t);
    };

    const renderBookingCard = (item) => (
        <TouchableOpacity 
            key={item._id}
            style={styles.card}
            activeOpacity={0.8}
            onPress={() => navigation.navigate('AdminSeatView', { booking: item })}
        >
            <View style={styles.cardContent}>
                {item.showtime?.movie?.poster ? (
                    <Image source={{ uri: `${BASE_URL}/uploads/movies/${item.showtime.movie.poster}` }} style={styles.poster} />
                ) : (
                    <View style={[styles.poster, { backgroundColor: '#0F172A', justifyContent: 'center', alignItems: 'center' }]}>
                        <Ticket color="#475569" size={24} />
                    </View>
                )}
                
                <View style={styles.details}>
                    <View style={styles.headerRow}>
                        <Text style={styles.movieTitle} numberOfLines={1}>{item.showtime?.movie?.title}</Text>
                        <View style={[styles.badge, item.status !== 'Confirmed' && { backgroundColor: 'rgba(239, 68, 68, 0.1)' }]}>
                            <Text style={[styles.badgeText, item.status !== 'Confirmed' && { color: '#EF4444' }]}>{item.status}</Text>
                        </View>
                    </View>
                    
                    <View style={styles.infoRow}>
                        <User color="#64748B" size={14} />
                        <Text style={styles.infoText}>{item.user?.name}</Text>
                    </View>

                    <View style={styles.infoRow}>
                        <BookOpen color="#64748B" size={14} />
                        <Text style={styles.infoText}>Seats: <Text style={{color: '#fff', fontWeight: 'bold'}}>{item.seats.join(', ')}</Text></Text>
                    </View>
                </View>
            </View>
            <View style={styles.cardFooter}>
                <View style={{ flex: 1 }}>
                    <Text style={styles.idText}>ID: {item._id.substring(item._id.length - 8).toUpperCase()}</Text>
                    <Text style={styles.price}>Rs. {item.totalAmount}</Text>
                </View>
                {item.status === 'Pending' && (
                    <View style={[styles.badge, { backgroundColor: 'rgba(245, 158, 11, 0.1)' }]}>
                        <Text style={[styles.badgeText, { color: '#F59E0B' }]}>Waiting Verification</Text>
                    </View>
                )}
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
                <Text style={styles.headerTitle}>Booking Ledger</Text>
                <View style={{ width: 44 }} />
            </View>

            <ScrollView contentContainerStyle={{ paddingBottom: 130 }} showsVerticalScrollIndicator={false}>
                <View style={styles.statsContainer}>
                    <View style={styles.statBox}>
                        <Text style={styles.statLabel}>Revenue</Text>
                        <Text style={styles.statValue}>Rs. {totalRevenue.toLocaleString()}</Text>
                    </View>
                    <View style={styles.statBox}>
                        <Text style={styles.statLabel}>Confirmed</Text>
                        <Text style={styles.statValue}>{totalBookingsCount}</Text>
                    </View>
                </View>

                <View style={styles.searchContainer}>
                    <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterScroll}>
                        {filters.map(f => (
                            <TouchableOpacity 
                                key={f} 
                                style={[styles.filterChip, selectedFilter === f && styles.filterChipActive]}
                                onPress={() => setSelectedFilter(f)}
                            >
                                <Text style={[styles.filterChipText, selectedFilter === f && styles.filterChipTextActive]}>{f}</Text>
                            </TouchableOpacity>
                        ))}
                    </ScrollView>
                    <View style={styles.searchBar}>
                        <Search color="#64748B" size={20} />
                        <TextInput 
                            style={styles.searchInput}
                            placeholder="Find ID, User or Movie..."
                            placeholderTextColor="#64748B"
                            value={searchQuery}
                            onChangeText={setSearchQuery}
                        />
                    </View>
                </View>

                {loading ? (
                    <View style={{ padding: 20 }}>
                        {[1,2,3].map(i => (
                            <View key={i} style={[styles.card, { height: 140, marginBottom: 15 }]}>
                                <SkeletonLoader width="100%" height={140} borderRadius={24} />
                            </View>
                        ))}
                    </View>
                ) : (
                    <View style={styles.listContent}>
                        {dates.map(date => {
                            // Extract unique movie posters for this date
                            const datePosters = [];
                            Object.keys(groupedBookings[date]).forEach(title => {
                                const firstTime = Object.keys(groupedBookings[date][title])[0];
                                const firstBooking = groupedBookings[date][title][firstTime].bookings[0];
                                if (firstBooking?.showtime?.movie?.poster) {
                                    datePosters.push({ title, poster: firstBooking.showtime.movie.poster });
                                }
                            });

                            return (
                                <View key={date} style={styles.accordionContainer}>
                                    <TouchableOpacity 
                                        style={[styles.accDateHeader, expandedDate === date && styles.accDateHeaderActive]} 
                                        onPress={() => toggleDate(date)}
                                    >
                                        <View style={{ flexDirection: 'row', alignItems: 'center', flex: 1 }}>
                                            <Clock color={expandedDate === date ? "#6366F1" : "#64748B"} size={18} />
                                            <Text style={[styles.accDateText, expandedDate === date && { color: '#6366F1' }]}>{date}</Text>
                                            
                                            <View style={styles.headerPosters}>
                                                {datePosters.slice(0, 3).map((m, idx) => (
                                                    <Image 
                                                        key={m.title}
                                                        source={{ uri: `${BASE_URL}/uploads/movies/${m.poster}` }}
                                                        style={[styles.headerSmallPoster, { marginLeft: idx === 0 ? 12 : -10, zIndex: 10 - idx }]}
                                                    />
                                                ))}
                                                {datePosters.length > 3 && (
                                                    <View style={styles.moreMoviesBadge}>
                                                        <Text style={styles.moreMoviesText}>+{datePosters.length - 3}</Text>
                                                    </View>
                                                )}
                                            </View>
                                        </View>
                                        <Text style={styles.accArrow}>{expandedDate === date ? '▼' : '▶'}</Text>
                                    </TouchableOpacity>

                                {expandedDate === date && (
                                    <View style={styles.accContent}>
                                        {Object.keys(groupedBookings[date]).map(movie => (
                                            <View key={movie} style={styles.accMovieBlock}>
                                                <TouchableOpacity style={styles.accMovieHeader} onPress={() => toggleMovie(movie)}>
                                                    <Text style={styles.accMovieText}>🎬 {movie}</Text>
                                                    <Text style={styles.accArrowSmall}>{expandedMovie === movie ? '▼' : '▶'}</Text>
                                                </TouchableOpacity>

                                                {expandedMovie === movie && (
                                                    <View style={styles.accTimeContainer}>
                                                        {Object.keys(groupedBookings[date][movie]).map(time => (
                                                            <View key={time} style={styles.accTimeBlock}>
                                                                <TouchableOpacity style={styles.accTimeHeader} onPress={() => toggleTime(time)}>
                                                                    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                                                                        <Text style={styles.accArrowSmall}>{expandedTime === time ? '▼' : '▶'}</Text>
                                                                        <Text style={styles.accTimeText}>{time}</Text>
                                                                        <View style={styles.timeBadge}><Text style={styles.timeBadgeText}>{groupedBookings[date][movie][time].bookings.length}</Text></View>
                                                                    </View>
                                                                    <TouchableOpacity 
                                                                        style={styles.viewSeatsBtn}
                                                                        onPress={() => navigation.navigate('AdminSeatView', { showtimeId: groupedBookings[date][movie][time].showtimeId, movieTitle: `${movie} • ${date} ${time}` })}
                                                                    >
                                                                        <Text style={styles.viewSeatsTxt}>Seats</Text>
                                                                    </TouchableOpacity>
                                                                </TouchableOpacity>
                                                                {expandedTime === time && (
                                                                    <View style={styles.accBookingList}>
                                                                        {groupedBookings[date][movie][time].bookings.map(b => renderBookingCard(b))}
                                                                    </View>
                                                                )}
                                                            </View>
                                                        ))}
                                                    </View>
                                                )}
                                            </View>
                                        ))}
                                    </View>
                                )}
                            </View>
                        );
                    })}
                </View>
                )}
            </ScrollView>
            <BottomNav />
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#0A0F1D' },
    header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 20, paddingTop: 20, backgroundColor: '#161B2E', borderBottomLeftRadius: 32, borderBottomRightRadius: 32 },
    headerTitle: { fontSize: 20, fontWeight: 'bold', color: '#fff' },
    backButton: { padding: 10, backgroundColor: 'rgba(255,255,255,0.05)', borderRadius: 14 },
    statsContainer: { flexDirection: 'row', padding: 20, paddingBottom: 0 },
    statBox: { flex: 1, backgroundColor: '#161B2E', padding: 18, borderRadius: 24, marginRight: 15, borderWidth: 1, borderColor: '#1F2937' },
    statLabel: { color: '#64748B', fontSize: 11, marginBottom: 6, textTransform: 'uppercase', fontWeight: 'bold' },
    statValue: { color: '#10B981', fontSize: 18, fontWeight: 'bold' },
    searchContainer: { paddingHorizontal: 20, marginTop: 20 },
    filterScroll: { marginBottom: 15 },
    filterChip: { paddingHorizontal: 16, paddingVertical: 8, borderRadius: 12, backgroundColor: '#161B2E', marginRight: 8, borderWidth: 1, borderColor: '#1F2937' },
    filterChipActive: { backgroundColor: '#6366F1', borderColor: '#6366F1' },
    filterChipText: { color: '#94A3B8', fontSize: 13, fontWeight: '600' },
    filterChipTextActive: { color: '#fff' },
    headerPosters: { flexDirection: 'row', alignItems: 'center', marginLeft: 5 },
    headerSmallPoster: { width: 24, height: 24, borderRadius: 6, borderWidth: 2, borderColor: '#161B2E' },
    moreMoviesBadge: { backgroundColor: '#1F2937', height: 24, width: 24, borderRadius: 6, justifyContent: 'center', alignItems: 'center', marginLeft: -10, zIndex: 0 },
    moreMoviesText: { color: '#fff', fontSize: 8, fontWeight: 'bold' },
    searchBar: { flexDirection: 'row', backgroundColor: '#161B2E', paddingHorizontal: 16, paddingVertical: 14, borderRadius: 20, alignItems: 'center', borderWidth: 1, borderColor: '#1F2937' },
    searchInput: { flex: 1, marginLeft: 12, color: '#fff', fontSize: 15 },
    listContent: { padding: 20 },
    accordionContainer: { marginBottom: 16, backgroundColor: '#161B2E', borderRadius: 24, overflow: 'hidden', borderWidth: 1, borderColor: '#1F2937' },
    accDateHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 20 },
    accDateHeaderActive: { borderBottomWidth: 1, borderBottomColor: '#1F2937', backgroundColor: 'rgba(255,255,255,0.02)' },
    accDateText: { color: '#fff', fontSize: 16, fontWeight: 'bold', marginLeft: 12 },
    accArrow: { color: '#64748B', fontSize: 12 },
    accMovieHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20, paddingVertical: 14, backgroundColor: 'rgba(99, 102, 241, 0.05)' },
    accMovieText: { color: '#E2E8F0', fontSize: 14, fontWeight: 'bold' },
    accTimeHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 12, paddingHorizontal: 20 },
    accTimeText: { color: '#CBD5E1', fontSize: 13, fontWeight: 'bold', marginLeft: 10 },
    timeBadge: { backgroundColor: 'rgba(16, 185, 129, 0.1)', paddingHorizontal: 8, paddingVertical: 2, borderRadius: 8, marginLeft: 10 },
    timeBadgeText: { color: '#10B981', fontSize: 10, fontWeight: 'bold' },
    viewSeatsBtn: { backgroundColor: '#6366F1', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 8 },
    viewSeatsTxt: { color: '#fff', fontSize: 11, fontWeight: 'bold' },
    accBookingList: { padding: 15, backgroundColor: 'rgba(0,0,0,0.1)' },
    card: { backgroundColor: '#0A0F1D', borderRadius: 24, marginBottom: 15, borderWidth: 1, borderColor: '#1F2937', overflow: 'hidden' },
    cardContent: { flexDirection: 'row', padding: 16 },
    poster: { width: 60, height: 80, borderRadius: 12 },
    details: { flex: 1, marginLeft: 16, justifyContent: 'center' },
    headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
    movieTitle: { fontSize: 15, fontWeight: 'bold', color: '#fff', flex: 1 },
    badge: { backgroundColor: 'rgba(16, 185, 129, 0.1)', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8 },
    badgeText: { color: '#10B981', fontWeight: 'bold', fontSize: 10 },
    infoRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 6 },
    infoText: { color: '#94A3B8', fontSize: 12, marginLeft: 8 },
    cardFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: 'rgba(255,255,255,0.02)', padding: 12, paddingHorizontal: 16 },
    idText: { color: '#475569', fontSize: 11, fontWeight: 'bold' },
    price: { fontSize: 15, fontWeight: 'bold', color: '#10B981' },
    verifyBtn: { backgroundColor: '#6366F1', paddingHorizontal: 16, paddingVertical: 8, borderRadius: 12 },
    verifyBtnText: { color: '#fff', fontSize: 13, fontWeight: 'bold' },
    modalOverlay: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0,0,0,0.85)', justifyContent: 'flex-end', zIndex: 1000 },
    modalContent: { backgroundColor: '#161B2E', borderTopLeftRadius: 32, borderTopRightRadius: 32, height: '85%' },
    modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 25, borderBottomWidth: 1, borderBottomColor: '#1F2937' },
    modalTitle: { color: '#fff', fontSize: 18, fontWeight: 'bold' },
    modalUser: { color: '#fff', fontSize: 20, fontWeight: 'bold', textAlign: 'center', marginTop: 10 },
    modalAmount: { color: '#10B981', fontSize: 24, fontWeight: 'bold', textAlign: 'center', marginVertical: 10 },
    slipLabel: { color: '#94A3B8', fontSize: 14, marginBottom: 10, marginTop: 20 },
    slipImage: { width: '100%', height: 400, borderRadius: 16, backgroundColor: '#0A0F1D' },
    actionRow: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 30, marginBottom: 50 },
    actionBtn: { flex: 1, padding: 18, borderRadius: 16, alignItems: 'center' },
    rejectBtn: { backgroundColor: 'rgba(239, 68, 68, 0.1)', marginRight: 15, borderWidth: 1, borderColor: '#EF4444' },
    confirmBtn: { backgroundColor: '#10B981' },
    btnText: { color: '#fff', fontWeight: 'bold' },
    pendingSection: { marginTop: 20 },
    sectionHeaderRow: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 20, marginBottom: 12 },
    pendingSectionTitle: { color: '#F59E0B', fontSize: 14, fontWeight: 'bold', marginLeft: 8, textTransform: 'uppercase' },
    pendingScroll: { paddingLeft: 20, paddingRight: 10 },
    pendingMiniCard: { width: 220, backgroundColor: '#1E293B', padding: 15, borderRadius: 20, marginRight: 12, borderWidth: 1, borderColor: 'rgba(245, 158, 11, 0.3)' },
    miniCardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
    miniCardUser: { color: '#fff', fontWeight: 'bold', fontSize: 13, flex: 1 },
    miniCardPrice: { color: '#10B981', fontWeight: 'bold', fontSize: 12 },
    miniCardFooter: { borderTopWidth: 1, borderTopColor: '#334155', paddingTop: 8 },
    miniCardInfo: { color: '#94A3B8', fontSize: 11, marginBottom: 4 },
    miniCardSeats: { color: '#6366F1', fontSize: 10, fontWeight: 'bold' }
});

export default AdminBookingsScreen;
