import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, FlatList, TouchableOpacity, Alert, SafeAreaView, ActivityIndicator, Image, Dimensions, TextInput } from 'react-native';
import api from '../utils/api';
import BASE_URL from '../utils/constants';
import { ArrowLeft, Star, Film, Search } from 'lucide-react-native';

import SkeletonLoader from '../components/SkeletonLoader';
import BottomNav from '../components/BottomNav';

const { width } = Dimensions.get('window');

const UserMovieListScreen = ({ navigation }) => {
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
            Alert.alert('Error', 'Failed to load movies');
        } finally {
            setLoading(false);
        }
    };

    const filteredMovies = movies.filter(m => {
        const query = searchQuery.toLowerCase();
        return (m.title?.toLowerCase().includes(query) || m.genre?.toLowerCase().includes(query));
    });

    const renderMovie = ({ item }) => (
        <TouchableOpacity 
            style={styles.movieCard}
            onPress={() => navigation.navigate('MovieDetails', { movie: item })}
            activeOpacity={0.8}
        >
            <Image 
                source={{ uri: `${BASE_URL}/uploads/movies/${item.poster}` }} 
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
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                    <ArrowLeft color="#fff" size={24} />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>All Movies</Text>
                <TouchableOpacity style={styles.backButton} disabled>
                    <Film color="#fff" size={20} opacity={0.5} />
                </TouchableOpacity>
            </View>

            <View style={styles.searchContainer}>
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
            </View>

            {loading ? (
                <View style={{ paddingHorizontal: 20 }}>
                    <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 20 }}>
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
                    <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
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
                </View>
            ) : filteredMovies.length === 0 ? (
                <View style={styles.center}>
                    <Text style={styles.emptyText}>No movies match your search.</Text>
                </View>
            ) : (
                <FlatList
                    data={filteredMovies}
                    keyExtractor={(item) => item._id}
                    renderItem={renderMovie}
                    numColumns={2}
                    columnWrapperStyle={styles.row}
                    contentContainerStyle={styles.listContent}
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
    searchContainer: { paddingHorizontal: 20, marginBottom: 20 },
    searchBar: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#1E293B', padding: 16, borderRadius: 18, borderWidth: 1, borderColor: '#334155' },
    searchInput: { flex: 1, marginLeft: 10, color: '#fff', fontSize: 15 },
    listContent: { padding: 20, paddingTop: 0, paddingBottom: 130 },
    row: { justifyContent: 'space-between' },
    movieCard: { width: (width - 60) / 2, marginBottom: 20 },
    poster: { width: '100%', height: 220, borderRadius: 20, marginBottom: 10, backgroundColor: '#1E293B' },
    ratingBadge: { position: 'absolute', top: 10, left: 10, flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(0,0,0,0.6)', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8 },
    ratingText: { color: '#F59E0B', fontSize: 11, fontWeight: 'bold', marginLeft: 4 },
    movieTitle: { color: '#fff', fontSize: 15, fontWeight: 'bold' },
    movieGenre: { color: '#94A3B8', fontSize: 12, marginTop: 4 },
    center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    emptyText: { color: '#94A3B8', fontSize: 16 }
});

export default UserMovieListScreen;
