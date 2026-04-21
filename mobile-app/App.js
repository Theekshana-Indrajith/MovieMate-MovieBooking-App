import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { AuthProvider } from './src/context/AuthContext';
import AppStack from './src/navigation/AppStack';

export default function App() {
  return (
    <AuthProvider>
      <StatusBar style="light" />
      <AppStack />
    </AuthProvider>
  );
}
