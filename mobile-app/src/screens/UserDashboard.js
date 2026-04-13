import React, { useContext, useState, useEffect } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, ScrollView, SafeAreaView, TextInput, FlatList, Image, ActivityIndicator, Alert, Platform, ImageBackground, Dimensions } from 'react-native';
import { AuthContext } from '../context/AuthContext';
import api from '../utils/api';
import { Search, Film, Ticket, Utensils, Heart, LogOut, Star, PlayCircle, ShoppingBag } from 'lucide-react-native';

import SkeletonLoader from '../components/SkeletonLoader';

const { width } = Dimensions.get('window');

const UserDashboard = ({ navigation }) => {
    const { logout, user } = useContext(AuthContext);
    const [movies, setMovies] = useState([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchMovies();
        
        const unsubscribe = navigation.addListener('focus', () => {
            fetchMovies();
        });
        return unsubscribe;
    }, [navigation]);

    const fetchMovies = async () => {
        try {
            const res = await api.get('/movies');
            setMovies(res.data.data);
        } catch (err) {
            console.log('Failed to fetch movies', err);
        } finally {
            setLoading(false);
        }
    };

    const handleAlert = (title, msg) => {
        if (Platform.OS === 'web') {
            window.alert(`${title}: ${msg}`);
        } else {
            Alert.alert(title, msg);
        }
    };

    const categories = [
        { id: 1, name: 'Movies', icon: <Film color="#fff" size={24}/>, color: '#3B82F6', action: () => navigation.navigate('UserMovieList') },
        { id: 2, name: 'Bookings', icon: <Ticket color="#fff" size={24}/>, color: '#10B981', action: () => navigation.navigate('UserBookings') },
        { id: 3, name: 'Snacks', icon: <Utensils color="#fff" size={24}/>, color: '#F59E0B', action: () => navigation.navigate('UserSnackMenu') },
        { id: 4, name: 'Orders', icon: <ShoppingBag color="#fff" size={24}/>, color: '#6366F1', action: () => navigation.navigate('UserSnackOrders') },
    ];

    const filteredMovies = movies.filter(m => {
        const query = searchQuery.toLowerCase();
        return (m.title?.toLowerCase().includes(query) || m.genre?.toLowerCase().includes(query));
    });

    const heroMovie = movies.length > 0 ? movies[0] : null;

    const renderMovie = ({ item }) => (
        <TouchableOpacity 
            style={styles.movieCard}
            onPress={() => navigation.navigate('MovieDetails', { movie: item })}
            activeOpacity={0.8}
        >
            <Image 
                source={{ uri: `http://192.168.8.106:5000/uploads/movies/${item.poster}` }} 
                style={styles.poster}
                resizeMode="cover"
            />
            <View style={styles.ratingBadge}>
                <Star color="#F59E0B" size={10} fill="#F59E0B" />
                <Text style={styles.ratingText}>{item.rating}</Text>
            </View>
            <Text style={styles.movieTitle} numberOfLines={1}>{item.title}</Text>
            <Text style={styles.movieGenre}>{item.genre}</Text>
        </TouchableOpacity>
    );

    return (
        <SafeAreaView style={styles.container}>
            <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
                <View style={styles.header}>
                    <View>
                        <Text style={styles.greeting}>Hello, <Text style={styles.name}>{user?.name}</Text></Text>
                        <Text style={styles.subtitle}>Book your favorite movies</Text>
                    </View>
                    <TouchableOpacity onPress={logout} style={styles.logoutButton}>
                        <LogOut color="#EF4444" size={20} />
                    </TouchableOpacity>
                </View>

                <View style={styles.searchBar}>
                    <Search color="#94A3B8" size={20} />
                    <TextInput 
                        style={styles.searchInput}
                        placeholder="Search movies by title or genre..."
                        placeholderTextColor="#94A3B8"
                        value={searchQuery}
                        onChangeText={setSearchQuery}
                    />
                </View>

                {/* Hero Section if no search */}
                {!searchQuery && heroMovie && (
                    <TouchableOpacity 
                        style={styles.heroContainer}
                        activeOpacity={0.9}
                        onPress={() => navigation.navigate('MovieDetails', { movie: heroMovie })}
                    >
                        <ImageBackground 
                            source={{ uri: `http://192.168.8.106:5000/uploads/movies/${heroMovie.poster}` }}
                            style={styles.heroImage}
                            imageStyle={{ borderRadius: 24, opacity: 0.6 }}
                            resizeMode="cover"
                        >
                            <View style={styles.heroOverlay}>
                                <View style={styles.heroBadge}>
                                    <Text style={styles.heroBadgeText}>Featured</Text>
                                </View>
                                <PlayCircle color="#fff" size={50} style={styles.playIcon} />
                                <View>
                                    <Text style={styles.heroTitle} numberOfLines={1}>{heroMovie.title}</Text>
                                    <Text style={styles.heroGenre}>{heroMovie.genre} • {heroMovie.duration} Min</Text>
                                </View>
                            </View>
                        </ImageBackground>
                    </TouchableOpacity>
                )}

                <View style={styles.categories}>
                    {categories.map(cat => (
                        <View key={cat.id} style={styles.catItem}>
                            <TouchableOpacity 
                                style={[styles.catIcon, { backgroundColor: cat.color + '20', borderWidth: 1, borderColor: cat.color + '50' }]}
                                onPress={cat.action}
                            >
                                {cat.icon}
                            </TouchableOpacity>
                            <Text style={styles.catText}>{cat.name}</Text>
                        </View>
                    ))}
                </View>

                <View style={styles.featured}>
                    <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
                        <Text style={styles.sectionTitle}>{searchQuery ? 'Search Results' : 'Now Showing'}</Text>
                    </View>
                    
                    {loading ? (
                        <View style={{ flexDirection: 'row', gap: 16 }}>
                            <View>
                                <SkeletonLoader width={(width - 60) / 2} height={220} borderRadius={20} />
                                <SkeletonLoader width={(width - 60) / 2} height={16} borderRadius={4} style={{ marginTop: 10 }} />
                                <SkeletonLoader width={(width - 60) / 3} height={12} borderRadius={4} style={{ marginTop: 6 }} />
                            </View>
                            <View>
                                <SkeletonLoader width={(width - 60) / 2} height={220} borderRadius={20} />
                                <SkeletonLoader width={(width - 60) / 2} height={16} borderRadius={4} style={{ marginTop: 10 }} />
                                <SkeletonLoader width={(width - 60) / 3} height={12} borderRadius={4} style={{ marginTop: 6 }} />
                            </View>
                        </View>
                    ) : filteredMovies.length === 0 ? (
                        <View style={styles.moviePlaceholder}>
                            <Text style={styles.placeholderText}>No movies found.</Text>
                        </View>
                    ) : (
                        <FlatList
                            data={filteredMovies}
                            keyExtractor={(item) => item._id}
                            renderItem={renderMovie}
                            horizontal={!searchQuery} // Stack vertically if searching
                            numColumns={searchQuery ? 2 : 1}
                            columnWrapperStyle={searchQuery ? { justifyContent: 'space-between' } : null}
                            showsHorizontalScrollIndicator={false}
                            showsVerticalScrollIndicator={false}
                            key={searchQuery ? 'grid' : 'list'} // Force re-render on layout change
                        />
                    )}
                </View>
            </ScrollView>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#0F172A',
    },
    content: {
        padding: 24,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingTop: 40,
        marginBottom: 20,
    },
    greeting: {
        fontSize: 16,
        color: '#94A3B8',
    },
    name: {
        fontSize: 22,
        fontWeight: 'bold',
        color: '#fff',
    },
    subtitle: { color: '#64748B', fontSize: 13, marginTop: 4 },
    logoutButton: {
        padding: 10,
        backgroundColor: 'rgba(239, 68, 68, 0.1)',
        borderRadius: 14,
    },
    searchBar: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#1E293B',
        padding: 16,
        borderRadius: 18,
        marginBottom: 24,
        borderWidth: 1,
        borderColor: '#334155'
    },
    searchInput: {
        flex: 1,
        marginLeft: 10,
        color: '#fff',
        fontSize: 15,
    },
    heroContainer: { height: 200, marginBottom: 30, borderRadius: 24, overflow: 'hidden' },
    heroImage: { width: '100%', height: '100%', justifyContent: 'flex-end', backgroundColor: '#000' },
    heroOverlay: { padding: 20, justifyContent: 'flex-end' },
    heroBadge: { position: 'absolute', top: 20, left: 20, backgroundColor: '#EF4444', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8 },
    heroBadgeText: { color: '#fff', fontSize: 10, fontWeight: 'bold', textTransform: 'uppercase' },
    playIcon: { position: 'absolute', right: 20, bottom: 20, opacity: 0.8 },
    heroTitle: { fontSize: 24, fontWeight: 'bold', color: '#fff', marginBottom: 4, width: '80%' },
    heroGenre: { fontSize: 13, color: '#CBD5E1', fontWeight: 'bold' },
    categories: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 30,
    },
    catItem: {
        alignItems: 'center',
    },
    catIcon: {
        width: 60,
        height: 60,
        borderRadius: 20,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 8,
    },
    catText: {
        color: '#94A3B8',
        fontSize: 12,
        fontWeight: 'bold',
    },
    featured: {
        marginTop: 5,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#fff',
    },
    moviePlaceholder: {
        height: 200,
        backgroundColor: '#1E293B',
        borderRadius: 24,
        justifyContent: 'center',
        alignItems: 'center',
        borderStyle: 'dashed',
        borderWidth: 1,
        borderColor: '#334155',
    },
    placeholderText: {
        color: '#64748B',
    },
    movieCard: {
        width: (width - 60) / 2, // Responsive width for 2 columns when searching
        marginRight: 16,
        marginBottom: 20
    },
    poster: {
        width: '100%',
        height: 220,
        borderRadius: 20,
        marginBottom: 10,
        backgroundColor: '#1E293B',
    },
    ratingBadge: { position: 'absolute', top: 10, left: 10, flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(0,0,0,0.6)', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8 },
    ratingText: { color: '#F59E0B', fontSize: 11, fontWeight: 'bold', marginLeft: 4 },
    movieTitle: {
        color: '#fff',
        fontSize: 15,
        fontWeight: 'bold',
    },
    movieGenre: {
        color: '#94A3B8',
        fontSize: 12,
        marginTop: 4,
    }
});

export default UserDashboard;
