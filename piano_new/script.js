// 音符频率映射
const notes = {
    'C4': 261.63, 'C#4': 277.18, 'D4': 293.66, 'D#4': 311.13,
    'E4': 329.63, 'F4': 349.23, 'F#4': 369.99, 'G4': 392.00,
    'G#4': 415.30, 'A4': 440.00, 'A#4': 466.16, 'B4': 493.88,
    'C5': 523.25, 'C#5': 554.37, 'D5': 587.33, 'D#5': 622.25,
    'E5': 659.25, 'F5': 698.46, 'F#5': 739.99, 'G5': 783.99,
    'G#5': 830.61, 'A5': 880.00, 'A#5': 932.33, 'B5': 987.77
};

// 键盘按键到音符的映射
const keyMap = {
    'a': 'C4', 'w': 'C#4', 's': 'D4', 'e': 'D#4', 'd': 'E4',
    'f': 'F4', 't': 'F#4', 'g': 'G4', 'y': 'G#4', 'h': 'A4',
    'u': 'A#4', 'j': 'B4', 'k': 'C5', 'o': 'C#5', 'l': 'D5',
    'p': 'D#5', ';': 'E5'
};

// 音符到键盘按键的反向映射
const noteToKeyMap = {
    'C4': 'A', 'C#4': 'W', 'D4': 'S', 'D#4': 'E', 'E4': 'D',
    'F4': 'F', 'F#4': 'T', 'G4': 'G', 'G#4': 'Y', 'A4': 'H',
    'A#4': 'U', 'B4': 'J', 'C5': 'K', 'C#5': 'O', 'D5': 'L',
    'D#5': 'P', 'E5': ';'
};

