import React, { useState, useContext } from 'react';
import { StyleSheet, Text, View, TextInput, TouchableOpacity, ScrollView, SafeAreaView, ActivityIndicator, Alert, Platform } from 'react-native';
import { AuthContext } from '../context/AuthContext';
import api from '../utils/api';
import { ArrowLeft, Save, Armchair, Wrench } from 'lucide-react-native';

const EditSeatRowScreen = ({ route, navigation }) => {
    const { row } = route.params;
    const { token } = useContext(AuthContext);

    const [rowCode, setRowCode] = useState(row.rowCode);
    const [type, setType] = useState(row.type);
    const [seatsCount, setSeatsCount] = useState(row.seatsCount.toString());
    const [extraPrice, setExtraPrice] = useState(row.extraPrice.toString());
    const [status, setStatus] = useState(row.status || 'Active');
    const [loading, setLoading] = useState(false);

    const handleSave = async () => {
        if (!rowCode || !seatsCount || !extraPrice) {
            Alert.alert('Error', 'Please fill in all fields');
            return;
        }

        setLoading(true);
        const payload = {
            rowCode: rowCode.toUpperCase(),
            type,
            seatsCount: Number(seatsCount),
            extraPrice: Number(extraPrice),
            status
        };

        try {
            const res = await api.put(`/seats/${row._id}`, payload, {
                headers: { Authorization: `Bearer ${token}` }
            });
            if (res.data.success) {
                if (Platform.OS === 'web') {
                    window.alert('Row updated successfully!');
                    navigation.goBack();
                } else {
                    Alert.alert('Success', 'Row updated successfully!', [
                        { text: 'OK', onPress: () => navigation.goBack() }
                    ]);
                }
            }
        } catch (err) {
            if (Platform.OS === 'web') {
                window.alert(err.response?.data?.error || 'Failed to update row');
            } else {
                Alert.alert('Error', err.response?.data?.error || 'Failed to update row');
            }
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
                <Text style={styles.headerTitle}>Edit Seat Row</Text>
                <View style={{ width: 44 }} />
            </View>

            <ScrollView contentContainerStyle={styles.content}>
                <View style={styles.previewCard}>
                    <Armchair color={type === 'VIP' ? '#F59E0B' : '#3B82F6'} size={40} />
                    <Text style={styles.previewText}>Row {rowCode ? rowCode.toUpperCase() : '?'}</Text>
                </View>

                <Text style={styles.label}>Row Code (e.g. A1, B2)</Text>
                <TextInput style={styles.input} value={rowCode} onChangeText={setRowCode} placeholderTextColor="#64748B" />

                <Text style={styles.label}>Row Type</Text>
                <View style={styles.typeSelector}>
                    <TouchableOpacity 
                        style={[styles.typeBtn, type === 'Normal' && styles.typeBtnSelectedNormal]} 
                        onPress={() => { setType('Normal'); setExtraPrice('0'); }}
                    >
                        <Text style={styles.typeBtnText}>Normal</Text>
                    </TouchableOpacity>
                    <TouchableOpacity 
                        style={[styles.typeBtn, type === 'VIP' && styles.typeBtnSelectedVIP]} 
                        onPress={() => { setType('VIP'); setExtraPrice('500'); }}
                    >
                        <Text style={styles.typeBtnText}>VIP</Text>
                    </TouchableOpacity>
                </View>

                <Text style={styles.label}>Row Status</Text>
                <View style={styles.typeSelector}>
                    <TouchableOpacity 
                        style={[styles.typeBtn, status === 'Active' && styles.typeBtnSelectedNormal]} 
                        onPress={() => setStatus('Active')}
                    >
                        <Text style={styles.typeBtnText}>Active</Text>
                    </TouchableOpacity>
                    <TouchableOpacity 
                        style={[styles.typeBtn, status === 'Maintenance' && { backgroundColor: '#EF4444', borderColor: '#EF4444' }]} 
                        onPress={() => setStatus('Maintenance')}
                    >
                        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                            <Text style={styles.typeBtnText}>Maintenance</Text>
                        </View>
                    </TouchableOpacity>
                </View>

                <View style={{ flexDirection: 'row', gap: 10 }}>
                    <View style={{ flex: 1 }}>
                        <Text style={styles.label}>Number of Seats</Text>
                        <TextInput style={styles.input} value={seatsCount} onChangeText={setSeatsCount} keyboardType="numeric" placeholderTextColor="#64748B" />
                    </View>
                    <View style={{ flex: 1 }}>
                        <Text style={styles.label}>Additional Price (Rs.)</Text>
                        <TextInput style={styles.input} value={extraPrice} onChangeText={setExtraPrice} keyboardType="numeric" placeholderTextColor="#64748B" />
                    </View>
                </View>

                <TouchableOpacity style={styles.saveButton} onPress={handleSave} disabled={loading}>
                    {loading ? <ActivityIndicator color="#fff" /> : <><Save color="#fff" size={20} /><Text style={styles.saveBtnText}>Update Row</Text></>}
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
    previewCard: { backgroundColor: '#1E293B', padding: 30, borderRadius: 20, alignItems: 'center', marginBottom: 30, borderWidth: 1, borderColor: '#334155' },
    previewText: { fontSize: 24, fontWeight: 'bold', color: '#fff', marginTop: 10 },
    typeSelector: { flexDirection: 'row', marginBottom: 24, gap: 10 },
    typeBtn: { flex: 1, padding: 16, borderRadius: 14, borderWidth: 1, borderColor: '#334155', alignItems: 'center' },
    typeBtnText: { color: '#fff', fontWeight: 'bold' },
    typeBtnSelectedNormal: { backgroundColor: '#3B82F6', borderColor: '#3B82F6' },
    typeBtnSelectedVIP: { backgroundColor: '#F59E0B', borderColor: '#F59E0B' },
    saveButton: { flexDirection: 'row', backgroundColor: '#3B82F6', padding: 18, borderRadius: 16, justifyContent: 'center', alignItems: 'center', marginTop: 10 },
    saveBtnText: { color: '#fff', fontSize: 16, fontWeight: 'bold', marginLeft: 10 }
});

export default EditSeatRowScreen;
