import React, { Component } from 'react';
import { Text, View, StyleSheet, Button,Dimensions, Image, ScrollView } from 'react-native';
import firebase from 'firebase';
import MapView, { Polygon, Polyline, Marker} from 'react-native-maps';
import Polylines from '@mapbox/polyline';
import PolylineDirection from '@react-native-maps/polyline-direction';
import * as Permissions from 'expo-permissions';
import * as Location from 'expo-location';
import { firebaseConfig } from '../../config.js';
const locations = require('../../locations.json');
import Slider from 'react-native-unlock-slider';
import { Container, Header, Content, Card, CardItem, Body} from 'native-base';
import {Icon} from 'react-native-elements';



 
class NewTask extends Component {
    constructor(props){
      super(props)
      this.mapRef = null;
    }
    

    state = {
        latitude: 56.463197,
        longitude: -2.969990,
        desLatitude: this.props.navigation.state.params.latlon.lat,
        desLongitude: this.props.navigation.state.params.latlon.lon,
        locations: locations
    }

    componentDidMount(){
        this.findCurrentLocationAsync();
        console.log(JSON.stringify("From newTask: " + JSON.stringify(this.props.navigation.state.params)));
        this.setState({
          desLatitude: this.props.navigation.state.params.latlon.lat,
          desLongitude: this.props.navigation.state.params.latlon.lon
        })
        console.log("data: " + JSON.stringify(this.props.navigation.state.params));

        //Go to dashboard if task was completed by emergency staff
        const userRef = firebase.database().ref('emergency/' + this.props.navigation.state.params.id);
        userRef.on('value', (snapshot) => {
          emergency = snapshot.val();
          console.log('cyka:' + JSON.stringify(emergency));
          if(emergency.completed === true){
            this.props.navigation.navigate('Dashboard');
            console.log('from newTask componentDidMount')
          }
          if(emergency.assignedTo != firebase.auth().currentUser.uid){
            this.props.navigation.navigate('Dashboard');
          }
          console.log('aiderName: ' + emergency.aiderName)
        })
    }

    mergeCoords = () => {
        const {
          latitude,
          longitude,
          desLatitude,
          desLongitude
        } = this.state
    
        const hasStartAndEnd = latitude !== null && desLatitude !== null
    
        if (hasStartAndEnd) {
          const concatStart = `${latitude},${longitude}`
          const concatEnd = `${desLatitude},${desLongitude}`
          this.getDirections(concatStart, concatEnd);
        }
    }
    
    getDirections(startLoc, desLoc) {
        //Insert google Directions API key into this url.
        fetch(`https://maps.googleapis.com/maps/api/directions/json?&mode=transit&origin=${startLoc}&destination=${desLoc}&key=YOUR_API_KEY`).then(response => {
        return response.json();
        })
        .then(data => {
            console.log(data.routes[0].legs[0].duration.text);
            const resp = data.routes[0];
            const distanceTime = resp.legs[0];
            const distance = distanceTime.distance.text;
            const time = distanceTime.duration.text;
            const points = Polylines.decode(data.routes[0].overview_polyline.points);
            const coords = points.map(point => {
                return {
                  latitude: point[0],
                  longitude: point[1]
                }
              })
            this.setState({ coords, distance, time })
        })
        .catch((error) => {
        console.log('yoooooooo');

            console.log(error);
        });
          
    }


    findCurrentLocationAsync = async () => {
		let { status } = await Permissions.askAsync(Permissions.LOCATION);

		if (status !== 'granted') {
			this.setState({
				errorMessage: 'Permission to access location was denied'
			});
		}

		let location = await Location.getCurrentPositionAsync({});
		this.setState({
            latitude: location.coords.latitude,
            longitude: location.coords.longitude
        },this.mergeCoords);

        const { locations: [ sampleLocation ] } = this.state
    };

    
    renderMarkers = () => {
      return (
        <View>
          <Marker
            coordinate={{ latitude: this.state.desLatitude,
                          longitude: this.state.desLongitude
                        }}
            title={this.props.navigation.state.params.location}
          />
        </View>
      )
    }

    goToAcceptedTask = () => {
      firebase.database().ref('emergency/' + this.props.navigation.state.params.id).update({
        allocated: true,
        aiderID: firebase.auth().currentUser.uid,
        aiderName: firebase.auth().currentUser.displayName,
        aiderEmail: firebase.auth().currentUser.email,
        acceptedtime: Date.now(),
        completed: false
      }).then(
        firebase.database().ref('users/' + firebase.auth().currentUser.uid).update({
          isBusy: true
        })
      ).then(
        this.props.navigation.state.params.allocated = true,
        this.props.navigation.state.params.aiderID = firebase.auth().currentUser.uid,
        this.props.navigation.state.params.aiderName = firebase.auth().currentUser.displayName,
        this.props.navigation.state.params.aiderEmail = firebase.auth().currentUser.email,
        this.props.navigation.state.params.acceptedtime = Date.now(),
        this.props.navigation.navigate('AcceptedTask', this.props.navigation.state.params)
      );
    }

