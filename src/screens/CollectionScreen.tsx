import { Pressable, StyleSheet, Text, View } from 'react-native';
import type { OwnedItem } from '../lib/data';
export function CollectionScreen({drops,items,onDraw,busy}:{drops:number;items:OwnedItem[];onDraw:()=>void;busy:boolean}) {
  return <View style={s.screen}><Text style={s.title}>Collection</Text><Text style={s.sub}>One giant cosmetic pool</Text>
    <View style={s.card}><Text style={s.balance}>💧 {drops} Water Drops</Text><Text style={s.muted}>Draw cosmetics for the baby environment or village.</Text></View>
    <View style={s.card}><Text style={s.heading}>Mochi Capsule</Text><Text style={s.muted}>Common · Uncommon · Rare · Special</Text><Pressable disabled={busy||drops<300} style={[s.draw,(busy||drops<300)&&s.disabled]} onPress={onDraw}><Text style={s.drawText}>Draw 1 · 300 Drops</Text></Pressable><Text style={s.muted}>Duplicate items return 90 Drops. Rare or better guaranteed by draw 20.</Text></View>
    <View style={s.card}><Text style={s.heading}>Your collection</Text>{items.length?items.map((item,i)=><Text key={`${item.cosmetics?.name}-${i}`} style={s.muted}>{item.cosmetics?.name} · {item.cosmetics?.area==='village'?'Village':'Baby environment'}{item.quantity>1?` ×${item.quantity}`:''}</Text>):<Text style={s.muted}>Your first find will appear here.</Text>}</View>
  </View>;
}
const s=StyleSheet.create({screen:{backgroundColor:'#F6F2EA',padding:20,gap:16},title:{fontSize:28,fontWeight:'700',color:'#262521'},sub:{color:'#6B665C'},card:{backgroundColor:'#FFFEFA',borderRadius:22,padding:16,gap:10,borderWidth:1,borderColor:'#DED6C7'},balance:{fontSize:24,fontWeight:'700'},heading:{fontSize:20,fontWeight:'700'},muted:{color:'#6B665C',fontSize:13},draw:{backgroundColor:'#AD9CC7',padding:14,borderRadius:16,alignSelf:'flex-start'},drawText:{fontWeight:'700'},disabled:{opacity:.5}});
