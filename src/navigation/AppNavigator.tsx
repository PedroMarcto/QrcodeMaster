import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import RegisterScreen from '../screens/RegisterScreen';
import WaitingRoomScreen from '../screens/WaitingRoomScreen';
import GameScreen from '../screens/GameScreen';
import ResultsScreen from '../screens/ResultsScreen';

export type RootStackParamList = {
  Register: undefined;
  WaitingRoom: undefined;
  Game: undefined;
  Results: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();

const AppNavigator = () => (
  <NavigationContainer>
    <Stack.Navigator initialRouteName="Register">
      <Stack.Screen name="Register" component={RegisterScreen} options={{ title: 'Registro' }} />
      <Stack.Screen name="WaitingRoom" component={WaitingRoomScreen} options={{ title: 'Sala de Espera' }} />
      <Stack.Screen name="Game" component={GameScreen} options={{ title: 'Jogo' }} />
      <Stack.Screen name="Results" component={ResultsScreen} options={{ title: 'Resultados' }} />
    </Stack.Navigator>
  </NavigationContainer>
);

export default AppNavigator;
