// 定义更完整的音符频率范围
const notes = {
    'C3': 130.81, 'C#3': 138.59, 'D3': 146.83, 'D#3': 155.56, 'E3': 164.81, 'F3': 174.61,
    'F#3': 185.00, 'G3': 196.00, 'G#3': 207.65, 'A3': 220.00, 'A#3': 233.08, 'B3': 246.94,
    'C4': 261.63, 'C#4': 277.18, 'D4': 293.66, 'D#4': 311.13, 'E4': 329.63, 'F4': 349.23,
    'F#4': 369.99, 'G4': 392.00, 'G#4': 415.30, 'A4': 440.00, 'A#4': 466.16, 'B4': 493.88,
    'C5': 523.25, 'C#5': 554.37, 'D5': 587.33, 'D#5': 622.25, 'E5': 659.26
};

// 定义键盘映射
const keyMap = {
    'z': 'C3', 's': 'C#3', 'x': 'D3', 'd': 'D#3', 'c': 'E3', 'v': 'F3',
    'g': 'F#3', 'b': 'G3', 'h': 'G#3', 'n': 'A3', 'j': 'A#3', 'm': 'B3',
    'q': 'C4', '2': 'C#4', 'w': 'D4', '3': 'D#4', 'e': 'E4', 'r': 'F4',
    '5': 'F#4', 't': 'G4', '6': 'G#4', 'y': 'A4', '7': 'A#4', 'u': 'B4',
    'i': 'C5', '9': 'C#5', 'o': 'D5'
};

// 延音踏板状态
let sustainPedalActive = false;
const activeNotes = new Map();

// 创建钢琴键
function createPiano() {
    const piano = document.getElementById('piano');
    
    // 完整的钢琴键范围 (C3-D5)
    const whiteKeys = ['C3', 'D3', 'E3', 'F3', 'G3', 'A3', 'B3', 
                      'C4', 'D4', 'E4', 'F4', 'G4', 'A4', 'B4',
                      'C5', 'D5'];
    const blackKeys = ['C#3', 'D#3', 'F#3', 'G#3', 'A#3', 
                      'C#4', 'D#4', 'F#4', 'G#4', 'A#4',
                      'C#5'];
    
    // 创建白键 - 先创建白键，作为基础排列
    whiteKeys.forEach((note, index) => {
        const key = document.createElement('div');
        key.className = 'key';
        key.dataset.note = note;
        
        // 添加键盘标签 - 找到对应的按键
        const label = document.createElement('div');
        label.className = 'key-label';
        const keyChar = Object.entries(keyMap).find(([_, value]) => value === note)?.[0];
        if (keyChar) {
            label.textContent = keyChar.toUpperCase();
        }
        key.appendChild(label);
        
        piano.appendChild(key);
    });
    
    // 创建黑键 - 以C为基准，按特定模式排列黑键
    blackKeys.forEach((note) => {
        const key = document.createElement('div');
        key.className = 'key black';
        key.dataset.note = note;
        
        // 必须计算黑键位置相对于对应白键的偏移
        // 例如C#应该位于C和D之间
        const noteRoot = note.charAt(0); // 例如从"C#3"中提取"C"
        const octave = note.charAt(note.length - 1); // 例如从"C#3"中提取"3"
        const baseNote = noteRoot + octave; // 例如"C3"
        
        // 找到对应的白键
        const baseKeyElement = document.querySelector(`[data-note="${baseNote}"]`);
        
        if (baseKeyElement) {
            // 计算位置 - 位于基音的白键右侧
            const baseKeyRect = baseKeyElement.getBoundingClientRect();
            // 使黑键位于相邻白键之间
            key.style.left = (baseKeyRect.left + baseKeyRect.width * 0.7) + 'px';
        }
        
        // 添加键盘标签
        const label = document.createElement('div');
        label.className = 'key-label';
        const keyChar = Object.entries(keyMap).find(([_, value]) => value === note)?.[0];
        if (keyChar) {
            label.textContent = keyChar.toUpperCase();
        }
        key.appendChild(label);
        
        piano.appendChild(key);
    });
    
    // 定位黑键 - 动态计算位置为更真实的布局
    setTimeout(() => {
        positionBlackKeys();
    }, 0);
    
    // 窗口大小改变时重新定位黑键
    window.addEventListener('resize', positionBlackKeys);
}

