import React, { useState, useContext, useEffect } from 'react';
import { StyleSheet, Text, View, TextInput, TouchableOpacity, ScrollView, SafeAreaView, Alert, Image, Switch, ActivityIndicator, Platform, StatusBar } from 'react-native';
import { AuthContext } from '../context/AuthContext';
import api from '../utils/api';
import { ArrowLeft, Save, Plus, Camera, Info, ShoppingBasket, Banknote } from 'lucide-react-native';
import * as ImagePicker from 'expo-image-picker';
import BASE_URL from '../utils/constants';

const AdminAddSnackScreen = ({ route, navigation }) => {
    const { snack } = route.params || {};
    const { token } = useContext(AuthContext);
    
    const [name, setName] = useState(snack ? snack.name : '');
    const [description, setDescription] = useState(snack ? snack.description : '');
    const [price, setPrice] = useState(snack ? snack.price.toString() : '');
    const [isAvailable, setIsAvailable] = useState(snack ? snack.isAvailable : true);
    const [image, setImage] = useState(snack ? `${BASE_URL}/uploads/snacks/${snack.image}` : null);
    const [newImageFile, setNewImageFile] = useState(null);
    const [loading, setLoading] = useState(false);

    const pickImage = async () => {
        let result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ['images'],
            allowsEditing: true,
            aspect: [1, 1],
            quality: 1,
        });

        if (!result.canceled) {
            setNewImageFile(result.assets[0]);
            setImage(result.assets[0].uri);
        }
    };

    const handleSave = async () => {
        if (!name || !description || !price || (!image && !snack)) {
            Alert.alert('Missing Info', 'Please fill in all details and select an image.');
            return;
        }

        if (isNaN(Number(price)) || Number(price) <= 0) {
            Alert.alert('Invalid Price', 'Please enter a valid price.');
            return;
        }

        setLoading(true);
        const formData = new FormData();
        formData.append('name', name);
        formData.append('description', description);
        formData.append('price', price);
        formData.append('isAvailable', isAvailable);

        if (newImageFile) {
            if (Platform.OS === 'web') {
                const response = await fetch(newImageFile.uri);
                const blob = await response.blob();
                formData.append('image', blob, 'snack.jpg');
            } else {
                const filename = newImageFile.uri.split('/').pop();
                const match = /\.(\w+)$/.exec(filename);
                const type = match ? `image/${match[1]}` : `image`;
                formData.append('image', { uri: newImageFile.uri, name: filename, type });
            }
        }

        try {
            if (snack) {
                await api.put(`/snacks/${snack._id}`, formData, {
                    headers: { 
                        'Content-Type': 'multipart/form-data',
                        Authorization: `Bearer ${token}` 
                    }
                });
                Alert.alert('Success', 'Snack successfully updated!');
            } else {
                await api.post('/snacks', formData, {
                    headers: { 
                        'Content-Type': 'multipart/form-data',
                        Authorization: `Bearer ${token}` 
                    }
                });
                Alert.alert('Success', 'Snack successfully added!');
            }
            navigation.goBack();
        } catch (err) {
            Alert.alert('Error', err.response?.data?.error || 'Failed to save snack data.');
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
                <Text style={styles.headerTitle}>{snack ? 'Modify Snack' : 'New Snack Registry'}</Text>
                <View style={{ width: 44 }} />
            </View>

            <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
                <TouchableOpacity style={styles.imagePicker} onPress={pickImage}>
                    {image ? (
                        <View style={styles.imageWrapper}>
                             <Image source={{ uri: image }} style={styles.previewImage} />
                             <View style={styles.cameraIconBadge}><Camera color="#fff" size={16} /></View>
                        </View>
                    ) : (
                        <View style={styles.placeholderImage}>
                            <ShoppingBasket color="#475569" size={40} />
                            <Text style={styles.placeholderText}>Select Product Photo</Text>
                        </View>
                    )}
                </TouchableOpacity>

                <View style={styles.formCard}>
                    <Text style={styles.inputLabel}>Product Name</Text>
                    <View style={styles.inputWrapper}>
                        <TextInput 
                            style={styles.input} 
                            placeholder="e.g. Cinema Popcorn (Large)" 
                            placeholderTextColor="#475569"
                            value={name}
                            onChangeText={setName}
                        />
                    </View>

                    <Text style={styles.inputLabel}>Price (Rs.)</Text>
                    <View style={styles.inputWrapper}>
                        <Banknote color="#64748B" size={18} />
                        <TextInput 
                            style={styles.input} 
                            placeholder="e.g. 1500" 
                            placeholderTextColor="#475569"
                            keyboardType="numeric"
                            value={price}
                            onChangeText={setPrice}
                        />
                    </View>

                    <Text style={styles.inputLabel}>Description</Text>
                    <View style={[styles.inputWrapper, { height: 120, alignItems: 'flex-start', paddingTop: 12 }]}>
                        <TextInput 
                            style={[styles.input, { height: '100%' }]} 
                            placeholder="Brief details about the ingredients..." 
                            placeholderTextColor="#475569"
                            multiline
                            value={description}
                            onChangeText={setDescription}
                        />
                    </View>

                    <View style={styles.switchRow}>
                        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                            <View style={styles.iconCircle}><Info color="#6366F1" size={16} /></View>
                            <View style={{ marginLeft: 12 }}>
                                <Text style={styles.switchTitle}>Availability</Text>
                                <Text style={styles.switchSub}>{isAvailable ? 'Currently in Stock' : 'Out of Stock'}</Text>
                            </View>
                        </View>
                        <Switch 
                            value={isAvailable}
                            onValueChange={setIsAvailable}
                            trackColor={{ false: '#1F2937', true: '#10B981' }}
                            thumbColor={isAvailable ? '#fff' : '#475569'}
                        />
                    </View>
                </View>

                <TouchableOpacity 
                    style={[styles.mainButton, loading && { opacity: 0.5 }]} 
                    onPress={handleSave}
                    disabled={loading}
                >
                    {loading ? <ActivityIndicator color="#fff" /> : <><Save color="#fff" size={20} /><Text style={styles.mainButtonText}>{snack ? 'Save Changes' : 'Publish Product'}</Text></>}
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
    imagePicker: { alignSelf: 'center', marginBottom: 30 },
    imageWrapper: { width: 160, height: 160, borderRadius: 32, overflow: 'hidden', borderWidth: 2, borderColor: '#6366F1' },
    previewImage: { width: '100%', height: '100%' },
    cameraIconBadge: { position: 'absolute', bottom: 0, right: 0, backgroundColor: '#6366F1', padding: 10, borderTopLeftRadius: 16 },
    placeholderImage: { width: 160, height: 160, borderRadius: 32, backgroundColor: '#161B2E', justifyContent: 'center', alignItems: 'center', borderStyle: 'dashed', borderWidth: 1, borderColor: '#1F2937' },
    placeholderText: { color: '#475569', fontSize: 11, marginTop: 10, fontWeight: 'bold' },
    formCard: { backgroundColor: '#161B2E', padding: 20, borderRadius: 24, borderWidth: 1, borderColor: '#1F2937', marginBottom: 25 },
    inputLabel: { fontSize: 14, color: '#94A3B8', fontWeight: 'bold', marginBottom: 10, marginLeft: 4 },
    inputWrapper: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#0A0F1D', borderRadius: 16, paddingHorizontal: 16, marginBottom: 20, borderWidth: 1, borderColor: '#1F2937' },
    input: { flex: 1, padding: 14, color: '#fff', fontSize: 15 },
    switchRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 10 },
    iconCircle: { width: 32, height: 32, borderRadius: 10, backgroundColor: 'rgba(99, 102, 241, 0.1)', justifyContent: 'center', alignItems: 'center' },
    switchTitle: { color: '#fff', fontSize: 14, fontWeight: 'bold' },
    switchSub: { color: '#64748B', fontSize: 11 },
    mainButton: { backgroundColor: '#6366F1', padding: 18, borderRadius: 20, alignItems: 'center', flexDirection: 'row', justifyContent: 'center' },
    mainButtonText: { color: '#fff', fontSize: 16, fontWeight: 'bold', marginLeft: 10 }
});

export default AdminAddSnackScreen;
