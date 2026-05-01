import React, { useContext, useState, useEffect } from 'react';
import { StyleSheet, Text, View, ScrollView, Image, TouchableOpacity, SafeAreaView, Dimensions, TextInput, FlatList, ActivityIndicator, ImageBackground, StatusBar, Platform } from 'react-native';
import { AuthContext } from '../context/AuthContext';
import api from '../utils/api';
import { Search, Film, Ticket, Utensils, Heart, LogOut, Star, PlayCircle, ShoppingBag, User, ChevronRight, MapPin } from 'lucide-react-native';

import SkeletonLoader from '../components/SkeletonLoader';
import BASE_URL from '../utils/constants';
import BottomNav from '../components/BottomNav';

const { width } = Dimensions.get('window');

const UserDashboard = ({ navigation }) => {
    const { user, logout, token } = useContext(AuthContext);
    const [movies, setMovies] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [filteredMovies, setFilteredMovies] = useState([]);

    useEffect(() => {
        fetchMovies();
    }, []);

    const fetchMovies = async () => {
        try {
            const res = await api.get('/movies');
            setMovies(res.data.data);
            setFilteredMovies(res.data.data);
        } catch (err) {
            console.log(err);
        } finally {
            setLoading(false);
        }
    };

    const handleSearch = (text) => {
        setSearchQuery(text);
        if (text) {
            const filtered = movies.filter(m =>
                m.title.toLowerCase().includes(text.toLowerCase()) ||
                m.genre.toLowerCase().includes(text.toLowerCase())
            );
            setFilteredMovies(filtered);
        } else {
            setFilteredMovies(movies);
        }
    };

    const getTimeGreeting = () => {
        const hour = new Date().getHours();
        if (hour < 12) return "Good Morning";
        if (hour < 18) return "Good Afternoon";
        return "Good Evening";
    };

    const renderMovieItem = ({ item }) => (
        <TouchableOpacity
            style={styles.movieCard}
            onPress={() => navigation.navigate('MovieDetails', { movie: item })}
            activeOpacity={0.9}
        >
            <View style={styles.posterContainer}>
                <Image
                    source={{ uri: `${BASE_URL}/uploads/movies/${item.poster}` }}
                    style={styles.poster}
                    resizeMode="cover"
                />
                <View style={styles.movieRating}>
                    <Star color="#F59E0B" size={10} fill="#F59E0B" />
                    <Text style={styles.ratingText}>{Number(item.rating).toFixed(1)}</Text>
                </View>
            </View>
            <View style={styles.movieInfo}>
                <Text style={styles.movieTitle} numberOfLines={1}>{item.title}</Text>
                <Text style={styles.movieGenre}>{item.genre} • {item.duration}m</Text>
            </View>
        </TouchableOpacity>
    );

    // Sort by _id descending to get the most recently added movie (since Mongo ObjectIDs contain timestamps)
    const heroMovie = movies.length > 0 
        ? [...movies].sort((a, b) => b._id.localeCompare(a._id))[0] 
        : null;

    return (
        <SafeAreaView style={styles.container}>
            <StatusBar barStyle="light-content" />
            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>

                {/* Top Navbar */}
                <View style={styles.header}>
                    <View>
                        <Text style={styles.greeting}>{getTimeGreeting()},</Text>
                        <Text style={styles.name}>{user?.name.split(' ')[0] || 'Cyborg'} ✨</Text>
                    </View>
                    <View style={styles.headerRight}>
                        <View style={styles.locationBox}>
                            <MapPin color="#6366F1" size={14} />
                            <Text style={styles.locationText}>Sri Lanka</Text>
                        </View>
                        <TouchableOpacity onPress={logout} style={styles.logoutBtn}>
                            <LogOut color="#EF4444" size={18} />
                        </TouchableOpacity>
                    </View>
                </View>

                {/* Search Section */}
                <View style={styles.searchSection}>
                    <View style={styles.searchBar}>
                        <Search color="#64748B" size={20} />
                        <TextInput
                            style={styles.searchInput}
                            placeholder="Find your favorite movie..."
                            placeholderTextColor="#64748B"
                            value={searchQuery}
                            onChangeText={handleSearch}
                        />
                    </View>
                </View>

                {searchQuery === '' && heroMovie && (
                    <View style={styles.heroOuter}>
                        <Text style={styles.sectionTitle}>Featured Spotlight</Text>
                        <TouchableOpacity
                            style={styles.heroCard}
                            onPress={() => navigation.navigate('MovieDetails', { movie: heroMovie })}
                            activeOpacity={0.9}
                        >
                            <ImageBackground
                                source={{ uri: `${BASE_URL}/uploads/movies/${heroMovie.poster}` }}
                                style={styles.heroImage}
                                imageStyle={{ borderRadius: 30 }}
                            >
                                <View style={styles.heroOverlay}>
                                    <View style={styles.heroTopRow}>
                                        <View style={styles.heroBadge}>
                                            <Text style={styles.heroBadgeText}>TRENDING</Text>
                                        </View>
                                        <View style={styles.imdbBox}>
                                            <Star color="#F59E0B" size={14} fill="#F59E0B" />
                                            <Text style={styles.imdbText}>{heroMovie.rating}</Text>
                                        </View>
                                    </View>
                                    <View style={styles.heroBottomContent}>
                                        <View style={{ flex: 1 }}>
                                            <Text style={styles.heroTitle}>{heroMovie.title}</Text>
                                            <View style={styles.heroInfoRow}>
                                                <Text style={styles.heroGenreText}>{heroMovie.genre} </Text>
                                                <View style={styles.dot} />
                                                <Text style={styles.heroGenreText}> {heroMovie.duration} min</Text>
                                            </View>
                                        </View>
                                        <View style={styles.bookNowBtn}>
                                            <Text style={styles.bookNowText}>Book Now</Text>
                                        </View>
                                    </View>
                                </View>
                            </ImageBackground>
                        </TouchableOpacity>
                    </View>
                )}

                {/* Categories/Quick Links */}
                {searchQuery === '' && (
                    <View style={styles.categoryRow}>
                        <TouchableOpacity style={styles.catBtn} onPress={() => navigation.navigate('UserMovieList')}>
                            <View style={[styles.catIconBox, {backgroundColor: 'rgba(99, 102, 241, 0.1)'}]}>
                                <Film color="#6366F1" size={20} />
                            </View>
                            <Text style={styles.catLabel}>Movies</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.catBtn} onPress={() => navigation.navigate('UserBookings')}>
                            <View style={[styles.catIconBox, {backgroundColor: 'rgba(16, 185, 129, 0.1)'}]}>
                                <Ticket color="#10B981" size={20} />
                            </View>
                            <Text style={styles.catLabel}>Tickets</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.catBtn} onPress={() => navigation.navigate('UserSnackMenu')}>
                            <View style={[styles.catIconBox, {backgroundColor: 'rgba(236, 72, 153, 0.1)'}]}>
                                <Utensils color="#EC4899" size={20} />
                            </View>
                            <Text style={styles.catLabel}>Snacks</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.catBtn} onPress={() => navigation.navigate('UserSnackOrders')}>
                            <View style={[styles.catIconBox, {backgroundColor: 'rgba(245, 158, 11, 0.1)'}]}>
                                <ShoppingBag color="#F59E0B" size={20} />
                            </View>
                            <Text style={styles.catLabel}>Orders</Text>
                        </TouchableOpacity>
                    </View>
                )}

                {/* Section Title */}
                <View style={styles.sectionHeader}>
                    <Text style={styles.sectionTitle}>{searchQuery ? 'Search Results' : 'Now Showing'}</Text>
                    {searchQuery === '' && (
                        <TouchableOpacity onPress={() => navigation.navigate('UserMovieList')} style={styles.seeAllBtn}>
                            <Text style={styles.seeAllText}>See All</Text>
                            <ChevronRight color="#6366F1" size={14} />
                        </TouchableOpacity>
                    )}
                </View>

                {loading ? (
                    <View style={styles.skeletonRow}>
                        <SkeletonLoader width={width * 0.44} height={240} borderRadius={25} />
                        <SkeletonLoader width={width * 0.44} height={240} borderRadius={25} />
                    </View>
                ) : (
                    <FlatList
                        data={filteredMovies}
                        renderItem={renderMovieItem}
                        keyExtractor={item => item._id}
                        horizontal={searchQuery === ''}
                        numColumns={searchQuery !== '' ? 2 : 1}
                        showsHorizontalScrollIndicator={false}
                        key={searchQuery !== '' ? 'grid' : 'list'}
                        contentContainerStyle={searchQuery !== '' ? styles.gridContent : styles.horizontalContent}
                    />
                )}

                <View style={{ height: 120 }} />
            </ScrollView>

            <BottomNav />
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#030712' },
    scrollContent: { paddingBottom: 100 },
    header: { 
        flexDirection: 'row', 
        justifyContent: 'space-between', 
        alignItems: 'center', 
        paddingHorizontal: 25, 
        paddingTop: Platform.OS === 'ios' ? 60 : 30, 
        marginBottom: 25 
    },
    greeting: { fontSize: 13, color: '#64748B', fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: 1 },
    name: { fontSize: 24, fontWeight: 'bold', color: '#F8FAFC', marginTop: 4 },
    headerRight: { flexDirection: 'row', alignItems: 'center' },
    locationBox: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#0F172A', paddingHorizontal: 12, paddingVertical: 8, borderRadius: 15, marginRight: 12, borderWidth: 1, borderColor: '#1F2937' },
    locationText: { color: '#F8FAFC', fontSize: 11, fontWeight: 'bold', marginLeft: 6 },
    logoutBtn: { width: 42, height: 42, backgroundColor: 'rgba(239, 68, 68, 0.08)', borderRadius: 12, justifyContent: 'center', alignItems: 'center' },

    searchSection: { paddingHorizontal: 25, marginBottom: 30 },
    searchBar: { 
        flexDirection: 'row', 
        alignItems: 'center', 
        backgroundColor: '#0F172A', 
        paddingHorizontal: 16, 
        paddingVertical: 14, 
        borderRadius: 20, 
        borderWidth: 1, 
        borderColor: '#1F2937'
    },
    searchInput: { flex: 1, marginLeft: 12, color: '#fff', fontSize: 15 },

    heroOuter: { marginBottom: 35 },
    heroCard: { marginHorizontal: 25, height: 200, borderRadius: 30, overflow: 'hidden' },
    heroImage: { width: '100%', height: '100%' },
    heroOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.4)', padding: 20, justifyContent: 'space-between' },
    heroTopRow: { flexDirection: 'row', justifyContent: 'space-between' },
    heroBadge: { backgroundColor: '#6366F1', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 10 },
    heroBadgeText: { color: '#fff', fontSize: 10, fontWeight: 'bold' },
    imdbBox: { flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(0,0,0,0.6)', paddingHorizontal: 10, paddingVertical: 6, borderRadius: 10 },
    imdbText: { color: '#fff', fontSize: 11, fontWeight: 'bold', marginLeft: 5 },
    heroBottomContent: { flexDirection: 'row', alignItems: 'flex-end' },
    heroTitle: { color: '#fff', fontSize: 24, fontWeight: 'bold', marginBottom: 4 },
    heroInfoRow: { flexDirection: 'row', alignItems: 'center' },
    heroGenreText: { color: '#CBD5E1', fontSize: 12 },
    dot: { width: 4, height: 4, borderRadius: 2, backgroundColor: '#64748B', marginHorizontal: 8 },
    bookNowBtn: { backgroundColor: '#fff', paddingHorizontal: 15, paddingVertical: 8, borderRadius: 12 },
    bookNowText: { color: '#030712', fontSize: 12, fontWeight: 'bold' },

    categoryRow: { flexDirection: 'row', justifyContent: 'space-between', paddingHorizontal: 25, marginBottom: 35 },
    catBtn: { alignItems: 'center' },
    catIconBox: { width: 54, height: 54, borderRadius: 18, justifyContent: 'center', alignItems: 'center', marginBottom: 10 },
    catLabel: { color: '#94A3B8', fontSize: 11, fontWeight: 'bold' },

    sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 25, marginBottom: 20 },
    sectionTitle: { fontSize: 19, fontWeight: 'bold', color: '#F1F5F9', marginBottom: 5 },
    seeAllBtn: { flexDirection: 'row', alignItems: 'center' },
    seeAllText: { color: '#6366F1', fontSize: 13, fontWeight: 'bold', marginRight: 4 },

    horizontalContent: { paddingLeft: 25, paddingRight: 10 },
    gridContent: { paddingHorizontal: 25 },
    movieCard: { width: width * 0.44, marginRight: 20 },
    posterContainer: { borderRadius: 25, overflow: 'hidden' },
    poster: { width: '100%', height: 230, backgroundColor: '#0F172A' },
    movieRating: { position: 'absolute', top: 12, right: 12, backgroundColor: 'rgba(0,0,0,0.6)', flexDirection: 'row', alignItems: 'center', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8 },
    ratingText: { color: '#fff', fontSize: 10, fontWeight: 'bold', marginLeft: 4 },
    movieInfo: { marginTop: 12 },
    movieTitle: { color: '#F8FAFC', fontSize: 15, fontWeight: 'bold', marginBottom: 4 },
    movieGenre: { color: '#64748B', fontSize: 12 },

    skeletonRow: { flexDirection: 'row', paddingHorizontal: 25, gap: 20 }
});

export default UserDashboard;
