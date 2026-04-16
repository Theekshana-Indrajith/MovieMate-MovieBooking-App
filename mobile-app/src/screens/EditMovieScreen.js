import React, { useState, useContext } from 'react';
<<<<<<< HEAD
import { StyleSheet, Text, View, TextInput, TouchableOpacity, ScrollView, Image, ActivityIndicator, Alert, SafeAreaView, Platform } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { AuthContext } from '../context/AuthContext';
import api from '../utils/api';
import { Camera, Save, ArrowLeft } from 'lucide-react-native';
=======
import { StyleSheet, Text, View, TextInput, TouchableOpacity, ScrollView, Image, ActivityIndicator, Alert, SafeAreaView, Platform, StatusBar } from 'react-native';

import * as ImagePicker from 'expo-image-picker';
import { AuthContext } from '../context/AuthContext';
import api from '../utils/api';
import { Camera, Save, ArrowLeft, Plus, X, Users, Film } from 'lucide-react-native';
import BASE_URL from '../utils/constants';
>>>>>>> origin/theekshana-IT24102753

const EditMovieScreen = ({ route, navigation }) => {
    const { movie } = route.params;
    const { token } = useContext(AuthContext);

<<<<<<< HEAD
    // Populate state with existing movie data
    const [title, setTitle] = useState(movie.title);
    const [description, setDescription] = useState(movie.description);
    const [genre, setGenre] = useState(movie.genre);
    const [duration, setDuration] = useState(movie.duration.toString());
    const [releaseDate, setReleaseDate] = useState(new Date(movie.releaseDate).toISOString().split('T')[0]);
    const [image, setImage] = useState({ uri: `http://192.168.8.106:5000/uploads/movies/${movie.poster}`, old: true });
    const [loading, setLoading] = useState(false);

    const pickImage = async () => {
        let result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ['images'],
            allowsEditing: true,
            aspect: [2, 3], 
            quality: 1,
        });

        if (!result.canceled) {
            setImage({ ...result.assets[0], old: false });
        }
    };

    const handleUpdate = async () => {
        if (!title || !description || !genre || !duration) {
=======
    const [title, setTitle] = useState(movie.title);
    const [description, setDescription] = useState(movie.description);
    const [duration, setDuration] = useState(movie.duration.toString());
    const [releaseDate, setReleaseDate] = useState(new Date(movie.releaseDate).toISOString().split('T')[0]);
    
    // Multi-Image Support
    const [poster, setPoster] = useState({ uri: `${BASE_URL}/uploads/movies/${movie.poster}`, old: true });
    const [backdrop, setBackdrop] = useState({ uri: `${BASE_URL}/uploads/movies/${movie.backdrop}`, old: true });
    
    // Genre Tags
    const [selectedGenres, setSelectedGenres] = useState(movie.genre.split(',').map(g => g.trim()));
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
        if (selectedGenres.includes(genre)) setSelectedGenres(selectedGenres.filter(g => g !== genre));
        else setSelectedGenres([...selectedGenres, genre]);
    };

    const addCast = () => {
        if (currentCast.trim()) {
            setCast([...cast, currentCast.trim()]);
            setCurrentCast('');
        }
    };

    const removeCast = (index) => setCast(cast.filter((_, i) => i !== index));

    const handleUpdate = async () => {
        if (!title || !description || selectedGenres.length === 0) {
>>>>>>> origin/theekshana-IT24102753
            Alert.alert('Error', 'Please fill in all text fields');
            return;
        }

        setLoading(true);

        const formData = new FormData();
        formData.append('title', title);
        formData.append('description', description);
<<<<<<< HEAD
        formData.append('genre', genre);
        formData.append('duration', duration);
        formData.append('releaseDate', releaseDate);

        // Only append new image if selected
        if (!image.old) {
            if (Platform.OS === 'web') {
                const response = await fetch(image.uri);
                const blob = await response.blob();
                formData.append('poster', blob, 'poster.jpg');
            } else {
                const filename = image.uri.split('/').pop();
                const match = /\.(\w+)$/.exec(filename);
                const type = match ? `image/${match[1]}` : `image`;

                formData.append('poster', {
                    uri: image.uri,
                    name: filename,
                    type: type
                });
=======
        formData.append('genre', selectedGenres.join(', '));
        formData.append('duration', duration);
        formData.append('releaseDate', releaseDate);
        cast.forEach(c => formData.append('cast', c));

        // Poster
        if (!poster.old) {
            if (Platform.OS === 'web') {
                const res = await fetch(poster.uri);
                const blob = await res.blob();
                formData.append('poster', blob, 'poster.jpg');
            } else {
                formData.append('poster', { uri: poster.uri, name: 'poster.jpg', type: 'image/jpeg' });
            }
        }

        // Backdrop
        if (!backdrop.old) {
            if (Platform.OS === 'web') {
                const res = await fetch(backdrop.uri);
                const blob = await res.blob();
                formData.append('backdrop', blob, 'backdrop.jpg');
            } else {
                formData.append('backdrop', { uri: backdrop.uri, name: 'backdrop.jpg', type: 'image/jpeg' });
>>>>>>> origin/theekshana-IT24102753
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
<<<<<<< HEAD
                if (Platform.OS === 'web') {
                    window.alert('Movie updated successfully!');
                    navigation.goBack();
                } else {
                    Alert.alert('Success', 'Movie updated successfully!', [
                        { text: 'OK', onPress: () => navigation.goBack() }
                    ]);
                }
            }
        } catch (err) {
            Alert.alert('Error', err.response?.data?.error || 'Something went wrong');
=======
                Alert.alert('Success', 'Movie updated successfully!');
                navigation.goBack();
            }
        } catch (err) {
            Alert.alert('Error', err.response?.data?.error || 'Failed to update');
>>>>>>> origin/theekshana-IT24102753
        } finally {
            setLoading(false);
        }
    };

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
                <Text style={styles.headerTitle}>Edit Movie</Text>
                <View style={{ width: 48 }} />
            </View>

            <ScrollView contentContainerStyle={styles.scrollContent}>
                <TouchableOpacity style={styles.imagePicker} onPress={pickImage}>
                    <Image source={{ uri: image.uri }} style={styles.previewImage} />
                    <View style={styles.overlayCam}>
                        <Camera color="#fff" size={32} />
                    </View>
                </TouchableOpacity>

                <View style={styles.form}>
                    <Text style={styles.label}>Movie Title</Text>
                    <TextInput style={styles.input} value={title} onChangeText={setTitle} placeholderTextColor="#64748B" />

                    <Text style={styles.label}>Description</Text>
                    <TextInput style={[styles.input, { height: 100 }]} multiline value={description} onChangeText={setDescription} placeholderTextColor="#64748B" />

                    <View style={styles.row}>
                        <View style={{ flex: 1, marginRight: 10 }}>
                            <Text style={styles.label}>Genre</Text>
                            <TextInput style={styles.input} value={genre} onChangeText={setGenre} placeholderTextColor="#64748B" />
                        </View>
                        <View style={{ flex: 1 }}>
                            <Text style={styles.label}>Duration (Min)</Text>
                            <TextInput style={styles.input} value={duration} onChangeText={setDuration} keyboardType="numeric" placeholderTextColor="#64748B" />
                        </View>
                    </View>

                    <Text style={styles.label}>Release Date</Text>
                    <TextInput style={styles.input} value={releaseDate} onChangeText={setReleaseDate} placeholderTextColor="#64748B" />

                    <TouchableOpacity style={styles.saveButton} onPress={handleUpdate} disabled={loading}>
                        {loading ? <ActivityIndicator color="#fff" /> : <><Save color="#fff" size={20} /><Text style={styles.saveButtonText}>Update Movie</Text></>}
                    </TouchableOpacity>
                </View>
=======
                <Text style={styles.headerTitle}>Update Movie Registry</Text>
                <View style={{ width: 44 }} />
            </View>

            <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
                
                <Text style={styles.sectionLabel}>Movie Visuals</Text>
                <View style={styles.imageSection}>
                    <View style={{ flex: 1, marginRight: 15 }}>
                        <Text style={styles.inputLabel}>Poster</Text>
                        <TouchableOpacity style={styles.posterPicker} onPress={() => pickImage('poster')}>
                            <Image source={{ uri: poster.uri }} style={styles.previewImage} />
                            <View style={styles.camOverlay}><Camera color="#fff" size={16} /></View>
                        </TouchableOpacity>
                    </View>
                    <View style={{ flex: 1.5 }}>
                        <Text style={styles.inputLabel}>Backdrop</Text>
                        <TouchableOpacity style={styles.backdropPicker} onPress={() => pickImage('backdrop')}>
                            <Image source={{ uri: backdrop.uri }} style={styles.previewImage} />
                            <View style={styles.camOverlay}><Camera color="#fff" size={16} /></View>
                        </TouchableOpacity>
                    </View>
                </View>

                <View style={styles.formContainer}>
                    <Text style={styles.inputLabel}>Title</Text>
                    <TextInput style={styles.input} value={title} onChangeText={setTitle} placeholderTextColor="#475569" />

                    <Text style={styles.inputLabel}>Description</Text>
                    <TextInput style={[styles.input, { height: 80, textAlignVertical: 'top' }]} multiline value={description} onChangeText={setDescription} placeholderTextColor="#475569" />

                    <Text style={styles.inputLabel}>Genres</Text>
                    <View style={styles.genreContainer}>
                        {availableGenres.map(g => (
                            <TouchableOpacity key={g} style={[styles.genreTag, selectedGenres.includes(g) && styles.genreTagActive]} onPress={() => toggleGenre(g)}>
                                <Text style={[styles.genreText, selectedGenres.includes(g) && styles.genreTextActive]}>{g}</Text>
                            </TouchableOpacity>
                        ))}
                    </View>

                    <View style={styles.row}>
                        <View style={{ flex: 1, marginRight: 15 }}><Text style={styles.inputLabel}>Duration</Text><TextInput style={styles.input} value={duration} onChangeText={setDuration} keyboardType="numeric" placeholderTextColor="#475569" /></View>
                        <View style={{ flex: 1 }}><Text style={styles.inputLabel}>Release</Text><TextInput style={styles.input} value={releaseDate} onChangeText={setReleaseDate} placeholderTextColor="#475569" /></View>
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
                        {loading ? <ActivityIndicator color="#fff" /> : <><Save color="#fff" size={20} /><Text style={styles.saveButtonText}>Apply Changes</Text></>}
                    </TouchableOpacity>
                </View>
                <View style={{ height: 40 }} />
>>>>>>> origin/theekshana-IT24102753
            </ScrollView>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
<<<<<<< HEAD
    container: { flex: 1, backgroundColor: '#0F172A' },
    header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 20, backgroundColor: '#1E293B' },
    headerTitle: { fontSize: 18, fontWeight: 'bold', color: '#fff' },
    backButton: { padding: 12, backgroundColor: 'rgba(255,255,255,0.05)', borderRadius: 12 },
    scrollContent: { padding: 24 },
    imagePicker: { width: '100%', height: 300, backgroundColor: '#1E293B', borderRadius: 24, marginBottom: 24, overflow: 'hidden', borderWidth: 2, borderColor: '#3B82F6', justifyContent: 'center', alignItems: 'center' },
    previewImage: { width: '100%', height: '100%' },
    overlayCam: { position: 'absolute', backgroundColor: 'rgba(0,0,0,0.5)', padding: 15, borderRadius: 30 },
    form: { marginBottom: 40 },
    label: { fontSize: 14, fontWeight: 'bold', color: '#CBD5E1', marginBottom: 8, marginLeft: 4 },
    input: { backgroundColor: '#1E293B', borderRadius: 14, padding: 16, color: '#fff', marginBottom: 20, borderWidth: 1, borderColor: '#334155' },
    row: { flexDirection: 'row' },
    saveButton: { flexDirection: 'row', backgroundColor: '#3B82F6', padding: 18, borderRadius: 16, justifyContent: 'center', alignItems: 'center', marginTop: 10 },
    saveButtonText: { color: '#fff', fontSize: 16, fontWeight: 'bold', marginLeft: 10 }
=======
    container: { flex: 1, backgroundColor: '#0A0F1D' },
    header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 20, backgroundColor: '#161B2E', borderBottomLeftRadius: 24, borderBottomRightRadius: 24 },
    headerTitle: { fontSize: 18, fontWeight: 'bold', color: '#fff' },
    backButton: { padding: 10, backgroundColor: 'rgba(255,255,255,0.05)', borderRadius: 12 },
    scrollContent: { padding: 20 },
    sectionLabel: { fontSize: 13, color: '#6366F1', fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 15 },
    imageSection: { flexDirection: 'row', marginBottom: 25 },
    posterPicker: { height: 160, backgroundColor: '#161B2E', borderRadius: 20, borderWidth: 1, borderColor: '#1F2937', overflow: 'hidden' },
    backdropPicker: { height: 160, backgroundColor: '#161B2E', borderRadius: 20, borderWidth: 1, borderColor: '#1F2937', overflow: 'hidden' },
    previewImage: { width: '100%', height: '100%' },
    camOverlay: { position: 'absolute', bottom: 10, right: 10, backgroundColor: 'rgba(0,0,0,0.6)', padding: 8, borderRadius: 12 },
    formContainer: { marginTop: 10 },
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
>>>>>>> origin/theekshana-IT24102753
});

export default EditMovieScreen;
