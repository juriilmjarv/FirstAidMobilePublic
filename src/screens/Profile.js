import React, { Component } from 'react';
import { Text, View, StyleSheet, TouchableOpacity, ScrollView} from 'react-native';
import firebase from 'firebase';
import Dialog from "react-native-dialog";
import { Tile, List, ListItem, Button } from 'react-native-elements';

class Profile extends Component {

   state = { isDialogVisible: false, phoneNr: ''};

   componentDidMount(){
    firebase.database().ref('/users/' + firebase.auth().currentUser.uid + '/phoneNr').on('value', (snapshot) => {
        if(snapshot.exists()){
            this.setState({
                phoneNr: snapshot.val()
            })
        } else {
            this.setState({
                phoneNr: 'not set'
            })
        }
    })
   }

    showDialog = () => {
        this.setState({
            isDialogVisible: true
        })
    }

    hideDialog = () => {
        this.setState({
            isDialogVisible: false
        })
    }

    handlePhone = (phone) => {
        this.setState({
            phoneNr : phone
        })
    }

    handleSubmit = () => {
        if(this.state.phoneNr == ''){
            this.hideDialog
        } else {
            firebase.database().ref('users/' + firebase.auth().currentUser.uid).update({
                phoneNr: this.state.phoneNr
            }).then(
                this.hideDialog
            ).catch( err => console.log("phone nr submit error: " + err));
        }
    }

    handleLogOutPress = () => {
        firebase.auth().signOut()
    };

  render() {
    return (
      <ScrollView>
        <Tile
          imageSrc={{ uri: firebase.auth().currentUser.photoURL}}
          featured
          title={firebase.auth().currentUser.displayName.toUpperCase()}
          caption="First-aider"
        />

        <Button
          title="Sign out"
          buttonStyle={{ margin: 20}}
          onPress={this.handleLogOutPress}
        />

        <Button
          title="Add phone nr"
          buttonStyle={{ margin: 20}}
          onPress={this.showDialog}
        />

        <Dialog.Container visible={this.state.isDialogVisible}>
            <Dialog.Title>Add your phone</Dialog.Title>
            <Dialog.Input placeholder="phone nr" onChangeText={(phone) => this.handlePhone(phone)}></Dialog.Input>
            <Dialog.Button label="Cancel" onPress={this.hideDialog} />
            <Dialog.Button label="Submit" onPress={() => this.handleSubmit()} />
        </Dialog.Container>

        <ListItem
            title="Email"
            rightTitle={firebase.auth().currentUser.email}
            hideChevron
            topDivider
            bottomDivider
        />
        <ListItem
            title="Phone"
            rightTitle={this.state.phoneNr}
            hideChevron
            bottomDivider
        />


      </ScrollView>
    );
  }
}

export default Profile;

const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: '#fff',
      alignItems: 'center',
      justifyContent: 'center',
    },
    myButton:{
        paddingHorizontal:20,
        paddingVertical:15,
        backgroundColor:'#b68ab8',
      },
});