// 重新定位黑键以匹配真实钢琴布局
function positionBlackKeys() {
    const octaves = [3, 4, 5];
    const piano = document.getElementById('piano');
    const pianoRect = piano.getBoundingClientRect();
    
    // 白键的标准宽度 - 从DOM中获取实际宽度
    const whiteKeys = document.querySelectorAll('.key:not(.black)');
    let whiteKeyWidth = 60; // 默认值
    
    if (whiteKeys.length > 0) {
        // 使用第一个白键的宽度作为标准
        const firstWhiteKey = whiteKeys[0];
        whiteKeyWidth = firstWhiteKey.getBoundingClientRect().width;
    }
    
    // 每个八度音阶的黑键位置模式
    const blackKeyNotes = ['C#', 'D#', 'F#', 'G#', 'A#'];
    
    // 固定的黑键偏移比例 - 更符合真实钢琴布局
    // 这些值表示黑键相对于对应白键的偏移比例
    const blackKeyOffsets = {
        'C#': 0.70, // C#位于C和D之间，靠近D
        'D#': 0.70, // D#位于D和E之间，靠近E
        'F#': 0.35, // F#位于F和G之间，偏中间位置
        'G#': 0.65, // G#位于G和A之间，靠近A
        'A#': 0.70  // A#位于A和B之间，靠近B
    };
    
    // 白键音符顺序，用于计算相邻白键
    const whiteKeyNotes = ['C', 'D', 'E', 'F', 'G', 'A', 'B'];
    
    // 遍历所有八度
    octaves.forEach(octave => {
        // 遍历每个黑键音符
        blackKeyNotes.forEach(blackNote => {
            const fullNote = blackNote + octave;
            const blackKey = document.querySelector(`[data-note="${fullNote}"]`);
            if (!blackKey) return;
            
            // 获取黑键对应的白键（基础音符）
            const baseNote = blackNote.charAt(0) + octave;
            const baseKey = document.querySelector(`[data-note="${baseNote}"]`);
            if (!baseKey) return;
            
            // 获取基础音符在白键序列中的索引
            const baseIndex = whiteKeyNotes.indexOf(blackNote.charAt(0));
            if (baseIndex === -1) return;
            
            // 获取下一个白键（可能是下一个八度的）
            const nextNoteIndex = (baseIndex + 1) % whiteKeyNotes.length;
            const nextNote = whiteKeyNotes[nextNoteIndex];
            const nextOctave = nextNoteIndex === 0 ? octave + 1 : octave;
            const nextFullNote = nextNote + nextOctave;
            
            const nextKey = document.querySelector(`[data-note="${nextFullNote}"]`);
            // 如果找不到下一个白键，使用固定偏移
            if (!nextKey && baseKey) {
                // 使用固定的偏移计算
                const baseRect = baseKey.getBoundingClientRect();
                const offset = blackKeyOffsets[blackNote];
                const leftPos = baseRect.left - pianoRect.left + (whiteKeyWidth * offset);
                
                // 设置黑键位置
                blackKey.style.left = `${leftPos}px`;
                return;
            }
            
            if (baseKey && nextKey) {
                // 获取两个白键的位置
                const baseRect = baseKey.getBoundingClientRect();
                const nextRect = nextKey.getBoundingClientRect();
                
                // 计算两个白键之间的中点，然后应用特定的偏移
                const midPoint = (baseRect.left + nextRect.left) / 2;
                const offset = blackKeyOffsets[blackNote];
                
                // 计算黑键应该放置的位置（使用从中点到偏移位置的值）
                // 对于C#和F#等，偏移会使它们更靠近右侧的白键
                const offsetAmount = (nextRect.left - baseRect.left) * (offset - 0.5);
                const leftPos = midPoint - pianoRect.left + offsetAmount - (blackKey.offsetWidth / 2);
                
                // 设置黑键位置，精确到整数像素，避免小数点导致的渲染问题
                blackKey.style.left = `${Math.round(leftPos)}px`;
            }
        });
    });
}