   render() {
    var { width, height } = Dimensions.get('window');
    const {latitude,longitude,coords,distance,destination,time, desLatitude, desLongitude} = this.state

    const isLifeThreatening = this.props.navigation.state.params.lifethreataning;
        let box;
        if(isLifeThreatening === true){
            box = <View style={{flexDirection: 'row', alignItems: 'center', marginLeft:'25%' }}>
                    <Icon
                        name='asterisk'
                        type='font-awesome'
                        color='red'
                    />
                    <Text style={{fontWeight: 'bold'}}> Lifethreatening situation</Text>
                </View>
        }
    const isAmbulanceComing = this.props.navigation.state.params.ambulanceComing;
    let box2;
    if(isAmbulanceComing === true){
        box2 = <View style={{flexDirection: 'row', alignItems: 'center', marginLeft:'25%'}}>
                <Icon
                    name='ambulance'
                    type='font-awesome'
                    color='blue'
                />
                <Text style={{fontWeight: 'bold'}}> Ambulance on the way</Text>
            </View>
    }
    const origin = {latitude: latitude, longitude: longitude};
    const dest = {latitude: desLatitude, longitude: desLongitude}

    return (
      <Container>
        <Content>
          <View style={{ width, height: '90%'}}>
            <MapView 
              ref={(ref) => { this.mapRef = ref }}
              onLayout = {() => this.mapRef.fitToCoordinates(coords, { edgePadding: { top: 10, right: 10, bottom: 10, left: 10 }, animated: false })}
              showsUserLocation={true}
              provider={MapView.PROVIDER_GOOGLE}
              style={styles.mapStyle}
              initialRegion={{
                  latitude,
                  longitude,
                  latitudeDelta: 0.06,
                  longitudeDelta: 0.06
              }}
              >
                  {this.renderMarkers()}
                  <PolylineDirection
                    origin={origin}
                    destination={dest}
                    apiKey='YOUR_GOOGLE_DIRECTIONS_API_KEY'
                    strokeWidth={4}
                    strokeColor="#12bc00"
                    mode='walking'
                  />
            </MapView>
          </View>
          <Card>
            <CardItem header style={{height: 20, paddingTop:4, paddingBottom:3}}>
              <Text style={{fontWeight: 'bold'}}>Location:</Text>
            </CardItem>
            <CardItem>
              <Body>
                <Text>
                    {this.props.navigation.state.params.location}
                </Text>
              </Body>
            </CardItem>
            <CardItem header style={{height: 20, paddingTop:4, paddingBottom:3}}>
              <Text style={{fontWeight: 'bold'}}>Condition:</Text>
            </CardItem>
            <CardItem>
              <Body>
                <Text>
                    {this.props.navigation.state.params.condition}
                </Text>
              </Body>
            </CardItem>
            <CardItem header style={{height: 20, paddingTop:4, paddingBottom:3}}>
              <Text style={{fontWeight: 'bold'}}>Travel time:</Text>
            </CardItem>
            <CardItem>
              <Body>
                <Text>
                    {time}
                </Text>
              </Body>
            </CardItem>
          </Card>
          {box}
          {box2}
        </Content>
        <Slider
          isLeftToRight={true} // set false to move slider Right to Left
          childrenContainer={{ backgroundColor: 'rgba(255,255,255,0.0)'}}
          slideOverStyle={{backgroundColor: 'green',borderBottomLeftRadius:5, borderBottomRightRadius: 5, borderTopLeftRadius: 5, borderTopRightRadius: 5 }}
          onEndReached={this.goToAcceptedTask}
          isOpacityChangeOnSlide={true}
          containerStyle={{
          margin: 8,
          backgroundColor: 'grey',
          borderRadius: 10,
          overflow: 'hidden',
          alignItems: 'center',
          justifyContent: 'center',
          width: '95%',
          height: 60,
          position: 'absolute',
          bottom: 20

          }}
          thumbElement={
          <Image
              style={{
                  width: 50,
                  margin: 4,
                  borderRadius: 5,
                  height: 50,
                  backgroundColor: 'transparent',
              }}
              source={require('../../assets/slider.png')}
          />
          }
          >
          <Text style={{fontWeight: '700'}}>{'SLIDE TO ACCEPT'}</Text>
        </Slider>
      </Container>
    );
  }
}

export default NewTask;

const styles = StyleSheet.create({
    container: {
      flex: 1,
      flexDirection: 'column',
      backgroundColor: '#fff',
      alignItems: 'center',
      justifyContent: 'center',
    },
    mapStyle: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
    },
    fixToText: {
      position: 'absolute',
      bottom:20,
      flexDirection: 'row',
      justifyContent: 'space-between',
    },
});