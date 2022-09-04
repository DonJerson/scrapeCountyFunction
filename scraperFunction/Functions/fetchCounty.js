import axios from "axios";

const fetchCounty = async (county) => {
    let token
    await axios.post('http://localhost:8081/token-auth/', {username:"donjerson",password:"W3lcome77"})
    .then(function (response) {
      console.log(response.data.token);
      token = response.data.token;
    }).catch(function (error) {
      console.log(error);
    })
    axios.defaults.headers.post['Authorization'] = 'JWT ' + token;
    
  
    
    await axios.post('http://127.0.0.1:8081/maps/getCounty/',{county})
    // console.log(countyStructure.data,"q ha pasado")
    // let countyObj = await axios.post('https://u2f8ql6avi.execute-api.us-east-1.amazonaws.com/',{county})
    .then(function(response){
      console.log("deberia funcar",response.data.propertySearchUrl)
      return response.data
      ;
    }).catch(function(error){
      console.log(error);
      return{error:"error"}
       
    })
}

exports.fetchCounty = fetchCounty;