// 创建音频上下文
const audioContext = new (window.AudioContext || window.webkitAudioContext)();
const mainGainNode = audioContext.createGain();
mainGainNode.connect(audioContext.destination);
mainGainNode.gain.value = 0.5;

// 创建更真实的钢琴音色
function createPianoSound(frequency, velocity = 0.7, isLongPress = false) {
    // 创建多个振荡器以获得更丰富的声音
    const oscillators = [];
    const gainNodes = [];
    
    // 计算衰减时间 - 低音区较长，高音区较短
    // 长按音符衰减时间更长，点按音符衰减时间更短
    let baseDecayTime = isLongPress ? 4.0 : 1.8;  // 加大长按和短按的差异
    
    const normalizedFreq = Math.min(1, Math.max(0, (frequency - 100) / 1000)); // 归一化频率到0-1范围
    const decayTime = baseDecayTime * (1 - normalizedFreq * 0.6); // 低频衰减更长
    
    // 设置攻击和释放特性
    const attackTime = isLongPress ? 0.02 : 0.005; // 长按攻击延长
    let sustainLevel = isLongPress ? 0.5 : 0.3; // 加大长按和短按的延音差异
    
    // 主音
    const mainOsc = audioContext.createOscillator();
    const mainGain = audioContext.createGain();
    mainOsc.type = isLongPress ? 'triangle' : 'sine';
    mainOsc.frequency.value = frequency;
    
    // 泛音 - 添加更多泛音使声音更丰富
    const harmonicOsc1 = audioContext.createOscillator();
    const harmonicGain1 = audioContext.createGain();
    harmonicOsc1.type = 'sine';
    harmonicOsc1.frequency.value = frequency * 2; // 第一泛音
    let harmonicGain1Value = isLongPress ? 0.28 : 0.18;
    harmonicGain1.gain.value = harmonicGain1Value;
    
    const harmonicOsc2 = audioContext.createOscillator();
    const harmonicGain2 = audioContext.createGain();
    harmonicOsc2.type = 'sine';
    harmonicOsc2.frequency.value = frequency * 3; // 第二泛音
    let harmonicGain2Value = isLongPress ? 0.15 : 0.08;
    harmonicGain2.gain.value = harmonicGain2Value;

    // 额外添加第三泛音（仅在长按时较明显）
    const harmonicOsc3 = audioContext.createOscillator();
    const harmonicGain3 = audioContext.createGain();
    harmonicOsc3.type = 'sine';
    harmonicOsc3.frequency.value = frequency * 4; // 第三泛音
    let harmonicGain3Value = isLongPress ? 0.07 : 0.02;
    harmonicGain3.gain.value = harmonicGain3Value;
    
    // 创建滤波器使声音更温暖
    const filter = audioContext.createBiquadFilter();
    filter.type = 'lowpass';
    
    let filterFreq = isLongPress ? 
                    6000 - normalizedFreq * 1200 : // 长按滤波较高
                    4500 - normalizedFreq * 2000;  // 短按滤波较低
    
    filter.frequency.value = filterFreq;
    filter.Q.value = isLongPress ? 1.5 : 0.8;
    
    // 设置音量包络
    const now = audioContext.currentTime;
    
    // 主振荡器音量包络
    mainGain.gain.setValueAtTime(0, now);
    mainGain.gain.linearRampToValueAtTime(velocity * (isLongPress ? 0.65 : 0.6), now + attackTime); // 攻击
    mainGain.gain.exponentialRampToValueAtTime(velocity * sustainLevel, now + 0.1); // 初始衰减
    mainGain.gain.exponentialRampToValueAtTime(0.001, now + decayTime); // 长衰减
    
    // 泛音包络
    harmonicGain1.gain.setValueAtTime(0, now);
    harmonicGain1.gain.linearRampToValueAtTime(velocity * harmonicGain1Value, now + attackTime);
    harmonicGain1.gain.exponentialRampToValueAtTime(0.001, now + decayTime * (isLongPress ? 0.9 : 0.7));
    
    harmonicGain2.gain.setValueAtTime(0, now);
    harmonicGain2.gain.linearRampToValueAtTime(velocity * harmonicGain2Value, now + attackTime);
    harmonicGain2.gain.exponentialRampToValueAtTime(0.001, now + decayTime * (isLongPress ? 0.8 : 0.5));
    
    harmonicGain3.gain.setValueAtTime(0, now);
    harmonicGain3.gain.linearRampToValueAtTime(velocity * harmonicGain3Value, now + attackTime);
    harmonicGain3.gain.exponentialRampToValueAtTime(0.001, now + decayTime * (isLongPress ? 0.7 : 0.4));
    
    // 连接主振荡器
    mainOsc.connect(mainGain);
    mainGain.connect(filter);
    
    // 连接泛音振荡器
    harmonicOsc1.connect(harmonicGain1);
    harmonicGain1.connect(filter);
    
    harmonicOsc2.connect(harmonicGain2);
    harmonicGain2.connect(filter);
    
    harmonicOsc3.connect(harmonicGain3);
    harmonicGain3.connect(filter);
    
    // 连接到主输出
    filter.connect(mainGainNode);
    
    // 启动所有振荡器
    mainOsc.start();
    harmonicOsc1.start();
    harmonicOsc2.start();
    harmonicOsc3.start();
    
    // 跟踪所有振荡器和增益节点以便后续停止
    oscillators.push(mainOsc, harmonicOsc1, harmonicOsc2, harmonicOsc3);
    gainNodes.push(mainGain, harmonicGain1, harmonicGain2, harmonicGain3);
    
    return { oscillators, gainNodes, filter };
}

