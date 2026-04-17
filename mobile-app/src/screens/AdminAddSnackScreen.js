import React, { useState, useContext, useEffect } from 'react';
import { StyleSheet, Text, View, TextInput, TouchableOpacity, ScrollView, SafeAreaView, Alert, Image, Switch, ActivityIndicator, Platform } from 'react-native';
import { AuthContext } from '../context/AuthContext';
import api from '../utils/api';
import { ArrowLeft, Save, Plus, Trash2, Camera, Info } from 'lucide-react-native';
import * as ImagePicker from 'expo-image-picker';

const AdminAddSnackScreen = ({ route, navigation }) => {
    const { snack } = route.params || {};
    const { token } = useContext(AuthContext);
    
    const [name, setName] = useState(snack ? snack.name : '');
    const [description, setDescription] = useState(snack ? snack.description : '');
    const [price, setPrice] = useState(snack ? snack.price.toString() : '');
    const [isAvailable, setIsAvailable] = useState(snack ? snack.isAvailable : true);
    const [image, setImage] = useState(snack ? `http://192.168.8.106:5000/uploads/snacks/${snack.image}` : null);
    const [newImageFile, setNewImageFile] = useState(null);
    const [loading, setLoading] = useState(false);

    const pickImage = async () => {
        let result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: true,
            aspect: [1, 1],
            quality: 1,
        });

        if (!result.canceled) {
            setImage(result.assets[0].uri);
            setNewImageFile(result.assets[0]);
        }
    };

    const handleSave = async () => {
        if (!name || !description || !price || (!image && !snack)) {
            Alert.alert('Error', 'Please fill all fields and select an image');
            return;
        }

        setLoading(true);
        const formData = new FormData();
        formData.append('name', name);
        formData.append('description', description);
        formData.append('price', price);
        formData.append('isAvailable', isAvailable);

        if (newImageFile) {
            const filename = newImageFile.uri.split('/').pop();
            const match = /\.(\w+)$/.exec(filename);
            const type = match ? `image/${match[1]}` : `image`;
            formData.append('image', { uri: newImageFile.uri, name: filename, type });
        }

        try {
            if (snack) {
                // Update
                await api.put(`/snacks/${snack._id}`, formData, {
                    headers: { 
                        'Content-Type': 'multipart/form-data',
                        Authorization: `Bearer ${token}` 
                    }
                });
                Alert.alert('Success', 'Snack updated!');
            } else {
                // Create
                await api.post('/snacks', formData, {
                    headers: { 
                        'Content-Type': 'multipart/form-data',
                        Authorization: `Bearer ${token}` 
                    }
                });
                Alert.alert('Success', 'Snack added!');
            }
            navigation.goBack();
        } catch (err) {
            Alert.alert('Error', 'Failed to save snack');
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
                <Text style={styles.headerTitle}>{snack ? 'Edit Snack' : 'Add New Snack'}</Text>
                <TouchableOpacity 
                    style={[styles.saveButton, loading && { opacity: 0.5 }]} 
                    onPress={handleSave}
                    disabled={loading}
                >
                    {loading ? <ActivityIndicator color="#fff" size={20} /> : <Save color="#fff" size={22} />}
                </TouchableOpacity>
            </View>

            <ScrollView contentContainerStyle={styles.content}>
                <TouchableOpacity style={styles.imagePicker} onPress={pickImage}>
                    {image ? (
                        <View style={styles.imageWrapper}>
                             <Image source={{ uri: image }} style={styles.previewImage} />
                             <View style={styles.cameraIconBadge}><Camera color="#fff" size={16} /></View>
                        </View>
                    ) : (
                        <View style={styles.placeholderImage}>
                            <Plus color="#94A3B8" size={32} />
                            <Text style={styles.placeholderText}>Select Image</Text>
                        </View>
                    )}
                </TouchableOpacity>

                <View style={styles.form}>
                    <Text style={styles.label}>Snack Name</Text>
                    <TextInput 
                        style={styles.input} 
                        placeholder="e.g. Popcorn (Large)" 
                        placeholderTextColor="#64748B"
                        value={name}
                        onChangeText={setName}
                    />

                    <Text style={styles.label}>Price (Rs.)</Text>
                    <TextInput 
                        style={styles.input} 
                        placeholder="e.g. 1200" 
                        placeholderTextColor="#64748B"
                        keyboardType="numeric"
                        value={price}
                        onChangeText={setPrice}
                    />

                    <Text style={styles.label}>Description</Text>
                    <TextInput 
                        style={[styles.input, styles.textArea]} 
                        placeholder="Sweet, salty or butter popcorn..." 
                        placeholderTextColor="#64748B"
                        multiline
                        numberOfLines={4}
                        value={description}
                        onChangeText={setDescription}
                    />

                    <View style={styles.switchRow}>
                        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                            <Info color="#94A3B8" size={18} />
                            <Text style={[styles.label, { marginBottom: 0, marginLeft: 8 }]}>In Stock / Available</Text>
                        </View>
                        <Switch 
                            value={isAvailable}
                            onValueChange={setIsAvailable}
                            trackColor={{ false: '#334155', true: '#10B981' }}
                            thumbColor={isAvailable ? '#fff' : '#94A3B8'}
                        />
                    </View>
                </View>

                <TouchableOpacity 
                    style={[styles.mainButton, loading && { opacity: 0.5 }]} 
                    onPress={handleSave}
                    disabled={loading}
                >
                    {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.mainButtonText}>{snack ? 'Save Changes' : 'Publish Snack'}</Text>}
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
    saveButton: { padding: 12, backgroundColor: '#3B82F6', borderRadius: 12 },
    content: { padding: 24 },
    imagePicker: { alignSelf: 'center', marginBottom: 30 },
    imageWrapper: { width: 150, height: 150, borderRadius: 24, overflow: 'hidden', borderWidth: 2, borderColor: '#3B82F6' },
    previewImage: { width: '100%', height: '100%' },
    cameraIconBadge: { position: 'absolute', bottom: 0, right: 0, backgroundColor: '#3B82F6', padding: 8, borderTopLeftRadius: 12 },
    placeholderImage: { width: 150, height: 150, borderRadius: 24, backgroundColor: '#1E293B', justifyContent: 'center', alignItems: 'center', borderStyle: 'dashed', borderWidth: 2, borderColor: '#334155' },
    placeholderText: { color: '#64748B', fontSize: 13, marginTop: 8 },
    form: { marginBottom: 30 },
    label: { color: '#94A3B8', fontSize: 14, fontWeight: 'bold', marginBottom: 10, marginLeft: 4 },
    input: { backgroundColor: '#1E293B', borderRadius: 16, padding: 16, color: '#fff', fontSize: 16, borderWidth: 1, borderColor: '#334155', marginBottom: 20 },
    textArea: { height: 120, textAlignVertical: 'top' },
    switchRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#1E293B', padding: 20, borderRadius: 16, borderWidth: 1, borderColor: '#334155' },
    mainButton: { backgroundColor: '#10B981', paddingVertical: 20, borderRadius: 18, alignItems: 'center', shadowColor: '#10B981', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 10, elevation: 5 },
    mainButtonText: { color: '#fff', fontSize: 16, fontWeight: 'bold' }
});

export default AdminAddSnackScreen;
