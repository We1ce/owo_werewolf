import React, { useState, useEffect, useRef } from 'react';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import { Sun, Moon, Plus, Trash2, GripVertical, UserPlus, X, Check } from 'lucide-react';

// --- 初始資料 ---
const DEFAULT_ROLES = {
  good: ['預言家', '女巫', '獵人', '守衛', '平民'],
  evil: ['小狼', '狼王', '機械狼', '白狼王', '黑狼王', '大灰狼']
};

const DEATH_METHODS = ['存活', '刀殺', '毒殺', '票死', '帶走', '自爆', '彈死'];

// --- 子組件：動態標籤列表 ---
const DynamicTagList = ({ items, onDragEnd, onAdd, onRemove, colorClass, playerId, type, theme }) => {
  const [isAdding, setIsAdding] = useState(false);
  const [inputValue, setInputValue] = useState('');
  const inputRef = useRef(null);

  useEffect(() => {
    if (isAdding && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isAdding]);

  const handleAdd = () => {
    if (inputValue.trim()) {
      onAdd(inputValue.trim());
      setInputValue('');
    }
    setIsAdding(false);
  };

  return (
    <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-1">
      <DragDropContext onDragEnd={onDragEnd}>
        <Droppable droppableId={`${playerId}-${type}`} direction="horizontal">
          {(provided) => (
            <div {...provided.droppableProps} ref={provided.innerRef} className="flex gap-2">
              {items.map((item, index) => (
                <Draggable key={`${playerId}-${type}-${item}`} draggableId={`${playerId}-${type}-${item}`} index={index}>
                  {(provided) => (
                    <div
                      ref={provided.innerRef}
                      {...provided.draggableProps}
                      className={`${colorClass} text-white px-3 py-1 rounded-xl flex items-center gap-1 shadow-sm transition-transform active:scale-95`}
                    >
                      <div {...provided.dragHandleProps} className="opacity-70 cursor-grab">
                        <GripVertical size={14} />
                      </div>
                      <span className="font-bold text-sm">{item}</span>
                      <button onClick={() => onRemove(index)} className="ml-1 hover:text-black transition-colors">
                        <X size={12} />
                      </button>
                    </div>
                  )}
                </Draggable>
              ))}
              {provided.placeholder}
            </div>
          )}
        </Droppable>
      </DragDropContext>

      {isAdding ? (
        <div className="flex items-center gap-1 bg-opacity-20 bg-gray-500 rounded-xl p-1 animate-in fade-in zoom-in duration-200">
          <input
            ref={inputRef}
            type="number"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onBlur={handleAdd}
            onKeyDown={(e) => e.key === 'Enter' && handleAdd()}
            className={`w-12 bg-transparent text-center focus:outline-none font-bold`}
            placeholder="號"
          />
          <button onMouseDown={(e) => e.preventDefault()} onClick={handleAdd} className="text-green-500 p-1">
            <Check size={16} />
          </button>
        </div>
      ) : (
        <button
          onClick={() => setIsAdding(true)}
          className={`flex-shrink-0 w-8 h-8 rounded-xl border-2 border-dashed border-gray-400 flex items-center justify-center text-gray-400 hover:border-blue-500 hover:text-blue-500 transition-all`}
        >
          <Plus size={18} />
        </button>
      )}
    </div>
  );
};

// --- 主程式 ---
export default function App() {
  const [theme, setTheme] = useState('night');
  const [players, setPlayers] = useState([]);
  const [isSettingMode, setIsSettingMode] = useState(false);
  const [customRoles, setCustomRoles] = useState({ good: [], evil: [] });

  useEffect(() => {
    const initialPlayers = Array.from({ length: 12 }, (_, i) => ({
      id: `p-${i + 1}`,
      no: i + 1,
      role: '',
      death: '存活',
      side: '',
      goodList: [],
      wolfList: []
    }));
    setPlayers(initialPlayers);
  }, []);

  const updatePlayer = (index, field, value) => {
    const newPlayers = [...players];
    newPlayers[index][field] = value;
    setPlayers(newPlayers);
  };

  const addToList = (idx, field, val) => {
    if (players[idx][field].includes(val)) return;
    const newPlayers = [...players];
    newPlayers[idx][field].push(val);
    setPlayers(newPlayers);
  };

  const removeFromList = (playerIdx, field, itemIdx) => {
    const newPlayers = [...players];
    newPlayers[playerIdx][field].splice(itemIdx, 1);
    setPlayers(newPlayers);
  };

  const onDragEnd = (result, playerIdx, field) => {
    if (!result.destination) return;
    const newPlayers = [...players];
    const list = Array.from(newPlayers[playerIdx][field]);
    const [reorderedItem] = list.splice(result.source.index, 1);
    list.splice(result.destination.index, 0, reorderedItem);
    newPlayers[playerIdx][field] = list;
    setPlayers(newPlayers);
  };

  const themeClasses = theme === 'day' 
    ? { bg: 'bg-slate-100', card: 'bg-white', text: 'text-slate-800', input: 'bg-slate-100', border: 'border-slate-200' }
    : { bg: 'bg-slate-950', card: 'bg-slate-900', text: 'text-slate-100', input: 'bg-slate-800', border: 'border-slate-800' };

  return (
    <div className={`min-h-screen ${themeClasses.bg} ${themeClasses.text} p-4 md:p-8 font-sans transition-colors duration-500`}>
      {/* Navbar */}
      <div className="max-w-6xl mx-auto flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-black tracking-tighter bg-gradient-to-r from-blue-500 to-purple-500 bg-clip-text text-transparent">
            狼人殺紀錄
          </h1>
          <p className="text-xs opacity-50 font-medium">WOLF TRACKER</p>
        </div>
        <div className="flex gap-3">
          <button 
            onClick={() => setIsSettingMode(!isSettingMode)}
            className={`px-4 py-2 rounded-2xl font-bold text-sm transition-all ${isSettingMode ? 'bg-orange-500 text-white' : 'bg-blue-600 text-white shadow-lg shadow-blue-900/20'}`}
          >
            {isSettingMode ? '完成設定' : '模式設定'}
          </button>
          <button 
            onClick={() => setTheme(theme === 'day' ? 'night' : 'day')}
            className={`p-3 rounded-2xl ${themeClasses.card} shadow-md transition-all active:scale-90`}
          >
            {theme === 'day' ? <Moon size={20} className="text-indigo-600" /> : <Sun size={20} className="text-yellow-400" />}
          </button>
        </div>
      </div>

      {isSettingMode ? (
        <div className={`max-w-2xl mx-auto rounded-3xl p-8 ${themeClasses.card} border ${themeClasses.border} animate-in slide-in-from-bottom-4 duration-300`}>
          <h2 className="text-xl font-bold mb-6 flex items-center gap-2">⚙️ 自訂模式身分</h2>
          <p className="opacity-60 mb-4">您可以自訂本局的身分池，讓紀錄時選擇更精準。</p>
          <div className="space-y-4">
            <div className="p-4 rounded-2xl bg-slate-500 bg-opacity-10">
              <span className="block mb-2 font-bold text-blue-400">好人陣營預設</span>
              <div className="flex flex-wrap gap-2">{[...DEFAULT_ROLES.good, ...customRoles.good].map(r => <span key={r} className="px-3 py-1 bg-blue-500 bg-opacity-20 rounded-lg text-xs">{r}</span>)}</div>
            </div>
            <div className="p-4 rounded-2xl bg-slate-500 bg-opacity-10">
              <span className="block mb-2 font-bold text-red-400">邪惡陣營預設</span>
              <div className="flex flex-wrap gap-2">{[...DEFAULT_ROLES.evil, ...customRoles.evil].map(r => <span key={r} className="px-3 py-1 bg-red-500 bg-opacity-20 rounded-lg text-xs">{r}</span>)}</div>
            </div>
          </div>
        </div>
      ) : (
        <div className="max-w-6xl mx-auto">
          {/* Mobile Header Scroll Hint */}
          <div className="md:hidden text-center text-xs opacity-40 mb-2">← 左右滑動表格查看更多 →</div>
          
          <div className="overflow-x-auto no-scrollbar rounded-3xl shadow-2xl border border-transparent">
            <table className="w-full border-separate border-spacing-y-3">
              <thead>
                <tr className="text-xs uppercase tracking-widest opacity-50 px-4">
                  <th className="pb-2 pl-6 text-left">玩家</th>
                  <th className="pb-2 text-left">身分</th>
                  <th className="pb-2 text-left">狀態</th>
                  <th className="pb-2 text-left">站邊</th>
                  <th className="pb-2 text-left">好人</th>
                  <th className="pb-2 text-left pr-6">狼坑</th>
                </tr>
              </thead>
              <tbody>
                {players.map((p, idx) => (
                  <tr key={p.id} className={`${themeClasses.card} group transition-all duration-300 hover:scale-[1.01]`}>
                    <td className="py-4 pl-6 rounded-l-2xl">
                      <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white font-black shadow-lg">
                        {p.no}
                      </div>
                    </td>
                    <td className="py-4 px-2">
                      <select 
                        value={p.role} 
                        onChange={(e) => updatePlayer(idx, 'role', e.target.value)}
                        className={`w-28 p-2 rounded-xl text-sm font-bold outline-none focus:ring-2 focus:ring-blue-500 ${themeClasses.input} border-none`}
                      >
                        <option value="">未知</option>
                        <optgroup label="好人">
                          {DEFAULT_ROLES.good.map(r => <option key={r} value={r}>{r}</option>)}
                        </optgroup>
                        <optgroup label="邪惡">
                          {DEFAULT_ROLES.evil.map(r => <option key={r} value={r}>{r}</option>)}
                        </optgroup>
                      </select>
                    </td>
                    <td className="py-4 px-2">
                      <select 
                        value={p.death} 
                        onChange={(e) => updatePlayer(idx, 'death', e.target.value)}
                        className={`w-24 p-2 rounded-xl text-sm font-bold outline-none ${themeClasses.input} ${p.death !== '存活' ? 'text-red-500' : 'text-green-500'}`}
                      >
                        {DEATH_METHODS.map(m => <option key={m} value={m}>{m}</option>)}
                      </select>
                    </td>
                    <td className="py-4 px-2">
                      <input 
                        type="number" 
                        value={p.side}
                        onChange={(e) => updatePlayer(idx, 'side', e.target.value)}
                        className={`w-14 p-2 rounded-xl text-center font-bold ${themeClasses.input}`}
                        placeholder="-"
                      />
                    </td>
                    <td className="py-4 px-2">
                      <DynamicTagList 
                        items={p.goodList} 
                        onDragEnd={(res) => onDragEnd(res, idx, 'goodList')}
                        onAdd={(val) => addToList(idx, 'goodList', val)}
                        onRemove={(i) => removeFromList(idx, 'goodList', i)}
                        colorClass="bg-blue-500"
                        playerId={p.id}
                        type="good"
                        theme={theme}
                      />
                    </td>
                    <td className="py-4 px-2 pr-6 rounded-r-2xl">
                      <DynamicTagList 
                        items={p.wolfList} 
                        onDragEnd={(res) => onDragEnd(res, idx, 'wolfList')}
                        onAdd={(val) => addToList(idx, 'wolfList', val)}
                        onRemove={(i) => removeFromList(idx, 'wolfList', i)}
                        colorClass="bg-rose-500"
                        playerId={p.id}
                        type="wolf"
                        theme={theme}
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          
          <button 
            onClick={() => setPlayers([...players, { id: `p-${Date.now()}`, no: players.length + 1, role: '', death: '存活', side: '', goodList: [], wolfList: [] }])}
            className="w-full mt-6 py-4 rounded-2xl border-2 border-dashed border-gray-500 border-opacity-30 flex items-center justify-center gap-2 opacity-50 hover:opacity-100 hover:border-blue-500 transition-all font-bold"
          >
            <UserPlus size={20} /> 新增玩家位置
          </button>
        </div>
      )}
      
      <footer className="mt-12 text-center text-xs opacity-30 font-medium">
        &copy; {new Date().getFullYear()} Werewolf Tracker • 凹嗚
      </footer>
    </div>
  );
}