// 音游歌曲库 - 著名钢琴伴奏（2-3分钟完整版）
const songLibrary = {
    '致爱丽丝': {
        notes: [
            // 主题A段 (0-16秒)
            {note: 'E5', time: 0}, {note: 'D#5', time: 300}, {note: 'E5', time: 600}, {note: 'D#5', time: 900},
            {note: 'E5', time: 1200}, {note: 'B4', time: 1500}, {note: 'D5', time: 1800}, {note: 'C5', time: 2100},
            {note: 'A4', time: 2400}, {note: 'C4', time: 2700}, {note: 'E4', time: 3000}, {note: 'A4', time: 3300},
            {note: 'B4', time: 3600}, {note: 'E4', time: 3900}, {note: 'G#4', time: 4200}, {note: 'B4', time: 4500},
            {note: 'C5', time: 4800}, {note: 'E4', time: 5100}, {note: 'E5', time: 5400}, {note: 'D#5', time: 5700},
            {note: 'E5', time: 6000}, {note: 'D#5', time: 6300}, {note: 'E5', time: 6600}, {note: 'B4', time: 6900},
            {note: 'D5', time: 7200}, {note: 'C5', time: 7500}, {note: 'A4', time: 7800}, {note: 'A4', time: 8400},
            {note: 'B4', time: 9000}, {note: 'C5', time: 9600}, {note: 'D5', time: 10200}, {note: 'E5', time: 10800},
            
            // 过渡段 (10.8-16秒)
            {note: 'F5', time: 11200}, {note: 'G5', time: 11600}, {note: 'A5', time: 12000}, {note: 'B5', time: 12400},
            {note: 'C6', time: 12800}, {note: 'B5', time: 13200}, {note: 'A5', time: 13600}, {note: 'G5', time: 14000},
            {note: 'F5', time: 14400}, {note: 'E5', time: 14800}, {note: 'D5', time: 15200}, {note: 'C5', time: 15600},
            
            // 主题B段 (16-32秒)
            {note: 'G5', time: 16000}, {note: 'F5', time: 16300}, {note: 'E5', time: 16600}, {note: 'D5', time: 16900},
            {note: 'C5', time: 17200}, {note: 'B4', time: 17500}, {note: 'A4', time: 17800}, {note: 'G4', time: 18100},
            {note: 'F4', time: 18400}, {note: 'E4', time: 18700}, {note: 'D4', time: 19000}, {note: 'C4', time: 19300},
            {note: 'B4', time: 19600}, {note: 'C5', time: 19900}, {note: 'D5', time: 20200}, {note: 'E5', time: 20500},
            {note: 'F5', time: 20800}, {note: 'G5', time: 21100}, {note: 'A5', time: 21400}, {note: 'B5', time: 21700},
            {note: 'C6', time: 22000}, {note: 'B5', time: 22300}, {note: 'A5', time: 22600}, {note: 'G5', time: 22900},
            {note: 'F5', time: 23200}, {note: 'E5', time: 23500}, {note: 'D5', time: 23800}, {note: 'C5', time: 24100},
            {note: 'B4', time: 24400}, {note: 'A4', time: 24700}, {note: 'G4', time: 25000}, {note: 'F4', time: 25300},
            
            // 连接段 (25.3-32秒)
            {note: 'E4', time: 25600}, {note: 'F4', time: 25900}, {note: 'G4', time: 26200}, {note: 'A4', time: 26500},
            {note: 'B4', time: 26800}, {note: 'C5', time: 27100}, {note: 'D5', time: 27400}, {note: 'E5', time: 27700},
            {note: 'F5', time: 28000}, {note: 'E5', time: 28300}, {note: 'D5', time: 28600}, {note: 'C5', time: 28900},
            {note: 'B4', time: 29200}, {note: 'A4', time: 29500}, {note: 'G4', time: 29800}, {note: 'F4', time: 30100},
            {note: 'E4', time: 30400}, {note: 'D4', time: 30700}, {note: 'C4', time: 31000}, {note: 'D4', time: 31300},
            {note: 'E4', time: 31600}, {note: 'F4', time: 31900},
            
            // 主题A重复 (32-48秒)
            {note: 'E5', time: 32000}, {note: 'D#5', time: 32300}, {note: 'E5', time: 32600}, {note: 'D#5', time: 32900},
            {note: 'E5', time: 33200}, {note: 'B4', time: 33500}, {note: 'D5', time: 33800}, {note: 'C5', time: 34100},
            {note: 'A4', time: 34400}, {note: 'C4', time: 34700}, {note: 'E4', time: 35000}, {note: 'A4', time: 35300},
            {note: 'B4', time: 35600}, {note: 'E4', time: 35900}, {note: 'G#4', time: 36200}, {note: 'B4', time: 36500},
            {note: 'C5', time: 36800}, {note: 'E4', time: 37100}, {note: 'E5', time: 37400}, {note: 'D#5', time: 37700},
            {note: 'E5', time: 38000}, {note: 'D#5', time: 38300}, {note: 'E5', time: 38600}, {note: 'B4', time: 38900},
            {note: 'D5', time: 39200}, {note: 'C5', time: 39500}, {note: 'A4', time: 39800}, {note: 'A4', time: 40400},
            {note: 'B4', time: 41000}, {note: 'C5', time: 41600}, {note: 'D5', time: 42200}, {note: 'E5', time: 42800},
            
            // 发展段 (48-80秒)
            {note: 'A5', time: 48000}, {note: 'G#5', time: 48200}, {note: 'A5', time: 48400}, {note: 'B5', time: 48600},
            {note: 'C6', time: 48800}, {note: 'B5', time: 49000}, {note: 'A5', time: 49200}, {note: 'G5', time: 49400},
            {note: 'F5', time: 49600}, {note: 'E5', time: 49800}, {note: 'D5', time: 50000}, {note: 'C5', time: 50200},
            {note: 'B4', time: 50400}, {note: 'A4', time: 50600}, {note: 'G4', time: 50800}, {note: 'F4', time: 51000},
            {note: 'E4', time: 51200}, {note: 'F4', time: 51400}, {note: 'G4', time: 51600}, {note: 'A4', time: 51800},
            {note: 'B4', time: 52000}, {note: 'C5', time: 52200}, {note: 'D5', time: 52400}, {note: 'E5', time: 52600},
            {note: 'F5', time: 52800}, {note: 'G5', time: 53000}, {note: 'A5', time: 53200}, {note: 'B5', time: 53400},
            {note: 'C6', time: 53600}, {note: 'D6', time: 53800}, {note: 'E6', time: 54000}, {note: 'D6', time: 54200},
            {note: 'C6', time: 54400}, {note: 'B5', time: 54600}, {note: 'A5', time: 54800}, {note: 'G5', time: 55000},
            {note: 'F5', time: 55200}, {note: 'E5', time: 55400}, {note: 'D5', time: 55600}, {note: 'C5', time: 55800},
            
            // 中间发展段 (55.8-80秒)
            {note: 'B4', time: 56000}, {note: 'A4', time: 56400}, {note: 'G4', time: 56800}, {note: 'F4', time: 57200},
            {note: 'E4', time: 57600}, {note: 'F4', time: 58000}, {note: 'G4', time: 58400}, {note: 'A4', time: 58800},
            {note: 'B4', time: 59200}, {note: 'C5', time: 59600}, {note: 'D5', time: 60000}, {note: 'E5', time: 60400},
            {note: 'F5', time: 60800}, {note: 'G5', time: 61200}, {note: 'A5', time: 61600}, {note: 'B5', time: 62000},
            {note: 'C6', time: 62400}, {note: 'D6', time: 62800}, {note: 'E6', time: 63200}, {note: 'D6', time: 63600},
            {note: 'C6', time: 64000}, {note: 'B5', time: 64400}, {note: 'A5', time: 64800}, {note: 'G5', time: 65200},
            {note: 'F5', time: 65600}, {note: 'E5', time: 66000}, {note: 'D5', time: 66400}, {note: 'C5', time: 66800},
            {note: 'B4', time: 67200}, {note: 'A4', time: 67600}, {note: 'G4', time: 68000}, {note: 'A4', time: 68400},
            {note: 'B4', time: 68800}, {note: 'C5', time: 69200}, {note: 'D5', time: 69600}, {note: 'E5', time: 70000},
            {note: 'F5', time: 70400}, {note: 'G5', time: 70800}, {note: 'A5', time: 71200}, {note: 'B5', time: 71600},
            {note: 'C6', time: 72000}, {note: 'B5', time: 72400}, {note: 'A5', time: 72800}, {note: 'G5', time: 73200},
            {note: 'F5', time: 73600}, {note: 'E5', time: 74000}, {note: 'D5', time: 74400}, {note: 'C5', time: 74800},
            {note: 'B4', time: 75200}, {note: 'A4', time: 75600}, {note: 'G4', time: 76000}, {note: 'F4', time: 76400},
            {note: 'E4', time: 76800}, {note: 'F4', time: 77200}, {note: 'G4', time: 77600}, {note: 'A4', time: 78000},
            {note: 'B4', time: 78400}, {note: 'C5', time: 78800}, {note: 'D5', time: 79200}, {note: 'E5', time: 79600},
            
            // 华彩段 (80-112秒)
            {note: 'E5', time: 80000}, {note: 'F5', time: 80100}, {note: 'G5', time: 80200}, {note: 'A5', time: 80300},
            {note: 'B5', time: 80400}, {note: 'C6', time: 80500}, {note: 'D6', time: 80600}, {note: 'E6', time: 80700},
            {note: 'F6', time: 80800}, {note: 'E6', time: 80900}, {note: 'D6', time: 81000}, {note: 'C6', time: 81100},
            {note: 'B5', time: 81200}, {note: 'A5', time: 81300}, {note: 'G5', time: 81400}, {note: 'F5', time: 81500},
            {note: 'E5', time: 81600}, {note: 'D5', time: 81700}, {note: 'C5', time: 81800}, {note: 'B4', time: 81900},
            {note: 'A4', time: 82000}, {note: 'B4', time: 82200}, {note: 'C5', time: 82400}, {note: 'D5', time: 82600},
            {note: 'E5', time: 82800}, {note: 'F5', time: 83000}, {note: 'G5', time: 83200}, {note: 'A5', time: 83400},
            {note: 'B5', time: 83600}, {note: 'C6', time: 83800}, {note: 'B5', time: 84000}, {note: 'A5', time: 84200},
            
            // 华彩延续段 (84.2-112秒)
            {note: 'G5', time: 84400}, {note: 'F5', time: 84600}, {note: 'E5', time: 84800}, {note: 'D5', time: 85000},
            {note: 'C5', time: 85200}, {note: 'D5', time: 85400}, {note: 'E5', time: 85600}, {note: 'F5', time: 85800},
            {note: 'G5', time: 86000}, {note: 'A5', time: 86200}, {note: 'B5', time: 86400}, {note: 'C6', time: 86600},
            {note: 'D6', time: 86800}, {note: 'E6', time: 87000}, {note: 'F6', time: 87200}, {note: 'E6', time: 87400},
            {note: 'D6', time: 87600}, {note: 'C6', time: 87800}, {note: 'B5', time: 88000}, {note: 'A5', time: 88200},
            {note: 'G5', time: 88400}, {note: 'F5', time: 88600}, {note: 'E5', time: 88800}, {note: 'D5', time: 89000},
            {note: 'C5', time: 89200}, {note: 'B4', time: 89400}, {note: 'A4', time: 89600}, {note: 'G4', time: 89800},
            {note: 'F4', time: 90000}, {note: 'G4', time: 90200}, {note: 'A4', time: 90400}, {note: 'B4', time: 90600},
            {note: 'C5', time: 90800}, {note: 'D5', time: 91000}, {note: 'E5', time: 91200}, {note: 'F5', time: 91400},
            {note: 'G5', time: 91600}, {note: 'A5', time: 91800}, {note: 'B5', time: 92000}, {note: 'C6', time: 92200},
            {note: 'D6', time: 92400}, {note: 'C6', time: 92600}, {note: 'B5', time: 92800}, {note: 'A5', time: 93000},
            {note: 'G5', time: 93200}, {note: 'F5', time: 93400}, {note: 'E5', time: 93600}, {note: 'D5', time: 93800},
            {note: 'C5', time: 94000}, {note: 'B4', time: 94200}, {note: 'A4', time: 94400}, {note: 'G4', time: 94600},
            {note: 'F4', time: 94800}, {note: 'E4', time: 95000}, {note: 'D4', time: 95200}, {note: 'C4', time: 95400},
            {note: 'B3', time: 95600}, {note: 'A3', time: 95800}, {note: 'B3', time: 96000}, {note: 'C4', time: 96200},
            {note: 'D4', time: 96400}, {note: 'E4', time: 96600}, {note: 'F4', time: 96800}, {note: 'G4', time: 97000},
            {note: 'A4', time: 97200}, {note: 'B4', time: 97400}, {note: 'C5', time: 97600}, {note: 'D5', time: 97800},
            {note: 'E5', time: 98000}, {note: 'F5', time: 98200}, {note: 'G5', time: 98400}, {note: 'A5', time: 98600},
            {note: 'B5', time: 98800}, {note: 'C6', time: 99000}, {note: 'D6', time: 99200}, {note: 'E6', time: 99400},
            {note: 'F6', time: 99600}, {note: 'E6', time: 99800}, {note: 'D6', time: 100000}, {note: 'C6', time: 100200},
            {note: 'B5', time: 100400}, {note: 'A5', time: 100600}, {note: 'G5', time: 100800}, {note: 'F5', time: 101000},
            {note: 'E5', time: 101200}, {note: 'D5', time: 101400}, {note: 'C5', time: 101600}, {note: 'B4', time: 101800},
            {note: 'A4', time: 102000}, {note: 'G4', time: 102200}, {note: 'F4', time: 102400}, {note: 'E4', time: 102600},
            {note: 'D4', time: 102800}, {note: 'C4', time: 103000}, {note: 'D4', time: 103200}, {note: 'E4', time: 103400},
            {note: 'F4', time: 103600}, {note: 'G4', time: 103800}, {note: 'A4', time: 104000}, {note: 'B4', time: 104200},
            {note: 'C5', time: 104400}, {note: 'D5', time: 104600}, {note: 'E5', time: 104800}, {note: 'F5', time: 105000},
            {note: 'G5', time: 105200}, {note: 'A5', time: 105400}, {note: 'B5', time: 105600}, {note: 'A5', time: 105800},
            {note: 'G5', time: 106000}, {note: 'F5', time: 106200}, {note: 'E5', time: 106400}, {note: 'D5', time: 106600},
            {note: 'C5', time: 106800}, {note: 'B4', time: 107000}, {note: 'A4', time: 107200}, {note: 'G4', time: 107400},
            {note: 'F4', time: 107600}, {note: 'E4', time: 107800}, {note: 'D4', time: 108000}, {note: 'E4', time: 108200},
            {note: 'F4', time: 108400}, {note: 'G4', time: 108600}, {note: 'A4', time: 108800}, {note: 'B4', time: 109000},
            {note: 'C5', time: 109200}, {note: 'D5', time: 109400}, {note: 'E5', time: 109600}, {note: 'D5', time: 109800},
            {note: 'C5', time: 110000}, {note: 'B4', time: 110200}, {note: 'A4', time: 110400}, {note: 'G4', time: 110600},
            {note: 'F4', time: 110800}, {note: 'E4', time: 111000}, {note: 'D4', time: 111200}, {note: 'C4', time: 111400},
            {note: 'B3', time: 111600}, {note: 'A3', time: 111800},
            
            // 尾声 (112-150秒)
            {note: 'E5', time: 112000}, {note: 'D#5', time: 112300}, {note: 'E5', time: 112600}, {note: 'D#5', time: 112900},
            {note: 'E5', time: 113200}, {note: 'B4', time: 113500}, {note: 'D5', time: 113800}, {note: 'C5', time: 114100},
            {note: 'A4', time: 114400}, {note: 'C4', time: 114700}, {note: 'E4', time: 115000}, {note: 'A4', time: 115300},
            {note: 'B4', time: 115600}, {note: 'E4', time: 115900}, {note: 'G#4', time: 116200}, {note: 'B4', time: 116500},
            {note: 'C5', time: 116800}, {note: 'E4', time: 117100}, {note: 'A4', time: 117400}, {note: 'A4', time: 118000},
            {note: 'A4', time: 120000}, {note: 'G4', time: 122000}, {note: 'F4', time: 124000}, {note: 'E4', time: 126000},
            {note: 'D4', time: 128000}, {note: 'C4', time: 130000}, {note: 'B3', time: 132000}, {note: 'A3', time: 134000},
            {note: 'A3', time: 140000}, {note: 'A3', time: 145000}, {note: 'A3', time: 150000}
        ],
        duration: 150000,
        bpm: 120
    },
    '月光奏鸣曲': {
        notes: [
            // 第一主题 (0-30秒)
            {note: 'C#4', time: 0}, {note: 'E4', time: 400}, {note: 'G#4', time: 800}, {note: 'C#5', time: 1200},
            {note: 'E5', time: 1600}, {note: 'G#4', time: 2000}, {note: 'C#5', time: 2400}, {note: 'E5', time: 2800},
            {note: 'C#4', time: 3200}, {note: 'E4', time: 3600}, {note: 'G#4', time: 4000}, {note: 'C#5', time: 4400},
            {note: 'E5', time: 4800}, {note: 'G#4', time: 5200}, {note: 'C#5', time: 5600}, {note: 'E5', time: 6000},
            {note: 'B4', time: 6400}, {note: 'D5', time: 6800}, {note: 'F#5', time: 7200}, {note: 'B5', time: 7600},
            {note: 'D5', time: 8000}, {note: 'F#5', time: 8400}, {note: 'B5', time: 8800}, {note: 'A5', time: 9200},
            {note: 'G#5', time: 9600}, {note: 'F#5', time: 10000}, {note: 'E5', time: 10400}, {note: 'D5', time: 10800},
            {note: 'C#5', time: 11200}, {note: 'B4', time: 11600}, {note: 'A4', time: 12000}, {note: 'G#4', time: 12400},
            {note: 'F#4', time: 12800}, {note: 'E4', time: 13200}, {note: 'D4', time: 13600}, {note: 'C#4', time: 14000},
            {note: 'B3', time: 14400}, {note: 'A3', time: 14800}, {note: 'G#3', time: 15200}, {note: 'F#3', time: 15600},
            {note: 'E3', time: 16000}, {note: 'F#3', time: 16400}, {note: 'G#3', time: 16800}, {note: 'A3', time: 17200},
            {note: 'B3', time: 17600}, {note: 'C#4', time: 18000}, {note: 'D4', time: 18400}, {note: 'E4', time: 18800},
            {note: 'F#4', time: 19200}, {note: 'G#4', time: 19600}, {note: 'A4', time: 20000}, {note: 'B4', time: 20400},
            {note: 'C#5', time: 20800}, {note: 'D5', time: 21200}, {note: 'E5', time: 21600}, {note: 'F#5', time: 22000},
            {note: 'G#5', time: 22400}, {note: 'A5', time: 22800}, {note: 'B5', time: 23200}, {note: 'A5', time: 23600},
            {note: 'G#5', time: 24000}, {note: 'F#5', time: 24400}, {note: 'E5', time: 24800}, {note: 'D5', time: 25200},
            {note: 'C#5', time: 25600}, {note: 'B4', time: 26000}, {note: 'A4', time: 26400}, {note: 'G#4', time: 26800},
            {note: 'F#4', time: 27200}, {note: 'E4', time: 27600}, {note: 'D4', time: 28000}, {note: 'C#4', time: 28400},
            {note: 'B3', time: 28800}, {note: 'A3', time: 29200}, {note: 'G#3', time: 29600},
            
            // 发展部 (30-90秒)
            {note: 'F#4', time: 30000}, {note: 'G#4', time: 30300}, {note: 'A4', time: 30600}, {note: 'B4', time: 30900},
            {note: 'C#5', time: 31200}, {note: 'D5', time: 31500}, {note: 'E5', time: 31800}, {note: 'F#5', time: 32100},
            {note: 'G#5', time: 32400}, {note: 'A5', time: 32700}, {note: 'B5', time: 33000}, {note: 'C#6', time: 33300},
            {note: 'D6', time: 33600}, {note: 'C#6', time: 33900}, {note: 'B5', time: 34200}, {note: 'A5', time: 34500},
            {note: 'G#5', time: 34800}, {note: 'F#5', time: 35100}, {note: 'E5', time: 35400}, {note: 'D5', time: 35700},
            {note: 'C#5', time: 36000}, {note: 'B4', time: 36300}, {note: 'A4', time: 36600}, {note: 'G#4', time: 36900},
            {note: 'F#4', time: 37200}, {note: 'E4', time: 37500}, {note: 'D4', time: 37800}, {note: 'C#4', time: 38100},
            {note: 'B3', time: 38400}, {note: 'A3', time: 38700}, {note: 'G#3', time: 39000}, {note: 'F#3', time: 39300},
            {note: 'E3', time: 39600}, {note: 'F#3', time: 39900}, {note: 'G#3', time: 40200}, {note: 'A3', time: 40500},
            {note: 'B3', time: 40800}, {note: 'C#4', time: 41100}, {note: 'D4', time: 41400}, {note: 'E4', time: 41700},
            {note: 'F#4', time: 42000}, {note: 'G#4', time: 42300}, {note: 'A4', time: 42600}, {note: 'B4', time: 42900},
            {note: 'C#5', time: 43200}, {note: 'D5', time: 43500}, {note: 'E5', time: 43800}, {note: 'F#5', time: 44100},
            {note: 'G#5', time: 44400}, {note: 'A5', time: 44700}, {note: 'B5', time: 45000}, {note: 'C#6', time: 45300},
            {note: 'D6', time: 45600}, {note: 'E6', time: 45900}, {note: 'F#6', time: 46200}, {note: 'E6', time: 46500},
            {note: 'D6', time: 46800}, {note: 'C#6', time: 47100}, {note: 'B5', time: 47400}, {note: 'A5', time: 47700},
            {note: 'G#5', time: 48000}, {note: 'F#5', time: 48300}, {note: 'E5', time: 48600}, {note: 'D5', time: 48900},
            
            // 中间连接段 (48.9-90秒)
            {note: 'C#5', time: 49200}, {note: 'B4', time: 49500}, {note: 'A4', time: 49800}, {note: 'G#4', time: 50100},
            {note: 'F#4', time: 50400}, {note: 'E4', time: 50700}, {note: 'D4', time: 51000}, {note: 'C#4', time: 51300},
            {note: 'B3', time: 51600}, {note: 'A3', time: 51900}, {note: 'B3', time: 52200}, {note: 'C#4', time: 52500},
            {note: 'D4', time: 52800}, {note: 'E4', time: 53100}, {note: 'F#4', time: 53400}, {note: 'G#4', time: 53700},
            {note: 'A4', time: 54000}, {note: 'B4', time: 54300}, {note: 'C#5', time: 54600}, {note: 'D5', time: 54900},
            {note: 'E5', time: 55200}, {note: 'F#5', time: 55500}, {note: 'G#5', time: 55800}, {note: 'A5', time: 56100},
            {note: 'B5', time: 56400}, {note: 'C#6', time: 56700}, {note: 'D6', time: 57000}, {note: 'E6', time: 57300},
            {note: 'F#6', time: 57600}, {note: 'E6', time: 57900}, {note: 'D6', time: 58200}, {note: 'C#6', time: 58500},
            {note: 'B5', time: 58800}, {note: 'A5', time: 59100}, {note: 'G#5', time: 59400}, {note: 'F#5', time: 59700},
            {note: 'E5', time: 60000}, {note: 'D5', time: 60300}, {note: 'C#5', time: 60600}, {note: 'B4', time: 60900},
            {note: 'A4', time: 61200}, {note: 'G#4', time: 61500}, {note: 'F#4', time: 61800}, {note: 'E4', time: 62100},
            {note: 'D4', time: 62400}, {note: 'C#4', time: 62700}, {note: 'B3', time: 63000}, {note: 'A3', time: 63300},
            {note: 'G#3', time: 63600}, {note: 'A3', time: 63900}, {note: 'B3', time: 64200}, {note: 'C#4', time: 64500},
            {note: 'D4', time: 64800}, {note: 'E4', time: 65100}, {note: 'F#4', time: 65400}, {note: 'G#4', time: 65700},
            {note: 'A4', time: 66000}, {note: 'B4', time: 66300}, {note: 'C#5', time: 66600}, {note: 'D5', time: 66900},
            {note: 'E5', time: 67200}, {note: 'F#5', time: 67500}, {note: 'G#5', time: 67800}, {note: 'A5', time: 68100},
            {note: 'B5', time: 68400}, {note: 'A5', time: 68700}, {note: 'G#5', time: 69000}, {note: 'F#5', time: 69300},
            {note: 'E5', time: 69600}, {note: 'D5', time: 69900}, {note: 'C#5', time: 70200}, {note: 'B4', time: 70500},
            {note: 'A4', time: 70800}, {note: 'G#4', time: 71100}, {note: 'F#4', time: 71400}, {note: 'E4', time: 71700},
            {note: 'D4', time: 72000}, {note: 'C#4', time: 72300}, {note: 'B3', time: 72600}, {note: 'A3', time: 72900},
            {note: 'B3', time: 73200}, {note: 'C#4', time: 73500}, {note: 'D4', time: 73800}, {note: 'E4', time: 74100},
            {note: 'F#4', time: 74400}, {note: 'G#4', time: 74700}, {note: 'A4', time: 75000}, {note: 'B4', time: 75300},
            {note: 'C#5', time: 75600}, {note: 'D5', time: 75900}, {note: 'E5', time: 76200}, {note: 'F#5', time: 76500},
            {note: 'G#5', time: 76800}, {note: 'A5', time: 77100}, {note: 'B5', time: 77400}, {note: 'C#6', time: 77700},
            {note: 'D6', time: 78000}, {note: 'E6', time: 78300}, {note: 'F#6', time: 78600}, {note: 'G#6', time: 78900},
            {note: 'A6', time: 79200}, {note: 'G#6', time: 79500}, {note: 'F#6', time: 79800}, {note: 'E6', time: 80100},
            {note: 'D6', time: 80400}, {note: 'C#6', time: 80700}, {note: 'B5', time: 81000}, {note: 'A5', time: 81300},
            {note: 'G#5', time: 81600}, {note: 'F#5', time: 81900}, {note: 'E5', time: 82200}, {note: 'D5', time: 82500},
            {note: 'C#5', time: 82800}, {note: 'B4', time: 83100}, {note: 'A4', time: 83400}, {note: 'G#4', time: 83700},
            {note: 'F#4', time: 84000}, {note: 'E4', time: 84300}, {note: 'D4', time: 84600}, {note: 'C#4', time: 84900},
            {note: 'B3', time: 85200}, {note: 'A3', time: 85500}, {note: 'G#3', time: 85800}, {note: 'F#3', time: 86100},
            {note: 'E3', time: 86400}, {note: 'F#3', time: 86700}, {note: 'G#3', time: 87000}, {note: 'A3', time: 87300},
            {note: 'B3', time: 87600}, {note: 'C#4', time: 87900}, {note: 'D4', time: 88200}, {note: 'E4', time: 88500},
            {note: 'F#4', time: 88800}, {note: 'G#4', time: 89100}, {note: 'A4', time: 89400}, {note: 'B4', time: 89700},
            
            // 华彩段 (90-120秒)
            {note: 'C#5', time: 90000}, {note: 'D5', time: 90200}, {note: 'E5', time: 90400}, {note: 'F#5', time: 90600},
            {note: 'G#5', time: 90800}, {note: 'A5', time: 91000}, {note: 'B5', time: 91200}, {note: 'C#6', time: 91400},
            {note: 'D6', time: 91600}, {note: 'E6', time: 91800}, {note: 'F#6', time: 92000}, {note: 'G#6', time: 92200},
            {note: 'F#6', time: 92400}, {note: 'E6', time: 92600}, {note: 'D6', time: 92800}, {note: 'C#6', time: 93000},
            {note: 'B5', time: 93200}, {note: 'A5', time: 93400}, {note: 'G#5', time: 93600}, {note: 'F#5', time: 93800},
            {note: 'E5', time: 94000}, {note: 'D5', time: 94200}, {note: 'C#5', time: 94400}, {note: 'B4', time: 94600},
            {note: 'A4', time: 94800}, {note: 'G#4', time: 95000}, {note: 'F#4', time: 95200}, {note: 'E4', time: 95400},
            {note: 'D4', time: 95600}, {note: 'C#4', time: 95800}, {note: 'B3', time: 96000}, {note: 'A3', time: 96200},
            
            // 华彩延续段 (96.2-120秒)
            {note: 'G#3', time: 96400}, {note: 'F#3', time: 96600}, {note: 'E3', time: 96800}, {note: 'F#3', time: 97000},
            {note: 'G#3', time: 97200}, {note: 'A3', time: 97400}, {note: 'B3', time: 97600}, {note: 'C#4', time: 97800},
            {note: 'D4', time: 98000}, {note: 'E4', time: 98200}, {note: 'F#4', time: 98400}, {note: 'G#4', time: 98600},
            {note: 'A4', time: 98800}, {note: 'B4', time: 99000}, {note: 'C#5', time: 99200}, {note: 'D5', time: 99400},
            {note: 'E5', time: 99600}, {note: 'F#5', time: 99800}, {note: 'G#5', time: 100000}, {note: 'A5', time: 100200},
            {note: 'B5', time: 100400}, {note: 'C#6', time: 100600}, {note: 'D6', time: 100800}, {note: 'E6', time: 101000},
            {note: 'F#6', time: 101200}, {note: 'G#6', time: 101400}, {note: 'A6', time: 101600}, {note: 'G#6', time: 101800},
            {note: 'F#6', time: 102000}, {note: 'E6', time: 102200}, {note: 'D6', time: 102400}, {note: 'C#6', time: 102600},
            {note: 'B5', time: 102800}, {note: 'A5', time: 103000}, {note: 'G#5', time: 103200}, {note: 'F#5', time: 103400},
            {note: 'E5', time: 103600}, {note: 'D5', time: 103800}, {note: 'C#5', time: 104000}, {note: 'B4', time: 104200},
            {note: 'A4', time: 104400}, {note: 'G#4', time: 104600}, {note: 'F#4', time: 104800}, {note: 'E4', time: 105000},
            {note: 'D4', time: 105200}, {note: 'C#4', time: 105400}, {note: 'B3', time: 105600}, {note: 'A3', time: 105800},
            {note: 'G#3', time: 106000}, {note: 'A3', time: 106200}, {note: 'B3', time: 106400}, {note: 'C#4', time: 106600},
            {note: 'D4', time: 106800}, {note: 'E4', time: 107000}, {note: 'F#4', time: 107200}, {note: 'G#4', time: 107400},
            {note: 'A4', time: 107600}, {note: 'B4', time: 107800}, {note: 'C#5', time: 108000}, {note: 'D5', time: 108200},
            {note: 'E5', time: 108400}, {note: 'F#5', time: 108600}, {note: 'G#5', time: 108800}, {note: 'A5', time: 109000},
            {note: 'B5', time: 109200}, {note: 'A5', time: 109400}, {note: 'G#5', time: 109600}, {note: 'F#5', time: 109800},
            {note: 'E5', time: 110000}, {note: 'D5', time: 110200}, {note: 'C#5', time: 110400}, {note: 'B4', time: 110600},
            {note: 'A4', time: 110800}, {note: 'G#4', time: 111000}, {note: 'F#4', time: 111200}, {note: 'E4', time: 111400},
            {note: 'D4', time: 111600}, {note: 'C#4', time: 111800}, {note: 'B3', time: 112000}, {note: 'A3', time: 112200},
            {note: 'G#3', time: 112400}, {note: 'F#3', time: 112600}, {note: 'E3', time: 112800}, {note: 'D3', time: 113000},
            {note: 'C#3', time: 113200}, {note: 'B2', time: 113400}, {note: 'A2', time: 113600}, {note: 'B2', time: 113800},
            {note: 'C#3', time: 114000}, {note: 'D3', time: 114200}, {note: 'E3', time: 114400}, {note: 'F#3', time: 114600},
            {note: 'G#3', time: 114800}, {note: 'A3', time: 115000}, {note: 'B3', time: 115200}, {note: 'C#4', time: 115400},
            {note: 'D4', time: 115600}, {note: 'E4', time: 115800}, {note: 'F#4', time: 116000}, {note: 'G#4', time: 116200},
            {note: 'A4', time: 116400}, {note: 'B4', time: 116600}, {note: 'C#5', time: 116800}, {note: 'D5', time: 117000},
            {note: 'E5', time: 117200}, {note: 'D5', time: 117400}, {note: 'C#5', time: 117600}, {note: 'B4', time: 117800},
            {note: 'A4', time: 118000}, {note: 'G#4', time: 118200}, {note: 'F#4', time: 118400}, {note: 'E4', time: 118600},
            {note: 'D4', time: 118800}, {note: 'C#4', time: 119000}, {note: 'B3', time: 119200}, {note: 'A3', time: 119400},
            {note: 'G#3', time: 119600}, {note: 'F#3', time: 119800},
            
            // 尾声 (120-150秒)
            {note: 'C#4', time: 120000}, {note: 'E4', time: 120800}, {note: 'G#4', time: 121600}, {note: 'C#5', time: 122400},
            {note: 'E5', time: 123200}, {note: 'G#5', time: 124000}, {note: 'C#6', time: 124800}, {note: 'E6', time: 125600},
            {note: 'G#6', time: 126400}, {note: 'E6', time: 127200}, {note: 'C#6', time: 128000}, {note: 'G#5', time: 128800},
            {note: 'E5', time: 129600}, {note: 'C#5', time: 130400}, {note: 'G#4', time: 131200}, {note: 'E4', time: 132000},
            {note: 'C#4', time: 132800}, {note: 'B3', time: 135000}, {note: 'A3', time: 137000}, {note: 'G#3', time: 139000},
            {note: 'F#3', time: 141000}, {note: 'E3', time: 143000}, {note: 'D3', time: 145000}, {note: 'C#3', time: 147000},
            {note: 'C#3', time: 150000}
        ],
        duration: 150000,
        bpm: 60
    },
    '美人鱼': {
        notes: [
            // 前奏 (0-8秒)
            {note: 'C4', time: 0}, {note: 'E4', time: 500}, {note: 'G4', time: 1000}, {note: 'C5', time: 1500},
            {note: 'E5', time: 2000}, {note: 'G4', time: 2500}, {note: 'C5', time: 3000}, {note: 'E5', time: 3500},
            {note: 'F4', time: 4000}, {note: 'A4', time: 4500}, {note: 'C5', time: 5000}, {note: 'F5', time: 5500},
            {note: 'A5', time: 6000}, {note: 'C5', time: 6500}, {note: 'F5', time: 7000}, {note: 'A5', time: 7500},
            
            // 主歌A段 (8-24秒)
            {note: 'G4', time: 8000}, {note: 'C5', time: 8400}, {note: 'E5', time: 8800}, {note: 'G5', time: 9200},
            {note: 'C6', time: 9600}, {note: 'E5', time: 10000}, {note: 'G5', time: 10400}, {note: 'C6', time: 10800},
            {note: 'F4', time: 11200}, {note: 'A4', time: 11600}, {note: 'C5', time: 12000}, {note: 'F5', time: 12400},
            {note: 'A5', time: 12800}, {note: 'C5', time: 13200}, {note: 'F5', time: 13600}, {note: 'A5', time: 14000},
            {note: 'E4', time: 14400}, {note: 'G4', time: 14800}, {note: 'B4', time: 15200}, {note: 'E5', time: 15600},
            {note: 'G5', time: 16000}, {note: 'B4', time: 16400}, {note: 'E5', time: 16800}, {note: 'G5', time: 17200},
            {note: 'D4', time: 17600}, {note: 'F4', time: 18000}, {note: 'A4', time: 18400}, {note: 'D5', time: 18800},
            {note: 'F5', time: 19200}, {note: 'A4', time: 19600}, {note: 'D5', time: 20000}, {note: 'F5', time: 20400},
            {note: 'C4', time: 20800}, {note: 'E4', time: 21200}, {note: 'G4', time: 21600}, {note: 'C5', time: 22000},
            {note: 'E5', time: 22400}, {note: 'G4', time: 22800}, {note: 'C5', time: 23200}, {note: 'E5', time: 23600},
            
            // 副歌 (24-40秒)
            {note: 'F4', time: 24000}, {note: 'A4', time: 24300}, {note: 'C5', time: 24600}, {note: 'F5', time: 24900},
            {note: 'A5', time: 25200}, {note: 'C6', time: 25500}, {note: 'F6', time: 25800}, {note: 'A6', time: 26100},
            {note: 'G4', time: 26400}, {note: 'B4', time: 26700}, {note: 'D5', time: 27000}, {note: 'G5', time: 27300},
            {note: 'B5', time: 27600}, {note: 'D6', time: 27900}, {note: 'G6', time: 28200}, {note: 'B6', time: 28500},
            {note: 'E4', time: 28800}, {note: 'G4', time: 29100}, {note: 'C5', time: 29400}, {note: 'E5', time: 29700},
            {note: 'G5', time: 30000}, {note: 'C6', time: 30300}, {note: 'E6', time: 30600}, {note: 'G6', time: 30900},
            {note: 'F4', time: 31200}, {note: 'A4', time: 31500}, {note: 'C5', time: 31800}, {note: 'F5', time: 32100},
            {note: 'A5', time: 32400}, {note: 'C6', time: 32700}, {note: 'F6', time: 33000}, {note: 'A6', time: 33300},
            {note: 'D4', time: 33600}, {note: 'F4', time: 33900}, {note: 'A4', time: 34200}, {note: 'D5', time: 34500},
            {note: 'F5', time: 34800}, {note: 'A5', time: 35100}, {note: 'D6', time: 35400}, {note: 'F6', time: 35700},
            {note: 'G4', time: 36000}, {note: 'B4', time: 36300}, {note: 'D5', time: 36600}, {note: 'G5', time: 36900},
            {note: 'B5', time: 37200}, {note: 'D6', time: 37500}, {note: 'G6', time: 37800}, {note: 'B6', time: 38100},
            {note: 'C4', time: 38400}, {note: 'E4', time: 38700}, {note: 'G4', time: 39000}, {note: 'C5', time: 39300},
            {note: 'E5', time: 39600}, {note: 'G5', time: 39900},
            
            // 间奏 (40-48秒)
            {note: 'A4', time: 40000}, {note: 'C5', time: 40400}, {note: 'E5', time: 40800}, {note: 'A5', time: 41200},
            {note: 'C6', time: 41600}, {note: 'E6', time: 42000}, {note: 'A6', time: 42400}, {note: 'C7', time: 42800},
            {note: 'F4', time: 43200}, {note: 'A4', time: 43600}, {note: 'C5', time: 44000}, {note: 'F5', time: 44400},
            {note: 'A5', time: 44800}, {note: 'C6', time: 45200}, {note: 'F6', time: 45600}, {note: 'A6', time: 46000},
            {note: 'G4', time: 46400}, {note: 'B4', time: 46800}, {note: 'D5', time: 47200}, {note: 'G5', time: 47600},
            
            // 主歌B段 (48-64秒)
            {note: 'C4', time: 48000}, {note: 'E4', time: 48400}, {note: 'G4', time: 48800}, {note: 'C5', time: 49200},
            {note: 'E5', time: 49600}, {note: 'G5', time: 50000}, {note: 'C6', time: 50400}, {note: 'E6', time: 50800},
            {note: 'F4', time: 51200}, {note: 'A4', time: 51600}, {note: 'C5', time: 52000}, {note: 'F5', time: 52400},
            {note: 'A5', time: 52800}, {note: 'C6', time: 53200}, {note: 'F6', time: 53600}, {note: 'A6', time: 54000},
            {note: 'E4', time: 54400}, {note: 'G4', time: 54800}, {note: 'B4', time: 55200}, {note: 'E5', time: 55600},
            {note: 'G5', time: 56000}, {note: 'B5', time: 56400}, {note: 'E6', time: 56800}, {note: 'G6', time: 57200},
            {note: 'D4', time: 57600}, {note: 'F4', time: 58000}, {note: 'A4', time: 58400}, {note: 'D5', time: 58800},
            {note: 'F5', time: 59200}, {note: 'A5', time: 59600}, {note: 'D6', time: 60000}, {note: 'F6', time: 60400},
            {note: 'C4', time: 60800}, {note: 'E4', time: 61200}, {note: 'G4', time: 61600}, {note: 'C5', time: 62000},
            {note: 'E5', time: 62400}, {note: 'G5', time: 62800}, {note: 'C6', time: 63200}, {note: 'E6', time: 63600},
            
            // 副歌重复 (64-80秒)
            {note: 'F4', time: 64000}, {note: 'A4', time: 64300}, {note: 'C5', time: 64600}, {note: 'F5', time: 64900},
            {note: 'A5', time: 65200}, {note: 'C6', time: 65500}, {note: 'F6', time: 65800}, {note: 'A6', time: 66100},
            {note: 'G4', time: 66400}, {note: 'B4', time: 66700}, {note: 'D5', time: 67000}, {note: 'G5', time: 67300},
            {note: 'B5', time: 67600}, {note: 'D6', time: 67900}, {note: 'G6', time: 68200}, {note: 'B6', time: 68500},
            {note: 'E4', time: 68800}, {note: 'G4', time: 69100}, {note: 'C5', time: 69400}, {note: 'E5', time: 69700},
            {note: 'G5', time: 70000}, {note: 'C6', time: 70300}, {note: 'E6', time: 70600}, {note: 'G6', time: 70900},
            {note: 'F4', time: 71200}, {note: 'A4', time: 71500}, {note: 'C5', time: 71800}, {note: 'F5', time: 72100},
            {note: 'A5', time: 72400}, {note: 'C6', time: 72700}, {note: 'F6', time: 73000}, {note: 'A6', time: 73300},
            {note: 'D4', time: 73600}, {note: 'F4', time: 73900}, {note: 'A4', time: 74200}, {note: 'D5', time: 74500},
            {note: 'F5', time: 74800}, {note: 'A5', time: 75100}, {note: 'D6', time: 75400}, {note: 'F6', time: 75700},
            {note: 'G4', time: 76000}, {note: 'B4', time: 76300}, {note: 'D5', time: 76600}, {note: 'G5', time: 76900},
            {note: 'B5', time: 77200}, {note: 'D6', time: 77500}, {note: 'G6', time: 77800}, {note: 'B6', time: 78100},
            {note: 'C4', time: 78400}, {note: 'E4', time: 78700}, {note: 'G4', time: 79000}, {note: 'C5', time: 79300},
            {note: 'E5', time: 79600}, {note: 'G5', time: 79900},
            
            // 桥段 (80-96秒)
            {note: 'A4', time: 80000}, {note: 'C5', time: 80500}, {note: 'E5', time: 81000}, {note: 'A5', time: 81500},
            {note: 'C6', time: 82000}, {note: 'E6', time: 82500}, {note: 'A6', time: 83000}, {note: 'C7', time: 83500},
            {note: 'F4', time: 84000}, {note: 'A4', time: 84500}, {note: 'C5', time: 85000}, {note: 'F5', time: 85500},
            {note: 'A5', time: 86000}, {note: 'C6', time: 86500}, {note: 'F6', time: 87000}, {note: 'A6', time: 87500},
            {note: 'G4', time: 88000}, {note: 'B4', time: 88500}, {note: 'D5', time: 89000}, {note: 'G5', time: 89500},
            {note: 'B5', time: 90000}, {note: 'D6', time: 90500}, {note: 'G6', time: 91000}, {note: 'B6', time: 91500},
            {note: 'E4', time: 92000}, {note: 'G4', time: 92500}, {note: 'C5', time: 93000}, {note: 'E5', time: 93500},
            {note: 'G5', time: 94000}, {note: 'C6', time: 94500}, {note: 'E6', time: 95000}, {note: 'G6', time: 95500},
            
            // 尾声 (96-120秒)
            {note: 'F4', time: 96000}, {note: 'A4', time: 96600}, {note: 'C5', time: 97200}, {note: 'F5', time: 97800},
            {note: 'A5', time: 98400}, {note: 'C6', time: 99000}, {note: 'F6', time: 99600}, {note: 'A6', time: 100200},
            {note: 'G4', time: 100800}, {note: 'B4', time: 101400}, {note: 'D5', time: 102000}, {note: 'G5', time: 102600},
            {note: 'B5', time: 103200}, {note: 'D6', time: 103800}, {note: 'G6', time: 104400}, {note: 'B6', time: 105000},
            {note: 'C4', time: 105600}, {note: 'E4', time: 106200}, {note: 'G4', time: 106800}, {note: 'C5', time: 107400},
            {note: 'E5', time: 108000}, {note: 'G5', time: 108600}, {note: 'C6', time: 109200}, {note: 'E6', time: 109800},
            {note: 'F4', time: 110400}, {note: 'A4', time: 111000}, {note: 'C5', time: 111600}, {note: 'F5', time: 112200},
            {note: 'A5', time: 112800}, {note: 'C6', time: 113400}, {note: 'F6', time: 114000}, {note: 'A6', time: 114600},
            {note: 'C4', time: 115200}, {note: 'E4', time: 116000}, {note: 'G4', time: 116800}, {note: 'C5', time: 117600},
            {note: 'E5', time: 118400}, {note: 'G5', time: 119200}, {note: 'C6', time: 120000}
        ],
        duration: 120000,
        bpm: 120
    },
    '土耳其进行曲': {
        notes: [
            // 主题A段 (0-20秒)
            {note: 'A4', time: 0}, {note: 'B4', time: 200}, {note: 'C#5', time: 400}, {note: 'D5', time: 600},
            {note: 'E5', time: 800}, {note: 'F#5', time: 1000}, {note: 'G5', time: 1200}, {note: 'A5', time: 1400},
            {note: 'B5', time: 1600}, {note: 'A5', time: 1800}, {note: 'G5', time: 2000}, {note: 'F#5', time: 2200},
            {note: 'E5', time: 2400}, {note: 'D5', time: 2600}, {note: 'C#5', time: 2800}, {note: 'B4', time: 3000},
            {note: 'A4', time: 3200}, {note: 'B4', time: 3400}, {note: 'C#5', time: 3600}, {note: 'D5', time: 3800},
            {note: 'E5', time: 4000}, {note: 'F#5', time: 4200}, {note: 'G5', time: 4400}, {note: 'A5', time: 4600},
            {note: 'B5', time: 4800}, {note: 'C6', time: 5000}, {note: 'D6', time: 5200}, {note: 'C6', time: 5400},
            {note: 'B5', time: 5600}, {note: 'A5', time: 5800}, {note: 'G5', time: 6000}, {note: 'F#5', time: 6200},
            {note: 'E5', time: 6400}, {note: 'D5', time: 6600}, {note: 'C#5', time: 6800}, {note: 'B4', time: 7000},
            {note: 'A4', time: 7200}, {note: 'G4', time: 7400}, {note: 'F#4', time: 7600}, {note: 'E4', time: 7800},
            {note: 'D4', time: 8000}, {note: 'E4', time: 8200}, {note: 'F#4', time: 8400}, {note: 'G4', time: 8600},
            {note: 'A4', time: 8800}, {note: 'B4', time: 9000}, {note: 'C#5', time: 9200}, {note: 'D5', time: 9400},
            {note: 'E5', time: 9600}, {note: 'F#5', time: 9800}, {note: 'G5', time: 10000}, {note: 'A5', time: 10200},
            {note: 'B5', time: 10400}, {note: 'C6', time: 10600}, {note: 'D6', time: 10800}, {note: 'E6', time: 11000},
            {note: 'F#6', time: 11200}, {note: 'E6', time: 11400}, {note: 'D6', time: 11600}, {note: 'C6', time: 11800},
            {note: 'B5', time: 12000}, {note: 'A5', time: 12200}, {note: 'G5', time: 12400}, {note: 'F#5', time: 12600},
            {note: 'E5', time: 12800}, {note: 'D5', time: 13000}, {note: 'C#5', time: 13200}, {note: 'B4', time: 13400},
            {note: 'A4', time: 13600}, {note: 'B4', time: 13800}, {note: 'C#5', time: 14000}, {note: 'D5', time: 14200},
            {note: 'E5', time: 14400}, {note: 'F#5', time: 14600}, {note: 'G5', time: 14800}, {note: 'A5', time: 15000},
            {note: 'B5', time: 15200}, {note: 'A5', time: 15400}, {note: 'G5', time: 15600}, {note: 'F#5', time: 15800},
            {note: 'E5', time: 16000}, {note: 'D5', time: 16200}, {note: 'C#5', time: 16400}, {note: 'B4', time: 16600},
            {note: 'A4', time: 16800}, {note: 'G4', time: 17000}, {note: 'F#4', time: 17200}, {note: 'E4', time: 17400},
            {note: 'D4', time: 17600}, {note: 'C#4', time: 17800}, {note: 'B3', time: 18000}, {note: 'A3', time: 18200},
            {note: 'B3', time: 18400}, {note: 'C#4', time: 18600}, {note: 'D4', time: 18800}, {note: 'E4', time: 19000},
            {note: 'F#4', time: 19200}, {note: 'G4', time: 19400}, {note: 'A4', time: 19600}, {note: 'B4', time: 19800},
            
            // 主题B段 (20-50秒)
            {note: 'C5', time: 20000}, {note: 'D5', time: 20150}, {note: 'E5', time: 20300}, {note: 'F5', time: 20450},
            {note: 'G5', time: 20600}, {note: 'A5', time: 20750}, {note: 'B5', time: 20900}, {note: 'C6', time: 21050},
            {note: 'D6', time: 21200}, {note: 'C6', time: 21350}, {note: 'B5', time: 21500}, {note: 'A5', time: 21650},
            {note: 'G5', time: 21800}, {note: 'F5', time: 21950}, {note: 'E5', time: 22100}, {note: 'D5', time: 22250},
            {note: 'C5', time: 22400}, {note: 'B4', time: 22550}, {note: 'A4', time: 22700}, {note: 'G4', time: 22850},
            {note: 'F4', time: 23000}, {note: 'E4', time: 23150}, {note: 'D4', time: 23300}, {note: 'C4', time: 23450},
            {note: 'B3', time: 23600}, {note: 'C4', time: 23750}, {note: 'D4', time: 23900}, {note: 'E4', time: 24050},
            {note: 'F4', time: 24200}, {note: 'G4', time: 24350}, {note: 'A4', time: 24500}, {note: 'B4', time: 24650},
            {note: 'C5', time: 24800}, {note: 'D5', time: 24950}, {note: 'E5', time: 25100}, {note: 'F5', time: 25250},
            {note: 'G5', time: 25400}, {note: 'A5', time: 25550}, {note: 'B5', time: 25700}, {note: 'C6', time: 25850},
            {note: 'D6', time: 26000}, {note: 'E6', time: 26150}, {note: 'F6', time: 26300}, {note: 'E6', time: 26450},
            {note: 'D6', time: 26600}, {note: 'C6', time: 26750}, {note: 'B5', time: 26900}, {note: 'A5', time: 27050},
            {note: 'G5', time: 27200}, {note: 'F5', time: 27350}, {note: 'E5', time: 27500}, {note: 'D5', time: 27650},
            {note: 'C5', time: 27800}, {note: 'B4', time: 27950}, {note: 'A4', time: 28100}, {note: 'G4', time: 28250},
            
            // 发展段 (50-100秒)
            {note: 'A4', time: 50000}, {note: 'B4', time: 50100}, {note: 'C5', time: 50200}, {note: 'D5', time: 50300},
            {note: 'E5', time: 50400}, {note: 'F5', time: 50500}, {note: 'G5', time: 50600}, {note: 'A5', time: 50700},
            {note: 'B5', time: 50800}, {note: 'C6', time: 50900}, {note: 'D6', time: 51000}, {note: 'E6', time: 51100},
            {note: 'F6', time: 51200}, {note: 'G6', time: 51300}, {note: 'A6', time: 51400}, {note: 'G6', time: 51500},
            {note: 'F6', time: 51600}, {note: 'E6', time: 51700}, {note: 'D6', time: 51800}, {note: 'C6', time: 51900},
            {note: 'B5', time: 52000}, {note: 'A5', time: 52100}, {note: 'G5', time: 52200}, {note: 'F5', time: 52300},
            {note: 'E5', time: 52400}, {note: 'D5', time: 52500}, {note: 'C5', time: 52600}, {note: 'B4', time: 52700},
            {note: 'A4', time: 52800}, {note: 'G4', time: 52900}, {note: 'F4', time: 53000}, {note: 'E4', time: 53100},
            {note: 'D4', time: 53200}, {note: 'C4', time: 53300}, {note: 'B3', time: 53400}, {note: 'A3', time: 53500},
            {note: 'G3', time: 53600}, {note: 'A3', time: 53700}, {note: 'B3', time: 53800}, {note: 'C4', time: 53900},
            
            // 华彩段 (100-130秒)
            {note: 'A5', time: 100000}, {note: 'B5', time: 100100}, {note: 'C6', time: 100200}, {note: 'D6', time: 100300},
            {note: 'E6', time: 100400}, {note: 'F6', time: 100500}, {note: 'G6', time: 100600}, {note: 'A6', time: 100700},
            {note: 'B6', time: 100800}, {note: 'A6', time: 100900}, {note: 'G6', time: 101000}, {note: 'F6', time: 101100},
            {note: 'E6', time: 101200}, {note: 'D6', time: 101300}, {note: 'C6', time: 101400}, {note: 'B5', time: 101500},
            {note: 'A5', time: 101600}, {note: 'G5', time: 101700}, {note: 'F5', time: 101800}, {note: 'E5', time: 101900},
            {note: 'D5', time: 102000}, {note: 'C5', time: 102100}, {note: 'B4', time: 102200}, {note: 'A4', time: 102300},
            
            // 尾声 (130-150秒)
            {note: 'A4', time: 130000}, {note: 'B4', time: 130400}, {note: 'C#5', time: 130800}, {note: 'D5', time: 131200},
            {note: 'E5', time: 131600}, {note: 'F#5', time: 132000}, {note: 'G5', time: 132400}, {note: 'A5', time: 132800},
            {note: 'B5', time: 133200}, {note: 'A5', time: 133600}, {note: 'G5', time: 134000}, {note: 'F#5', time: 134400},
            {note: 'E5', time: 134800}, {note: 'D5', time: 135200}, {note: 'C#5', time: 135600}, {note: 'B4', time: 136000},
            {note: 'A4', time: 136400}, {note: 'G4', time: 138000}, {note: 'F#4', time: 140000}, {note: 'E4', time: 142000},
            {note: 'D4', time: 144000}, {note: 'C#4', time: 146000}, {note: 'B3', time: 148000}, {note: 'A3', time: 150000}
        ],
        duration: 150000,
        bpm: 140
    },
    '卡农': {
        notes: [
            // 第一声部 (0-30秒)
            {note: 'D4', time: 0}, {note: 'A4', time: 500}, {note: 'B4', time: 1000}, {note: 'F#4', time: 1500},
            {note: 'G4', time: 2000}, {note: 'D4', time: 2500}, {note: 'G4', time: 3000}, {note: 'A4', time: 3500},
            {note: 'D5', time: 4000}, {note: 'C#5', time: 4500}, {note: 'B4', time: 5000}, {note: 'A4', time: 5500},
            {note: 'B4', time: 6000}, {note: 'C#5', time: 6500}, {note: 'D5', time: 7000}, {note: 'A4', time: 7500},
            {note: 'B4', time: 8000}, {note: 'F#4', time: 8500}, {note: 'G4', time: 9000}, {note: 'D4', time: 9500},
            {note: 'G4', time: 10000}, {note: 'A4', time: 10500}, {note: 'D5', time: 11000}, {note: 'C#5', time: 11500},
            {note: 'B4', time: 12000}, {note: 'A4', time: 12500}, {note: 'G4', time: 13000}, {note: 'F#4', time: 13500},
            {note: 'E4', time: 14000}, {note: 'D4', time: 14500}, {note: 'C#4', time: 15000}, {note: 'B3', time: 15500},
            {note: 'A3', time: 16000}, {note: 'B3', time: 16500}, {note: 'C#4', time: 17000}, {note: 'D4', time: 17500},
            {note: 'E4', time: 18000}, {note: 'F#4', time: 18500}, {note: 'G4', time: 19000}, {note: 'A4', time: 19500},
            {note: 'B4', time: 20000}, {note: 'C#5', time: 20500}, {note: 'D5', time: 21000}, {note: 'E5', time: 21500},
            {note: 'F#5', time: 22000}, {note: 'G5', time: 22500}, {note: 'A5', time: 23000}, {note: 'B5', time: 23500},
            {note: 'A5', time: 24000}, {note: 'G5', time: 24500}, {note: 'F#5', time: 25000}, {note: 'E5', time: 25500},
            {note: 'D5', time: 26000}, {note: 'C#5', time: 26500}, {note: 'B4', time: 27000}, {note: 'A4', time: 27500},
            {note: 'G4', time: 28000}, {note: 'F#4', time: 28500}, {note: 'E4', time: 29000}, {note: 'D4', time: 29500},
            
            // 第二声部进入 (30-60秒)
            {note: 'D4', time: 30000}, {note: 'A4', time: 30500}, {note: 'B4', time: 31000}, {note: 'F#4', time: 31500},
            {note: 'G4', time: 32000}, {note: 'D4', time: 32500}, {note: 'G4', time: 33000}, {note: 'A4', time: 33500},
            {note: 'F#5', time: 34000}, {note: 'E5', time: 34500}, {note: 'D5', time: 35000}, {note: 'C#5', time: 35500},
            {note: 'B4', time: 36000}, {note: 'A4', time: 36500}, {note: 'G4', time: 37000}, {note: 'F#4', time: 37500},
            {note: 'G4', time: 38000}, {note: 'A4', time: 38500}, {note: 'B4', time: 39000}, {note: 'C#5', time: 39500},
            {note: 'D5', time: 40000}, {note: 'E5', time: 40500}, {note: 'F#5', time: 41000}, {note: 'G5', time: 41500},
            {note: 'A5', time: 42000}, {note: 'B5', time: 42500}, {note: 'C#6', time: 43000}, {note: 'D6', time: 43500},
            {note: 'C#6', time: 44000}, {note: 'B5', time: 44500}, {note: 'A5', time: 45000}, {note: 'G5', time: 45500},
            {note: 'F#5', time: 46000}, {note: 'E5', time: 46500}, {note: 'D5', time: 47000}, {note: 'C#5', time: 47500},
            {note: 'B4', time: 48000}, {note: 'A4', time: 48500}, {note: 'G4', time: 49000}, {note: 'F#4', time: 49500},
            {note: 'E4', time: 50000}, {note: 'D4', time: 50500}, {note: 'C#4', time: 51000}, {note: 'B3', time: 51500},
            {note: 'A3', time: 52000}, {note: 'G3', time: 52500}, {note: 'F#3', time: 53000}, {note: 'E3', time: 53500},
            {note: 'D3', time: 54000}, {note: 'E3', time: 54500}, {note: 'F#3', time: 55000}, {note: 'G3', time: 55500},
            {note: 'A3', time: 56000}, {note: 'B3', time: 56500}, {note: 'C#4', time: 57000}, {note: 'D4', time: 57500},
            {note: 'E4', time: 58000}, {note: 'F#4', time: 58500}, {note: 'G4', time: 59000}, {note: 'A4', time: 59500},
            
            // 三声部和声 (60-120秒)
            {note: 'B4', time: 60000}, {note: 'D5', time: 60250}, {note: 'F#5', time: 60500}, {note: 'A5', time: 60750},
            {note: 'G5', time: 61000}, {note: 'B4', time: 61250}, {note: 'D5', time: 61500}, {note: 'G5', time: 61750},
            {note: 'F#5', time: 62000}, {note: 'A4', time: 62250}, {note: 'D5', time: 62500}, {note: 'F#5', time: 62750},
            {note: 'E5', time: 63000}, {note: 'G4', time: 63250}, {note: 'C#5', time: 63500}, {note: 'E5', time: 63750},
            {note: 'D5', time: 64000}, {note: 'F#4', time: 64250}, {note: 'B4', time: 64500}, {note: 'D5', time: 64750},
            {note: 'C#5', time: 65000}, {note: 'E4', time: 65250}, {note: 'A4', time: 65500}, {note: 'C#5', time: 65750},
            {note: 'B4', time: 66000}, {note: 'D4', time: 66250}, {note: 'G4', time: 66500}, {note: 'B4', time: 66750},
            {note: 'A4', time: 67000}, {note: 'C#4', time: 67250}, {note: 'F#4', time: 67500}, {note: 'A4', time: 67750},
            {note: 'G4', time: 68000}, {note: 'B3', time: 68250}, {note: 'E4', time: 68500}, {note: 'G4', time: 68750},
            {note: 'F#4', time: 69000}, {note: 'A3', time: 69250}, {note: 'D4', time: 69500}, {note: 'F#4', time: 69750},
            {note: 'E4', time: 70000}, {note: 'G3', time: 70250}, {note: 'C#4', time: 70500}, {note: 'E4', time: 70750},
            {note: 'D4', time: 71000}, {note: 'F#3', time: 71250}, {note: 'B3', time: 71500}, {note: 'D4', time: 71750},
            
            // 华彩段 (120-140秒)
            {note: 'D5', time: 120000}, {note: 'E5', time: 120200}, {note: 'F#5', time: 120400}, {note: 'G5', time: 120600},
            {note: 'A5', time: 120800}, {note: 'B5', time: 121000}, {note: 'C#6', time: 121200}, {note: 'D6', time: 121400},
            {note: 'E6', time: 121600}, {note: 'F#6', time: 121800}, {note: 'G6', time: 122000}, {note: 'A6', time: 122200},
            {note: 'G6', time: 122400}, {note: 'F#6', time: 122600}, {note: 'E6', time: 122800}, {note: 'D6', time: 123000},
            {note: 'C#6', time: 123200}, {note: 'B5', time: 123400}, {note: 'A5', time: 123600}, {note: 'G5', time: 123800},
            {note: 'F#5', time: 124000}, {note: 'E5', time: 124200}, {note: 'D5', time: 124400}, {note: 'C#5', time: 124600},
            {note: 'B4', time: 124800}, {note: 'A4', time: 125000}, {note: 'G4', time: 125200}, {note: 'F#4', time: 125400},
            {note: 'E4', time: 125600}, {note: 'D4', time: 125800}, {note: 'C#4', time: 126000}, {note: 'B3', time: 126200},
            {note: 'A3', time: 126400}, {note: 'G3', time: 126600}, {note: 'F#3', time: 126800}, {note: 'E3', time: 127000},
            {note: 'D3', time: 127200}, {note: 'C#3', time: 127400}, {note: 'B2', time: 127600}, {note: 'A2', time: 127800},
            
            // 尾声 (140-150秒)
            {note: 'D4', time: 140000}, {note: 'A4', time: 141000}, {note: 'B4', time: 142000}, {note: 'F#4', time: 143000},
            {note: 'G4', time: 144000}, {note: 'D4', time: 145000}, {note: 'G4', time: 146000}, {note: 'A4', time: 147000},
            {note: 'D5', time: 148000}, {note: 'A4', time: 149000}, {note: 'D4', time: 150000}
        ],
        duration: 150000,
        bpm: 90
    },
    '练习模式': {
        notes: [
            {note: 'C4', time: 0}, {note: 'D4', time: 600}, {note: 'E4', time: 1200}, {note: 'F4', time: 1800},
            {note: 'G4', time: 2400}, {note: 'A4', time: 3000}, {note: 'B4', time: 3600}, {note: 'C5', time: 4200},
            {note: 'B4', time: 4800}, {note: 'A4', time: 5400}, {note: 'G4', time: 6000}, {note: 'F4', time: 6600},
            {note: 'E4', time: 7200}, {note: 'D4', time: 7800}, {note: 'C4', time: 8400}
        ],
        duration: 9000,
        bpm: 100
    }
};

