import React, { useState, useEffect, useContext } from 'react';
import { StyleSheet, Text, View, Image, TouchableOpacity, ScrollView, SafeAreaView, ActivityIndicator, Alert, TextInput, Modal, Platform } from 'react-native';
import { AuthContext } from '../context/AuthContext';
import api from '../utils/api';
import { ArrowLeft, Clock, Calendar as CalendarIcon, Ticket, Star, MessageSquare, Trash2 } from 'lucide-react-native';
import SkeletonLoader from '../components/SkeletonLoader';
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
        const fetchInitialData = async () => {
            try {
                const [stRes, movieRes] = await Promise.all([
                    api.get(`/movies/${initialMovie._id}/showtimes`),
                    api.get(`/movies/${initialMovie._id}`)
                ]);
                setShowtimes(stRes.data.data);
                if (movieRes.data.data) {
                    setMovie(movieRes.data.data);
                }
            } catch (err) {
                Alert.alert('Error', 'Failed to load details');
            } finally {
                setLoading(false);
            }
        };

        fetchInitialData();
    }, [initialMovie._id]);

    const handleBookNow = () => {
        if (!selectedShowtime) {
            Alert.alert('Select Showtime', 'Please select a date and time to continue.');
            return;
        }
        navigation.navigate('SeatSelection', { 
            movie, 
            showtime: selectedShowtime 
        });
    };

    const submitReview = async () => {
        if (!commentVal.trim()) {
            Alert.alert('Error', 'Please write a comment');
            return;
        }

        setSubmittingReview(true);
        try {
            const res = await api.post(`/movies/${movie._id}/reviews`, {
                rating: ratingVal,
                comment: commentVal
            }, {
                headers: { Authorization: `Bearer ${token}` }
            });

            if (res.data.success) {
                Alert.alert('Success', 'Review added successfully!');
                setReviewModalVisible(false);
                setCommentVal('');
                
                // Refresh movie to get new reviews
                const movieRes = await api.get(`/movies/${movie._id}`);
                setMovie(movieRes.data.data);
            }
        } catch (err) {
            Alert.alert('Error', err.response?.data?.error || 'Could not submit review');
        } finally {
            setSubmittingReview(false);
        }
    };

    const renderStars = (rating) => {
        let stars = [];
        for (let i = 1; i <= 5; i++) {
            stars.push(
                <Star key={i} color={i <= Math.round(rating) ? '#F59E0B' : '#334155'} size={14} fill={i <= Math.round(rating) ? '#F59E0B' : 'transparent'} />
            );
        }
        return stars;
    };

    const renderReviewModal = () => (
        <Modal visible={reviewModalVisible} transparent animationType="slide">
            <View style={styles.modalOverlay}>
                <View style={styles.modalContent}>
                    <Text style={styles.modalTitle}>Write a Review</Text>
                    
                    <Text style={styles.modalLabel}>Rating (1-5)</Text>
                    <View style={styles.ratingSelectRow}>
                        {[1,2,3,4,5].map(num => (
                            <TouchableOpacity key={num} onPress={() => setRatingVal(num)}>
                                <Star color={num <= ratingVal ? '#F59E0B' : '#334155'} size={32} fill={num <= ratingVal ? '#F59E0B' : 'transparent'} />
                            </TouchableOpacity>
                        ))}
                    </View>

                    <Text style={styles.modalLabel}>Comment</Text>
                    <TextInput 
                        style={styles.modalInput}
                        placeholder="What did you think of the movie?"
                        placeholderTextColor="#64748B"
                        multiline
                        numberOfLines={4}
                        value={commentVal}
                        onChangeText={setCommentVal}
                    />

                    <View style={styles.modalActions}>
                        <TouchableOpacity style={[styles.modalBtn, { backgroundColor: '#334155' }]} onPress={() => setReviewModalVisible(false)}>
                            <Text style={styles.modalBtnText}>Cancel</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.modalBtn} onPress={submitReview} disabled={submittingReview}>
                            {submittingReview ? <ActivityIndicator color="#fff" /> : <Text style={styles.modalBtnText}>Submit</Text>}
                        </TouchableOpacity>
                    </View>
                </View>
            </View>
        </Modal>
    );

    const hasUserReviewed = movie.reviews?.find(r => r.user === user?.id);

    const deleteReview = async (reviewId) => {
        const executeDelete = async () => {
            try {
                const res = await api.delete(`/movies/${movie._id}/reviews/${reviewId}`, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                if (res.data.success) {
                    if (Platform.OS === 'web') window.alert('Review has been removed.');
                    else Alert.alert('Deleted', 'Review has been removed.');
                    
                    const movieRes = await api.get(`/movies/${movie._id}`);
                    setMovie(movieRes.data.data);
                }
            } catch (err) {
                if (Platform.OS === 'web') window.alert('Failed to delete review');
                else Alert.alert('Error', 'Failed to delete review');
            }
        };

        if (Platform.OS === 'web') {
            if (window.confirm('Are you sure you want to delete this review?')) {
                executeDelete();
            }
        } else {
            Alert.alert('Delete Review', 'Are you sure you want to delete this review?', [
                { text: 'Cancel', style: 'cancel' },
                { 
                    text: 'Delete', 
                    style: 'destructive',
                    onPress: executeDelete
                }
            ]);
        }
    };

    return (
        <SafeAreaView style={styles.container}>
            <ScrollView>
                <View style={styles.imageContainer}>
                    <Image 
                        source={{ uri: `http://192.168.8.106:5000/uploads/movies/${movie.poster}` }} 
                        style={styles.poster}
                        resizeMode="cover"
                    />
                    <View style={styles.overlay}>
                        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                            <ArrowLeft color="#fff" size={24} />
                        </TouchableOpacity>
                    </View>
                </View>

                <View style={styles.detailsContainer}>
                    <Text style={styles.title}>{movie.title}</Text>
                    <View style={styles.tagsRow}>
                        <View style={styles.tag}><Text style={styles.tagText}>{movie.genre}</Text></View>
                        <View style={styles.tag}><Clock color="#94A3B8" size={14} style={{marginRight:4}} /><Text style={styles.tagText}>{movie.duration} Min</Text></View>
                        <View style={styles.tag}><Text style={styles.tagText}>⭐ {Number(movie.rating).toFixed(1)}/5</Text></View>
                    </View>
                    
                    <Text style={styles.sectionTitle}>Overview</Text>
                    <Text style={styles.description}>{movie.description}</Text>

                    <Text style={styles.sectionTitle}>Select Date</Text>
                    {loading ? (
                        <View style={{ flexDirection: 'row', marginTop: 10 }}>
                            <SkeletonLoader width={70} height={80} borderRadius={16} style={{ marginRight: 12 }} />
                            <SkeletonLoader width={70} height={80} borderRadius={16} style={{ marginRight: 12 }} />
                            <SkeletonLoader width={70} height={80} borderRadius={16} />
                        </View>
                    ) : showtimes.length === 0 ? (
                        <Text style={styles.noShowtimeText}>No showtimes scheduled for this movie yet.</Text>
                    ) : (
                        <View>
                            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 20 }}>
                                {showtimes.filter(st => {
                                    const showDate = new Date(st.date);
                                    const today = new Date();
                                    today.setHours(0, 0, 0, 0); // Start of today
                                    return showDate >= today;
                                }).map(st => {
                                    const dateObj = new Date(st.date);
                                    const dayName = dateObj.toLocaleDateString('en-US', { weekday: 'short' }); // Mon
                                    const dayNum = dateObj.getDate(); // 24
                                    const monthName = dateObj.toLocaleDateString('en-US', { month: 'short' }); // Aug
                                    
                                    const displayDayName = dayName !== 'Invalid Date' ? dayName : 'Day';
                                    const displayDayNum = !isNaN(dayNum) ? dayNum : '--';
                                    const displayMonth = monthName !== 'Invalid Date' ? monthName : 'Mth';
                                    
                                    const isSelectedDate = selectedShowtime && selectedShowtime.showtimeId === st._id;

                                    return (
                                        <TouchableOpacity 
                                            key={st._id} 
                                            style={[styles.dateCard, isSelectedDate && styles.dateCardSelected]}
                                            onPress={() => setSelectedShowtime({ showtimeId: st._id, time: null, price: st.ticketPrice, date: dateObj.toDateString() })}
                                        >
                                            <Text style={[styles.dateMonth, isSelectedDate && styles.dateTextSelected]}>{displayMonth}</Text>
                                            <Text style={[styles.dateDayNum, isSelectedDate && styles.dateTextSelected]}>{displayDayNum}</Text>
                                            <Text style={[styles.dateDayName, isSelectedDate && styles.dateTextSelected]}>{displayDayName}</Text>
                                        </TouchableOpacity>
                                    );
                                })}
                            </ScrollView>

                            {selectedShowtime && selectedShowtime.showtimeId && (
                                <>
                                    <Text style={styles.sectionTitle}>Select Time</Text>
                                    <View style={styles.showtimeCard}>
                                        <View style={styles.stHeader}>
                                            <Clock color="#3B82F6" size={18} />
                                            <Text style={styles.stDate}>Available Slots</Text>
                                            <Text style={styles.stPrice}>Rs. {selectedShowtime.price}</Text>
                                        </View>
                                        <View style={styles.timesRow}>
                                            {showtimes.find(st => st._id === selectedShowtime.showtimeId)?.times.filter(time => {
                                                if (!time) return false;
                                                const showDate = new Date(selectedShowtime.date);
                                                const today = new Date();
                                                
                                                if (showDate.setHours(0,0,0,0) > today.setHours(0,0,0,0)) return true;
                                                
                                                const parts = time.trim().split(/\s+/);
                                                const timeVal = parts[0];
                                                const modifier = parts[1]; // could be undefined
                                                
                                                let [hours, minutes] = timeVal.split(':');
                                                if (hours === '12') hours = '00';
                                                hours = parseInt(hours, 10);
                                                if (modifier && modifier.toLowerCase() === 'pm') hours += 12;
                                                
                                                const actualShowTime = new Date(selectedShowtime.date);
                                                actualShowTime.setHours(hours, parseInt(minutes || 0, 10), 0, 0);
                                                
                                                return actualShowTime > new Date(); // only future times
                                            }).map((time, idx) => {
                                                const isSelectedTime = selectedShowtime.time === time;
                                                return (
                                                    <TouchableOpacity 
                                                        key={idx} 
                                                        style={[styles.timeSlot, isSelectedTime && styles.timeSlotSelected]}
                                                        onPress={() => setSelectedShowtime({ ...selectedShowtime, time })}
                                                    >
                                                        <Text style={[styles.timeText, isSelectedTime && styles.timeTextSelected]}>{time}</Text>
                                                    </TouchableOpacity>
                                                );
                                            })}
                                            
                                            {/* Show message if all slots passed */}
                                            {showtimes.find(st => st._id === selectedShowtime.showtimeId)?.times.filter(time => {
                                                if (!time) return false;
                                                const showDate = new Date(selectedShowtime.date);
                                                const today = new Date();
                                                if (showDate.setHours(0,0,0,0) > today.setHours(0,0,0,0)) return true;
                                                const parts = time.trim().split(/\s+/);
                                                const timeVal = parts[0];
                                                const modifier = parts[1];
                                                let [hours, minutes] = timeVal.split(':');
                                                if (hours === '12') hours = '00';
                                                hours = parseInt(hours, 10);
                                                if (modifier && modifier.toLowerCase() === 'pm') hours += 12;
                                                const actualShowTime = new Date(selectedShowtime.date);
                                                actualShowTime.setHours(hours, parseInt(minutes || 0, 10), 0, 0);
                                                return actualShowTime > new Date();
                                            }).length === 0 && (
                                                <Text style={{ color: '#EF4444', fontSize: 13 }}>No available upcoming slots for this date.</Text>
                                            )}
                                        </View>
                                    </View>
                                </>
                            )}
                        </View>
                    )}

                    {/* Review Section */}
                    <View style={styles.reviewHeader}>
                        <Text style={styles.sectionTitle}>Reviews & Ratings</Text>
                        {!hasUserReviewed && user?.role !== 'admin' && (
                            <TouchableOpacity style={styles.addReviewBtn} onPress={() => setReviewModalVisible(true)}>
                                <MessageSquare color="#3B82F6" size={14} style={{ marginRight: 6 }} />
                                <Text style={styles.addReviewText}>Write Review</Text>
                            </TouchableOpacity>
                        )}
                    </View>

                    {movie.reviews && movie.reviews.length > 0 ? (
                        movie.reviews.map(rev => (
                            <View key={rev._id} style={styles.reviewCard}>
                                <View style={styles.reviewCardHeader}>
                                    <View style={styles.reviewAvatar}>
                                        <Text style={styles.reviewAvatarText}>{rev.name.charAt(0).toUpperCase()}</Text>
                                    </View>
                                    <View style={{ flex: 1, marginLeft: 12 }}>
                                        <Text style={styles.reviewerName}>{rev.name}</Text>
                                        <View style={{ flexDirection: 'row', marginTop: 2 }}>
                                            {renderStars(rev.rating)}
                                        </View>
                                    </View>
                                    {user?.role === 'admin' && (
                                        <TouchableOpacity 
                                            onPress={() => deleteReview(rev._id)}
                                            style={{ padding: 4 }}
                                        >
                                            <Trash2 color="#EF4444" size={16} />
                                        </TouchableOpacity>
                                    )}
                                </View>
                                <Text style={styles.reviewComment}>{rev.comment}</Text>
                            </View>
                        ))
                    ) : (
                        <Text style={styles.noShowtimeText}>No reviews yet. Be the first to review!</Text>
                    )}

                </View>
            </ScrollView>

            {renderReviewModal()}

            <View style={styles.bottomBar}>
                <View style={styles.priceContainer}>
                    <Text style={styles.priceLabel}>Ticket Price</Text>
                    <Text style={styles.priceValue}>
                        {selectedShowtime ? `Rs. ${selectedShowtime.price}` : '---'}
                    </Text>
                </View>
                <TouchableOpacity 
                    style={[styles.bookButton, !selectedShowtime && styles.bookButtonDisabled]} 
                    onPress={handleBookNow}
                    disabled={!selectedShowtime}
                >
                    <Ticket color="#fff" size={20} />
                    <Text style={styles.bookButtonText}>Book Now</Text>
                </TouchableOpacity>
            </View>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#0F172A' },
    imageContainer: { width: '100%', height: 400, position: 'relative' },
    poster: { width: '100%', height: '100%' },
    overlay: { position: 'absolute', top: 50, left: 20 },
    backButton: { padding: 10, backgroundColor: 'rgba(0,0,0,0.5)', borderRadius: 12 },
    detailsContainer: { padding: 24, paddingBottom: 100 },
    title: { fontSize: 28, fontWeight: 'bold', color: '#fff', marginBottom: 12 },
    tagsRow: { flexDirection: 'row', marginBottom: 24 },
    tag: { flexDirection: 'row', backgroundColor: '#1E293B', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 12, marginRight: 10, alignItems: 'center' },
    tagText: { color: '#94A3B8', fontSize: 13, fontWeight: '600' },
    sectionTitle: { fontSize: 18, fontWeight: 'bold', color: '#fff', marginBottom: 12, marginTop: 10 },
    description: { color: '#94A3B8', fontSize: 14, lineHeight: 22, Object: 'justify', marginBottom: 20 },
    noShowtimeText: { color: '#64748B', fontStyle: 'italic', marginTop: 10 },
    dateCard: { backgroundColor: '#1E293B', paddingVertical: 14, paddingHorizontal: 20, borderRadius: 16, marginRight: 12, alignItems: 'center', justifyContent: 'center', minWidth: 70, borderWidth: 1, borderColor: '#334155' },
    dateCardSelected: { backgroundColor: '#3B82F6', borderColor: '#3B82F6' },
    dateMonth: { color: '#94A3B8', fontSize: 12, fontWeight: 'bold', textTransform: 'uppercase' },
    dateDayNum: { color: '#fff', fontSize: 22, fontWeight: 'bold', marginVertical: 4 },
    dateDayName: { color: '#94A3B8', fontSize: 12 },
    dateTextSelected: { color: '#fff' },
    showtimeCard: { backgroundColor: '#1E293B', borderRadius: 16, padding: 16, marginBottom: 16 },
    stHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 16 },
    stDate: { color: '#fff', fontSize: 16, fontWeight: 'bold', marginLeft: 10, flex: 1 },
    stPrice: { color: '#10B981', fontSize: 16, fontWeight: 'bold' },
    timesRow: { flexDirection: 'row', flexWrap: 'wrap' },
    timeSlot: { borderWidth: 1, borderColor: '#334155', paddingHorizontal: 16, paddingVertical: 10, borderRadius: 12, marginRight: 10, marginBottom: 10 },
    timeSlotSelected: { backgroundColor: '#3B82F6', borderColor: '#3B82F6' },
    timeText: { color: '#94A3B8', fontWeight: 'bold' },
    timeTextSelected: { color: '#fff' },
    bottomBar: { position: 'absolute', bottom: 0, left: 0, right: 0, backgroundColor: '#1E293B', flexDirection: 'row', padding: 20, paddingTop: 15, borderTopWidth: 1, borderTopColor: '#334155', alignItems: 'center' },
    priceContainer: { flex: 1 },
    priceLabel: { color: '#94A3B8', fontSize: 12, marginBottom: 4 },
    priceValue: { color: '#fff', fontSize: 20, fontWeight: 'bold' },
    bookButton: { flexDirection: 'row', backgroundColor: '#3B82F6', paddingHorizontal: 24, paddingVertical: 14, borderRadius: 14, alignItems: 'center' },
    bookButtonDisabled: { backgroundColor: '#334155' },
    bookButtonText: { color: '#fff', fontSize: 16, fontWeight: 'bold', marginLeft: 8 },
    reviewHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 30, marginBottom: 15 },
    addReviewBtn: { flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(59, 130, 246, 0.15)', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 8 },
    addReviewText: { color: '#3B82F6', fontSize: 12, fontWeight: 'bold' },
    reviewCard: { backgroundColor: '#1E293B', padding: 16, borderRadius: 16, marginBottom: 12 },
    reviewCardHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 10 },
    reviewAvatar: { width: 36, height: 36, borderRadius: 18, backgroundColor: '#3B82F6', justifyContent: 'center', alignItems: 'center' },
    reviewAvatarText: { color: '#fff', fontWeight: 'bold', fontSize: 16 },
    reviewerName: { color: '#fff', fontSize: 14, fontWeight: 'bold' },
    reviewComment: { color: '#CBD5E1', fontSize: 13, lineHeight: 20 },
    modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.7)', justifyContent: 'flex-end' },
    modalContent: { backgroundColor: '#1E293B', borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 24, minHeight: 350 },
    modalTitle: { fontSize: 20, fontWeight: 'bold', color: '#fff', marginBottom: 20, textAlign: 'center' },
    modalLabel: { color: '#94A3B8', fontSize: 13, marginBottom: 10, fontWeight: 'bold' },
    ratingSelectRow: { flexDirection: 'row', justifyContent: 'center', gap: 10, marginBottom: 25 },
    modalInput: { backgroundColor: '#0F172A', color: '#fff', padding: 16, borderRadius: 12, height: 100, textAlignVertical: 'top', borderWidth: 1, borderColor: '#334155', marginBottom: 25 },
    modalActions: { flexDirection: 'row', justifyContent: 'space-between', gap: 15 },
    modalBtn: { flex: 1, backgroundColor: '#3B82F6', paddingVertical: 14, borderRadius: 12, alignItems: 'center' },
    modalBtnText: { color: '#fff', fontWeight: 'bold', fontSize: 15 }
});

export default MovieDetailsScreen;
