import React, { useState, useEffect, useContext } from 'react';
import { StyleSheet, Text, View, FlatList, Image, TouchableOpacity, Alert, SafeAreaView, ActivityIndicator, Platform, TextInput } from 'react-native';
import { AuthContext } from '../context/AuthContext';
import api from '../utils/api';
import { ArrowLeft, Edit2, Trash2, Plus, Search, Star, Clock, Film } from 'lucide-react-native';

import SkeletonLoader from '../components/SkeletonLoader';

const AdminMovieListScreen = ({ navigation }) => {
    const { token } = useContext(AuthContext);
    const [movies, setMovies] = useState([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchMovies();
        
        // Refresh when coming back from AddMovie screen
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

    const handleDelete = async (id) => {
        const executeDelete = async () => {
            try {
                const res = await api.delete(`/movies/${id}`, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                if (res.data.success) {
                    setMovies(movies.filter(movie => movie._id !== id));
                    if (Platform.OS === 'web') window.alert('Movie deleted successfully');
                }
            } catch (err) {
                if (Platform.OS === 'web') {
                    window.alert(err.response?.data?.error || 'Failed to delete movie');
                } else {
                    Alert.alert('Error', err.response?.data?.error || 'Failed to delete movie');
                }
            }
        };

        if (Platform.OS === 'web') {
            if (window.confirm('Are you sure you want to delete this movie?')) {
                executeDelete();
            }
        } else {
            Alert.alert('Delete Movie', 'Are you sure you want to delete this movie?', [
                { text: 'Cancel', style: 'cancel' },
                { text: 'Delete', style: 'destructive', onPress: executeDelete }
            ]);
        }
    };

    // Calculate Summary Stats
    const totalMovies = movies.length;
    const avgRating = movies.length ? (movies.reduce((acc, curr) => acc + curr.rating, 0) / movies.length).toFixed(1) : 0;

    // Filter Logic
    const filteredMovies = movies.filter(m => {
        const query = searchQuery.toLowerCase();
        const movieTitle = m.title?.toLowerCase() || '';
        const genre = m.genre?.toLowerCase() || '';
        return movieTitle.includes(query) || genre.includes(query);
    });

    const renderMovie = ({ item }) => (
        <View style={styles.movieCard}>
            <TouchableOpacity 
                style={{ flexDirection: 'row', flex: 1 }}
                onPress={() => navigation.navigate('MovieDetails', { movie: item })}
            >
                {item.poster ? (
                    <Image 
                        source={{ uri: `http://192.168.8.106:5000/uploads/movies/${item.poster}` }} 
                        style={styles.poster}
                        resizeMode="cover"
                    />
                ) : (
                    <View style={[styles.poster, { justifyContent: 'center', alignItems: 'center' }]}>
                        <Film color="#94A3B8" size={32} />
                    </View>
                )}
                <View style={styles.movieInfo}>
                    <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                        <Text style={styles.movieTitle} numberOfLines={2}>{item.title}</Text>
                        <View style={styles.ratingBadge}>
                            <Star color="#F59E0B" size={12} fill="#F59E0B" />
                            <Text style={styles.ratingText}>{Number(item.rating).toFixed(1)}</Text>
                        </View>
                    </View>
                    
                    <View style={styles.genreBadge}>
                        <Text style={styles.genreText}>{item.genre}</Text>
                    </View>

                    <View style={styles.infoRow}>
                        <Clock color="#94A3B8" size={14} />
                        <Text style={styles.infoText}>{item.duration} Mins</Text>
                    </View>
                    
                    <View style={styles.actionButtons}>
                        <TouchableOpacity 
                            style={[styles.iconButton, { backgroundColor: 'rgba(59, 130, 246, 0.15)' }]} 
                            onPress={() => navigation.navigate('EditMovie', { movie: item })}
                        >
                            <Edit2 color="#3B82F6" size={18} />
                        </TouchableOpacity>
                        <TouchableOpacity style={[styles.iconButton, { backgroundColor: 'rgba(239, 68, 68, 0.15)' }]} onPress={() => handleDelete(item._id)}>
                            <Trash2 color="#EF4444" size={18} />
                        </TouchableOpacity>
                    </View>
                </View>
            </TouchableOpacity>
        </View>
    );

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                    <ArrowLeft color="#fff" size={24} />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Manage Movies</Text>
                <TouchableOpacity onPress={() => navigation.navigate('AddMovie')} style={styles.addButton}>
                    <Plus color="#fff" size={24} />
                </TouchableOpacity>
            </View>

            <View style={styles.statsContainer}>
                <View style={styles.statBox}>
                    <Text style={styles.statLabel}>Catalogue</Text>
                    <Text style={styles.statValue}>{totalMovies} Movies</Text>
                </View>
                <View style={styles.statBox}>
                    <Text style={styles.statLabel}>Avg Rating</Text>
                    <Text style={styles.statValue}>{avgRating} ⭐</Text>
                </View>
            </View>

            <View style={styles.searchContainer}>
                <View style={styles.searchBar}>
                    <Search color="#94A3B8" size={20} />
                    <TextInput 
                        style={styles.searchInput}
                        placeholder="Search by Title or Genre..."
                        placeholderTextColor="#94A3B8"
                        value={searchQuery}
                        onChangeText={setSearchQuery}
                    />
                </View>
            </View>

            {loading ? (
                <View style={{ paddingHorizontal: 20 }}>
                    {[1,2,3].map(i => (
                        <View key={i} style={{ flexDirection: 'row', backgroundColor: '#1E293B', borderRadius: 20, marginBottom: 16, overflow: 'hidden', borderWidth: 1, borderColor: '#334155' }}>
                            <SkeletonLoader width={110} height={160} borderRadius={0} />
                            <View style={{ flex: 1, padding: 16 }}>
                                <SkeletonLoader width="80%" height={20} borderRadius={6} style={{ marginBottom: 10 }} />
                                <SkeletonLoader width="40%" height={24} borderRadius={6} style={{ marginBottom: 10 }} />
                                <SkeletonLoader width="30%" height={16} borderRadius={4} />
                                <View style={{ flexDirection: 'row', justifyContent: 'flex-end', marginTop: 15 }}>
                                    <SkeletonLoader width={34} height={34} borderRadius={10} style={{ marginLeft: 10 }} />
                                    <SkeletonLoader width={34} height={34} borderRadius={10} style={{ marginLeft: 10 }} />
                                </View>
                            </View>
                        </View>
                    ))}
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
                    contentContainerStyle={styles.listContent}
                    showsVerticalScrollIndicator={false}
                />
            )}
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#0F172A',
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 20,
        backgroundColor: '#1E293B',
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#fff',
    },
    backButton: {
        padding: 10,
        backgroundColor: 'rgba(255,255,255,0.05)',
        borderRadius: 12,
    },
    addButton: {
        padding: 10,
        backgroundColor: '#3B82F6',
        borderRadius: 12,
    },
    statsContainer: { flexDirection: 'row', padding: 20, backgroundColor: '#1E293B', borderBottomWidth: 1, borderBottomColor: '#334155' },
    statBox: { flex: 1, backgroundColor: 'rgba(255,255,255,0.03)', padding: 16, borderRadius: 16, marginRight: 10, borderWidth: 1, borderColor: '#334155' },
    statLabel: { color: '#94A3B8', fontSize: 12, marginBottom: 4, textTransform: 'uppercase', fontWeight: 'bold' },
    statValue: { color: '#10B981', fontSize: 20, fontWeight: 'bold' },
    searchContainer: { paddingHorizontal: 20, marginTop: 20 },
    searchBar: { flexDirection: 'row', backgroundColor: '#1E293B', padding: 12, borderRadius: 14, alignItems: 'center', borderWidth: 1, borderColor: '#334155' },
    searchInput: { flex: 1, marginLeft: 10, color: '#fff', fontSize: 14 },
    listContent: {
        padding: 20,
    },
    movieCard: {
        flexDirection: 'row',
        backgroundColor: '#1E293B',
        borderRadius: 20,
        marginBottom: 16,
        overflow: 'hidden',
        borderWidth: 1,
        borderColor: '#334155',
    },
    poster: {
        width: 110,
        height: '100%',
        backgroundColor: '#334155',
        minHeight: 160
    },
    movieInfo: {
        flex: 1,
        padding: 16,
    },
    movieTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#fff',
        marginBottom: 8,
        flex: 1,
        marginRight: 10
    },
    ratingBadge: { flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(245, 158, 11, 0.15)', paddingHorizontal: 6, paddingVertical: 4, borderRadius: 6 },
    ratingText: { color: '#F59E0B', fontSize: 12, fontWeight: 'bold', marginLeft: 4 },
    genreBadge: { alignSelf: 'flex-start', backgroundColor: 'rgba(59, 130, 246, 0.15)', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6, marginBottom: 10 },
    genreText: { color: '#3B82F6', fontSize: 11, fontWeight: 'bold' },
    infoRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 6 },
    infoText: { color: '#CBD5E1', fontSize: 13, marginLeft: 6 },
    actionButtons: {
        flexDirection: 'row',
        justifyContent: 'flex-end',
        marginTop: 10,
    },
    iconButton: {
        padding: 8,
        borderRadius: 10,
        marginLeft: 10,
    },
    center: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    emptyText: {
        color: '#94A3B8',
        fontSize: 16,
    }
});

export default AdminMovieListScreen;
