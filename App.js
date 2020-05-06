import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import LoginScreen from './src/screens/LoginScreen';
import DashboardScreen from './src/screens/DashboardScreen';
import LoadingScreen from './src/screens/LoadingScreen';
import Profile from './src/screens/Profile';
import NewTask from './src/screens/NewTask';
import AcceptedTask from './src/screens/AcceptedTask';
import {createAppContainer, createSwitchNavigator} from 'react-navigation';
import {createStackNavigator} from 'react-navigation-stack';
import {createBottomTabNavigator} from 'react-navigation-tabs';

import * as firebase from 'firebase';
import { firebaseConfig } from './config';

firebase.initializeApp(firebaseConfig);

export default class App extends React.Component {
  render(){
    return <AppNavigator />;
  }
}

//App Screens
const AppStack = createBottomTabNavigator(
  { 
    Dashboard: DashboardScreen,
    Profile: Profile
  },{
  tabBarOptions: {
    activeTintColor: '#e91e63',
    labelStyle: {
      fontSize: 15,
    }
  },
}
);

const AcceptedTaskStack = createStackNavigator({
  AcceptedTask: AcceptedTask
});

const NewTaskStack = createStackNavigator({
  NewTask: NewTask
});
//Authentication Screens
const AuthStack = createStackNavigator({ 
  SignIn: LoginScreen
  },
  {
    headerMode: 'none'
  }
);


const AppNavigator = createAppContainer(createSwitchNavigator(
    {
      AuthLoading: LoadingScreen,
      App: AppStack, AcceptedTaskStack, NewTaskStack,
      Auth: AuthStack,
    },
    {
      initialRouteName: 'AuthLoading',
    }
  )
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
});


