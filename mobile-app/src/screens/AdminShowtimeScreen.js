import React, { useState, useEffect, useContext } from 'react';
import { StyleSheet, Text, View, ScrollView, Image, TouchableOpacity, Alert, SafeAreaView, ActivityIndicator, TextInput, Platform } from 'react-native';
import { AuthContext } from '../context/AuthContext';
import api from '../utils/api';
import { ArrowLeft, Trash2, Plus, Calendar as CalendarIcon, Clock, Edit2, Search } from 'lucide-react-native';

const AdminShowtimeScreen = ({ navigation }) => {
    const { token } = useContext(AuthContext);
    const [showtimes, setShowtimes] = useState([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchShowtimes();
        
        const unsubscribe = navigation.addListener('focus', () => {
            fetchShowtimes();
        });
        return unsubscribe;
    }, [navigation]);

    const fetchShowtimes = async () => {
        try {
            const res = await api.get('/showtimes');
            setShowtimes(res.data.data);
        } catch (err) {
            Alert.alert('Error', 'Failed to load showtimes');
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id) => {
        const executeDelete = async () => {
            try {
                const res = await api.delete(`/showtimes/${id}`, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                if (res.data.success) {
                    fetchShowtimes();
                    if (Platform.OS === 'web') window.alert('Showtime deleted successfully');
                }
            } catch (err) {
                if (Platform.OS === 'web') {
                    window.alert(err.response?.data?.error || 'Failed to delete showtime');
                } else {
                    Alert.alert('Error', err.response?.data?.error || 'Failed to delete showtime');
                }
            }
        };

        const { Platform } = require('react-native'); // Inline if missing
        if (Platform.OS === 'web') {
            if (window.confirm('Are you sure you want to remove this showtime?')) {
                executeDelete();
            }
        } else {
            Alert.alert('Delete', 'Are you sure you want to remove this showtime?', [
                { text: 'Cancel', style: 'cancel' },
                { text: 'Delete', style: 'destructive', onPress: executeDelete }
            ]);
        }
    };

    const renderGroupedShowtimes = () => {
        // Filter by search query
        const filteredShowtimes = showtimes.filter(st => {
            const title = st.movie?.title?.toLowerCase() || '';
            return title.includes(searchQuery.toLowerCase());
        });

        if (filteredShowtimes.length === 0) {
            return (
                <View style={styles.center}>
                    <Text style={styles.emptyText}>No results found for "{searchQuery}"</Text>
                </View>
            );
        }

        // Group showtimes by Movie ID
        const grouped = filteredShowtimes.reduce((acc, st) => {
            const mId = st.movie?._id || 'unknown';
            if (!acc[mId]) {
                acc[mId] = {
                    title: st.movie?.title || 'Unknown Movie',
                    poster: st.movie?.poster,
                    dates: []
                };
            }
            acc[mId].dates.push(st);
            return acc;
        }, {});

        return Object.values(grouped).map((group, index) => (
            <View key={index} style={styles.movieGroupCard}>
                <View style={styles.movieGroupHeader}>
                    {group.poster ? (
                        <Image 
                            source={{ uri: `http://192.168.8.106:5000/uploads/movies/${group.poster}` }} 
                            style={styles.groupPoster} 
                            resizeMode="cover"
                        />
                    ) : (
                        <View style={[styles.groupPoster, { backgroundColor: '#334155' }]} />
                    )}
                    <View style={{ flex: 1, marginLeft: 15 }}>
                        <Text style={styles.groupTitle}>{group.title}</Text>
                        <Text style={{ color: '#94A3B8', fontSize: 12 }}>{group.dates.length} Schedules Active</Text>
                    </View>
                </View>

                <View style={styles.schedulesContainer}>
                    {group.dates.sort((a,b) => new Date(a.date) - new Date(b.date)).map(st => {
                        const dateObj = new Date(st.date);
                        return (
                            <View key={st._id} style={styles.scheduleRow}>
                                <View style={{ flex: 1 }}>
                                    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                                        <CalendarIcon color="#3B82F6" size={14} />
                                        <Text style={styles.scheduleDate}>{dateObj.toDateString()}</Text>
                                    </View>
                                    <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 6, flexWrap: 'wrap' }}>
                                        <Clock color="#94A3B8" size={14} style={{ marginRight: 6 }} />
                                        {st.times.map((time, i) => (
                                            <View key={i} style={styles.timeBadge}><Text style={styles.timeBadgeText}>{time}</Text></View>
                                        ))}
                                    </View>
                                </View>
                                
                                <View style={{ alignItems: 'flex-end', justifyContent: 'space-between' }}>
                                    <Text style={styles.priceText}>Rs. {st.ticketPrice}</Text>
                                    <View style={{ flexDirection: 'row', marginTop: 10 }}>
                                        <TouchableOpacity 
                                            style={[styles.iconButton, { backgroundColor: 'rgba(59, 130, 246, 0.15)', marginRight: 10 }]} 
                                            onPress={() => navigation.navigate('EditShowtime', { showtime: st })}
                                        >
                                            <Edit2 color="#3B82F6" size={16} />
                                        </TouchableOpacity>
                                        <TouchableOpacity 
                                            style={[styles.iconButton, { backgroundColor: 'rgba(239, 68, 68, 0.15)' }]} 
                                            onPress={() => handleDelete(st._id)}
                                        >
                                            <Trash2 color="#EF4444" size={16} />
                                        </TouchableOpacity>
                                    </View>
                                </View>
                            </View>
                        );
                    })}
                </View>
            </View>
        ));
    };

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                    <ArrowLeft color="#fff" size={24} />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Showtimes Management</Text>
                <TouchableOpacity onPress={() => navigation.navigate('AddShowtime')} style={styles.addButton}>
                    <Plus color="#fff" size={24} />
                </TouchableOpacity>
            </View>

            <View style={styles.searchContainer}>
                <View style={styles.searchBar}>
                    <Search color="#94A3B8" size={20} />
                    <TextInput 
                        style={styles.searchInput}
                        placeholder="Search by Movie Name..."
                        placeholderTextColor="#94A3B8"
                        value={searchQuery}
                        onChangeText={setSearchQuery}
                    />
                </View>
            </View>

            {loading ? (
                <View style={styles.center}>
                    <ActivityIndicator size="large" color="#3B82F6" />
                </View>
            ) : showtimes.length === 0 ? (
                <View style={styles.center}>
                    <Text style={styles.emptyText}>No showtimes available. Add one!</Text>
                </View>
            ) : (
                <ScrollView contentContainerStyle={styles.listContent}>
                    {renderGroupedShowtimes()}
                </ScrollView>
            )}
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#0F172A' },
    header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 20, backgroundColor: '#1E293B' },
    headerTitle: { fontSize: 18, fontWeight: 'bold', color: '#fff' },
    backButton: { padding: 10, backgroundColor: 'rgba(255,255,255,0.05)', borderRadius: 12 },
    addButton: { padding: 10, backgroundColor: '#3B82F6', borderRadius: 12 },
    searchContainer: { paddingHorizontal: 20, marginBottom: 15 },
    searchBar: { flexDirection: 'row', backgroundColor: '#1E293B', padding: 12, borderRadius: 14, alignItems: 'center', borderWidth: 1, borderColor: '#334155' },
    searchInput: { flex: 1, marginLeft: 10, color: '#fff', fontSize: 16 },
    listContent: { padding: 20, paddingTop: 5 },
    movieGroupCard: { backgroundColor: '#1E293B', borderRadius: 20, marginBottom: 24, overflow: 'hidden', borderWidth: 1, borderColor: '#334155' },
    movieGroupHeader: { flexDirection: 'row', padding: 16, backgroundColor: 'rgba(255,255,255,0.02)', alignItems: 'center', borderBottomWidth: 1, borderBottomColor: '#334155' },
    groupPoster: { width: 50, height: 75, borderRadius: 8 },
    groupTitle: { fontSize: 18, fontWeight: 'bold', color: '#fff', marginBottom: 4 },
    schedulesContainer: { padding: 16 },
    scheduleRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 14, borderBottomWidth: 1, borderBottomColor: '#334155' },
    scheduleDate: { color: '#fff', fontSize: 15, fontWeight: 'bold', marginLeft: 8 },
    timeBadge: { backgroundColor: '#334155', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6, marginRight: 6, marginBottom: 6 },
    timeBadgeText: { color: '#CBD5E1', fontSize: 11, fontWeight: 'bold' },
    priceText: { color: '#10B981', fontWeight: 'bold', fontSize: 14 },
    iconButton: { padding: 8, borderRadius: 10 },
    center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    emptyText: { color: '#94A3B8', fontSize: 16 }
});

export default AdminShowtimeScreen;
