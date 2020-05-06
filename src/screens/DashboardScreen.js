import React, { Component } from 'react'
import { Text,
         View,
         StyleSheet,
         Button,
         TouchableOpacity,
        Switch } from 'react-native';
import * as Permissions from 'expo-permissions';
import * as Location from 'expo-location';
import firebase from 'firebase';
import * as Google from 'expo-google-app-auth';
import { Notifications } from 'expo';
import { Container, Header, Content, Card, CardItem, Body} from 'native-base';
import * as Animatable from "react-native-animatable";


class DashboardScreen extends Component {

    state = {
		location: null,
        errorMessage: null,
        switchValue:false,
        token: null,
        notification: {}
    };

    componentDidMount() {
        this.registerForPushNotifications();
        this.findCurrentLocationAsync();
        this.interval = setInterval(() => this.findCurrentLocationAsync(), 5000);
        Notifications.addListener(this._handleNotifications)

        var ref = firebase.database().ref('emergency/')
        //Need to add a check if aider has already been assigned and accepted a task and then navigate to that task...
        ref.on('value', (snapshot) => {
            assigned = snapshot.val();

            for(let i in assigned){
                if(assigned[i].aiderID === firebase.auth().currentUser.uid && assigned[i].completed === false && assigned[i].allocated === true){
                    var data = {
                        acceptedtime: assigned[i].acceptedtime,
                        age: assigned[i].age,
                        allocated: assigned[i].allocated,
                        ambulanceComing: assigned[i].ambulanceComing,
                        completed: assigned[i].completed,
                        condition: assigned[i].condition,
                        gender: assigned[i].gender,
                        latlon: { lat: assigned[i].latlon.lat, lon: assigned[i].latlon.lon},
                        lifethreataning: assigned[i].lifethreataning,
                        location: assigned[i].location,
                        locationDescription: assigned[i].locationDescription,
                        name: assigned[i].name,
                        phone: assigned[i].phone,
                        timestamp: assigned[i].timestamp,
                        victimName: assigned[i].victimName,
                        aiderID: assigned[i].aiderID,
                        aiderName: assigned[i].aiderName,
                        aiderEmail: assigned[i].aiderEmail,
                        id: i
                    }
                    this.props.navigation.navigate('AcceptedTask', data);
                }
            }
        })

        
        this.checkIfTaskAssigned();

        //check if aider is already online
        const userRef = firebase.database().ref('users/' + firebase.auth().currentUser.uid);
        userRef.on('value', (snapshot) => {
            this.setState({
                switchValue: snapshot.val().online
            })
        });
    }

    componentWillUnmount(){
        clearInterval(this.interval);
    }

    _handleNotifications = async (notification) => {
        const {origin} = notification;      
        if (origin === 'selected') {
          //this.props.navigation.navigate('NewTask', notification.data)
          this.checkIfTaskAssigned();
        } else { // origin is 'received'
            this.props.navigation.navigate('NewTask', notification.data)
        }
    } 

    checkIfTaskAssigned = () => {
        var ref = firebase.database().ref('emergency/')
          ref.on('value', (snapshot) => {
            assigned = snapshot.val();
            for(let i in assigned){
                if(assigned[i].assignedTo === firebase.auth().currentUser.uid && assigned[i].completed === false && assigned[i].allocated === false){
                    var data = {
                        acceptedtime: assigned[i].acceptedtime,
                        age: assigned[i].age,
                        allocated: assigned[i].allocated,
                        ambulanceComing: assigned[i].ambulanceComing,
                        completed: assigned[i].completed,
                        condition: assigned[i].condition,
                        gender: assigned[i].gender,
                        latlon: { lat: assigned[i].latlon.lat, lon: assigned[i].latlon.lon},
                        lifethreataning: assigned[i].lifethreataning,
                        location: assigned[i].location,
                        locationDescription: assigned[i].locationDescription,
                        name: assigned[i].name,
                        phone: assigned[i].phone,
                        timestamp: assigned[i].timestamp,
                        victimName: assigned[i].victimName,
                        aiderID: assigned[i].aiderID,
                        aiderName: assigned[i].aiderName,
                        aiderEmail: assigned[i].aiderEmail,
                        id: i
                    }
                    this.props.navigation.navigate('NewTask', data);
                    console.log('from notification -> NewTask')
                } 
            }
        })
    }
    