// 全局变量
let audioContext;
let masterGain;
let gameState = 'menu'; // menu, playing, paused, ended
let pauseStartTime = 0; // 记录暂停开始时间
let currentSong = null;
let gameStartTime = 0;
let score = 0;
let combo = 0;
let maxCombo = 0;
let totalNotes = 0;
let hitNotes = 0;
let fallingNotes = [];
let gameAnimationId = null;
let volume = 0.5;
let showKeyLabels = true;
let showKeyboardHints = true;
let gameSpeed = 1.0;
let noteSpeed = 100; // 音符下落速度 (像素/秒) - 降低速度让音符下落更平缓

// 难度配置
const difficultySettings = {
    simple: {
        noteSpeed: 80,
        gameSpeed: 0.8,
        name: '简单'
    },
    normal: {
        noteSpeed: 100,
        gameSpeed: 1.0,
        name: '正常'
    },
    hell: {
        noteSpeed: 150,
        gameSpeed: 1.5,
        name: '地狱'
    }
};

let currentDifficulty = 'normal';

// 音符下落区域高度 - 增加高度给玩家更多反应时间
const fallZoneHeight = 300;

// 当前等待弹奏的音符索引
let currentNoteIndex = 0;
let nextExpectedNotes = []; // 下一个期望的音符序列

