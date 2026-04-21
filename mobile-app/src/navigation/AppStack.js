import React, { useContext } from 'react';
import { View, ActivityIndicator } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { AuthContext } from '../context/AuthContext';

import LoginScreen from '../screens/LoginScreen';
import RegisterScreen from '../screens/RegisterScreen';
import AdminDashboard from '../screens/AdminDashboard';
import UserDashboard from '../screens/UserDashboard';
import AddMovieScreen from '../screens/AddMovieScreen';
import AdminMovieListScreen from '../screens/AdminMovieListScreen';
import AdminShowtimeScreen from '../screens/AdminShowtimeScreen';
import AddShowtimeScreen from '../screens/AddShowtimeScreen';
import EditMovieScreen from '../screens/EditMovieScreen';
import EditShowtimeScreen from '../screens/EditShowtimeScreen';
import AdminBookingsScreen from '../screens/AdminBookingsScreen';
import AdminVerificationScreen from '../screens/AdminVerificationScreen';
import AdminSeatsScreen from '../screens/AdminSeatsScreen';
import AddSeatRowScreen from '../screens/AddSeatRowScreen';
import EditSeatRowScreen from '../screens/EditSeatRowScreen';
import AdminSeatViewScreen from '../screens/AdminSeatViewScreen';
import AdminSnackManagementScreen from '../screens/AdminSnackManagementScreen';
import AdminAddSnackScreen from '../screens/AdminAddSnackScreen';
import AdminSnackOrderScreen from '../screens/AdminSnackOrderScreen';
import MovieDetailsScreen from '../screens/MovieDetailsScreen';
import SeatSelectionScreen from '../screens/SeatSelectionScreen';
import UserBookingsScreen from '../screens/UserBookingsScreen';
import UserMovieListScreen from '../screens/UserMovieListScreen';
import UserSnackMenuScreen from '../screens/UserSnackMenuScreen';
import UserSnackOrderHistoryScreen from '../screens/UserSnackOrderHistoryScreen';
import ProfileScreen from '../screens/ProfileScreen';
import PaymentScreen from '../screens/PaymentScreen';

const Stack = createNativeStackNavigator();

const AppStack = () => {
    const { user, token, loading } = useContext(AuthContext);

    if (loading) {
        return (
            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#0A0F1D' }}>
                <ActivityIndicator size="large" color="#6366F1" />
            </View>
        );
    }

    return (
        <NavigationContainer>
            <Stack.Navigator screenOptions={{ headerShown: false }}>
                {token === null ? (
                    // Auth Stack
                    <>
                        <Stack.Screen name="Login" component={LoginScreen} />
                        <Stack.Screen name="Register" component={RegisterScreen} />
                    </>
                ) : (
                    // App Stack based on Role
                    <>
                        <Stack.Screen 
                            name="Dashboard" 
                            component={user?.role === 'admin' ? AdminDashboard : UserDashboard} 
                        />
                        <Stack.Screen name="Profile" component={ProfileScreen} />
                        <Stack.Screen name="MovieDetails" component={MovieDetailsScreen} />
                        <Stack.Screen name="SeatSelection" component={SeatSelectionScreen} />
                        <Stack.Screen name="Payment" component={PaymentScreen} />
                        <Stack.Screen name="UserBookings" component={UserBookingsScreen} />
                        <Stack.Screen name="UserMovieList" component={UserMovieListScreen} />
                        <Stack.Screen name="UserSnackMenu" component={UserSnackMenuScreen} />
                        <Stack.Screen name="UserSnackOrders" component={UserSnackOrderHistoryScreen} />
                        {user?.role === 'admin' && (
                            <>
                                <Stack.Screen name="AdminMovieList" component={AdminMovieListScreen} />
                                <Stack.Screen name="AddMovie" component={AddMovieScreen} />
                                <Stack.Screen name="EditMovie" component={EditMovieScreen} />
                                <Stack.Screen name="AdminShowtime" component={AdminShowtimeScreen} />
                                <Stack.Screen name="AddShowtime" component={AddShowtimeScreen} />
                                <Stack.Screen name="EditShowtime" component={EditShowtimeScreen} />
                                <Stack.Screen name="AdminBookings" component={AdminBookingsScreen} />
                                <Stack.Screen name="AdminVerification" component={AdminVerificationScreen} />
                                <Stack.Screen name="AdminSeats" component={AdminSeatsScreen} />
                                <Stack.Screen name="AddSeatRow" component={AddSeatRowScreen} />
                                <Stack.Screen name="EditSeatRow" component={EditSeatRowScreen} />
                                <Stack.Screen name="AdminSeatView" component={AdminSeatViewScreen} />
                                <Stack.Screen name="AdminSnacks" component={AdminSnackManagementScreen} />
                                <Stack.Screen name="AdminAddSnack" component={AdminAddSnackScreen} />
                                <Stack.Screen name="AdminSnackOrders" component={AdminSnackOrderScreen} />
                            </>
                        )}
                    </>
                )}
            </Stack.Navigator>
        </NavigationContainer>
    );
};

export default AppStack;
