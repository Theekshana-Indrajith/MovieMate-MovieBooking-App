import React, { useState, useEffect, useContext } from 'react';
<<<<<<< HEAD
import { StyleSheet, Text, View, FlatList, Image, TouchableOpacity, Alert, SafeAreaView, ActivityIndicator, Platform, TextInput } from 'react-native';
=======
import { StyleSheet, Text, View, FlatList, Image, TouchableOpacity, Alert, SafeAreaView, ActivityIndicator, Platform, TextInput, StatusBar } from 'react-native';
>>>>>>> origin/theekshana-IT24102753
import { AuthContext } from '../context/AuthContext';
import api from '../utils/api';
import { ArrowLeft, Edit2, Trash2, Plus, Search, Star, Clock, Film } from 'lucide-react-native';

import SkeletonLoader from '../components/SkeletonLoader';
<<<<<<< HEAD
=======
import BASE_URL from '../utils/constants';
import BottomNav from '../components/BottomNav';
>>>>>>> origin/theekshana-IT24102753

const AdminMovieListScreen = ({ navigation }) => {
    const { token } = useContext(AuthContext);
    const [movies, setMovies] = useState([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchMovies();
<<<<<<< HEAD
        
        // Refresh when coming back from AddMovie screen
        const unsubscribe = navigation.addListener('focus', () => {
            fetchMovies();
        });
=======
        const unsubscribe = navigation.addListener('focus', () => { fetchMovies(); });
>>>>>>> origin/theekshana-IT24102753
        return unsubscribe;
    }, [navigation]);

    const fetchMovies = async () => {
        try {
            const res = await api.get('/movies');
            setMovies(res.data.data);
        } catch (err) {
<<<<<<< HEAD
            Alert.alert('Error', 'Failed to load movies');
=======
            console.log(err);
>>>>>>> origin/theekshana-IT24102753
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

<<<<<<< HEAD
    // Calculate Summary Stats
    const totalMovies = movies.length;
    const avgRating = movies.length ? (movies.reduce((acc, curr) => acc + curr.rating, 0) / movies.length).toFixed(1) : 0;

    // Filter Logic
    const filteredMovies = movies.filter(m => {
        const query = searchQuery.toLowerCase();
        const movieTitle = m.title?.toLowerCase() || '';
        const genre = m.genre?.toLowerCase() || '';
        return movieTitle.includes(query) || genre.includes(query);
=======
    const filteredMovies = movies.filter(m => {
        const query = searchQuery.toLowerCase();
        return (m.title?.toLowerCase() || '').includes(query) || (m.genre?.toLowerCase() || '').includes(query);
>>>>>>> origin/theekshana-IT24102753
    });

    const renderMovie = ({ item }) => (
        <View style={styles.movieCard}>
<<<<<<< HEAD
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
=======
            <View style={{ flexDirection: 'row', flex: 1 }}>
                {item.poster ? (
                    <Image source={{ uri: `${BASE_URL}/uploads/movies/${item.poster}` }} style={styles.poster} resizeMode="cover" />
                ) : (
                    <View style={[styles.poster, { justifyContent: 'center', alignItems: 'center' }]}>
                        <Film color="#475569" size={32} />
>>>>>>> origin/theekshana-IT24102753
                    </View>
                )}
                <View style={styles.movieInfo}>
                    <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' }}>
<<<<<<< HEAD
                        <Text style={styles.movieTitle} numberOfLines={2}>{item.title}</Text>
=======
                        <Text style={styles.movieTitle} numberOfLines={1}>{item.title}</Text>
>>>>>>> origin/theekshana-IT24102753
                        <View style={styles.ratingBadge}>
                            <Star color="#F59E0B" size={12} fill="#F59E0B" />
                            <Text style={styles.ratingText}>{Number(item.rating).toFixed(1)}</Text>
                        </View>
                    </View>
                    
<<<<<<< HEAD
                    <View style={styles.genreBadge}>
                        <Text style={styles.genreText}>{item.genre}</Text>
                    </View>

                    <View style={styles.infoRow}>
                        <Clock color="#94A3B8" size={14} />
=======
                    <Text style={styles.genreText}>{item.genre}</Text>

                    <View style={styles.infoRow}>
                        <Clock color="#64748B" size={14} />
>>>>>>> origin/theekshana-IT24102753
                        <Text style={styles.infoText}>{item.duration} Mins</Text>
                    </View>
                    
                    <View style={styles.actionButtons}>
                        <TouchableOpacity 
<<<<<<< HEAD
                            style={[styles.iconButton, { backgroundColor: 'rgba(59, 130, 246, 0.15)' }]} 
                            onPress={() => navigation.navigate('EditMovie', { movie: item })}
                        >
                            <Edit2 color="#3B82F6" size={18} />
=======
                            style={[styles.iconButton, { backgroundColor: 'rgba(99, 102, 241, 0.15)' }]} 
                            onPress={() => navigation.navigate('EditMovie', { movie: item })}
                        >
                            <Edit2 color="#6366F1" size={18} />
>>>>>>> origin/theekshana-IT24102753
                        </TouchableOpacity>
                        <TouchableOpacity style={[styles.iconButton, { backgroundColor: 'rgba(239, 68, 68, 0.15)' }]} onPress={() => handleDelete(item._id)}>
                            <Trash2 color="#EF4444" size={18} />
                        </TouchableOpacity>
                    </View>
                </View>
<<<<<<< HEAD
            </TouchableOpacity>
=======
            </View>
>>>>>>> origin/theekshana-IT24102753
        </View>
    );

    return (
        <SafeAreaView style={styles.container}>
<<<<<<< HEAD
=======
            <StatusBar barStyle="light-content" />
>>>>>>> origin/theekshana-IT24102753
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                    <ArrowLeft color="#fff" size={24} />
                </TouchableOpacity>
<<<<<<< HEAD
                <Text style={styles.headerTitle}>Manage Movies</Text>
=======
                <Text style={styles.headerTitle}>Movies Cabinet</Text>
>>>>>>> origin/theekshana-IT24102753
                <TouchableOpacity onPress={() => navigation.navigate('AddMovie')} style={styles.addButton}>
                    <Plus color="#fff" size={24} />
                </TouchableOpacity>
            </View>

<<<<<<< HEAD
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
=======
            <View style={styles.searchContainer}>
                <View style={styles.searchBar}>
                    <Search color="#64748B" size={20} />
                    <TextInput 
                        style={styles.searchInput}
                        placeholder="Search cinema catalogue..."
                        placeholderTextColor="#64748B"
>>>>>>> origin/theekshana-IT24102753
                        value={searchQuery}
                        onChangeText={setSearchQuery}
                    />
                </View>
            </View>

            {loading ? (
<<<<<<< HEAD
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
=======
                <View style={{ padding: 20 }}>
                    {[1,2,3].map(i => (
                        <View key={i} style={[styles.movieCard, { height: 160 }]}>
                             <SkeletonLoader width={110} height="100%" borderRadius={0} />
                             <View style={{ flex: 1, padding: 20 }}>
                                <SkeletonLoader width="80%" height={20} borderRadius={6} style={{ marginBottom: 15 }} />
                                <SkeletonLoader width="40%" height={24} borderRadius={6} />
                             </View>
                        </View>
                    ))}
                </View>
>>>>>>> origin/theekshana-IT24102753
            ) : (
                <FlatList
                    data={filteredMovies}
                    keyExtractor={(item) => item._id}
                    renderItem={renderMovie}
<<<<<<< HEAD
                    contentContainerStyle={styles.listContent}
                    showsVerticalScrollIndicator={false}
                />
            )}
=======
                    contentContainerStyle={[styles.listContent, { paddingBottom: 130 }]}
                    showsVerticalScrollIndicator={false}
                />
            )}
            <BottomNav />
>>>>>>> origin/theekshana-IT24102753
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
<<<<<<< HEAD
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
=======
    container: { flex: 1, backgroundColor: '#0A0F1D' },
    header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 20, paddingTop: 20, backgroundColor: '#161B2E', borderBottomLeftRadius: 32, borderBottomRightRadius: 32 },
    headerTitle: { fontSize: 20, fontWeight: 'bold', color: '#fff' },
    backButton: { padding: 10, backgroundColor: 'rgba(255,255,255,0.05)', borderRadius: 14 },
    addButton: { padding: 10, backgroundColor: '#6366F1', borderRadius: 14 },
    searchContainer: { paddingHorizontal: 20, marginTop: 25, marginBottom: 10 },
    searchBar: { flexDirection: 'row', backgroundColor: '#161B2E', paddingHorizontal: 16, paddingVertical: 14, borderRadius: 20, alignItems: 'center', borderWidth: 1, borderColor: '#1F2937' },
    searchInput: { flex: 1, marginLeft: 12, color: '#fff', fontSize: 16 },
    listContent: { padding: 20 },
    movieCard: { flexDirection: 'row', backgroundColor: '#161B2E', borderRadius: 28, marginBottom: 20, overflow: 'hidden', borderWidth: 1, borderColor: '#1F2937' },
    poster: { width: 110, height: '100%', backgroundColor: '#0F172A', minHeight: 165 },
    movieInfo: { flex: 1, padding: 18 },
    movieTitle: { fontSize: 17, fontWeight: 'bold', color: '#fff', marginBottom: 6, flex: 1 },
    ratingBadge: { flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(245, 158, 11, 0.1)', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8 },
    ratingText: { color: '#F59E0B', fontSize: 12, fontWeight: 'bold', marginLeft: 4 },
    genreText: { color: '#6366F1', fontSize: 13, fontWeight: 'bold', marginBottom: 10 },
    infoRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 10 },
    infoText: { color: '#64748B', fontSize: 12, marginLeft: 8, fontWeight: '600' },
    actionButtons: { flexDirection: 'row', justifyContent: 'flex-end', marginTop: 5 },
    iconButton: { padding: 10, borderRadius: 12, marginLeft: 12 },
    center: { flex: 1, justifyContent: 'center', alignItems: 'center' }
>>>>>>> origin/theekshana-IT24102753
});

export default AdminMovieListScreen;
