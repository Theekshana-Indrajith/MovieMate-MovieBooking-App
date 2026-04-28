import React, { useState, useContext, useEffect } from 'react';
import { StyleSheet, Text, View, TextInput, TouchableOpacity, ScrollView, Image, ActivityIndicator, Alert, SafeAreaView, Platform, StatusBar } from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';

import * as ImagePicker from 'expo-image-picker';
import { AuthContext } from '../context/AuthContext';
import api from '../utils/api';
import { Camera, Save, ArrowLeft, Plus, X, Film, Image as ImageIcon } from 'lucide-react-native';
import BASE_URL from '../utils/constants';

const EditMovieScreen = ({ route, navigation }) => {
    const { movie } = route.params;
    const { token } = useContext(AuthContext);

    const [title, setTitle] = useState(movie.title);
    const [description, setDescription] = useState(movie.description);
    const [duration, setDuration] = useState(movie.duration.toString());
    const [releaseDate, setReleaseDate] = useState(new Date(movie.releaseDate).toISOString().split('T')[0]);
    const [showDatePicker, setShowDatePicker] = useState(false);
    
    const onDateChange = (event, selectedDate) => {
        setShowDatePicker(false);
        if (selectedDate) {
            setReleaseDate(selectedDate.toISOString().split('T')[0]);
        }
    };

    // Multi-Image Support
    const [poster, setPoster] = useState({ uri: `${BASE_URL}/uploads/movies/${movie.poster}`, old: true });
    const [backdrop, setBackdrop] = useState({ uri: `${BASE_URL}/uploads/movies/${movie.backdrop || 'no-backdrop.jpg'}`, old: true });

    // Genre Tags
    const [selectedGenres, setSelectedGenres] = useState(movie.genre.split(',').map(s => s.trim()));
    const availableGenres = ['Action', 'Thriller', 'Comedy', 'Drama', 'Horror', 'Sci-Fi', 'Romance', 'Adventure'];

    // Cast & Crew
    const [cast, setCast] = useState(movie.cast || []);
    const [currentCast, setCurrentCast] = useState('');

    const [loading, setLoading] = useState(false);

    const pickImage = async (type) => {
        let result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ['images'],
            allowsEditing: true,
            aspect: type === 'poster' ? [2, 3] : [16, 9],
            quality: 0.8,
        });

        if (!result.canceled) {
            if (type === 'poster') setPoster({ ...result.assets[0], old: false });
            else setBackdrop({ ...result.assets[0], old: false });
        }
    };

    const toggleGenre = (genre) => {
        if (selectedGenres.includes(genre)) {
            setSelectedGenres(selectedGenres.filter(g => g !== genre));
        } else {
            setSelectedGenres([...selectedGenres, genre]);
        }
    };

    const addCast = () => {
        if (!currentCast.trim()) return;

        // Validation: Prevent purely numeric entries for names
        if (/^\d+$/.test(currentCast.trim())) {
            Alert.alert('Invalid Name', 'Cast/Crew names cannot be just numbers');
            return;
        }

        setCast([...cast, currentCast.trim()]);
        setCurrentCast('');
    };

    const removeCast = (index) => {
        setCast(cast.filter((_, i) => i !== index));
    };

    const handleUpdate = async () => {
        if (isNaN(Number(duration)) || Number(duration) < 20) {
            Alert.alert('Invalid Duration', 'Movie duration must be at least 20 minutes.');
            return;
        }

        if (!title || !description || selectedGenres.length === 0) {
            Alert.alert('Error', 'Please fill in all required fields');
            return;
        }

        if (title.trim().length < 2) {
            Alert.alert('Invalid Title', 'Movie title must be at least 2 characters long.');
            return;
        }

        if (/^\d+$/.test(title.trim())) {
            Alert.alert('Invalid Title', 'Movie title cannot be just numbers.');
            return;
        }

        setLoading(true);

        const formData = new FormData();
        formData.append('title', title);
        formData.append('description', description);
        formData.append('genre', selectedGenres.join(', '));
        formData.append('duration', duration);
        formData.append('releaseDate', releaseDate);

        cast.forEach(c => formData.append('cast', c));

        // Poster change logic
        if (!poster.old) {
            if (Platform.OS === 'web') {
                const res = await fetch(poster.uri);
                const blob = await res.blob();
                formData.append('poster', blob, 'poster.jpg');
            } else {
                formData.append('poster', { uri: poster.uri, name: 'poster.jpg', type: 'image/jpeg' });
            }
        }

        // Backdrop change logic
        if (!backdrop.old) {
            if (Platform.OS === 'web') {
                const res = await fetch(backdrop.uri);
                const blob = await res.blob();
                formData.append('backdrop', blob, 'backdrop.jpg');
            } else {
                formData.append('backdrop', { uri: backdrop.uri, name: 'backdrop.jpg', type: 'image/jpeg' });
            }
        }

        try {
            const res = await api.put(`/movies/${movie._id}`, formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                    'Authorization': `Bearer ${token}`
                }
            });

            if (res.data.success) {
                Alert.alert('Success', 'Movie updated successfully!');
                navigation.goBack();
            }
        } catch (err) {
            Alert.alert('Error', err.response?.data?.error || 'Failed to update movie');
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
                <Text style={styles.headerTitle}>Update Movie Info</Text>
                <View style={{ width: 44 }} />
            </View>

            <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>

                <Text style={styles.sectionLabel}>Media Update</Text>
                <View style={styles.imageSection}>
                    <View style={{ flex: 1, marginRight: 12 }}>
                        <Text style={styles.inputLabel}>Poster</Text>
                        <TouchableOpacity style={styles.posterPicker} onPress={() => pickImage('poster')}>
                            <Image source={{ uri: poster.uri }} style={styles.previewImage} />
                            <View style={styles.editBadge}><Camera color="#fff" size={14} /></View>
                        </TouchableOpacity>
                    </View>
                    <View style={{ flex: 1.6 }}>
                        <Text style={styles.inputLabel}>Backdrop</Text>
                        <TouchableOpacity style={styles.backdropPicker} onPress={() => pickImage('backdrop')}>
                            <Image source={{ uri: backdrop.uri }} style={styles.previewImage} />
                            <View style={styles.editBadge}><Camera color="#fff" size={14} /></View>
                        </TouchableOpacity>
                    </View>
                </View>

                <View style={[styles.formContainer, { marginTop: 15 }]}>
                    <Text style={styles.inputLabel}>Title</Text>
                    <TextInput style={styles.input} value={title} onChangeText={setTitle} placeholderTextColor="#475569" />

                    <Text style={styles.inputLabel}>Description</Text>
                    <TextInput style={[styles.input, { height: 80, textAlignVertical: 'top' }]} multiline value={description} onChangeText={setDescription} placeholderTextColor="#475569" />

                    <Text style={styles.inputLabel}>Edit Genres</Text>
                    <View style={styles.genreContainer}>
                        {availableGenres.map(g => (
                            <TouchableOpacity key={g} style={[styles.genreTag, selectedGenres.includes(g) && styles.genreTagActive]} onPress={() => toggleGenre(g)}>
                                <Text style={[styles.genreText, selectedGenres.includes(g) && styles.genreTextActive]}>{g}</Text>
                            </TouchableOpacity>
                        ))}
                    </View>

                    <View style={styles.row}>
                        <View style={{ flex: 1, marginRight: 15 }}>
                            <Text style={styles.inputLabel}>Duration (mins)</Text>
                            <TextInput style={styles.input} value={duration} onChangeText={setDuration} keyboardType="numeric" placeholderTextColor="#475569" />
                        </View>
                        <View style={{ flex: 1 }}>
                            <Text style={styles.inputLabel}>Release Date</Text>
                            {Platform.OS === 'web' ? (
                                <TextInput style={styles.input} value={releaseDate} onChangeText={setReleaseDate} placeholder="YYYY-MM-DD" placeholderTextColor="#475569" />
                            ) : (
                                <>
                                    <TouchableOpacity onPress={() => setShowDatePicker(true)} style={[styles.input, { justifyContent: 'center' }]}>
                                        <Text style={{ color: '#fff' }}>{releaseDate}</Text>
                                    </TouchableOpacity>
                                    {showDatePicker && (
                                        <DateTimePicker
                                            value={new Date(releaseDate)}
                                            mode="date"
                                            display="default"
                                            minimumDate={new Date()} // Prevent past dates
                                            onChange={onDateChange}
                                        />
                                    )}
                                </>
                            )}
                        </View>
                    </View>

                    <Text style={styles.inputLabel}>Cast & Crew</Text>
                    <View style={styles.castInputRow}>
                        <TextInput style={[styles.input, { flex: 1, marginBottom: 0 }]} value={currentCast} onChangeText={setCurrentCast} placeholder="Add actor..." placeholderTextColor="#475569" />
                        <TouchableOpacity style={styles.addCastBtn} onPress={addCast}><Plus color="#fff" size={20} /></TouchableOpacity>
                    </View>
                    <View style={styles.castList}>
                        {cast.map((c, i) => (
                            <View key={i} style={styles.castTag}><Text style={styles.castTagText}>{c}</Text><TouchableOpacity onPress={() => removeCast(i)}><X color="#94A3B8" size={14} /></TouchableOpacity></View>
                        ))}
                    </View>

                    <TouchableOpacity style={styles.saveButton} onPress={handleUpdate} disabled={loading}>
                        {loading ? <ActivityIndicator color="#fff" /> : <><Save color="#fff" size={20} /><Text style={styles.saveButtonText}>Update Movie</Text></>}
                    </TouchableOpacity>
                </View>
                <View style={{ height: 40 }} />
            </ScrollView>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#0A0F1D' },
    header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 20, backgroundColor: '#161B2E', borderBottomLeftRadius: 24, borderBottomRightRadius: 24 },
    headerTitle: { fontSize: 18, fontWeight: 'bold', color: '#fff' },
    backButton: { padding: 10, backgroundColor: 'rgba(255,255,255,0.05)', borderRadius: 12 },
    scrollContent: { padding: 20 },
    sectionLabel: { fontSize: 13, color: '#6366F1', fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 15 },
    imageSection: { flexDirection: 'row' },
    posterPicker: { height: 160, backgroundColor: '#161B2E', borderRadius: 20, borderWidth: 1, borderColor: '#1F2937', overflow: 'hidden' },
    backdropPicker: { height: 160, backgroundColor: '#161B2E', borderRadius: 20, borderWidth: 1, borderColor: '#1F2937', overflow: 'hidden' },
    previewImage: { width: '100%', height: '100%' },
    editBadge: { position: 'absolute', bottom: 10, right: 10, padding: 8, backgroundColor: '#6366F1', borderRadius: 10 },
    inputLabel: { fontSize: 14, color: '#94A3B8', fontWeight: '600', marginBottom: 8, marginLeft: 4 },
    input: { backgroundColor: '#161B2E', borderRadius: 16, padding: 15, color: '#fff', fontSize: 15, marginBottom: 20, borderWidth: 1, borderColor: '#1F2937' },
    row: { flexDirection: 'row' },
    genreContainer: { flexDirection: 'row', flexWrap: 'wrap', marginBottom: 15 },
    genreTag: { paddingHorizontal: 14, paddingVertical: 8, backgroundColor: '#161B2E', borderRadius: 12, marginRight: 8, marginBottom: 8, borderWidth: 1, borderColor: '#1F2937' },
    genreTagActive: { backgroundColor: '#6366F1', borderColor: '#6366F1' },
    genreText: { color: '#94A3B8', fontSize: 12, fontWeight: 'bold' },
    genreTextActive: { color: '#fff' },
    castInputRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 15 },
    addCastBtn: { width: 50, height: 50, backgroundColor: '#6366F1', borderRadius: 16, marginLeft: 12, justifyContent: 'center', alignItems: 'center' },
    castList: { flexDirection: 'row', flexWrap: 'wrap', marginBottom: 20 },
    castTag: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#161B2E', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 10, marginRight: 8, marginBottom: 8, borderWidth: 1, borderColor: '#1F2937' },
    castTagText: { color: '#CBD5E1', fontSize: 12, marginRight: 8 },
    saveButton: { flexDirection: 'row', backgroundColor: '#6366F1', padding: 18, borderRadius: 20, justifyContent: 'center', alignItems: 'center', marginTop: 10 },
    saveButtonText: { color: '#fff', fontSize: 16, fontWeight: 'bold', marginLeft: 12 }
});

export default EditMovieScreen;
