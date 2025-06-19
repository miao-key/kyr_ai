// 录音功能
let isRecording = false;
let recordedNotes = [];
let recordingStartTime = null;

// 节拍器功能
let metronomeActive = false;
let metronomeInterval = null;
let currentBPM = 120;

// 录音功能
function toggleRecording() {
    if (isRecording) {
        stopRecording();
    } else {
        startRecording();
    }
}

function startRecording() {
    isRecording = true;
    recordedNotes = [];
    recordingStartTime = Date.now();
    
    const recordBtn = document.getElementById('recordBtn');
    if (recordBtn) {
        recordBtn.textContent = '⏹ 停止录音';
        recordBtn.style.background = 'linear-gradient(135deg, #ff5722, #d84315)';
    }
}

function stopRecording() {
    isRecording = false;
    recordingStartTime = null;
    
    const recordBtn = document.getElementById('recordBtn');
    const playRecordBtn = document.getElementById('playRecordBtn');
    
    if (recordBtn) {
        recordBtn.textContent = '⏺ 录音';
        recordBtn.style.background = 'linear-gradient(135deg, #f44336, #d32f2f)';
    }
    
    if (playRecordBtn) {
        playRecordBtn.disabled = recordedNotes.length === 0;
    }
}

function playRecording() {
    if (recordedNotes.length === 0) return;
    
    let noteIndex = 0;
    
    function playNextRecordedNote() {
        if (noteIndex >= recordedNotes.length) return;
        
        const noteData = recordedNotes[noteIndex];
        const note = noteData.note;
        const duration = noteData.duration * 1000; // 转换为毫秒
        
        // 播放音符
        if (window.pressKey) {
            window.pressKey(note);
            
            setTimeout(() => {
                if (window.releaseKey) {
                    window.releaseKey(note);
                }
            }, duration * 0.8);
        }
        
        noteIndex++;
        
        // 播放下一个音符
        if (noteIndex < recordedNotes.length) {
            const nextDelay = recordedNotes[noteIndex].timestamp - noteData.timestamp;
            setTimeout(playNextRecordedNote, Math.max(nextDelay, 100));
        }
    }
    
    playNextRecordedNote();
}

// 节拍器功能
function toggleMetronome() {
    if (metronomeActive) {
        stopMetronome();
    } else {
        startMetronome();
    }
}

function startMetronome() {
    if (metronomeActive) return;
    
    metronomeActive = true;
    const interval = 60000 / currentBPM; // 毫秒
    
    const metronomeBtn = document.getElementById('metronomeBtn');
    if (metronomeBtn) {
        metronomeBtn.textContent = '⏸ 停止节拍器';
        metronomeBtn.style.background = 'linear-gradient(135deg, #ff5722, #d84315)';
    }
    
    metronomeInterval = setInterval(() => {
        playMetronomeSound();
    }, interval);
    
    // 立即播放第一个节拍
    playMetronomeSound();
}

function stopMetronome() {
    metronomeActive = false;
    
    if (metronomeInterval) {
        clearInterval(metronomeInterval);
        metronomeInterval = null;
    }
    
    const metronomeBtn = document.getElementById('metronomeBtn');
    if (metronomeBtn) {
        metronomeBtn.textContent = '♪ 节拍器';
        metronomeBtn.style.background = 'linear-gradient(135deg, #FF9800, #F57C00)';
    }
}

function playMetronomeSound() {
    // 创建简单的节拍器声音
    if (window.audioContext) {
        const oscillator = window.audioContext.createOscillator();
        const gainNode = window.audioContext.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(window.audioContext.destination);
        
        oscillator.frequency.setValueAtTime(800, window.audioContext.currentTime);
        oscillator.type = 'square';
        
        gainNode.gain.setValueAtTime(0.1, window.audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.001, window.audioContext.currentTime + 0.1);
        
        oscillator.start(window.audioContext.currentTime);
        oscillator.stop(window.audioContext.currentTime + 0.1);
    }
}

// 切换音符标签显示
function toggleKeyLabels() {
    if (window.showKeyLabels !== undefined) {
        window.showKeyLabels = !window.showKeyLabels;
        
        const labels = document.querySelectorAll('.key-label');
        labels.forEach(label => {
            label.style.display = window.showKeyLabels ? 'block' : 'none';
        });
        
        const toggleBtn = document.getElementById('keyLabelsToggle');
        if (toggleBtn) {
            toggleBtn.textContent = window.showKeyLabels ? '🎹 隐藏按键' : '🎹 显示按键';
        }
    }
}

// 记录音符（在按键按下时调用）
function recordNote(note, velocity = 0.7) {
    if (isRecording && recordingStartTime) {
        const timestamp = Date.now() - recordingStartTime;
        recordedNotes.push({
            note: note,
            velocity: velocity,
            duration: 0.5, // 默认持续时间
            timestamp: timestamp
        });
    }
}

// 导出函数
window.toggleRecording = toggleRecording;
window.playRecording = playRecording;
window.toggleMetronome = toggleMetronome;
window.toggleKeyLabels = toggleKeyLabels;
window.recordNote = recordNote;
window.isRecording = isRecording;
window.recordedNotes = recordedNotes;