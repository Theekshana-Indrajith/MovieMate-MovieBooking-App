import React, { useState, useEffect, useContext } from 'react';
<<<<<<< HEAD
import { StyleSheet, Text, View, Image, TouchableOpacity, ScrollView, SafeAreaView, ActivityIndicator, Alert, TextInput, Modal, Platform } from 'react-native';
import { AuthContext } from '../context/AuthContext';
import api from '../utils/api';
import { ArrowLeft, Clock, Calendar as CalendarIcon, Ticket, Star, MessageSquare, Trash2 } from 'lucide-react-native';
import SkeletonLoader from '../components/SkeletonLoader';
=======
import { StyleSheet, Text, View, Image, TouchableOpacity, ScrollView, SafeAreaView, ActivityIndicator, Alert, TextInput, Modal, Platform, StatusBar } from 'react-native';
import { AuthContext } from '../context/AuthContext';
import api from '../utils/api';
import { ArrowLeft, Clock, Ticket, Star, MessageSquare, Trash2, Users, Info } from 'lucide-react-native';
import SkeletonLoader from '../components/SkeletonLoader';
import BASE_URL from '../utils/constants';

>>>>>>> origin/theekshana-IT24102753
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
<<<<<<< HEAD
        const fetchInitialData = async () => {
=======
        const fetchDetails = async () => {
>>>>>>> origin/theekshana-IT24102753
            try {
                const [stRes, movieRes] = await Promise.all([
                    api.get(`/movies/${initialMovie._id}/showtimes`),
                    api.get(`/movies/${initialMovie._id}`)
                ]);
                setShowtimes(stRes.data.data);
<<<<<<< HEAD
                if (movieRes.data.data) {
                    setMovie(movieRes.data.data);
                }
            } catch (err) {
                Alert.alert('Error', 'Failed to load details');
=======
                if (movieRes.data.data) setMovie(movieRes.data.data);
            } catch (err) {
                console.log(err);
>>>>>>> origin/theekshana-IT24102753
            } finally {
                setLoading(false);
            }
        };
<<<<<<< HEAD

        fetchInitialData();
=======
        fetchDetails();
>>>>>>> origin/theekshana-IT24102753
    }, [initialMovie._id]);

    const handleBookNow = () => {
        if (!selectedShowtime) {
            Alert.alert('Select Showtime', 'Please select a date and time to continue.');
            return;
        }
<<<<<<< HEAD
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
=======
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
>>>>>>> origin/theekshana-IT24102753
                const movieRes = await api.get(`/movies/${movie._id}`);
                setMovie(movieRes.data.data);
            }
        } catch (err) {
<<<<<<< HEAD
            Alert.alert('Error', err.response?.data?.error || 'Could not submit review');
=======
            Alert.alert('Error', 'Failed to post review');
>>>>>>> origin/theekshana-IT24102753
        } finally {
            setSubmittingReview(false);
        }
    };

    const renderStars = (rating) => {
<<<<<<< HEAD
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
=======
        return [1,2,3,4,5].map(i => (
            <Star key={i} color={i <= Math.round(rating) ? '#F59E0B' : '#334155'} size={14} fill={i <= Math.round(rating) ? '#F59E0B' : 'transparent'} />
        ));
>>>>>>> origin/theekshana-IT24102753
    };

    return (
        <SafeAreaView style={styles.container}>
<<<<<<< HEAD
            <ScrollView>
                <View style={styles.imageContainer}>
                    <Image 
                        source={{ uri: `http://192.168.8.106:5000/uploads/movies/${movie.poster}` }} 
                        style={styles.poster}
                        resizeMode="cover"
                    />
                    <View style={styles.overlay}>
=======
            <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />
            <ScrollView showsVerticalScrollIndicator={false}>
                
                {/* Header with Backdrop */}
                <View style={styles.headerContainer}>
                    <Image 
                        source={{ uri: `${BASE_URL}/uploads/movies/${movie.backdrop || movie.poster}` }} 
                        style={styles.backdrop}
                    />
                    <View style={styles.headerOverlay}>
>>>>>>> origin/theekshana-IT24102753
                        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                            <ArrowLeft color="#fff" size={24} />
                        </TouchableOpacity>
                    </View>
                </View>

<<<<<<< HEAD
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
=======
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
                    <Text style={[styles.sectionTitle, { marginTop: 25 }]}>Select Showtime</Text>
                    {loading ? (
                        <ActivityIndicator color="#6366F1" style={{ marginVertical: 20 }} />
                    ) : showtimes.length === 0 ? (
                        <Text style={styles.noDataText}>No upcoming shows scheduled.</Text>
                    ) : (
                        <View>
                            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 15 }}>
                                {showtimes.map(st => {
                                    const dateObj = new Date(st.date);
                                    const isSelected = selectedShowtime?.showtimeId === st._id;
                                    return (
                                        <TouchableOpacity 
                                            key={st._id} 
                                            style={[styles.dateCard, isSelected && styles.dateCardActive]}
                                            onPress={() => setSelectedShowtime({ showtimeId: st._id, time: null, price: st.ticketPrice, date: dateObj.toDateString() })}
                                        >
                                            <Text style={[styles.dateMonth, isSelected && styles.whiteText]}>{dateObj.toLocaleDateString('en-US', { month: 'short' })}</Text>
                                            <Text style={[styles.dateDay, isSelected && styles.whiteText]}>{dateObj.getDate()}</Text>
                                            <Text style={[styles.dateWeek, isSelected && styles.whiteText]}>{dateObj.toLocaleDateString('en-US', { weekday: 'short' })}</Text>
>>>>>>> origin/theekshana-IT24102753
                                        </TouchableOpacity>
                                    );
                                })}
                            </ScrollView>

<<<<<<< HEAD
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
=======
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
>>>>>>> origin/theekshana-IT24102753
                            )}
                        </View>
                    )}

<<<<<<< HEAD
                    {/* Review Section */}
                    <View style={styles.reviewHeader}>
                        <Text style={styles.sectionTitle}>Reviews & Ratings</Text>
                        {!hasUserReviewed && user?.role !== 'admin' && (
                            <TouchableOpacity style={styles.addReviewBtn} onPress={() => setReviewModalVisible(true)}>
                                <MessageSquare color="#3B82F6" size={14} style={{ marginRight: 6 }} />
                                <Text style={styles.addReviewText}>Write Review</Text>
                            </TouchableOpacity>
                        )}
=======
                    {/* Reviews */}
                    <View style={styles.reviewHeader}>
                        <Text style={styles.sectionTitle}>Reviews</Text>
                        <TouchableOpacity style={styles.addReviewBtn} onPress={() => setReviewModalVisible(true)}>
                            <MessageSquare color="#6366F1" size={14} />
                            <Text style={styles.addReviewTxt}>Add Review</Text>
                        </TouchableOpacity>
>>>>>>> origin/theekshana-IT24102753
                    </View>

                    {movie.reviews && movie.reviews.length > 0 ? (
                        movie.reviews.map(rev => (
                            <View key={rev._id} style={styles.reviewCard}>
<<<<<<< HEAD
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
=======
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
>>>>>>> origin/theekshana-IT24102753
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
<<<<<<< HEAD
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
=======
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
>>>>>>> origin/theekshana-IT24102753
});

export default MovieDetailsScreen;
