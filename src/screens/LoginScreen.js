import React, { Component } from 'react'
import { Text, View, StyleSheet, Button, ImageBackground} from 'react-native'
import * as Google from 'expo-google-app-auth';
import firebase from 'firebase';
import {SocialIcon} from 'react-native-elements';


class LoginScreen extends Component {

    isUserEqual = (googleUser, firebaseUser) => {
        if (firebaseUser) {
          var providerData = firebaseUser.providerData;
          for (var i = 0; i < providerData.length; i++) {
            if (providerData[i].providerId === firebase.auth.GoogleAuthProvider.PROVIDER_ID &&
                providerData[i].uid === googleUser.getBasicProfile().getId()) {
              // We don't need to reauth the Firebase connection.
              return true;
            }
          }
        }
        return false;
      }

    onSignIn = (googleUser) => {
        console.log('Google Auth Response', googleUser);
        // We need to register an Observer on Firebase Auth to make sure auth is initialized.
        var unsubscribe = firebase.auth().onAuthStateChanged(function(firebaseUser) {
          unsubscribe();
          // Check if we are already signed-in Firebase with the correct user.
          if (!this.isUserEqual(googleUser, firebaseUser)) {
            // Build Firebase credential with the Google ID token.
            var credential = firebase.auth.GoogleAuthProvider.credential(
                googleUser.idToken,
                googleUser.accessToken
                );
            // Sign in with credential from the Google user.
            firebase.auth().signInWithCredential(credential).then(function(result){
                console.log("User signed in");
                firebase.database.ref('/users/' + result.user.uid).set({
                    gmail: result.user.email,
                    profile_picture: result.additionalUserInfo.profile.photoUrl,
                    locale: result.additionalUserInfo.profile.locale,
                    first_name: result.additionalUserInfo.profile.givenName,
                    last_name: result.additionalUserInfo.profile.familyName
                })
                .then(function(snapshot){
                    console.log('Snaphot', snapshot);
                });
            }).catch(function(error) {
              // Handle Errors here.
              var errorCode = error.code;
              var errorMessage = error.message;
              // The email of the user's account used.
              var email = error.email;
              // The firebase.auth.AuthCredential type that was used.
              var credential = error.credential;
              // ...
            });
          } else {
            console.log('User already signed-in Firebase.');
          }
        }.bind(this));
      }

    signInWithGoogleAsync = async () => {
        try {
          const result = await Google.logInAsync({
            //Android client OAUTH 2.0 ClientID
            androidClientId: 'YOUR_CLIENT_ID.apps.googleusercontent.com',
            behaviour: 'web',
            //iOS client OAUTH 2.0 ClientID
            iosClientId: 'YOUR_CLIENT_ID.apps.googleusercontent.com',
            scopes: ['profile', 'email'],
          });
      
          if (result.type === 'success') {
            this.onSignIn(result);
            return result.accessToken;
          } else {
            return { cancelled: true };
          }
        } catch (e) {
          return { error: true };
        }
      }


    render() {
        return (

              <ImageBackground source={require('../../assets/background.jpg')} style={{width: '100%', height: '100%'}}>
                  <Text></Text>
                  <Text></Text>
                  <Text></Text>
                  <Text></Text>
                  <Text></Text>
                  <Text></Text>
                  <Text></Text>
                  <Text></Text>
                  <Text></Text>
                  <Text></Text>
                  <Text></Text>
                  <Text></Text>
                  <Text></Text>
                  <Text></Text>
                  <Text></Text>
                  <Text></Text>
                  <Text></Text>
                  <Text></Text>
                  <Text></Text>
                  <Text></Text>
                  <Text></Text>
                  <Text></Text>
                  <Text></Text>
                  <SocialIcon
                    title='Sign In With Google'
                    button
                    style={{ margin: 50}}
                    type='google'
                    onPress={() => this.signInWithGoogleAsync()}
                  />
              </ImageBackground>

        )
    }
}

export default LoginScreen;

const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: '#fff',
      //alignItems: 'center',
      //justifyContent: 'center',
    },
});
