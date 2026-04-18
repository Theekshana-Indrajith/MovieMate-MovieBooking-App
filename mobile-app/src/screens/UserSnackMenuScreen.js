import React, { useState, useEffect, useContext } from 'react';
import { StyleSheet, Text, View, FlatList, TouchableOpacity, Image, SafeAreaView, ActivityIndicator, Alert, Platform, ScrollView, Modal, TextInput } from 'react-native';
import { AuthContext } from '../context/AuthContext';
import api from '../utils/api';
import { ArrowLeft, ShoppingCart, Plus, Minus, X, Trash2, CheckCircle2 } from 'lucide-react-native';
import SkeletonLoader from '../components/SkeletonLoader';

// Main Menu Screen for Users to Browse and Select Snacks
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
                    
                    // If show date is today, check if show time is also in future
                    if (showDate.setHours(0,0,0,0) === today.setHours(0,0,0,0)) {
                        const time = b.time || ""; 
                        const parts = time.trim().split(/\s+/);
                        const timeVal = parts[0];
                        const modifier = parts[1];
                        
                        let [hours, minutes] = timeVal.split(':');
                        if (hours === '12') hours = '00';
                        hours = parseInt(hours, 10);
                        if (modifier && modifier.toLowerCase() === 'pm') hours += 12;
                        
                        const actualShowTime = new Date(b.showtime?.date);
                        actualShowTime.setHours(hours, parseInt(minutes || 0, 10), 0, 0);
                        
                        return actualShowTime > new Date(); // only today future times
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
                source={{ uri: `http://192.168.8.106:5000/uploads/snacks/${item.image}` }} 
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
                contentContainerStyle={styles.listContent}
                showsVerticalScrollIndicator={false}
            />

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
                                        <Image source={{ uri: `http://192.168.8.106:5000/uploads/snacks/${item.snack.image}` }} style={styles.cartItemImg} />
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
    container: { flex: 1, backgroundColor: '#0F172A' },
    header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 20, backgroundColor: '#1E293B' },
    headerTitle: { fontSize: 18, fontWeight: 'bold', color: '#fff' },
    backButton: { padding: 10, backgroundColor: 'rgba(255,255,255,0.05)', borderRadius: 12 },
    cartIcon: { padding: 10, backgroundColor: 'rgba(59, 130, 246, 0.15)', borderRadius: 12 },
    badge: { position: 'absolute', top: 5, right: 5, backgroundColor: '#EF4444', width: 16, height: 16, borderRadius: 8, justifyContent: 'center', alignItems: 'center' },
    badgeText: { color: '#fff', fontSize: 10, fontWeight: 'bold' },
    selectionBar: { padding: 15, backgroundColor: '#1E293B', borderBottomWidth: 1, borderBottomColor: '#334155' },
    bookingSelector: { backgroundColor: 'rgba(255,255,255,0.03)', padding: 12, borderRadius: 14, borderWidth: 1, borderColor: '#334155' },
    labelSmall: { color: '#64748B', fontSize: 11, fontWeight: 'bold', marginBottom: 4 },
    selectedBookingText: { color: '#fff', fontSize: 14, fontWeight: 'bold' },
    listContent: { padding: 15, paddingBottom: 100 },
    snackCard: { flexDirection: 'row', backgroundColor: '#1E293B', borderRadius: 20, padding: 12, marginBottom: 15, borderWidth: 1, borderColor: '#334155' },
    snackImage: { width: 100, height: 100, borderRadius: 16 },
    snackInfo: { flex: 1, marginLeft: 15, justifyContent: 'space-between' },
    snackName: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
    snackDesc: { color: '#94A3B8', fontSize: 12, lineHeight: 18 },
    snackFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
    snackPrice: { color: '#10B981', fontSize: 18, fontWeight: 'bold' },
    addBtn: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#3B82F6', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 10 },
    addBtnText: { color: '#fff', fontSize: 12, fontWeight: 'bold', marginLeft: 4 },
    floatingCart: { position: 'absolute', bottom: 30, left: 20, right: 20, backgroundColor: '#10B981', padding: 18, borderRadius: 20, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', elevation: 10, shadowColor: '#10B981', shadowOffset: { width:0, height:10 }, shadowOpacity:0.4, shadowRadius: 20 },
    floatTotal: { color: '#fff', fontSize: 20, fontWeight: 'bold' },
    floatCallout: { flexDirection: 'row', alignItems: 'center' },
    floatText: { color: '#fff', fontSize: 15, fontWeight: 'bold' },
    center: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 40 },
    emptyText: { color: '#64748B', fontSize: 16, textAlign: 'center', marginVertical: 20 },
    mainBtn: { backgroundColor: '#3B82F6', paddingHorizontal: 24, paddingVertical: 14, borderRadius: 14 },
    mainBtnText: { color: '#fff', fontWeight: 'bold' },
    modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.8)', justifyContent: 'center' },
    modalContent: { backgroundColor: '#1E293B', margin: 20, borderRadius: 24, padding: 24, maxHeight: '80%' },
    modalTitle: { color: '#fff', fontSize: 20, fontWeight: 'bold', marginBottom: 20 },
    bookingOption: { backgroundColor: '#0F172A', padding: 16, borderRadius: 16, marginBottom: 12, borderWidth: 1, borderColor: '#334155' },
    bookingOptionSelected: { borderColor: '#F59E0B', backgroundColor: 'rgba(245, 158, 11, 0.05)' },
    bookMovieTitle: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
    bookDateTime: { color: '#94A3B8', fontSize: 13, marginTop: 4 },
    bookSeats: { color: '#10B981', fontSize: 12, fontWeight: 'bold', marginTop: 4 },
    closeModalBtn: { marginTop: 10, padding: 15, alignItems: 'center' },
    closeModalText: { color: '#64748B', fontWeight: 'bold' },
    cartHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
    cartItemsScroll: { flex: 1 },
    emptyCartBox: { padding: 40, alignItems: 'center' },
    cartItem: { flexDirection: 'row', alignItems: 'center', marginBottom: 15, backgroundColor: '#0F172A', padding: 12, borderRadius: 16 },
    cartItemImg: { width: 50, height: 50, borderRadius: 10 },
    cartItemName: { color: '#fff', fontSize: 14, fontWeight: 'bold' },
    cartItemPrice: { color: '#10B981', fontSize: 13, fontWeight: 'bold', marginTop: 2 },
    qtyContainer: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#334155', borderRadius: 8, padding: 4 },
    qtyText: { color: '#fff', marginHorizontal: 12, fontWeight: 'bold' },
    checkoutOptions: { paddingVertical: 20 },
    optionTitle: { color: '#fff', fontSize: 15, fontWeight: 'bold', marginBottom: 12 },
    methodRow: { flexDirection: 'row', justifyContent: 'space-between' },
    methodBtn: { flex: 0.48, padding: 12, borderRadius: 12, borderWidth: 1, borderColor: '#334155', alignItems: 'center', backgroundColor: '#0F172A' },
    methodBtnActive: { borderColor: '#10B981', backgroundColor: 'rgba(16, 185, 129, 0.1)' },
    methodText: { color: '#64748B', fontSize: 11, fontWeight: 'bold' },
    seatRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
    seatOption: { paddingHorizontal: 15, paddingVertical: 8, borderRadius: 10, backgroundColor: '#0F172A', borderWidth: 1, borderColor: '#334155' },
    seatOptionActive: { backgroundColor: '#3B82F6', borderColor: '#3B82F6' },
    seatOptionText: { color: '#94A3B8', fontWeight: 'bold' },
    cartFooterBorder: { paddingTop: 20, borderTopWidth: 1, borderTopColor: '#334155' },
    totalRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 15 },
    totalLabelLarge: { color: '#94A3B8', fontSize: 16 },
    totalValueLarge: { color: '#fff', fontSize: 24, fontWeight: 'bold' },
    placeOrderBtn: { flexDirection: 'row', backgroundColor: '#10B981', padding: 18, borderRadius: 16, justifyContent: 'center', alignItems: 'center' },
    placeOrderText: { color: '#fff', fontSize: 16, fontWeight: 'bold', marginLeft: 10 }
});

export default UserSnackMenuScreen;
