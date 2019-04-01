import React from 'react';
import { StyleSheet, Text,View,TextInput,Button,ScrollView,TouchableOpacity,ActivityIndicator} from 'react-native';
import axios from 'axios';
import moment from "moment";


const host = "http://192.168.43.117"; // Computer IP Address

export default class UserDashboard extends React.Component {
 constructor(props){
    
     super(props);
     this.state={
         showAddBalance:false,
         addBalanceAmount:0,
         balance:300,
         prev_sessions:[],
         name:"",
         loading:true,
         slots:[
          {
            id: 1,
            session_id: null
          },
          {
            id: 2,
            session_id: null
          }
         ]
     }
 }
 
 handleSlotParking(value,index){
   const slots = Object.assign({},this.state.slots);
   slots[index]['session_id'] = value ? "Filled" : null;
   this.setState({
     slots:slots
   })
 }

 

 componentWillUnmount() {
  clearInterval(this.interval);
 }


 componentDidMount(){
  
  this.setState({
    loading:true
   });

  this.interval = setInterval(() => {
  
     axios.get(`http://${host}:3000/getusersessiondata/${this.props.user_id}`)
      .then(response => {
        this.setState({
          loading:false,
          name:response.data.name,
          balance:response.data.balance,
          prev_sessions:response.data.parking_sessions,
          slots:response.data.slots
        })
      }).catch(error => {
        this.setState({
          loading:false
        })
    });
     
  }, 2000);
 }

 addBalance(){
  axios.get(`http://${host}:3000/addbalance/${this.props.user_id}/${this.state.addBalanceAmount}`)
      .then(response => {
        this.setState({
            showAddBalance:!this.state.showAddBalance,
            balance:(parseInt(this.state.balance)+parseInt(this.state.addBalanceAmount)),
            addBalanceAmount:0
        })
      }).catch(error => {
        console.log(error);
        console.log("Cannot Update AMount");
    });
 }
 

  render() {
    if(this.state.loading)
      return (
        <View style={{flex:1,alignItems:'center',justifyContent:'center'}}>
            <ActivityIndicator size="large" color="#0000ff" />  
        </View>
      )

    return (
    <ScrollView keyboardShouldPersistTaps="always">
      <View style={styles.container}>
        <View style={{flexDirection:'row',justifyContent:'space-between'}}>
            <Text style={{fontWeight:'600',fontSize:18,marginVertical:20}}>Hi {this.state.name}!!</Text>
            <TouchableOpacity onPress={()=>this.props.changeAuthStatus()}>
                <Text style={{fontWeight:'600',fontSize:18,marginVertical:20}}>Logout</Text>
            </TouchableOpacity>
        </View>
        <Text style={{fontWeight:'600',fontSize:18,marginVertical:10}} >Your Current Balance: </Text>
        <Text style={{fontWeight:'600',fontSize:35}} >{this.state.balance}</Text>
        <TouchableOpacity onPress={()=>this.setState({showAddBalance:!this.state.showAddBalance})}>
            <Text style={{fontWeight:'600',fontSize:14,marginVertical:10}} >+ Add Balance</Text>
        </TouchableOpacity>
        {this.state.showAddBalance && <View><TextInput
            style={{height: 40, borderColor: 'gray', borderWidth: 1,padding:5}}
            onChangeText={(addBalanceAmount) => this.setState({addBalanceAmount})}
            value={this.state.addBalanceAmount.toString()}
            placeholder="Enter Amount"
        />
        <View style={{marginTop:20}}>
            <Button
                onPress={()=>this.addBalance()}
                title="Add"
                color="#000"
            />
        </View></View>}
      </View>

      <View style={{borderWidth:1,borderColor:'#000',height:300,flexDirection:'row',flex:20,marginTop:20}}>
          <View style={{backgroundColor:this.state.slots[0]['session_id'] == null ?'green':'red',height:300,flex:10,alignItems:'center',justifyContent:'center'}}>
            <Text style={{color:'#fff'}}>Slot I</Text>
          </View>
          <View style={{backgroundColor:this.state.slots[1]['session_id'] == null ?'green':'red',height:300,flex:10,alignItems:'center',justifyContent:'center'}}>
            <Text style={{color:'#fff'}}>Slot II</Text>
          </View>
      </View>
        
      <View>
      <Text style={{fontWeight:'600',fontSize:18,marginVertical:20}} >Your Previous Parking Sessions: </Text>
        <View>
          
          {this.state.prev_sessions.map((item)=>{
              return (<View key={item.id.toString()} style={{flexDirection:'row',justifyContent:'space-between'}}>
                <Text>{moment(item.from_time).format("YYYY-MM-DD h:mm:ss")}</Text>
                <Text>{moment(item.to_time).format("YYYY-MM-DD h:mm:ss")}</Text>
                <Text>{item.price} $</Text>
              </View>);
          })}
        </View>
      </View>
    </ScrollView>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff'
  }
});