// 播放音符
function playNote(frequency, velocity = 0.7, isLongPress = false) {
    const sound = createPianoSound(frequency, velocity, isLongPress);
    const noteId = Date.now() + Math.random();
    
    activeNotes.set(noteId, sound);
    
    if (!sustainPedalActive) {
        // 为长按音符设置更长的持续时间
        const noteDuration = isLongPress ? 3000 : 2000;
        setTimeout(() => {
            stopNote(noteId);
        }, noteDuration);
    }
    
    return noteId;
}

// 停止音符
function stopNote(noteId) {
    const sound = activeNotes.get(noteId);
    if (sound) {
        const { oscillators, gainNodes } = sound;
        const now = audioContext.currentTime;
        
        // 为所有增益节点添加释放曲线
        gainNodes.forEach(gainNode => {
            gainNode.gain.cancelScheduledValues(now);
            gainNode.gain.setValueAtTime(gainNode.gain.value, now);
            gainNode.gain.exponentialRampToValueAtTime(0.001, now + 0.1); // 快速释放
        });
        
        // 稍微延迟后停止所有振荡器
        setTimeout(() => {
            oscillators.forEach(osc => {
                try {
                    osc.stop();
                } catch (e) {
                    // 忽略已停止的振荡器错误
                }
            });
            activeNotes.delete(noteId);
        }, 100);
    }
}

