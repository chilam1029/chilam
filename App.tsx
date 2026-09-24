import { useCallback, useEffect, useRef, useState } from 'react';
import { ActivityIndicator, Alert, AppState, Linking, Platform, Pressable, SafeAreaView, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import type { Session } from '@supabase/supabase-js';
import { supabase } from './src/lib/supabase';
import { drawCosmetic, loadSnapshot, logWater, Snapshot, todayIntake } from './src/lib/data';
import { TodayScreen } from './src/screens/TodayScreen';
import { CollectionScreen } from './src/screens/CollectionScreen';
import { VillageScreen } from './src/screens/VillageScreen';

type Tab = 'today'|'collection'|'village';
export default function App() {
  const [session,setSession]=useState<Session|null>(null);
  const [initializing,setInitializing]=useState(true);
  const [busy,setBusy]=useState(false);
  const [tab,setTab]=useState<Tab>('today');
  const [snapshot,setSnapshot]=useState<Snapshot|null>(null);
  const [error,setError]=useState('');
  const lastWidgetTap=useRef(0);
  const [email,setEmail]=useState(''); const [password,setPassword]=useState('');
  const refresh=useCallback(async(userId:string)=>{
    try { const next=await loadSnapshot(userId); setSnapshot(next); setError('');
      if(Platform.OS==='ios') { try { const widget=require('./src/widgets/MochiWidget').default; const midnight=new Date(); midnight.setUTCHours(24,0,0,0); widget.updateTimeline([{date:new Date(),props:{intake:todayIntake(next.logs),target:next.target}},{date:midnight,props:{intake:0,target:next.target}}]); } catch { /* Expo Go has no widget extension. */ } }
    }
    catch(e) { setError(e instanceof Error?e.message:'Could not load Mochi'); }
  },[]);
  useEffect(()=>{
    supabase.auth.getSession().then(({data})=>{setSession(data.session);setInitializing(false);}).catch(()=>setInitializing(false));
    const {data:{subscription}}=supabase.auth.onAuthStateChange((_event,next)=>{
      setSession(next); if(!next)setSnapshot(null);
    });
    const app=AppState.addEventListener('change',state=>{
      if(state==='active')supabase.auth.startAutoRefresh();else supabase.auth.stopAutoRefresh();
    });
    return ()=>{subscription.unsubscribe();app.remove();};
  },[]);
  useEffect(()=>{if(session?.user.id)void refresh(session.user.id);},[session?.user.id,refresh]);
  useEffect(()=>{
    if(!session)return;
    const handle=(url:string)=>{
      const match=/^mochi:\/\/log\?ml=(150|250|500)$/.exec(url);
      if(!match || Date.now()-lastWidgetTap.current<1500)return;
      lastWidgetTap.current=Date.now();
      void (async()=>{try {await logWater(Number(match[1]));await refresh(session.user.id);}catch(e){setError(e instanceof Error?e.message:'Could not log from widget');}})();
    };
    const subscription=Linking.addEventListener('url',event=>handle(event.url));
    void Linking.getInitialURL().then(url=>{if(url)handle(url);});
    return ()=>subscription.remove();
  },[session?.user.id,refresh]);
  async function authenticate(signUp:boolean){
    if(!email.trim()||password.length<6){setError('Enter an email and a password of at least 6 characters.');return;}
    setBusy(true);setError('');
    try{
      const result=signUp?await supabase.auth.signUp({email:email.trim(),password}):await supabase.auth.signInWithPassword({email:email.trim(),password});
      if(result.error)throw result.error;
      if(signUp&&!result.data.session)Alert.alert('Check your email','Confirm your account, then sign in.');
    }catch(e){setError(e instanceof Error?e.message:'Sign in failed');}finally{setBusy(false);}
  }
  async function mutate(action:()=>Promise<unknown>){
    if(!session||busy)return;
    setBusy(true);setError('');
    try{const result=await action();await refresh(session.user.id);return result;}
    catch(e){setError(e instanceof Error?e.message:'Try again in a moment');}
    finally{setBusy(false);}
  }
  if(initializing)return <View style={s.center}><ActivityIndicator/></View>;
  if(!session)return <SafeAreaView style={s.safe}><StatusBar style="dark"/><View style={s.auth}>
    <Text style={s.brand}>Mochi Hydration</Text><Text style={s.subtitle}>Drink when you want to. Mochi is here for the little moments.</Text>
    <TextInput style={s.input} placeholder="Email" value={email} onChangeText={setEmail} autoCapitalize="none" keyboardType="email-address" autoComplete="email"/>
    <TextInput style={s.input} placeholder="Password" value={password} onChangeText={setPassword} secureTextEntry autoComplete="password"/>
    {!!error&&<Text style={s.error}>{error}</Text>}
    <Pressable disabled={busy} style={s.primary} onPress={()=>void authenticate(false)}><Text style={s.primaryText}>Sign in</Text></Pressable>
    <Pressable disabled={busy} style={s.secondary} onPress={()=>void authenticate(true)}><Text>Create account</Text></Pressable>
  </View></SafeAreaView>;
  const userId = session.user.id;
  const intake=snapshot?todayIntake(snapshot.logs):0;
  return <SafeAreaView style={s.safe}><StatusBar style="dark"/>
    <ScrollView style={s.body} contentContainerStyle={s.content} keyboardShouldPersistTaps="handled">
      {snapshot ? tab==='today' ? <TodayScreen intake={intake} target={snapshot.target} drops={snapshot.drops} busy={busy} onLog={ml=>void mutate(()=>logWater(ml))} monthKey={snapshot.mochis[0]?.month_key}/>
      :tab==='collection' ? <CollectionScreen drops={snapshot.drops} items={snapshot.items} busy={busy} onDraw={()=>void mutate(async()=>{const item=await drawCosmetic();Alert.alert(`${item.rarity} · ${item.name}`,item.duplicate?`Duplicate! ${item.refund} Drops returned.`:'Added to your collection.');})}/>
      :<VillageScreen mochis={snapshot.mochis}/> : <ActivityIndicator style={{margin:32}}/>}
      {!!error&&<Pressable onPress={()=>void refresh(userId)}><Text style={s.error}>{error} · Tap to retry</Text></Pressable>}
      <Pressable onPress={()=>void supabase.auth.signOut()} style={s.signout}><Text style={s.signoutText}>Sign out</Text></Pressable>
    </ScrollView>
    <View style={s.nav}>{(['today','collection','village'] as Tab[]).map(t=><Pressable accessibilityRole="tab" accessibilityState={{selected:tab===t}} key={t} onPress={()=>setTab(t)} style={[s.tab,tab===t&&s.active]}><Text style={s.tabText}>{t.charAt(0).toUpperCase()+t.slice(1)}</Text></Pressable>)}</View>
  </SafeAreaView>;
}
const s=StyleSheet.create({safe:{flex:1,backgroundColor:'#F6F2EA'},center:{flex:1,justifyContent:'center'},body:{flex:1},content:{paddingBottom:14},nav:{flexDirection:'row',gap:8,padding:8,marginHorizontal:20,marginBottom:8,backgroundColor:'#FFFEFA',borderColor:'#DED6C7',borderWidth:1,borderRadius:22},tab:{flex:1,paddingVertical:11,borderRadius:99,alignItems:'center'},active:{backgroundColor:'#7DAB85'},tabText:{fontWeight:'600',color:'#262521'},auth:{flex:1,padding:24,justifyContent:'center',gap:15},brand:{fontSize:32,fontWeight:'700',color:'#262521'},subtitle:{fontSize:16,color:'#6B665C',marginBottom:15},input:{backgroundColor:'#FFFEFA',borderWidth:1,borderColor:'#DED6C7',borderRadius:14,padding:14},primary:{padding:16,alignItems:'center',borderRadius:16,backgroundColor:'#7DAB85'},primaryText:{fontWeight:'700'},secondary:{alignItems:'center',padding:12},error:{color:'#B24C4C',paddingHorizontal:20,paddingVertical:8},signout:{alignSelf:'center',padding:20},signoutText:{color:'#6B665C',fontSize:12}});
