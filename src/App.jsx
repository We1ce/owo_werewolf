import React, { useState, useEffect } from 'react';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import { Sun, Moon, Plus, Trash2, X, RotateCcw, Save, Edit3, CheckCircle2, History } from 'lucide-react';

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

  // 數字選擇器
  const [activePicker, setActivePicker] = useState(null); // { type, pIdx, roundIdx }

  useEffect(() => {
    const localModes = localStorage.getItem('ww_modes_v3');
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

    // 分解 ID: "p-0-round-0-good"
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

  const themeClasses = theme === 'day' 
    ? { bg: 'bg-slate-100', card: 'bg-white', text: 'text-slate-800', input: 'bg-slate-200', border: 'border-slate-300' }
    : { bg: 'bg-slate-950', card: 'bg-slate-900', text: 'text-slate-100', input: 'bg-slate-800', border: 'border-slate-800' };

  return (
    <div className={`min-h-screen ${themeClasses.bg} ${themeClasses.text} p-4 md:p-8 transition-colors duration-500`}>
      {/* Header */}
      <div className="max-w-7xl mx-auto flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-black tracking-tighter bg-gradient-to-r from-blue-500 to-indigo-500 bg-clip-text text-transparent">狼人殺紀錄</h1>
          <p className="text-[10px] font-bold opacity-30 tracking-[0.3em]">WOLF TRACKER PRO</p>
        </div>

        <div className="flex gap-2">
          {!isSettingMode && (
            <button onClick={addNewRoundGlobal} className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-2xl font-bold text-sm shadow-lg shadow-indigo-900/40">
              <History size={18}/> 新增全場紀錄輪次
            </button>
          )}
          <button onClick={resetGame} className="p-3 bg-rose-500/10 text-rose-500 rounded-2xl hover:bg-rose-500/20"><RotateCcw size={20}/></button>
          <button onClick={() => setIsSettingMode(!isSettingMode)} className="px-6 py-3 bg-blue-600 text-white rounded-2xl font-bold text-sm shadow-lg shadow-blue-900/40">
            {isSettingMode ? '返回' : '模式設定'}
          </button>
          <button onClick={() => setTheme(theme === 'day' ? 'night' : 'day')} className={`p-3 rounded-2xl ${themeClasses.card} shadow-md`}>
            {theme === 'day' ? <Moon size={20} className="text-indigo-600" /> : <Sun size={20} className="text-yellow-400" />}
          </button>
        </div>
      </div>

      {isSettingMode ? (
        /* 模式設定 (與之前邏輯相同但排版微調) */
        <div className="max-w-5xl mx-auto space-y-8 animate-in fade-in zoom-in duration-300">
          <div className={`${themeClasses.card} p-8 rounded-[2.5rem] shadow-2xl border ${themeClasses.border}`}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
              <section>
                <h3 className="text-blue-500 font-black mb-4">● 好人陣營</h3>
                <div className="grid grid-cols-3 gap-3">
                  {goodRoles.map(r => (
                    <div key={r} className={`${themeClasses.input} p-3 rounded-2xl flex flex-col items-center`}>
                      <span className="text-[10px] font-bold opacity-50">{r}</span>
                      <input type="number" value={roleCounts[r]||''} onChange={e=>setRoleCounts({...roleCounts,[r]:e.target.value})} className="bg-transparent text-center font-black text-lg w-full outline-none" placeholder="0"/>
                    </div>
                  ))}
                  <div className="p-2 border-2 border-dashed border-blue-500/30 rounded-2xl flex flex-col gap-1">
                    <input type="text" placeholder="自訂" value={newGoodRole} onChange={e=>setNewGoodRole(e.target.value)} className="bg-transparent text-center text-xs font-bold outline-none"/>
                    <button onClick={()=>{if(newGoodRole){setGoodRoles([...goodRoles,newGoodRole]);setNewGoodRole('')}}} className="bg-blue-600 text-white text-[10px] py-1 rounded-lg font-bold">新增</button>
                  </div>
                </div>
              </section>
              <section>
                <h3 className="text-rose-500 font-black mb-4">● 邪惡陣營</h3>
                <div className="grid grid-cols-3 gap-3">
                  {evilRoles.map(r => (
                    <div key={r} className={`${themeClasses.input} p-3 rounded-2xl flex flex-col items-center`}>
                      <span className="text-[10px] font-bold opacity-50">{r}</span>
                      <input type="number" value={roleCounts[r]||''} onChange={e=>setRoleCounts({...roleCounts,[r]:e.target.value})} className="bg-transparent text-center font-black text-lg w-full outline-none" placeholder="0"/>
                    </div>
                  ))}
                  <div className="p-2 border-2 border-dashed border-rose-500/30 rounded-2xl flex flex-col gap-1">
                    <input type="text" placeholder="自訂" value={newEvilRole} onChange={e=>setNewEvilRole(e.target.value)} className="bg-transparent text-center text-xs font-bold outline-none"/>
                    <button onClick={()=>{if(newEvilRole){setEvilRoles([...evilRoles,newEvilRole]);setNewEvilRole('')}}} className="bg-rose-600 text-white text-[10px] py-1 rounded-lg font-bold">新增</button>
                  </div>
                </div>
              </section>
            </div>
            <div className="mt-8 pt-8 border-t border-gray-700 flex gap-4">
              <input type="text" value={modeName} onChange={e=>setModeName(e.target.value)} placeholder="模式名稱" className={`flex-1 p-4 rounded-2xl ${themeClasses.input} font-bold outline-none`}/>
              <button onClick={()=>{
                if(!modeName) return alert('請輸入名稱');
                const newMode = { name: modeName, counts: {...roleCounts} };
                const updated = [...savedModes, newMode];
                setSavedModes(updated);
                localStorage.setItem('ww_modes_v3', JSON.stringify(updated));
                setModeName('');
              }} className="px-8 bg-blue-600 text-white rounded-2xl font-black shadow-lg">儲存配置</button>
            </div>
          </div>
          <div className="grid grid-cols-3 gap-4">
            {savedModes.map((m,i)=>(
              <div key={i} className={`${themeClasses.card} p-4 rounded-2xl border ${themeClasses.border} flex justify-between items-center group`}>
                <div onClick={()=>{setRoleCounts(m.counts);setIsSettingMode(false)}} className="cursor-pointer">
                  <h4 className="font-black text-blue-500 text-sm">{m.name}</h4>
                </div>
                <button onClick={()=>{const u=savedModes.filter((_,idx)=>idx!==i);setSavedModes(u);localStorage.setItem('ww_modes_v3',JSON.stringify(u))}} className="text-rose-500 opacity-0 group-hover:opacity-100"><Trash2 size={16}/></button>
              </div>
            ))}
          </div>
        </div>
      ) : (
        /* 主遊戲紀錄介面 - 垂直輪次版 */
        <div className="max-w-full">
          <DragDropContext onDragEnd={onDragEnd}>
            <div className="grid grid-cols-1 gap-4">
              {players.map((p, pIdx) => (
                <div key={p.id} className={`${themeClasses.card} rounded-[2rem] p-6 shadow-xl border ${themeClasses.border} flex flex-col md:flex-row gap-6 relative group transition-all hover:ring-2 hover:ring-blue-500/20`}>
                  
                  {/* 左側：玩家基本資訊 */}
                  <div className="flex flex-row md:flex-col items-center gap-4 border-b md:border-b-0 md:border-r border-gray-700 pb-4 md:pb-0 md:pr-6 shrink-0">
                    <div className="relative">
                      {isEditingPlayers && (
                        <button onClick={()=>{if(players.length>8){const n=players.filter((_,i)=>i!==pIdx).map((pl,i)=>({...pl,no:i+1}));setPlayers(n)}}} className="absolute -left-2 -top-2 bg-rose-500 text-white p-1 rounded-full"><X size={12}/></button>
                      )}
                      <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-700 flex items-center justify-center text-white text-2xl font-black shadow-lg">
                        {p.no}
                      </div>
                    </div>
                    
                    <div className="flex flex-col gap-2">
                      <select value={p.role} onChange={e=>{const n=[...players];n[pIdx].role=e.target.value;setPlayers(n)}} className={`p-2 rounded-xl text-xs font-black outline-none ${themeClasses.input}`}>
                        <option value="">身分</option>
                        {Object.entries(roleCounts).filter(([_,c])=>c>0).map(([r])=><option key={r} value={r}>{r}</option>)}
                        {!Object.values(roleCounts).some(c=>c>0) && [...goodRoles,...evilRoles].map(r=><option key={r} value={r}>{r}</option>)}
                      </select>
                      <select value={p.death} onChange={e=>{const n=[...players];n[pIdx].death=e.target.value;setPlayers(n)}} className={`p-2 rounded-xl text-xs font-black outline-none ${themeClasses.input} ${p.death!=='存活'?'text-rose-500':'text-emerald-500'}`}>
                        {DEATH_METHODS.map(m=><option key={m} value={m}>{m}</option>)}
                      </select>
                      <button onClick={()=>setActivePicker({type:'side',pIdx,rIdx:0})} className={`p-2 rounded-xl text-xs font-black ${themeClasses.input}`}>
                        站邊: {p.side || '-'}
                      </button>
                    </div>
                  </div>

                  {/* 右側：多回合清單 */}
                  <div className="flex-1 space-y-3 overflow-hidden">
                    {p.rounds.map((round, rIdx) => (
                      <div key={rIdx} className="flex flex-col sm:flex-row items-start sm:items-center gap-4 p-3 rounded-2xl bg-gray-500/5 border border-gray-500/10">
                        <div className="shrink-0 text-[10px] font-black opacity-30 w-12 uppercase">R{rIdx + 1}</div>
                        
                        {/* 好人列 */}
                        <div className="flex-1 w-full">
                          <Droppable droppableId={`p-${pIdx}-round-${rIdx}-good`} direction="horizontal">
                            {(provided) => (
                              <div {...provided.droppableProps} ref={provided.innerRef} className="flex flex-wrap gap-2 min-h-[32px] items-center">
                                <span className="text-[10px] font-bold text-blue-500 mr-1 uppercase">Good</span>
                                {round.good.map((num, i) => (
                                  <Draggable key={`p-${pIdx}-r-${rIdx}-g-${num}`} draggableId={`p-${pIdx}-r-${rIdx}-g-${num}`} index={i}>
                                    {(provided, snap) => (
                                      <div ref={provided.innerRef} {...provided.draggableProps} {...provided.dragHandleProps} 
                                        className={`px-3 py-1 bg-blue-600 text-white rounded-lg font-black text-xs shadow-md ${snap.isDragging?'opacity-100 scale-110':'opacity-100'}`}>
                                        {num}
                                      </div>
                                    )}
                                  </Draggable>
                                ))}
                                {provided.placeholder}
                                <button onClick={()=>setActivePicker({type:'good',pIdx,rIdx})} className="w-6 h-6 rounded-lg border-2 border-dashed border-gray-500/30 flex items-center justify-center text-gray-500 hover:text-blue-500"><Plus size={12}/></button>
                              </div>
                            )}
                          </Droppable>
                        </div>

                        {/* 狼坑列 */}
                        <div className="flex-1 w-full">
                          <Droppable droppableId={`p-${pIdx}-round-${rIdx}-wolf`} direction="horizontal">
                            {(provided) => (
                              <div {...provided.droppableProps} ref={provided.innerRef} className="flex flex-wrap gap-2 min-h-[32px] items-center">
                                <span className="text-[10px] font-bold text-rose-500 mr-1 uppercase">Wolf</span>
                                {round.wolf.map((num, i) => (
                                  <Draggable key={`p-${pIdx}-r-${rIdx}-w-${num}`} draggableId={`p-${pIdx}-r-${rIdx}-w-${num}`} index={i}>
                                    {(provided, snap) => (
                                      <div ref={provided.innerRef} {...provided.draggableProps} {...provided.dragHandleProps} 
                                        className={`px-3 py-1 bg-rose-600 text-white rounded-lg font-black text-xs shadow-md ${snap.isDragging?'opacity-100 scale-110':'opacity-100'}`}>
                                        {num}
                                      </div>
                                    )}
                                  </Draggable>
                                ))}
                                {provided.placeholder}
                                <button onClick={()=>setActivePicker({type:'wolf',pIdx,rIdx})} className="w-6 h-6 rounded-lg border-2 border-dashed border-gray-500/30 flex items-center justify-center text-gray-500 hover:text-rose-500"><Plus size={12}/></button>
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

          {/* 編輯按鈕 */}
          <div className="mt-8 flex flex-col items-center gap-4">
            <button onClick={()=>setIsEditingPlayers(!isEditingPlayers)} className={`px-8 py-3 rounded-2xl font-black transition-all ${isEditingPlayers?'bg-orange-500 text-white shadow-lg':'bg-gray-500/10 opacity-30'}`}>
              <Edit3 size={18} className="inline mr-2"/> {isEditingPlayers?'結束編輯':'編輯玩家位置'}
            </button>
            {isEditingPlayers && (
              <button onClick={()=>setPlayers([...players,{id:`p-${Date.now()}`,no:players.length+1,role:'',death:'存活',side:'',rounds:Array.from({length:roundsCount},()=>({good:[],wolf:[]}))}])} className="px-6 py-3 border-2 border-dashed border-blue-500 text-blue-500 rounded-2xl font-bold animate-pulse">
                + 新增玩家位置
              </button>
            )}
          </div>
        </div>
      )}

      {/* 數字選擇器彈窗 */}
      {activePicker && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm" onClick={()=>setActivePicker(null)}>
          <div className={`${themeClasses.card} p-8 rounded-[2.5rem] shadow-2xl w-full max-w-sm border ${themeClasses.border}`} onClick={e=>e.stopPropagation()}>
            <div className="flex justify-between items-center mb-6">
              <h3 className="font-black text-xl uppercase tracking-widest">{activePicker.type === 'side' ? '選擇站邊' : '選擇號碼'}</h3>
              <button onClick={()=>setActivePicker(null)} className="p-2 bg-gray-500/10 rounded-full"><X size={20}/></button>
            </div>
            <div className="grid grid-cols-4 gap-3">
              {players.map(p => {
                const isSelected = activePicker.type === 'side' 
                  ? players[activePicker.pIdx].side === p.no.toString()
                  : players[activePicker.pIdx].rounds[activePicker.rIdx][activePicker.type].includes(p.no.toString());
                
                return (
                  <button key={p.id} onClick={() => toggleNumberInPicker(p.no.toString())}
                    className={`h-14 rounded-2xl font-black text-lg transition-all ${isSelected ? 'bg-blue-600 text-white scale-110 shadow-lg' : themeClasses.input + ' opacity-50'}`}>
                    {p.no}
                  </button>
                );
              })}
            </div>
            <button onClick={()=>setActivePicker(null)} className="w-full mt-8 py-4 bg-blue-600 text-white rounded-2xl font-black flex items-center justify-center gap-2 shadow-xl"><CheckCircle2 size={20}/> 確定</button>
          </div>
        </div>
      )}

      <footer className="mt-12 text-center text-[10px] font-black opacity-20 uppercase tracking-[0.5em]">wolf Tracker</footer>
    </div>
  );
}
