import React, { useState, useEffect, useContext } from 'react';
import { StyleSheet, Text, View, TextInput, TouchableOpacity, ScrollView, Alert, SafeAreaView, ActivityIndicator, Platform, StatusBar } from 'react-native';
import { AuthContext } from '../context/AuthContext';
import * as ImagePicker from 'expo-image-picker';
import api from '../utils/api';
import { ArrowLeft, Save, Check, Calendar, Clock, Banknote, Image as ImageIcon, Camera, Trash2 } from 'lucide-react-native';
import { Image } from 'react-native';

const AddShowtimeScreen = ({ navigation }) => {
    const { token } = useContext(AuthContext);
    const [movies, setMovies] = useState([]);
    const [selectedMovie, setSelectedMovie] = useState('');
    const [date, setDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const [times, setTimes] = useState('');
    const [price, setPrice] = useState('');
    const [image, setImage] = useState(null);
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

    const validateDate = (dateStr) => {
        const reg = /^\d{4}-\d{2}-\d{2}$/;
        if (!dateStr.match(reg)) return false;

        const inputDate = new Date(dateStr);
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        return inputDate >= today;
    };
    const pickImage = async () => {
        let result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ['images'],
            allowsEditing: true,
            aspect: [16, 9],
            quality: 0.7,
        });
        if (!result.canceled) {
            setImage(result.assets[0]);
        }
    };
    const handleSave = async () => {
        if (!selectedMovie || !date || !times || !price) {
            Alert.alert('Error', 'Please fill in all required fields!');
            return;
        }

        if (!validateDate(date)) {
            Alert.alert('Invalid Date', 'Please enter a current or future date (YYYY-MM-DD).');
            return;
        }

        if (isNaN(Number(price)) || Number(price) <= 0) {
            Alert.alert('Invalid Price', 'Please enter a valid ticket price.');
            return;
        }

        if (endDate && new Date(endDate) < new Date(date)) {
            Alert.alert('Invalid Range', 'End date cannot be before start date.');
            return;
        }

        setLoading(true);
        const timesArray = times.split(',').map(t => t.trim()).filter(t => t !== '');

        const formData = new FormData();
        formData.append('movie', selectedMovie);
        formData.append('date', date);
        if (endDate) formData.append('endDate', endDate);
        timesArray.forEach(t => formData.append('times[]', t)); // Backend inserts array
        formData.append('ticketPrice', price);

        if (image) {
            if (Platform.OS === 'web') {
                const res = await fetch(image.uri);
                const blob = await res.blob();
                formData.append('showtimeImage', blob, 'theater.jpg');
            } else {
                formData.append('showtimeImage', { uri: image.uri, name: 'theater.jpg', type: 'image/jpeg' });
            }
        }

        try {
            const res = await api.post('/showtimes', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                    'Authorization': `Bearer ${token}`
                }
            });
            if (res.data.success) {
                if (Platform.OS === 'web') {
                    window.alert('Showtime added successfully!');
                    navigation.goBack();
                } else {
                    Alert.alert('Success', 'Showtime added!', [{ text: 'OK', onPress: () => navigation.goBack() }]);
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
            <StatusBar barStyle="light-content" />
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                    <ArrowLeft color="#fff" size={24} />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Configure Showtimes</Text>
                <View style={{ width: 44 }} />
            </View>

            <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
                <Text style={styles.sectionLabel}>1. Select Movie</Text>
                {fetching ? <ActivityIndicator color="#6366F1" style={{ marginVertical: 20 }} /> : (
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
                                {selectedMovie === movie._id && <Check color="#fff" size={14} style={{ marginLeft: 6 }} />}
                            </TouchableOpacity>
                        ))}
                    </ScrollView>
                )}

                <Text style={styles.sectionLabel}>2. Schedule & Timing</Text>
                <View style={styles.formCard}>
                    <View style={styles.row}>
                        <View style={{ flex: 1, marginRight: 10 }}>
                            <Text style={styles.inputLabel}>Start Date</Text>
                            <View style={styles.inputWrapper}>
                                <Calendar color="#64748B" size={18} />
                                <TextInput style={styles.input} value={date} onChangeText={setDate} placeholder="2026-04-12" placeholderTextColor="#475569" />
                            </View>
                        </View>
                        <View style={{ flex: 1 }}>
                            <Text style={styles.inputLabel}>End Date (Opt)</Text>
                            <View style={styles.inputWrapper}>
                                <Calendar color="#64748B" size={18} />
                                <TextInput style={styles.input} value={endDate} onChangeText={setEndDate} placeholder="2026-04-16" placeholderTextColor="#475569" />
                            </View>
                        </View>
                    </View>

                    <Text style={styles.inputLabel}>Showtimes (e.g. 10:30 AM, 02:30 PM)</Text>
                    <View style={styles.inputWrapper}>
                        <Clock color="#64748B" size={18} />
                        <TextInput style={styles.input} value={times} onChangeText={setTimes} placeholder="10:30 AM, 02:30 PM" placeholderTextColor="#475569" />
                    </View>

                    <Text style={styles.inputLabel}>Ticket Price (Rs.)</Text>
                    <View style={styles.inputWrapper}>
                        <Banknote color="#64748B" size={18} />
                        <TextInput style={styles.input} value={price} onChangeText={setPrice} keyboardType="numeric" placeholder="1500" placeholderTextColor="#475569" />
                    </View>
                </View>

                <Text style={styles.sectionLabel}>3. Venue Visualization</Text>
                <View style={styles.assignmentNote}>
                    <Text style={styles.noteText}>This allows admins to upload theater hall layouts.</Text>
                </View>

                <TouchableOpacity style={styles.imagePicker} onPress={pickImage}>
                    {image ? (
                        <View style={{ width: '100%', height: '100%' }}>
                            <Image source={{ uri: image.uri }} style={styles.imagePreview} />
                            <TouchableOpacity style={styles.removeImg} onPress={() => setImage(null)}>
                                <Trash2 color="#fff" size={16} />
                            </TouchableOpacity>
                        </View>
                    ) : (
                        <View style={styles.pickerPlaceholder}>
                            <ImageIcon color="#6366F1" size={32} />
                            <Text style={styles.pickerText}>Upload Theater Hall Layout / Interior Photo</Text>
                            <Text style={styles.pickerSub}>Provides users a visual of where they will watch</Text>
                        </View>
                    )}
                </TouchableOpacity>

                <TouchableOpacity style={styles.saveButton} onPress={handleSave} disabled={loading || fetching}>
                    {loading ? <ActivityIndicator color="#fff" /> : (
                        <><Save color="#fff" size={20} /><Text style={styles.saveBtnText}>Publish Showtimes</Text></>
                    )}
                </TouchableOpacity>
                <View style={{ height: 40 }} />
            </ScrollView>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#0A0F1D' },
    header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 20, paddingTop: 20, backgroundColor: '#161B2E', borderBottomLeftRadius: 32, borderBottomRightRadius: 32 },
    headerTitle: { fontSize: 18, fontWeight: 'bold', color: '#fff' },
    backButton: { padding: 10, backgroundColor: 'rgba(255,255,255,0.05)', borderRadius: 12 },
    content: { padding: 24 },
    sectionLabel: { fontSize: 13, color: '#6366F1', fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 15 },
    formCard: { backgroundColor: '#161B2E', padding: 20, borderRadius: 24, borderWidth: 1, borderColor: '#1F2937', marginBottom: 25 },
    inputLabel: { fontSize: 14, color: '#94A3B8', fontWeight: 'bold', marginBottom: 10, marginLeft: 4 },
    inputWrapper: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#0A0F1D', borderRadius: 16, paddingHorizontal: 16, marginBottom: 20, borderWidth: 1, borderColor: '#1F2937' },
    input: { flex: 1, padding: 14, color: '#fff', fontSize: 15, marginLeft: 10 },
    row: { flexDirection: 'row' },
    movieSelector: { flexDirection: 'row', marginBottom: 30 },
    movieChip: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#161B2E', paddingHorizontal: 18, paddingVertical: 14, borderRadius: 18, marginRight: 10, borderWidth: 1, borderColor: '#1F2937' },
    movieChipSelected: { backgroundColor: '#6366F1', borderColor: '#6366F1' },
    movieChipText: { color: '#94A3B8', fontWeight: 'bold' },
    movieChipTextSelected: { color: '#fff' },
    saveButton: { flexDirection: 'row', backgroundColor: '#6366F1', padding: 18, borderRadius: 20, justifyContent: 'center', alignItems: 'center', shadowColor: '#6366F1', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 8 },
    saveBtnText: { color: '#fff', fontSize: 16, fontWeight: 'bold', marginLeft: 10 },
    assignmentNote: { backgroundColor: 'rgba(99, 102, 241, 0.1)', padding: 12, borderRadius: 12, marginBottom: 15, borderLeftWidth: 3, borderLeftColor: '#6366F1' },
    noteText: { color: '#94A3B8', fontSize: 11, fontStyle: 'italic' },
    imagePicker: { height: 180, backgroundColor: '#161B2E', borderRadius: 24, borderStyle: 'dashed', borderWidth: 1, borderColor: '#1F2937', overflow: 'hidden', marginBottom: 25, justifyContent: 'center', alignItems: 'center' },
    pickerPlaceholder: { alignItems: 'center', padding: 20 },
    pickerText: { color: '#fff', fontSize: 13, fontWeight: 'bold', marginTop: 12, textAlign: 'center' },
    pickerSub: { color: '#64748B', fontSize: 11, marginTop: 4, textAlign: 'center' },
    imagePreview: { width: '100%', height: '100%' },
    removeImg: { position: 'absolute', top: 15, right: 15, backgroundColor: '#EF4444', padding: 8, borderRadius: 10 }
});

export default AddShowtimeScreen;
