const { v4: uuidv4 } = require('uuid');
const bedrock = require('bedrock-protocol');
require('dotenv').config();

const client = bedrock.createClient({
  host: 'localhost',   // server address
  port: 19132,         // server port
  username: process.env.USER_ID,   // the username you want to use as observer, optional if online mode
  offline: false       // optional, default false. if true, do not login with Xbox Live. You will not be asked to sign-in if set to true.
});

const detectionInterval = 500; // refresh frequency in miliseconds
const facingLength = 50;  // length of vector for detecting where the player is looking

var locationCommandUUID;
var facingCommandUUID;
var locations;
var facings;
var lastPositionalData;

client.on('spawn', () => {
  console.log('Spawned in');
  setInterval(sendDetectCommand, detectionInterval);
});

client.on('command_output', (packet) => { // Listen for replies to commands
  if(packet.origin.uuid === locationCommandUUID){
    locations = Object();
    const keys = packet.output.pop(packet.output.length).parameters[1].split(',').map((s) => s.trim());
    packet.output.forEach((x, i) => {
      locations[keys[i]] = x.parameters.slice(0,3).map((x) => parseInt(x));
    });
    locationCommandUUID = undefined;
  }
  if(packet.origin.uuid === facingCommandUUID){
    facings = Object();
    const keys = packet.output.pop(packet.output.length).parameters[1].split(',').map((s) => s.trim());
    packet.output.forEach((x, i) => {
      facings[keys[i]] = x.parameters.slice(0,3).map((x) => parseInt(x));
    });
    facingCommandUUID = undefined;
  }
  if((locationCommandUUID === undefined) && (facingCommandUUID === undefined)) {
    var output = Object();
    Object.keys(locations).forEach((k) => {
      output[k] = {
        location: locations[k],
        facing: facings[k].map((x,i)=>(x-locations[k][i])/facingLength)
      };
      if((output[k].facing.length == 0) && (k in lastPositionalData)){
        output[k].facing = lastPositionalData[k].facing;
      }
    });
    lastPositionalData = output;
    lastPositionalData['timestamp'] = Date.now()
    //console.log(lastPositionalData)
  }
});

function sendCommand(commandStr){
  const uuid = uuidv4();
  client.queue('command_request', {
    command: commandStr,
    origin: {
      type: 'player',
      uuid: uuid,
      request_id: '',
      player_entity_id: undefined
    },
    interval: false
  });
  return uuid
}

function sendDetectCommand(){
  locationCommandUUID = sendCommand('/execute @a ~ ~ ~ testforblock ~ ~ ~ structure_void');
  facingCommandUUID = sendCommand('/execute @a ~ ~ ~ testforblock ^ ^ ^' + facingLength + ' structure_void');
}