// 初始化音频上下文
function initAudio() {
    if (!audioContext) {
        audioContext = new (window.AudioContext || window.webkitAudioContext)();
        masterGain = audioContext.createGain();
        masterGain.connect(audioContext.destination);
        masterGain.gain.value = volume;
    }
}

// 创建钢琴音色
function createPianoSound(frequency, duration = 800) {
    if (!audioContext) initAudio();
    
    // 创建多个振荡器模拟真实钢琴音色
    const oscillator1 = audioContext.createOscillator();
    const oscillator2 = audioContext.createOscillator();
    const oscillator3 = audioContext.createOscillator();
    const oscillator4 = audioContext.createOscillator();
    
    const gain1 = audioContext.createGain();
    const gain2 = audioContext.createGain();
    const gain3 = audioContext.createGain();
    const gain4 = audioContext.createGain();
    
    // 添加低通滤波器使音色更柔和
    const filter = audioContext.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(frequency * 4, audioContext.currentTime);
    filter.Q.setValueAtTime(1, audioContext.currentTime);
    
    // 基础频率 - 正弦波
    oscillator1.frequency.setValueAtTime(frequency, audioContext.currentTime);
    oscillator1.type = 'sine';
    
    // 二次谐波 - 三角波
    oscillator2.frequency.setValueAtTime(frequency * 2, audioContext.currentTime);
    oscillator2.type = 'triangle';
    
    // 三次谐波 - 锯齿波
    oscillator3.frequency.setValueAtTime(frequency * 3, audioContext.currentTime);
    oscillator3.type = 'sawtooth';
    
    // 五次谐波 - 方波
    oscillator4.frequency.setValueAtTime(frequency * 5, audioContext.currentTime);
    oscillator4.type = 'square';
    
    // 设置音量比例
    gain1.gain.setValueAtTime(0.4, audioContext.currentTime);
    gain2.gain.setValueAtTime(0.2, audioContext.currentTime);
    gain3.gain.setValueAtTime(0.1, audioContext.currentTime);
    gain4.gain.setValueAtTime(0.05, audioContext.currentTime);
    
    const now = audioContext.currentTime;
    
    // 更自然的音量包络 - 快速攻击，缓慢衰减
    gain1.gain.setValueAtTime(0.4, now);
    gain1.gain.exponentialRampToValueAtTime(0.3, now + 0.1);
    gain1.gain.exponentialRampToValueAtTime(0.001, now + duration / 1000);
    
    gain2.gain.setValueAtTime(0.2, now);
    gain2.gain.exponentialRampToValueAtTime(0.15, now + 0.1);
    gain2.gain.exponentialRampToValueAtTime(0.001, now + duration / 1000);
    
    gain3.gain.setValueAtTime(0.1, now);
    gain3.gain.exponentialRampToValueAtTime(0.05, now + 0.2);
    gain3.gain.exponentialRampToValueAtTime(0.001, now + duration / 1000);
    
    gain4.gain.setValueAtTime(0.05, now);
    gain4.gain.exponentialRampToValueAtTime(0.02, now + 0.3);
    gain4.gain.exponentialRampToValueAtTime(0.001, now + duration / 1000);
    
    // 连接音频节点
    oscillator1.connect(gain1);
    oscillator2.connect(gain2);
    oscillator3.connect(gain3);
    oscillator4.connect(gain4);
    
    gain1.connect(filter);
    gain2.connect(filter);
    gain3.connect(filter);
    gain4.connect(filter);
    
    filter.connect(masterGain);
    
    // 开始播放
    oscillator1.start(now);
    oscillator2.start(now);
    oscillator3.start(now);
    oscillator4.start(now);
    
    // 停止播放
    oscillator1.stop(now + duration / 1000);
    oscillator2.stop(now + duration / 1000);
    oscillator3.stop(now + duration / 1000);
    oscillator4.stop(now + duration / 1000);
}

