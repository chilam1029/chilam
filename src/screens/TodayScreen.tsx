import { Pressable, StyleSheet, Text, View } from 'react-native';
import { MochiPlaceholder } from '../components/MochiPlaceholder';
import { stageFor } from '../lib/data';

export function TodayScreen({ intake, target, drops, onLog, busy, monthKey }: { intake:number; target:number; drops:number; onLog:(ml:number)=>void; busy:boolean; monthKey?:string }) {
  const progress=Math.min(intake/target,1);
  const pct=Math.round(intake/target*100);
  const month=new Date().toLocaleString(undefined,{month:'long'});
  return <View style={styles.screen}>
    <View><Text style={styles.title}>Hello, Mochi</Text><Text style={styles.sub}>{month} · {stageFor()} stage</Text></View>
    <View style={styles.card}>
      <View style={styles.progressRow}><Text style={styles.percent}>{pct}%</Text><View><Text style={styles.body}>{intake.toLocaleString()} / {target.toLocaleString()} mL</Text><Text style={styles.muted}>Water Drop reward caps at 100%</Text></View></View>
      <View style={styles.track}><View style={[styles.fill,{width:`${progress*100}%`}]} /></View>
    </View>
    <MochiPlaceholder label={pct<35?'Mochi could use a little care today':'Mochi is enjoying your company'} />
    <View style={styles.card}><Text style={styles.heading}>Had some water?</Text><Text style={styles.muted}>Log it whenever you drink.</Text>
      <View style={styles.row}>{[150,250,500].map(ml=><Pressable accessibilityRole="button" disabled={busy} key={ml} style={[styles.button,busy&&styles.disabled]} onPress={()=>onLog(ml)}><Text>+{ml} mL</Text></Pressable>)}</View>
    </View>
    <View style={styles.card}><Text style={styles.heading}>💧 {drops} Water Drops</Text><Text style={styles.muted}>Your cosmetic currency stays with you.</Text></View>
  </View>;
}
const styles=StyleSheet.create({screen:{backgroundColor:'#F6F2EA',padding:20,gap:16},title:{fontSize:28,fontWeight:'700',color:'#262521'},sub:{fontSize:14,color:'#6B665C',marginTop:4},card:{backgroundColor:'#FFFEFA',borderRadius:22,padding:16,gap:10,borderWidth:1,borderColor:'#DED6C7'},progressRow:{flexDirection:'row',alignItems:'center',gap:12},percent:{fontSize:36,fontWeight:'700',color:'#262521'},body:{fontSize:15,fontWeight:'600',color:'#262521'},track:{height:12,borderRadius:99,backgroundColor:'#E5DECF',overflow:'hidden'},fill:{height:'100%',backgroundColor:'#7AABCC',borderRadius:99},muted:{fontSize:12,color:'#6B665C'},heading:{fontSize:18,fontWeight:'700',color:'#262521'},row:{flexDirection:'row',gap:8,flexWrap:'wrap'},button:{paddingVertical:11,paddingHorizontal:12,borderRadius:99,backgroundColor:'#F7F3EA',borderWidth:1,borderColor:'#DED6C7'},disabled:{opacity:.5}});
