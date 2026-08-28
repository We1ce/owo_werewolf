import React, { useState, useEffect, useRef } from 'react';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import { Sun, Moon, Plus, Trash2, UserPlus, X, Check, ChevronLeft, ChevronRight, RotateCcw, Save } from 'lucide-react';

// --- 初始資料 ---
const BASE_ROLES = {
  good: ['預言家', '女巫', '獵人', '守衛', '平民'],
  evil: ['小狼', '狼王', '機械狼', '白狼王', '黑狼王', '大灰狼']
};

const DEATH_METHODS = ['存活', '刀殺', '毒殺', '票死', '帶走', '自爆', '彈死'];

// --- 子組件：標籤列表 ---
const DynamicTagList = ({ items, onAdd, onRemove, colorClass, droppableId, theme }) => {
  const [isAdding, setIsAdding] = useState(false);
  const [inputValue, setInputValue] = useState('');
  const inputRef = useRef(null);

  useEffect(() => {
    if (isAdding && inputRef.current) inputRef.current.focus();
  }, [isAdding]);

  const handleAdd = () => {
    if (inputValue.trim()) {
      onAdd(inputValue.trim());
      setInputValue('');
    }
    setIsAdding(false);
  };

  return (
    <div className="flex items-center gap-2 min-h-[40px]">
      <Droppable droppableId={droppableId} direction="horizontal">
        {(provided) => (
          <div {...provided.droppableProps} ref={provided.innerRef} className="flex flex-wrap gap-2">
            {items.map((item, index) => (
              <Draggable key={`${droppableId}-${item}`} draggableId={`${droppableId}-${item}`} index={index}>
                {(provided) => (
                  <div
                    ref={provided.innerRef}
                    {...provided.draggableProps}
                    {...provided.dragHandleProps}
                    className={`${colorClass} text-white px-3 py-1 rounded-xl font-bold text-sm shadow-sm select-none active:scale-95 transition-transform`}
                  >
                    {item}
                    <button onClick={() => onRemove(index)} className="ml-2 opacity-70 hover:opacity-100">
                      <X size={10} />
                    </button>
                  </div>
                )}
              </Draggable>
            ))}
            {provided.placeholder}
          </div>
        )}
      </Droppable>

      {isAdding ? (
        <div className="flex items-center gap-1 bg-gray-500 bg-opacity-10 rounded-xl p-1 shrink-0">
          <input
            ref={inputRef}
            type="number"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onBlur={handleAdd}
            onKeyDown={(e) => e.key === 'Enter' && handleAdd()}
            className="w-10 bg-transparent text-center outline-none font-bold"
            placeholder="#"
          />
        </div>
      ) : (
        <button
          onClick={() => setIsAdding(true)}
          className="w-8 h-8 rounded-xl border-2 border-dashed border-gray-400 flex items-center justify-center text-gray-400 hover:text-blue-500 hover:border-blue-500 transition-all shrink-0"
        >
          <Plus size={16} />
        </button>
      )}
    </div>
  );
};

