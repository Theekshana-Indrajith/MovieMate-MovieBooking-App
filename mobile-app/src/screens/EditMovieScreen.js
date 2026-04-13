import React, { useState, useContext } from 'react';
import { StyleSheet, Text, View, TextInput, TouchableOpacity, ScrollView, Image, ActivityIndicator, Alert, SafeAreaView, Platform } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { AuthContext } from '../context/AuthContext';
import api from '../utils/api';
import { Camera, Save, ArrowLeft } from 'lucide-react-native';

const EditMovieScreen = ({ route, navigation }) => {
    const { movie } = route.params;
    const { token } = useContext(AuthContext);

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
            Alert.alert('Error', 'Please fill in all text fields');
            return;
        }

        setLoading(true);

        const formData = new FormData();
        formData.append('title', title);
        formData.append('description', description);
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
            </ScrollView>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
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
});

export default EditMovieScreen;