    toggleSwitch = (value) => {
        //onValueChange of the switch this function will be called
        this.setState({switchValue: value})
        //state changes according to switch
        //which will result in re-render the text
        let uid = firebase.auth().currentUser.uid;
        var user = firebase.auth().currentUser;

        if(this.state.switchValue == false){
            setTimeout(this.findCurrentLocationAsync, 5000);
            firebase.database().ref('/users/').child(uid).update({
                expoPushToken: this.state.token,
                email: user.email,
                name: user.displayName,
                location: this.state.location,
                online: true,
                isBusy: false
            }); 
        } else {
            firebase.database().ref('/users/').child(uid).update({
                online: false
            }); 
        }
    }

    //Push notifications
    registerForPushNotifications = async () => {
        const { status } = await Permissions.askAsync(Permissions.NOTIFICATIONS);
        let finalStatus = status; 

        if (status !== 'granted'){
            const { status } = await Permissions.askAsync(Permissions.NOTIFICATIONS);
            finalStatus = status;
        }

        if(finalStatus !== 'granted') {return;}

        let token = await Notifications.getExpoPushTokenAsync();
        this.setState({token});
    }
    /*
	findCurrentLocation = () => {
		navigator.geolocation.getCurrentPosition(
			position => {
				const latitude = JSON.stringify(position.coords.latitude);
				const longitude = JSON.stringify(position.coords.longitude);

				this.setState({
					latitude,
					longitude
				});
			},
			{ enableHighAccuracy: true, timeout: 20000, maximumAge: 1000 }
		);
	};
    */

	findCurrentLocationAsync = async () => {
		let { status } = await Permissions.askAsync(Permissions.LOCATION);

		if (status !== 'granted') {
			this.setState({
				errorMessage: 'Permission to access location was denied'
			});
		}

		let location = await Location.getCurrentPositionAsync({});
		this.setState({ location });
    };
    


    render() {
        let text = '';
		if (this.state.errorMessage) {
			text = this.state.errorMessage;
		} else if (this.state.location) {
			text = JSON.stringify(this.state.location);
        }
        const zoomOut = {
            0: {
              opacity: 1,
              scale: 1,
            },
            0.5: {
              opacity: 1,
              scale: 1.3,
            },
            1: {
              opacity: 0,
              scale: 1.6,
            },
            1.5: {
              opacity: 0,
              scale: 2,
            },
          };
          let animation;
          if(this.state.switchValue == true){
              animation = <Animatable.Text animation={zoomOut} easing="ease-in-out-sine" iterationCount="infinite" style={{ textAlign: 'center' }}>Online</Animatable.Text>
          }
        return (
            <Container>
                <Content style={{margin:20, top: '35%'}}>
                    <Card style={{flex:1, justifyContent: 'center', alignItems: 'center'}}>
                        <CardItem header>
                            <Text style={{fontWeight: 'bold'}}>Are you available?</Text>
                        </CardItem>
                        <CardItem>
                            <Body style={{justifyContent: 'center', alignItems: 'center'}}>
                                <Switch
                                    style={{margin:20}}
                                    onValueChange = {this.toggleSwitch}
                                    value = {this.state.switchValue}
                                    activeText={'On'}
                                    inActiveText={'Off'}
                                />
                            </Body>
                        </CardItem>
                    </Card>
                    <Text></Text>
                    {animation}

                </Content>
            </Container>
           
            
        )
    }
}

export default DashboardScreen;

const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: '#fff',
      alignItems: 'center',
      justifyContent: 'center',
    },
    titleText: {
        fontSize: 20,
        fontWeight: 'bold',
      },
});