// 播放音符
function playNote(note) {
    if (notes[note]) {
        createPianoSound(notes[note]);
    }
}

// 创建钢琴键盘
function createPiano() {
    const piano = document.getElementById('piano');
    const whiteKeys = ['C4', 'D4', 'E4', 'F4', 'G4', 'A4', 'B4', 'C5', 'D5', 'E5'];
    const blackKeys = ['C#4', 'D#4', 'F#4', 'G#4', 'A#4', 'C#5', 'D#5'];
    
    // 创建白键
    whiteKeys.forEach((note, index) => {
        const key = document.createElement('div');
        key.className = 'key';
        key.dataset.note = note;
        key.id = `key-${note}`;
        
        // 添加判定线
        const judgeLine = document.createElement('div');
        judgeLine.className = 'judge-line';
        key.appendChild(judgeLine);
        
        // 添加音符标签
        const label = document.createElement('div');
        label.className = 'key-label';
        label.textContent = note;
        key.appendChild(label);
        
        // 添加键盘指向提示
        const hint = document.createElement('div');
        hint.className = 'keyboard-hint';
        hint.textContent = noteToKeyMap[note] || '';
        key.appendChild(hint);
        
        piano.appendChild(key);
    });
    
    // 创建黑键
    const blackKeyData = [
        { note: 'C#4', afterWhiteKey: 0 },  // 在C和D之间
        { note: 'D#4', afterWhiteKey: 1 },  // 在D和E之间
        { note: 'F#4', afterWhiteKey: 3 },  // 在F和G之间
        { note: 'G#4', afterWhiteKey: 4 },  // 在G和A之间
        { note: 'A#4', afterWhiteKey: 5 },  // 在A和B之间
        { note: 'C#5', afterWhiteKey: 7 },  // 在C5和D5之间
        { note: 'D#5', afterWhiteKey: 8 }   // 在D5和E5之间
    ];
    
    blackKeyData.forEach((blackKeyInfo) => {
        const key = document.createElement('div');
        key.className = 'key black';
        key.dataset.note = blackKeyInfo.note;
        key.id = `key-${blackKeyInfo.note}`;
        
        // 添加判定线
        const judgeLine = document.createElement('div');
        judgeLine.className = 'judge-line';
        key.appendChild(judgeLine);
        
        // 添加音符标签
        const label = document.createElement('div');
        label.className = 'key-label';
        label.textContent = blackKeyInfo.note;
        key.appendChild(label);
        
        // 添加键盘指向提示
        const hint = document.createElement('div');
        hint.className = 'keyboard-hint';
        hint.textContent = noteToKeyMap[blackKeyInfo.note] || '';
        key.appendChild(hint);
        
        // 设置黑键位置 - 精确计算位置使其居中在相邻白键之间
        const whiteKeyWidth = 62; // 白键宽度(60px) + 间距(2px)
        const blackKeyWidth = 36;
        const rightOffset = 240; // 黑键整体偏移量（微调右移）
        const leftPosition = (blackKeyInfo.afterWhiteKey + 1) * whiteKeyWidth - (blackKeyWidth / 2) + rightOffset;
        key.style.left = `${leftPosition}px`;
        
        piano.appendChild(key);
    });
}

