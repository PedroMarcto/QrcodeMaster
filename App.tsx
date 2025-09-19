import React from 'react';
import AppNavigator from './src/navigation/AppNavigator';
import { GameProvider } from './src/context/GameContext';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'react-native';

export default function App() {
  return (
    <>
      <StatusBar backgroundColor="#333" barStyle="light-content" />
      <SafeAreaView style={{ flex: 1, backgroundColor: '#333' }}>
        <GameProvider>
          <AppNavigator />
        </GameProvider>
      </SafeAreaView>
    </>
  );
}
