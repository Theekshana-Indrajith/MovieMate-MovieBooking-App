import React, { useContext } from 'react';
import { StyleSheet, View, TouchableOpacity, Dimensions, Text } from 'react-native';
import { Film, Ticket, ShoppingBag, User, ClipboardList, LayoutDashboard } from 'lucide-react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { AuthContext } from '../context/AuthContext';

const { width } = Dimensions.get('window');

const BottomNav = () => {
    const navigation = useNavigation();
    const route = useRoute();
    const { user } = useContext(AuthContext);

    const activeTab = route.name;
    const isAdmin = user?.role === 'admin';

    const navItems = isAdmin ? [
        { name: 'Dashboard', label: 'Home', icon: LayoutDashboard, screen: 'Dashboard' },
        { name: 'AdminMovieList', label: 'Movies', icon: Film, screen: 'AdminMovieList' },
        { name: 'AdminBookings', label: 'Bookings', icon: Ticket, screen: 'AdminBookings' },
        { name: 'AdminSnackOrders', label: 'Orders', icon: ShoppingBag, screen: 'AdminSnackOrders' },
        { name: 'Profile', label: 'Profile', icon: User, screen: 'Profile' },
    ] : [
        { name: 'Dashboard', label: 'Home', icon: LayoutDashboard, screen: 'Dashboard' },
        { name: 'UserBookings', label: 'Tickets', icon: Ticket, screen: 'UserBookings' },
        { name: 'UserSnackMenu', label: 'Snacks', icon: ShoppingBag, screen: 'UserSnackMenu' },
        { name: 'UserSnackOrders', label: 'Orders', icon: ClipboardList, screen: 'UserSnackOrders' },
        { name: 'Profile', label: 'Profile', icon: User, screen: 'Profile' },
    ];

    return (
        <View style={styles.bottomNav}>
            {navItems.map((item, index) => {
                const Icon = item.icon;
                const isActive = activeTab === item.name || (item.name === 'Dashboard' && activeTab === 'Dashboard');
                
                return (
                    <TouchableOpacity 
                        key={index}
                        style={styles.navItem} 
                        onPress={() => navigation.navigate(item.screen)}
                    >
                        <Icon color={isActive ? '#6366F1' : '#64748B'} size={22} />
                        <Text style={[styles.navText, isActive && styles.navTextActive]}>
                            {item.label}
                        </Text>
                    </TouchableOpacity>
                );
            })}
        </View>
    );
};

const styles = StyleSheet.create({
    bottomNav: { 
        position: 'absolute', 
        bottom: 25, 
        left: 20, 
        right: 20, 
        height: 75, 
        backgroundColor: '#161B2E', 
        borderRadius: 24, 
        flexDirection: 'row', 
        justifyContent: 'space-around', 
        alignItems: 'center', 
        borderWidth: 1, 
        borderColor: '#1F2937', 
        elevation: 20, 
        shadowColor: '#000', 
        shadowOffset: { width: 0, height: 10 }, 
        shadowOpacity: 0.4, 
        shadowRadius: 20,
        paddingHorizontal: 8
    },
    navItem: { alignItems: 'center', justifyContent: 'center', flex: 1, height: '100%', paddingTop: 5 },
    navText: { fontSize: 9, color: '#64748B', fontWeight: 'bold', marginTop: 4 },
    navTextActive: { color: '#6366F1' }
});

export default BottomNav;