// 创建下落音符
function createFallingNote(note, spawnTime, originalIndex) {
    const keyElement = document.getElementById(`key-${note}`);
    if (!keyElement) return null;
    
    const noteElement = document.createElement('div');
    noteElement.className = 'falling-note';
    
    // 添加黑键样式
    if (note.includes('#')) {
        noteElement.classList.add('black-note');
    } else {
        // 为白键音符添加颜色类
        const noteBase = note.charAt(0).toLowerCase(); // 获取音符基础名称 (C, D, E, F, G, A, B)
        noteElement.classList.add(`note-${noteBase}`);
    }
    
    // 添加到DOM - 添加到钢琴容器的父元素，避免影响钢琴布局
    const pianoContainer = document.getElementById('piano').parentElement;
    pianoContainer.appendChild(noteElement);
    
    // 获取键盘位置信息
    const keyRect = keyElement.getBoundingClientRect();
    const pianoContainerRect = pianoContainer.getBoundingClientRect();
    
    // 计算音符位置 - 确保音符在键中间，相对于piano-container定位
    const keyRelativeLeft = keyRect.left - pianoContainerRect.left;
    const keyCenter = keyRelativeLeft + keyRect.width / 2;
    const noteWidth = 30; // 音符宽度
    const noteLeft = keyCenter - (noteWidth / 2); // 音符中心对齐到键中心
    
    noteElement.style.left = `${noteLeft}px`;
    noteElement.style.top = '0px';
    
    return {
        element: noteElement,
        note: note,
        spawnTime: performance.now(),
        hit: false,
        y: 0,
        originalIndex: originalIndex,
        toRemove: false
    };
}

// 更新下落音符位置
function updateFallingNotes(currentTime) {
    fallingNotes.forEach((fallingNote, index) => {
        if (fallingNote.hit || fallingNote.toRemove) return;
        
        // 简单的匀速下落动画
        const elapsedTime = (currentTime - fallingNote.spawnTime) / 1000;
        const newY = elapsedTime * noteSpeed * gameSpeed;
        
        fallingNote.y = newY;
        fallingNote.element.style.top = `${fallingNote.y}px`;
        
        // 检查是否超出下落区域
        if (fallingNote.y > fallZoneHeight) {
            // 如果这个音符是当前期望的音符且未被击中，则算作错过
            if (fallingNote.originalIndex === currentNoteIndex && !fallingNote.hit) {
                missNote(fallingNote, index);
                currentNoteIndex++; // 移动到下一个音符
                updateNextExpectedNotes();
            } else if (fallingNote.originalIndex < currentNoteIndex && !fallingNote.hit) {
                // 这是被跳过的音符，静默移除，不算错过
                fallingNote.toRemove = true;
            } else {
                // 不是当前期望的音符或已被击中，直接移除
                fallingNote.toRemove = true;
            }
        }
    });
    
    // 清理已经消失的音符
    fallingNotes = fallingNotes.filter(note => {
        if (note.toRemove) {
            // 移除DOM元素
            if (note.element && note.element.parentNode) {
                note.element.parentNode.removeChild(note.element);
            }
            return false;
        }
        return true;
    });
}

// 长按状态管理
const pressedKeys = new Set();

// 按键按下处理
function handleKeyPress(note) {
    // 如果已经按下，不重复处理
    if (pressedKeys.has(note)) return;
    
    pressedKeys.add(note);
    
    // 高亮按键（长按状态）
    const keyElement = document.getElementById(`key-${note}`);
    if (keyElement) {
        keyElement.classList.add('active');
    }
    
    // 播放音符
    playNote(note);
    
    // 如果在游戏模式中，处理判定
    if (gameState === 'playing') {
        // 查找当前期望的音符
        const expectedNote = findCurrentExpectedNote();
        
        // 查找所有匹配的可见下落音符
        const matchingNotes = fallingNotes.filter(fallingNote => 
            fallingNote.note === note && 
            !fallingNote.hit && 
            !fallingNote.toRemove &&
            fallingNote.y >= 0 && // 音符已经进入可见区域
            fallingNote.y <= fallZoneHeight // 音符还在下落区域内
        );
        
        // 优先选择当前期望的音符，如果没有则选择最合适的
        let matchingNote = null;
        if (matchingNotes.length > 0) {
            // 首先尝试找到当前期望的音符
            matchingNote = matchingNotes.find(note => note.originalIndex === currentNoteIndex);
            
            // 如果没有找到期望的音符，选择最接近击中区域底部的音符
            // 这样更符合玩家的直觉，因为玩家通常会击中最下面的音符
            if (!matchingNote) {
                matchingNote = matchingNotes.reduce((closest, current) => {
                    // 优先选择y坐标更大（更接近底部）的音符
                    if (Math.abs(current.y - fallZoneHeight) < Math.abs(closest.y - fallZoneHeight)) {
                        return current;
                    }
                    // 如果y坐标相近，则选择索引更小的（更早的）音符
                    if (Math.abs(current.y - closest.y) < 10) {
                        return current.originalIndex < closest.originalIndex ? current : closest;
                    }
                    return closest;
                });
            }
        }
        
        if (matchingNote) {
            // 添加调试信息，特别关注E5音符和最右边音符问题
            if (matchingNote.note === 'E5' || matchingNotes.length > 1) {
                console.log(`音符击中调试 (${matchingNote.note}):`, {
                    note: matchingNote.note,
                    selectedIndex: matchingNote.originalIndex,
                    currentNoteIndex: currentNoteIndex,
                    isInOrder: matchingNote.originalIndex === currentNoteIndex,
                    combo: combo,
                    allMatchingNotes: matchingNotes.map(n => ({
                        index: n.originalIndex,
                        y: Math.round(n.y)
                    }))
                });
            }
            
            // 检查是否按顺序弹奏
            if (matchingNote.originalIndex === currentNoteIndex) {
                // 按顺序弹奏，正常击中
                hitNote(matchingNote, matchingNote.originalIndex);
                currentNoteIndex++;
                updateNextExpectedNotes();
            } else {
                // 检查是否是新段落的开始（时间间隔大于1.5秒）
                let isNewSection = false;
                if (currentNoteIndex > 0 && currentNoteIndex < currentSong.notes.length && matchingNote.originalIndex < currentSong.notes.length) {
                    // 检查当前期望音符和击中音符之间是否存在时间间隔
                    const expectedNoteTime = currentSong.notes[currentNoteIndex].time;
                    const hitNoteTime = currentSong.notes[matchingNote.originalIndex].time;
                    const timeGap = Math.abs(hitNoteTime - expectedNoteTime);
                    
                    // 如果时间间隔大于1.5秒，或者击中的音符明显超前很多，认为是新段落
                    isNewSection = timeGap > 1500 || (matchingNote.originalIndex > currentNoteIndex + 5);
                    
                    console.log(`段落检测: 期望音符时间=${expectedNoteTime}, 击中音符时间=${hitNoteTime}, 时间间隔=${timeGap}ms, 是否新段落=${isNewSection}`);
                }
                
                // 特殊处理：如果当前连击数为0且这是第一个被击中的音符，
                // 不重置连击数，而是调整currentNoteIndex到匹配的音符
                if (combo === 0 && hitNotes === 0) {
                    // 这是游戏中第一个被击中的音符，调整期望索引而不是重置连击
                    console.log(`调整第一个音符索引: 从 ${currentNoteIndex} 到 ${matchingNote.originalIndex}`);
                    currentNoteIndex = matchingNote.originalIndex;
                    hitNote(matchingNote, matchingNote.originalIndex);
                    currentNoteIndex++;
                    updateNextExpectedNotes();
                } else if (isNewSection) {
                    // 新段落开始，调整期望索引但保持连击数
                    console.log(`新段落开始，调整索引: 从 ${currentNoteIndex} 到 ${matchingNote.originalIndex}，保持连击数: ${combo}`);
                    currentNoteIndex = matchingNote.originalIndex;
                    hitNote(matchingNote, matchingNote.originalIndex);
                    currentNoteIndex++;
                    updateNextExpectedNotes();
                } else {
                    // 不按顺序弹奏，击中音符但重置连击数
                    hitNoteOutOfOrder(matchingNote);
                }
            }
        } else {
            // 没有匹配的音符，显示错误提示
            showWrongNoteEffect(note);
        }
    }
}

