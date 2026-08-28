import React, { useState, useEffect } from 'react';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import { Sun, Moon, Plus, Trash2, GripVertical, UserPlus } from 'lucide-react';

// --- 初始資料設定 (放在外面，程式碼比較整潔) ---
const DEFAULT_ROLES = {
  good: ['預言家', '女巫', '獵人', '守衛', '平民'],
  evil: ['小狼', '狼王', '機械狼', '白狼王', '黑狼王', '大灰狼']
};

const DEATH_METHODS = ['存活', '刀殺', '毒殺', '票死', '帶走', '自爆', '彈死'];

// --- 子組件：可排序標籤列表 (放在外面) ---
const DraggableList = ({ items, onDragEnd, onAdd, onRemove, color, playerId, type, theme }) => {
  const [input, setInput] = useState('');
  return (
    <div className="flex flex-col gap-2">
      <div className="flex gap-1">
        <input 
          type="number" 
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => {
            if(e.key === 'Enter') {
              onAdd(input);
              setInput('');
            }
          }}
          placeholder="號碼"
          className={`w-12 text-sm p-1 rounded ${theme === 'day' ? 'bg-slate-200' : 'bg-slate-700'}`}
        />
        <button onClick={() => { onAdd(input); setInput(''); }} className="p-1 text-blue-500"><Plus size={16}/></button>
      </div>
      <DragDropContext onDragEnd={onDragEnd}>
        <Droppable droppableId={`${playerId}-${type}`} direction="horizontal">
          {(provided) => (
            <div {...provided.droppableProps} ref={provided.innerRef} className="flex flex-wrap gap-1 min-h-[30px]">
              {items.map((item, index) => (
                <Draggable key={`${playerId}-${type}-${item}`} draggableId={`${playerId}-${type}-${item}`} index={index}>
                  {(provided) => (
                    <div
                      ref={provided.innerRef}
                      {...provided.draggableProps}
                      {...provided.dragHandleProps}
                      className={`flex items-center gap-1 px-2 py-1 rounded text-white text-xs ${color}`}
                    >
                      <GripVertical size={10} />
                      <span>{item}</span>
                      <button onClick={() => onRemove(index)}><Trash2 size={10} /></button>
                    </div>
                  )}
                </Draggable>
              ))}
              {provided.placeholder}
            </div>
          )}
        </Droppable>
      </DragDropContext>
    </div>
  );
};

