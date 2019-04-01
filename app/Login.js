import React from 'react';
import { StyleSheet, Text, View,TextInput,Button,Alert} from 'react-native';

export default class Login extends React.Component {
 constructor(props){
     super(props);
     this.state = {
         card_id:'',
         password:''
     }
 }

 loginAction(){
    if(this.state.password == '12345'){
        this.props.changeAuthStatus(this.state.card_id);
    } else {
        Alert.alert(
            'Invalid Credentials',
            'Please Try Again Later',
            [
              {text: 'OK', onPress: () => console.log('OK Pressed')},
            ],
            {cancelable: false},
          );
    }
 }


  render() {
    return (
      <View style={styles.container}>
        <Text style={{fontWeight:'600',fontSize:18,marginVertical:20}} >Login to Continue</Text>
        <TextInput
            style={{height: 40, borderColor: 'gray', borderWidth: 1,padding:5}}
            onChangeText={(card_id) => this.setState({card_id})}
            value={this.state.card_id}
            placeholder="Card ID"
        />
        <TextInput
            style={{height: 40, borderColor: 'gray', borderWidth: 1,padding:5,marginTop:15}}
            onChangeText={(password) => this.setState({password})}
            value={this.state.password}
            placeholder="Password"
            secureTextEntry={true}
        />
        <View style={{marginTop:20}}>
            <Button
                onPress={()=>this.loginAction()}
                title="Login"
                color="#000"
            />
        </View>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff'
  }
});
