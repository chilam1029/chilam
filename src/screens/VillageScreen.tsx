import { StyleSheet, Text, View } from 'react-native';
import type { Resident } from '../lib/data';
export function VillageScreen({mochis}:{mochis:Resident[]}) {
  const graduated=mochis.filter(m=>m.graduated_at);
  return <View style={s.screen}><Text style={s.title}>Mochi Village</Text><Text style={s.sub}>Your months live here forever.</Text>
    <View style={s.scene}><Text style={s.sceneText}>🌿  Mochi Village</Text><Text style={s.sub}>A home for every Mochi you have met</Text></View>
    <View style={s.card}><Text style={s.heading}>Residents</Text>{graduated.length?graduated.map(m=><Text key={m.id}>{new Date(`${m.month_key}T12:00:00`).toLocaleString(undefined,{month:'long',year:'numeric'})} Mochi · graduated</Text>):<Text>Your first Mochi will join the village next month.</Text>}</View>
  </View>;
}
const s=StyleSheet.create({screen:{backgroundColor:'#F6F2EA',padding:20,gap:16},title:{fontSize:28,fontWeight:'700'},sub:{color:'#6B665C'},scene:{height:320,borderRadius:28,backgroundColor:'#C6DAB3',alignItems:'center',justifyContent:'center',gap:12},sceneText:{fontWeight:'700',color:'#526347',fontSize:21},card:{backgroundColor:'#FFFEFA',borderRadius:22,padding:16,gap:10},heading:{fontSize:18,fontWeight:'700'}});
