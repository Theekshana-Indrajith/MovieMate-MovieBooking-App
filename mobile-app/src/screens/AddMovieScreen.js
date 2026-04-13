import React, { useState, useContext } from 'react';
import { StyleSheet, Text, View, TextInput, TouchableOpacity, ScrollView, Image, ActivityIndicator, Alert, SafeAreaView, Platform } from 'react-native';

import * as ImagePicker from 'expo-image-picker';
import { AuthContext } from '../context/AuthContext';
import api from '../utils/api';
import { Camera, Save, ArrowLeft } from 'lucide-react-native';

const AddMovieScreen = ({ navigation }) => {
    const { token } = useContext(AuthContext);
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [genre, setGenre] = useState('');
    const [duration, setDuration] = useState('');
    const [releaseDate, setReleaseDate] = useState(new Date().toISOString().split('T')[0]);
    const [image, setImage] = useState(null);
    const [loading, setLoading] = useState(false);

    const pickImage = async () => {
        let result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ['images'],
            allowsEditing: true,
            aspect: [2, 3], // Movie poster size
            quality: 1,
        });

        if (!result.canceled) {
            setImage(result.assets[0]);
        }
    };

    const handleSave = async () => {
        if (!title || !description || !genre || !duration || !image) {
            Alert.alert('Error', 'Please fill in all fields including the poster image');
            return;
        }

        setLoading(true);

        // FormData for multipart ( Multer support )
        const formData = new FormData();
        formData.append('title', title);
        formData.append('description', description);
        formData.append('genre', genre);
        formData.append('duration', duration);
        formData.append('releaseDate', releaseDate);

        if (Platform.OS === 'web') {
            // For Web, fetch the blob from the URI and append it
            const response = await fetch(image.uri);
            const blob = await response.blob();
            formData.append('poster', blob, 'poster.jpg');
        } else {
            // For Mobile
            const filename = image.uri.split('/').pop();
            const match = /\.(\w+)$/.exec(filename);
            const type = match ? `image/${match[1]}` : `image`;

            formData.append('poster', {
                uri: image.uri,
                name: filename,
                type: type
            });
        }

        try {
            const res = await api.post('/movies', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                    'Authorization': `Bearer ${token}`
                }
            });

            if (res.data.success) {
                if (Platform.OS === 'web') {
                    window.alert('Movie added successfully!');
                    navigation.goBack();
                } else {
                    Alert.alert('Success', 'Movie added successfully!', [
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
                <Text style={styles.headerTitle}>Add Movie</Text>
                <View style={{ width: 48 }} />
            </View>

            <ScrollView contentContainerStyle={styles.scrollContent}>
                <TouchableOpacity style={styles.imagePicker} onPress={pickImage}>
                    {image ? (
                        <Image source={{ uri: image.uri }} style={styles.previewImage} />
                    ) : (
                        <View style={styles.imagePlaceholder}>
                            <Camera color="#94A3B8" size={32} />
                            <Text style={styles.imagePlaceholderText}>Upload Poster</Text>
                        </View>
                    )}
                </TouchableOpacity>

                <View style={styles.form}>
                    <Text style={styles.label}>Movie Title</Text>
                    <TextInput 
                        style={styles.input} 
                        value={title} 
                        onChangeText={setTitle} 
                        placeholder="e.g. Inception" 
                        placeholderTextColor="#64748B"
                    />

                    <Text style={styles.label}>Description</Text>
                    <TextInput 
                        style={[styles.input, { height: 100 }]} 
                        multiline 
                        value={description} 
                        onChangeText={setDescription} 
                        placeholder="Add movie description..." 
                        placeholderTextColor="#64748B"
                    />

                    <View style={styles.row}>
                        <View style={{ flex: 1, marginRight: 10 }}>
                            <Text style={styles.label}>Genre</Text>
                            <TextInput 
                                style={styles.input} 
                                value={genre} 
                                onChangeText={setGenre} 
                                placeholder="e.g. Action" 
                                placeholderTextColor="#64748B"
                            />
                        </View>
                        <View style={{ flex: 1 }}>
                            <Text style={styles.label}>Duration (Min)</Text>
                            <TextInput 
                                style={styles.input} 
                                value={duration} 
                                onChangeText={setDuration} 
                                keyboardType="numeric" 
                                placeholder="e.g. 120" 
                                placeholderTextColor="#64748B"
                            />
                        </View>
                    </View>

                    <Text style={styles.label}>Release Date</Text>
                    <TextInput 
                        style={styles.input} 
                        value={releaseDate} 
                        onChangeText={setReleaseDate} 
                        placeholder="YYYY-MM-DD" 
                        placeholderTextColor="#64748B"
                    />

                    <TouchableOpacity 
                        style={styles.saveButton} 
                        onPress={handleSave}
                        disabled={loading}
                    >
                        {loading ? (
                            <ActivityIndicator color="#fff" />
                        ) : (
                            <>
                                <Save color="#fff" size={20} />
                                <Text style={styles.saveButtonText}>Save Movie</Text>
                            </>
                        )}
                    </TouchableOpacity>
                </View>
            </ScrollView>
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
        padding: 12,
        backgroundColor: 'rgba(255,255,255,0.05)',
        borderRadius: 12,
    },
    scrollContent: {
        padding: 24,
    },
    imagePicker: {
        width: '100%',
        height: 300,
        backgroundColor: '#1E293B',
        borderRadius: 24,
        marginBottom: 24,
        overflow: 'hidden',
        borderStyle: 'dashed',
        borderWidth: 2,
        borderColor: '#334155',
        justifyContent: 'center',
        alignItems: 'center',
    },
    previewImage: {
        width: '100%',
        height: '100%',
    },
    imagePlaceholder: {
        alignItems: 'center',
    },
    imagePlaceholderText: {
        color: '#94A3B8',
        marginTop: 10,
        fontSize: 14,
    },
    form: {
        marginBottom: 40,
    },
    label: {
        fontSize: 14,
        fontWeight: 'bold',
        color: '#CBD5E1',
        marginBottom: 8,
        marginLeft: 4,
    },
    input: {
        backgroundColor: '#1E293B',
        borderRadius: 14,
        padding: 16,
        color: '#fff',
        marginBottom: 20,
        borderWidth: 1,
        borderColor: '#334155',
    },
    row: {
        flexDirection: 'row',
    },
    saveButton: {
        flexDirection: 'row',
        backgroundColor: '#3B82F6',
        padding: 18,
        borderRadius: 16,
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: 10,
    },
    saveButtonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: 'bold',
        marginLeft: 10,
    }
});

export default AddMovieScreen;