// 显示音符动画，增加力度反馈
function showNoteAnimation(keyElement, velocity = 0.7) {
    const noteEl = document.createElement('span');
    noteEl.className = 'note-anim';
    // 随机选择音符表情以增加变化
    const notes = ['🎵', '🎶', '♪', '♫', '♬'];
    noteEl.textContent = notes[Math.floor(Math.random() * notes.length)];
    
    // 获取键是黑键还是白键
    const isBlackKey = keyElement.classList.contains('black');
    
    // 根据力度调整音符大小和颜色
    const scale = 0.7 + velocity * 0.5; // 力度越大，音符越大
    
    // 添加随机水平偏移，避免音符重叠
    // 黑键和白键使用不同的偏移范围
    const horizontalOffset = isBlackKey ? 
        (Math.random() * 30 - 15) : // 黑键偏移范围 -15px ~ 15px
        (Math.random() * 40 - 20);  // 白键偏移范围 -20px ~ 20px
    
    // 不同键类型使用略微不同的起始位置
    const startY = isBlackKey ? 5 : 10;
    
    // 随机旋转角度，使音符更有活力
    const rotateAngle = Math.random() * 20 - 10; // -10° ~ 10°
    
    // 使用CSS变量设置动画参数
    noteEl.style.setProperty('--x-offset', `${horizontalOffset}px`);
    noteEl.style.setProperty('--y-offset', `${startY}px`);
    noteEl.style.setProperty('--scale', scale);
    noteEl.style.setProperty('--rotate', `${rotateAngle}deg`);
    
    // 根据力度设置音符颜色，黑白键不同色系
    if (isBlackKey) {
        // 黑键的音符使用不同的颜色方案
        if (velocity > 0.8) {
            // 高力度 - 紫色偏蓝
            noteEl.style.color = 'rgba(200, 220, 255, 1)';
            noteEl.style.textShadow = '0 0 5px rgba(100, 150, 255, 0.8)';
        } else if (velocity > 0.5) {
            // 中等力度 - 淡紫色
            noteEl.style.color = 'rgba(180, 200, 255, 1)';
            noteEl.style.textShadow = '0 0 4px rgba(80, 130, 255, 0.7)';
        } else {
            // 低力度 - 淡蓝色
            noteEl.style.color = 'rgba(160, 180, 255, 0.9)';
            noteEl.style.textShadow = '0 0 3px rgba(60, 110, 255, 0.6)';
        }
    } else {
        // 白键的音符使用原来的颜色方案
        if (velocity > 0.8) {
            // 高力度 - 明亮的色彩
            noteEl.style.color = 'rgba(255, 235, 150, 1)';
            noteEl.style.textShadow = '0 0 5px rgba(255, 170, 50, 0.8)';
        } else if (velocity > 0.5) {
            // 中等力度 - 适中的色彩
            noteEl.style.color = 'rgba(220, 250, 255, 1)';
            noteEl.style.textShadow = '0 0 4px rgba(100, 200, 255, 0.7)';
        } else {
            // 低力度 - 淡色
            noteEl.style.color = 'rgba(200, 220, 255, 0.9)';
            noteEl.style.textShadow = '0 0 3px rgba(100, 180, 220, 0.6)';
        }
    }
    
    // 添加z-index随机值，使音符有层次感
    noteEl.style.zIndex = Math.floor(Math.random() * 10) + 5; // 基本值为5，确保在按键上方
    
    keyElement.appendChild(noteEl);
    
    // 动画结束后移除
    noteEl.addEventListener('animationend', () => {
        noteEl.remove();
    });

    // 添加按键力度反馈 - 增强键盘视觉反馈
    addKeyPressEffect(keyElement, velocity);
}

// 新增：添加按键力度视觉反馈效果
function addKeyPressEffect(keyElement, velocity) {
    // 已经有active类，现在添加力度相关的样式
    const isBlackKey = keyElement.classList.contains('black');
    
    // 不再使用transform，而是使用阴影和内部效果
    // 使用CSS变量设置按压深度，以便CSS可以获取
    const pressDepth = 2 + Math.min(5, Math.round(velocity * 5)); // 力度越大，按下越深
    keyElement.style.setProperty('--press-depth', `${pressDepth}px`);
    
    // 使用box-shadow来模拟按下的深度
    if (isBlackKey) {
        // 增强黑键按下时的视觉效果，使阴影更明显
        keyElement.style.boxShadow = `0 ${Math.max(1, 3 - pressDepth * 0.5)}px ${pressDepth}px rgba(0,0,0,0.7), inset 0 1px 2px rgba(255,255,255,0.2)`;
        // 添加边框高亮以增强视觉效果
        keyElement.style.border = '1px solid rgba(130, 130, 255, 0.6)';
    } else {
        keyElement.style.boxShadow = `0 ${Math.max(1, 5 - pressDepth * 0.8)}px ${pressDepth}px rgba(0,0,0,0.2), inset 0 -1px 0 rgba(255,255,255,0.7)`;
        keyElement.style.border = '1px solid rgba(100, 200, 255, 0.4)';
    }
    
    // 力度高时添加额外的视觉效果
    if (velocity > 0.7) {
        // 强力度按下效果 - 添加一个强烈的闪光效果
        const flash = document.createElement('div');
        flash.className = 'key-flash';
        flash.style.position = 'absolute';
        flash.style.top = '0';
        flash.style.left = '0';
        flash.style.right = '0';
        flash.style.bottom = '0';
        flash.style.zIndex = '4';
        flash.style.pointerEvents = 'none';
        flash.style.opacity = '0';
        
        // 设置闪光颜色
        if (isBlackKey) {
            // 增强黑键闪光效果，使其更加明显
            flash.style.background = 'radial-gradient(circle at center, rgba(180,180,255,0.95) 0%, rgba(120,120,255,0) 70%)';
        } else {
            flash.style.background = 'radial-gradient(circle at center, rgba(255,255,255,0.9) 0%, rgba(200,220,255,0) 70%)';
        }
        
        // 添加动画
        flash.animate([
            { opacity: velocity * 0.8, transform: 'scale(0.3)' },
            { opacity: 0, transform: 'scale(2.5)' }
        ], {
            duration: 500,
            easing: 'ease-out'
        });
        
        keyElement.appendChild(flash);
        // 动画结束后移除
        setTimeout(() => {
            flash.remove();
        }, 500);
    }
    
    // 重置按键样式，回到原始状态
    setTimeout(() => {
        // 只有在键仍处于活跃状态才重置变换，防止与松开键的动画冲突
        if (keyElement.classList.contains('active')) {
            keyElement.style.boxShadow = '';
        }
    }, 150);
}