// --- 主程式 ---
export default function App() {
  // --- 狀態管理 ---
  const [theme, setTheme] = useState('night');
  const [players, setPlayers] = useState([]);
  const [customRoleName, setCustomRoleName] = useState('');
  const [isSettingMode, setIsSettingMode] = useState(false);

  // 初始化 12 位玩家
  useEffect(() => {
    const initialPlayers = Array.from({ length: 12 }, (_, i) => ({
      id: `player-${i + 1}`,
      no: i + 1,
      role: '',
      death: '存活',
      side: '',
      goodList: [],
      wolfList: []
    }));
    setPlayers(initialPlayers);
  }, []);

  const toggleTheme = () => setTheme(theme === 'day' ? 'night' : 'day');

  const addPlayer = () => {
    const newNo = players.length + 1;
    setPlayers([...players, {
      id: `player-${newNo}`,
      no: newNo,
      role: '',
      death: '存活',
      side: '',
      goodList: [],
      wolfList: []
    }]);
  };

  const updatePlayer = (index, field, value) => {
    const newPlayers = [...players];
    newPlayers[index][field] = value;
    setPlayers(newPlayers);
  };

  const addToList = (index, field, value) => {
    if (!value || players[index][field].includes(value)) return;
    const newPlayers = [...players];
    newPlayers[index][field].push(value);
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

  const removeFromList = (playerIdx, field, itemIdx) => {
    const newPlayers = [...players];
    newPlayers[playerIdx][field].splice(itemIdx, 1);
    setPlayers(newPlayers);
  };

  const themeClass = theme === 'day' ? 'bg-slate-50 text-slate-900' : 'bg-slate-900 text-slate-100';
  const cardClass = theme === 'day' ? 'bg-white border-slate-200' : 'bg-slate-800 border-slate-700';
  const inputClass = theme === 'day' ? 'bg-slate-100 border-slate-300' : 'bg-slate-700 border-slate-600';

  return (
    <div className={`min-h-screen p-4 transition-colors duration-300 ${themeClass}`}>
      {/* Header */}
      <div className="max-w-7xl mx-auto flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold flex items-center gap-2">🐺 凹嗚狼人殺筆記本</h1>
        <div className="flex gap-4">
          <button onClick={() => setIsSettingMode(!isSettingMode)} className="px-4 py-2 bg-blue-600 rounded-lg text-white">
            {isSettingMode ? '返回記錄' : '設定模式'}
          </button>
          <button onClick={toggleTheme} className="p-2 rounded-full bg-gray-500 bg-opacity-20">
            {theme === 'day' ? <Moon size={24} /> : <Sun size={24} />}
          </button>
        </div>
      </div>

      {isSettingMode ? (
        <div className={`max-w-4xl mx-auto p-6 rounded-xl border ${cardClass}`}>
          <h2 className="text-xl mb-4">自訂身分</h2>
          <div className="flex gap-2">
            <input 
              type="text" 
              value={customRoleName} 
              onChange={(e) => setCustomRoleName(e.target.value)}
              className={`flex-1 p-2 rounded ${inputClass}`}
              placeholder="輸入身分名稱"
            />
            <button 
              onClick={() => { if(customRoleName) { DEFAULT_ROLES.good.push(customRoleName); setCustomRoleName(''); }}} 
              className="p-2 bg-green-600 rounded text-white"
            >新增</button>
          </div>
        </div>
      ) : (
        <div className="max-w-full overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="text-left border-b border-gray-600">
                <th className="p-2">號碼</th>
                <th className="p-2">身分</th>
                <th className="p-2">狀態</th>
                <th className="p-2">站邊</th>
                <th className="p-2">好人坑 (拖拽排序)</th>
                <th className="p-2">狼坑 (拖拽排序)</th>
              </tr>
            </thead>
            <tbody>
              {players.map((p, idx) => (
                <tr key={p.id} className="border-b border-gray-800">
                  <td className="p-2 font-bold text-center">
                    <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center text-white">{p.no}</div>
                  </td>
                  <td className="p-2">
                    <select value={p.role} onChange={(e) => updatePlayer(idx, 'role', e.target.value)} className={`p-2 rounded ${inputClass}`}>
                      <option value="">未知</option>
                      <optgroup label="好人陣營">{DEFAULT_ROLES.good.map(r => <option key={r} value={r}>{r}</option>)}</optgroup>
                      <optgroup label="邪惡陣營">{DEFAULT_ROLES.evil.map(r => <option key={r} value={r}>{r}</option>)}</optgroup>
                    </select>
                  </td>
                  <td className="p-2">
                    <select value={p.death} onChange={(e) => updatePlayer(idx, 'death', e.target.value)} className={`p-2 rounded ${inputClass} ${p.death !== '存活' ? 'text-red-500' : ''}`}>
                      {DEATH_METHODS.map(m => <option key={m} value={m}>{m}</option>)}
                    </select>
                  </td>
                  <td className="p-2">
                    <input type="number" placeholder="號" value={p.side} onChange={(e) => updatePlayer(idx, 'side', e.target.value)} className={`w-12 p-2 rounded ${inputClass}`} />
                  </td>
                  <td className="p-2">
                    <DraggableList 
                      items={p.goodList} onDragEnd={(res) => onDragEnd(res, idx, 'goodList')}
                      onAdd={(val) => addToList(idx, 'goodList', val)} onRemove={(i) => removeFromList(idx, 'goodList', i)}
                      color="bg-green-600" playerId={p.id} type="good" theme={theme}
                    />
                  </td>
                  <td className="p-2">
                    <DraggableList 
                      items={p.wolfList} onDragEnd={(res) => onDragEnd(res, idx, 'wolfList')}
                      onAdd={(val) => addToList(idx, 'wolfList', val)} onRemove={(i) => removeFromList(idx, 'wolfList', i)}
                      color="bg-red-600" playerId={p.id} type="wolf" theme={theme}
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <button onClick={addPlayer} className="mt-4 px-4 py-2 bg-gray-500 bg-opacity-20 rounded-lg hover:bg-opacity-40 transition-all">+ 新增玩家</button>
        </div>
      )}
    </div>
  );
}
