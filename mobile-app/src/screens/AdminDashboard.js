import React, { useContext, useState, useEffect } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, ScrollView, SafeAreaView, ActivityIndicator, Dimensions, StatusBar, ImageBackground } from 'react-native';
import { AuthContext } from '../context/AuthContext';
import api from '../utils/api';
import { 
    Film, Calendar, Armchair, Utensils, 
    LogOut, TrendingUp, Users, BarChart3, 
    CreditCard, ShieldCheck, ChevronRight, 
    Activity, Clock
} from 'lucide-react-native';
import BottomNav from '../components/BottomNav';

const { width } = Dimensions.get('window');

const AdminDashboard = ({ navigation }) => {
    const { logout, user, token } = useContext(AuthContext);
    const [stats, setStats] = useState({ totalRevenue: 0, todayRevenue: 0, totalBookings: 0, pendingBookings: 0, topMovies: [] });
    const [loading, setLoading] = useState(true);

    const currentTime = new Date().toLocaleDateString('en-US', { weekday: 'long', day: 'numeric', month: 'long' });

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const res = await api.get('/bookings/admin/stats', {
                    headers: { Authorization: `Bearer ${token}` }
                });
                setStats(res.data.data);
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

    const managementModules = [
        { id: 'verify', name: 'Verify Payments', desc: 'Confirm manual slips', icon: <ShieldCheck color="#fff" size={22} />, color: '#F59E0B', screen: 'AdminVerification', badgeCount: stats.pendingBookings || 0 },
        { id: 'orders', name: 'Snack Orders', desc: 'Manage customer orders', icon: <Utensils color="#fff" size={22} />, color: '#EF4444', screen: 'AdminSnackOrders', badgeCount: stats.pendingOrders || 0 },
        { id: 'shows', name: 'Showtimes', desc: 'Schedule movies', icon: <Calendar color="#fff" size={22} />, color: '#8B5CF6', screen: 'AdminShowtime', badgeCount: 0 },
        { id: 'seats', name: 'Seats', desc: 'Manage hall layout', icon: <Armchair color="#fff" size={22} />, color: '#10B981', screen: 'AdminSeats', badgeCount: 0 },
        { id: 'snacks', name: 'Snack Items', desc: 'Inventory control', icon: <Utensils color="#fff" size={22} />, color: '#EC4899', screen: 'AdminSnacks', badgeCount: 0 },
    ];

    const maxRevenue = stats.topMovies?.length > 0 ? Math.max(...stats.topMovies.map(m => m.revenue)) : 0;

    return (
        <SafeAreaView style={styles.container}>
            <StatusBar barStyle="light-content" />
            
            <View style={styles.topHeader}>
                <View>
                    <Text style={styles.dateText}>{currentTime}</Text>
                    <View style={styles.greetingRow}>
                        <Text style={styles.title}>Hello, {user?.name.split(' ')[0]}</Text>
                        <View style={styles.adminBadge}><Text style={styles.adminBadgeText}>ADMIN</Text></View>
                    </View>
                </View>
                <TouchableOpacity onPress={logout} style={styles.logoutBtn}>
                    <LogOut color="#EF4444" size={20} />
                </TouchableOpacity>
            </View>

            <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
                {/* Main Hero Stat */}
                <TouchableOpacity 
                    activeOpacity={0.9} 
                    style={styles.heroCard}
                    onPress={() => navigation.navigate('AdminBookings')}
                >
                    <View>
                        <Text style={styles.heroLabel}>Total Revenue</Text>
                        <Text style={styles.heroValue}>Rs. {stats.totalRevenue.toLocaleString()}</Text>
                        <View style={styles.heroFooter}>
                            <Activity color="#10B981" size={14} />
                            <Text style={styles.heroFooterText}>Over {stats.totalBookings} successfull bookings</Text>
                        </View>
                    </View>
                    <View style={styles.heroIconBox}>
                        <TrendingUp color="#fff" size={32} />
                    </View>
                </TouchableOpacity>

                {/* Sub Stats */}
                <View style={styles.statsGrid}>
                    <View style={styles.subStatCard}>
                        <View style={[styles.subIconBox, { backgroundColor: 'rgba(59, 130, 246, 0.1)' }]}>
                            <Users color="#3B82F6" size={18} />
                        </View>
                        <Text style={styles.subStatValue}>{stats.totalBookings}</Text>
                        <Text style={styles.subStatLabel}>All Bookings</Text>
                    </View>
                    <TouchableOpacity 
                        style={[styles.subStatCard, stats.pendingBookings > 0 && styles.alertCard]}
                        onPress={() => navigation.navigate('AdminVerification')}
                    >
                        <View style={[styles.subIconBox, { backgroundColor: stats.pendingBookings > 0 ? 'rgba(245, 158, 11, 0.2)' : 'rgba(16, 185, 129, 0.1)' }]}>
                            <CreditCard color={stats.pendingBookings > 0 ? "#F59E0B" : "#10B981"} size={18} />
                        </View>
                        <Text style={[styles.subStatValue, stats.pendingBookings > 0 && { color: '#F59E0B' }]}>{stats.pendingBookings}</Text>
                        <Text style={styles.subStatLabel}>To Verify</Text>
                    </TouchableOpacity>
                </View>

                {/* Movie Performance Section */}
                <View style={styles.sectionHeader}>
                    <Text style={styles.sectionTitle}>Movie Performance</Text>
                    <BarChart3 color="#6366F1" size={18} />
                </View>

                <View style={styles.performanceCard}>
                    {loading ? (
                        <ActivityIndicator color="#6366F1" style={{ margin: 20 }} />
                    ) : stats.topMovies.length === 0 ? (
                        <Text style={styles.noData}>No data recorded yet</Text>
                    ) : (
                        stats.topMovies.map((movie, index) => (
                            <View key={index} style={styles.chartRow}>
                                <View style={styles.chartInfo}>
                                    <Text style={styles.chartMovieName} numberOfLines={1}>{movie.title}</Text>
                                    <Text style={styles.chartAmount}>Rs. {movie.revenue.toLocaleString()}</Text>
                                </View>
                                <View style={styles.progressBarBg}>
                                    <View
                                        style={[
                                            styles.progressBarFill,
                                            { 
                                                width: `${Math.max(5, (movie.revenue / maxRevenue) * 100)}%`, 
                                                backgroundColor: index === 0 ? '#6366F1' : '#4F46E5' 
                                            }
                                        ]}
                                    />
                                </View>
                            </View>
                        ))
                    )}
                </View>

                {/* Management Modules */}
                <Text style={styles.sectionTitle}>Quick Management</Text>
                <View style={styles.moduleList}>
                    {managementModules.map(module => (
                        <TouchableOpacity
                            key={module.id}
                            style={styles.wideModuleCard}
                            onPress={() => navigation.navigate(module.screen)}
                            activeOpacity={0.7}
                        >
                            <View style={[styles.wideModuleIcon, { backgroundColor: module.color }]}>
                                {module.icon}
                            </View>
                            <View style={styles.wideModuleContent}>
                                <Text style={styles.wideModuleName}>{module.name}</Text>
                                <Text style={styles.wideModuleDesc}>{module.desc}</Text>
                            </View>
                            
                            {module.badgeCount > 0 && (
                                <View style={styles.notificationBadge}>
                                    <Text style={styles.notificationBadgeText}>
                                        {module.badgeCount > 99 ? '99+' : module.badgeCount}
                                    </Text>
                                </View>
                            )}

                            <ChevronRight color="#475569" size={20} />
                        </TouchableOpacity>
                    ))}
                </View>

                <View style={{ height: 120 }} />
            </ScrollView>
            <BottomNav />
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#0A0F1D' },
    topHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 24, paddingVertical: 20 },
    dateText: { color: '#64748B', fontSize: 12, fontWeight: '600', marginBottom: 4 },
    greetingRow: { flexDirection: 'row', alignItems: 'center' },
    title: { fontSize: 24, fontWeight: 'bold', color: '#fff' },
    adminBadge: { backgroundColor: 'rgba(99, 102, 241, 0.15)', paddingHorizontal: 8, paddingVertical: 2, borderRadius: 6, marginLeft: 10, borderWidth: 1, borderColor: 'rgba(99, 102, 241, 0.3)' },
    adminBadgeText: { color: '#6366F1', fontSize: 10, fontWeight: 'bold', letterSpacing: 1 },
    logoutBtn: { padding: 12, backgroundColor: 'rgba(239, 68, 68, 0.08)', borderRadius: 16 },
    
    content: { padding: 20 },

    heroCard: { backgroundColor: '#6366F1', padding: 25, borderRadius: 32, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20, elevation: 10, shadowColor: '#6366F1', shadowOffset: { width: 0, height: 10 }, shadowOpacity: 0.3, shadowRadius: 20 },
    heroLabel: { color: 'rgba(255,255,255,0.7)', fontSize: 14, fontWeight: '600' },
    heroValue: { color: '#fff', fontSize: 28, fontWeight: 'bold', marginVertical: 6 },
    heroFooter: { flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(0,0,0,0.15)', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20, alignSelf: 'flex-start' },
    heroFooterText: { color: '#fff', fontSize: 11, fontWeight: 'bold', marginLeft: 6 },
    heroIconBox: { width: 60, height: 60, borderRadius: 20, backgroundColor: 'rgba(255,255,255,0.2)', justifyContent: 'center', alignItems: 'center' },

    statsGrid: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 30 },
    subStatCard: { width: '48%', backgroundColor: '#161B2E', padding: 20, borderRadius: 24, borderWidth: 1, borderColor: '#1F2937' },
    alertCard: { borderColor: 'rgba(245, 158, 11, 0.3)', backgroundColor: 'rgba(245, 158, 11, 0.02)' },
    subIconBox: { width: 36, height: 36, borderRadius: 12, justifyContent: 'center', alignItems: 'center', marginBottom: 12 },
    subStatValue: { color: '#fff', fontSize: 20, fontWeight: 'bold' },
    subStatLabel: { color: '#64748B', fontSize: 12, fontWeight: '600', marginTop: 4 },

    sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 15, paddingHorizontal: 5 },
    sectionTitle: { fontSize: 18, fontWeight: 'bold', color: '#fff', marginBottom: 15 },
    
    performanceCard: { backgroundColor: '#161B2E', padding: 24, borderRadius: 32, borderWidth: 1, borderColor: '#1F2937', marginBottom: 30 },
    chartRow: { marginBottom: 20 },
    chartInfo: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 10 },
    chartMovieName: { color: '#CBD5E1', fontSize: 13, fontWeight: 'bold', flex: 1 },
    chartAmount: { color: '#6366F1', fontSize: 13, fontWeight: 'bold' },
    progressBarBg: { height: 8, backgroundColor: '#0A0F1D', borderRadius: 4, overflow: 'hidden' },
    progressBarFill: { height: '100%', borderRadius: 4 },

    moduleList: { gap: 12 },
    wideModuleCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#161B2E', padding: 16, borderRadius: 24, borderWidth: 1, borderColor: '#1F2937' },
    wideModuleIcon: { width: 44, height: 44, borderRadius: 14, justifyContent: 'center', alignItems: 'center' },
    wideModuleContent: { flex: 1, marginLeft: 16 },
    wideModuleName: { color: '#fff', fontSize: 15, fontWeight: 'bold' },
    wideModuleDesc: { color: '#64748B', fontSize: 11, marginTop: 2 },
    
    notificationBadge: { backgroundColor: '#EF4444', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 12, marginRight: 10 },
    notificationBadgeText: { color: '#fff', fontSize: 10, fontWeight: 'bold' },

    noData: { color: '#475569', fontSize: 14, textAlign: 'center', paddingVertical: 20 }
});

export default AdminDashboard;
