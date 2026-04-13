import React, { useContext, useState, useEffect } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, ScrollView, SafeAreaView, ActivityIndicator } from 'react-native';
import { AuthContext } from '../context/AuthContext';
import api from '../utils/api';
import { Film, Calendar, Armchair, BookOpen, Utensils, ShoppingBag, LogOut, TrendingUp, Users } from 'lucide-react-native';

const AdminDashboard = ({ navigation }) => {
    const { logout, user } = useContext(AuthContext);
    const [stats, setStats] = useState({ revenue: 0, movies: 0, bookings: 0 });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const [moviesRes, bookingsRes] = await Promise.all([
                    api.get('/movies'),
                    api.get('/bookings')
                ]);
                
                const bookingsData = bookingsRes.data.data || [];
                const revenue = bookingsData.filter(b => b.status === 'Confirmed').reduce((acc, curr) => acc + curr.totalAmount, 0);

                setStats({
                    movies: moviesRes.data.count || 0,
                    bookings: bookingsData.length || 0,
                    revenue
                });
            } catch (err) {
                console.log(err);
            } finally {
                setLoading(false);
            }
        };

        fetchStats();
        const unsubscribe = navigation.addListener('focus', fetchStats);
        return unsubscribe;
    }, [navigation]);

    const menuItems = [
        { id: 1, title: 'Movies', icon: <Film color="#fff" size={28} />, color: '#3B82F6', screen: 'AdminMovieList', desc: 'Current Catalogue' },
        { id: 2, title: 'Showtimes', icon: <Calendar color="#fff" size={28} />, color: '#8B5CF6', screen: 'AdminShowtime', desc: 'Schedules & Pricing' },
        { id: 3, title: 'Seats', icon: <Armchair color="#fff" size={28} />, color: '#10B981', screen: 'AdminSeats', desc: 'Hall Configurations' },
        { id: 4, title: 'Bookings', icon: <BookOpen color="#fff" size={28} />, color: '#F59E0B', screen: 'AdminBookings', desc: 'Tickets & Revenue' },
        { id: 5, title: 'Snacks', icon: <Utensils color="#fff" size={28} />, color: '#EC4899', screen: 'AdminSnacks', desc: 'Concessions Menu' },
        { id: 6, title: 'Orders', icon: <ShoppingBag color="#fff" size={28} />, color: '#6366F1', screen: 'AdminSnackOrders', desc: 'Food Transactions' },
    ];

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <View>
                    <Text style={styles.subtitle}>Welcome back,</Text>
                    <Text style={styles.title}>{user?.name} 👑</Text>
                </View>
                <TouchableOpacity onPress={logout} style={styles.logoutIcon}>
                    <LogOut color="#EF4444" size={20} />
                </TouchableOpacity>
            </View>

            <ScrollView contentContainerStyle={styles.content}>
                <Text style={styles.sectionTitle}>Business Overview</Text>
                <View style={styles.statsContainer}>
                    {loading ? <ActivityIndicator size="small" color="#3B82F6" style={{ margin: 20 }} /> : (
                        <>
                            <View style={styles.statBox}>
                                <View style={[styles.statIconBox, { backgroundColor: 'rgba(16, 185, 129, 0.15)' }]}>
                                    <TrendingUp color="#10B981" size={20} />
                                </View>
                                <Text style={styles.statValue}>Rs. {stats.revenue.toLocaleString()}</Text>
                                <Text style={styles.statLabel}>Total Sales</Text>
                            </View>
                            <View style={styles.statBox}>
                                <View style={[styles.statIconBox, { backgroundColor: 'rgba(245, 158, 11, 0.15)' }]}>
                                    <Users color="#F59E0B" size={20} />
                                </View>
                                <Text style={styles.statValue}>{stats.bookings}</Text>
                                <Text style={styles.statLabel}>Total Bookings</Text>
                            </View>
                        </>
                    )}
                </View>

                <Text style={styles.sectionTitle}>Management Modules</Text>
                <View style={styles.grid}>
                    {menuItems.map((item) => (
                        <TouchableOpacity 
                            key={item.id} 
                            style={styles.card}
                            onPress={() => item.screen ? navigation.navigate(item.screen) : null}
                            activeOpacity={0.7}
                        >
                            <View style={[styles.iconContainer, { backgroundColor: item.color }]}>
                                {item.icon}
                            </View>
                            <View style={styles.cardTextContainer}>
                                <Text style={styles.cardTitle}>{item.title}</Text>
                                <Text style={styles.cardInfo}>{item.desc}</Text>
                            </View>
                        </TouchableOpacity>
                    ))}
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
        padding: 24,
        paddingTop: 60,
        backgroundColor: '#1E293B',
        borderBottomLeftRadius: 30,
        borderBottomRightRadius: 30,
    },
    title: {
        fontSize: 22,
        fontWeight: 'bold',
        color: '#fff',
    },
    subtitle: {
        fontSize: 14,
        color: '#94A3B8',
        marginBottom: 4,
    },
    logoutIcon: {
        padding: 12,
        backgroundColor: 'rgba(239, 68, 68, 0.1)',
        borderRadius: 14,
    },
    content: {
        padding: 24,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#fff',
        marginBottom: 16,
    },
    statsContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 30,
    },
    statBox: {
        width: '48%',
        backgroundColor: '#1E293B',
        padding: 20,
        borderRadius: 24,
        alignItems: 'flex-start',
        borderWidth: 1,
        borderColor: '#334155',
    },
    statIconBox: {
        padding: 10,
        borderRadius: 12,
        marginBottom: 16,
    },
    statValue: {
        fontSize: 22,
        fontWeight: 'bold',
        color: '#fff',
        marginBottom: 4,
    },
    statLabel: {
        fontSize: 12,
        color: '#94A3B8',
        fontWeight: 'bold',
    },
    grid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
        paddingBottom: 40,
    },
    card: {
        width: '48%',
        padding: 16,
        paddingVertical: 20,
        backgroundColor: '#1E293B',
        borderRadius: 24,
        marginBottom: 16,
        borderWidth: 1,
        borderColor: '#334155',
    },
    iconContainer: {
        width: 55,
        height: 55,
        borderRadius: 16,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 16,
    },
    cardTextContainer: {
        flex: 1,
    },
    cardTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#fff',
        marginBottom: 4,
    },
    cardInfo: {
        fontSize: 12,
        color: '#94A3B8',
        lineHeight: 18,
    }
});

export default AdminDashboard;
