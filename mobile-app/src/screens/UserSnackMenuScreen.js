import React, { useState, useEffect, useContext } from 'react';
import { StyleSheet, Text, View, FlatList, TouchableOpacity, Image, SafeAreaView, ActivityIndicator, Alert, Platform, ScrollView, Modal, TextInput } from 'react-native';
import { AuthContext } from '../context/AuthContext';
import api from '../utils/api';
import { ArrowLeft, ShoppingCart, Plus, Minus, X, Trash2, CheckCircle2 } from 'lucide-react-native';
import SkeletonLoader from '../components/SkeletonLoader';
import BASE_URL from '../utils/constants';
import BottomNav from '../components/BottomNav';

const UserSnackMenuScreen = ({ navigation }) => {
    const { token } = useContext(AuthContext);
    const [snacks, setSnacks] = useState([]);
    const [bookings, setBookings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [cart, setCart] = useState([]);
    const [showCart, setShowCart] = useState(false);
    
    // Selection state
    const [selectedBooking, setSelectedBooking] = useState(null);
    const [deliveryMethod, setDeliveryMethod] = useState('Pickup'); // Default
    const [selectedSeat, setSelectedSeat] = useState('');
    const [bookingModalVisible, setBookingModalVisible] = useState(false);
    const [orderLoading, setOrderLoading] = useState(false);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [snackRes, bookingRes] = await Promise.all([
                    api.get('/snacks'),
                    api.get('/bookings', { headers: { Authorization: `Bearer ${token}` } })
                ]);
                
                setSnacks(snackRes.data.data.filter(s => s.isAvailable));
                // Only confirmed bookings and filter out past showtimes
                const userBookings = bookingRes.data.data.filter(b => {
                    if (b.status !== 'Confirmed') return false;
                    
                    const showDate = new Date(b.showtime?.date);
                    const today = new Date();
                    
                    // If show date is in the future (next days)
                    if (showDate.setHours(0,0,0,0) > today.setHours(0,0,0,0)) return true;
                    
                    // If show date is today
                    if (showDate.setHours(0,0,0,0) === today.setHours(0,0,0,0)) {
                        const timeStr = b.time || ""; 
                        const parts = timeStr.trim().split(/\s+/);
                        const timeVal = parts[0];
                        const modifier = parts[1];
                        
                        let [hours, minutes] = timeVal.split(':');
                        if (hours === '12') hours = '00';
                        hours = parseInt(hours, 10);
                        if (modifier && modifier.toLowerCase() === 'pm') hours += 12;
                        
                        const startTime = new Date(b.showtime?.date);
                        startTime.setHours(hours, parseInt(minutes || 0, 10), 0, 0);
                        
                        const movieDuration = b.showtime?.movie?.duration || 150; // default 2.5 hours if unknown
                        const endTime = new Date(startTime.getTime() + (movieDuration * 60 * 1000));
                        
                        const now = new Date();
                        // It's either in the future OR currently happening (now is between start and end)
                        return now < endTime; 
                    }
                    
                    return false; // past days
                });
                
                setBookings(userBookings);
                
                if (userBookings.length > 0) {
                    setSelectedBooking(userBookings[0]);
                }
            } catch (err) {
                console.log(err);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [token]);

    const addToCart = (snack) => {
        const existing = cart.find(item => item.snack._id === snack._id);
        if (existing) {
            setCart(cart.map(item => 
                item.snack._id === snack._id 
                ? { ...item, quantity: item.quantity + 1 } 
                : item
            ));
        } else {
            setCart([...cart, { snack, quantity: 1, price: snack.price }]);
        }
    };

    const updateQuantity = (id, delta) => {
        setCart(cart.map(item => {
            if (item.snack._id === id) {
                const newQty = item.quantity + delta;
                return newQty > 0 ? { ...item, quantity: newQty } : item;
            }
            return item;
        }));
    };

    const removeFromCart = (id) => {
        setCart(cart.filter(item => item.snack._id !== id));
    };

    const totalAmount = cart.reduce((acc, curr) => acc + (curr.price * curr.quantity), 0);

    const handlePlaceOrder = async () => {
        if (cart.length === 0) return;
        if (!selectedBooking) {
            Alert.alert('Booking Required', 'Please select a valid booking first.');
            return;
        }
        if (deliveryMethod === 'In-Seat' && !selectedSeat) {
            Alert.alert('Seat Required', 'Please select your seat for delivery.');
            return;
        }

        setOrderLoading(true);
        const orderData = {
            booking: selectedBooking._id,
            items: cart.map(c => ({
                snack: c.snack._id,
                quantity: c.quantity,
                price: c.price
            })),
            totalAmount,
            deliveryMethod,
            seatNumber: deliveryMethod === 'In-Seat' ? selectedSeat : null
        };

        try {
            await api.post('/snacks/orders', orderData, {
                headers: { Authorization: `Bearer ${token}` }
            });
            
            if (Platform.OS === 'web') window.alert('Order placed successfully! Enjoy your snacks.');
            else Alert.alert('Success', 'Order placed! We are preparing your snacks.');
            
            setCart([]);
            setShowCart(false);
            navigation.navigate('UserSnackOrders'); // Link to order history
        } catch (err) {
            Alert.alert('Error', 'Failed to place order.');
        } finally {
            setOrderLoading(false);
        }
    };

    const renderSnack = ({ item }) => (
        <View style={styles.snackCard}>
            <Image 
                source={{ uri: `${BASE_URL}/uploads/snacks/${item.image}` }} 
                style={styles.snackImage} 
            />
            <View style={styles.snackInfo}>
                <Text style={styles.snackName}>{item.name}</Text>
                <Text style={styles.snackDesc} numberOfLines={2}>{item.description}</Text>
                <View style={styles.snackFooter}>
                    <Text style={styles.snackPrice}>Rs. {item.price}</Text>
                    <TouchableOpacity style={styles.addBtn} onPress={() => addToCart(item)}>
                        <Plus color="#fff" size={18} />
                        <Text style={styles.addBtnText}>Add</Text>
                    </TouchableOpacity>
                </View>
            </View>
        </View>
    );

    if (loading) return (
        <SafeAreaView style={styles.container}>
            <View style={styles.center}><ActivityIndicator color="#F59E0B" size="large" /></View>
        </SafeAreaView>
    );

    if (bookings.length === 0) return (
        <SafeAreaView style={styles.container}>
             <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                    <ArrowLeft color="#fff" size={24} />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Snacks Menu</Text>
                <View style={{ width: 44 }} />
            </View>
            <View style={styles.center}>
                <X color="#EF4444" size={50} />
                <Text style={styles.emptyText}>You need an active movie booking to order snacks.</Text>
                <TouchableOpacity style={styles.mainBtn} onPress={() => navigation.navigate('UserMovieList')}>
                    <Text style={styles.mainBtnText}>Book a Ticket Now</Text>
                </TouchableOpacity>
            </View>
        </SafeAreaView>
    );

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                    <ArrowLeft color="#fff" size={24} />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Snacks & Drinks</Text>
                <TouchableOpacity style={styles.cartIcon} onPress={() => setShowCart(true)}>
                    <ShoppingCart color="#fff" size={24} />
                    {cart.length > 0 && <View style={styles.badge}><Text style={styles.badgeText}>{cart.length}</Text></View>}
                </TouchableOpacity>
            </View>

            {/* Selection Header */}
            <View style={styles.selectionBar}>
                <TouchableOpacity style={styles.bookingSelector} onPress={() => setBookingModalVisible(true)}>
                    <Text style={styles.labelSmall}>Ordering for:</Text>
                    <Text style={styles.selectedBookingText} numberOfLines={1}>
                        🎟️ {selectedBooking?.showtime?.movie?.title} ({selectedBooking?.time})
                    </Text>
                </TouchableOpacity>
            </View>

            <FlatList
                data={snacks}
                keyExtractor={(item) => item._id}
                renderItem={renderSnack}
                contentContainerStyle={[styles.listContent, { paddingBottom: 150 }]}
                showsVerticalScrollIndicator={false}
            />

            <BottomNav />

            {/* Floating Cart Button */}
            {cart.length > 0 && !showCart && (
                <TouchableOpacity style={styles.floatingCart} onPress={() => setShowCart(true)}>
                    <Text style={styles.floatTotal}>Rs. {totalAmount}</Text>
                    <View style={styles.floatCallout}>
                        <Text style={styles.floatText}>View Cart</Text>
                        <ShoppingCart color="#fff" size={20} style={{ marginLeft: 8 }} />
                    </View>
                </TouchableOpacity>
            )}

            {/* Booking Selection Modal */}
            <Modal visible={bookingModalVisible} animationType="slide" transparent>
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
                        <Text style={styles.modalTitle}>Select Your Booking</Text>
                        <ScrollView>
                            {bookings.map(book => (
                                <TouchableOpacity 
                                    key={book._id} 
                                    style={[styles.bookingOption, selectedBooking?._id === book._id && styles.bookingOptionSelected]}
                                    onPress={() => { setSelectedBooking(book); setSelectedSeat(''); setBookingModalVisible(false); }}
                                >
                                    <Text style={styles.bookMovieTitle}>{book.showtime?.movie?.title}</Text>
                                    <Text style={styles.bookDateTime}>{new Date(book.showtime?.date).toDateString()} • {book.time}</Text>
                                    <Text style={styles.bookSeats}>Seats: {book.seats?.join(', ')}</Text>
                                </TouchableOpacity>
                            ))}
                        </ScrollView>
                        <TouchableOpacity style={styles.closeModalBtn} onPress={() => setBookingModalVisible(false)}>
                            <Text style={styles.closeModalText}>Close</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>

            {/* Cart Modal */}
            <Modal visible={showCart} animationType="slide" transparent>
                <View style={styles.modalOverlay}>
                    <View style={[styles.modalContent, { height: '85%', marginTop: 'auto' }]}>
                        <View style={styles.cartHeader}>
                            <Text style={styles.modalTitle}>Shopping Cart</Text>
                            <TouchableOpacity onPress={() => setShowCart(false)}><X color="#94A3B8" size={24} /></TouchableOpacity>
                        </View>

                        <ScrollView style={styles.cartItemsScroll} showsVerticalScrollIndicator={false}>
                            {cart.length === 0 ? (
                                <View style={styles.emptyCartBox}>
                                    <ShoppingCart color="#334155" size={60} />
                                    <Text style={styles.emptyText}>Your cart is empty</Text>
                                </View>
                            ) : (
                                cart.map(item => (
                                    <View key={item.snack._id} style={styles.cartItem}>
                                        <Image source={{ uri: `${BASE_URL}/uploads/snacks/${item.snack.image}` }} style={styles.cartItemImg} />
                                        <View style={{ flex: 1, marginLeft: 15 }}>
                                            <Text style={styles.cartItemName}>{item.snack.name}</Text>
                                            <Text style={styles.cartItemPrice}>Rs. {item.price}</Text>                                            
                                        </View>
                                        <View style={styles.qtyContainer}>
                                            <TouchableOpacity onPress={() => updateQuantity(item.snack._id, -1)}><Minus color="#fff" size={16} /></TouchableOpacity>
                                            <Text style={styles.qtyText}>{item.quantity}</Text>
                                            <TouchableOpacity onPress={() => updateQuantity(item.snack._id, 1)}><Plus color="#fff" size={16} /></TouchableOpacity>
                                        </View>
                                        <TouchableOpacity style={{ marginLeft: 15 }} onPress={() => removeFromCart(item.snack._id)}>
                                            <Trash2 color="#EF4444" size={20} />
                                        </TouchableOpacity>
                                    </View>
                                ))
                            )}

                            {cart.length > 0 && (
                                <View style={styles.checkoutOptions}>
                                    <Text style={styles.optionTitle}>Delivery Method</Text>
                                    <View style={styles.methodRow}>
                                        <TouchableOpacity 
                                            style={[styles.methodBtn, deliveryMethod === 'Pickup' && styles.methodBtnActive]}
                                            onPress={() => setDeliveryMethod('Pickup')}
                                        >
                                            <Text style={[styles.methodText, deliveryMethod === 'Pickup' && { color: '#fff' }]}>🍿 Counter Pickup</Text>
                                        </TouchableOpacity>
                                        <TouchableOpacity 
                                            style={[styles.methodBtn, deliveryMethod === 'In-Seat' && styles.methodBtnActive]}
                                            onPress={() => setDeliveryMethod('In-Seat')}
                                        >
                                            <Text style={[styles.methodText, deliveryMethod === 'In-Seat' && { color: '#fff' }]}>🛋️ In-Seat Delivery</Text>
                                        </TouchableOpacity>
                                    </View>

                                    {deliveryMethod === 'In-Seat' && (
                                        <View style={{ marginTop: 20 }}>
                                            <Text style={styles.optionTitle}>Deliver to which seat?</Text>
                                            <View style={styles.seatRow}>
                                                {selectedBooking?.seats?.map(seat => (
                                                    <TouchableOpacity 
                                                        key={seat}
                                                        style={[styles.seatOption, selectedSeat === seat && styles.seatOptionActive]}
                                                        onPress={() => setSelectedSeat(seat)}
                                                    >
                                                        <Text style={[styles.seatOptionText, selectedSeat === seat && { color: '#fff' }]}>{seat}</Text>
                                                    </TouchableOpacity>
                                                ))}
                                            </View>
                                        </View>
                                    )}
                                </View>
                            )}
                        </ScrollView>

                        <View style={styles.cartFooterBorder}>
                            <View style={styles.totalRow}>
                                <Text style={styles.totalLabelLarge}>Grand Total</Text>
                                <Text style={styles.totalValueLarge}>Rs. {totalAmount}</Text>
                            </View>
                            <TouchableOpacity 
                                style={[styles.placeOrderBtn, cart.length === 0 && { opacity: 0.5 }]} 
                                onPress={handlePlaceOrder}
                                disabled={cart.length === 0 || orderLoading}
                            >
                                {orderLoading ? <ActivityIndicator color="#fff" /> : (
                                    <>
                                        <CheckCircle2 color="#fff" size={20} />
                                        <Text style={styles.placeOrderText}>Place Order Now</Text>
                                    </>
                                )}
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#030712' },
    header: { 
        flexDirection: 'row', 
        justifyContent: 'space-between', 
        alignItems: 'center', 
        paddingHorizontal: 20, 
        paddingBottom: 25,
        paddingTop: Platform.OS === 'ios' ? 60 : 40,
        backgroundColor: '#0F172A', 
        borderBottomLeftRadius: 35, 
        borderBottomRightRadius: 35,
        shadowColor: '#6366F1',
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.1,
        shadowRadius: 20,
        elevation: 10
    },
    headerTitle: { fontSize: 22, fontWeight: '900', color: '#F8FAFC', letterSpacing: -0.5 },
    backButton: { padding: 12, backgroundColor: 'rgba(255,255,255,0.03)', borderRadius: 16, borderWidth: 1, borderColor: 'rgba(255,255,255,0.08)' },
    cartIcon: { padding: 12, backgroundColor: 'rgba(99, 102, 241, 0.1)', borderRadius: 16 },
    badge: { position: 'absolute', top: 5, right: 5, backgroundColor: '#EF4444', minWidth: 18, height: 18, borderRadius: 9, justifyContent: 'center', alignItems: 'center', borderWidth: 2, borderColor: '#030712' },
    badgeText: { color: '#fff', fontSize: 9, fontWeight: '900' },
    selectionBar: { padding: 20, backgroundColor: '#030712' },
    bookingSelector: { 
        backgroundColor: '#0F172A', 
        padding: 16, 
        borderRadius: 22, 
        borderWidth: 1, 
        borderColor: 'rgba(255,255,255,0.05)',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 8
    },
    labelSmall: { color: '#64748B', fontSize: 11, fontWeight: '800', marginBottom: 6, textTransform: 'uppercase', letterSpacing: 1 },
    selectedBookingText: { color: '#fff', fontSize: 14, fontWeight: '700' },
    listContent: { padding: 20, paddingBottom: 120 },
    snackCard: { 
        flexDirection: 'row', 
        backgroundColor: '#0F172A', 
        borderRadius: 28, 
        padding: 12, 
        marginBottom: 20, 
        borderWidth: 1, 
        borderColor: 'rgba(255,255,255,0.05)',
        alignItems: 'center'
    },
    snackImage: { width: 100, height: 105, borderRadius: 22, backgroundColor: '#1E293B' },
    snackInfo: { flex: 1, marginLeft: 18, justifyContent: 'space-between', height: 95 },
    snackName: { color: '#F8FAFC', fontSize: 17, fontWeight: '800' },
    snackDesc: { color: '#64748B', fontSize: 12, lineHeight: 18, marginTop: 4 },
    snackFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 10 },
    snackPrice: { color: '#10B981', fontSize: 19, fontWeight: '900' },
    addBtn: { 
        flexDirection: 'row', 
        alignItems: 'center', 
        backgroundColor: '#6366F1', 
        paddingHorizontal: 16, 
        paddingVertical: 10, 
        borderRadius: 14,
        shadowColor: '#6366F1',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 10,
        elevation: 4
    },
    addBtnText: { color: '#fff', fontSize: 13, fontWeight: '800', marginLeft: 6 },
    floatingCart: { 
        position: 'absolute', 
        bottom: 110, 
        left: 20, 
        right: 20, 
        backgroundColor: '#6366F1', 
        padding: 20, 
        borderRadius: 25, 
        flexDirection: 'row', 
        justifyContent: 'space-between', 
        alignItems: 'center', 
        elevation: 10, 
        shadowColor: '#6366F1', 
        shadowOffset: { width: 0, height: 10 }, 
        shadowOpacity: 0.4, 
        shadowRadius: 20 
    },
    floatTotal: { color: '#fff', fontSize: 22, fontWeight: '900' },
    floatCallout: { flexDirection: 'row', alignItems: 'center' },
    floatText: { color: '#fff', fontSize: 16, fontWeight: '800' },
    center: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 40 },
    emptyText: { color: '#64748B', fontSize: 16, textAlign: 'center', marginVertical: 25, fontWeight: '600' },
    mainBtn: { 
        backgroundColor: '#6366F1', 
        paddingHorizontal: 30, 
        paddingVertical: 16, 
        borderRadius: 20,
        shadowColor: '#6366F1',
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.3,
        shadowRadius: 15,
        elevation: 8
    },
    mainBtnText: { color: '#fff', fontWeight: '900', letterSpacing: 0.5 },
    modalOverlay: { flex: 1, backgroundColor: 'rgba(3, 7, 18, 0.9)', justifyContent: 'center' },
    modalContent: { backgroundColor: '#0F172A', margin: 20, borderRadius: 35, padding: 25, maxHeight: '85%', borderWidth: 1, borderColor: 'rgba(255,255,255,0.05)' },
    modalTitle: { color: '#F8FAFC', fontSize: 22, fontWeight: '900', marginBottom: 25, letterSpacing: -0.5 },
    bookingOption: { backgroundColor: 'rgba(255,255,255,0.02)', padding: 18, borderRadius: 24, marginBottom: 15, borderWidth: 1, borderColor: 'rgba(255,255,255,0.05)' },
    bookingOptionSelected: { borderColor: '#6366F1', backgroundColor: 'rgba(99, 102, 241, 0.08)' },
    bookMovieTitle: { color: '#F8FAFC', fontSize: 17, fontWeight: '800' },
    bookDateTime: { color: '#64748B', fontSize: 13, marginTop: 6, fontWeight: '600' },
    bookSeats: { color: '#10B981', fontSize: 13, fontWeight: '800', marginTop: 6 },
    closeModalBtn: { marginTop: 15, padding: 20, alignItems: 'center', backgroundColor: 'rgba(255,255,255,0.02)', borderRadius: 20 },
    closeModalText: { color: '#94A3B8', fontWeight: '800', fontSize: 15 },
    cartHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 25 },
    cartItem: { flexDirection: 'row', alignItems: 'center', marginBottom: 18, backgroundColor: 'rgba(255,255,255,0.02)', padding: 15, borderRadius: 24, borderWidth: 1, borderColor: 'rgba(255,255,255,0.03)' },
    cartItemImg: { width: 60, height: 60, borderRadius: 14, backgroundColor: '#030712' },
    cartItemName: { color: '#F8FAFC', fontSize: 15, fontWeight: '800' },
    cartItemPrice: { color: '#10B981', fontSize: 13, fontWeight: '900', marginTop: 4 },
    qtyContainer: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#1E293B', borderRadius: 12, padding: 8, borderWidth: 1, borderColor: 'rgba(255,255,255,0.05)' },
    qtyText: { color: '#fff', marginHorizontal: 15, fontWeight: '900', fontSize: 15 },
    checkoutOptions: { paddingVertical: 25, borderTopWidth: 1, borderTopColor: 'rgba(255,255,255,0.03)', marginTop: 10 },
    optionTitle: { color: '#F8FAFC', fontSize: 16, fontWeight: '900', marginBottom: 18 },
    methodRow: { flexDirection: 'row', justifyContent: 'space-between' },
    methodBtn: { flex: 0.48, padding: 15, borderRadius: 18, borderWidth: 1, borderColor: 'rgba(255,255,255,0.05)', alignItems: 'center', backgroundColor: 'rgba(255,255,255,0.02)' },
    methodBtnActive: { borderColor: '#6366F1', backgroundColor: 'rgba(99, 102, 241, 0.08)' },
    methodText: { color: '#64748B', fontSize: 12, fontWeight: '800' },
    seatRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginTop: 5 },
    seatOption: { paddingHorizontal: 18, paddingVertical: 10, borderRadius: 14, backgroundColor: 'rgba(255,255,255,0.02)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.05)' },
    seatOptionActive: { backgroundColor: '#6366F1', borderColor: '#6366F1' },
    seatOptionText: { color: '#94A3B8', fontWeight: '800', fontSize: 13 },
    cartFooterBorder: { paddingTop: 25, borderTopWidth: 1, borderTopColor: 'rgba(255,255,255,0.03)', marginTop: 'auto' },
    totalRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 25 },
    totalLabelLarge: { color: '#64748B', fontSize: 15, fontWeight: '800', textTransform: 'uppercase', letterSpacing: 1 },
    totalValueLarge: { color: '#F1F5F9', fontSize: 28, fontWeight: '900' },
    placeOrderBtn: { 
        flexDirection: 'row', 
        backgroundColor: '#10B981', 
        padding: 20, 
        borderRadius: 24, 
        justifyContent: 'center', 
        alignItems: 'center',
        shadowColor: '#10B981',
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.3,
        shadowRadius: 15,
        elevation: 8
    },
    placeOrderText: { color: '#fff', fontSize: 17, fontWeight: '900', marginLeft: 12, letterSpacing: 0.5 }
});

export default UserSnackMenuScreen;
