import React, { Component } from 'react'
import { Text, View, StyleSheet, ActivityIndicator, Image, Alert, TouchableOpacity} from 'react-native'
import firebase from 'firebase';
import { Linking } from 'expo';
import Slider from 'react-native-unlock-slider';
import {Button, Icon} from 'react-native-elements';
import { Container, Header, Content, Card, CardItem, Body } from 'native-base';


class AcceptedTask extends Component {

    constructor(props){
        super(props)
    }
    componentDidMount(){
        console.log(JSON.stringify("From AcceptedTask: " + JSON.stringify(this.props.navigation.state.params)));
    }

    openMaps = () => {
        const url = `${this.props.navigation.state.params.latlon.lat},${this.props.navigation.state.params.latlon.lon}`
        Linking.openURL('https://www.google.com/maps/dir/?api=1&destination=' + url)
    }

    makeCall = () => {
        let phoneNr = this.props.navigation.state.params.phone;
        if (Platform.OS === 'android') {
            phoneNr = 'tel:${' + phoneNr + '}';
          } else {
            phoneNr = 'telprompt:${'+ phoneNr + '}';
          }    
          Linking.openURL(phoneNr);
    }

    taskCompleted = () => {

        firebase.database().ref('emergency/' + this.props.navigation.state.params.id).update({
            completed: true,
            completedtime: Date.now()
        }).then(
            firebase.database().ref('users/' + firebase.auth().currentUser.uid).update({
                isBusy: false
              })
        ).then(
            this.props.navigation.navigate('Dashboard')
        ).catch(err => console.log("Taskcompleted error: " + err))
    }

   render() {
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
                    <Text style={{fontWeight: 'bold'}}> Abulance on the way</Text>
                </View>
        }
    return (
      <Container>
        <Content>
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
              <Text style={{fontWeight: 'bold'}}>Location Details:</Text>
            </CardItem>
            <CardItem>
              <Body>
                <Text>
                    {this.props.navigation.state.params.locationDescription}
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
              <Text style={{fontWeight: 'bold'}}>Gender:</Text>
            </CardItem>
            <CardItem>
              <Body>
                <Text>
                    {this.props.navigation.state.params.gender}
                </Text>
              </Body>
            </CardItem>
            <CardItem header style={{height: 20, paddingTop:4, paddingBottom:3}}>
              <Text style={{fontWeight: 'bold'}}>Age:</Text>
            </CardItem>
            <CardItem>
              <Body>
                <Text>
                    {this.props.navigation.state.params.age}
                </Text>
              </Body>
            </CardItem>
            <CardItem header style={{height: 20, paddingTop:4, paddingBottom:3}}>
              <Text style={{fontWeight: 'bold'}}>Name:</Text>
            </CardItem>
            <CardItem>
              <Body>
                <Text>
                    {this.props.navigation.state.params.name}(Caller), {this.props.navigation.state.params.victimName}(Victim)
                </Text>
              </Body>
            </CardItem>
         </Card>
         {box}
         {box2}
         <Button
            title="Call person on site"
            buttonStyle={{ marginLeft: 50, marginRight: 50, marginTop:10}}
            onPress={this.makeCall}
         />

         <Button
            title="Open in Maps"
            buttonStyle={{marginLeft: 50, marginRight: 50, marginTop: 10, backgroundColor:'green'}}
            onPress={this.openMaps}
         />
        </Content>
        <Slider
            isLeftToRight={true} // set false to move slider Right to Left
            childrenContainer={{ backgroundColor: 'rgba(255,255,255,0.0)'}}
            slideOverStyle={{backgroundColor: 'green',borderBottomLeftRadius:5, borderBottomRightRadius: 5, borderTopLeftRadius: 5, borderTopRightRadius: 5 }}
            onEndReached={() => {
                Alert.alert(
                    'Complete Task',
                    'Are you sure?',
                    [
                        {text: 'Cancel', onPress: () => console.log('Cancelled'), style: 'cancel'},
                        {text: 'Yes', onPress: () => this.taskCompleted()},
                    ],
                    { cancelable: false }
                    )
            }}
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
            <Text style={{fontWeight: '700'}}>{'SLIDE TO COMPLETE TASK'}</Text>
        </Slider>
      </Container>
    );
  }



}

export default AcceptedTask;

const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: '#fff',
      alignItems: 'center',
      justifyContent: 'center',
    },
    touchableButton: {
        width: '30%',
        padding: 10,
        backgroundColor: '#9c27b0',
      },
      TextStyle: {
        color: '#fff',
        fontSize: 18,
        textAlign: 'center',
      }
});