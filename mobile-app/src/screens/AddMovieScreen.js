import React, { useState, useContext } from 'react';
import { StyleSheet, Text, View, TextInput, TouchableOpacity, ScrollView, Image, ActivityIndicator, Alert, SafeAreaView, Platform, StatusBar } from 'react-native';

import * as ImagePicker from 'expo-image-picker';
import { AuthContext } from '../context/AuthContext';
import api from '../utils/api';
import { Camera, Save, ArrowLeft, Plus, X, User, Film, Info } from 'lucide-react-native';

const AddMovieScreen = ({ navigation }) => {
    const { token } = useContext(AuthContext);
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [duration, setDuration] = useState('');
    const [releaseDate, setReleaseDate] = useState(new Date().toISOString().split('T')[0]);
    
    // Multi-Image Support
    const [poster, setPoster] = useState(null);
    const [backdrop, setBackdrop] = useState(null);
    
    // Genre Tags
    const [selectedGenres, setSelectedGenres] = useState([]);
    const availableGenres = ['Action', 'Thriller', 'Comedy', 'Drama', 'Horror', 'Sci-Fi', 'Romance', 'Adventure'];

    // Cast & Crew
    const [cast, setCast] = useState([]);
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
            if (type === 'poster') setPoster(result.assets[0]);
            else setBackdrop(result.assets[0]);
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
        if (currentCast.trim()) {
            setCast([...cast, currentCast.trim()]);
            setCurrentCast('');
        }
    };

    const removeCast = (index) => {
        setCast(cast.filter((_, i) => i !== index));
    };

    const handleSave = async () => {
        if (!title || !description || selectedGenres.length === 0 || !poster || !backdrop) {
            Alert.alert('Error', 'Please fill in all required fields and upload both images');
            return;
        }

        setLoading(true);

        const formData = new FormData();
        formData.append('title', title);
        formData.append('description', description);
        formData.append('genre', selectedGenres.join(', '));
        formData.append('duration', duration);
        formData.append('releaseDate', releaseDate);
        
        // Append Cast as separate items or stringified? Backend expects [String]
        cast.forEach(c => formData.append('cast', c));

        // Poster
        if (Platform.OS === 'web') {
            const resPoster = await fetch(poster.uri);
            const blobPoster = await resPoster.blob();
            formData.append('poster', blobPoster, 'poster.jpg');

            const resBackdrop = await fetch(backdrop.uri);
            const blobBackdrop = await resBackdrop.blob();
            formData.append('backdrop', blobBackdrop, 'backdrop.jpg');
        } else {
            const pFilename = poster.uri.split('/').pop();
            formData.append('poster', { uri: poster.uri, name: pFilename, type: 'image/jpeg' });

            const bFilename = backdrop.uri.split('/').pop();
            formData.append('backdrop', { uri: backdrop.uri, name: bFilename, type: 'image/jpeg' });
        }

        try {
            const res = await api.post('/movies', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                    'Authorization': `Bearer ${token}`
                }
            });

            if (res.data.success) {
                Alert.alert('Success', 'Movie added to theatre successfully!');
                navigation.goBack();
            }
        } catch (err) {
            Alert.alert('Error', err.response?.data?.error || 'Failed to save movie');
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
                <Text style={styles.headerTitle}>Professional Movie Entry</Text>
                <View style={{ width: 44 }} />
            </View>

            <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
                
                {/* Images Section */}
                <Text style={styles.sectionLabel}>Movie Visuals</Text>
                <View style={styles.imageSection}>
                    <View style={{ flex: 1, marginRight: 15 }}>
                        <Text style={styles.inputLabel}>Poster (2:3)</Text>
                        <TouchableOpacity style={styles.posterPicker} onPress={() => pickImage('poster')}>
                            {poster ? (
                                <Image source={{ uri: poster.uri }} style={styles.previewImage} />
                            ) : (
                                <View style={styles.placeholder}>
                                    <Film color="#475569" size={24} />
                                    <Text style={styles.placeholderText}>Add Poster</Text>
                                </View>
                            )}
                        </TouchableOpacity>
                    </View>
                    <View style={{ flex: 1.5 }}>
                        <Text style={styles.inputLabel}>Backdrop (16:9)</Text>
                        <TouchableOpacity style={styles.backdropPicker} onPress={() => pickImage('backdrop')}>
                            {backdrop ? (
                                <Image source={{ uri: backdrop.uri }} style={styles.previewImage} />
                            ) : (
                                <View style={styles.placeholder}>
                                    <Camera color="#475569" size={20} />
                                    <Text style={styles.placeholderText}>Add Backdrop</Text>
                                </View>
                            )}
                        </TouchableOpacity>
                    </View>
                </View>

                {/* Form Section */}
                <View style={styles.formContainer}>
                    <Text style={styles.inputLabel}>Title</Text>
                    <TextInput 
                        style={styles.input} 
                        value={title} 
                        onChangeText={setTitle} 
                        placeholder="e.g. Tenet" 
                        placeholderTextColor="#475569"
                    />

                    <Text style={styles.inputLabel}>Description</Text>
                    <TextInput 
                        style={[styles.input, { height: 80, textAlignVertical: 'top' }]} 
                        multiline
                        value={description} 
                        onChangeText={setDescription} 
                        placeholder="Brief summary of the movie..." 
                        placeholderTextColor="#475569"
                    />

                    {/* Genre Tag Selection */}
                    <Text style={styles.inputLabel}>Select Genres</Text>
                    <View style={styles.genreContainer}>
                        {availableGenres.map(g => (
                            <TouchableOpacity 
                                key={g} 
                                style={[styles.genreTag, selectedGenres.includes(g) && styles.genreTagActive]}
                                onPress={() => toggleGenre(g)}
                            >
                                <Text style={[styles.genreText, selectedGenres.includes(g) && styles.genreTextActive]}>{g}</Text>
                            </TouchableOpacity>
                        ))}
                    </View>

                    <View style={styles.row}>
                        <View style={{ flex: 1, marginRight: 15 }}>
                            <Text style={styles.inputLabel}>Duration (Min)</Text>
                            <TextInput 
                                style={styles.input} 
                                value={duration} 
                                onChangeText={setDuration} 
                                keyboardType="numeric"
                                placeholder="120" 
                                placeholderTextColor="#475569"
                            />
                        </View>
                        <View style={{ flex: 1 }}>
                            <Text style={styles.inputLabel}>Release Date</Text>
                            <TextInput 
                                style={styles.input} 
                                value={releaseDate} 
                                onChangeText={setReleaseDate} 
                                placeholder="YYYY-MM-DD" 
                                placeholderTextColor="#475569"
                            />
                        </View>
                    </View>

                    {/* Cast Management */}
                    <Text style={styles.inputLabel}>Cast & Crew</Text>
                    <View style={styles.castInputRow}>
                         <TextInput 
                            style={[styles.input, { flex: 1, marginBottom: 0 }]} 
                            value={currentCast}
                            onChangeText={setCurrentCast}
                            placeholder="Add actor name..."
                            placeholderTextColor="#475569"
                         />
                         <TouchableOpacity style={styles.addCastBtn} onPress={addCast}>
                             <Plus color="#fff" size={20} />
                         </TouchableOpacity>
                    </View>
                    
                    <View style={styles.castList}>
                        {cast.map((c, i) => (
                            <View key={i} style={styles.castTag}>
                                <Text style={styles.castTagText}>{c}</Text>
                                <TouchableOpacity onPress={() => removeCast(i)}>
                                    <X color="#94A3B8" size={14} />
                                </TouchableOpacity>
                            </View>
                        ))}
                    </View>

                    <TouchableOpacity 
                        style={[styles.saveButton, loading && { opacity: 0.7 }]} 
                        onPress={handleSave}
                        disabled={loading}
                    >
                        {loading ? <ActivityIndicator color="#fff" /> : (
                            <>
                                <Save color="#fff" size={20} />
                                <Text style={styles.saveButtonText}>Publish Movie</Text>
                            </>
                        )}
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
    sectionLabel: { fontSize: 13, color: '#6366F1', fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 15, marginLeft: 5 },
    imageSection: { flexDirection: 'row', marginBottom: 25 },
    posterPicker: { height: 160, backgroundColor: '#161B2E', borderRadius: 20, borderWidth: 1, borderStyle: 'dashed', borderColor: '#1F2937', overflow: 'hidden' },
    backdropPicker: { height: 160, backgroundColor: '#161B2E', borderRadius: 20, borderWidth: 1, borderStyle: 'dashed', borderColor: '#1F2937', overflow: 'hidden' },
    previewImage: { width: '100%', height: '100%' },
    placeholder: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    placeholderText: { color: '#475569', fontSize: 11, marginTop: 8, fontWeight: 'bold' },

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

    saveButton: { flexDirection: 'row', backgroundColor: '#6366F1', padding: 18, borderRadius: 20, justifyContent: 'center', alignItems: 'center', marginTop: 10, elevation: 5 },
    saveButtonText: { color: '#fff', fontSize: 16, fontWeight: 'bold', marginLeft: 12 }
});

export default AddMovieScreen;