// 按键释放处理
function handleKeyRelease(note) {
    // 从按下状态中移除
    pressedKeys.delete(note);
    
    // 移除按键高亮
    const keyElement = document.getElementById(`key-${note}`);
    if (keyElement) {
        keyElement.classList.remove('active');
    }
}

// 击中音符
function hitNote(fallingNote, index) {
    fallingNote.hit = true;
    
    // 根据音符在下落区域的位置判定分数
    let basePoints = 100;
    
    // 简化判定，按顺序弹奏就是完美
    combo++;
    hitNotes++;
    
    // 根据连击数决定判定类型
    let judgment = 'none'; // 默认不显示判定文字
    if (combo === 5) {
        judgment = 'good';
    } else if (combo % 10 === 0 && combo > 0) {
        judgment = 'perfect';
    }
    
    // 分阶段连击加分机制
    let comboMultiplier = getComboMultiplier(combo);
    let finalPoints = basePoints * comboMultiplier;
    
    score += finalPoints;
    maxCombo = Math.max(maxCombo, combo);
    
    // 添加与音符颜色匹配的键盘交互效果
    addColoredKeyEffect(fallingNote.note, fallingNote.element);
    
    showJudgment(judgment, fallingNote.element);
    updateUI();
    
    // 标记为待移除
    fallingNote.toRemove = true;
}

// 获取连击倍数
function getComboMultiplier(combo) {
    if (combo < 10) {
        return 1.0; // 基础倍数
    } else if (combo < 20) {
        return 1.2; // 10-19连击：1.2倍
    } else if (combo < 30) {
        return 1.5; // 20-29连击：1.5倍
    } else if (combo < 50) {
        return 1.8; // 30-49连击：1.8倍
    } else if (combo < 75) {
        return 2.2; // 50-74连击：2.2倍
    } else if (combo < 100) {
        return 2.5; // 75-99连击：2.5倍
    } else {
        return 3.0; // 100+连击：3.0倍
    }
}

// 获取连击阶段信息
function getComboStageInfo(combo) {
    if (combo >= 100) {
        return '🔥 传奇连击！ (3.0x)';
    } else if (combo >= 75) {
        return '⭐ 大师级连击！ (2.5x)';
    } else if (combo >= 50) {
        return '💎 专家连击！ (2.2x)';
    } else if (combo >= 30) {
        return '🎯 高手连击！ (1.8x)';
    } else if (combo >= 20) {
        return '🚀 优秀连击！ (1.5x)';
    } else if (combo >= 10) {
        return '✨ 良好连击！ (1.2x)';
    }
    return null; // 10连击以下不显示
}

// 获取音符颜色
function getNoteColor(noteElement) {
    // 音符颜色映射
    const noteColors = {
        'note-c': '#ff6b6b', // 红色系
        'note-d': '#ff9800', // 橙色系
        'note-e': '#ffeb3b', // 黄色系
        'note-f': '#4caf50', // 绿色系
        'note-g': '#00bcd4', // 青色系
        'note-a': '#2196f3', // 蓝色系
        'note-b': '#9c27b0', // 紫色系
        'black-note': '#757575' // 灰色系
    };
    
    // 检查音符元素的CSS类
    for (const className of noteElement.classList) {
        if (noteColors[className]) {
            return noteColors[className];
        }
    }
    
    return '#ffffff'; // 默认白色
}

// 不按顺序击中音符
function hitNoteOutOfOrder(fallingNote) {
    fallingNote.hit = true;
    
    // 添加E5音符的调试信息
    if (fallingNote.note === 'E5') {
        console.log(`E5音符不按顺序击中:`, {
            note: fallingNote.note,
            originalIndex: fallingNote.originalIndex,
            currentNoteIndex: currentNoteIndex,
            isLater: fallingNote.originalIndex > currentNoteIndex,
            combo: combo
        });
    }
    
    // 如果击中的音符比当前期望的音符更晚，需要重置连击
    if (fallingNote.originalIndex > currentNoteIndex) {
        // 击中了更晚的音符，重置连击
        combo = 0;
        hitNotes++;
        
        // 更新currentNoteIndex到被击中音符的下一个位置
        currentNoteIndex = fallingNote.originalIndex + 1;
        updateNextExpectedNotes();
        
        // 给予基础分数，无连击奖励
        let basePoints = 50;
        score += basePoints;
    } else {
        // 击中了之前的音符，保持连击但给予较少分数
        combo++; // 保持连击计数
        hitNotes++;
        
        // 不更新currentNoteIndex，继续等待当前期望的音符
        
        // 给予基础分数，但连击倍数减半
        let basePoints = 50;
        let comboMultiplier = Math.max(1, getComboMultiplier(combo) * 0.5);
        let finalPoints = basePoints * comboMultiplier;
        score += finalPoints;
        
        maxCombo = Math.max(maxCombo, combo);
    }
    
    // 添加与音符颜色匹配的键盘交互效果
    addColoredKeyEffect(fallingNote.note, fallingNote.element);
    
    // 不按顺序击中音符不显示判定文字，只有粒子效果
    showJudgment('none', fallingNote.element);
    updateUI();
    
    // 标记为待移除
    fallingNote.toRemove = true;
}

// 查找当前期望的音符
function findCurrentExpectedNote() {
    return fallingNotes.find(note => 
        note.originalIndex === currentNoteIndex && 
        !note.hit && 
        !note.toRemove &&
        note.y >= 0 && // 音符已经进入可见区域
        note.y <= fallZoneHeight // 音符还在下落区域内
    );
}

// 更新下一个期望的音符列表
function updateNextExpectedNotes() {
    nextExpectedNotes = [];
    for (let i = currentNoteIndex; i < currentNoteIndex + 3 && i < totalNotes; i++) {
        const note = fallingNotes.find(n => n.originalIndex === i);
        if (note) {
            nextExpectedNotes.push(note);
        }
    }
}

// 显示错误音符效果
function showWrongNoteEffect(note) {
    const keyElement = document.getElementById(`key-${note}`);
    if (keyElement) {
        keyElement.classList.add('wrong');
        setTimeout(() => {
            keyElement.classList.remove('wrong');
        }, 200);
    }
}

// 添加与音符颜色匹配的键盘交互效果
function addColoredKeyEffect(note, noteElement) {
    const keyElement = document.getElementById(`key-${note}`);
    if (!keyElement) return;
    
    // 获取音符的颜色类
    let colorClass = '';
    if (note.includes('#')) {
        colorClass = 'hit-black';
    } else {
        const noteBase = note.charAt(0).toLowerCase();
        colorClass = `hit-${noteBase}`;
    }
    
    // 添加颜色效果类
    keyElement.classList.add(colorClass);
    
    // 500毫秒后移除效果
    setTimeout(() => {
        keyElement.classList.remove(colorClass);
    }, 500);
}

// 错过音符
function missNote(fallingNote, index) {
    fallingNote.hit = true;
    combo = 0;
    
    // 错过音符后，连击数从下一个音符重新开始计算
    // currentNoteIndex已经在调用此函数前更新了
    
    showJudgment('miss', fallingNote.element);
    updateUI();
    
    // 标记为待移除
    fallingNote.toRemove = true;
}

// 显示判定结果
function showJudgment(judgment, noteElement) {
    const rect = noteElement.getBoundingClientRect();
    const pianoRect = document.getElementById('piano').getBoundingClientRect();
    
    // 根据新的判定逻辑显示文字
    if (judgment === 'perfect' || judgment === 'good' || judgment === 'miss') {
        const judgmentElement = document.createElement('div');
        judgmentElement.className = `judgment ${judgment}`;
        judgmentElement.textContent = judgment.toUpperCase();
        judgmentElement.style.left = `${rect.left - pianoRect.left}px`;
        judgmentElement.style.top = `${rect.top - pianoRect.top}px`;
        
        // 设置判定文字颜色与音符颜色一致
        if (judgment !== 'miss') {
            const noteColor = getNoteColor(noteElement);
            if (noteColor) {
                judgmentElement.style.color = noteColor;
                judgmentElement.style.textShadow = `0 0 10px ${noteColor}, 0 0 20px ${noteColor}`;
            }
        }
        
        const pianoContainer = document.getElementById('piano').parentElement;
        pianoContainer.appendChild(judgmentElement);
        
        setTimeout(() => {
            if (judgmentElement.parentNode) {
                judgmentElement.parentNode.removeChild(judgmentElement);
            }
        }, 1000);
    }
    
    // 创建粒子爆炸效果，使用音符颜色
    createParticleExplosion(rect.left - pianoRect.left + rect.width/2, rect.top - pianoRect.top + rect.height/2, judgment, noteElement);
    
    // 创建音符消失动画
    createNoteDisappearEffect(noteElement);
    
    // 创建光环效果
    if (judgment === 'perfect') {
        createHaloEffect(rect.left - pianoRect.left + rect.width/2, rect.top - pianoRect.top + rect.height/2);
    }
}

// 创建粒子爆炸效果
function createParticleExplosion(x, y, judgment, noteElement) {
    // 根据音符颜色类获取对应的粒子颜色
    const noteColors = {
        'note-c': ['#ff6b6b', '#ff8a80', '#ffab91'], // 红色系
        'note-d': ['#ff9800', '#ffb74d', '#ffcc80'], // 橙色系
        'note-e': ['#ffeb3b', '#fff176', '#fff59d'], // 黄色系
        'note-f': ['#4caf50', '#81c784', '#a5d6a7'], // 绿色系
        'note-g': ['#00bcd4', '#4dd0e1', '#80deea'], // 青色系
        'note-a': ['#2196f3', '#64b5f6', '#90caf9'], // 蓝色系
        'note-b': ['#9c27b0', '#ba68c8', '#ce93d8'], // 紫色系
        'black-note': ['#757575', '#9e9e9e', '#bdbdbd'] // 灰色系
    };
    
    // 获取音符的颜色类
    let particleColors = ['#6bcf7f', '#81c784', '#a5d6a7']; // 默认绿色
    
    if (noteElement) {
        for (const colorClass in noteColors) {
            if (noteElement.classList.contains(colorClass)) {
                particleColors = noteColors[colorClass];
                break;
            }
        }
    }
    
    const particleCount = judgment === 'perfect' ? 15 : 10;
    
    for (let i = 0; i < particleCount; i++) {
        const particle = document.createElement('div');
        particle.className = 'particle';
        particle.style.left = `${x}px`;
        particle.style.top = `${y}px`;
        particle.style.backgroundColor = particleColors[Math.floor(Math.random() * particleColors.length)];
        
        const angle = (Math.PI * 2 * i) / particleCount;
        const velocity = 50 + Math.random() * 30;
        const vx = Math.cos(angle) * velocity;
        const vy = Math.sin(angle) * velocity;
        
        particle.style.setProperty('--vx', `${vx}px`);
        particle.style.setProperty('--vy', `${vy}px`);
        
        const pianoContainer = document.getElementById('piano').parentElement;
    pianoContainer.appendChild(particle);
        
        setTimeout(() => {
            if (particle.parentNode) {
                particle.parentNode.removeChild(particle);
            }
        }, 800);
    }
}

// 创建音符消失动画
function createNoteDisappearEffect(noteElement) {
    noteElement.classList.add('note-disappear');
}