// --- 主程式 ---
export default function App() {
  const [theme, setTheme] = useState('night');
  const [isSettingMode, setIsSettingMode] = useState(false);
  const [currentRound, setCurrentRound] = useState(1);
  const [players, setPlayers] = useState([]);
  
  // 模式設定相關狀態
  const [customRoles, setCustomRoles] = useState([...BASE_ROLES.good, ...BASE_ROLES.evil]);
  const [newRoleName, setNewRoleName] = useState('');
  const [modeName, setModeName] = useState('');
  const [roleCounts, setRoleCounts] = useState({});
  const [savedModes, setSavedModes] = useState([]);

  // 初始化與讀取本地儲存
  useEffect(() => {
    const localModes = localStorage.getItem('ww_modes');
    if (localModes) setSavedModes(JSON.parse(localModes));
    resetGame();
  }, []);

  const resetGame = () => {
    const initialPlayers = Array.from({ length: 12 }, (_, i) => ({
      id: `p-${i + 1}`,
      no: i + 1,
      role: '',
      death: '存活',
      side: '',
      perceptions: { 1: { good: [], wolf: [] } } // 結構: { 輪次: { good: [], wolf: [] } }
    }));
    setPlayers(initialPlayers);
    setCurrentRound(1);
  };

  const updatePlayer = (idx, field, value) => {
    const newPlayers = [...players];
    newPlayers[idx][field] = value;
    setPlayers(newPlayers);
  };

  const addRound = () => {
    const nextRound = currentRound + 1;
    const newPlayers = players.map(p => ({
      ...p,
      perceptions: {
        ...p.perceptions,
        [nextRound]: { 
          good: [...p.perceptions[currentRound].good], 
          wolf: [...p.perceptions[currentRound].wolf] 
        }
      }
    }));
    setPlayers(newPlayers);
    setCurrentRound(nextRound);
  };

  const onDragEnd = (result) => {
    const { source, destination } = result;
    if (!destination) return;

    // 解析 ID: "p-1-round-1-good"
    const sourceParts = source.droppableId.split('-');
    const destParts = destination.droppableId.split('-');
    
    const pIdx = players.findIndex(p => p.id === `${sourceParts[0]}-${sourceParts[1]}`);
    const round = sourceParts[3];
    const sourceField = sourceParts[4] === 'good' ? 'good' : 'wolf';
    const destField = destParts[4] === 'good' ? 'good' : 'wolf';

    const newPlayers = [...players];
    const sourceList = newPlayers[pIdx].perceptions[round][sourceField];
    const destList = newPlayers[pIdx].perceptions[round][destField];

    const [movedItem] = sourceList.splice(source.index, 1);
    
    // 如果是在同一個列表內移動，或是移動到另一個列表
    destList.splice(destination.index, 0, movedItem);
    
    setPlayers(newPlayers);
  };

  // 儲存模式
  const saveCurrentMode = () => {
    if (!modeName) return alert('請輸入模式名稱');
    const newMode = { name: modeName, counts: { ...roleCounts } };
    const updatedModes = [...savedModes, newMode];
    setSavedModes(updatedModes);
    localStorage.setItem('ww_modes', JSON.stringify(updatedModes));
    setModeName('');
    alert('模式已儲存');
  };

  const deleteMode = (idx) => {
    const updated = savedModes.filter((_, i) => i !== idx);
    setSavedModes(updated);
    localStorage.setItem('ww_modes', JSON.stringify(updated));
  };

  const themeClasses = theme === 'day' 
    ? { bg: 'bg-slate-50', card: 'bg-white', text: 'text-slate-800', input: 'bg-slate-100', border: 'border-slate-200' }
    : { bg: 'bg-slate-950', card: 'bg-slate-900', text: 'text-slate-100', input: 'bg-slate-800', border: 'border-slate-800' };

  return (
    <div className={`min-h-screen ${themeClasses.bg} ${themeClasses.text} p-4 md:p-8 transition-colors duration-500`}>
      {/* Navbar */}
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-black tracking-tighter bg-gradient-to-r from-blue-500 to-purple-500 bg-clip-text text-transparent">
            狼人殺紀錄
          </h1>
          <p className="text-xs opacity-50 font-bold tracking-widest uppercase">WOLF TRACKER</p>
        </div>

        <div className="flex items-center gap-3">
          {/* 輪次切換 */}
          {!isSettingMode && (
            <div className={`flex items-center gap-2 p-1 rounded-2xl ${themeClasses.card} shadow-sm border ${themeClasses.border}`}>
              <button onClick={() => setCurrentRound(Math.max(1, currentRound - 1))} className="p-2 hover:bg-gray-500 hover:bg-opacity-10 rounded-xl"><ChevronLeft size={20}/></button>
              <span className="font-black px-2 text-sm">ROUND {currentRound}</span>
              <button onClick={addRound} className="p-2 hover:bg-gray-500 hover:bg-opacity-10 rounded-xl text-blue-500"><Plus size={20}/></button>
            </div>
          )}
          
          <button onClick={resetGame} className="flex items-center gap-2 px-4 py-2 bg-rose-500 bg-opacity-10 text-rose-500 rounded-2xl font-bold text-sm hover:bg-opacity-20">
            <RotateCcw size={16} /> 開新局
          </button>
          <button onClick={() => setIsSettingMode(!isSettingMode)} className="px-4 py-2 bg-blue-600 text-white rounded-2xl font-bold text-sm shadow-lg shadow-blue-900/20">
            {isSettingMode ? '返回紀錄' : '模式設定'}
          </button>
          <button onClick={() => setTheme(theme === 'day' ? 'night' : 'day')} className={`p-3 rounded-2xl ${themeClasses.card} shadow-md`}>
            {theme === 'day' ? <Moon size={20} className="text-indigo-600" /> : <Sun size={20} className="text-yellow-400" />}
          </button>
        </div>
      </div>

      {isSettingMode ? (
        /* 設定模式介面 */
        <div className="max-w-4xl mx-auto space-y-6 animate-in fade-in slide-in-from-bottom-4">
          <div className={`${themeClasses.card} p-8 rounded-3xl border ${themeClasses.border} shadow-xl`}>
            <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">身分與模式配置</h2>
            
            {/* 新自身分 */}
            <div className="flex gap-2 mb-8">
              <input 
                type="text" value={newRoleName} onChange={(e) => setNewRoleName(e.target.value)}
                placeholder="新增自訂身分名稱" className={`flex-1 p-3 rounded-2xl ${themeClasses.input} outline-none focus:ring-2 focus:ring-blue-500`}
              />
              <button onClick={() => { if(newRoleName) { setCustomRoles([...customRoles, newRoleName]); setNewRoleName(''); } }} className="px-6 bg-green-600 text-white rounded-2xl font-bold">＋ 新增身分</button>
            </div>

            {/* 身分數量設定 */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
              {customRoles.map(role => (
                <div key={role} className={`p-3 rounded-2xl ${themeClasses.input} flex flex-col items-center`}>
                  <span className="text-xs font-bold opacity-60 mb-1">{role}</span>
                  <input 
                    type="number" min="0" placeholder="0" 
                    value={roleCounts[role] || ''} 
                    onChange={(e) => setRoleCounts({...roleCounts, [role]: e.target.value})}
                    className="bg-transparent text-center text-xl font-black w-full outline-none"
                  />
                </div>
              ))}
            </div>

            {/* 儲存模式 */}
            <div className="flex flex-col md:flex-row gap-4 pt-6 border-t border-gray-700">
              <input 
                type="text" value={modeName} onChange={(e) => setModeName(e.target.value)}
                placeholder="輸入模式名稱 (如: 12人機械狼局)" className={`flex-1 p-3 rounded-2xl ${themeClasses.input} outline-none`}
              />
              <button onClick={saveCurrentMode} className="flex items-center justify-center gap-2 px-8 py-3 bg-blue-600 text-white rounded-2xl font-bold"><Save size={18}/> 儲存此配置</button>
            </div>
          </div>

          {/* 已儲存模式清單 */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {savedModes.map((m, idx) => (
              <div key={idx} className={`${themeClasses.card} p-4 rounded-2xl flex justify-between items-center border ${themeClasses.border}`}>
                <div>
                  <h3 className="font-bold">{m.name}</h3>
                  <p className="text-xs opacity-50">自訂配置已載入</p>
                </div>
                <div className="flex gap-2">
                  <button onClick={() => { setRoleCounts(m.counts); setIsSettingMode(false); }} className="px-4 py-2 bg-blue-600 text-white rounded-xl text-xs font-bold">套用</button>
                  <button onClick={() => deleteMode(idx)} className="p-2 text-rose-500 hover:bg-rose-500 hover:bg-opacity-10 rounded-xl"><Trash2 size={16}/></button>
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        /* 主遊戲紀錄介面 */
        <div className="max-w-full">
          <DragDropContext onDragEnd={onDragEnd}>
            <div className="overflow-x-auto no-scrollbar rounded-3xl shadow-2xl">
              <table className="w-full border-separate border-spacing-y-3">
                <thead>
                  <tr className="text-xs uppercase tracking-widest opacity-50 px-4 text-left">
                    <th className="pb-2 pl-6">玩家</th>
                    <th className="pb-2">身分</th>
                    <th className="pb-2">狀態</th>
                    <th className="pb-2">站邊</th>
                    <th className="pb-2">好人</th>
                    <th className="pb-2 pr-6">狼坑</th>
                  </tr>
                </thead>
                <tbody>
                  {players.map((p, idx) => (
                    <tr key={p.id} className={`${themeClasses.card} transition-transform duration-200 hover:scale-[1.005]`}>
                      <td className="py-4 pl-6 rounded-l-3xl">
                        <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-black shadow-lg">
                          {p.no}
                        </div>
                      </td>
                      <td className="py-4 px-2">
                        <select 
                          value={p.role} onChange={(e) => updatePlayer(idx, 'role', e.target.value)}
                          className={`w-28 p-2 rounded-xl text-sm font-bold outline-none ${themeClasses.input}`}
                        >
                          <option value="">未知</option>
                          {Object.entries(roleCounts).filter(([_, count]) => count > 0).map(([role]) => (
                            <option key={role} value={role}>{role}</option>
                          ))}
                          {!Object.values(roleCounts).some(c => c > 0) && customRoles.map(r => <option key={r} value={r}>{r}</option>)}
                        </select>
                      </td>
                      <td className="py-4 px-2">
                        <select 
                          value={p.death} onChange={(e) => updatePlayer(idx, 'death', e.target.value)}
                          className={`w-24 p-2 rounded-xl text-sm font-bold outline-none ${themeClasses.input} ${p.death !== '存活' ? 'text-rose-500' : 'text-emerald-500'}`}
                        >
                          {DEATH_METHODS.map(m => <option key={m} value={m}>{m}</option>)}
                        </select>
                      </td>
                      <td className="py-4 px-2 text-center">
                        <input 
                          type="number" value={p.side} onChange={(e) => updatePlayer(idx, 'side', e.target.value)}
                          className={`w-14 p-2 rounded-xl text-center font-bold ${themeClasses.input}`} placeholder="-"
                        />
                      </td>
                      <td className="py-4 px-2">
                        <DynamicTagList 
                          items={p.perceptions[currentRound]?.good || []}
                          droppableId={`${p.id}-round-${currentRound}-good`}
                          colorClass="bg-blue-600"
                          theme={theme}
                          onAdd={(val) => {
                            const newPlayers = [...players];
                            newPlayers[idx].perceptions[currentRound].good.push(val);
                            setPlayers(newPlayers);
                          }}
                          onRemove={(itemIdx) => {
                            const newPlayers = [...players];
                            newPlayers[idx].perceptions[currentRound].good.splice(itemIdx, 1);
                            setPlayers(newPlayers);
                          }}
                        />
                      </td>
                      <td className="py-4 px-2 pr-6 rounded-r-3xl">
                        <DynamicTagList 
                          items={p.perceptions[currentRound]?.wolf || []}
                          droppableId={`${p.id}-round-${currentRound}-wolf`}
                          colorClass="bg-rose-600"
                          theme={theme}
                          onAdd={(val) => {
                            const newPlayers = [...players];
                            newPlayers[idx].perceptions[currentRound].wolf.push(val);
                            setPlayers(newPlayers);
                          }}
                          onRemove={(itemIdx) => {
                            const newPlayers = [...players];
                            newPlayers[idx].perceptions[currentRound].wolf.splice(itemIdx, 1);
                            setPlayers(newPlayers);
                          }}
                        />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </DragDropContext>

          <button 
            onClick={() => setPlayers([...players, { id: `p-${Date.now()}`, no: players.length + 1, role: '', death: '存活', side: '', perceptions: { [currentRound]: { good: [], wolf: [] } } }])}
            className="w-full mt-6 py-4 rounded-3xl border-2 border-dashed border-gray-500 border-opacity-20 flex items-center justify-center gap-2 opacity-40 hover:opacity-100 hover:border-blue-500 hover:text-blue-500 transition-all font-bold"
          >
            <UserPlus size={20} /> 新增玩家位置
          </button>
        </div>
      )}
      
      <footer className="mt-12 text-center text-xs opacity-20 font-bold tracking-tighter">
        &copy; {new Date().getFullYear()} wolf Tracker
      </footer>
    </div>
  );
}