// 处理延音踏板
function handleSustainPedal(pressed) {
    sustainPedalActive = pressed;
    const pedal = document.getElementById('pedal');
    pedal.classList.toggle('active', pressed);
    
    if (!pressed) {
        // 释放延音踏板时，停止所有音符，但使用略微延长的释放时间
        activeNotes.forEach((_, noteId) => {
            stopNote(noteId);
        });
    }
}

// 处理键盘事件
function handleKeyDown(e) {
    const key = e.key.toLowerCase();
    
    if (key === ' ') {
        handleSustainPedal(true);
        return;
    }
    
    if (keyMap[key] && !e.repeat) {
        const note = keyMap[key];
        const keyElement = document.querySelector(`[data-note="${note}"]`);
        if (keyElement) {
            keyElement.classList.add('active');
            // 从按键速度计算力度 - 增强了力度计算
            // 简单模拟力度：添加随机因素使演奏更有活力
            const baseVelocity = 0.6;
            const randomFactor = Math.random() * 0.3;
            const velocity = baseVelocity + randomFactor;
            
            const noteId = playNote(notes[note], velocity);
            keyElement.dataset.noteId = noteId;
            showNoteAnimation(keyElement, velocity);
        }
    }
}

function handleKeyUp(e) {
    const key = e.key.toLowerCase();
    
    if (key === ' ') {
        handleSustainPedal(false);
        return;
    }
    
    if (keyMap[key]) {
        const note = keyMap[key];
        const keyElement = document.querySelector(`[data-note="${note}"]`);
        if (keyElement) {
            // 平滑过渡回原始状态
            smoothKeyRelease(keyElement);
            
            const noteId = keyElement.dataset.noteId;
            if (noteId && !sustainPedalActive) {
                stopNote(noteId);
            }
        }
    }
}

// 新增：平滑释放按键效果
function smoothKeyRelease(keyElement) {
    // 获取当前样式状态，确保平滑过渡
    const isBlackKey = keyElement.classList.contains('black');
    
    // 创建释放时的涟漪效果
    const ripple = document.createElement('div');
    ripple.className = 'key-release-ripple';
    ripple.style.position = 'absolute';
    ripple.style.top = '0';
    ripple.style.left = '0';
    ripple.style.right = '0';
    ripple.style.bottom = '0';
    ripple.style.zIndex = '3';
    ripple.style.pointerEvents = 'none';
    ripple.style.opacity = '0';
    
    // 设置涟漪颜色
    if (isBlackKey) {
        ripple.style.background = 'radial-gradient(circle at center, rgba(120,120,200,0.4) 0%, rgba(80,80,120,0) 70%)';
    } else {
        ripple.style.background = 'radial-gradient(circle at center, rgba(200,220,255,0.3) 0%, rgba(200,220,255,0) 70%)';
    }
    
    // 添加动画
    ripple.animate([
        { opacity: 0.3, transform: 'scale(0.9)' },
        { opacity: 0, transform: 'scale(1.5)' }
    ], {
        duration: 300,
        easing: 'ease-out'
    });
    
    keyElement.appendChild(ripple);
    
    // 动画结束后移除
    setTimeout(() => {
        ripple.remove();
    }, 300);
    
    // 先添加过渡类，然后移除active类以获得平滑过渡
    keyElement.classList.add('key-releasing');
    keyElement.classList.remove('active');
    
    // 重置所有样式属性，回到原始状态
    keyElement.style.boxShadow = '';
    keyElement.style.border = '';  // 重置我们添加的边框样式
    keyElement.style.setProperty('--press-depth', '0px');
    
    // 短暂延迟后移除过渡类
    setTimeout(() => {
        keyElement.classList.remove('key-releasing');
    }, 150);
}

