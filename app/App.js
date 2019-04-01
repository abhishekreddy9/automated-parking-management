import React from 'react';
import { StyleSheet, Text, View,AsyncStorage } from 'react-native';
import Login from './Login';
import UserDashboard from './UserDashboard';

export default class App extends React.Component {
  constructor(props){
    super(props);
    this.state = {
      isAuthenticated:false,
      loading:true,
      user_id:""
    }
    this.changeAuthStatus = this.changeAuthStatus.bind(this);
  }

  componentDidMount(){
    this._retrieveSession();
  }

  _retrieveSession = async () => {
    try {
      const value = await AsyncStorage.getItem('user_id');
      if (value !== null) {
        this.setState({
          loading:false,
          user_id:value,
          isAuthenticated:true
        })
      }
    } catch (error) {
      this.setState({
        loading:false
      })
    }
  };



  changeAuthStatus = async(user_id = "NULL") =>{
    try {
      if(user_id == "NULL"){
        this.setState({
          isAuthenticated:!this.state.isAuthenticated
        })
      } else {
        await AsyncStorage.setItem('user_id', user_id);
        this.setState({
          isAuthenticated:!this.state.isAuthenticated,
          user_id:user_id
        })
      }
    } catch (error) {
      console.log("Error saving User Id");
    }
   
  }

  render() {
    return (
      <View style={styles.container}>
        {!this.state.isAuthenticated ? <Login changeAuthStatus={this.changeAuthStatus}/> : <UserDashboard user_id={this.state.user_id} changeAuthStatus={this.changeAuthStatus}/>}        
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    margin:20,
    justifyContent:'center',
    backgroundColor:'#fff'
  },
});
