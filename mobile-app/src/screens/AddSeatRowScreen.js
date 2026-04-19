import React, { useState, useContext } from 'react';
import * as ImagePicker from 'expo-image-picker';
import { StyleSheet, Text, View, TextInput, TouchableOpacity, ScrollView, SafeAreaView, ActivityIndicator, Alert, Platform, StatusBar } from 'react-native';
import { AuthContext } from '../context/AuthContext';
import api from '../utils/api';
import { ArrowLeft, Save, Armchair, Hash, Banknote, Trash2 } from 'lucide-react-native';

const AddSeatRowScreen = ({ navigation }) => {
    const { token } = useContext(AuthContext);

    const [rowCode, setRowCode] = useState('');
    const [type, setType] = useState('Normal');
    const [seatsCount, setSeatsCount] = useState('6');
    const [extraPrice, setExtraPrice] = useState('0');
    const [loading, setLoading] = useState(false);

    const handleSave = async () => {
        if (!rowCode || !seatsCount || !extraPrice) {
            Alert.alert('Missing Fields', 'Please fill in all details!');
            return;
        }

        if (isNaN(Number(seatsCount)) || Number(seatsCount) <= 0) {
            Alert.alert('Invalid Count', 'Please enter a valid seat count.');
            return;
        }

        if (isNaN(Number(extraPrice)) || Number(extraPrice) < 0) {
            Alert.alert('Invalid Price', 'Please enter a valid extra price.');
            return;
        }

        try {
            const res = await api.post('/seats', {
                rowCode: rowCode.toUpperCase(),
                type,
                seatsCount,
                extraPrice
            }, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            if (res.data.success) {
                if (Platform.OS === 'web') {
                    window.alert('Row added successfully!');
                    navigation.goBack();
                } else {
                    Alert.alert('Success', 'New seat row successfully added!', [{ text: 'OK', onPress: () => navigation.goBack() }]);
                }
            }
        } catch (err) {
            Alert.alert('Error', err.response?.data?.error || 'Failed to add row');
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
                <Text style={styles.headerTitle}>Seat Row Setup</Text>
                <View style={{ width: 44 }} />
            </View>

            <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
                <View style={styles.previewCard}>
                    <View style={[styles.avatarStyle, { backgroundColor: type === 'VIP' ? 'rgba(245, 158, 11, 0.1)' : 'rgba(99, 102, 241, 0.1)' }]}>
                        <Armchair color={type === 'VIP' ? '#F59E0B' : '#6366F1'} size={48} />
                    </View>
                    <Text style={styles.previewText}>Row {rowCode ? rowCode.toUpperCase() : '?'}</Text>
                    <Text style={styles.previewSubtext}>{seatsCount || 0} Seats • {type} Row</Text>
                </View>

                <View style={styles.formCard}>
                    <Text style={styles.inputLabel}>Row Code (e.g. A, B, J)</Text>
                    <View style={styles.inputWrapper}>
                        <Hash color="#64748B" size={18} />
                        <TextInput style={styles.input} value={rowCode} onChangeText={setRowCode} placeholder="A" placeholderTextColor="#475569" autoCapitalize="characters" />
                    </View>

                    <Text style={styles.inputLabel}>Row Classification</Text>
                    <View style={styles.typeSelector}>
                        <TouchableOpacity
                            style={[styles.typeBtn, type === 'Normal' && styles.typeBtnSelectedNormal]}
                            onPress={() => { setType('Normal'); setExtraPrice('0'); }}
                        >
                            <Text style={[styles.typeBtnText, type === 'Normal' && { color: '#fff' }]}>Standard</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={[styles.typeBtn, type === 'VIP' && styles.typeBtnSelectedVIP]}
                            onPress={() => { setType('VIP'); setExtraPrice('500'); }}
                        >
                            <Text style={[styles.typeBtnText, type === 'VIP' && { color: '#fff' }]}>VIP Golden</Text>
                        </TouchableOpacity>
                    </View>

                    <View style={styles.row}>
                        <View style={{ flex: 1, marginRight: 10 }}>
                            <Text style={styles.inputLabel}>Seats Count</Text>
                            <View style={styles.inputWrapper}>
                                <TextInput style={styles.input} value={seatsCount} onChangeText={setSeatsCount} keyboardType="numeric" placeholder="10" placeholderTextColor="#475569" />
                            </View>
                        </View>
                        <View style={{ flex: 1 }}>
                            <Text style={styles.inputLabel}>Markup Price</Text>
                            <View style={styles.inputWrapper}>
                                <Banknote color="#64748B" size={18} />
                                <TextInput style={styles.input} value={extraPrice} onChangeText={setExtraPrice} keyboardType="numeric" placeholder="0" placeholderTextColor="#475569" />
                            </View>
                        </View>
                    </View>
                </View>

                <TouchableOpacity style={styles.saveButton} onPress={handleSave} disabled={loading}>
                    {loading ? <ActivityIndicator color="#fff" /> : <><Save color="#fff" size={20} /><Text style={styles.saveBtnText}>Save Configuration</Text></>}
                </TouchableOpacity>
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
    previewCard: { backgroundColor: '#161B2E', padding: 30, borderRadius: 32, alignItems: 'center', marginBottom: 30, borderWidth: 1, borderColor: '#1F2937' },
    avatarStyle: { width: 80, height: 80, borderRadius: 24, justifyContent: 'center', alignItems: 'center', marginBottom: 15 },
    previewText: { fontSize: 24, fontWeight: 'bold', color: '#fff' },
    previewSubtext: { fontSize: 14, color: '#94A3B8', marginTop: 5 },
    formCard: { backgroundColor: '#161B2E', padding: 20, borderRadius: 24, borderWidth: 1, borderColor: '#1F2937', marginBottom: 25 },
    inputLabel: { fontSize: 14, color: '#94A3B8', fontWeight: 'bold', marginBottom: 10, marginLeft: 4 },
    inputWrapper: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#0A0F1D', borderRadius: 16, paddingHorizontal: 16, marginBottom: 20, borderWidth: 1, borderColor: '#1F2937' },
    input: { flex: 1, padding: 14, color: '#fff', fontSize: 15 },
    typeSelector: { flexDirection: 'row', marginBottom: 25, gap: 10 },
    typeBtn: { flex: 1, padding: 16, borderRadius: 18, borderWidth: 1, borderColor: '#1F2937', alignItems: 'center', backgroundColor: '#0A0F1D' },
    typeBtnText: { color: '#64748B', fontWeight: 'bold' },
    typeBtnSelectedNormal: { backgroundColor: '#6366F1', borderColor: '#6366F1' },
    typeBtnSelectedVIP: { backgroundColor: '#F59E0B', borderColor: '#F59E0B' },
    row: { flexDirection: 'row' },
    saveButton: { flexDirection: 'row', backgroundColor: '#6366F1', padding: 18, borderRadius: 20, justifyContent: 'center', alignItems: 'center', marginTop: 10 },
    saveBtnText: { color: '#fff', fontSize: 16, fontWeight: 'bold', marginLeft: 10 },
    sectionLabel: { fontSize: 13, color: '#6366F1', fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 15 },
    assignmentNote: { backgroundColor: 'rgba(99, 102, 241, 0.1)', padding: 12, borderRadius: 12, marginBottom: 15, borderLeftWidth: 3, borderLeftColor: '#6366F1' },
    noteText: { color: '#94A3B8', fontSize: 11, fontStyle: 'italic' },
    imagePicker: { height: 180, backgroundColor: '#161B2E', borderRadius: 24, borderStyle: 'dashed', borderWidth: 1, borderColor: '#1F2937', overflow: 'hidden', marginBottom: 25, justifyContent: 'center', alignItems: 'center' },
    pickerPlaceholder: { alignItems: 'center', padding: 20 },
    pickerText: { color: '#fff', fontSize: 13, fontWeight: 'bold', marginTop: 12, textAlign: 'center' },
    pickerSub: { color: '#64748B', fontSize: 11, marginTop: 4, textAlign: 'center' },
    imagePreview: { width: '100%', height: '100%' },
    removeImg: { position: 'absolute', top: 15, right: 15, backgroundColor: '#EF4444', padding: 8, borderRadius: 10 }
});

export default AddSeatRowScreen;
