import React, { useState, useEffect, useContext } from 'react';
import { StyleSheet, Text, View, Image, TouchableOpacity, ScrollView, SafeAreaView, ActivityIndicator, Alert, TextInput, Modal, Platform, StatusBar } from 'react-native';
import { AuthContext } from '../context/AuthContext';
import api from '../utils/api';
import { ArrowLeft, Clock, Ticket, Star, MessageSquare, Trash2, Users, Info } from 'lucide-react-native';
import SkeletonLoader from '../components/SkeletonLoader';
import BASE_URL from '../utils/constants';

const MovieDetailsScreen = ({ route, navigation }) => {
    const { movie: initialMovie } = route.params;
    const { token, user } = useContext(AuthContext);
    
    const [movie, setMovie] = useState(initialMovie);
    const [showtimes, setShowtimes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedShowtime, setSelectedShowtime] = useState(null);

    // Review Modal States
    const [reviewModalVisible, setReviewModalVisible] = useState(false);
    const [ratingVal, setRatingVal] = useState(5);
    const [commentVal, setCommentVal] = useState('');
    const [submittingReview, setSubmittingReview] = useState(false);

    useEffect(() => {
        const fetchDetails = async () => {
            try {
                const [stRes, movieRes] = await Promise.all([
                    api.get(`/movies/${initialMovie._id}/showtimes`),
                    api.get(`/movies/${initialMovie._id}`)
                ]);
                setShowtimes(stRes.data.data);
                if (movieRes.data.data) setMovie(movieRes.data.data);
            } catch (err) {
                console.log(err);
            } finally {
                setLoading(false);
            }
        };
        fetchDetails();
    }, [initialMovie._id]);

    const handleBookNow = () => {
        if (!selectedShowtime) {
            Alert.alert('Select Showtime', 'Please select a date and time to continue.');
            return;
        }
        navigation.navigate('SeatSelection', { movie, showtime: selectedShowtime });
    };

    const submitReview = async () => {
        if (!commentVal.trim()) return;
        setSubmittingReview(true);
        try {
            const res = await api.post(`/movies/${movie._id}/reviews`, { rating: ratingVal, comment: commentVal }, {
                headers: { Authorization: `Bearer ${token}` }
            });
            if (res.data.success) {
                setReviewModalVisible(false);
                setCommentVal('');
                const movieRes = await api.get(`/movies/${movie._id}`);
                setMovie(movieRes.data.data);
            }
        } catch (err) {
            Alert.alert('Error', 'Failed to post review');
        } finally {
            setSubmittingReview(false);
        }
    };

    const renderStars = (rating) => {
        return [1,2,3,4,5].map(i => (
            <Star key={i} color={i <= Math.round(rating) ? '#F59E0B' : '#334155'} size={14} fill={i <= Math.round(rating) ? '#F59E0B' : 'transparent'} />
        ));
    };

    return (
        <SafeAreaView style={styles.container}>
            <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />
            <ScrollView showsVerticalScrollIndicator={false}>
                
                {/* Header with Backdrop */}
                <View style={styles.headerContainer}>
                    <Image 
                        source={{ uri: `${BASE_URL}/uploads/movies/${movie.backdrop || movie.poster}` }} 
                        style={styles.backdrop}
                    />
                    <View style={styles.headerOverlay}>
                        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                            <ArrowLeft color="#fff" size={24} />
                        </TouchableOpacity>
                    </View>
                </View>

                {/* Content Area */}
                <View style={styles.contentArea}>
                    
                    {/* Poster Floating */}
                    <View style={styles.posterFloatingContainer}>
                         <Image source={{ uri: `${BASE_URL}/uploads/movies/${movie.poster}` }} style={styles.floatingPoster} />
                         <View style={styles.titleSection}>
                             <Text style={styles.titleText}>{movie.title}</Text>
                             <View style={styles.ratingRow}>
                                <Star color="#F59E0B" size={16} fill="#F59E0B" />
                                <Text style={styles.ratingText}>{Number(movie.rating).toFixed(1)} <Text style={styles.reviewCount}>({movie.numReviews} Reviews)</Text></Text>
                             </View>
                         </View>
                    </View>

                    {/* Meta info tags */}
                    <View style={styles.metaTags}>
                        <View style={styles.metaTag}><Text style={styles.metaTagText}>{movie.genre}</Text></View>
                        <View style={styles.metaTag}><Clock color="#64748B" size={14} /><Text style={styles.metaTagText}>{movie.duration}m</Text></View>
                        <View style={styles.metaTag}><Info color="#64748B" size={14} /><Text style={styles.metaTagText}>4K</Text></View>
                    </View>

                    {/* Overview */}
                    <Text style={styles.sectionTitle}>Overview</Text>
                    <Text style={styles.description}>{movie.description}</Text>

                    {/* Cast Section */}
                    {movie.cast && movie.cast.length > 0 && (
                        <>
                            <Text style={styles.sectionTitle}>Cast & Crew</Text>
                            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.castRow}>
                                {movie.cast.map((actor, idx) => (
                                    <View key={idx} style={styles.castItem}>
                                        <View style={styles.castAvatar}>
                                            <Users color="#64748B" size={20} />
                                        </View>
                                        <Text style={styles.castName} numberOfLines={1}>{actor}</Text>
                                    </View>
                                ))}
                            </ScrollView>
                        </>
                    )}

                    {/* Showtimes Selection */}
                    <Text style={[styles.sectionTitle, { marginTop: 25 }]}>Select Date</Text>
                    {loading ? (
                        <ActivityIndicator color="#6366F1" style={{ marginVertical: 20 }} />
                    ) : showtimes.filter(st => {
                        const d = new Date(st.date);
                        const today = new Date();
                        today.setHours(0,0,0,0);
                        return d >= today;
                    }).length === 0 ? (
                        <Text style={styles.noDataText}>No upcoming shows scheduled.</Text>
                    ) : (
                        <View>
                            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 15 }}>
                                {showtimes
                                    .filter(st => {
                                        const d = new Date(st.date);
                                        const today = new Date();
                                        today.setHours(0,0,0,0);
                                        return d >= today;
                                    })
                                    .map(st => {
                                    const dateObj = new Date(st.date);
                                    const isSelected = selectedShowtime?.showtimeId === st._id;
                                    return (
                                        <TouchableOpacity 
                                            key={st._id} 
                                            style={[styles.dateCard, isSelected && styles.dateCardActive]}
                                            onPress={() => setSelectedShowtime({ 
                                                showtimeId: st._id, 
                                                time: null, 
                                                price: st.ticketPrice, 
                                                date: dateObj.toDateString(),
                                                image: st.image 
                                            })}
                                        >
                                            <Text style={[styles.dateMonth, isSelected && styles.whiteText]}>{dateObj.toLocaleDateString('en-US', { month: 'short' })}</Text>
                                            <Text style={[styles.dateDay, isSelected && styles.whiteText]}>{dateObj.getDate()}</Text>
                                            <Text style={[styles.dateWeek, isSelected && styles.whiteText]}>{dateObj.toLocaleDateString('en-US', { weekday: 'short' })}</Text>
                                        </TouchableOpacity>
                                    );
                                })}
                            </ScrollView>

                            {selectedShowtime && (
                                <View style={styles.timeSelectionGrid}>
                                    {showtimes.find(st => st._id === selectedShowtime.showtimeId)?.times.map((time, idx) => (
                                        <TouchableOpacity 
                                            key={idx} 
                                            style={[styles.timeSlot, selectedShowtime.time === time && styles.timeSlotActive]}
                                            onPress={() => setSelectedShowtime({ ...selectedShowtime, time })}
                                        >
                                            <Text style={[styles.timeText, selectedShowtime.time === time && styles.whiteText]}>{time}</Text>
                                        </TouchableOpacity>
                                    ))}
                                </View>
                            )}
                        </View>
                    )}

                    {/* Reviews */}
                    <View style={styles.reviewHeader}>
                        <Text style={styles.sectionTitle}>Reviews</Text>
                        <TouchableOpacity style={styles.addReviewBtn} onPress={() => setReviewModalVisible(true)}>
                            <MessageSquare color="#6366F1" size={14} />
                            <Text style={styles.addReviewTxt}>Add Review</Text>
                        </TouchableOpacity>
                    </View>

                    {movie.reviews && movie.reviews.length > 0 ? (
                        movie.reviews.map(rev => (
                            <View key={rev._id} style={styles.reviewCard}>
                                <View style={styles.revUserRow}>
                                    <View style={styles.revAvatar}><Text style={styles.revAvatarText}>{rev.name[0]}</Text></View>
                                    <View style={{ flex: 1, marginLeft: 12 }}>
                                        <Text style={styles.revName}>{rev.name}</Text>
                                        <View style={{ flexDirection: 'row' }}>{renderStars(rev.rating)}</View>
                                    </View>
                                </View>
                                <Text style={styles.revComment}>{rev.comment}</Text>
                            </View>
                        ))
                    ) : <Text style={styles.noDataText}>No reviews left yet.</Text>}

                </View>
                <View style={{ height: 120 }} />
            </ScrollView>

            {/* Bottom Booking Bar */}
            <View style={styles.bottomBookingBar}>
                <View>
                    <Text style={styles.priceLabel}>Price per Seat</Text>
                    <Text style={styles.priceValue}>{selectedShowtime ? `Rs. ${selectedShowtime.price}` : '---'}</Text>
                </View>
                <TouchableOpacity 
                    style={[styles.bookBtn, !selectedShowtime?.time && { opacity: 0.5 }]} 
                    onPress={handleBookNow}
                    disabled={!selectedShowtime?.time}
                >
                    <Ticket color="#fff" size={20} />
                    <Text style={styles.bookBtnText}>Confirm Seats</Text>
                </TouchableOpacity>
            </View>

            {/* Review Modal */}
            <Modal visible={reviewModalVisible} transparent animationType="slide">
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
                        <Text style={styles.modalTitle}>Rate this Movie</Text>
                        <View style={styles.ratingRowLarge}>
                            {[1,2,3,4,5].map(num => (
                                <TouchableOpacity key={num} onPress={() => setRatingVal(num)}>
                                    <Star color={num <= ratingVal ? '#F59E0B' : '#1F2937'} size={36} fill={num <= ratingVal ? '#F59E0B' : 'transparent'} />
                                </TouchableOpacity>
                            ))}
                        </View>
                        <TextInput 
                            style={styles.modalInput}
                            placeholder="Share your thoughts..."
                            placeholderTextColor="#475569"
                            multiline
                            value={commentVal}
                            onChangeText={setCommentVal}
                        />
                        <View style={styles.modalActions}>
                            <TouchableOpacity style={styles.cancelBtn} onPress={() => setReviewModalVisible(false)}><Text style={{color:'#fff'}}>Close</Text></TouchableOpacity>
                            <TouchableOpacity style={styles.submitBtn} onPress={submitReview}><Text style={{color:'#fff', fontWeight:'bold'}}>Post Review</Text></TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#0A0F1D' },
    headerContainer: { width: '100%', height: 300, position: 'relative' },
    backdrop: { width: '100%', height: '100%', opacity: 0.6 },
    headerOverlay: { position: 'absolute', top: 50, left: 20 },
    backButton: { padding: 12, backgroundColor: 'rgba(0,0,0,0.5)', borderRadius: 16 },
    contentArea: { paddingHorizontal: 24, marginTop: -60 },
    posterFloatingContainer: { flexDirection: 'row', alignItems: 'flex-end', marginBottom: 25 },
    floatingPoster: { width: 110, height: 165, borderRadius: 20, borderWidth: 3, borderColor: '#0A0F1D' },
    titleSection: { flex: 1, marginLeft: 20, paddingBottom: 10 },
    titleText: { fontSize: 24, fontWeight: 'bold', color: '#fff', marginBottom: 8 },
    ratingRow: { flexDirection: 'row', alignItems: 'center' },
    ratingText: { color: '#fff', fontWeight: 'bold', marginLeft: 8, fontSize: 15 },
    reviewCount: { color: '#64748B', fontSize: 12, fontWeight: 'normal' },
    metaTags: { flexDirection: 'row', marginBottom: 25 },
    metaTag: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#161B2E', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 10, marginRight: 10, borderWidth: 1, borderColor: '#1F2937' },
    metaTagText: { color: '#94A3B8', fontSize: 13, fontWeight: 'bold', marginLeft: 6 },
    sectionTitle: { fontSize: 18, fontWeight: 'bold', color: '#fff', marginBottom: 15 },
    description: { color: '#94A3B8', fontSize: 14, lineHeight: 22, textAlign: 'justify', marginBottom: 30 },
    castRow: { flexDirection: 'row' },
    castItem: { alignItems: 'center', width: 80, marginRight: 15 },
    castAvatar: { width: 50, height: 50, borderRadius: 25, backgroundColor: '#161B2E', justifyContent: 'center', alignItems: 'center', marginBottom: 8, borderWidth: 1, borderColor: '#1F2937' },
    castName: { color: '#94A3B8', fontSize: 11, textAlign: 'center', fontWeight: '600' },
    dateCard: { width: 70, height: 90, backgroundColor: '#161B2E', borderRadius: 20, marginRight: 15, justifyContent: 'center', alignItems: 'center', borderWidth: 1, borderColor: '#1F2937' },
    dateCardActive: { backgroundColor: '#6366F1', borderColor: '#6366F1' },
    whiteText: { color: '#fff' },
    dateMonth: { fontSize: 10, color: '#64748B', fontWeight: 'bold', textTransform: 'uppercase' },
    dateDay: { fontSize: 22, color: '#fff', fontWeight: 'bold', marginVertical: 2 },
    dateWeek: { fontSize: 10, color: '#64748B' },
    timeSelectionGrid: { flexDirection: 'row', flexWrap: 'wrap', marginTop: 10 },
    timeSlot: { paddingHorizontal: 20, paddingVertical: 12, borderRadius: 14, backgroundColor: '#161B2E', marginRight: 12, marginBottom: 12, borderWidth: 1, borderColor: '#1F2937' },
    timeSlotActive: { backgroundColor: '#6366F1', borderColor: '#6366F1' },
    timeText: { color: '#94A3B8', fontWeight: 'bold', fontSize: 14 },
    reviewHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 30, marginBottom: 15 },
    addReviewBtn: { flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(99, 102, 241, 0.1)', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 10 },
    addReviewTxt: { color: '#6366F1', fontSize: 12, fontWeight: 'bold', marginLeft: 8 },
    reviewCard: { backgroundColor: '#161B2E', padding: 20, borderRadius: 24, marginBottom: 15, borderWidth: 1, borderColor: '#1F2937' },
    revUserRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
    revAvatar: { width: 40, height: 40, borderRadius: 20, backgroundColor: '#6366F1', justifyContent: 'center', alignItems: 'center' },
    revAvatarText: { color: '#fff', fontWeight: 'bold' },
    revName: { color: '#fff', fontWeight: 'bold', marginBottom: 2 },
    revComment: { color: '#94A3B8', fontSize: 13, lineHeight: 20 },
    noDataText: { color: '#475569', fontSize: 14, fontStyle: 'italic' },
    bottomBookingBar: { position: 'absolute', bottom: 30, left: 24, right: 24, backgroundColor: '#161B2E', padding: 16, borderRadius: 28, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', borderWidth: 1, borderColor: '#1F2937', elevation: 20, shadowColor: '#000', shadowOpacity: 0.5, shadowRadius: 20 },
    priceLabel: { color: '#64748B', fontSize: 12, fontWeight: 'bold' },
    priceValue: { color: '#10B981', fontSize: 20, fontWeight: 'bold' },
    bookBtn: { backgroundColor: '#6366F1', paddingHorizontal: 25, paddingVertical: 14, borderRadius: 20, flexDirection: 'row', alignItems: 'center' },
    bookBtnText: { color: '#fff', fontWeight: 'bold', marginLeft: 10, fontSize: 15 },
    modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.8)', justifyContent: 'flex-end' },
    modalContent: { backgroundColor: '#161B2E', borderTopLeftRadius: 32, borderTopRightRadius: 32, padding: 30, minHeight: 400, borderWidth: 1, borderColor: '#1F2937' },
    modalTitle: { fontSize: 22, fontWeight: 'bold', color: '#fff', marginBottom: 25, textAlign: 'center' },
    ratingRowLarge: { flexDirection: 'row', justifyContent: 'center', gap: 12, marginBottom: 30 },
    modalInput: { backgroundColor: '#0A0F1D', borderRadius: 20, padding: 20, color: '#fff', height: 120, textAlignVertical: 'top', borderWidth: 1, borderColor: '#1F2937', marginBottom: 30 },
    modalActions: { flexDirection: 'row', justifyContent: 'space-between', gap: 15 },
    cancelBtn: { flex: 1, paddingVertical: 16, borderRadius: 16, alignItems: 'center', backgroundColor: '#1F2937' },
    submitBtn: { flex: 1.5, paddingVertical: 16, borderRadius: 16, alignItems: 'center', backgroundColor: '#6366F1' }
});

export default MovieDetailsScreen;
