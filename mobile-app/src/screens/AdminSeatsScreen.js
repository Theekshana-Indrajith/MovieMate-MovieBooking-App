import React, { useState, useEffect, useContext } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, ScrollView, SafeAreaView, ActivityIndicator, Alert, Platform } from 'react-native';
import { ArrowLeft, Armchair, Plus, Trash2 } from 'lucide-react-native';
import api from '../utils/api';
import { AuthContext } from '../context/AuthContext';

const AdminSeatsScreen = ({ navigation }) => {
    const { token } = useContext(AuthContext);
    const [seatLayout, setSeatLayout] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchSeatLayout();
        
        const unsubscribe = navigation.addListener('focus', () => {
            fetchSeatLayout();
        });
        return unsubscribe;
    }, [navigation]);

    const fetchSeatLayout = async () => {
        try {
            const res = await api.get('/seats');
            setSeatLayout(res.data.data);
        } catch (err) {
            Alert.alert('Error', 'Failed to fetch seat configurations');
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id) => {
        const executeDelete = async () => {
            try {
                await api.delete(`/seats/${id}`, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                fetchSeatLayout();
            } catch (err) {
                Alert.alert('Error', 'Cannot delete row');
            }
        };

        if (Platform.OS === 'web') {
            if (window.confirm('Are you sure you want to delete this row?')) executeDelete();
        } else {
            Alert.alert('Delete', 'Delete this row?', [
                { text: 'Cancel', style: 'cancel' },
                { text: 'Delete', style: 'destructive', onPress: executeDelete }
            ]);
        }
    };

    const handleToggleStatus = async (row) => {
        const newStatus = row.status === 'Active' ? 'Maintenance' : 'Active';
        try {
            await api.put(`/seats/${row._id}`, { status: newStatus }, {
                headers: { Authorization: `Bearer ${token}` }
            });
            fetchSeatLayout();
            if (Platform.OS === 'web') window.alert(`Row marked as ${newStatus}`);
        } catch (err) {
            Alert.alert('Error', 'Failed to update status');
        }
    };

    const totalSeats = seatLayout.reduce((acc, curr) => acc + curr.seatsCount, 0);

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                    <ArrowLeft color="#fff" size={24} />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Seat Configurations</Text>
                <TouchableOpacity style={styles.addButton} onPress={() => navigation.navigate('AddSeatRow')}>
                    <Plus color="#fff" size={24} />
                </TouchableOpacity>
            </View>

            <ScrollView contentContainerStyle={styles.content}>
                <View style={styles.summaryCard}>
                    <Text style={styles.summaryTitle}>Main Theatre Hall</Text>
                    <Text style={styles.summaryText}>Total Capacity: <Text style={{color: '#10B981', fontWeight: 'bold'}}>{totalSeats} Seats</Text></Text>
                </View>

                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                    <Text style={styles.sectionTitle}>Seat Rows Overview</Text>
                    <Text style={{ color: '#64748B', fontSize: 12 }}>Long press a row to toggle Maintenance</Text>
                </View>

                {loading ? <ActivityIndicator size="large" color="#3B82F6" /> : seatLayout.map((row) => (
                    <TouchableOpacity 
                        key={row._id} 
                        style={[styles.rowCard, row.status === 'Maintenance' && { borderColor: '#EF4444', opacity: 0.8 }]}
                        onLongPress={() => handleToggleStatus(row)}
                        delayLongPress={500}
                    >
                        <View style={styles.rowHeader}>
                            <Armchair color={row.type === 'VIP' ? '#F59E0B' : '#3B82F6'} size={24} />
                            <Text style={styles.rowName}>Row {row.rowCode}</Text>
                        </View>
                        <View style={styles.rowDetails}>
                            {row.status === 'Maintenance' && (
                                <View style={[styles.badge, { backgroundColor: 'rgba(239, 68, 68, 0.1)' }]}>
                                    <Text style={[styles.badgeText, { color: '#EF4444' }]}>Maintenance</Text>
                                </View>
                            )}
                            <View style={styles.badge}>
                                <Text style={[styles.badgeText, row.type === 'VIP' && { color: '#F59E0B' }]}>{row.type}</Text>
                            </View>
                            <Text style={styles.detailText}>{row.seatsCount} Seats</Text>
                            {row.type === 'VIP' && <Text style={styles.bonusText}>(+ Rs.{row.extraPrice})</Text>}
                            
                            <TouchableOpacity onPress={() => navigation.navigate('EditSeatRow', { row: row })} style={{ marginLeft: 15 }}>
                                <Text style={{ color: '#3B82F6', fontSize: 18 }}>✏️</Text>
                            </TouchableOpacity>
                            <TouchableOpacity onPress={() => handleDelete(row._id)} style={{ marginLeft: 15 }}>
                                <Trash2 color="#EF4444" size={18} />
                            </TouchableOpacity>
                        </View>
                    </TouchableOpacity>
                ))}
            </ScrollView>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#0F172A' },
    header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 20, backgroundColor: '#1E293B' },
    headerTitle: { fontSize: 18, fontWeight: 'bold', color: '#fff' },
    backButton: { padding: 10, backgroundColor: 'rgba(255,255,255,0.05)', borderRadius: 12 },
    addButton: { padding: 10, backgroundColor: '#10B981', borderRadius: 12 },
    content: { padding: 20 },
    summaryCard: { backgroundColor: '#1E293B', padding: 24, borderRadius: 20, marginBottom: 30, alignItems: 'center' },
    summaryTitle: { fontSize: 20, fontWeight: 'bold', color: '#fff', marginBottom: 8 },
    summaryText: { fontSize: 16, color: '#94A3B8' },
    sectionTitle: { fontSize: 16, fontWeight: 'bold', color: '#fff', marginBottom: 16 },
    rowCard: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#1E293B', padding: 16, borderRadius: 16, marginBottom: 12, borderWidth: 1, borderColor: '#334155' },
    rowHeader: { flexDirection: 'row', alignItems: 'center' },
    rowName: { fontSize: 16, fontWeight: 'bold', color: '#fff', marginLeft: 12 },
    rowDetails: { flexDirection: 'row', alignItems: 'center' },
    badge: { backgroundColor: 'rgba(255,255,255,0.05)', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8, marginRight: 10 },
    badgeText: { fontSize: 12, fontWeight: 'bold', color: '#3B82F6' },
    detailText: { color: '#CBD5E1', fontSize: 14 },
    bonusText: { color: '#F59E0B', fontSize: 12, marginLeft: 10 }
});

export default AdminSeatsScreen;
