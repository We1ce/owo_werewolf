import React, { useState, useEffect } from 'react';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import { Sun, Moon, Plus, Trash2, X, RotateCcw, Save, Edit3, CheckCircle2, History, Star } from 'lucide-react';

const BASE_GOOD_ROLES = ['預言家', '女巫', '獵人', '守衛', '平民'];
const BASE_EVIL_ROLES = ['小狼', '狼王', '機械狼', '白狼王', '黑狼王', '大灰狼'];
const DEATH_METHODS = ['存活', '刀殺', '毒殺', '票死', '帶走', '自爆', '彈死'];

export default function App() {
  const [theme, setTheme] = useState('night');
  const [isSettingMode, setIsSettingMode] = useState(false);
  const [isEditingPlayers, setIsEditingPlayers] = useState(false);
  const [players, setPlayers] = useState([]);
  const [roundsCount, setRoundsCount] = useState(1);
  
  // 模式設定狀態
  const [goodRoles, setGoodRoles] = useState(BASE_GOOD_ROLES);
  const [evilRoles, setEvilRoles] = useState(BASE_EVIL_ROLES);
  const [roleCounts, setRoleCounts] = useState({});
  const [newGoodRole, setNewGoodRole] = useState('');
  const [newEvilRole, setNewEvilRole] = useState('');
  const [modeName, setModeName] = useState('');
  const [savedModes, setSavedModes] = useState([]);
  const [activeModeName, setActiveModeName] = useState(null);

  // 數字選擇器
  const [activePicker, setActivePicker] = useState(null);

  useEffect(() => {
    const localModes = localStorage.getItem('ww_modes_v5');
    if (localModes) setSavedModes(JSON.parse(localModes));
    resetGame();
  }, []);

  const resetGame = () => {
    const initialPlayers = Array.from({ length: 12 }, (_, i) => ({
      id: `p-${i + 1}`, no: i + 1, role: '', death: '存活', side: '',
      rounds: [{ good: [], wolf: [] }] 
    }));
    setPlayers(initialPlayers);
    setRoundsCount(1);
    setIsEditingPlayers(false);
  };

  const addNewRoundGlobal = () => {
    setPlayers(players.map(p => ({
      ...p,
      rounds: [...p.rounds, { good: [], wolf: [] }]
    })));
    setRoundsCount(roundsCount + 1);
  };

  const onDragEnd = (result) => {
    const { source, destination } = result;
    if (!destination) return;
    const sourceParts = source.droppableId.split('-');
    const destParts = destination.droppableId.split('-');
    const pIdx = parseInt(sourceParts[1]);
    const rIdx = parseInt(sourceParts[3]);
    const sourceField = sourceParts[4];
    const destField = destParts[4];
    const newPlayers = [...players];
    const sourceList = newPlayers[pIdx].rounds[rIdx][sourceField];
    const destList = newPlayers[pIdx].rounds[rIdx][destField];
    const [movedItem] = sourceList.splice(source.index, 1);
    destList.splice(destination.index, 0, movedItem);
    setPlayers(newPlayers);
  };

  const toggleNumberInPicker = (num) => {
    if (!activePicker) return;
    const { type, pIdx, rIdx } = activePicker;
    const newPlayers = [...players];
    if (type === 'side') {
      newPlayers[pIdx].side = newPlayers[pIdx].side === num ? '' : num;
    } else {
      const list = newPlayers[pIdx].rounds[rIdx][type];
      const index = list.indexOf(num);
      if (index > -1) list.splice(index, 1);
      else list.push(num);
    }
    setPlayers(newPlayers);
  };

  const applyMode = (m) => {
    setRoleCounts(m.counts);
    setActiveModeName(m.name);
    setIsSettingMode(false);
  };

  const themeClasses = theme === 'day' 
    ? { bg: 'bg-slate-100', card: 'bg-white', text: 'text-slate-800', input: 'bg-slate-200', border: 'border-slate-300' }
    : { bg: 'bg-slate-950', card: 'bg-slate-900', text: 'text-slate-100', input: 'bg-slate-800', border: 'border-slate-800' };

  return (
    <div className={`min-h-screen ${themeClasses.bg} ${themeClasses.text} p-4 md:p-8 transition-colors duration-500 font-sans`}>
      {/* Header */}
      <div className="max-w-7xl mx-auto flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-black tracking-tighter bg-gradient-to-r from-blue-500 to-indigo-500 bg-clip-text text-transparent">狼人殺紀錄</h1>
          <p className="text-[10px] font-bold opacity-30 tracking-[0.3em]">WOLF TRACKER PRO</p>
        </div>

        <div className="flex gap-2">
          {!isSettingMode && (
            <button onClick={addNewRoundGlobal} className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-2xl font-bold text-sm shadow-lg shadow-indigo-900/40 hover:scale-105 transition-transform">
              <History size={18}/> 新增輪次
            </button>
          )}
          <button onClick={resetGame} className="p-3 bg-rose-500/10 text-rose-500 rounded-2xl hover:bg-rose-500/20"><RotateCcw size={20}/></button>
          <button onClick={() => setIsSettingMode(!isSettingMode)} className={`px-6 py-3 rounded-2xl font-bold text-sm shadow-lg transition-all ${isSettingMode ? 'bg-orange-500 text-white' : 'bg-blue-600 text-white shadow-blue-900/40'}`}>
            {isSettingMode ? '返回紀錄' : '模式設定'}
          </button>
          <button onClick={() => setTheme(theme === 'day' ? 'night' : 'day')} className={`p-3 rounded-2xl ${themeClasses.card} shadow-md`}>
            {theme === 'day' ? <Moon size={20} className="text-indigo-600" /> : <Sun size={20} className="text-yellow-400" />}
          </button>
        </div>
      </div>

      {isSettingMode ? (
        <div className="max-w-5xl mx-auto space-y-10 animate-in fade-in zoom-in duration-300">
          <div className={`${themeClasses.card} p-8 md:p-12 rounded-[3rem] shadow-2xl border ${themeClasses.border}`}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-16">
              {/* 好人陣營 */}
              <section>
                <h3 className="text-blue-500 font-black text-xl mb-6 flex items-center gap-2">● 好人陣營</h3>
                <div className="grid grid-cols-2 gap-4">
                  {goodRoles.map(r => (
                    <div key={r} className={`${themeClasses.input} p-5 rounded-3xl flex flex-col items-center border border-transparent focus-within:border-blue-500 transition-all shadow-sm`}>
                      <span className="text-xl font-black mb-1">{r}</span>
                      <input type="number" value={roleCounts[r]||''} onChange={e=>setRoleCounts({...roleCounts,[r]:e.target.value})} className="bg-transparent text-center font-black text-2xl w-full outline-none text-blue-500" placeholder="0"/>
                    </div>
                  ))}
                  <div className="p-4 border-2 border-dashed border-blue-500/30 rounded-3xl flex flex-col gap-2 justify-center">
                    <input type="text" placeholder="自訂好人" value={newGoodRole} onChange={e=>setNewGoodRole(e.target.value)} className="bg-transparent text-center text-sm font-black outline-none"/>
                    <button onClick={()=>{if(newGoodRole){setGoodRoles([...goodRoles,newGoodRole]);setNewGoodRole('')}}} className="bg-blue-600 text-white text-xs py-2 rounded-xl font-black">＋ 新增身分</button>
                  </div>
                </div>
              </section>

              {/* 壞人陣營 */}
              <section>
                <h3 className="text-rose-500 font-black text-xl mb-6 flex items-center gap-2">● 邪惡陣營</h3>
                <div className="grid grid-cols-2 gap-4">
                  {evilRoles.map(r => (
                    <div key={r} className={`${themeClasses.input} p-5 rounded-3xl flex flex-col items-center border border-transparent focus-within:border-rose-500 transition-all shadow-sm`}>
                      <span className="text-xl font-black mb-1">{r}</span>
                      <input type="number" value={roleCounts[r]||''} onChange={e=>setRoleCounts({...roleCounts,[r]:e.target.value})} className="bg-transparent text-center font-black text-2xl w-full outline-none text-rose-500" placeholder="0"/>
                    </div>
                  ))}
                  <div className="p-4 border-2 border-dashed border-rose-500/30 rounded-3xl flex flex-col gap-2 justify-center">
                    <input type="text" placeholder="自訂壞人" value={newEvilRole} onChange={e=>setNewEvilRole(e.target.value)} className="bg-transparent text-center text-sm font-black outline-none"/>
                    <button onClick={()=>{if(newEvilRole){setEvilRoles([...evilRoles,newEvilRole]);setNewEvilRole('')}}} className="bg-rose-600 text-white text-xs py-2 rounded-xl font-black">＋ 新增身分</button>
                  </div>
                </div>
              </section>
            </div>

            <div className="mt-12 pt-10 border-t border-gray-500/20 flex flex-col md:flex-row gap-4">
              <input type="text" value={modeName} onChange={e=>setModeName(e.target.value)} placeholder="輸入新模式名稱..." className={`flex-1 p-5 rounded-3xl ${themeClasses.input} font-black text-lg outline-none`}/>
              <button onClick={()=>{
                if(!modeName) return alert('請輸入名稱');
                const newMode = { name: modeName, counts: {...roleCounts} };
                const updated = [...savedModes, newMode];
                setSavedModes(updated);
                localStorage.setItem('ww_modes_v5', JSON.stringify(updated));
                setModeName('');
                setActiveModeName(newMode.name);
              }} className="px-10 bg-gradient-to-r from-blue-600 to-indigo-700 text-white rounded-3xl font-black shadow-xl hover:scale-105 transition-all">儲存模式配置</button>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {savedModes.map((m,i)=>(
              <div 
                key={i} 
                onClick={() => applyMode(m)}
                className={`relative p-6 rounded-[2rem] border-4 transition-all cursor-pointer group hover:-translate-y-2 ${activeModeName === m.name ? 'border-blue-500 bg-blue-600 text-white shadow-blue-500/40' : `${themeClasses.card} ${themeClasses.border} opacity-60 hover:opacity-100 hover:shadow-xl`}`}
              >
                {activeModeName === m.name && <Star className="absolute top-4 right-4 fill-white" size={16} />}
                <h4 className="font-black text-xl mb-1 truncate pr-6">{m.name}</h4>
                <p className={`text-[10px] font-black uppercase tracking-widest ${activeModeName === m.name ? 'text-blue-100' : 'text-blue-500'}`}>
                  {activeModeName === m.name ? '目前選擇模式' : '點擊切換模式'}
                </p>
                <button onClick={(e)=>{e.stopPropagation(); const u=savedModes.filter((_,idx)=>idx!==i);setSavedModes(u);localStorage.setItem('ww_modes_v5',JSON.stringify(u)); if(activeModeName===m.name) setActiveModeName(null)}} className="absolute bottom-4 right-4 p-2 text-rose-500 hover:bg-rose-500 hover:text-white rounded-full transition-all">
                  <Trash2 size={16}/>
                </button>
              </div>
            ))}
          </div>
        </div>
      ) : (
        /* 主遊戲紀錄介面 */
        <div className="max-w-7xl mx-auto space-y-4">
          {activeModeName && (
            <div className="flex items-center gap-2 px-4 py-2 bg-blue-600/10 text-blue-500 rounded-full w-fit mx-auto mb-4 border border-blue-500/20 shadow-sm">
              <Star size={14} className="fill-blue-500" />
              <span className="text-xs font-black tracking-widest">目前模式：{activeModeName}</span>
            </div>
          )}

          <DragDropContext onDragEnd={onDragEnd}>
            <div className="grid grid-cols-1 gap-4">
              {players.map((p, pIdx) => (
                <div key={p.id} className={`${themeClasses.card} rounded-[2.5rem] p-6 shadow-xl border ${themeClasses.border} flex flex-col lg:flex-row gap-6 relative group hover:ring-4 hover:ring-blue-500/10 transition-all`}>
                  
                  {/* 玩家基本資訊 */}
                  <div className="flex flex-row lg:flex-col items-center gap-4 border-b lg:border-b-0 lg:border-r border-gray-500/20 pb-4 lg:pb-0 lg:pr-6 shrink-0">
                    <div className="relative">
                      {isEditingPlayers && (
                        <button onClick={()=>{if(players.length>8){const n=players.filter((_,i)=>i!==pIdx).map((pl,i)=>({...pl,no:i+1}));setPlayers(n)}}} className="absolute -left-2 -top-2 bg-rose-500 text-white p-1 rounded-full shadow-lg z-10"><X size={12}/></button>
                      )}
                      <div className="w-16 h-16 rounded-3xl bg-gradient-to-br from-blue-600 to-indigo-700 flex items-center justify-center text-white text-3xl font-black shadow-xl">
                        {p.no}
                      </div>
                    </div>
                    
                    <div className="flex flex-col gap-2 w-32">
                      <select value={p.role} onChange={e=>{const n=[...players];n[pIdx].role=e.target.value;setPlayers(n)}} className={`p-2 rounded-xl text-xs font-black outline-none ${themeClasses.input} appearance-none text-center`}>
                        <option value="">身分</option>
                        {Object.entries(roleCounts).filter(([_,c])=>c>0).map(([r])=><option key={r} value={r}>{r}</option>)}
                        {!Object.values(roleCounts).some(c=>c>0) && [...goodRoles,...evilRoles].map(r=><option key={r} value={r}>{r}</option>)}
                      </select>
                      <select value={p.death} onChange={e=>{const n=[...players];n[pIdx].death=e.target.value;setPlayers(n)}} className={`p-2 rounded-xl text-xs font-black outline-none ${themeClasses.input} ${p.death!=='存活'?'text-rose-500':'text-emerald-500'} appearance-none text-center`}>
                        {DEATH_METHODS.map(m=><option key={m} value={m}>{m}</option>)}
                      </select>
                      <button onClick={()=>setActivePicker({type:'side',pIdx,rIdx:0})} className={`p-2 rounded-xl text-[10px] font-black ${themeClasses.input} tracking-tighter`}>
                        站邊: {p.side || '-'}
                      </button>
                    </div>
                  </div>

                  {/* 多回合清單 */}
                  <div className="flex-1 space-y-4">
                    {p.rounds.map((round, rIdx) => (
                      <div key={rIdx} className="flex flex-col sm:flex-row items-center gap-4 p-4 rounded-3xl bg-gray-500/5 border border-gray-500/10">
                        <div className="shrink-0 text-xs font-black opacity-20 w-8">R{rIdx + 1}</div>
                        
                        <div className="flex-1 w-full grid grid-cols-2 gap-6">
                          {/* 好人分欄 */}
                          <Droppable droppableId={`p-${pIdx}-round-${rIdx}-good`} direction="horizontal">
                            {(provided) => (
                              <div {...provided.droppableProps} ref={provided.innerRef} className="flex flex-wrap gap-2 min-h-[44px] items-center p-2 rounded-2xl bg-blue-500/5 border border-blue-500/10">
                                <span className="text-[10px] font-black text-blue-500 mr-2 uppercase tracking-widest">好人</span>
                                {round.good.map((num, i) => (
                                  <Draggable key={`p-${pIdx}-r-${rIdx}-g-${num}`} draggableId={`p-${pIdx}-r-${rIdx}-g-${num}`} index={i}>
                                    {(provided, snap) => (
                                      <div ref={provided.innerRef} {...provided.draggableProps} {...provided.dragHandleProps} 
                                        className={`px-4 py-1.5 bg-blue-600 text-white rounded-xl font-black text-sm shadow-lg ${snap.isDragging?'opacity-100 scale-125 z-50':''}`}>
                                        {num}
                                      </div>
                                    )}
                                  </Draggable>
                                ))}
                                {provided.placeholder}
                                <button onClick={()=>setActivePicker({type:'good',pIdx,rIdx})} className="w-8 h-8 rounded-xl border-2 border-dashed border-gray-500/20 flex items-center justify-center text-gray-500 hover:text-blue-500 transition-colors"><Plus size={14}/></button>
                              </div>
                            )}
                          </Droppable>

                          {/* 狼坑分欄 */}
                          <Droppable droppableId={`p-${pIdx}-round-${rIdx}-wolf`} direction="horizontal">
                            {(provided) => (
                              <div {...provided.droppableProps} ref={provided.innerRef} className="flex flex-wrap gap-2 min-h-[44px] items-center p-2 rounded-2xl bg-rose-500/5 border border-rose-500/10">
                                <span className="text-[10px] font-black text-rose-500 mr-2 uppercase tracking-widest">狼坑</span>
                                {round.wolf.map((num, i) => (
                                  <Draggable key={`p-${pIdx}-r-${rIdx}-w-${num}`} draggableId={`p-${pIdx}-r-${rIdx}-w-${num}`} index={i}>
                                    {(provided, snap) => (
                                      <div ref={provided.innerRef} {...provided.draggableProps} {...provided.dragHandleProps} 
                                        className={`px-4 py-1.5 bg-rose-600 text-white rounded-xl font-black text-sm shadow-lg ${snap.isDragging?'opacity-100 scale-125 z-50':''}`}>
                                        {num}
                                      </div>
                                    )}
                                  </Draggable>
                                ))}
                                {provided.placeholder}
                                <button onClick={()=>setActivePicker({type:'wolf',pIdx,rIdx})} className="w-8 h-8 rounded-xl border-2 border-dashed border-gray-500/20 flex items-center justify-center text-gray-500 hover:text-rose-500 transition-colors"><Plus size={14}/></button>
                              </div>
                            )}
                          </Droppable>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </DragDropContext>

          <div className="mt-12 flex flex-col items-center gap-4">
            <button onClick={()=>setIsEditingPlayers(!isEditingPlayers)} className={`px-10 py-4 rounded-3xl font-black transition-all shadow-xl ${isEditingPlayers?'bg-orange-600 text-white':'bg-gray-500/10 opacity-30 hover:opacity-100'}`}>
              <Edit3 size={20} className="inline mr-2"/> {isEditingPlayers?'結束編輯模式':'編輯玩家位置'}
            </button>
            {isEditingPlayers && (
              <button onClick={()=>setPlayers([...players,{id:`p-${Date.now()}`,no:players.length+1,role:'',death:'存活',side:'',rounds:Array.from({length:roundsCount},()=>({good:[],wolf:[]}))}])} className="px-8 py-4 border-4 border-dashed border-blue-500 text-blue-500 rounded-[2rem] font-black animate-pulse">
                ＋ 新增玩家位置
              </button>
            )}
          </div>
        </div>
      )}

      {/* 數字選擇器彈窗 */}
      {activePicker && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in" onClick={()=>setActivePicker(null)}>
          <div className={`${themeClasses.card} p-10 rounded-[3rem] shadow-2xl w-full max-w-sm border ${themeClasses.border}`} onClick={e=>e.stopPropagation()}>
            <div className="flex justify-between items-center mb-8">
              <h3 className="font-black text-2xl tracking-tighter uppercase">{activePicker.type === 'side' ? '選擇站邊' : '選擇號碼'}</h3>
              <button onClick={()=>setActivePicker(null)} className="p-2 bg-gray-500/10 rounded-full hover:bg-rose-500 hover:text-white transition-all"><X size={24}/></button>
            </div>
            <div className="grid grid-cols-4 gap-4">
              {players.map(p => {
                const isSelected = activePicker.type === 'side' 
                  ? players[activePicker.pIdx].side === p.no.toString()
                  : players[activePicker.pIdx].rounds[activePicker.rIdx][activePicker.type].includes(p.no.toString());
                return (
                  <button key={p.id} onClick={() => toggleNumberInPicker(p.no.toString())}
                    className={`h-16 rounded-[1.5rem] font-black text-xl transition-all ${isSelected ? 'bg-blue-600 text-white scale-110 shadow-xl' : themeClasses.input + ' opacity-40 hover:opacity-100'}`}>
                    {p.no}
                  </button>
                );
              })}
            </div>
            <button onClick={()=>setActivePicker(null)} className="w-full mt-10 py-5 bg-gradient-to-r from-blue-600 to-indigo-700 text-white rounded-3xl font-black shadow-xl flex items-center justify-center gap-2 uppercase tracking-widest underline-offset-4">確認選擇</button>
          </div>
        </div>
      )}

      <footer className="mt-16 text-center text-[10px] font-black opacity-20 uppercase tracking-[0.8em]">wolf Tracker</footer>
    </div>
  );
}