// 处理鼠标事件
function handleMouseDown(e) {
    if (e.target.classList.contains('key')) {
        const note = e.target.dataset.note;
        e.target.classList.add('active');
        // 计算力度 - 取决于点击位置，靠近边缘较轻，中间较重
        const rect = e.target.getBoundingClientRect();
        const centerX = rect.left + rect.width / 2;
        const centerY = rect.top + rect.height / 2;
        const distanceFromCenter = Math.sqrt(
            Math.pow(e.clientX - centerX, 2) + 
            Math.pow(e.clientY - centerY, 2)
        );
        const maxDistance = Math.sqrt(Math.pow(rect.width / 2, 2) + Math.pow(rect.height / 2, 2));
        const velocity = 0.5 + 0.5 * (1 - Math.min(1, distanceFromCenter / maxDistance));
        
        const noteId = playNote(notes[note], velocity);
        e.target.dataset.noteId = noteId;
        e.target.dataset.velocity = velocity.toFixed(2); // 保存力度值以便后续使用
        showNoteAnimation(e.target, velocity);
    }
}

function handleMouseUp(e) {
    if (e.target.classList.contains('key')) {
        // 平滑过渡回原始状态
        smoothKeyRelease(e.target);
        
        const noteId = e.target.dataset.noteId;
        if (noteId && !sustainPedalActive) {
            stopNote(noteId);
        }
    }
}

// 初始化钢琴
window.addEventListener('DOMContentLoaded', () => {
    // 创建钢琴
    createPiano();
    
    // 为所有键添加事件监听器
    document.querySelectorAll('.key').forEach(key => {
        key.addEventListener('mousedown', handleMouseDown);
        key.addEventListener('mouseup', handleMouseUp);
        key.addEventListener('mouseleave', handleMouseUp);
    });
    
    // 添加键盘事件监听器
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    
    // 添加延音踏板监听器
    window.addEventListener('keydown', e => {
        if (e.code === 'Space') {
            handleSustainPedal(true);
        }
    });
    
    window.addEventListener('keyup', e => {
        if (e.code === 'Space') {
            handleSustainPedal(false);
        }
    });
    
    // 启用触屏控制器
    enableTouchControls();
});

// 启用触摸控制
function enableTouchControls() {
    // 为所有键添加触摸事件
    document.querySelectorAll('.key').forEach(key => {
        key.addEventListener('touchstart', e => {
            e.preventDefault();
            handleMouseDown({ target: key });
        });
        
        key.addEventListener('touchend', e => {
            e.preventDefault();
            handleMouseUp({ target: key });
        });
    });
    
    // 防止在移动设备上滚动页面
    document.body.addEventListener('touchmove', e => {
        if (e.target.closest('.piano-container')) {
            e.preventDefault();
        }
    }, { passive: false });
}

// 在文件底部添加，暴露触发流星的函数
function triggerComet() {
    // 检查是否存在createCometOnDemand函数
    if (typeof window.createCometOnDemand === 'function') {
        // 获取最后一次按下的键是否为黑键
        const activeKey = document.querySelector('.key.active');
        const isBlackKey = activeKey && activeKey.classList.contains('black');
        
        // 调用创建流星函数，并传递键类型信息
        window.createCometOnDemand(isBlackKey);
    }
} 