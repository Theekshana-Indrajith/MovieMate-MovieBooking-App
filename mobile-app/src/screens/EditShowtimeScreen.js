import React, { useState, useEffect, useContext } from 'react';
import { StyleSheet, Text, View, TextInput, TouchableOpacity, ScrollView, Alert, SafeAreaView, ActivityIndicator, Platform } from 'react-native';
import { AuthContext } from '../context/AuthContext';
import api from '../utils/api';
import { ArrowLeft, Save, Check } from 'lucide-react-native';

const EditShowtimeScreen = ({ route, navigation }) => {
    const { showtime } = route.params;
    const { token } = useContext(AuthContext);

    const [movies, setMovies] = useState([]);
    const [selectedMovie, setSelectedMovie] = useState(showtime.movie?._id || showtime.movie);
    const [date, setDate] = useState(new Date(showtime.date).toISOString().split('T')[0]);
    const [endDate, setEndDate] = useState(''); // Allow extending
    const [times, setTimes] = useState(showtime.times.join(', '));
    const [price, setPrice] = useState(showtime.ticketPrice.toString());
    const [loading, setLoading] = useState(false);
    const [fetching, setFetching] = useState(true);

    useEffect(() => {
        api.get('/movies')
            .then(res => {
                setMovies(res.data.data);
                setFetching(false);
            })
            .catch(err => {
                setFetching(false);
            });
    }, []);

    const handleUpdate = async () => {
        if (!selectedMovie || !date || !times || !price) {
            Alert.alert('Error', 'Please fill in all required fields and select a movie');
            return;
        }

        setLoading(true);
        const timesArray = times.split(',').map(t => t.trim()).filter(t => t !== '');

        const payload = {
            movie: selectedMovie,
            date,
            ...(endDate ? { endDate } : {}),
            times: timesArray,
            ticketPrice: Number(price)
        };

        try {
            const res = await api.put(`/showtimes/${showtime._id}`, payload, {
                headers: { Authorization: `Bearer ${token}` }
            });
            if (res.data.success) {
                if (Platform.OS === 'web') {
                    window.alert('Showtime updated successfully!');
                    navigation.goBack();
                } else {
                    Alert.alert('Success', 'Showtime updated successfully!', [
                        { text: 'OK', onPress: () => navigation.goBack() }
                    ]);
                }
            }
        } catch (err) {
            Alert.alert('Error', err.response?.data?.error || 'Something went wrong');
        } finally {
            setLoading(false);
        }
    };

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                    <ArrowLeft color="#fff" size={24} />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Edit Showtime</Text>
                <View style={{ width: 44 }} />
            </View>

            <ScrollView contentContainerStyle={styles.content}>
                <Text style={styles.label}>Select Movie *</Text>
                {fetching ? <ActivityIndicator color="#8B5CF6" style={{ marginBottom: 20 }}/> : (
                    <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.movieSelector}>
                        {movies.map(movie => (
                            <TouchableOpacity 
                                key={movie._id} 
                                style={[styles.movieChip, selectedMovie === movie._id && styles.movieChipSelected]}
                                onPress={() => setSelectedMovie(movie._id)}
                            >
                                <Text style={[styles.movieChipText, selectedMovie === movie._id && styles.movieChipTextSelected]}>
                                    {movie.title}
                                </Text>
                                {selectedMovie === movie._id && <Check color="#fff" size={16} style={{ marginLeft: 5 }}/>}
                            </TouchableOpacity>
                        ))}
                    </ScrollView>
                )}

                <View style={{ flexDirection: 'row', gap: 10 }}>
                    <View style={{ flex: 1 }}>
                        <Text style={styles.label}>Date *</Text>
                        <TextInput style={styles.input} value={date} onChangeText={setDate} placeholderTextColor="#64748B" />
                    </View>
                    <View style={{ flex: 1 }}>
                        <Text style={styles.label}>Extend Until (Opt)</Text>
                        <TextInput style={styles.input} value={endDate} onChangeText={setEndDate} placeholder="2026-04-16" placeholderTextColor="#64748B" />
                    </View>
                </View>
                <Text style={{ color: '#64748B', fontSize: 12, marginBottom: 20, marginTop: -15, marginLeft: 5 }}>
                    Provide an 'Extend Until' date to duplicate this showtime to future dates.
                </Text>

                <Text style={styles.label}>Showtimes (Comma Separated) *</Text>
                <TextInput style={styles.input} value={times} onChangeText={setTimes} placeholderTextColor="#64748B" />

                <Text style={styles.label}>Ticket Price (Rs.) *</Text>
                <TextInput style={styles.input} value={price} onChangeText={setPrice} keyboardType="numeric" placeholderTextColor="#64748B" />

                <TouchableOpacity style={styles.saveButton} onPress={handleUpdate} disabled={loading || fetching}>
                    {loading ? <ActivityIndicator color="#fff" /> : <><Save color="#fff" size={20} /><Text style={styles.saveBtnText}>Update Showtime</Text></>}
                </TouchableOpacity>
            </ScrollView>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#0F172A' },
    header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 20, backgroundColor: '#1E293B' },
    headerTitle: { fontSize: 18, fontWeight: 'bold', color: '#fff' },
    backButton: { padding: 10, backgroundColor: 'rgba(255,255,255,0.05)', borderRadius: 12 },
    content: { padding: 24 },
    label: { fontSize: 14, fontWeight: 'bold', color: '#CBD5E1', marginBottom: 12 },
    input: { backgroundColor: '#1E293B', borderRadius: 14, padding: 16, color: '#fff', marginBottom: 24, borderWidth: 1, borderColor: '#334155' },
    movieSelector: { flexDirection: 'row', marginBottom: 24 },
    movieChip: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#1E293B', paddingHorizontal: 16, paddingVertical: 12, borderRadius: 20, marginRight: 10, borderWidth: 1, borderColor: '#334155' },
    movieChipSelected: { backgroundColor: '#8B5CF6', borderColor: '#8B5CF6' },
    movieChipText: { color: '#94A3B8', fontWeight: '600' },
    movieChipTextSelected: { color: '#fff' },
    saveButton: { flexDirection: 'row', backgroundColor: '#8B5CF6', padding: 18, borderRadius: 16, justifyContent: 'center', alignItems: 'center', marginTop: 10 },
    saveBtnText: { color: '#fff', fontSize: 16, fontWeight: 'bold', marginLeft: 10 }
});

export default EditShowtimeScreen;
