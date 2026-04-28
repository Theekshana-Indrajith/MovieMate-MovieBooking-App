import React, { useState, useEffect, useContext } from 'react';
import { StyleSheet, Text, View, FlatList, Image, TouchableOpacity, Alert, SafeAreaView, ActivityIndicator, Platform, TextInput, StatusBar } from 'react-native';
import { AuthContext } from '../context/AuthContext';
import api from '../utils/api';
import { ArrowLeft, Edit2, Trash2, Plus, Search, Star, Clock, Film } from 'lucide-react-native';

import SkeletonLoader from '../components/SkeletonLoader';
import BASE_URL from '../utils/constants';
import BottomNav from '../components/BottomNav';

const AdminMovieListScreen = ({ navigation }) => {
    const { token } = useContext(AuthContext);
    const [movies, setMovies] = useState([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchMovies();
        const unsubscribe = navigation.addListener('focus', () => { fetchMovies(); });
        return unsubscribe;
    }, [navigation]);

    const fetchMovies = async () => {
        try {
            const res = await api.get('/movies');
            setMovies(res.data.data);
        } catch (err) {
            console.log(err);
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

    const filteredMovies = movies.filter(m => {
        const query = searchQuery.toLowerCase();
        return (m.title?.toLowerCase() || '').includes(query) || (m.genre?.toLowerCase() || '').includes(query);
    });

    const renderMovie = ({ item }) => (
        <View style={styles.movieCard}>
            <View style={{ flexDirection: 'row', flex: 1 }}>
                {item.poster ? (
                    <Image source={{ uri: `${BASE_URL}/uploads/movies/${item.poster}` }} style={styles.poster} resizeMode="cover" />
                ) : (
                    <View style={[styles.poster, { justifyContent: 'center', alignItems: 'center' }]}>
                        <Film color="#475569" size={32} />
                    </View>
                )}
                <View style={styles.movieInfo}>
                    <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                        <Text style={styles.movieTitle} numberOfLines={1}>{item.title}</Text>
                        <View style={styles.ratingBadge}>
                            <Star color="#F59E0B" size={12} fill="#F59E0B" />
                            <Text style={styles.ratingText}>{Number(item.rating).toFixed(1)}</Text>
                        </View>
                    </View>
                    
                    <Text style={styles.genreText}>{item.genre}</Text>

                    <View style={styles.infoRow}>
                        <Clock color="#64748B" size={14} />
                        <Text style={styles.infoText}>{item.duration} Mins</Text>
                    </View>
                    
                    <View style={styles.actionButtons}>
                        <TouchableOpacity 
                            style={[styles.iconButton, { backgroundColor: 'rgba(99, 102, 241, 0.15)' }]} 
                            onPress={() => navigation.navigate('EditMovie', { movie: item })}
                        >
                            <Edit2 color="#6366F1" size={18} />
                        </TouchableOpacity>
                        <TouchableOpacity style={[styles.iconButton, { backgroundColor: 'rgba(239, 68, 68, 0.15)' }]} onPress={() => handleDelete(item._id)}>
                            <Trash2 color="#EF4444" size={18} />
                        </TouchableOpacity>
                    </View>
                </View>
            </View>
        </View>
    );

    return (
        <SafeAreaView style={styles.container}>
            <StatusBar barStyle="light-content" />
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                    <ArrowLeft color="#fff" size={24} />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Movies Cabinet</Text>
                <TouchableOpacity onPress={() => navigation.navigate('AddMovie')} style={styles.addButton}>
                    <Plus color="#fff" size={24} />
                </TouchableOpacity>
            </View>

            <View style={styles.searchContainer}>
                <View style={styles.searchBar}>
                    <Search color="#64748B" size={20} />
                    <TextInput 
                        style={styles.searchInput}
                        placeholder="Search cinema catalogue..."
                        placeholderTextColor="#64748B"
                        value={searchQuery}
                        onChangeText={setSearchQuery}
                    />
                </View>
            </View>

            {loading ? (
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
            ) : (
                <FlatList
                    data={filteredMovies}
                    keyExtractor={(item) => item._id}
                    renderItem={renderMovie}
                    contentContainerStyle={[styles.listContent, { paddingBottom: 130 }]}
                    showsVerticalScrollIndicator={false}
                />
            )}
            <BottomNav />
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
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
});

export default AdminMovieListScreen;