// 创建光环效果
function createHaloEffect(x, y) {
    const halo = document.createElement('div');
    halo.className = 'halo-effect';
    halo.style.left = `${x - 30}px`;
    halo.style.top = `${y - 30}px`;
    
    const pianoContainer = document.getElementById('piano').parentElement;
    pianoContainer.appendChild(halo);
    
    setTimeout(() => {
        if (halo.parentNode) {
            halo.parentNode.removeChild(halo);
        }
    }, 600);
}

// 开始游戏
function startGame(songName) {
    if (!songLibrary[songName]) return;
    
    // 获取选择的难度
    const difficultySelect = document.getElementById('difficultySelect');
    currentDifficulty = difficultySelect ? difficultySelect.value : 'normal';
    
    // 应用难度设置
    const difficulty = difficultySettings[currentDifficulty];
    noteSpeed = difficulty.noteSpeed;
    gameSpeed = difficulty.gameSpeed;
    
    currentSong = songLibrary[songName];
    gameState = 'playing';
    gameStartTime = performance.now();
    pauseStartTime = 0; // 重置暂停时间
    score = 0;
    combo = 0;
    maxCombo = 0;
    totalNotes = currentSong.notes.length;
    hitNotes = 0;
    fallingNotes = [];
    currentNoteIndex = 0;
    nextExpectedNotes = [];
    
    // 重置音符生成队列
    noteQueue = [];
    lastProcessedNoteIndex = 0;
    
    // 清理现有的下落音符和判定效果
    document.querySelectorAll('.falling-note, .judgment').forEach(el => {
        if (el.parentNode) {
            el.parentNode.removeChild(el);
        }
    });
    
    // 确保fallingNotes数组为空
    fallingNotes.forEach(note => {
        if (note.element && note.element.parentNode) {
            note.element.parentNode.removeChild(note.element);
        }
    });
    fallingNotes = [];
    
    updateNextExpectedNotes();
    updateUI();
    gameLoop();
}

// 音符生成队列
let noteQueue = [];
let lastProcessedNoteIndex = 0;

// 游戏主循环
function gameLoop() {
    if (gameState !== 'playing') return;
    
    const currentTime = performance.now();
    const gameTime = currentTime - gameStartTime;
    
    // 预先计算需要生成的音符（提前3秒的音符）
    const lookAheadTime = 3000; // 提前3秒，给音符足够的下落时间
    const targetTime = gameTime + lookAheadTime;
    
    // 从上次处理的位置开始，添加新音符到队列
    // 但是要确保不会在游戏开始时立即添加大量音符
    while (lastProcessedNoteIndex < currentSong.notes.length) {
        const noteData = currentSong.notes[lastProcessedNoteIndex];
        // 只有当音符的生成时间到了才加入队列
        const noteSpawnTime = noteData.time - 3000; // 音符应该在播放前3秒生成
        // 为了避免游戏开始时立即生成音符，给所有音符添加一个最小延迟
        // 但是对于第一个音符，不应该有延迟，以确保连击逻辑正确
        const minDelay = lastProcessedNoteIndex === 0 ? 0 : 500; // 第一个音符无延迟，其他音符最少等待0.5秒
        const adjustedSpawnTime = Math.max(minDelay, noteSpawnTime);
        const shouldAddToQueue = gameTime >= adjustedSpawnTime && noteData.time <= targetTime;
        
        if (shouldAddToQueue) {
            // 检查是否已经在队列中
            const alreadyQueued = noteQueue.some(queuedNote => 
                queuedNote.note === noteData.note && 
                Math.abs(queuedNote.time - noteData.time) < 5
            );
            
            if (!alreadyQueued) {
                noteQueue.push({
                    note: noteData.note,
                    time: noteData.time,
                    spawned: false,
                    index: lastProcessedNoteIndex
                });
            }
            lastProcessedNoteIndex++;
        } else if (noteData.time > targetTime) {
            break; // 后面的音符时间更晚，暂时不需要处理
        } else {
            lastProcessedNoteIndex++; // 跳过这个音符，继续检查下一个
        }
    }
    
    // 生成下落音符
    noteQueue.forEach(queuedNote => {
        if (!queuedNote.spawned) {
            // 由于在添加到队列时已经控制了时机，这里直接生成即可
            const fallingNote = createFallingNote(queuedNote.note, currentTime, queuedNote.index);
            if (fallingNote) {
                fallingNotes.push(fallingNote);
                queuedNote.spawned = true;
            }
        }
    });
    
    // 清理已生成的音符队列项
    noteQueue = noteQueue.filter(queuedNote => !queuedNote.spawned || (gameTime < queuedNote.time + 1000));
    
    // 更新下落音符
    updateFallingNotes(currentTime);
    
    // 检查游戏是否结束
    if (gameTime > currentSong.duration + 2000) {
        endGame();
        return;
    }
    
    gameAnimationId = requestAnimationFrame(gameLoop);
}

// 结束游戏
function endGame() {
    gameState = 'ended';
    if (gameAnimationId) {
        cancelAnimationFrame(gameAnimationId);
        gameAnimationId = null;
    }
    
    // 清理所有剩余的下落音符
    fallingNotes.forEach(note => {
        if (note.element && note.element.parentNode) {
            note.element.parentNode.removeChild(note.element);
        }
    });
    fallingNotes = [];
    
    // 清理音符队列
    noteQueue = [];
    
    // 显示结算界面
    showGameResult();
}

// 显示游戏结果界面
function showGameResult() {
    const accuracy = totalNotes > 0 ? (hitNotes / totalNotes * 100).toFixed(1) : 0;
    const finalScoreValue = Math.floor(score);
    
    // 计算评级
    const grade = calculateGrade(parseFloat(accuracy));
    
    // 更新结算界面数据
    document.getElementById('finalScore').textContent = finalScoreValue;
    document.getElementById('finalAccuracy').textContent = accuracy + '%';
    document.getElementById('finalMaxCombo').textContent = maxCombo;
    document.getElementById('finalHitNotes').textContent = hitNotes;
    document.getElementById('finalTotalNotes').textContent = totalNotes;
    document.getElementById('finalDifficulty').textContent = difficultySettings[currentDifficulty].name;
    
    const gradeElement = document.getElementById('finalGrade');
    gradeElement.textContent = grade;
    gradeElement.className = 'grade-value ' + grade;
    
    // 显示结算界面
    document.getElementById('gameResultOverlay').style.display = 'flex';
}

// 计算评级
function calculateGrade(accuracy) {
    if (accuracy >= 95) return 'S';
    if (accuracy >= 85) return 'A';
    if (accuracy >= 70) return 'B';
    if (accuracy >= 50) return 'C';
    return 'D';
}

// 重试游戏
function retryGame() {
    // 隐藏结算界面
    document.getElementById('gameResultOverlay').style.display = 'none';
    
    // 获取当前选择的歌曲
    const selectedSong = document.getElementById('songSelect').value;
    
    // 重新开始游戏
    startGame(selectedSong);
}

// 返回菜单
function backToMenu() {
    // 隐藏结算界面
    document.getElementById('gameResultOverlay').style.display = 'none';
    
    // 重置游戏状态
    gameState = 'menu';
    updateUI();
}

// 暂停/继续游戏
function togglePause() {
    if (gameState === 'playing') {
        gameState = 'paused';
        pauseStartTime = performance.now(); // 记录暂停开始时间
        if (gameAnimationId) {
            cancelAnimationFrame(gameAnimationId);
            gameAnimationId = null;
        }
    } else if (gameState === 'paused') {
        gameState = 'playing';
        // 调整开始时间以补偿暂停时间
        const pauseDuration = performance.now() - pauseStartTime;
        gameStartTime += pauseDuration; // 将暂停时长加到游戏开始时间上
        gameLoop();
    }
    updateUI();
}

// 停止游戏
function stopGame() {
    gameState = 'menu';
    if (gameAnimationId) {
        cancelAnimationFrame(gameAnimationId);
        gameAnimationId = null;
    }
    
    // 清理
    fallingNotes = [];
    document.querySelectorAll('.falling-note, .judgment').forEach(el => el.remove());
    document.querySelectorAll('.key.active').forEach(key => key.classList.remove('active'));
    
    updateUI();
}

// 切换自由弹奏模式
function toggleFreePlay() {
    if (gameState === 'freeplay') {
        gameState = 'menu';
    } else {
        // 停止当前游戏
        if (gameState === 'playing' || gameState === 'paused') {
            stopGame();
        }
        gameState = 'freeplay';
        // 清理游戏元素
        document.querySelectorAll('.falling-note, .judgment').forEach(el => el.remove());
    }
    updateUI();
}

// 更新UI
function updateUI() {
    // 更新得分显示
    const scoreElement = document.getElementById('score');
    if (scoreElement) {
        scoreElement.textContent = `得分: ${Math.floor(score)}`;
    }
    
    const comboElement = document.getElementById('combo');
    if (comboElement) {
        const multiplier = getComboMultiplier(combo);
        const multiplierText = multiplier > 1.0 ? ` (${multiplier}x)` : '';
        comboElement.textContent = `连击: ${combo}${multiplierText}`;
    }
    
    // 更新连击阶段提示
    const comboStageElement = document.getElementById('comboStage');
    const comboStageText = comboStageElement?.querySelector('.combo-stage-text');
    
    if (comboStageElement && comboStageText) {
        const stageInfo = getComboStageInfo(combo);
        if (stageInfo) {
            comboStageElement.style.display = 'block';
            comboStageText.textContent = stageInfo;
        } else {
            comboStageElement.style.display = 'none';
        }
    }
    
    const accuracyElement = document.getElementById('accuracy');
    if (accuracyElement && totalNotes > 0) {
        const accuracy = (hitNotes / totalNotes * 100).toFixed(1);
        accuracyElement.textContent = `准确率: ${accuracy}%`;
    }
    
    // 更新按钮状态
    const playBtn = document.querySelector('.play-btn');
    const pauseBtn = document.querySelector('.pause-btn');
    const stopBtn = document.querySelector('.stop-btn');
    const freePlayBtn = document.querySelector('.freeplay-btn');
    
    if (playBtn && pauseBtn && stopBtn && freePlayBtn) {
        if (gameState === 'menu' || gameState === 'ended') {
            playBtn.style.display = 'inline-block';
            pauseBtn.style.display = 'none';
            stopBtn.style.display = 'none';
            freePlayBtn.textContent = '🎹 自由弹奏';
        } else if (gameState === 'freeplay') {
            playBtn.style.display = 'inline-block';
            pauseBtn.style.display = 'none';
            stopBtn.style.display = 'none';
            freePlayBtn.textContent = '🎮 返回游戏';
        } else {
            playBtn.style.display = 'none';
            pauseBtn.style.display = 'inline-block';
            stopBtn.style.display = 'inline-block';
            pauseBtn.textContent = gameState === 'paused' ? '▶️ 继续' : '⏸️ 暂停';
            freePlayBtn.textContent = '🎹 自由弹奏';
        }
    }
    
    // 更新游戏信息显示
    const gameInfo = document.querySelector('.game-info');
    if (gameInfo) {
        if (gameState === 'freeplay' || gameState === 'menu') {
            gameInfo.style.display = 'none';
        } else {
            gameInfo.style.display = 'block';
        }
    }
}

// 更新音符标签显示
function updateKeyLabels() {
    const labels = document.querySelectorAll('.key-label');
    labels.forEach(label => {
        label.style.display = showKeyLabels ? 'block' : 'none';
    });
}

// 更新键盘提示显示
function updateKeyboardHints() {
    const hints = document.querySelectorAll('.keyboard-hint');
    hints.forEach(hint => {
        hint.style.display = showKeyboardHints ? 'block' : 'none';
    });
}

// 音量控制
function updateVolume(value) {
    volume = value / 100;
    if (masterGain) {
        masterGain.gain.value = volume;
    }
}

// 页面加载完成后初始化
document.addEventListener('DOMContentLoaded', function() {
    initAudio();
    createPiano();
    updateUI();
    
    // 键盘事件监听
    document.addEventListener('keydown', function(e) {
        const note = keyMap[e.key.toLowerCase()];
        if (note && !e.repeat) {
            handleKeyPress(note);
        }
        
        // 空格键暂停/继续
        if (e.code === 'Space' && gameState !== 'menu') {
            e.preventDefault();
            togglePause();
        }
    });
    
    // 添加keyup事件处理
    document.addEventListener('keyup', function(e) {
        const note = keyMap[e.key.toLowerCase()];
        if (note) {
            handleKeyRelease(note);
        }
    });
    
    // 音量滑块事件
    const volumeSlider = document.getElementById('volumeSlider');
    if (volumeSlider) {
        volumeSlider.addEventListener('input', function(e) {
            updateVolume(e.target.value);
        });
    }
    
    // 防止右键菜单
    document.addEventListener('contextmenu', function(e) {
        e.preventDefault();
    });
    
    // 点击激活音频上下文
    document.addEventListener('click', function() {
        if (audioContext && audioContext.state === 'suspended') {
            audioContext.resume();
        }
    }, { once: true });
});

// 导出函数供HTML调用
window.startGame = startGame;
window.togglePause = togglePause;
window.stopGame = stopGame;
window.toggleFreePlay = toggleFreePlay;
window.showKeyLabels = showKeyLabels;
window.updateKeyLabels = updateKeyLabels;
window.showKeyboardHints = showKeyboardHints;
window.updateKeyboardHints = updateKeyboardHints;
window.songLibrary = songLibrary;