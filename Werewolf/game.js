// 狼人杀游戏类
class WerewolfGame {
    constructor() {
        this.players = [];
        this.currentPhase = 'setup'; // setup, night, day, voting, end
        this.dayCount = 1;
        this.gameLog = [];
        this.votingResults = {};
        this.nightActions = {};
        this.isGameActive = false;
        
        // 角色配置 (9人标准局)
        this.roles = [
            { name: 'werewolf', displayName: '狼人', icon: '🐺', count: 3, team: 'werewolf' },
            { name: 'villager', displayName: '村民', icon: '👨', count: 3, team: 'village' },
            { name: 'seer', displayName: '预言家', icon: '🔮', count: 1, team: 'village' },
            { name: 'witch', displayName: '女巫', icon: '🧙‍♀️', count: 1, team: 'village' },
            { name: 'hunter', displayName: '猎人', icon: '🏹', count: 1, team: 'village' }
        ];
        
        this.initializeEventListeners();
    }
    

    

    

    



    



    
    // 初始化事件监听器
    initializeEventListeners() {
        document.getElementById('start-game').addEventListener('click', () => this.startGame());
        document.getElementById('confirm-role').addEventListener('click', () => this.confirmRole());
        document.getElementById('restart-game').addEventListener('click', () => this.confirmRestartGame());
        document.getElementById('restart-game-ingame').addEventListener('click', () => this.confirmRestartGame());
        
        // 角色选择切换事件
        document.querySelectorAll('input[name="role-choice"]').forEach(radio => {
            radio.addEventListener('change', () => this.toggleRoleSelection());
        });
        
        // 角色选项点击事件
        document.addEventListener('click', (e) => {
            if (e.target.closest('.role-option')) {
                this.selectRole(e.target.closest('.role-option'));
            }
        });
        
        // 角色卡片点击事件
        document.addEventListener('click', (e) => {
            if (e.target.closest('.role-card')) {
                this.revealRole();
            }
        });
        
        // 模态框关闭
        document.querySelector('.close').addEventListener('click', () => {
            document.getElementById('modal').style.display = 'none';
        });
    }
    
    // 切换角色选择界面
    toggleRoleSelection() {
        const roleChoice = document.querySelector('input[name="role-choice"]:checked').value;
        const roleOptions = document.getElementById('role-options');
        
        if (roleChoice === 'choose') {
            roleOptions.style.display = 'block';
        } else {
            roleOptions.style.display = 'none';
            // 清除之前的选择
            document.querySelectorAll('.role-option').forEach(option => {
                option.classList.remove('selected');
            });
            this.selectedRole = null;
        }
    }
    
    // 选择角色
    selectRole(roleElement) {
        // 清除之前的选择
        document.querySelectorAll('.role-option').forEach(option => {
            option.classList.remove('selected');
        });
        
        // 选中当前角色
        roleElement.classList.add('selected');
        this.selectedRole = roleElement.dataset.role;
    }
    
    // 开始游戏
    // 获取默认名字（按顺序选择）
    getDefaultName() {
        const defaultNames = [
            '神秘玩家', '匿名侠客', '路过的人', '新手村民', '游戏达人',
            '夜行者', '推理高手', '逻辑大师', '观察员', '策略家',
            '智者', '守护者', '探索者', '冒险家', '思考者'
        ];
        // 基于当前时间选择名字，确保每次游戏有一定变化但不是完全随机
        const timeIndex = Math.floor(Date.now() / 1000) % defaultNames.length;
        return defaultNames[timeIndex];
    }

    startGame() {
        const inputName = document.getElementById('player-name').value.trim();
        const playerName = inputName || this.getDefaultName();
        const roleChoice = document.querySelector('input[name="role-choice"]:checked').value;
        
        // 检查是否选择了自定义角色
        if (roleChoice === 'choose' && !this.selectedRole) {
            alert('请先选择一个角色！');
            return;
        }
        
        this.initializePlayers(playerName);
        this.assignRoles(roleChoice === 'choose' ? this.selectedRole : null);
        this.showScreen('role-screen');
        this.updateGameInfo('查看身份', this.dayCount);
    }
    
    // 初始化玩家
    initializePlayers(playerName) {
        this.players = [];
        
        // 创建所有玩家（包括真实玩家和AI玩家）
        const allNames = [playerName, '小明', '小红', '小刚', '小丽', '小华', '小芳', '小强', '小美'];
        
        for (let i = 0; i < 9; i++) {
            this.players.push({
                id: i + 1, // 玩家序号从1到9
                name: allNames[i],
                isAI: i !== 0, // 第一个是真实玩家，其余是AI
                role: null,
                isAlive: true,
                votedBy: [],
                hasVoted: false,
                position: i + 1, // 初始位置序号
                hasSpoken: false // 是否已发言
            });
        }
        
        // 随机分配位置
        this.shufflePlayerPositions();
        
        // 记录最后死亡的玩家位置（用于发言顺序）
        this.lastDeathPosition = null;
    }
    
    // 分配角色
    assignRoles(playerSelectedRole = null) {
        const rolePool = [];
        
        // 创建角色池
        this.roles.forEach(role => {
            for (let i = 0; i < role.count; i++) {
                rolePool.push(role);
            }
        });
        
        // 如果玩家选择了特定角色
        if (playerSelectedRole) {
            const playerRole = this.roles.find(r => r.name === playerSelectedRole);
            const realPlayer = this.players.find(p => !p.isAI);
            realPlayer.role = playerRole;
            
            // 从角色池中移除一个对应角色
            const roleIndex = rolePool.findIndex(r => r.name === playerSelectedRole);
            if (roleIndex !== -1) {
                rolePool.splice(roleIndex, 1);
            }
            
            // 为其他AI玩家随机分配剩余角色
            const shuffledRoles = this.shuffleArray([...rolePool]);
            const aiPlayers = this.players.filter(p => p.isAI);
            aiPlayers.forEach((player, index) => {
                player.role = shuffledRoles[index];
            });
        } else {
            // 随机分配角色
            const shuffledRoles = this.shuffleArray([...rolePool]);
            this.players.forEach((player, index) => {
                player.role = shuffledRoles[index];
            });
        }
        
        // 初始化女巫药剂状态
        this.witchPotions = {
            heal: true,  // 解药
            poison: true // 毒药
        };
        
        this.addLog(`游戏开始！共${this.players.length}名玩家参与。`);
    }
    
    // 显示角色
    revealRole() {
        const player = this.players.find(p => !p.isAI); // 真实玩家
        const roleCard = document.getElementById('player-role');
        
        roleCard.querySelector('.role-icon').textContent = player.role.icon;
        roleCard.querySelector('.role-name').textContent = player.role.displayName;
        roleCard.querySelector('.role-description').textContent = this.getRoleDescription(player.role.name);
        
        document.getElementById('confirm-role').style.display = 'block';
    }
    
    // 获取角色描述
    getRoleDescription(roleName) {
        const descriptions = {
            werewolf: '夜晚可以杀死一名玩家。与其他狼人一起行动，目标是消灭所有好人。',
            villager: '普通村民，没有特殊能力。白天通过投票找出狼人。',
            seer: '每晚可以查验一名玩家的身份（好人或狼人）。',
            witch: '拥有一瓶解药和一瓶毒药。解药可以救活被狼人杀死的玩家，毒药可以毒死一名玩家。',
            hunter: '被投票出局或被狼人杀死时，可以开枪带走一名玩家。'
        };
        return descriptions[roleName] || '未知角色';
    }
    
    // 确认角色
    confirmRole() {
        this.showScreen('game-screen');
        this.renderPlayers();
        this.startNightPhase();
    }
    
    // 随机分配玩家位置
    shufflePlayerPositions() {
        const positions = [1, 2, 3, 4, 5, 6, 7, 8, 9];
        const shuffledPositions = this.shuffleArray(positions);
        
        this.players.forEach((player, index) => {
            player.position = shuffledPositions[index];
        });
        
        // 按位置排序玩家数组
        this.players.sort((a, b) => a.position - b.position);
    }
    
    // 渲染玩家列表
    renderPlayers() {
        const playersLeft = document.querySelector('.players-left');
        const playersRight = document.querySelector('.players-right');
        
        playersLeft.innerHTML = '';
        playersRight.innerHTML = '';
        
        // 按位置排序的玩家
        const sortedPlayers = [...this.players].sort((a, b) => a.position - b.position);
        const realPlayer = this.players.find(p => !p.isAI);
        
        sortedPlayers.forEach((player, index) => {
            const playerCard = document.createElement('div');
            let cardClasses = `player-card ${player.isAlive ? 'alive' : 'dead'}`;
            
            // 如果真实玩家是狼人，为其他狼人添加队友特效
            if (realPlayer && realPlayer.role && realPlayer.role.name === 'werewolf' && 
                player.role && player.role.name === 'werewolf' && player.id !== realPlayer.id) {
                cardClasses += ' werewolf-teammate';
            }
            
            playerCard.className = cardClasses;
            playerCard.dataset.playerId = player.id;
            
            const werewolfLabel = realPlayer && realPlayer.role && realPlayer.role.name === 'werewolf' && player.role && player.role.name === 'werewolf' ? '<div class="werewolf-label">狼人</div>' : '';
            
            playerCard.innerHTML = `
                <div class="player-number">${player.position}</div>
                <div class="player-avatar">
                    ${player.isAlive ? '😊' : '💀'}
                    ${werewolfLabel}
                </div>
                <div class="player-name">${player.name}</div>
                <div class="player-status">${player.isAlive ? '存活' : '已死亡'}</div>
            `;
            
            // 左侧5名玩家（位置1-5），右侧4名玩家（位置6-9）
            if (index < 5) {
                playersLeft.appendChild(playerCard);
            } else {
                playersRight.appendChild(playerCard);
            }
        });
    }
    
    // 开始夜晚阶段
    startNightPhase() {
        this.currentPhase = 'night';
        this.updateGameInfo('夜晚', this.dayCount);
        
        document.getElementById('day-actions').style.display = 'none';
        document.getElementById('night-actions').style.display = 'block';
        
        // 重置夜晚行动
        this.nightActions = {
            kill: null,
            seer: null,
            heal: null,
            poison: null
        };
        
        this.addLog(`第${this.dayCount}天夜晚开始。`);
        
        // 执行夜晚行动
        setTimeout(() => {
            this.executeNightActions();
        }, 1000);
    }
    
    // 执行夜晚行动
    async executeNightActions() {
        // 首先执行AI行动，确保女巫能看到狼人的杀人目标
        this.executeAIActions();
        
        const player = this.players.find(p => !p.isAI);
        const actionContent = document.getElementById('night-action-content');
        
        if (!player.isAlive) {
            actionContent.innerHTML = '<p>您已死亡，无法行动。</p>';
            await this.delay(800); // 减少死亡玩家等待时间
            this.processNightResults();
            return;
        }
        
        switch (player.role.name) {
            case 'werewolf':
                await this.werewolfAction();
                break;
            case 'seer':
                await this.seerAction();
                break;
            case 'witch':
                console.log('用户玩家是女巫，开始女巫行动');
                await this.witchAction();
                break;
            case 'hunter':
            case 'villager':
            default:
                actionContent.innerHTML = '<p>夜晚无特殊行动，请等待...</p>';
                await this.delay(500); // 进一步缩短等待时间
                break;
        }
        
        // 快速处理夜晚结果
        this.processNightResults();
    }
    
    // 女巫选择行动
    selectWitchAction(action) {
        console.log('女巫选择行动:', action);
        if (this.witchSelectAction) {
            this.witchSelectAction(action);
        } else {
            console.error('witchSelectAction 函数未定义');
        }
    }

    // 女巫选择毒人目标
    selectPoisonTarget(targetId) {
        console.log('女巫选择毒人目标:', targetId);
        if (this.witchSelectTarget) {
            this.witchSelectTarget(targetId);
        } else {
            console.error('witchSelectTarget 函数未定义');
        }
    }
    
    // 女巫确认行动
    confirmWitchAction() {
        console.log('女巫确认行动');
        if (this.witchConfirmAction) {
            this.witchConfirmAction();
        } else {
            console.error('witchConfirmAction 函数未定义');
        }
    }
    
    // 女巫取消行动
    cancelWitchAction() {
        console.log('女巫取消行动');
        if (this.witchCancelAction) {
            this.witchCancelAction();
        } else {
            console.error('witchCancelAction 函数未定义');
        }
    }
    
    // 女巫返回主菜单
    backToWitchMenu() {
        console.log('女巫返回主菜单');
        if (this.witchBackToMenu) {
            this.witchBackToMenu();
        } else {
            console.error('witchBackToMenu 函数未定义');
        }
    }
    
    // 保留原有方法以兼容性（已废弃）
    witchHeal() {
        this.selectWitchAction('heal');
        setTimeout(() => this.confirmWitchAction(), 100);
    }
    
    showPoisonTargets() {
        this.selectWitchAction('poison');
    }
    
    witchPoison(targetId) {
        this.selectPoisonTarget(targetId);
        setTimeout(() => this.confirmWitchAction(), 100);
    }
    
    witchSkip() {
        this.selectWitchAction('skip');
        setTimeout(() => this.confirmWitchAction(), 100);
    }
    
    // AI玩家行动
    executeAIActions() {
        const werewolves = this.players.filter(p => p.isAI && p.isAlive && p.role.name === 'werewolf');
        const seer = this.players.find(p => p.isAI && p.isAlive && p.role.name === 'seer');
        const witch = this.players.find(p => p.isAI && p.isAlive && p.role.name === 'witch');
        const userPlayer = this.players.find(p => !p.isAI);
        
        // AI狼人智能选择目标
        if (werewolves.length > 0 && !this.nightActions.kill) {
            console.log('AI狼人开始选择目标');
            const target = this.determineWolfKillTarget(werewolves);
            if (target) {
                this.nightActions.kill = target.id;
                console.log('AI狼人选择目标:', target.name, '目标ID:', target.id);
            } else {
                console.log('AI狼人未找到合适目标');
            }
        } else {
            console.log('狼人目标选择跳过 - 狼人数量:', werewolves.length, '已有目标:', this.nightActions.kill);
        }
        
        // AI预言家查验
        if (seer && !this.nightActions.seer) {
            const targets = this.players.filter(p => p.isAlive && p.id !== seer.id);
            if (targets.length > 0) {
                const optimalTarget = this.determineSeerTarget(seer, targets);
                this.nightActions.seer = optimalTarget.id;
            }
        }
        
        // AI女巫使用药剂（只有当用户不是女巫时才执行）
        if (witch && this.witchPotions && userPlayer && userPlayer.role.name !== 'witch') {
            console.log('执行AI女巫策略');
            this.executeWitchStrategy(witch);
        } else if (userPlayer && userPlayer.role.name === 'witch') {
            console.log('用户是女巫，跳过AI女巫策略');
        }
    }
    
    // 狼人行动
    async werewolfAction() {
        const actionContent = document.getElementById('night-action-content');
        const alivePlayers = this.players.filter(p => p.isAlive);
        const werewolves = this.players.filter(p => p.role.name === 'werewolf');
        
        if (alivePlayers.length === 0) {
            actionContent.innerHTML = '<p>没有可以杀死的目标。</p>';
            await this.delay(1000); // 减少无目标时的延迟
            return;
        }
        
        return new Promise((resolve) => {
            let timeLeft = 30; // 30秒选择时间
            let selectedTarget = null;
            
            const updateDisplay = () => {
                actionContent.innerHTML = `
                    <p>选择要杀死的玩家（剩余时间：${timeLeft}秒）：</p>
                    <div class="target-selection">
                        ${alivePlayers.map(p => {
                            const isWerewolf = p.role.name === 'werewolf';
                            const buttonClass = isWerewolf ? 'btn btn-warning' : 'btn btn-danger';
                            const werewolfLabel = isWerewolf ? ' <span style="color: #ff6b6b; font-size: 12px;">[狼人]</span>' : '';
                            const selectedClass = selectedTarget === p.id ? ' selected' : '';
                            return `<button class="${buttonClass}${selectedClass}" onclick="game.selectKillTarget(${p.id})">${p.name}${werewolfLabel}</button>`;
                        }).join('')}
                    </div>
                    ${selectedTarget ? `
                        <div class="action-buttons" style="margin-top: 15px;">
                            <button class="btn btn-success" onclick="game.confirmKillTarget()">确定</button>
                            <button class="btn btn-secondary" onclick="game.cancelKillTarget()">取消</button>
                        </div>
                    ` : ''}
                    <div class="time-warning" style="margin-top: 10px; color: #ff6b6b;">
                        ${timeLeft <= 10 ? '请尽快选择！' : ''}
                    </div>
                    <div style="margin-top: 10px; color: #ffd700; font-size: 14px;">
                        <p>狼人队友：${werewolves.filter(w => w.isAlive).map(w => w.name).join('、')}</p>
                        <p style="color: #ff9999; font-size: 12px;">提示：可以选择狼人队友进行自刀操作</p>
                    </div>
                `;
            };
            
            updateDisplay();
            
            const timer = setInterval(() => {
                timeLeft--;
                updateDisplay();
                
                if (timeLeft <= 0) {
                    clearInterval(timer);
                    if (!this.nightActions.kill) {
                        // 时间到了还没选择，选择威胁最大的目标
                        const priorityTarget = alivePlayers.find(p => p.claimedRole === 'seer') || 
                                              alivePlayers.find(p => p.claimedRole === 'witch') || 
                                              alivePlayers.find(p => p.claimedRole === 'hunter') || 
                                              alivePlayers[0];
                        this.nightActions.kill = priorityTarget.id;
                        actionContent.innerHTML = `<p>时间到！自动选择了 ${priorityTarget.name}</p>`;
                    }
                    setTimeout(resolve, 300); // 减少女巫行动超时延迟
                }
            }, 1000);
            
            // 存储resolve函数和选择目标
            this.werewolfActionResolve = () => {
                clearInterval(timer);
                resolve();
            };
            
            this.werewolfSelectedTarget = (targetId) => {
                selectedTarget = targetId;
                updateDisplay();
            };
            
            this.werewolfConfirmTarget = () => {
                if (selectedTarget) {
                    this.nightActions.kill = selectedTarget;
                    const target = this.players.find(p => p.id === selectedTarget);
                    actionContent.innerHTML = `<p>已确认杀死 ${target.name}，等待其他玩家行动...</p>`;
                    this.werewolfActionResolve();
                }
            };
            
            this.werewolfCancelTarget = () => {
                selectedTarget = null;
                updateDisplay();
            };
        });
    }
    
    // 选择杀死目标
    selectKillTarget(targetId) {
        if (this.werewolfSelectedTarget) {
            this.werewolfSelectedTarget(targetId);
        }
    }
    
    // 确认杀死目标
    confirmKillTarget() {
        if (this.werewolfConfirmTarget) {
            this.werewolfConfirmTarget();
        }
    }
    
    // 取消选择杀死目标
    cancelKillTarget() {
        if (this.werewolfCancelTarget) {
            this.werewolfCancelTarget();
        }
    }
    
    // 预言家行动
    async seerAction() {
        const actionContent = document.getElementById('night-action-content');
        const realPlayer = this.players.find(p => !p.isAI);
        const alivePlayers = this.players.filter(p => p.isAlive && p.id !== realPlayer.id);
        
        if (alivePlayers.length === 0) {
            actionContent.innerHTML = '<p>没有可以查验的目标。</p>';
            await this.delay(1000); // 减少无目标时的延迟
            return;
        }
        
        return new Promise((resolve) => {
            let timeLeft = 25; // 25秒选择时间
            let selectedTarget = null;
            
            const updateDisplay = () => {
                actionContent.innerHTML = `
                    <p>选择要查验的玩家（剩余时间：${timeLeft}秒）：</p>
                    <div class="target-selection">
                        ${alivePlayers.map(p => {
                            const selectedClass = selectedTarget === p.id ? ' selected' : '';
                            return `<button class="btn btn-secondary${selectedClass}" onclick="game.selectSeerTarget(${p.id})">${p.name}</button>`;
                        }).join('')}
                    </div>
                    ${selectedTarget ? `
                        <div class="action-buttons" style="margin-top: 15px;">
                            <button class="btn btn-success" onclick="game.confirmSeerTarget()">确定</button>
                            <button class="btn btn-secondary" onclick="game.cancelSeerTarget()">取消</button>
                        </div>
                    ` : ''}
                    <div class="time-warning" style="margin-top: 10px; color: #ff6b6b;">
                        ${timeLeft <= 10 ? '请尽快选择！' : ''}
                    </div>
                `;
            };
            
            updateDisplay();
            
            const timer = setInterval(() => {
                timeLeft--;
                updateDisplay();
                
                if (timeLeft <= 0) {
                    clearInterval(timer);
                    if (!this.nightActions.seer) {
                        // 时间到了还没选择，智能选择一个目标
                        const seer = this.players.find(p => p.role.name === 'seer' && p.isAlive);
                        const optimalTarget = this.determineSeerTarget(seer, alivePlayers);
                        this.nightActions.seer = optimalTarget.id;
                        const isWerewolf = optimalTarget.role.team === 'werewolf';
                        
                        // 为自动查验目标添加特效
                        this.addSeerEffect(optimalTarget.id, isWerewolf);
                        
                        actionContent.innerHTML = `
                            <p>时间到！自动查验了 ${optimalTarget.name}</p>
                            <div class="seer-result">
                                <strong>${optimalTarget.name}</strong> 是 <span style="color: ${isWerewolf ? '#ff6b6b' : '#00b894'}">
                                    ${isWerewolf ? '狼人' : '好人'}
                                </span>
                            </div>
                        `;
                    }
                    setTimeout(resolve, 1000); // 减少预言家超时延迟
                }
            }, 1000);
            
            // 存储resolve函数和选择目标
            this.seerActionResolve = () => {
                clearInterval(timer);
                setTimeout(resolve, 1000); // 减少预言家结果显示延迟
            };
            
            this.seerSelectedTarget = (targetId) => {
                selectedTarget = targetId;
                updateDisplay();
            };
            
            this.seerConfirmTarget = () => {
                if (selectedTarget) {
                    const target = this.players.find(p => p.id === selectedTarget);
                    const isWerewolf = target.role.team === 'werewolf';
                    
                    this.nightActions.seer = selectedTarget;
                    
                    // 为查验目标添加特效
                    this.addSeerEffect(selectedTarget, isWerewolf);
                    
                    actionContent.innerHTML = `
                        <p>查验结果：</p>
                        <div class="seer-result">
                            <strong>${target.name}</strong> 是 <span style="color: ${isWerewolf ? '#ff6b6b' : '#00b894'}">
                                ${isWerewolf ? '狼人' : '好人'}
                            </span>
                        </div>
                    `;
                    
                    this.seerActionResolve();
                }
            };
            
            this.seerCancelTarget = () => {
                selectedTarget = null;
                updateDisplay();
            };
        });
    }
    
    // 选择查验目标
    selectSeerTarget(targetId) {
        if (this.seerSelectedTarget) {
            this.seerSelectedTarget(targetId);
        }
    }
    
    // 确认查验目标
    confirmSeerTarget() {
        if (this.seerConfirmTarget) {
            this.seerConfirmTarget();
        }
    }
    
    // 取消选择查验目标
    cancelSeerTarget() {
        if (this.seerCancelTarget) {
            this.seerCancelTarget();
        }
    }
    
    // 添加预言家查验特效
    addSeerEffect(targetId, isWerewolf) {
        const targetCard = document.querySelector(`[data-player-id="${targetId}"]`);
        
        // 添加身份标识
        if (targetCard) {
            // 移除之前的身份标识
            const existingBadge = targetCard.querySelector('.identity-badge');
            if (existingBadge) {
                existingBadge.remove();
            }
            
            // 添加新的身份标识
            const identityBadge = document.createElement('div');
            identityBadge.className = 'identity-badge';
            identityBadge.innerHTML = isWerewolf ? '🐺' : '👤';
            identityBadge.title = isWerewolf ? '狼人' : '好人';
            identityBadge.style.cssText = `
                position: absolute;
                top: 5px;
                right: 5px;
                background: ${isWerewolf ? '#ff6b6b' : '#00b894'};
                color: white;
                border-radius: 50%;
                width: 25px;
                height: 25px;
                display: flex;
                align-items: center;
                justify-content: center;
                font-size: 12px;
                z-index: 10;
                box-shadow: 0 2px 4px rgba(0,0,0,0.3);
            `;
            
            targetCard.style.position = 'relative';
            targetCard.appendChild(identityBadge);
            
            // 移除之前的特效
            targetCard.classList.remove('seer-good', 'seer-evil');
            
            // 添加新的特效（永久保留）
            const effectClass = isWerewolf ? 'seer-evil' : 'seer-good';
            targetCard.classList.add(effectClass);
            
            // 身份标识和特效将永久保留，不会自动移除
        } else {
            console.error('Target card not found for player ID:', targetId);
        }
    }
    
    // 女巫行动
    async witchAction() {
        console.log('女巫行动函数开始执行');
        const actionContent = document.getElementById('night-action-content');
        console.log('获取到 night-action-content 元素:', actionContent);
        
        // 确保女巫药剂状态存在（通常在游戏开始时已初始化）
        if (!this.witchPotions) {
            this.witchPotions = {
                heal: true,  // 解药
                poison: true // 毒药
            };
        }
        
        return new Promise((resolve) => {
            let timeLeft = 30; // 30秒选择时间
            let selectedAction = null; // 'heal', 'poison', 'skip'
            let selectedTarget = null;
            const killedPlayer = this.nightActions.kill ? this.players.find(p => p.id === this.nightActions.kill) : null;
            const alivePlayers = this.players.filter(p => p.isAlive && p.role.name !== 'witch');
            
            console.log('女巫药剂状态:', this.witchPotions);
            console.log('今晚被杀玩家:', killedPlayer ? killedPlayer.name : '无');
            console.log('夜晚行动状态:', this.nightActions);
            
            const updateDisplay = () => {
                if (selectedAction === 'poison') {
                    // 显示毒人目标选择
                    actionContent.innerHTML = `
                        <p>选择要毒死的玩家（剩余时间：${timeLeft}秒）：</p>
                        <div class="target-selection">
                            ${alivePlayers.map(p => {
                                const selectedClass = selectedTarget === p.id ? ' selected' : '';
                                return `<button class="btn btn-danger${selectedClass}" onclick="game.selectPoisonTarget(${p.id})">${p.name}</button>`;
                            }).join('')}
                        </div>
                        ${selectedTarget ? `
                            <div class="action-buttons" style="margin-top: 15px;">
                                <button class="btn btn-success" onclick="game.confirmWitchAction()">确定</button>
                                <button class="btn btn-secondary" onclick="game.cancelWitchAction()">取消</button>
                            </div>
                        ` : ''}
                        <div class="action-buttons" style="margin-top: 15px;">
                            <button class="btn btn-secondary" onclick="game.backToWitchMenu()">返回</button>
                        </div>
                    `;
                } else {
                    // 显示主菜单
                    let options = [];
                    
                    // 救人选项
                    if (this.witchPotions.heal && killedPlayer) {
                        const selectedClass = selectedAction === 'heal' ? ' selected' : '';
                        options.push(`<button class="btn btn-success${selectedClass}" onclick="game.selectWitchAction('heal')">使用解药救 ${killedPlayer.name}</button>`);
                    }
                    
                    // 毒人选项
                    if (this.witchPotions.poison && alivePlayers.length > 0) {
                        const selectedClass = selectedAction === 'poison' ? ' selected' : '';
                        options.push(`<button class="btn btn-danger${selectedClass}" onclick="game.selectWitchAction('poison')">使用毒药</button>`);
                    }
                    
                    // 不行动选项
                    const selectedClass = selectedAction === 'skip' ? ' selected' : '';
                    options.push(`<button class="btn btn-secondary${selectedClass}" onclick="game.selectWitchAction('skip')">不使用药剂</button>`);
                    
                    actionContent.innerHTML = `
                        <p>女巫行动（剩余时间：${timeLeft}秒）：</p>
                        <div class="witch-status">
                            <p>药剂状态：解药${this.witchPotions.heal ? '✓' : '✗'} 毒药${this.witchPotions.poison ? '✓' : '✗'}</p>
                            ${killedPlayer ? `<p style="color: #ff6b6b;">今晚 ${killedPlayer.name} 被杀</p>` : '<p>今晚无人被杀</p>'}
                        </div>
                        <div class="target-selection">
                            ${options.join('')}
                        </div>
                        ${selectedAction && selectedAction !== 'poison' ? `
                            <div class="action-buttons" style="margin-top: 15px;">
                                <button class="btn btn-success" onclick="game.confirmWitchAction()">确定</button>
                                <button class="btn btn-secondary" onclick="game.cancelWitchAction()">取消</button>
                            </div>
                        ` : ''}
                        <div class="time-warning" style="margin-top: 10px; color: #ff6b6b;">
                            ${timeLeft <= 10 ? '请尽快选择！' : ''}
                        </div>
                    `;
                }
            };
            
            updateDisplay();
            
            const timer = setInterval(() => {
                timeLeft--;
                updateDisplay();
                
                if (timeLeft <= 0) {
                    clearInterval(timer);
                    actionContent.innerHTML = '<p>时间到！女巫选择不使用药剂</p>';
                    setTimeout(resolve, 300); // 减少女巫超时延迟
                }
            }, 1000);
            
            // 存储resolve函数和选择逻辑
            this.witchActionResolve = () => {
                clearInterval(timer);
                resolve();
            };
            
            this.witchSelectAction = (action) => {
                selectedAction = action;
                if (action === 'poison') {
                    selectedTarget = null;
                }
                updateDisplay();
            };
            
            this.witchSelectTarget = (targetId) => {
                selectedTarget = targetId;
                updateDisplay();
            };
            
            this.witchConfirmAction = () => {
                if (selectedAction === 'heal') {
                    this.nightActions.heal = this.nightActions.kill;
                    this.witchPotions.heal = false;
                    const healedPlayer = this.players.find(p => p.id === this.nightActions.kill);
                    actionContent.innerHTML = `<p>已使用解药救了 ${healedPlayer.name}</p>`;
                } else if (selectedAction === 'poison' && selectedTarget) {
                    this.nightActions.poison = selectedTarget;
                    this.witchPotions.poison = false;
                    const poisonedPlayer = this.players.find(p => p.id === selectedTarget);
                    actionContent.innerHTML = `<p>已使用毒药毒死 ${poisonedPlayer.name}</p>`;
                } else if (selectedAction === 'skip') {
                    actionContent.innerHTML = '<p>女巫选择不使用药剂</p>';
                }
                
                setTimeout(() => this.witchActionResolve(), 300); // 减少女巫确认行动延迟
            };
            
            this.witchCancelAction = () => {
                selectedAction = null;
                selectedTarget = null;
                updateDisplay();
            };
            
            this.witchBackToMenu = () => {
                selectedAction = null;
                selectedTarget = null;
                updateDisplay();
            };
        });
    }
    

    
    // 智能身份声明策略
    shouldClaimWitch(aiPlayer) {
        // 基于游戏局势和威胁度决定是否声明女巫身份
        const aliveWolves = this.players.filter(p => p.isAlive && p.role.team === 'werewolf').length;
        const aliveVillagers = this.players.filter(p => p.isAlive && p.role.team !== 'werewolf').length;
        const suspicion = this.calculateSuspicion(aiPlayer, aiPlayer);
        
        // 局势紧张或被高度怀疑时更倾向于声明身份
        if (aliveVillagers <= aliveWolves + 1) {
            return true; // 局势紧张，需要声明身份
        }
        
        if (suspicion > 7) {
            return true; // 被高度怀疑，需要自证
        }
        
        if (this.day >= 3) {
            return true; // 后期更倾向于声明身份
        }
        
        return false; // 保持低调
    }
    
    selectOptimalIdentityClaim(aiPlayer, claims, roleType) {
        // 基于游戏情况选择最合适的身份声明话术
        const aliveWolves = this.players.filter(p => p.isAlive && p.role.team === 'werewolf').length;
        const aliveVillagers = this.players.filter(p => p.isAlive && p.role.team !== 'werewolf').length;
        const suspicion = this.calculateSuspicion(aiPlayer, aiPlayer);
        
        let selectedIndex = 0;
        
        if (aliveVillagers <= aliveWolves + 1) {
            // 局势紧张，选择更紧急的话术
            selectedIndex = 0;
        } else if (suspicion > 7) {
            // 被高度怀疑，选择自证的话术
            selectedIndex = 1;
        } else {
            // 正常情况，选择稳重的话术
            selectedIndex = Math.min(2, claims.length - 1);
        }
        
        return claims[selectedIndex] || claims[0];
    }
    
    // 猎人智能开枪策略
    determineHunterTarget(hunter, targets) {
        const priorities = [];
        
        targets.forEach(target => {
            let priority = 0;
            let reasons = [];
            
            // 1. 优先开枪狼人
            if (target.role.team === 'werewolf') {
                priority += 100;
                reasons.push('确认狼人');
            } else {
                // 基于怀疑度开枪
                const suspicion = this.calculateSuspicion(hunter, target);
                if (suspicion > 8) {
                    priority += 80;
                    reasons.push('高度可疑');
                } else if (suspicion > 6) {
                    priority += 60;
                    reasons.push('中度可疑');
                } else if (suspicion > 4) {
                    priority += 40;
                    reasons.push('轻度可疑');
                } else {
                    priority -= 30;
                    reasons.push('怀疑度低');
                }
            }
            
            // 2. 避免误伤神职
            if (target.role.team !== 'werewolf') {
                if (target.role.name === 'seer') {
                    priority -= 80;
                    reasons.push('疑似预言家');
                } else if (target.role.name === 'witch') {
                    priority -= 60;
                    reasons.push('疑似女巫');
                } else if (target.role.name === 'villager') {
                    priority -= 20;
                    reasons.push('疑似村民');
                }
            }
            
            // 3. 游戏局势考虑
            const aliveWolves = this.players.filter(p => p.isAlive && p.role.team === 'werewolf').length;
            const aliveVillagers = this.players.filter(p => p.isAlive && p.role.team !== 'werewolf').length;
            
            if (aliveVillagers <= aliveWolves + 1) {
                // 局势紧张，更倾向于开枪可疑目标
                priority += 30;
                reasons.push('局势紧张');
            }
            
            // 4. 威胁度评估
            if (this.isPlayerThreatening(target)) {
                priority += 25;
                reasons.push('威胁较大');
            }
            
            // 5. 位置策略
            if (target.position <= 3) {
                priority += 15;
                reasons.push('前置位影响大');
            }
            
            // 6. 投票行为分析
            if (target.role.team === 'werewolf') {
                // 如果是狼人，分析其投票行为
                priority += 20;
                reasons.push('投票可疑');
            }
            
            priorities.push({
                target: target,
                priority: priority,
                reasons: reasons
            });
        });
        
        // 选择最优开枪目标
        priorities.sort((a, b) => b.priority - a.priority);
        
        if (priorities.length > 0) {
            const chosen = priorities[0];
            // 如果最高优先级太低，选择威胁最大的目标
            if (chosen.priority < 30) {
                const gameData = {
                    aliveWerewolves: werewolves.length,
                    dayNumber: this.dayCount,
                    alivePlayers: this.players.filter(p => p.isAlive)
                };
                const mostThreatening = targets.reduce((most, target) => 
                    this.calculateThreatLevel(target, gameData) > this.calculateThreatLevel(most, gameData) ? target : most
                );
                return {
                    target: mostThreatening,
                    reasons: ['兜底选择威胁最大']
                };
            }
            return chosen;
        }
        
        // 最终兜底：选择第一个目标
        return {
            target: targets[0],
            reasons: ['无明确目标']
        };
    }
    
    // AI女巫智能药剂策略
    executeWitchStrategy(witch) {
        const killedPlayer = this.nightActions.kill ? this.players.find(p => p.id === this.nightActions.kill) : null;
        const alivePlayers = this.players.filter(p => p.isAlive && p.id !== witch.id);
        
        // 1. 解药决策
        if (this.witchPotions.heal && killedPlayer && !this.nightActions.heal) {
            const shouldHeal = this.shouldWitchHeal(witch, killedPlayer);
            if (shouldHeal.decision) {
                this.nightActions.heal = this.nightActions.kill;
                this.witchPotions.heal = false;
                this.addLog(`女巫${witch.name}逻辑救人${killedPlayer.name}（${shouldHeal.reasons.join('，')}）`, 'strategy');
                return; // 使用解药后不再使用毒药
            }
        }
        
        // 2. 毒药决策
        if (this.witchPotions.poison && !this.nightActions.poison) {
            const poisonTarget = this.determinePoisonTarget(witch, alivePlayers);
            if (poisonTarget) {
                this.nightActions.poison = poisonTarget.target.id;
                this.witchPotions.poison = false;
                this.addLog(`女巫${witch.name}逻辑毒人${poisonTarget.target.name}（${poisonTarget.reasons.join('，')}）`, 'strategy');
            }
        }
    }
    
    // 女巫解药决策逻辑
    shouldWitchHeal(witch, killedPlayer) {
        const reasons = [];
        let score = 0;
        
        // 1. 身份价值评估
        if (killedPlayer.role.name === 'seer') {
            score += 90;
            reasons.push('救预言家');
        } else if (killedPlayer.role.name === 'hunter') {
            score += 70;
            reasons.push('救猎人');
        } else if (killedPlayer.role.name === 'villager') {
            score += 30;
            reasons.push('救村民');
        }
        
        // 2. 游戏阶段考虑
        if (this.day === 1) {
            // 第一夜：更倾向于救人
            score += 20;
            reasons.push('首夜保守');
        } else if (this.day >= 3) {
            // 后期：根据局势决定
            const aliveWolves = this.players.filter(p => p.isAlive && p.role.team === 'werewolf').length;
            const aliveVillagers = this.players.filter(p => p.isAlive && p.role.team !== 'werewolf').length;
            
            if (aliveVillagers <= aliveWolves + 1) {
                score += 40;
                reasons.push('局势紧张');
            }
        }
        
        // 3. 自保考虑
        if (killedPlayer.id === witch.id) {
            score += 100;
            reasons.push('自救');
        }
        
        // 4. 威胁度评估
        if (this.isPlayerThreatening(killedPlayer)) {
            score += 25;
            reasons.push('威胁较大');
        }
        
        // 5. 位置影响
        if (killedPlayer.position <= 3) {
            score += 15;
            reasons.push('前置位重要');
        }
        
        return {
            decision: score >= 60,
            score: score,
            reasons: reasons
        };
    }
    
    // 女巫毒药目标选择
    determinePoisonTarget(witch, alivePlayers) {
        const priorities = [];
        
        alivePlayers.forEach(target => {
            let priority = 0;
            let reasons = [];
            
            // 1. 优先毒狼人
            if (target.role.team === 'werewolf') {
                priority += 100;
                reasons.push('确认狼人');
            } else {
                // 基于怀疑度毒人
                const suspicion = this.calculateSuspicion(witch, target);
                if (suspicion > 8) {
                    priority += 80;
                    reasons.push('高度可疑');
                } else if (suspicion > 6) {
                    priority += 60;
                    reasons.push('中度可疑');
                } else if (suspicion > 4) {
                    priority += 40;
                    reasons.push('轻度可疑');
                } else {
                    priority -= 20;
                    reasons.push('怀疑度低');
                }
            }
            
            // 2. 游戏阶段调整
            if (this.day === 1) {
                // 第一夜：不轻易用毒
                priority -= 30;
                reasons.push('首夜保守');
            } else if (this.day >= 3) {
                // 后期：更积极使用毒药
                priority += 20;
                reasons.push('后期积极');
            }
            
            // 3. 威胁度评估
            if (this.isPlayerThreatening(target)) {
                priority += 30;
                reasons.push('威胁较大');
            }
            
            // 4. 避免毒神职（除非确认是狼）
            if (target.role.team !== 'werewolf') {
                if (target.role.name === 'seer' || target.role.name === 'hunter') {
                    priority -= 50;
                    reasons.push('疑似神职');
                }
            }
            
            // 5. 位置策略
            if (target.position <= 3) {
                priority += 15;
                reasons.push('前置位影响大');
            }
            
            priorities.push({
                target: target,
                priority: priority,
                reasons: reasons
            });
        });
        
        // 选择最优毒药目标
        priorities.sort((a, b) => b.priority - a.priority);
        
        // 只有优先级足够高才使用毒药
        if (priorities.length > 0 && priorities[0].priority >= 50) {
            return priorities[0];
        }
        
        return null; // 不使用毒药
    }
    
    // 预言家智能查验策略
    determineSeerTarget(seer, targets) {
        const priorities = [];
        
        targets.forEach(target => {
            let priority = 0;
            let reasons = [];
            
            // 1. 优先查验可疑的狼人
            const suspicion = this.calculateSuspicion(seer, target);
            if (suspicion > 7) {
                priority += 80;
                reasons.push('高度可疑');
            } else if (suspicion > 5) {
                priority += 60;
                reasons.push('中度可疑');
            }
            
            // 2. 优先查验发言活跃的玩家
            if (this.isPlayerThreatening(target)) {
                priority += 40;
                reasons.push('发言活跃');
            }
            
            // 3. 位置策略：优先查验前置位（影响大）
            if (target.position <= 3) {
                priority += 30;
                reasons.push('前置位重要');
            } else if (target.position >= 7) {
                priority += 20;
                reasons.push('后置位查验');
            }
            
            // 4. 避免查验已知好人
            if (target.role.name === 'villager' && this.day >= 2) {
                // 如果是明确的村民，降低优先级
                priority -= 10;
                reasons.push('疑似村民');
            }
            
            // 5. 游戏阶段调整
            if (this.day === 1) {
                // 第一夜：优先查验中间位置
                if (target.position >= 4 && target.position <= 6) {
                    priority += 25;
                    reasons.push('首夜中位');
                }
            } else {
                // 后续夜晚：基于前面的信息调整
                if (this.day >= 3) {
                    priority += 15;
                    reasons.push('后期查验');
                }
            }
            
            // 6. 避免重复查验（如果有记录）
            if (target.hasBeenChecked) {
                priority -= 50;
                reasons.push('已查验过');
            }
            
            priorities.push({
                target: target,
                priority: priority,
                reasons: reasons
            });
        });
        
        // 选择最优查验目标
        priorities.sort((a, b) => b.priority - a.priority);
        
        if (priorities.length > 0) {
            const chosen = priorities[0];
            const reasonText = chosen.reasons.length > 0 ? 
                `（${chosen.reasons.join('，')}）` : '';
            this.addLog(`预言家${seer.name}逻辑查验${chosen.target.name}${reasonText}`, 'strategy');
            return chosen.target;
        }
        
        // 兜底策略：选择威胁最大的目标
        const gameData = {
            aliveWerewolves: this.players.filter(p => p.isAlive && p.role.name === 'werewolf').length,
            dayNumber: this.dayCount,
            alivePlayers: this.players.filter(p => p.isAlive)
        };
        return targets.reduce((most, target) => 
            this.calculateThreatLevel(target, gameData) > this.calculateThreatLevel(most, gameData) ? target : most
        );
    }
    
    // 智能狼队刀人策略
    determineWolfKillTarget(werewolves) {
        const alivePlayers = this.players.filter(p => p.isAlive);
        const villageTeam = alivePlayers.filter(p => p.role.team !== 'werewolf');
        const aliveWerewolves = werewolves.filter(w => w.isAlive);
        
        if (villageTeam.length === 0) return null;
        
        // 根据游戏天数制定策略
        if (this.day === 1) {
            return this.firstNightKillStrategy(aliveWerewolves, villageTeam);
        } else {
            return this.advancedKillStrategy(aliveWerewolves, villageTeam);
        }
    }
    
    // 第一夜刀人策略
    firstNightKillStrategy(werewolves, villageTeam) {
        // 逻辑推理：分析场上局势选择最优策略
        const aliveWerewolves = werewolves.length;
        const totalVillagers = villageTeam.length;
        const hasWitch = villageTeam.some(p => p.role.name === 'witch');
        const hasSeer = villageTeam.some(p => p.role.name === 'seer');
        const hasHunter = villageTeam.some(p => p.role.name === 'hunter');
        
        // 策略选择逻辑：
        // 1. 如果有女巫且狼队数量>=2，考虑自刀骗解药
        // 2. 如果神职较多，优先刀神
        // 3. 否则刀民减少好人数量
        
        let strategy = 'normal';
        
        if (hasWitch && aliveWerewolves >= 2 && totalVillagers >= 5) {
            // 有女巫且局势允许时，自刀骗解药
            strategy = 'selfKill';
        } else if ((hasSeer || hasWitch || hasHunter) && totalVillagers >= 4) {
            // 有神职且好人数量足够时，优先刀神
            strategy = 'godKill';
        }
        
        switch (strategy) {
            case 'selfKill':
                // 自刀策略：选择位置最不重要的狼队友
                if (werewolves.length > 1) {
                    // 选择发言位置最靠后的狼人自刀
                    const wolfTarget = werewolves.reduce((latest, wolf) => 
                        wolf.position > latest.position ? wolf : latest
                    );
                    this.addLog(`狼队决定自刀${wolfTarget.name}骗女巫解药`, 'strategy');
                    return wolfTarget;
                }
                break;
                
            case 'godKill':
                // 刀神策略：按威胁度排序
                const godPriorities = [];
                villageTeam.forEach(p => {
                    if (p.role.name === 'seer') {
                        godPriorities.push({ target: p, priority: 10, reason: '预言家威胁最大' });
                    } else if (p.role.name === 'witch') {
                        godPriorities.push({ target: p, priority: 8, reason: '女巫有双药' });
                    } else if (p.role.name === 'hunter') {
                        godPriorities.push({ target: p, priority: 6, reason: '猎人有枪' });
                    }
                });
                
                if (godPriorities.length > 0) {
                    godPriorities.sort((a, b) => b.priority - a.priority);
                    const target = godPriorities[0].target;
                    this.addLog(`狼队决定刀神：${target.name}（${godPriorities[0].reason}）`, 'strategy');
                    return target;
                }
                break;
        }
        
        // 默认刀民策略：选择位置最有利的村民
        const villagers = villageTeam.filter(p => p.role.name === 'villager');
        if (villagers.length > 0) {
            // 选择发言位置最靠前的村民（减少其发言影响）
            const target = villagers.reduce((earliest, villager) => 
                villager.position < earliest.position ? villager : earliest
            );
            this.addLog(`狼队决定刀民：${target.name}（位置优势）`, 'strategy');
            return target;
        }
        
        // 兜底：选择威胁最小的好人
        const gameData = {
            aliveWerewolves: werewolves.length,
            dayNumber: this.dayCount,
            alivePlayers: this.players.filter(p => p.isAlive)
        };
        return villageTeam.reduce((least, player) => 
            this.calculateThreatLevel(player, gameData) < this.calculateThreatLevel(least, gameData) ? player : least
        );
    }
    
    // 高级刀人策略（第二夜及以后）
    advancedKillStrategy(werewolves, villageTeam) {
        const priorities = [];
        
        // 分析场上局势
        const aliveWerewolves = werewolves.length;
        const aliveVillagers = villageTeam.length;
        const gameDay = this.day;
        
        villageTeam.forEach(player => {
            let priority = 0;
            let reasons = [];
            
            // 1. 真预言家评估（最高优先级）
            if (player.role.name === 'seer') {
                if (this.isPlayerExposed(player)) {
                    priority += 100;
                    reasons.push('已确认真预言家');
                } else {
                    priority += 80;
                    reasons.push('疑似预言家');
                }
            }
            
            // 2. 女巫评估
            if (player.role.name === 'witch') {
                if (this.isPlayerExposed(player)) {
                    priority += 90;
                    reasons.push('已确认女巫');
                } else {
                    priority += 70;
                    reasons.push('疑似女巫');
                }
            }
            
            // 3. 猎人评估（基于局势逻辑判断）
            if (player.role.name === 'hunter') {
                const shouldKill = this.shouldKillHunterLogically(aliveWerewolves, aliveVillagers, gameDay);
                if (shouldKill) {
                    priority += 60;
                    reasons.push('猎人且适合击杀');
                } else {
                    priority -= 30;
                    reasons.push('猎人但不宜击杀');
                }
            }
            
            // 4. 金水评估
            const goldWaters = this.getGoldWaters(villageTeam);
            if (goldWaters.includes(player)) {
                priority += 50;
                reasons.push('金水身份');
            }
            
            // 5. 威胁度评估
            if (this.isPlayerThreatening(player)) {
                priority += 40;
                reasons.push('发言威胁大');
            }
            
            // 6. 角色基础价值
            if (player.role.name === 'villager') {
                priority += 20;
                reasons.push('村民');
            }
            
            // 7. 位置优势（前置位影响大）
            if (player.position <= 3) {
                priority += 10;
                reasons.push('前置位');
            }
            
            // 8. 游戏阶段调整
            if (gameDay >= 3) {
                // 后期优先刀神职
                if (player.role.name !== 'villager') {
                    priority += 15;
                    reasons.push('后期神职优先');
                }
            }
            
            // 9. 局势调整
            if (aliveWerewolves < aliveVillagers - 1) {
                // 劣势时更激进
                if (player.role.name === 'seer' || player.role.name === 'witch') {
                    priority += 20;
                    reasons.push('劣势激进');
                }
            }
            
            priorities.push({
                target: player,
                priority: priority,
                reasons: reasons
            });
        });
        
        // 按优先级排序并选择最优目标
        priorities.sort((a, b) => b.priority - a.priority);
        
        if (priorities.length > 0) {
            const chosen = priorities[0];
            const reasonText = chosen.reasons.length > 0 ? 
                `（${chosen.reasons.join('，')}）` : '';
            this.addLog(`狼队逻辑刀人：${chosen.target.name}${reasonText}`, 'strategy');
            return chosen.target;
        }
        
        // 兜底：选择威胁最小的目标
        const gameData = {
            aliveWerewolves: werewolves.length,
            dayNumber: this.dayCount,
            alivePlayers: this.players.filter(p => p.isAlive)
        };
        return villageTeam.reduce((least, player) => 
            this.calculateThreatLevel(player, gameData) < this.calculateThreatLevel(least, gameData) ? player : least
        );
    }
    
    // 获取声称预言家的玩家
    getClaimedSeers() {
        // 简化实现：在实际游戏中应该基于发言记录
        return this.players.filter(p => p.isAlive && p.claimedRole === 'seer');
    }
    
    // 获取声称女巫的玩家
    getClaimedWitches() {
        return this.players.filter(p => p.isAlive && p.claimedRole === 'witch');
    }
    
    // 获取疑似猎人的玩家
    getSuspectedHunters() {
        return this.players.filter(p => p.isAlive && p.suspectedRole === 'hunter');
    }
    
    // 判断玩家是否已暴露身份
    isPlayerExposed(player) {
        // 基于逻辑推理的身份暴露判断
        if (player.isExposed) {
            return true;
        }
        
        // 分析身份暴露的逻辑条件
        let exposureScore = 0;
        
        // 1. 预言家身份暴露条件
        if (player.role.name === 'seer') {
            // 如果已经查验过人且公布结果
            if (this.day >= 2) {
                exposureScore += 50; // 预言家通常第二天会跳出来
            }
            // 如果有狼人被查杀
            const checkedWolves = this.players.filter(p => 
                !p.isAlive && p.role.name === 'werewolf' && this.day >= 2
            );
            if (checkedWolves.length > 0) {
                exposureScore += 30; // 查杀狼人会增加暴露度
            }
        }
        
        // 2. 女巫身份暴露条件
        if (player.role.name === 'witch') {
            // 如果使用过药品
            if (this.day >= 3) {
                exposureScore += 40; // 女巫通常第三天后会暴露
            }
        }
        
        // 3. 猎人身份暴露条件
        if (player.role.name === 'hunter') {
            // 猎人通常不主动暴露，除非被逼
            if (this.day >= 4) {
                exposureScore += 20; // 后期可能被推理出来
            }
        }
        
        // 4. 狼人身份暴露条件
        if (player.role.name === 'werewolf') {
            // 如果发言有破绽或被查杀
            if (this.day >= 2) {
                exposureScore += 25; // 狼人可能通过发言暴露
            }
        }
        
        // 5. 游戏进程影响
        if (this.day >= 4) {
            exposureScore += 15; // 后期身份更容易暴露
        }
        
        // 6. 发言活跃度影响
        if (this.isPlayerThreatening(player)) {
            exposureScore += 10; // 活跃玩家更容易暴露
        }
        
        // 基于评分判断是否暴露（阈值为60）
        return exposureScore >= 60;
    }
    
    // 判断是否应该刀猎人（逻辑推理版本）
    shouldKillHunterLogically(aliveWerewolves, aliveVillagers, gameDay) {
        // 基于逻辑推理的猎人击杀决策
        
        // 1. 局势分析
        const wolfAdvantage = aliveWerewolves / (aliveWerewolves + aliveVillagers);
        
        // 2. 游戏阶段分析
        const isLateGame = gameDay >= 3;
        const isEndGame = aliveWerewolves >= aliveVillagers - 1;
        
        // 3. 决策逻辑
        if (isEndGame) {
            // 终局阶段：必须刀猎人避免被带走
            return true;
        }
        
        if (isLateGame && wolfAdvantage >= 0.4) {
            // 后期且狼队有一定优势：刀猎人
            return true;
        }
        
        if (aliveWerewolves >= 2 && aliveVillagers <= 4) {
            // 狼队人数充足且好人较少：可以承受猎人反击
            return true;
        }
        
        // 其他情况：不刀猎人，避免减员
        return false;
    }
    
    // 判断是否应该刀猎人（兼容旧版本）
    shouldKillHunter() {
        const aliveWerewolves = this.players.filter(p => p.isAlive && p.role.name === 'werewolf').length;
        const aliveVillagers = this.players.filter(p => p.isAlive && p.role.team !== 'werewolf').length;
        return this.shouldKillHunterLogically(aliveWerewolves, aliveVillagers, this.day);
    }
    
    // 获取金水玩家
    getGoldWaters(villageTeam) {
        // 简化实现：随机选择一些玩家作为金水
        return villageTeam.filter(p => Math.random() < 0.2);
    }
    
    // 判断玩家是否威胁较大
    isPlayerThreatening(player) {
        // 简化判断：实际应该基于发言活跃度和逻辑强度
        return Math.random() < 0.25;
    }
    
    // 处理夜晚结果
    processNightResults() {
        console.log('处理夜晚结果开始');
        let deathMessages = [];
        let deaths = [];
        
        // 处理狼人杀人
        if (this.nightActions.kill) {
            const victim = this.players.find(p => p.id === this.nightActions.kill);
            if (victim) {
                // 检查是否被女巫救了
                if (this.nightActions.heal && this.nightActions.heal === this.nightActions.kill) {
                    deathMessages.push(`${victim.name} 被狼人攻击，但被女巫救了。`);
                    this.addLog(`${victim.name} 被狼人攻击，但被女巫救了。`, 'important');
                } else {
                    victim.isAlive = false;
                    deaths.push(victim);
                    console.log(`狼人杀死了: ${victim.name}(${victim.position}号位)`);
                    deathMessages.push(`${victim.name}(${victim.position}号位) 昨夜死亡。`);
                    this.addLog(`${victim.name}(${victim.position}号位) 昨夜死亡。`, 'death');
                    
                    // 如果是猎人被杀，触发技能
                    if (victim.role.name === 'hunter') {
                        this.triggerHunterSkill(victim);
                    }
                }
            }
        }
        
        // 处理女巫毒人
        if (this.nightActions.poison) {
            const poisonVictim = this.players.find(p => p.id === this.nightActions.poison);
            if (poisonVictim && poisonVictim.isAlive) {
                poisonVictim.isAlive = false;
                deaths.push(poisonVictim);
                console.log(`女巫毒死了: ${poisonVictim.name}(${poisonVictim.position}号位)`);
                deathMessages.push(`${poisonVictim.name}(${poisonVictim.position}号位) 昨夜死亡。`);
                this.addLog(`${poisonVictim.name}(${poisonVictim.position}号位) 昨夜死亡。`, 'death');
                
                // 如果是猎人被毒，触发技能
                if (poisonVictim.role.name === 'hunter') {
                    this.triggerHunterSkill(poisonVictim);
                }
            }
        }
        
        // 设置最后死亡位置为所有死亡玩家中位置号最大的
        if (deaths.length > 0) {
            this.lastDeathPosition = Math.max(...deaths.map(p => p.position));
            console.log('设置最后死亡位置为:', this.lastDeathPosition);
            console.log('死亡玩家:', deaths.map(p => `${p.name}(${p.position}号位)`));
        }
        
        // 如果没有人死亡
        if (deaths.length === 0 && !this.nightActions.heal) {
            console.log('昨夜平安无事，当前lastDeathPosition:', this.lastDeathPosition);
            deathMessages.push('昨夜平安无事。');
            this.addLog('昨夜平安无事。', 'important');
        }
        
        this.renderPlayers();
        
        // 检查游戏是否结束
        if (this.checkGameEnd()) {
            return;
        }
        
        // 快速开始白天阶段（不传递死亡消息，避免重复通报）
        setTimeout(() => this.startDayPhase(), 300); // 减少延迟从1000ms到300ms
    }
    
    // 触发猎人技能
    triggerHunterSkill(hunter) {
        if (hunter.isAI) {
            // AI猎人智能开枪策略
            const targets = this.players.filter(p => p.isAlive && p.id !== hunter.id);
            if (targets.length > 0) {
                const optimalTarget = this.determineHunterTarget(hunter, targets);
                optimalTarget.target.isAlive = false;
                const reasonText = optimalTarget.reasons.length > 0 ? 
                    `（${optimalTarget.reasons.join('，')}）` : '';
                this.addLog(`猎人${hunter.name}逻辑开枪带走${optimalTarget.target.name}${reasonText}`, 'death');
            }
        } else {
            // 玩家猎人选择目标
            this.showHunterModal(hunter);
        }
    }
    
    // 显示猎人选择模态框
    showHunterModal(hunter) {
        const targets = this.players.filter(p => p.isAlive && p.id !== hunter.id);
        const modalBody = document.getElementById('modal-body');
        
        modalBody.innerHTML = `
            <h3>猎人技能</h3>
            <p>您被杀死了，可以开枪带走一名玩家：</p>
            <div class="target-selection">
                ${targets.map(p => 
                    `<button class="btn btn-danger" onclick="game.hunterShoot(${p.id})">${p.name}</button>`
                ).join('')}
            </div>
        `;
        
        document.getElementById('modal').style.display = 'block';
    }
    
    // 猎人开枪
    hunterShoot(targetId) {
        const target = this.players.find(p => p.id === targetId);
        target.isAlive = false;
        this.addLog(`猎人开枪带走了 ${target.name}。`, 'death');
        
        document.getElementById('modal').style.display = 'none';
        this.renderPlayers();
        
        // 检查游戏是否结束
        this.checkGameEnd();
    }
    
    // 开始白天阶段
    startDayPhase() {
        this.currentPhase = 'day';
        this.updateGameInfo('白天讨论', this.dayCount);
        
        document.getElementById('night-actions').style.display = 'none';
        document.getElementById('day-actions').style.display = 'block';
        document.getElementById('voting-section').style.display = 'none';
        
        this.addLog(`第${this.dayCount}天白天开始，按序发言讨论。`);
        
        // 重置发言状态
        this.players.forEach(p => p.hasSpoken = false);
        
        // 直接开始发言环节
        this.startSpeechPhase();
    }
    
    // 开始发言阶段
    startSpeechPhase() {
        console.log('开始发言阶段');
        this.currentSpeaker = null;
        this.speechOrder = this.calculateSpeechOrder();
        this.speechIndex = 0;
        
        console.log('发言顺序长度:', this.speechOrder.length);
        console.log('发言顺序:', this.speechOrder.map(p => `${p.name}(${p.position}号)`));
        
        if (this.speechOrder.length === 0) {
            console.log('没有玩家可以发言，直接进入投票阶段');
            this.addLog('没有玩家可以发言，直接进入投票阶段', 'important');
            setTimeout(() => this.startVotingPhase(), 300);
            return;
        }
        
        this.addLog('=== 发言环节开始 ===', 'important');
        this.addLog(`发言顺序：${this.speechOrder.map(p => `${p.name}(${p.position}号)`).join(' → ')}`);
        
        // 开始第一个玩家发言
        console.log('调用nextSpeaker开始第一个玩家发言');
        this.nextSpeaker();
    }
    
    // 计算发言顺序
    calculateSpeechOrder() {
        const alivePlayers = this.players.filter(p => p.isAlive);
        
        console.log('计算发言顺序 - 存活玩家:', alivePlayers.map(p => `${p.name}(${p.position}号)`));
        console.log('最后死亡位置:', this.lastDeathPosition);
        
        // 如果没有存活的玩家，返回空数组
        if (alivePlayers.length === 0) {
            console.log('没有存活玩家，返回空数组');
            return [];
        }
        
        if (!this.lastDeathPosition) {
            // 没有玩家死亡，按序号从小到大发言
            const order = alivePlayers.sort((a, b) => a.position - b.position);
            console.log('没有死亡玩家，按序号发言:', order.map(p => `${p.name}(${p.position}号)`));
            return order;
        }
        
        // 有玩家死亡，从死亡玩家的下一个序号开始按顺序发言
        const sortedPlayers = alivePlayers.sort((a, b) => a.position - b.position);
        const maxPosition = Math.max(...alivePlayers.map(p => p.position));
        
        console.log('排序后的存活玩家:', sortedPlayers.map(p => `${p.name}(${p.position}号)`));
        console.log('最大位置号:', maxPosition);
        
        let speechOrder = [];
        
        // 从死亡玩家的下一个序号开始发言
        let startPosition = this.lastDeathPosition + 1;
        console.log('开始发言位置:', startPosition);
        
        // 先添加从死亡位置+1到最大序号的玩家
        for (let pos = startPosition; pos <= maxPosition; pos++) {
            const player = sortedPlayers.find(p => p.position === pos);
            if (player) {
                console.log(`添加玩家到发言顺序: ${player.name}(${player.position}号)`);
                speechOrder.push(player);
            }
        }
        
        // 再添加从序号1到死亡位置的玩家
        for (let pos = 1; pos <= this.lastDeathPosition; pos++) {
            const player = sortedPlayers.find(p => p.position === pos);
            if (player && !speechOrder.includes(player)) {
                console.log(`添加玩家到发言顺序: ${player.name}(${player.position}号)`);
                speechOrder.push(player);
            }
        }
        
        console.log('最终发言顺序:', speechOrder.map(p => `${p.name}(${p.position}号)`));
        return speechOrder;
    }
    
    // 下一个发言者
    nextSpeaker() {
        console.log('nextSpeaker被调用, speechIndex:', this.speechIndex, 'speechOrder.length:', this.speechOrder.length);
        
        if (this.speechIndex >= this.speechOrder.length) {
            // 所有人发言完毕，开始投票
            console.log('所有人发言完毕，开始投票');
            this.addLog('=== 发言环节结束 ===', 'important');
            setTimeout(() => this.startVotingPhase(), 300); // 减少投票阶段开始延迟
            return;
        }
        
        const speaker = this.speechOrder[this.speechIndex];
        console.log('当前发言者:', speaker ? `${speaker.name}(${speaker.position}号)` : 'undefined');
        
        if (!speaker) {
            console.error('发言者为undefined，speechIndex:', this.speechIndex, 'speechOrder:', this.speechOrder);
            return;
        }
        
        this.currentSpeaker = speaker;
        speaker.hasSpoken = true;
        
        this.addLog(`轮到 ${speaker.name}(${speaker.position}号) 发言：`, 'speech');
        
        if (speaker.isAI) {
            // AI发言
            console.log('AI发言:', speaker.name);
            setTimeout(() => {
                this.generateAISpeech(speaker);
                setTimeout(() => {
                    this.speechIndex++;
                    this.nextSpeaker();
                }, 2000);
            }, 1000);
        } else {
            // 玩家发言
            console.log('玩家发言:', speaker.name);
            this.showPlayerSpeechInput();
        }
    }
    
    // 显示玩家发言输入
    showPlayerSpeechInput() {
        console.log('showPlayerSpeechInput called for player:', this.currentSpeaker);
        console.log('Current speaker isAI:', this.currentSpeaker?.isAI);
        
        // 确保白天行动面板可见
        document.getElementById('day-actions').style.display = 'block';
        document.getElementById('night-actions').style.display = 'none';
        
        const actionContent = document.getElementById('action-content');
        if (!actionContent) {
            console.error('action-content element not found!');
            return;
        }
        
        actionContent.innerHTML = `
            <div class="speech-input">
                <p><strong>轮到您发言</strong> - AI玩家将按照座位顺序依次发言，请耐心等待：</p>
                
                <div class="identity-claim-section" style="margin: 10px 0; padding: 15px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); border-radius: 10px; color: white; box-shadow: 0 4px 15px rgba(0,0,0,0.1);">
                    <div style="display: flex; align-items: center; margin-bottom: 10px;">
                        <span style="font-size: 24px; margin-right: 10px;">🎭</span>
                        <label for="claimed-identity" style="font-weight: bold; font-size: 16px;">身份声明（策略选择）</label>
                    </div>
                    <select id="claimed-identity" style="width: 100%; padding: 10px; border: none; border-radius: 8px; font-size: 14px; background: white; color: #333; box-shadow: 0 2px 5px rgba(0,0,0,0.1);">
                        <option value="">💬 不声明身份</option>
                        <option value="villager">🏘️ 我是村民</option>
                        <option value="werewolf">🐺 我是狼人</option>
                        <option value="seer">🔮 我是预言家</option>
                        <option value="witch">🧙‍♀️ 我是女巫</option>
                        <option value="hunter">🏹 我是猎人</option>
                    </select>
                    <div style="margin-top: 8px; font-size: 12px; opacity: 0.9;">
                        💡 你可以声称任何身份，无论真假！这是狼人杀的核心策略
                    </div>
                </div>
                
                <div id="chat-messages" style="height: 200px; overflow-y: auto; border: 1px solid #ccc; padding: 10px; margin: 10px 0; background: #f8f9fa; border-radius: 5px;"></div>
                <div style="display: flex; gap: 10px; margin: 10px 0;">
                    <textarea id="player-speech" placeholder="请输入您的发言..." rows="2" style="flex: 1; padding: 10px; border-radius: 5px; border: 1px solid #ccc; resize: vertical;" onkeydown="if(event.key==='Enter'&&!event.shiftKey){event.preventDefault();game.sendMessage();}"></textarea>
                    <button class="btn btn-primary" onclick="game.sendMessage()" style="height: fit-content;">发送</button>
                </div>
                <div style="background: #e8f4fd; padding: 10px; border-radius: 5px; margin: 10px 0; font-size: 14px; color: #2d3436;">
                    <strong>发言规则：</strong>AI玩家严格按照座位顺序发言，每个AI轮流发言一次，不会同时发言。你可以声称任何身份来迷惑对手！
                </div>
                <button class="btn btn-success" onclick="game.endPlayerSpeech()" style="width: 100%; margin-top: 10px;">结束发言</button>
            </div>
        `;
        
        // 初始化聊天消息
        this.chatMessages = [];
        this.updateChatDisplay();
        
        // 启动AI回复机制
        this.startAIChat();
    }
    
    // 发送消息
    sendMessage() {
        console.log('sendMessage called');
        const speechTextElement = document.getElementById('player-speech');
        console.log('Speech text element:', speechTextElement);
        
        if (!speechTextElement) {
            console.error('player-speech element not found!');
            return;
        }
        
        const speechText = speechTextElement.value.trim();
        console.log('Speech text:', speechText);
        
        if (!speechText) {
            console.log('No speech text entered');
            return;
        }
        
        // 获取声称的身份
        const claimedIdentitySelect = document.getElementById('claimed-identity');
        const claimedIdentity = claimedIdentitySelect ? claimedIdentitySelect.value : '';
        
        // 构建消息内容
        let fullMessage = speechText;
        if (claimedIdentity) {
            const identityNames = {
                'villager': '🏘️ 村民',
                'werewolf': '🐺 狼人', 
                'seer': '🔮 预言家',
                'witch': '🧙‍♀️ 女巫',
                'hunter': '🏹 猎人'
            };
            const identityName = identityNames[claimedIdentity] || claimedIdentity;
            fullMessage = `【身份声明：${identityName}】${speechText}`;
        }
        
        // 添加玩家消息到聊天
        this.chatMessages.push({
            sender: this.currentSpeaker.name,
            message: fullMessage,
            isPlayer: true,
            claimedIdentity: claimedIdentity,
            timestamp: Date.now()
        });
        
        // 清空输入框和身份选择
        document.getElementById('player-speech').value = '';
        if (claimedIdentitySelect) {
            claimedIdentitySelect.value = '';
        }
        
        // 更新聊天显示
        this.updateChatDisplay();
        
        // AI会按照自己的顺序发言，不需要立即触发
    }
    
    // 更新聊天显示
    updateChatDisplay() {
        const chatContainer = document.getElementById('chat-messages');
        if (!chatContainer) return;
        
        chatContainer.innerHTML = this.chatMessages.map(msg => {
            const senderClass = msg.isPlayer ? 'player-message' : 'ai-message';
            
            // 处理身份声明显示
            let displayMessage = msg.message;
            if (msg.claimedIdentity) {
                const identityNames = {
                    'villager': '村民',
                    'werewolf': '狼人', 
                    'seer': '预言家',
                    'witch': '女巫',
                    'hunter': '猎人'
                };
                const identityText = identityNames[msg.claimedIdentity] || msg.claimedIdentity;
                displayMessage = `<span class="identity-claim">身份声明：${identityText}</span>${displayMessage}`;
            }
            
            return `
                <div class="chat-message ${senderClass}" style="margin: 5px 0; padding: 8px; border-radius: 8px; ${msg.isPlayer ? 'background: #e3f2fd; margin-left: 20px;' : 'background: #f3e5f5; margin-right: 20px;'}">
                    <strong>${msg.sender}:</strong> ${displayMessage}
                </div>
            `;
        }).join('');
        
        // 滚动到底部
        chatContainer.scrollTop = chatContainer.scrollHeight;
    }
    
    // 启动AI聊天（严格按顺序）
    startAIChat() {
        this.aiChatActive = true;
        this.aiSpeechQueue = []; // AI发言队列
        this.currentAISpeaker = null; // 当前发言的AI
        this.aiSpeechTimeout = null; // AI发言定时器
        
        // 清除之前的定时器
        if (this.aiSpeechTimeout) {
            clearTimeout(this.aiSpeechTimeout);
        }
        
        // 只有轮到玩家发言时，AI才能参与讨论
        // 但AI必须等待轮到自己的顺序才能发言
        this.initializeAISpeechOrder();
    }
    
    // 初始化AI发言顺序
    initializeAISpeechOrder() {
        const alivePlayers = this.players.filter(p => p.isAlive && p.isAI);
        if (alivePlayers.length === 0) return;
        
        // 按照位置顺序排列AI玩家
        this.aiSpeechQueue = alivePlayers.sort((a, b) => a.position - b.position);
        this.currentAISpeakerIndex = 0;
        
        // 开始第一个AI的发言倒计时
        this.scheduleNextAISpeech();
    }
    
    // 安排下一个AI发言
    scheduleNextAISpeech() {
        if (!this.aiChatActive || this.aiSpeechQueue.length === 0) return;
        
        // 随机延迟后让下一个AI发言
        this.aiSpeechTimeout = setTimeout(() => {
            if (this.aiChatActive) {
                this.triggerAIResponse();
            }
        }, this.getAISpeechDelay()); // 基于角色特性的发言延迟
    }
    
    // 计算AI发言延迟
    getAISpeechDelay() {
        const currentSpeaker = this.aiSpeechQueue[this.currentAISpeakerIndex];
        if (!currentSpeaker) return 3000;
        
        // 基于角色特性决定发言延迟
        if (currentSpeaker.role.name === 'werewolf') {
            return 3500; // 狼人需要更多时间思考
        } else if (currentSpeaker.role.name === 'seer') {
            return 2500; // 预言家发言较快
        } else if (currentSpeaker.role.name === 'witch') {
            return 3000; // 女巫中等速度
        } else if (currentSpeaker.role.name === 'hunter') {
            return 2800; // 猎人发言较直接
        } else {
            return 2700; // 村民发言相对简单
        }
    }
    
    // 触发AI回复（按顺序）
    triggerAIResponse() {
        if (!this.aiChatActive || this.aiSpeechQueue.length === 0) return;
        
        // 确保当前发言者是玩家且AI聊天处于活跃状态
        if (!this.currentSpeaker || this.currentSpeaker.isAI) {
            console.log('AI聊天被阻止：当前发言者不是玩家');
            return;
        }
        
        // 获取当前应该发言的AI
        const currentAI = this.aiSpeechQueue[this.currentAISpeakerIndex];
        if (!currentAI || !currentAI.isAlive) {
            // 如果当前AI已死亡，跳到下一个
            this.moveToNextAI();
            return;
        }
        
        // 生成智能AI发言
        const speechData = this.generateIntelligentAISpeech(currentAI);
        
        // 添加AI发言
        this.chatMessages.push({
            sender: currentAI.name,
            message: speechData.message,
            claimedIdentity: speechData.claimedIdentity,
            isPlayer: false,
            timestamp: Date.now()
        });
        this.updateChatDisplay();
        
        // 移动到下一个AI
        this.moveToNextAI();
    }
    
    // 移动到下一个AI发言者
    moveToNextAI() {
        this.currentAISpeakerIndex = (this.currentAISpeakerIndex + 1) % this.aiSpeechQueue.length;
        
        // 如果还有活着的AI，继续安排发言
        const aliveAIs = this.aiSpeechQueue.filter(ai => ai.isAlive);
        if (aliveAIs.length > 0) {
            this.scheduleNextAISpeech();
        }
    }
    
    // 结束玩家发言
    endPlayerSpeech() {
        this.aiChatActive = false;
        
        // 清除AI发言定时器
        if (this.aiSpeechTimeout) {
            clearTimeout(this.aiSpeechTimeout);
            this.aiSpeechTimeout = null;
        }
        
        // 处理玩家的身份声明
        const claimedIdentitySelect = document.getElementById('claimed-identity');
        if (claimedIdentitySelect && claimedIdentitySelect.value) {
            const claimedRole = claimedIdentitySelect.value;
            this.currentSpeaker.claimedRole = claimedRole;
            
            const roleNames = {
                'villager': '村民',
                'werewolf': '狼人', 
                'seer': '预言家',
                'witch': '女巫',
                'hunter': '猎人'
            };
            
            this.addLog(`${this.currentSpeaker.name}声明身份：${roleNames[claimedRole]}`, 'identity-claim');
        }
        
        // 将所有聊天记录添加到游戏日志
        if (this.chatMessages.length > 0) {
            this.addLog(`=== ${this.currentSpeaker.name}(${this.currentSpeaker.position}号) 发言记录 ===`, 'speech');
            this.chatMessages.forEach(msg => {
                this.addLog(`${msg.sender}: ${msg.message}`, msg.isPlayer ? 'player-speech' : 'ai-speech');
            });
        }
        
        document.getElementById('action-content').innerHTML = '<p>等待其他玩家发言...</p>';
        
        setTimeout(() => {
            this.speechIndex++;
            this.nextSpeaker();
        }, 1000);
    }
    
    // 生成智能AI发言
    generateIntelligentAISpeech(aiPlayer) {
        const gameState = {
            day: this.day,
            phase: this.phase,
            deadPlayers: this.players.filter(p => !p.isAlive),
            alivePlayers: this.players.filter(p => p.isAlive),
            lastNightDeath: this.gameLog.filter(log => log.includes('死亡') && log.includes(`第${this.day}天`)).slice(-1)[0],
            chatHistory: this.chatMessages || [],
            votingHistory: this.gameLog.filter(log => log.includes('投票') || log.includes('被淘汰')),
            suspiciousPlayers: this.identifySuspiciousPlayers(aiPlayer)
        };
        
        // 生成基础发言内容
        let baseSpeech;
        if (aiPlayer.role === 'werewolf') {
            baseSpeech = this.generateWerewolfSpeech(aiPlayer, gameState);
        } else if (aiPlayer.role === 'seer') {
            baseSpeech = this.generateSeerSpeech(aiPlayer, gameState);
        } else if (aiPlayer.role === 'witch') {
            baseSpeech = this.generateWitchSpeech(aiPlayer, gameState);
        } else if (aiPlayer.role === 'hunter') {
            baseSpeech = this.generateHunterSpeech(aiPlayer, gameState);
        } else {
            baseSpeech = this.generateVillagerSpeech(aiPlayer, gameState);
        }
        
        // AI根据策略需要决定是否声称身份
        const claimedIdentity = this.generateAIIdentityClaim(aiPlayer, gameState);
        
        return {
            message: baseSpeech,
            claimedIdentity: claimedIdentity
        };
    }
    
    // 生成AI身份声明策略（基于逻辑推理）
    generateAIIdentityClaim(aiPlayer, gameState) {
        const alivePlayers = this.players.filter(p => p.isAlive);
        const aliveWerewolves = alivePlayers.filter(p => p.role === 'werewolf').length;
        const aliveGoodGuys = alivePlayers.filter(p => p.role !== 'werewolf').length;
        const dayNumber = gameState.dayNumber;
        const hasPlayerClaimedSeer = this.hasPlayerClaimedRole('seer');
        const hasPlayerClaimedWitch = this.hasPlayerClaimedRole('witch');
        const hasPlayerClaimedHunter = this.hasPlayerClaimedRole('hunter');
        
        // 高级策略分析
        const strategicAnalysis = this.analyzeGameSituation(aiPlayer, {
            alivePlayers, aliveWerewolves, aliveGoodGuys, dayNumber,
            hasPlayerClaimedSeer, hasPlayerClaimedWitch, hasPlayerClaimedHunter
        });
        
        if (aiPlayer.role === 'werewolf') {
            return this.getWerewolfIdentityStrategy(aiPlayer, gameState, {
                hasPlayerClaimedSeer, hasPlayerClaimedWitch, hasPlayerClaimedHunter,
                aliveWerewolves, aliveGoodGuys, dayNumber, strategicAnalysis
            });
        } else if (aiPlayer.role === 'seer') {
            return this.getSeerIdentityStrategy(aiPlayer, gameState, {
                hasPlayerClaimedSeer, dayNumber, aliveWerewolves, strategicAnalysis
            });
        } else if (aiPlayer.role === 'witch') {
            return this.getWitchIdentityStrategy(aiPlayer, gameState, {
                hasPlayerClaimedWitch, hasPlayerClaimedSeer, dayNumber, strategicAnalysis
            });
        } else if (aiPlayer.role === 'hunter') {
            return this.getHunterIdentityStrategy(aiPlayer, gameState, {
                hasPlayerClaimedHunter, dayNumber, aliveWerewolves, strategicAnalysis
            });
        } else {
            return this.getVillagerIdentityStrategy(aiPlayer, gameState, {
                hasPlayerClaimedSeer, hasPlayerClaimedWitch, hasPlayerClaimedHunter,
                dayNumber, aliveWerewolves, strategicAnalysis
            });
        }
    }
    
    // 检查是否有玩家声称过某个角色
    hasPlayerClaimedRole(role) {
        return this.chatMessages.some(msg => msg.claimedIdentity === role);
    }
    
    // 分析游戏局势（高级策略系统）
    analyzeGameSituation(aiPlayer, gameData) {
        const { alivePlayers, aliveWerewolves, aliveGoodGuys, dayNumber,
                hasPlayerClaimedSeer, hasPlayerClaimedWitch, hasPlayerClaimedHunter } = gameData;
        
        const totalAlive = alivePlayers.length;
        
        return {
            // 基础数据
            totalAlive,
            aliveWerewolves,
            aliveGoodGuys,
            dayNumber,
            
            // 阵营优势分析
            werewolfAdvantage: aliveWerewolves / totalAlive,
            goodGuyAdvantage: aliveGoodGuys / totalAlive,
            
            // 局势判断
            isWerewolfWinning: aliveWerewolves >= aliveGoodGuys,
            isGoodGuyWinning: aliveWerewolves <= 1,
            isCriticalMoment: Math.abs(aliveWerewolves - aliveGoodGuys) <= 1,
            
            // 角色声明情况
            hasPlayerClaimedSeer,
            hasPlayerClaimedWitch,
            hasPlayerClaimedHunter,
            
            // 策略建议
            shouldBeAggressive: aliveWerewolves >= aliveGoodGuys * 0.6,
            shouldBeConservative: aliveWerewolves <= 2,
            shouldClaimRole: dayNumber >= 2 || aliveWerewolves >= aliveGoodGuys * 0.5,
            
            // 威胁评估
            threatLevel: this.calculateThreatLevel(aiPlayer, gameData),
            
            // 信任度分析
            trustworthyPlayers: this.identifyTrustworthyPlayers(aiPlayer, alivePlayers),
            suspiciousPlayers: this.identifySuspiciousPlayers(aiPlayer, { alivePlayers })
        };
    }
    
    // 计算威胁等级
    calculateThreatLevel(aiPlayer, gameData) {
        const { aliveWerewolves, dayNumber, alivePlayers } = gameData;
        let threatLevel = 0;
        
        // 基于存活狼人数量
        if (aliveWerewolves >= 3) threatLevel += 3;
        else if (aliveWerewolves === 2) threatLevel += 2;
        else threatLevel += 1;
        
        // 基于神职存活情况
        const aliveSeer = alivePlayers.some(p => p.role === 'seer');
        const aliveWitch = alivePlayers.some(p => p.role === 'witch');
        const aliveHunter = alivePlayers.some(p => p.role === 'hunter');
        
        if (aiPlayer.role === 'werewolf') {
            if (aliveSeer) threatLevel += 2;
            if (aliveWitch) threatLevel += 1;
            if (aliveHunter) threatLevel += 1;
        } else {
            if (!aliveSeer) threatLevel += 1;
            if (!aliveWitch) threatLevel += 1;
        }
        
        // 基于游戏天数
        if (dayNumber >= 3) threatLevel += 1;
        
        return Math.min(10, threatLevel);
    }
    
    // 识别可信玩家
    identifyTrustworthyPlayers(aiPlayer, alivePlayers) {
        const trustworthy = [];
        
        alivePlayers.forEach(player => {
            if (player === aiPlayer) return;
            
            let trustLevel = 0;
            
            // 同阵营玩家更可信
            if (aiPlayer.role === 'werewolf' && player.role === 'werewolf') {
                trustLevel += 10;
            } else if (aiPlayer.role !== 'werewolf' && player.role !== 'werewolf') {
                trustLevel += 5;
            }
            
            // 基于发言质量
            const speeches = this.chatMessages.filter(msg => msg.player === player.name);
            if (speeches.length > 0) {
                speeches.forEach(speech => {
                    if (speech.content && speech.content.includes('分析') || speech.content.includes('逻辑')) {
                        trustLevel += 1;
                    }
                    if (speech.content && speech.content.includes('团结') || speech.content.includes('配合')) {
                        trustLevel += 1;
                    }
                });
            }
            
            if (trustLevel > 3) {
                trustworthy.push({
                    player: player,
                    trustLevel: trustLevel
                });
            }
        });
        
        return trustworthy.sort((a, b) => b.trustLevel - a.trustLevel);
    }
    
    // 狼人身份声明策略（基于高级分析）
    getWerewolfIdentityStrategy(aiPlayer, gameState, context) {
        const { hasPlayerClaimedSeer, hasPlayerClaimedWitch, hasPlayerClaimedHunter, 
                aliveWerewolves, aliveGoodGuys, dayNumber, strategicAnalysis } = context;
        
        // 基于策略分析的决策
        if (strategicAnalysis.isCriticalMoment) {
            // 关键时刻，必须抢夺最有价值的身份
            if (!hasPlayerClaimedSeer) return 'seer';
            if (!hasPlayerClaimedHunter) return 'hunter';
            if (!hasPlayerClaimedWitch) return 'witch';
        }
        
        if (strategicAnalysis.shouldBeAggressive) {
            // 积极策略：抢夺神职身份
            if (!hasPlayerClaimedSeer && strategicAnalysis.threatLevel >= 5) return 'seer';
            if (!hasPlayerClaimedHunter && aliveWerewolves >= 2) return 'hunter';
            if (!hasPlayerClaimedWitch) return 'witch';
        }
        
        if (strategicAnalysis.shouldBeConservative) {
            // 保守策略：低调行事
            if (dayNumber === 1) return 'villager';
            // 后期如果没有神职被占，可以考虑抢夺
            if (!hasPlayerClaimedSeer && dayNumber >= 3) return 'seer';
        }
        
        // 默认策略：根据威胁等级决定
        if (strategicAnalysis.threatLevel >= 7) {
            // 高威胁：必须抢夺神职
            if (!hasPlayerClaimedSeer) return 'seer';
            if (!hasPlayerClaimedHunter) return 'hunter';
        } else if (strategicAnalysis.threatLevel >= 4) {
            // 中等威胁：选择性抢夺
            if (!hasPlayerClaimedSeer && strategicAnalysis.threatLevel >= 6) return 'seer';
            if (!hasPlayerClaimedWitch && strategicAnalysis.threatLevel >= 5) return 'witch';
        }
        
        return 'villager';
    }
    
    // 预言家身份声明策略（基于高级分析）
    getSeerIdentityStrategy(aiPlayer, gameState, context) {
        const { hasPlayerClaimedSeer, dayNumber, aliveWerewolves, strategicAnalysis } = context;
        
        // 如果已经有人声称预言家，必须立即对抗
        if (hasPlayerClaimedSeer) {
            return 'seer'; // 必须跳预言家对抗假预言家
        }
        
        // 关键时刻必须跳出来
        if (strategicAnalysis.isCriticalMoment) {
            return 'seer';
        }
        
        // 狼人占优势时，预言家必须尽快跳出指导好人
        if (strategicAnalysis.isWerewolfWinning || strategicAnalysis.threatLevel >= 6) {
            return 'seer';
        }
        
        // 基于威胁等级和局势判断
        if (strategicAnalysis.threatLevel >= 4 && dayNumber >= 2) {
            return 'seer';
        }
        
        // 如果狼人数量多且是第一天，可以考虑跳出
        if (aliveWerewolves >= 3 && dayNumber === 1) {
            return 'seer';
        }
        
        // 第一天保守策略：观察局势
        if (dayNumber === 1 && strategicAnalysis.shouldBeConservative) {
            return null;
        }
        
        // 默认在第二天跳出
        if (dayNumber >= 2) {
            return 'seer';
        }
        
        return null;
    }
    
    // 女巫身份声明策略（基于高级分析）
    getWitchIdentityStrategy(aiPlayer, gameState, context) {
        const { hasPlayerClaimedWitch, hasPlayerClaimedSeer, dayNumber, strategicAnalysis } = context;
        
        // 如果有假女巫，必须跳出来对抗
        if (hasPlayerClaimedWitch) {
            return 'witch';
        }
        
        // 关键时刻，女巫需要表明身份配合团队
        if (strategicAnalysis.isCriticalMoment && dayNumber >= 2) {
            return 'witch';
        }
        
        // 如果预言家已经跳出且局势紧张，女巫配合
        if (hasPlayerClaimedSeer && strategicAnalysis.threatLevel >= 5) {
            return 'witch';
        }
        
        // 狼人占优势时，女巫需要跳出来稳定局势
        if (strategicAnalysis.isWerewolfWinning && dayNumber >= 2) {
            return 'witch';
        }
        
        // 后期游戏，女巫可以考虑跳出
        if (dayNumber >= 3 && strategicAnalysis.threatLevel >= 3) {
            return 'witch';
        }
        
        // 否则保持低调
        return null;
    }
    
    // 猎人身份声明策略（基于高级分析）
    getHunterIdentityStrategy(aiPlayer, gameState, context) {
        const { hasPlayerClaimedHunter, dayNumber, aliveWerewolves, strategicAnalysis } = context;
        
        // 如果有假猎人，必须立即跳出来对抗
        if (hasPlayerClaimedHunter) {
            return 'hunter';
        }
        
        // 关键时刻，猎人需要跳出来威慑
        if (strategicAnalysis.isCriticalMoment) {
            return 'hunter';
        }
        
        // 如果自己被高度怀疑，跳猎人自保
        const isSuspected = gameState.suspiciousPlayers && 
                           gameState.suspiciousPlayers.some(sp => sp.player === aiPlayer);
        if (isSuspected && strategicAnalysis.threatLevel >= 4) {
            return 'hunter';
        }
        
        // 狼人占优势时，猎人需要跳出来威慑
        if (strategicAnalysis.isWerewolfWinning && dayNumber >= 2) {
            return 'hunter';
        }
        
        // 高威胁等级时跳出来
        if (strategicAnalysis.threatLevel >= 6) {
            return 'hunter';
        }
        
        // 后期游戏，猎人可以跳出来威慑狼人
        if (dayNumber >= 3 && strategicAnalysis.threatLevel >= 3) {
            return 'hunter';
        }
        
        return null;
    }
    
    // 村民身份声明策略（基于高级分析）
    getVillagerIdentityStrategy(aiPlayer, gameState, context) {
        const { hasPlayerClaimedSeer, hasPlayerClaimedWitch, hasPlayerClaimedHunter,
                dayNumber, aliveWerewolves, strategicAnalysis } = context;
        
        // 如果神职都有人声称了，村民就老实承认
        if (hasPlayerClaimedSeer && hasPlayerClaimedWitch && hasPlayerClaimedHunter) {
            return 'villager';
        }
        
        // 关键时刻，村民可以伪装神职来混淆视听
        if (strategicAnalysis.isCriticalMoment && !strategicAnalysis.isGoodGuyWinning) {
            if (!hasPlayerClaimedSeer) return 'seer';
            if (!hasPlayerClaimedHunter) return 'hunter';
            if (!hasPlayerClaimedWitch) return 'witch';
        }
        
        // 狼人占优势时，村民需要伪装神职分散注意力
        if (strategicAnalysis.isWerewolfWinning || strategicAnalysis.threatLevel >= 5) {
            // 选择一个没人声称的神职，优先选择预言家
            if (!hasPlayerClaimedSeer && strategicAnalysis.threatLevel >= 6) return 'seer';
            if (!hasPlayerClaimedHunter && strategicAnalysis.threatLevel >= 7) return 'hunter';
            if (!hasPlayerClaimedWitch && strategicAnalysis.threatLevel >= 8) return 'witch';
        }
        
        // 如果自己被怀疑，可以伪装神职自保
        const isSuspected = gameState.suspiciousPlayers && 
                           gameState.suspiciousPlayers.some(sp => sp.player === aiPlayer);
        if (isSuspected && dayNumber >= 2) {
            if (!hasPlayerClaimedHunter) return 'hunter'; // 猎人最安全
            if (!hasPlayerClaimedWitch) return 'witch';
        }
        
        // 第一天保守策略：诚实
        if (dayNumber === 1 && strategicAnalysis.shouldBeConservative) {
            return 'villager';
        }
        
        // 后期可以策略性伪装
        if (dayNumber >= 3 && strategicAnalysis.threatLevel >= 3) {
            if (!hasPlayerClaimedSeer && strategicAnalysis.threatLevel >= 5) return 'seer';
        }
        
        return 'villager'; // 默认诚实
    }
    
    // 识别可疑玩家
    // 智能识别可疑玩家（基于多维度分析）
    identifySuspiciousPlayers(aiPlayer) {
        const suspiciousPlayers = [];
        const alivePlayers = this.players.filter(p => p.isAlive && p !== aiPlayer);
        const totalPlayers = this.players.filter(p => p.isAlive).length;
        const werewolfCount = this.players.filter(p => p.isAlive && p.role === 'werewolf').length;
        const gameState = this.getGameState();
        
        alivePlayers.forEach(player => {
            let suspicionLevel = 0;
            
            // 1. 基础角色分析
            if (aiPlayer.role === 'werewolf' && player.role !== 'werewolf') {
                suspicionLevel += 2; // 狼人眼中的好人（需要误导的目标）
            } else if (aiPlayer.role !== 'werewolf' && player.role === 'werewolf') {
                suspicionLevel += 8; // 好人眼中的狼人（真正的威胁）
            }
            
            // 2. 发言行为分析
            const speechCount = this.chatHistory.filter(msg => msg.player === player.name).length;
            if (speechCount === 0) {
                suspicionLevel += 4; // 完全不发言很可疑
            } else if (speechCount === 1) {
                suspicionLevel += 2; // 发言太少可疑
            } else if (speechCount > 4) {
                suspicionLevel += 1; // 发言过多可能在刷存在感
            }
            
            // 3. 身份声明分析
            const claimedRole = this.getPlayerClaimedRole(player.name);
            if (claimedRole) {
                if (claimedRole !== player.role) {
                    suspicionLevel += 6; // 虚假身份声明
                } else if (claimedRole === 'seer' && this.day > 1) {
                    // 真预言家但没有提供查验信息
                    const hasVerificationInfo = this.chatHistory.some(msg => 
                        msg.player === player.name && 
                        (msg.content.includes('查验') || msg.content.includes('金水') || msg.content.includes('狼人'))
                    );
                    if (!hasVerificationInfo) {
                        suspicionLevel += 3;
                    }
                }
            }
            
            // 4. 投票行为分析
            if (this.votingHistory && this.votingHistory.length > 0) {
                const recentVotes = this.votingHistory.slice(-2); // 最近两轮投票
                recentVotes.forEach(voteRound => {
                    if (voteRound[player.name]) {
                        const votedPlayer = this.players.find(p => p.name === voteRound[player.name]);
                        if (votedPlayer) {
                            if (aiPlayer.role === 'werewolf' && votedPlayer.role === 'werewolf') {
                                suspicionLevel += 3; // 投票给狼人队友（好人行为）
                            } else if (aiPlayer.role !== 'werewolf' && votedPlayer.role !== 'werewolf') {
                                suspicionLevel += 2; // 投票给好人（可疑行为）
                            }
                        }
                    }
                });
            }
            
            // 5. 死亡分析
            if (this.deadPlayers.length > 0) {
                const lastDead = this.deadPlayers[this.deadPlayers.length - 1];
                if (lastDead.role === 'seer' || lastDead.role === 'witch') {
                    // 神职死亡后，分析谁可能获益
                    if (aiPlayer.role !== 'werewolf') {
                        // 好人视角：神职死亡对狼人有利
                        if (player.role === 'werewolf') {
                            suspicionLevel += 2;
                        }
                    }
                }
            }
            
            // 6. 发言内容情感分析
            const playerSpeeches = this.chatHistory.filter(msg => msg.player === player.name);
            playerSpeeches.forEach(speech => {
                // 过度强调可信度
                if (speech.content.includes('相信我') || speech.content.includes('绝对')) {
                    suspicionLevel += 1;
                }
                // 主动分析和推理
                if (speech.content.includes('我觉得') && speech.content.includes('可疑')) {
                    suspicionLevel -= 1;
                }
                // 强调团结合作
                if (speech.content.includes('团结') || speech.content.includes('配合')) {
                    suspicionLevel -= 0.5;
                }
                // 威胁性言论（可能是猎人）
                if (speech.content.includes('带走') || speech.content.includes('报仇')) {
                    if (player.role === 'hunter') {
                        suspicionLevel -= 1; // 真猎人的威胁
                    } else {
                        suspicionLevel += 1; // 假装猎人
                    }
                }
            });
            
            // 7. 局势紧张度分析
            if (werewolfCount >= totalPlayers / 2) {
                // 狼人接近胜利时，所有人都更可疑
                suspicionLevel += 1;
            }
            
            // 8. 时间压力分析
            if (this.day >= 3) {
                // 游戏后期，增加分析权重
                suspicionLevel *= 1.2;
            }
            
            // 9. 行为一致性分析（替代随机因素）
            if (speechCount < this.day) {
                suspicionLevel += 0.3; // 发言过少
            } else if (speechCount > this.day * 2) {
                suspicionLevel += 0.2; // 发言过多
            }
            
            // 确保可疑度在合理范围内
            suspicionLevel = Math.max(0, suspicionLevel);
            
            if (suspicionLevel > 1) {
                suspiciousPlayers.push({
                    player: player,
                    suspicionLevel: suspicionLevel
                });
            }
        });
        
        // 按可疑度排序
        return suspiciousPlayers.sort((a, b) => b.suspicionLevel - a.suspicionLevel);
    }
    
    // 获取玩家声明的角色
    getPlayerClaimedRole(playerName) {
        if (!this.identityClaims) return null;
        return this.identityClaims[playerName] || null;
    }
    
    // 狼人发言策略（基于心理博弈和策略分析）
    generateWerewolfSpeech(aiPlayer, gameState) {
        const alivePlayers = gameState.alivePlayers;
        const hasClaimedSeer = this.hasPlayerClaimedRole('seer');
        const hasClaimedWitch = this.hasPlayerClaimedRole('witch');
        const deadPlayers = gameState.deadPlayers;
        const suspiciousPlayers = gameState.suspiciousPlayers || [];
        const chatHistory = gameState.chatHistory || [];
        
        // 动态生成更智能的发言
        const speechElements = [];
        
        if (gameState.day === 1) {
            // 第一天：建立信任基础
            const openings = [
                '大家好，我觉得今天的讨论很重要',
                '昨晚发生的事情让我很震惊',
                '我们需要冷静分析当前的局势',
                '作为村民，我有责任帮助大家找出真相'
            ];
            
            const analyses = [
                '，我们应该仔细观察每个人的言行举止',
                '，狼人一定会在我们中间伪装成好人',
                '，我建议大家都说出自己的想法和观察',
                '，我们要用逻辑推理而不是感情用事'
            ];
            
            const conclusions = [
                '。让我们团结一致，找出隐藏的狼人！',
                '。我相信正义终将战胜邪恶。',
                '。我会全力配合大家的决定。',
                '。希望大家都能坦诚相待。'
            ];
            
            // 基于角色选择发言风格
            const openingIndex = player.role.name === 'werewolf' ? 0 : (player.role.name === 'seer' ? 1 : 2);
            const analysisIndex = hasClaimedSeer ? 1 : 0;
            const conclusionIndex = player.role.name === 'werewolf' ? 3 : 0;
            
            speechElements.push(
                openings[openingIndex] +
                analyses[analysisIndex] +
                conclusions[conclusionIndex]
            );
        } else {
            // 后续天数：基于专业策略的发言
            
            // 策略1：分析死者情况（基于角色的理性分析）
            if (deadPlayers.length > 0) {
                const lastDead = deadPlayers[deadPlayers.length - 1];
                const deathAnalyses = [
                    `${lastDead.name}的死亡很可惜，我们失去了一个重要的好人`,
                    `从${lastDead.name}被刀来看，狼人的目标很明确`,
                    `${lastDead.name}昨天的发言很有道理，可能因此成为目标`,
                    `我们要分析${lastDead.name}的死因，找出狼人的策略`
                ];
                // 狼人伪装同情，好人分析原因
                const analysisIndex = player.role.name === 'werewolf' ? 0 : 
                    (lastDead.role && ['seer', 'witch', 'hunter'].includes(lastDead.role.name) ? 1 : 2);
                speechElements.push(deathAnalyses[analysisIndex]);
            }
            
            // 策略2：倒钩真预言家（狼人专用策略）
            if (hasClaimedSeer && player.role.name === 'werewolf') {
                const hookSpeeches = [
                    '我认为预言家的分析很有道理，逻辑很清晰',
                    '预言家提供的信息对我们很重要，我倾向于相信',
                    '从发言风格来看，预言家应该是真的',
                    '我一直在观察预言家的表现，感觉比较可信'
                ];
                // 狼人根据预言家威胁程度选择倒钩强度
                const seerThreat = this.players.find(p => p.isAlive && p.identityClaim?.identity === 'seer');
                const hookIndex = seerThreat && seerThreat.role.name === 'seer' ? 1 : 0;
                speechElements.push(hookSpeeches[hookIndex]);
            }
            
            // 策略3：污好人（狼人混淆视听策略）
            if (suspiciousPlayers.length > 0 && player.role.name === 'werewolf') {
                const goodTargets = suspiciousPlayers.filter(sp => sp.player.role.name !== 'werewolf');
                if (goodTargets.length > 0) {
                    // 优先污神职角色
                    const godRoleTargets = goodTargets.filter(sp => ['seer', 'witch', 'hunter'].includes(sp.player.role.name));
                    const target = godRoleTargets.length > 0 ? godRoleTargets[0] : goodTargets[0];
                    const suspicionSpeeches = [
                        `我注意到${target.player.name}的发言有些问题`,
                        `${target.player.name}的行为模式让我觉得可疑`,
                        `我建议大家重点关注${target.player.name}`,
                        `${target.player.name}可能在隐藏什么`
                    ];
                    // 根据目标角色选择污法强度
                    const speechIndex = ['seer', 'witch', 'hunter'].includes(target.player.role.name) ? 2 : 0;
                    speechElements.push(suspicionSpeeches[speechIndex]);
                }
            }
            
            // 策略4：制造好人对立（狼人分化策略）
            const goodPlayers = alivePlayers.filter(p => p.role.name !== 'werewolf' && p !== aiPlayer);
            if (goodPlayers.length >= 2 && player.role.name === 'werewolf') {
                // 优先挑拨神职角色之间的关系
                const godRoles = goodPlayers.filter(p => ['seer', 'witch', 'hunter'].includes(p.role.name));
                let player1, player2;
                if (godRoles.length >= 2) {
                    player1 = godRoles[0];
                    player2 = godRoles[1];
                } else if (godRoles.length === 1) {
                    player1 = godRoles[0];
                    player2 = goodPlayers.find(p => p !== player1);
                } else {
                    player1 = goodPlayers[0];
                    player2 = goodPlayers[1];
                }
                
                if (player1 && player2) {
                    const divideSpeeches = [
                        `我觉得${player1.name}和${player2.name}的互动有些奇怪`,
                        `${player1.name}总是在关键时刻支持${player2.name}`,
                        `${player1.name}和${player2.name}可能有什么默契`,
                        `我怀疑${player1.name}和${player2.name}之间有问题`
                    ];
                    // 根据挑拨对象选择策略
                    const speechIndex = godRoles.includes(player1) && godRoles.includes(player2) ? 3 : 0;
                    speechElements.push(divideSpeeches[speechIndex]);
                }
            }
            
            // 策略5：伪装理性分析（建立好人形象）
            const rationalSpeeches = [
                '我们要冷静分析，不能被情绪影响判断',
                '从逻辑角度来看，我们需要更多信息',
                '我一直在观察大家的发言模式',
                '作为好人，我会慎重考虑每一票',
                '我们要团结一致，找出真正的狼人',
                '理性分析比感性判断更重要'
            ];
            // 根据角色选择理性发言风格
            const rationalIndex = player.role.name === 'werewolf' ? 0 : 
                (player.role.name === 'seer' ? 2 : 4);
            speechElements.push(rationalSpeeches[rationalIndex]);
        }
        
        // 组合发言元素
        if (speechElements.length === 1) {
            return speechElements[0];
        } else {
            // 基于角色策略性组合元素
            const numElements = player.role.name === 'werewolf' ? 
                Math.min(speechElements.length, 3) : // 狼人发言更复杂
                Math.min(speechElements.length, 2);  // 好人发言简洁
            
            const selectedElements = [];
            // 按顺序选择最重要的发言元素
            for (let i = 0; i < numElements && i < speechElements.length; i++) {
                selectedElements.push(speechElements[i]);
            }
            
            return selectedElements.join('。') + '。';
        }
    }
    
    // 优化后的预言家发言策略（基于专业狼人杀策略）
    generateSeerSpeech(aiPlayer, gameState) {
        const hasClaimedSeer = this.hasPlayerClaimedRole('seer');
        const werewolves = gameState.alivePlayers.filter(p => p.role === 'werewolf');
        const deadPlayers = gameState.deadPlayers;
        const alivePlayers = gameState.alivePlayers;
        
        const speechElements = [];
        
        if (gameState.day === 1) {
            // 第一天：预言家发言三部曲 - 报查验、留警徽流、聊心路历程
            
            if (hasClaimedSeer) {
                // 有悍跳时，必须强势对抗
                speechElements.push('我才是真正的预言家！对方是狼人悍跳');
                
                // 1. 报查验结果（优先报查杀）
                if (werewolves.length > 0) {
                    const werewolf = werewolves[0];
                    speechElements.push(`我昨晚查验了${werewolf.name}，他是查杀！`);
                    
                    // 2. 留警徽流（查杀情况下的标准流法）
                    const remainingPlayers = alivePlayers.filter(p => p !== aiPlayer && p !== werewolf);
                    if (remainingPlayers.length >= 2) {
                        // 优先选择位置靠前和靠后的玩家作为警徽流
                        const sortedPlayers = remainingPlayers.sort((a, b) => a.position - b.position);
                        const player1 = sortedPlayers[0];
                        const player2 = sortedPlayers[sortedPlayers.length - 1];
                        speechElements.push(`我的警徽流是${player1.name}、${player2.name}，如果都是好人就撕警徽，如果都是查杀就给外置位，一好一坏给好人`);
                    }
                    
                    // 3. 心路历程（基于游戏天数选择合适的理由）
                    let reasoning;
                    if (this.day === 1) {
                        reasoning = `我选择查验${werewolf.name}是因为他的位置比较关键，需要确认身份`;
                    } else if (this.day === 2) {
                        reasoning = `${werewolf.name}昨天的发言有些可疑，所以我优先查验了他`;
                    } else {
                        reasoning = `根据前面的分析，${werewolf.name}最有可能是狼人，果然查出来是狼`;
                    }
                    speechElements.push(reasoning);
                    
                } else {
                    // 金水情况
                    const goodPlayer = alivePlayers.filter(p => p.role !== 'werewolf' && p !== aiPlayer)[0];
                    if (goodPlayer) {
                        speechElements.push(`我昨晚查验了${goodPlayer.name}，他是金水`);
                        
                        // 留警徽流
                        const remainingPlayers = alivePlayers.filter(p => p !== aiPlayer && p !== goodPlayer);
                        if (remainingPlayers.length >= 2) {
                            // 选择位置分散的玩家作为警徽流
                            const sortedPlayers = remainingPlayers.sort((a, b) => a.position - b.position);
                            const player1 = sortedPlayers[0];
                            const player2 = sortedPlayers[Math.floor(sortedPlayers.length / 2)];
                            speechElements.push(`我的警徽流是${player1.name}、${player2.name}`);
                        }
                        
                        // 心路历程
                        speechElements.push(`我查验${goodPlayer.name}是想确认他的身份，现在可以放心了`);
                    }
                }
                
            } else {
                // 没有悍跳时，标准预言家起跳
                speechElements.push('我是预言家，昨晚获得了重要信息');
                
                // 1. 报查验结果
                if (werewolves.length > 0) {
                    const werewolf = werewolves[0];
                    speechElements.push(`我查验了${werewolf.name}，他是狼人！`);
                    
                    // 2. 留警徽流
                    const remainingPlayers = alivePlayers.filter(p => p !== aiPlayer && p !== werewolf);
                    if (remainingPlayers.length >= 2) {
                        // 选择位置分散的玩家作为警徽流
                        const sortedPlayers = remainingPlayers.sort((a, b) => a.position - b.position);
                        const player1 = sortedPlayers[0];
                        const player2 = sortedPlayers[sortedPlayers.length - 1];
                        speechElements.push(`警徽流${player1.name}、${player2.name}，请大家记住`);
                    }
                    
                    // 3. 心路历程和后续计划
                    speechElements.push(`今天我们必须出掉${werewolf.name}，然后我继续查验其他可疑的人`);
                    
                } else {
                    // 金水情况
                    const goodPlayer = alivePlayers.filter(p => p.role !== 'werewolf' && p !== aiPlayer)[0];
                    if (goodPlayer) {
                        speechElements.push(`我查验了${goodPlayer.name}，他是好人`);
                        
                        // 留警徽流（重点查验可疑的人）
                        const suspiciousPlayers = alivePlayers.filter(p => p !== aiPlayer && p !== goodPlayer);
                        if (suspiciousPlayers.length >= 2) {
                            const player1 = suspiciousPlayers[Math.floor(Math.random() * suspiciousPlayers.length)];
                            const player2 = suspiciousPlayers.filter(p => p !== player1)[0];
                            speechElements.push(`警徽流${player1.name}、${player2.name}，我会重点查验可疑的人`);
                        }
                        
                        speechElements.push(`${goodPlayer.name}是我的金水，大家可以信任他`);
                    }
                }
            }
            
        } else {
            // 后续天数：基于专业策略的发言
            
            // 策略1：公布查验结果（强势或跪式）
            if (werewolves.length > 0) {
                const werewolf = werewolves[Math.floor(Math.random() * werewolves.length)];
                
                // 强势打法：直接要求出局
                const strongSpeeches = [
                    `我昨晚查验了${werewolf.name}，他是查杀！今天必须出掉他`,
                    `${werewolf.name}就是狼人，这是我的查验结果，不容质疑`,
                    `我以预言家的身份确认，${werewolf.name}是狼人，请大家投票出局他`
                ];
                
                // 跪式打法：温和劝导
                const gentleSpeeches = [
                    `我查验了${werewolf.name}，虽然结果是查杀，但我希望大家冷静分析`,
                    `${werewolf.name}的查验结果让我很意外，希望他能解释一下`,
                    `我不想冤枉任何人，但${werewolf.name}确实是我的查杀`
                ];
                
                const useStrong = Math.random() < 0.6;
                const speeches = useStrong ? strongSpeeches : gentleSpeeches;
                speechElements.push(speeches[Math.floor(Math.random() * speeches.length)]);
                
            } else {
                // 发金水
                const goodPlayers = alivePlayers.filter(p => p.role !== 'werewolf' && p !== aiPlayer);
                if (goodPlayers.length > 0) {
                    const goodPlayer = goodPlayers[Math.floor(Math.random() * goodPlayers.length)];
                    speechElements.push(`我昨晚查验了${goodPlayer.name}，他是金水，大家可以信任`);
                }
            }
            
            // 策略2：更新警徽流（基于场上局势）
            const remainingPlayers = alivePlayers.filter(p => p !== aiPlayer);
            if (remainingPlayers.length >= 2 && Math.random() < 0.5) {
                const player1 = remainingPlayers[Math.floor(Math.random() * remainingPlayers.length)];
                const player2 = remainingPlayers.filter(p => p !== player1)[0];
                if (player1 && player2) {
                    speechElements.push(`我更新警徽流为${player1.name}、${player2.name}，会重点关注可疑行为`);
                }
            }
            
            // 策略3：视野覆盖（关注每位玩家）
            if (deadPlayers.length > 0 && Math.random() < 0.4) {
                const lastDead = deadPlayers[deadPlayers.length - 1];
                const analysisSpeeches = [
                    `${lastDead.name}的死亡模式告诉我们，狼人在有计划地行动`,
                    `从${lastDead.name}被刀来看，狼人可能在针对特定目标`,
                    `${lastDead.name}的发言记录值得我们重新分析`
                ];
                speechElements.push(analysisSpeeches[Math.floor(Math.random() * analysisSpeeches.length)]);
            }
            
            // 策略4：回击质疑（沉着应对）
            const responseSpeeches = [
                '对于质疑我身份的人，我会用查验结果来证明自己',
                '我理解大家的怀疑，但请仔细分析我的逻辑链',
                '真假预言家的区别在于查验的准确性，时间会证明一切',
                '我愿意接受大家的监督，但请给我证明的机会'
            ];
            if (Math.random() < 0.3) {
                speechElements.push(responseSpeeches[Math.floor(Math.random() * responseSpeeches.length)]);
            }
            
            // 策略5：团队协作
            const teamworkSpeeches = [
                '我需要神职玩家的配合，特别是女巫和猎人',
                '好人要团结一致，不能被狼人分化',
                '我会为大家提供准确的信息，请相信我的判断',
                '我们的目标是一致的，就是找出所有狼人'
            ];
            if (Math.random() < 0.4) {
                speechElements.push(teamworkSpeeches[Math.floor(Math.random() * teamworkSpeeches.length)]);
            }
        }
        
        // 组合发言元素
        if (speechElements.length === 1) {
            return speechElements[0];
        } else {
            // 随机组合2-3个元素
            const numElements = Math.min(speechElements.length, Math.floor(Math.random() * 2) + 2);
            const selectedElements = [];
            const usedIndices = new Set();
            
            for (let i = 0; i < numElements; i++) {
                let index;
                do {
                    index = Math.floor(Math.random() * speechElements.length);
                } while (usedIndices.has(index));
                usedIndices.add(index);
                selectedElements.push(speechElements[index]);
            }
            
            return selectedElements.join('。') + '。';
        }
    }
    
    // 优化后的女巫发言策略（基于专业狼人杀策略）
    generateWitchSpeech(aiPlayer, gameState) {
        const speechElements = [];
        const hasClaimedWitch = this.hasPlayerClaimedRole('witch');
        const hasClaimedSeer = this.hasPlayerClaimedRole('seer');
        const werewolves = gameState.alivePlayers.filter(p => p.role === 'werewolf');
        const deadPlayers = gameState.deadPlayers;
        const alivePlayers = gameState.alivePlayers;
        
        if (gameState.day === 1) {
            if (hasClaimedWitch) {
                // 有悍跳女巫时，必须强势对抗并证明身份
                speechElements.push('我才是真正的女巫！对方是狼人悍跳女巫');
                
                // 提供昨晚信息证明身份（女巫知道昨晚谁死了，是否被救）
                if (deadPlayers.length > 0) {
                    const lastDead = deadPlayers[deadPlayers.length - 1];
                    speechElements.push(`我可以告诉大家昨晚${lastDead.name}确实死了，我知道具体情况`);
                } else {
                    speechElements.push('昨晚是平安夜，我知道具体的救人情况');
                }
                
                // 威慑假女巫
                speechElements.push('假女巫说不出昨晚的真实情况，我有解药和毒药来证明身份');
                
            } else {
                // 没有悍跳时，女巫标准隐藏身份打法
                const hiddenSpeeches = [
                    '我是好人，现在先表水干净',
                    '我会仔细观察大家的发言，寻找可疑的地方',
                    '我支持预言家的判断，神职之间要相互配合',
                    '我觉得我们要冷静分析，不要被狼人带节奏',
                    '我会在关键时刻站出来帮助好人'
                ];
                speechElements.push(hiddenSpeeches[Math.floor(Math.random() * hiddenSpeeches.length)]);
                
                // 暗示关注夜晚信息（女巫特有的视角）
                const nightHints = [
                    '昨晚的情况很值得我们分析',
                    '夜晚发生的事情往往包含重要线索',
                    '我们要仔细分析死亡情况和救人情况',
                    '夜晚的信息对判断局势很重要'
                ];
                speechElements.push(nightHints[Math.floor(Math.random() * nightHints.length)]);
            }
        } else {
            // 后续天数：基于专业策略的发言
            
            // 策略1：暗示药剂使用情况（不直接暴露身份）
            if (deadPlayers.length > 0 && Math.random() < 0.4) {
                const lastDead = deadPlayers[deadPlayers.length - 1];
                const potionHints = [
                    `${lastDead.name}的死让我很痛心，如果有人能救他就好了`,
                    `昨晚的死亡情况很值得分析，是否有人被救过`,
                    '有时候救人比杀人更重要，希望神职能明智使用技能',
                    '夜晚的生死情况往往隐藏着重要信息'
                ];
                speechElements.push(potionHints[Math.floor(Math.random() * potionHints.length)]);
            }
            
            // 策略2：配合预言家（隐藏身份的支持）
            if (hasClaimedSeer && Math.random() < 0.3) {
                const supportSpeeches = [
                    '我相信预言家的判断，神职之间要相互配合',
                    '预言家的信息很重要，我们要保护好他',
                    '如果预言家说得对，我们就应该相信他',
                    '神职玩家要团结，才能对抗狼人'
                ];
                speechElements.push(supportSpeeches[Math.floor(Math.random() * supportSpeeches.length)]);
            }
            
            // 策略3：威慑狼人（暗示有毒药）
            if (werewolves.length > 0 && Math.random() < 0.3) {
                const threatSpeeches = [
                    '狼人要小心了，神职玩家不是好惹的',
                    '我一直在观察，谁的行为可疑我心里有数',
                    '如果确定了狼人身份，神职会有相应的行动',
                    '狼人的每一步都在神职的监控之下'
                ];
                speechElements.push(threatSpeeches[Math.floor(Math.random() * threatSpeeches.length)]);
            }
            
            // 策略4：分析局势（女巫视角）
            const analysisSpeeches = [
                '我昨晚观察到了一些重要信息',
                '夜晚的情况为我们提供了判断线索',
                '我会在关键时刻发挥作用',
                '相信我，我站在好人这一边',
                '我的判断基于夜晚获得的信息',
                '神职玩家要在关键时刻挺身而出'
            ];
            speechElements.push(analysisSpeeches[Math.floor(Math.random() * analysisSpeeches.length)]);
        }
        
        // 组合发言元素
        if (speechElements.length === 1) {
            return speechElements[0];
        } else {
            // 随机组合1-2个元素
            const numElements = Math.min(speechElements.length, Math.floor(Math.random() * 2) + 1);
            const selectedElements = [];
            const usedIndices = new Set();
            
            for (let i = 0; i < numElements; i++) {
                let index;
                do {
                    index = Math.floor(Math.random() * speechElements.length);
                } while (usedIndices.has(index));
                usedIndices.add(index);
                selectedElements.push(speechElements[index]);
            }
            
            return selectedElements.join('。') + '。';
        }
    }
    
    // 优化后的猎人发言策略（基于专业狼人杀策略）
    generateHunterSpeech(aiPlayer, gameState) {
        const speechElements = [];
        const hasClaimedHunter = this.hasPlayerClaimedRole('hunter');
        const hasClaimedSeer = this.hasPlayerClaimedRole('seer');
        const werewolves = gameState.alivePlayers.filter(p => p.role === 'werewolf');
        const alivePlayers = gameState.alivePlayers;
        const deadPlayers = gameState.deadPlayers;
        
        if (gameState.day === 1) {
            if (hasClaimedHunter) {
                // 有悍跳猎人时，强势对抗
                speechElements.push('我才是真正的猎人！对方是狼人悍跳猎人');
                
                // 威慑对跳者
                speechElements.push('今天白天请好人从我和悍跳的狼人中选择一个出局');
                speechElements.push('如果不幸我出局，我将开枪带走悍跳我的狼人');
                
            } else {
                // 没有悍跳时，猎人标准隐藏身份打法
                const hiddenSpeeches = [
                    '我是好人，现在先表水干净',
                    '我会仔细观察大家的发言和行为',
                    '我支持预言家的判断，会配合神职行动',
                    '我觉得我们要团结一致，找出狼人',
                    '我会在关键时刻站出来帮助好人'
                ];
                speechElements.push(hiddenSpeeches[Math.floor(Math.random() * hiddenSpeeches.length)]);
                
                // 暗示威慑（不能太明显暴露身份）
                const subtleThreats = [
                    '我相信正义终将战胜邪恶',
                    '狼人的行为不会没有代价',
                    '我会保护好人，对抗邪恶势力',
                    '我有我的方式来对付狼人'
                ];
                speechElements.push(subtleThreats[Math.floor(Math.random() * subtleThreats.length)]);
            }
        } else {
            // 后续天数：基于专业策略的发言
            
            // 策略1：适时威慑（不过度暴露身份）
            if (Math.random() < 0.4) {
                const deterrentSpeeches = [
                    '我一直在观察，如果有人想要对我不利，会有相应的后果',
                    '我有我的方式来对付可疑的人',
                    '狼人们最好小心点，好人不是那么容易对付的',
                    '如果我遇到危险，我不会坐以待毙',
                    '我会用我的方式保护好人阵营'
                ];
                speechElements.push(deterrentSpeeches[Math.floor(Math.random() * deterrentSpeeches.length)]);
            }
            
            // 策略2：保护神职（隐藏身份的支持）
            if (hasClaimedSeer && Math.random() < 0.3) {
                const protectionSpeeches = [
                    '我会全力保护预言家，他是我们的重要信息来源',
                    '预言家的安全关系到好人的胜利',
                    '我们要团结保护神职玩家',
                    '神职玩家是狼人的重点目标，我们要保护好他们'
                ];
                speechElements.push(protectionSpeeches[Math.floor(Math.random() * protectionSpeeches.length)]);
            }
            
            // 策略3：锁定可疑目标（暗示有反击能力）
            if (werewolves.length > 0 && Math.random() < 0.3) {
                const werewolf = werewolves[Math.floor(Math.random() * werewolves.length)];
                const targetSpeeches = [
                    `我已经注意到${werewolf.name}的可疑行为，会重点关注他`,
                    `${werewolf.name}的发言让我觉得很有问题`,
                    '我心里已经有了怀疑目标，会密切观察',
                    '如果确定了狼人身份，我会采取行动'
                ];
                speechElements.push(targetSpeeches[Math.floor(Math.random() * targetSpeeches.length)]);
            }
            
            // 策略4：分析死亡情况（猎人视角）
            if (deadPlayers.length > 0 && Math.random() < 0.4) {
                const lastDead = deadPlayers[deadPlayers.length - 1];
                const analysisSpeeches = [
                    `${lastDead.name}的死让我很愤怒，凶手必须付出代价`,
                    '每一个无辜的死亡都让我更加坚定要找出狼人',
                    `${lastDead.name}的死亡模式值得我们分析`,
                    '狼人的刀法暴露了他们的策略'
                ];
                speechElements.push(analysisSpeeches[Math.floor(Math.random() * analysisSpeeches.length)]);
            }
            
            // 策略5：表明立场（不暴露身份）
            const stanceSpeeches = [
                '我会用我的方式对付狼人',
                '大家要相信我，我绝对是好人',
                '我会为好人阵营争取胜利',
                '我的目标就是保护村庄的和平',
                '我会保护好人，绝不让狼人得逞',
                '我站在正义这一边，会对抗邪恶势力'
            ];
            speechElements.push(stanceSpeeches[Math.floor(Math.random() * stanceSpeeches.length)]);
        }
        
        // 组合发言元素
        if (speechElements.length === 1) {
            return speechElements[0];
        } else {
            // 随机组合1-2个元素
            const numElements = Math.min(speechElements.length, Math.floor(Math.random() * 2) + 1);
            const selectedElements = [];
            const usedIndices = new Set();
            
            for (let i = 0; i < numElements; i++) {
                let index;
                do {
                    index = Math.floor(Math.random() * speechElements.length);
                } while (usedIndices.has(index));
                usedIndices.add(index);
                selectedElements.push(speechElements[index]);
            }
            
            return selectedElements.join('。') + '。';
        }
    }
    
    // 村民发言策略（基于专业逻辑分析和挡刀策略）
    generateVillagerSpeech(aiPlayer, gameState) {
        const hasClaimedSeer = this.hasPlayerClaimedRole('seer');
        const hasClaimedWitch = this.hasPlayerClaimedRole('witch');
        const hasClaimedHunter = this.hasPlayerClaimedRole('hunter');
        const werewolves = gameState.alivePlayers.filter(p => p.role === 'werewolf');
        const deadPlayers = gameState.deadPlayers;
        const suspiciousPlayers = gameState.suspiciousPlayers || [];
        const chatHistory = gameState.chatHistory || [];
        const alivePlayers = gameState.alivePlayers;
        
        const speechElements = [];
        
        if (gameState.day === 1) {
            // 第一天：专业平民策略
            
            // 策略1：明确表水身份（避免被误认为神职）
            const identityStatements = [
                '我是平民，昨晚平安夜，没有任何信息',
                '我是村民，只能通过发言来分析局势',
                '作为平民，我会认真分析每个人的逻辑',
                '我是普通村民，会配合神职找出狼人'
            ];
            speechElements.push(identityStatements[Math.floor(Math.random() * identityStatements.length)]);
            
            // 策略2：展现逻辑分析能力（建立可信度）
            const analysisAttitudes = [
                '第一天信息有限，但我们要抓住每个细节',
                '我会从发言的逻辑性和时机来判断',
                '观察每个人的言行举止，寻找破绽',
                '理性分析比感性判断更重要'
            ];
            speechElements.push(analysisAttitudes[Math.floor(Math.random() * analysisAttitudes.length)]);
            
            // 策略3：对神职的合理期待（不过度依赖）
            if (Math.random() < 0.6) {
                const godExpectations = [
                    '希望预言家能站出来提供信息',
                    '神职的信息很重要，但我们也要独立思考',
                    '期待预言家给出明确方向',
                    '神职玩家请在合适时机发声'
                ];
                speechElements.push(godExpectations[Math.floor(Math.random() * godExpectations.length)]);
            }
            
            // 策略4：团队意识（但不过度表现）
            const teamworkStatements = [
                '好人要团结，不能被狼人分化',
                '我会慎重考虑每一票',
                '我们要相互配合，找出真相',
                '理性投票，不跟风不冲动'
            ];
            speechElements.push(teamworkStatements[Math.floor(Math.random() * teamworkStatements.length)]);
            
        } else {
            // 后续天数：专业平民的深度分析策略
            
            // 策略1：死亡分析（平民视角的逻辑推理）
            if (deadPlayers.length > 0 && Math.random() < 0.5) {
                const lastDead = deadPlayers[deadPlayers.length - 1];
                const deathAnalyses = [
                    `从${lastDead.name}被刀来看，狼人的目标很明确`,
                    `${lastDead.name}昨天的发言可能触及了狼人的痛点`,
                    `狼人选择刀${lastDead.name}，说明他的身份或信息很重要`,
                    `分析${lastDead.name}的死因，能帮我们找到线索`
                ];
                speechElements.push(deathAnalyses[Math.floor(Math.random() * deathAnalyses.length)]);
            }
            
            // 策略2：发言逻辑分析（展现分析能力）
            if (Math.random() < 0.4) {
                const logicAnalyses = [
                    '我仔细分析了昨天的发言，发现了一些问题',
                    '从发言时机和内容来看，有些人的动机可疑',
                    '某些玩家的发言前后矛盾，值得关注',
                    '通过对比发言逻辑，我有了一些判断'
                ];
                speechElements.push(logicAnalyses[Math.floor(Math.random() * logicAnalyses.length)]);
            }
            
            // 策略3：具体怀疑分析（基于逻辑推理）
            if (suspiciousPlayers.length > 0 && Math.random() < 0.4) {
                const target = suspiciousPlayers[0].player;
                const suspicionReasons = [
                    `${target.name}的发言时机有问题，总是避重就轻`,
                    `我觉得${target.name}在刻意引导节奏`,
                    `${target.name}的逻辑链条有漏洞`,
                    `${target.name}对神职的态度很微妙`
                ];
                speechElements.push(suspicionReasons[Math.floor(Math.random() * suspicionReasons.length)]);
            }
            
            // 策略4：支持神职决策（但保持独立思考）
            if (hasClaimedSeer && Math.random() < 0.4) {
                const seerSupport = [
                    '我倾向于相信预言家的判断',
                    '预言家的信息是重要参考',
                    '我会结合预言家的信息做判断',
                    '预言家的查验结果值得重视'
                ];
                speechElements.push(seerSupport[Math.floor(Math.random() * seerSupport.length)]);
            }
            
            // 策略5：局势分析（平民的理性思考）
            const situationAnalyses = [
                '从目前局势看，我们要更加谨慎',
                '狼人的策略在变化，我们要适应',
                '时间紧迫，我们要抓住机会',
                '每一票都关键，不能浪费',
                '我们要冷静分析，理性投票',
                '好人要团结，但也要独立思考'
            ];
            speechElements.push(situationAnalyses[Math.floor(Math.random() * situationAnalyses.length)]);
        }
        
        // 组合发言元素（确保逻辑连贯）
        if (speechElements.length <= 2) {
            return speechElements.join('。') + '。';
        } else {
            // 选择2-3个最相关的元素
            const selectedElements = speechElements.slice(0, Math.min(3, speechElements.length));
            return selectedElements.join('。') + '。';
        }
    }
    
    // 优化后的9人局狼队策略发言系统
    generateWerewolfSpeech(aiPlayer, gameState) {
        const alivePlayers = gameState.alivePlayers;
        const werewolves = alivePlayers.filter(p => p.role === 'werewolf');
        const hasClaimedSeer = this.hasPlayerClaimedRole('seer');
        const hasClaimedWitch = this.hasPlayerClaimedRole('witch');
        const deadPlayers = gameState.deadPlayers;
        const suspiciousPlayers = gameState.suspiciousPlayers || [];
        
        // 确定狼队角色分工
        const wolfRole = this.determineWolfRole(aiPlayer, werewolves, gameState);
        
        const speechElements = [];
        
        if (gameState.day === 1) {
            // 第一天：根据狼队分工执行不同策略
            switch (wolfRole) {
                case 'jumper': // 悍跳狼
                    return this.generateJumperSpeech(aiPlayer, gameState);
                case 'charger': // 冲锋狼
                    return this.generateChargerSpeech(aiPlayer, gameState);
                case 'hooker': // 倒钩狼
                    return this.generateHookerSpeech(aiPlayer, gameState);
                case 'deepwater': // 深水狼
                    return this.generateDeepwaterSpeech(aiPlayer, gameState);
                default:
                    return this.generateDefaultWolfSpeech(aiPlayer, gameState);
            }
        } else {
            // 后续天数：根据场上局势调整策略
            return this.generateAdvancedWolfSpeech(aiPlayer, gameState, wolfRole);
        }
    }
    
    // 确定狼队角色分工
    determineWolfRole(aiPlayer, werewolves, gameState) {
        const playerIndex = werewolves.indexOf(aiPlayer);
        const totalWolves = werewolves.length;
        
        // 9人局3狼标准分工
        if (totalWolves === 3) {
            if (playerIndex === 0) {
                // 第一匹狼：根据场上神职数量决定策略
                const godCount = alivePlayers.filter(p => p.claimedRole && ['seer', 'witch', 'hunter'].includes(p.claimedRole)).length;
                return godCount >= 2 ? 'deepwater' : 'jumper';
            } else if (playerIndex === 1) {
                // 第二匹狼：根据好人与狼人比例决定
                const ratio = aliveGoodGuys / aliveWerewolves;
                return ratio > 2 ? 'charger' : 'hooker';
            } else {
                // 第三匹狼：根据游戏天数决定
                return this.day >= 3 ? 'hooker' : 'deepwater';
            }
        }
        
        return 'deepwater'; // 默认深水
    }
    
    // 悍跳狼发言策略
    generateJumperSpeech(aiPlayer, gameState) {
        const alivePlayers = gameState.alivePlayers;
        const hasClaimedSeer = this.hasPlayerClaimedRole('seer');
        const speechElements = [];
        
        if (hasClaimedSeer) {
            // 对跳预言家
            speechElements.push('我才是真正的预言家！刚才那个是狼人悍跳');
        } else {
            // 首跳预言家
            speechElements.push('我是预言家，昨晚获得了重要信息');
        }
        
        // 报查验结果（优先报查杀制造压力）
        const goodPlayers = alivePlayers.filter(p => p.role !== 'werewolf' && p !== aiPlayer);
        if (goodPlayers.length > 0) {
            const target = goodPlayers[Math.floor(Math.random() * goodPlayers.length)];
            if (Math.random() < 0.7) {
                // 报查杀
                speechElements.push(`我昨晚查验了${target.name}，他是查杀！`);
                speechElements.push(`${target.name}就是狼人，今天必须出掉他`);
            } else {
                // 报金水（给狼队友或好人）
                speechElements.push(`我昨晚查验了${target.name}，他是金水`);
            }
        }
        
        // 留警徽流
        const remainingPlayers = alivePlayers.filter(p => p !== aiPlayer);
        if (remainingPlayers.length >= 2) {
            const player1 = remainingPlayers[Math.floor(Math.random() * remainingPlayers.length)];
            const player2 = remainingPlayers.filter(p => p !== player1)[0];
            speechElements.push(`我的警徽流是${player1.name}、${player2.name}`);
        }
        
        return speechElements.join('。') + '。';
    }
    
    // 冲锋狼发言策略
    generateChargerSpeech(aiPlayer, gameState) {
        const hasClaimedSeer = this.hasPlayerClaimedRole('seer');
        const speechElements = [];
        
        // 支持悍跳狼队友
        if (hasClaimedSeer) {
            const supportSpeeches = [
                '我认为刚才的预言家发言很有逻辑，应该是真的',
                '预言家的查验结果很重要，我们要相信',
                '从发言风格来看，我倾向于相信这个预言家',
                '预言家提供的信息对我们找狼很关键'
            ];
            speechElements.push(supportSpeeches[Math.floor(Math.random() * supportSpeeches.length)]);
        }
        
        // 质疑真预言家或好人
        const alivePlayers = gameState.alivePlayers;
        const goodTargets = alivePlayers.filter(p => p.role !== 'werewolf' && p !== aiPlayer);
        if (goodTargets.length > 0) {
            const target = goodTargets[Math.floor(Math.random() * goodTargets.length)];
            const questionSpeeches = [
                `我觉得${target.name}的发言有问题，逻辑不够清晰`,
                `${target.name}的表现让我怀疑，可能在隐藏身份`,
                `${target.name}总是在关键时刻转移话题，很可疑`,
                `我建议大家重点关注${target.name}的行为`
            ];
            speechElements.push(questionSpeeches[Math.floor(Math.random() * questionSpeeches.length)]);
        }
        
        // 表现积极的好人形象
        const activeSpeeches = [
            '我会认真分析每个人的发言',
            '作为好人，我有责任帮助大家找出真相',
            '我们要团结一致，不能被狼人分化',
            '相信通过大家的努力，一定能找出所有狼人'
        ];
        speechElements.push(activeSpeeches[Math.floor(Math.random() * activeSpeeches.length)]);
        
        return speechElements.join('。') + '。';
    }
    
    // 倒钩狼发言策略
    generateHookerSpeech(aiPlayer, gameState) {
        const hasClaimedSeer = this.hasPlayerClaimedRole('seer');
        const speechElements = [];
        
        // 支持真预言家（倒钩策略核心）
        if (hasClaimedSeer) {
            const hookSpeeches = [
                '我认为预言家说得很有道理，逻辑很清晰',
                '预言家的分析让我很信服，应该是真的',
                '我支持预言家的判断，他的信息很重要',
                '预言家承担了很大风险站出来，我们要相信他'
            ];
            speechElements.push(hookSpeeches[Math.floor(Math.random() * hookSpeeches.length)]);
        }
        
        // 质疑狼队友（制造对立）
        const alivePlayers = gameState.alivePlayers;
        const werewolves = alivePlayers.filter(p => p.role === 'werewolf' && p !== aiPlayer);
        if (werewolves.length > 0 && Math.random() < 0.4) {
            const wolfTarget = werewolves[Math.floor(Math.random() * werewolves.length)];
            const betraySpeeches = [
                `我觉得${wolfTarget.name}的表现有些奇怪`,
                `${wolfTarget.name}的发言让我感到不安`,
                `${wolfTarget.name}可能在隐藏什么`,
                `我对${wolfTarget.name}的身份有些怀疑`
            ];
            speechElements.push(betraySpeeches[Math.floor(Math.random() * betraySpeeches.length)]);
        }
        
        // 表现理性分析的好人形象
        const rationalSpeeches = [
            '我会冷静分析每个人的表现',
            '理性思考比感性判断更重要',
            '我们要基于逻辑而不是直觉来判断',
            '作为好人，我会慎重考虑每一票'
        ];
        speechElements.push(rationalSpeeches[Math.floor(Math.random() * rationalSpeeches.length)]);
        
        return speechElements.join('。') + '。';
    }
    
    // 深水狼发言策略
    generateDeepwaterSpeech(aiPlayer, gameState) {
        const speechElements = [];
        
        // 低调表态，避免引起注意
        const lowKeySpeeches = [
            '我是普通村民，只能通过大家的发言来判断',
            '作为平民，我会认真听取大家的分析',
            '我没有特殊信息，只能跟着大家的节奏',
            '我相信神职玩家会给我们正确的指引'
        ];
        speechElements.push(lowKeySpeeches[Math.floor(Math.random() * lowKeySpeeches.length)]);
        
        // 适度分析，但不过于突出
        const moderateAnalysis = [
            '从目前的信息来看，我们需要更多线索',
            '我会仔细观察每个人的表现',
            '希望能通过讨论找到更多有用信息',
            '我相信真相会慢慢浮出水面'
        ];
        speechElements.push(moderateAnalysis[Math.floor(Math.random() * moderateAnalysis.length)]);
        
        // 表达对团队的支持
        const teamSupport = [
            '我会全力配合大家的决定',
            '相信团结的力量，我们一定能赢',
            '我会认真投票，不辜负大家的信任',
            '希望我们能齐心协力找出所有狼人'
        ];
        speechElements.push(teamSupport[Math.floor(Math.random() * teamSupport.length)]);
        
        return speechElements.join('。') + '。';
    }
    
    // 默认狼人发言策略
    generateDefaultWolfSpeech(aiPlayer, gameState) {
        const speechElements = [];
        
        // 基础好人伪装
        const basicSpeeches = [
            '我是村民，会认真分析每个人的表现',
            '作为好人，我有责任帮助大家找出真相',
            '我会用逻辑思维来判断每个人的身份',
            '希望我们能团结一致，战胜邪恶'
        ];
        speechElements.push(basicSpeeches[Math.floor(Math.random() * basicSpeeches.length)]);
        
        return speechElements.join('。') + '。';
    }
    
    // 后续天数的高级狼队策略
    generateAdvancedWolfSpeech(aiPlayer, gameState, wolfRole) {
        const deadPlayers = gameState.deadPlayers;
        const alivePlayers = gameState.alivePlayers;
        const hasClaimedSeer = this.hasPlayerClaimedRole('seer');
        const speechElements = [];
        
        // 根据角色执行不同的后续策略
        switch (wolfRole) {
            case 'jumper':
                // 悍跳狼继续维持预言家身份
                if (hasClaimedSeer) {
                    const goodPlayers = alivePlayers.filter(p => p.role !== 'werewolf' && p !== aiPlayer);
                    if (goodPlayers.length > 0) {
                        const target = goodPlayers[Math.floor(Math.random() * goodPlayers.length)];
                        if (Math.random() < 0.6) {
                            speechElements.push(`我昨晚查验了${target.name}，他是查杀！`);
                        } else {
                            speechElements.push(`我昨晚查验了${target.name}，他是金水`);
                        }
                    }
                }
                break;
                
            case 'charger':
                // 冲锋狼继续支持悍跳狼
                speechElements.push('我继续支持预言家的判断');
                break;
                
            case 'hooker':
                // 倒钩狼继续支持真预言家
                if (hasClaimedSeer) {
                    speechElements.push('预言家的分析很有道理，我们要相信');
                }
                break;
                
            case 'deepwater':
                // 深水狼保持低调
                speechElements.push('我会继续观察，跟随大家的判断');
                break;
        }
        
        // 死亡分析（所有狼都要做的伪装）
        if (deadPlayers.length > 0) {
            const lastDead = deadPlayers[deadPlayers.length - 1];
            const deathAnalyses = [
                `${lastDead.name}的死让我很难过，我们失去了重要的好人`,
                `从${lastDead.name}被杀来看，狼人的策略很明确`,
                `我们要为${lastDead.name}报仇，找出真正的凶手`,
                `${lastDead.name}的死给了我们重要的信息`
            ];
            speechElements.push(deathAnalyses[Math.floor(Math.random() * deathAnalyses.length)]);
        }
        
        return speechElements.join('。') + '。';
    }
    
    // 继续原有的预言家发言策略（已经比较完善）
    generateSeerSpeech_OLD(aiPlayer, gameState) {
        const hasClaimedSeer = this.hasPlayerClaimedRole('seer');
        const werewolves = gameState.alivePlayers.filter(p => p.role === 'werewolf');
        const deadPlayers = gameState.deadPlayers;
        const alivePlayers = gameState.alivePlayers;
        
        const speechElements = [];
        
        if (gameState.day === 1) {
            // 第一天：专业预言家发言三部曲
            
            if (hasClaimedSeer) {
                // 有悍跳时，强势对抗
                const confrontationSpeeches = [
                    '我才是真正的预言家！对方是狼人悍跳',
                    '大家听我说，我有真正的查验能力，那个是假的',
                    '我必须站出来澄清真相，不能让狼人误导大家',
                    '作为真预言家，我绝不容忍狼人冒充我的身份'
                ];
                speechElements.push(confrontationSpeeches[Math.floor(Math.random() * confrontationSpeeches.length)]);
                
                // 报查验结果
                if (werewolves.length > 0) {
                    const werewolf = werewolves[0];
                    speechElements.push(`我昨晚查验了${werewolf.name}，他是查杀！`);
                } else {
                    const goodPlayer = alivePlayers.filter(p => p.role !== 'werewolf' && p !== aiPlayer)[0];
                    if (goodPlayer) {
                        speechElements.push(`我昨晚查验了${goodPlayer.name}，他是金水。`);
                    }
                }
                
                // 留警徽流
                const remainingPlayers = alivePlayers.filter(p => p !== aiPlayer);
                if (remainingPlayers.length >= 2) {
                    const player1 = remainingPlayers[Math.floor(Math.random() * remainingPlayers.length)];
                    const player2 = remainingPlayers.filter(p => p !== player1)[Math.floor(Math.random() * (remainingPlayers.length - 1))];
                    speechElements.push(`我的警徽流是${player1.name}、${player2.name}，请大家记住。`);
                }
                
            } else {
                // 没有悍跳时，可以选择跳或隐藏
                if (Math.random() < 0.7) {
                    // 选择跳预言家
                    speechElements.push('我是预言家，昨晚获得了重要信息。');
                    
                    // 报查验结果
                    if (werewolves.length > 0) {
                        const werewolf = werewolves[0];
                        speechElements.push(`我查验了${werewolf.name}，他是狼人！`);
                    } else {
                        const goodPlayer = alivePlayers.filter(p => p.role !== 'werewolf' && p !== aiPlayer)[0];
                        if (goodPlayer) {
                            speechElements.push(`我查验了${goodPlayer.name}，他是好人。`);
                        }
                    }
                } else {
                    // 选择隐藏
                    const hiddenSpeeches = [
                        '我会仔细观察大家的行为，寻找可疑的线索',
                        '我有一些特殊的观察方法，能帮助大家识别狼人',
                        '让我们理性分析每个人的表现，真相总会浮出水面'
                    ];
                    speechElements.push(hiddenSpeeches[Math.floor(Math.random() * hiddenSpeeches.length)]);
                }
            }
            
        } else {
            // 后续天数：继续发挥预言家作用
            
            // 公布新的查验结果
            if (werewolves.length > 0 && Math.random() < 0.8) {
                const werewolf = werewolves[Math.floor(Math.random() * werewolves.length)];
                speechElements.push(`我昨晚查验了${werewolf.name}，确认他是狼人！`);
            }
            
            // 分析局势
            const situationAnalyses = [
                '根据我的查验结果，狼人的身份已经很明确了',
                '我会继续查验可疑的人，为大家提供准确信息',
                '相信我的判断，我的每一个查验都是准确的',
                '作为预言家，我有责任带领大家走向胜利'
            ];
            speechElements.push(situationAnalyses[Math.floor(Math.random() * situationAnalyses.length)]);
        }
        
        return speechElements.join('。') + '。';
    }
    
    // 原有的村民发言策略（保留作为备用）
    generateVillagerSpeech_OLD(aiPlayer, gameState) {
        const speechElements = [];
        
        if (this.day === 1) {
            const identityStatements = [
                '我是普通村民，虽然没有特殊能力，但我有一颗正义的心',
                '作为村民，我的使命就是帮助大家找出隐藏的狼人',
                '我没有神职的特殊技能，但我有敏锐的观察力',
                '虽然我只是个普通人，但我会用理性分析保护村庄'
            ];
            
            const cooperationStatements = [
                '，我会全力配合神职的工作',
                '，我愿意和大家一起分析线索',
                '，我会仔细倾听每个人的发言',
                '，我相信团结就是力量'
            ];
            
            const determinationStatements = [
                '。让我们用智慧战胜邪恶！',
                '。我绝不会让狼人得逞！',
                '。正义终将战胜黑暗！',
                '。我们一定能找出真相！'
            ];
            
            speechElements.push(
                identityStatements[Math.floor(Math.random() * identityStatements.length)] +
                cooperationStatements[Math.floor(Math.random() * cooperationStatements.length)] +
                determinationStatements[Math.floor(Math.random() * determinationStatements.length)]
            );
        } else {
            // 后续天数：复杂策略
            
            // 挡刀策略：在危险时伪装神职
            if (werewolves.length >= 2 && Math.random() < 0.25) {
                if (!hasClaimedSeer && Math.random() < 0.4) {
                    const seerClaims = [
                        '我必须坦白，我其实是预言家，一直在暗中观察',
                        '情况紧急，我不能再隐瞒了，我是预言家',
                        '我是预言家，现在是时候公布我的查验结果了'
                    ];
                    const optimalClaim = this.selectOptimalIdentityClaim(aiPlayer, seerClaims, 'seer');
                    speechElements.push(optimalClaim);
                } else if (!hasClaimedWitch && this.shouldClaimWitch(aiPlayer)) {
                    const witchClaims = [
                        '我是女巫，一直在默默保护大家',
                        '我必须表明身份了，我是女巫，手里还有药',
                        '作为女巫，我不能再沉默下去了'
                    ];
                    const optimalClaim = this.selectOptimalIdentityClaim(aiPlayer, witchClaims, 'witch');
                    speechElements.push(optimalClaim);
                }
            }
            
            // 分析死者情况
            if (deadPlayers.length > 0) {
                const lastDead = deadPlayers[deadPlayers.length - 1];
                const deathAnalyses = [
                    `${lastDead.name}的死亡让我很痛心，我们要为无辜的人讨回公道`,
                    `从${lastDead.name}被杀的时机分析，狼人的策略很明确`,
                    `${lastDead.name}生前的表现值得我们深思`,
                    `狼人选择杀死${lastDead.name}，这背后的动机值得分析`
                ];
                speechElements.push(deathAnalyses[Math.floor(Math.random() * deathAnalyses.length)]);
            }
            
            // 支持神职
            if (hasClaimedSeer && Math.random() < 0.6) {
                const supportSpeeches = [
                    '我认为预言家的分析很有道理，我们应该相信他',
                    '预言家提供的信息对我们很重要，我支持他的判断',
                    '我一直在观察预言家的表现，感觉他是可信的',
                    '预言家的逻辑很清晰，我愿意跟随他的指导'
                ];
                speechElements.push(supportSpeeches[Math.floor(Math.random() * supportSpeeches.length)]);
            }
            
            // 分析可疑行为
            if (suspiciousPlayers.length > 0) {
                const mostSuspicious = suspiciousPlayers[0].player;
                const suspicionAnalyses = [
                    `我一直在观察${mostSuspicious.name}，他的行为确实让人怀疑`,
                    `${mostSuspicious.name}的发言模式有些异常，值得关注`,
                    `我建议大家仔细分析${mostSuspicious.name}的表现`,
                    `${mostSuspicious.name}在关键时刻的反应很可疑`
                ];
                speechElements.push(suspicionAnalyses[Math.floor(Math.random() * suspicionAnalyses.length)]);
            }
            
            // 逻辑分析
            const logicalAnalyses = [
                '我们要用理性思考，不能被情绪左右',
                '从逻辑角度分析，狼人一定会在我们中间伪装',
                '我会把票投给最可疑的人，绝不浪费',
                '虽然我没有特殊能力，但我的判断力不会输给任何人',
                '我们好人要团结一致，不能被狼人分化',
                '每个人的发言都很重要，我们要仔细分析'
            ];
            speechElements.push(logicalAnalyses[Math.floor(Math.random() * logicalAnalyses.length)]);
            
            // 发言模式分析
            if (chatHistory.length > 3 && Math.random() < 0.4) {
                const speechPatternAnalyses = [
                    '从大家的发言来看，有些人在故意转移话题',
                    '我注意到有人的发言前后矛盾，这很可疑',
                    '有些人说话很有技巧，但缺乏实质内容',
                    '我发现有人总是跟风投票，从不表达自己的观点'
                ];
                speechElements.push(speechPatternAnalyses[Math.floor(Math.random() * speechPatternAnalyses.length)]);
            }
        }
        
        // 组合发言元素
        if (speechElements.length === 1) {
            return speechElements[0];
        } else {
            // 随机组合2-3个元素
            const numElements = Math.min(speechElements.length, Math.floor(Math.random() * 2) + 2);
            const selectedElements = [];
            const usedIndices = new Set();
            
            for (let i = 0; i < numElements; i++) {
                let index;
                do {
                    index = Math.floor(Math.random() * speechElements.length);
                } while (usedIndices.has(index));
                usedIndices.add(index);
                selectedElements.push(speechElements[index]);
            }
            
            return selectedElements.join('。') + '。';
        }
    }
    
    // 生成AI发言
    generateAISpeech(speaker) {
        let speech = '';
        let claimedRole = null;
        
        // 根据角色生成不同的发言
        if (speaker.role === 'seer') {
            // 预言家必须跳出并给出验人信息
            speech = this.generateSeerSpeech(speaker);
            claimedRole = 'seer';
        } else if (speaker.role === 'werewolf') {
            // 狼人发言策略
            speech = this.generateWerewolfSpeech(speaker);
            // 狼人可能悍跳预言家，在generateWerewolfSpeech中已设置claimedRole
        } else if (speaker.role === 'witch') {
            // 女巫发言策略
            speech = this.generateWitchSpeech(speaker);
        } else if (speaker.role === 'hunter') {
            // 猎人发言策略
            speech = this.generateHunterSpeech(speaker);
        } else {
            // 村民发言策略
            speech = this.generateVillagerSpeech(speaker);
        }
        
        // 记录身份声明
        if (claimedRole && !speaker.claimedRole) {
            speaker.claimedRole = claimedRole;
            const roleNames = {
                'seer': '预言家',
                'witch': '女巫',
                'hunter': '猎人'
            };
            this.addLog(`${speaker.name}声明身份：${roleNames[claimedRole]}`, 'identity-claim');
        }
        
        this.addLog(`${speaker.name}(${speaker.position}号)：${speech}`, 'ai-speech');
    }
    
    // 生成狼人发言
    generateWerewolfSpeech(speaker) {
        const alivePlayers = this.players.filter(p => p.isAlive && p !== speaker);
        const seerClaims = alivePlayers.filter(p => p.claimedRole === 'seer');
        
        let speechElements = [];
        
        if (this.dayCount === 1) {
            // 第一天：必须悍跳预言家
            if (seerClaims.length === 0) {
                // 悍跳预言家
                speechElements.push('我是预言家');
                const goodPlayer = alivePlayers.filter(p => p.role !== 'werewolf')[0];
                if (goodPlayer) {
                    speechElements.push(`我昨晚查验了${goodPlayer.name}，他是金水`);
                    speaker.claimedRole = 'seer';
                }
            } else {
                // 如果已有预言家跳出，则对跳
                speechElements.push('我才是真正的预言家');
                const goodPlayer = alivePlayers.filter(p => p.role !== 'werewolf')[0];
                if (goodPlayer) {
                    speechElements.push(`我昨晚查验了${goodPlayer.name}，他是金水，刚才那个是假预言家`);
                    speaker.claimedRole = 'seer';
                }
            }
        } else {
            // 后续天数：根据局势调整策略
            if (speaker.claimedRole === 'seer') {
                // 继续伪装预言家
                const targetPlayer = alivePlayers[Math.floor(Math.random() * alivePlayers.length)];
                const isGoodResult = Math.random() < 0.6;
                if (isGoodResult) {
                    speechElements.push(`我昨晚查验了${targetPlayer.name}，他是金水`);
                } else {
                    speechElements.push(`我昨晚查验了${targetPlayer.name}，他是查杀！`);
                }
            } else {
                // 普通发言，混淆视听
                const speeches = [
                    '我觉得昨晚的死亡很可疑',
                    '从发言分析，我有一些怀疑对象',
                    '我们需要更仔细地分析逻辑',
                    '我支持大家的分析'
                ];
                speechElements.push(speeches[Math.floor(Math.random() * speeches.length)]);
            }
        }
        
        return speechElements.join('，');
    }
    
    // 生成女巫发言
    generateWitchSpeech(speaker) {
        let speechElements = [];
        
        if (this.dayCount === 1) {
            // 第一天：低调观察
            const speeches = [
                '我需要更多信息来判断局势',
                '大家的发言都很有道理，我在仔细分析',
                '我会根据逻辑链来做判断',
                '希望能听到更多有用的信息'
            ];
            speechElements.push(speeches[Math.floor(Math.random() * speeches.length)]);
        } else {
            // 后续天数：可能暗示身份或给出关键信息
            if (Math.random() < 0.3) {
                // 暗示女巫身份
                speechElements.push('我昨晚得到了一些重要信息');
                speechElements.push('从昨晚的情况来看，我有一些特殊的观察');
            } else {
                // 普通发言
                const speeches = [
                    '我觉得昨晚的死亡模式很关键',
                    '从逻辑上分析，我有一些想法',
                    '我会支持最有逻辑的分析',
                    '大家要仔细考虑每个细节'
                ];
                speechElements.push(speeches[Math.floor(Math.random() * speeches.length)]);
            }
        }
        
        return speechElements.join('，');
    }
    
    // 生成猎人发言
    generateHunterSpeech(speaker) {
        let speechElements = [];
        
        if (this.dayCount === 1) {
            // 第一天：威慑性发言
            const speeches = [
                '我会仔细观察每个人的行为',
                '如果有人想对我不利，要考虑后果',
                '我有自己的判断标准',
                '我会在关键时刻站出来'
            ];
            speechElements.push(speeches[Math.floor(Math.random() * speeches.length)]);
        } else {
            // 后续天数：可能暗示身份
            if (Math.random() < 0.4) {
                // 暗示猎人身份
                speechElements.push('我建议狼人不要轻举妄动');
                speechElements.push('我有能力在关键时刻改变局势');
            } else {
                // 普通发言
                const speeches = [
                    '我会支持最有道理的分析',
                    '从目前的情况看，我有一些判断',
                    '我们需要团结一致找出狼人',
                    '我会在必要时采取行动'
                ];
                speechElements.push(speeches[Math.floor(Math.random() * speeches.length)]);
            }
        }
        
        return speechElements.join('，');
    }
    
    // 生成村民发言
    generateVillagerSpeech(speaker) {
        const speeches = [
            '我觉得需要仔细分析大家的发言',
            '从逻辑上看，我有一些怀疑',
            '我会支持最有道理的投票',
            '我们村民要团结起来',
            '我相信真相会水落石出',
            '大家要仔细听预言家的话',
            '我觉得某些人的行为很可疑',
            '我们要相信逻辑和推理'
        ];
        
        return speeches[Math.floor(Math.random() * speeches.length)];
    }
    
    // 开始投票阶段
    startVotingPhase() {
        this.currentPhase = 'voting';
        this.updateGameInfo('投票阶段', this.dayCount);
        this.votingResults = {};
        
        document.getElementById('voting-section').style.display = 'block';
        this.addLog('讨论结束，开始投票。', 'important');
        
        this.renderVoteOptions();
        
        // AI玩家投票
        setTimeout(() => this.executeAIVotes(), 300); // 减少AI投票延迟
    }
    
    // 渲染投票选项
    renderVoteOptions() {
        const voteOptions = document.getElementById('vote-options');
        const alivePlayers = this.players.filter(p => p.isAlive);
        let selectedVoteTarget = null;
        
        const updateVoteDisplay = () => {
            voteOptions.innerHTML = `
                <div class="vote-selection">
                    <p>请选择要投票的玩家：</p>
                    <div class="target-selection">
                        ${alivePlayers.map(player => {
                            const selectedClass = selectedVoteTarget === player.id ? ' selected' : '';
                            return `<button class="vote-btn${selectedClass}" onclick="game.selectVoteTarget(${player.id})">${player.name}</button>`;
                        }).join('')}
                    </div>
                    ${selectedVoteTarget ? `
                        <div class="action-buttons" style="margin-top: 15px;">
                            <button class="btn btn-success" onclick="game.confirmVote()">确定投票</button>
                            <button class="btn btn-secondary" onclick="game.cancelVote()">取消</button>
                        </div>
                    ` : ''}
                </div>
            `;
        };
        
        updateVoteDisplay();
        
        // 存储投票相关函数
        this.voteSelectedTarget = null;
        this.voteSelectTarget = (targetId) => {
            selectedVoteTarget = targetId;
            this.voteSelectedTarget = targetId;
            updateVoteDisplay();
        };
        
        this.voteConfirm = () => {
            if (selectedVoteTarget) {
                this.executeVote(selectedVoteTarget);
            }
        };
        
        this.voteCancel = () => {
            selectedVoteTarget = null;
            this.voteSelectedTarget = null;
            updateVoteDisplay();
        };
    }
    
    // 选择投票目标
    selectVoteTarget(targetId) {
        if (this.voteSelectTarget) {
            this.voteSelectTarget(targetId);
        }
    }
    
    // 确认投票
    confirmVote() {
        if (this.voteConfirm) {
            this.voteConfirm();
        }
    }
    
    // 取消投票
    cancelVote() {
        if (this.voteCancel) {
            this.voteCancel();
        }
    }
    
    // 执行投票
    executeVote(targetId) {
        const player = this.players.find(p => !p.isAI);
        if (!player.isAlive || player.hasVoted) return;
        
        if (!this.votingResults[targetId]) {
            this.votingResults[targetId] = [];
        }
        this.votingResults[targetId].push(player.id);
        player.hasVoted = true;
        
        this.addLog(`您投票给了 ${this.players.find(p => p.id === targetId).name}`);
        
        // 显示投票确认
        const voteOptions = document.getElementById('vote-options');
        voteOptions.innerHTML = `<p>已投票给 ${this.players.find(p => p.id === targetId).name}，等待其他玩家投票...</p>`;
        
        // 检查是否所有存活玩家都已投票
        const aliveCount = this.players.filter(p => p.isAlive).length;
        const votedCount = Object.values(this.votingResults).reduce((sum, votes) => sum + votes.length, 0);
        
        if (votedCount >= aliveCount) {
            setTimeout(() => this.processVoteResults(), 300); // 减少投票结果处理延迟
        }
    }
    
    // 投票（保留兼容性）
    vote(targetId) {
        this.executeVote(targetId);
    }
    
    // AI投票（优化版本）
    executeAIVotes() {
        const aliveAI = this.players.filter(p => p.isAI && p.isAlive && !p.hasVoted);
        
        // 批量处理AI投票，减少单独计算
        const voteDecisions = this.batchDetermineVoteTargets(aliveAI);
        
        voteDecisions.forEach(decision => {
            const { ai, target, reason } = decision;
            
            if (!this.votingResults[target.id]) {
                this.votingResults[target.id] = [];
            }
            this.votingResults[target.id].push(ai.id);
            ai.hasVoted = true;
            
            // 简化投票日志
            this.addLog(`${ai.name}投票给${target.name}${reason ? `(${reason})` : ''}`, 'vote');
        });
        
        // 立即处理投票结果，减少延迟
        setTimeout(() => this.processVoteResults(), 200);
    }
    
    // 批量AI投票决策（性能优化）
    batchDetermineVoteTargets(aiPlayers) {
        const alivePlayers = this.players.filter(p => p.isAlive);
        const villageTeam = alivePlayers.filter(p => p.role.team !== 'werewolf');
        const werewolfTeam = alivePlayers.filter(p => p.role.name === 'werewolf');
        
        // 预计算共享数据，避免重复计算
        const sharedData = this.calculateSharedVoteData(alivePlayers, villageTeam, werewolfTeam);
        
        return aiPlayers.map(ai => {
            const targets = alivePlayers.filter(p => p.id !== ai.id);
            
            if (ai.role.name === 'werewolf') {
                return this.optimizedWerewolfVoteStrategy(ai, targets, sharedData);
            } else {
                return this.optimizedVillageVoteStrategy(ai, targets, sharedData);
            }
        });
    }
    
    // 计算共享投票数据
    calculateSharedVoteData(alivePlayers, villageTeam, werewolfTeam) {
        return {
            totalPlayers: alivePlayers.length,
            villageCount: villageTeam.length,
            werewolfCount: werewolfTeam.length,
            gameDay: this.dayCount,
            currentVotes: { ...this.votingResults },
            // 预计算威胁等级
            threatLevels: this.batchCalculateThreatLevels(alivePlayers),
            // 预计算可疑度
            suspicionLevels: this.batchCalculateSuspicion(alivePlayers)
        };
    }
    
    // 智能投票决策系统（保留兼容性）
    determineVoteTarget(aiPlayer) {
        const alivePlayers = this.players.filter(p => p.isAlive && p.id !== aiPlayer.id);
        
        if (aiPlayer.role.name === 'werewolf') {
            return this.werewolfVoteStrategy(aiPlayer, alivePlayers);
        } else {
            return this.villageVoteStrategy(aiPlayer, alivePlayers);
        }
    }
    
    // 狼人投票策略
    werewolfVoteStrategy(werewolf, alivePlayers) {
        const aliveWerewolves = this.players.filter(p => p.isAlive && p.role.name === 'werewolf');
        const villageTeam = alivePlayers.filter(p => p.role.team !== 'werewolf');
        
        // 确定狼人在队伍中的角色
        const wolfRole = this.determineWolfVoteRole(werewolf, aliveWerewolves);
        
        switch (wolfRole) {
            case 'charger': // 冲锋狼
                return this.chargerVoteStrategy(werewolf, villageTeam, aliveWerewolves);
            case 'hooker': // 倒钩狼
                return this.hookerVoteStrategy(werewolf, villageTeam, aliveWerewolves);
            case 'deepwater': // 深水狼
                return this.deepwaterVoteStrategy(werewolf, villageTeam, aliveWerewolves);
            default: // 普通狼
                return this.defaultWolfVoteStrategy(werewolf, villageTeam);
        }
    }
    
    // 确定狼人投票角色
    determineWolfVoteRole(werewolf, aliveWerewolves) {
        const wolfIndex = aliveWerewolves.findIndex(w => w.id === werewolf.id);
        const totalWolves = aliveWerewolves.length;
        const villageCount = this.players.filter(p => p.isAlive && p.role.team !== 'werewolf').length;
        
        // 根据狼人数量和位置分配角色
        if (totalWolves === 1) {
            return 'charger'; // 只剩一只狼，必须冲锋
        }
        
        // 多只狼的情况下基于局势分工
        if (wolfIndex === 0) {
            // 第一只狼：局势劣势时冲锋，优势时倒钩
            return villageCount > totalWolves * 2 ? 'charger' : 'hooker';
        } else if (wolfIndex === 1) {
            // 第二只狼：根据神职威胁决定策略
            const godRoleCount = this.players.filter(p => 
                p.isAlive && ['seer', 'witch', 'hunter'].includes(p.role.name)
            ).length;
            return godRoleCount >= 2 ? 'deepwater' : 'hooker';
        } else {
            return 'deepwater';
        }
    }
    
    // 冲锋狼投票策略
    chargerVoteStrategy(werewolf, villageTeam, aliveWerewolves) {
        // 冲锋狼：直接投票给威胁最大的好人
        const priorities = [];
        
        // 1. 投票给真预言家
        const trueSeer = villageTeam.find(p => p.role.name === 'seer');
        if (trueSeer) {
            priorities.push({ target: trueSeer, priority: 10, reason: '冲锋投真预言家' });
        }
        
        // 2. 投票给女巫
        const witch = villageTeam.find(p => p.role.name === 'witch');
        if (witch) {
            priorities.push({ target: witch, priority: 8, reason: '冲锋投女巫' });
        }
        
        // 3. 投票给活跃的村民
        const activeVillagers = villageTeam.filter(p => 
            p.role.name === 'villager' && this.isPlayerThreatening(p)
        );
        activeVillagers.forEach(villager => {
            priorities.push({ target: villager, priority: 6, reason: '冲锋投活跃村民' });
        });
        
        // 4. 逻辑补充投票目标
        villageTeam.forEach(player => {
            if (!priorities.find(p => p.target === player)) {
                let priority = 1;
                let reason = '冲锋兜底投票';
                
                // 基于角色价值调整优先级
                if (player.role.name === 'hunter') {
                    priority = 4; // 猎人次优先
                    reason = '冲锋投猎人';
                } else if (player.role.name === 'villager') {
                    priority = 3; // 村民较优先
                    reason = '冲锋投村民';
                }
                
                // 基于位置调整优先级
                if (player.position <= 3) {
                    priority += 1; // 前置位更优先
                    reason += '(前置位)';
                }
                
                priorities.push({ target: player, priority: priority, reason: reason });
            }
        });
        
        priorities.sort((a, b) => b.priority - a.priority);
        const chosen = priorities[0];
        this.addLog(`${werewolf.name}执行${chosen.reason}`, 'strategy');
        return chosen.target;
    }
    
    // 倒钩狼投票策略
    hookerVoteStrategy(werewolf, villageTeam, aliveWerewolves) {
        // 倒钩狼：基于逻辑推理的身份伪装策略
        const otherWolves = aliveWerewolves.filter(w => w.id !== werewolf.id);
        const gameDay = this.day;
        const totalPlayers = aliveWerewolves.length + villageTeam.length;
        
        // 逻辑判断：是否需要投狼队友建立身份
        const shouldVoteWolf = this.shouldHookerVoteWolf(otherWolves, villageTeam, gameDay);
        
        if (shouldVoteWolf && otherWolves.length > 0) {
            // 选择最适合被投的狼队友
            const wolfTarget = this.selectBestWolfTarget(otherWolves, villageTeam);
            this.addLog(`${werewolf.name}倒钩投狼队友${wolfTarget.name}（身份伪装）`, 'strategy');
            return wolfTarget;
        }
        
        // 跟随好人投票逻辑
        const priorities = [];
        
        villageTeam.forEach(player => {
            let priority = 0;
            let reasons = [];
            
            // 1. 分析玩家可疑度
            const suspicion = this.calculateSuspicion(werewolf, player);
            if (suspicion > 7) {
                priority += 50;
                reasons.push('高度可疑');
            } else if (suspicion > 5) {
                priority += 30;
                reasons.push('中度可疑');
            }
            
            // 2. 分析当前投票趋势
            const currentVotes = this.votingResults[player.id]?.length || 0;
            if (currentVotes > 0) {
                priority += currentVotes * 10;
                reasons.push('跟随大流');
            }
            
            // 3. 角色价值分析（倒钩狼要表现得像好人）
            if (player.role.name === 'villager') {
                priority += 20;
                reasons.push('投村民安全');
            } else if (player.role.name === 'hunter') {
                priority += 15;
                reasons.push('投猎人合理');
            }
            
            // 4. 避免投神职（除非有充分理由）
            if (player.role.name === 'seer' || player.role.name === 'witch') {
                if (suspicion < 8) {
                    priority -= 20;
                    reasons.push('避免投神职');
                }
            }
            
            priorities.push({
                target: player,
                priority: priority,
                reasons: reasons
            });
        });
        
        // 选择最优目标
        priorities.sort((a, b) => b.priority - a.priority);
        
        if (priorities.length > 0) {
            const chosen = priorities[0];
            const reasonText = chosen.reasons.length > 0 ? 
                `（${chosen.reasons.join('，')}）` : '';
            this.addLog(`${werewolf.name}倒钩投票${chosen.target.name}${reasonText}`, 'strategy');
            return chosen.target;
        }
        
        // 兜底：选择最安全的目标
        const gameData = {
            aliveWerewolves: this.players.filter(p => p.isAlive && p.role.name === 'werewolf').length,
            dayNumber: this.dayCount,
            alivePlayers: this.players.filter(p => p.isAlive)
        };
        const villagers = villageTeam.filter(p => p.role.name === 'villager');
        if (villagers.length > 0) {
            return villagers.reduce((safest, villager) => 
                this.calculateThreatLevel(villager, gameData) < this.calculateThreatLevel(safest, gameData) ? villager : safest
            );
        }
        
        return villageTeam.reduce((safest, player) => 
            this.calculateThreatLevel(player, gameData) < this.calculateThreatLevel(safest, gameData) ? player : safest
        );
    }
    
    // 优化的狼人投票策略
    optimizedWerewolfVoteStrategy(werewolf, targets, sharedData) {
        const villageTargets = targets.filter(p => p.role.team !== 'werewolf');
        const wolfRole = this.determineWolfVoteRole(
            werewolf, 
            this.players.filter(p => p.isAlive && p.role.name === 'werewolf')
        );
        
        let target, reason;
        
        switch (wolfRole) {
            case 'charger':
                ({ target, reason } = this.optimizedChargerStrategy(villageTargets, sharedData));
                break;
            case 'hooker':
                ({ target, reason } = this.optimizedHookerStrategy(werewolf, targets, sharedData));
                break;
            case 'deepwater':
                ({ target, reason } = this.optimizedDeepwaterStrategy(villageTargets, sharedData));
                break;
            default:
                ({ target, reason } = this.optimizedDefaultWolfStrategy(villageTargets, sharedData));
        }
        
        return { ai: werewolf, target, reason };
    }
    
    // 优化的村民投票策略
    optimizedVillageVoteStrategy(villager, targets, sharedData) {
        const { suspicionLevels, currentVotes, threatLevels } = sharedData;
        
        // 快速评分系统
        const scores = targets.map(target => {
            let score = 0;
            const suspicion = suspicionLevels[target.id] || 0;
            const threat = threatLevels[target.id] || 0;
            const votes = currentVotes[target.id]?.length || 0;
            
            // 基础可疑度评分
            score += suspicion * 10;
            
            // 跟随投票趋势
            score += votes * 5;
            
            // 角色优先级
            if (target.role.name === 'villager') score += 15;
            else if (target.role.name === 'hunter') score += 10;
            else if (target.role.name === 'seer' || target.role.name === 'witch') {
                score += suspicion > 7 ? 20 : -10; // 只有高度可疑才投神职
            }
            
            return { target, score };
        });
        
        scores.sort((a, b) => b.score - a.score);
        const chosen = scores[0];
        
        let reason = '逻辑推理';
        if (chosen.score > 50) reason = '高度可疑';
        else if (currentVotes[chosen.target.id]?.length > 0) reason = '跟随大流';
        
        return { ai: villager, target: chosen.target, reason };
    }
    
    // 优化的冲锋狼策略
    optimizedChargerStrategy(villageTargets, sharedData) {
        const { threatLevels } = sharedData;
        
        // 优先级：预言家 > 女巫 > 活跃村民 > 猎人 > 普通村民
        const priorities = villageTargets.map(target => {
            let priority = 0;
            
            if (target.role.name === 'seer') priority = 100;
            else if (target.role.name === 'witch') priority = 80;
            else if (target.role.name === 'villager' && threatLevels[target.id] > 5) priority = 60;
            else if (target.role.name === 'hunter') priority = 40;
            else priority = 20;
            
            return { target, priority };
        });
        
        priorities.sort((a, b) => b.priority - a.priority);
        return { target: priorities[0].target, reason: '冲锋' };
    }
    
    // 优化的倒钩狼策略
    optimizedHookerStrategy(werewolf, targets, sharedData) {
        const { suspicionLevels, currentVotes } = sharedData;
        const villageTargets = targets.filter(p => p.role.team !== 'werewolf');
        
        // 寻找最佳跟票目标
        const bestTarget = villageTargets.reduce((best, target) => {
            const suspicion = suspicionLevels[target.id] || 0;
            const votes = currentVotes[target.id]?.length || 0;
            const score = suspicion * 2 + votes * 3;
            
            return score > (best.score || 0) ? { target, score } : best;
        }, {});
        
        return { target: bestTarget.target, reason: '倒钩' };
    }
    
    // 优化的深水狼策略
    optimizedDeepwaterStrategy(villageTargets, sharedData) {
        const { currentVotes } = sharedData;
        
        // 跟随得票最多的目标
        const voteLeader = villageTargets.reduce((leader, target) => {
            const votes = currentVotes[target.id]?.length || 0;
            return votes > (leader.votes || 0) ? { target, votes } : leader;
        }, {});
        
        if (voteLeader.target) {
            return { target: voteLeader.target, reason: '深水跟票' };
        }
        
        // 没有明显目标时选择村民
        const villagers = villageTargets.filter(p => p.role.name === 'villager');
        const target = villagers.length > 0 ? villagers[0] : villageTargets[0];
        return { target, reason: '深水保守' };
    }
    
    // 优化的默认狼策略
    optimizedDefaultWolfStrategy(villageTargets, sharedData) {
        const { threatLevels } = sharedData;
        
        // 选择威胁等级最高的村民
        const target = villageTargets.reduce((highest, target) => {
            const threat = threatLevels[target.id] || 0;
            return threat > (highest.threat || 0) ? { target, threat } : highest;
        }, {});
        
        return { target: target.target || villageTargets[0], reason: '常规' };
    }
    
    // 批量计算威胁等级
    batchCalculateThreatLevels(players) {
        const levels = {};
        const gameData = {
            aliveWerewolves: this.players.filter(p => p.isAlive && p.role.name === 'werewolf').length,
            dayNumber: this.dayCount,
            alivePlayers: this.players.filter(p => p.isAlive)
        };
        players.forEach(player => {
            if (this.calculateThreatLevel) {
                levels[player.id] = this.calculateThreatLevel(player, gameData);
            } else {
                // 基于角色和身份声明计算威胁等级
                let threat = 0;
                if (['seer', 'witch', 'hunter'].includes(player.role.name)) {
                    threat += 8; // 神职角色威胁高
                }
                if (player.identityClaim?.identity === 'seer') {
                    threat += 5; // 声明预言家威胁高
                }
                if (player.role.name === 'werewolf') {
                    threat = 1; // 狼人对狼人威胁低
                }
                levels[player.id] = threat;
            }
        });
        return levels;
    }
    
    // 批量计算可疑度
    batchCalculateSuspicion(players) {
        const levels = {};
        players.forEach(player => {
            if (this.calculateSuspicion) {
                levels[player.id] = this.calculateSuspicion(null, player);
            } else {
                // 基于发言和行为计算可疑度
                let suspicion = 5; // 基础可疑度
                if (player.role.name === 'werewolf') {
                    suspicion = 2; // 狼人对狼人可疑度低
                } else {
                    // 好人的可疑度基于身份声明一致性
                    if (player.identityClaim) {
                        const claimedRole = player.identityClaim.identity;
                        if (claimedRole === player.role.name) {
                            suspicion = 3; // 真实身份声明可疑度低
                        } else {
                            suspicion = 7; // 虚假身份声明可疑度高
                        }
                    }
                }
                levels[player.id] = suspicion;
            }
        });
        return levels;
    }
    
    // 深水狼投票策略
    deepwaterVoteStrategy(werewolf, villageTeam, aliveWerewolves) {
        // 深水狼：保持低调，跟随大流投票
        const voteCounts = {};
        
        // 统计当前投票情况
        Object.entries(this.votingResults).forEach(([playerId, votes]) => {
            voteCounts[playerId] = votes.length;
        });
        
        // 找到得票最多的好人
        let maxVotes = 0;
        let popularTargets = [];
        
        villageTeam.forEach(player => {
            const votes = voteCounts[player.id] || 0;
            if (votes > maxVotes) {
                maxVotes = votes;
                popularTargets = [player];
            } else if (votes === maxVotes && votes > 0) {
                popularTargets.push(player);
            }
        });
        
        // 跟随大流投票（基于逻辑选择最优目标）
        if (popularTargets.length > 0) {
            // 从得票最多的目标中选择最有利的
            const bestTarget = this.selectBestFollowTarget(popularTargets, werewolf);
            this.addLog(`${werewolf.name}深水跟票${bestTarget.name}（逻辑选择）`, 'strategy');
            return bestTarget;
        }
        
        // 没有明显目标时，基于逻辑选择最安全的投票
        const priorities = [];
        
        villageTeam.forEach(player => {
            let priority = 0;
            let reasons = [];
            
            // 1. 角色安全性评估
            if (player.role.name === 'villager') {
                priority += 30;
                reasons.push('村民安全');
            } else if (player.role.name === 'hunter') {
                priority += 20;
                reasons.push('猎人次选');
            } else {
                priority += 10;
                reasons.push('神职谨慎');
            }
            
            // 2. 位置影响评估
            if (player.position >= 6) {
                priority += 10;
                reasons.push('后置位低调');
            }
            
            // 3. 威胁度评估（深水狼避免投威胁大的）
            if (!this.isPlayerThreatening(player)) {
                priority += 15;
                reasons.push('威胁度低');
            }
            
            priorities.push({
                target: player,
                priority: priority,
                reasons: reasons
            });
        });
        
        priorities.sort((a, b) => b.priority - a.priority);
        
        if (priorities.length > 0) {
            const chosen = priorities[0];
            const reasonText = chosen.reasons.length > 0 ? 
                `（${chosen.reasons.join('，')}）` : '';
            this.addLog(`${werewolf.name}深水投票${chosen.target.name}${reasonText}`, 'strategy');
            return chosen.target;
        }
        
        // 最终兜底
        const gameData = {
            aliveWerewolves: this.players.filter(p => p.isAlive && p.role.name === 'werewolf').length,
            dayNumber: this.dayCount,
            alivePlayers: this.players.filter(p => p.isAlive)
        };
        return villageTeam.reduce((safest, player) => 
            this.calculateThreatLevel(player, gameData) < this.calculateThreatLevel(safest, gameData) ? player : safest
        );
    }
    
    // 默认狼人投票策略
    defaultWolfVoteStrategy(werewolf, villageTeam) {
        const priorities = [];
        
        villageTeam.forEach(player => {
            let priority = 0;
            let reasons = [];
            
            // 1. 神职优先级评估
            if (player.role.name === 'seer') {
                priority += 80;
                reasons.push('预言家威胁最大');
            } else if (player.role.name === 'witch') {
                priority += 70;
                reasons.push('女巫有双药');
            } else if (player.role.name === 'hunter') {
                priority += 60;
                reasons.push('猎人有枪');
            } else if (player.role.name === 'villager') {
                priority += 40;
                reasons.push('村民基础目标');
            }
            
            // 2. 身份暴露度评估
            if (this.isPlayerExposed(player)) {
                priority += 20;
                reasons.push('身份已暴露');
            }
            
            // 3. 威胁度评估
            if (this.isPlayerThreatening(player)) {
                priority += 15;
                reasons.push('发言威胁大');
            }
            
            // 4. 位置优势评估
            if (player.position <= 3) {
                priority += 10;
                reasons.push('前置位影响大');
            }
            
            // 5. 当前投票趋势
            const currentVotes = this.votingResults[player.id]?.length || 0;
            if (currentVotes > 0) {
                priority += currentVotes * 5;
                reasons.push('已有票数');
            }
            
            priorities.push({
                target: player,
                priority: priority,
                reasons: reasons
            });
        });
        
        // 选择最优目标
        priorities.sort((a, b) => b.priority - a.priority);
        
        if (priorities.length > 0) {
            const chosen = priorities[0];
            const reasonText = chosen.reasons.length > 0 ? 
                `（${chosen.reasons.join('，')}）` : '';
            this.addLog(`${werewolf.name}默认投票${chosen.target.name}${reasonText}`, 'strategy');
            return chosen.target;
        }
        
        // 兜底策略
        const gameData = {
            aliveWerewolves: this.players.filter(p => p.isAlive && p.role.name === 'werewolf').length,
            dayNumber: this.dayCount,
            alivePlayers: this.players.filter(p => p.isAlive)
        };
        return villageTeam.reduce((best, player) => 
            this.calculateThreatLevel(player, gameData) > this.calculateThreatLevel(best, gameData) ? player : best
        );
    }
    
    // 倒钩狼是否应该投狼队友的逻辑判断
    shouldHookerVoteWolf(otherWolves, villageTeam, gameDay) {
        // 基于逻辑推理的倒钩决策
        
        // 1. 游戏早期更需要建立身份
        if (gameDay <= 2 && otherWolves.length >= 2) {
            return true; // 早期且狼队充足时建立身份
        }
        
        // 2. 狼队劣势时需要伪装
        const wolfCount = otherWolves.length + 1; // 包括自己
        const villageCount = villageTeam.length;
        if (wolfCount < villageCount - 1) {
            return true; // 劣势时需要伪装
        }
        
        // 3. 有狼队友处于危险时
        const dangerousWolf = otherWolves.find(wolf => 
            this.isPlayerThreatening(wolf) || this.isPlayerExposed(wolf)
        );
        if (dangerousWolf) {
            return true; // 有队友危险时投票建立身份
        }
        
        // 4. 其他情况不投狼队友
        return false;
    }
    
    // 选择最适合被投的狼队友
    selectBestWolfTarget(otherWolves, villageTeam) {
        const priorities = [];
        
        otherWolves.forEach(wolf => {
            let priority = 0;
            
            // 1. 选择已经暴露或危险的狼
            if (this.isPlayerExposed(wolf)) {
                priority += 50;
            }
            
            // 2. 选择威胁度高的狼（容易被怀疑）
            if (this.isPlayerThreatening(wolf)) {
                priority += 30;
            }
            
            // 3. 选择位置不利的狼
            if (wolf.position <= 3) {
                priority += 20;
            }
            
            // 4. 避免选择关键狼（如果只剩少数狼）
            if (otherWolves.length <= 1) {
                priority -= 100; // 最后一个狼不能投
            }
            
            priorities.push({ target: wolf, priority: priority });
        });
        
        priorities.sort((a, b) => b.priority - a.priority);
        return priorities[0]?.target || otherWolves[0];
    }
    
    // 从多个跟票目标中选择最优的
    selectBestFollowTarget(popularTargets, werewolf) {
        const priorities = [];
        
        popularTargets.forEach(target => {
            let priority = 0;
            
            // 1. 优先跟票好人
            if (target.role.team !== 'werewolf') {
                priority += 50;
            }
            
            // 2. 优先跟票村民（安全）
            if (target.role.name === 'villager') {
                priority += 30;
            }
            
            // 3. 避免跟票重要神职（除非有充分理由）
            if (target.role.name === 'seer' || target.role.name === 'witch') {
                const suspicion = this.calculateSuspicion(werewolf, target);
                if (suspicion < 7) {
                    priority -= 20;
                }
            }
            
            // 4. 位置因素
            if (target.position >= 6) {
                priority += 10; // 后置位相对安全
            }
            
            priorities.push({ target: target, priority: priority });
        });
        
        priorities.sort((a, b) => b.priority - a.priority);
        return priorities[0]?.target || popularTargets[0];
    }
    
    // 好人投票策略
    villageVoteStrategy(villager, alivePlayers) {
        const werewolves = alivePlayers.filter(p => p.role.name === 'werewolf');
        const priorities = [];
        
        // 根据怀疑度投票
        alivePlayers.forEach(player => {
            const suspicion = this.calculateSuspicion(villager, player);
            priorities.push({ target: player, priority: suspicion, reason: '怀疑度投票' });
        });
        
        // 如果是神职，优先投票给狼人
        if (villager.role.name === 'seer' || villager.role.name === 'witch') {
            werewolves.forEach(wolf => {
                const existingPriority = priorities.find(p => p.target === wolf);
                if (existingPriority) {
                    existingPriority.priority += 5; // 神职加成
                }
            });
        }
        
        priorities.sort((a, b) => b.priority - a.priority);
        return priorities[0].target;
    }
    
    // 处理投票结果
    processVoteResults() {
        let maxVotes = 0;
        let eliminatedPlayers = [];
        
        // 显示详细投票统计
        this.showVoteStatistics();
        
        // 找出得票最多的玩家
        Object.entries(this.votingResults).forEach(([playerId, votes]) => {
            if (votes.length > maxVotes) {
                maxVotes = votes.length;
                eliminatedPlayers = [parseInt(playerId)];
            } else if (votes.length === maxVotes) {
                eliminatedPlayers.push(parseInt(playerId));
            }
        });
        
        // 处理平票情况
        if (eliminatedPlayers.length > 1) {
            this.addLog('投票平票，无人出局。', 'important');
        } else if (eliminatedPlayers.length === 1) {
            const eliminated = this.players.find(p => p.id === eliminatedPlayers[0]);
            eliminated.isAlive = false;
            this.lastDeathPosition = eliminated.position; // 记录最后死亡玩家位置
            this.addLog(`${eliminated.name}(${eliminated.position}号位) 被投票出局。`, 'death');
            
            // 如果是猎人被投票出局，触发技能
            if (eliminated.role.name === 'hunter') {
                this.triggerHunterSkill(eliminated);
            }
        }
        
        // 重置投票状态
        this.players.forEach(p => p.hasVoted = false);
        
        this.renderPlayers();
        
        // 检查游戏是否结束
        if (this.checkGameEnd()) {
            return;
        }
        
        // 进入下一天
        this.dayCount++;
        setTimeout(() => this.startNightPhase(), 800); // 减少夜晚阶段开始延迟
    }
    
    // 检查游戏是否结束
    checkGameEnd() {
        const aliveWerewolves = this.players.filter(p => p.isAlive && p.role.team === 'werewolf').length;
        const aliveVillagers = this.players.filter(p => p.isAlive && p.role.team === 'village').length;
        
        if (aliveWerewolves === 0) {
            this.endGame('village', '好人胜利！所有狼人已被消灭。');
            return true;
        } else if (aliveWerewolves >= aliveVillagers) {
            this.endGame('werewolf', '狼人胜利！狼人数量已达到或超过好人。');
            return true;
        }
        
        return false;
    }
    
    // 结束游戏
    endGame(winner, message) {
        this.currentPhase = 'end';
        this.isGameActive = false;
        
        this.showScreen('end-screen');
        
        document.getElementById('result-title').textContent = 
            winner === 'village' ? '🎉 好人胜利！' : '🐺 狼人胜利！';
        
        document.getElementById('result-content').innerHTML = `
            <p style="font-size: 1.2em; margin-bottom: 20px;">${message}</p>
            <p>游戏进行了 ${this.dayCount} 天</p>
        `;
        
        this.showFinalRoles();
        this.addLog(message, 'important');
    }
    
    // 显示最终身份
    showFinalRoles() {
        const rolesReveal = document.getElementById('roles-reveal');
        
        rolesReveal.innerHTML = this.players.map(player => `
            <div class="final-role-card role-${player.role.name}">
                <div style="font-size: 1.5em; margin-bottom: 5px;">${player.role.icon}</div>
                <div><strong>${player.name}</strong></div>
                <div>${player.role.displayName}</div>
                <div style="color: ${player.isAlive ? '#00b894' : '#d63031'}; font-size: 0.9em;">
                    ${player.isAlive ? '存活' : '死亡'}
                </div>
            </div>
        `).join('');
    }
    
    // 确认重开游戏
    confirmRestartGame() {
        if (this.isGameActive) {
            const confirmed = confirm('游戏正在进行中，确定要重新开始吗？这将丢失当前游戏进度。');
            if (!confirmed) {
                return;
            }
        }
        this.restartGame();
    }
    
    // 重新开始游戏
    restartGame() {
        this.players = [];
        this.currentPhase = 'setup';
        this.dayCount = 1;
        this.gameLog = [];
        this.votingResults = {};
        this.nightActions = {};
        this.isGameActive = false;
        this.lastDeathPosition = null;
        this.currentSpeaker = null;
        this.speechOrder = [];
        this.speechIndex = 0;
        this.witchPotions = null;
        this.werewolfActionResolve = null;
        this.seerActionResolve = null;
        this.witchActionResolve = null;
        this.selectedRole = null;
        
        // 清除所有选择状态
        this.selectedTarget = null;
        this.selectedAction = null;
        this.selectedVoteTarget = null;
        
        // 清除所有身份标识
        document.querySelectorAll('.identity-badge').forEach(badge => {
            badge.remove();
        });
        
        // 清除聊天相关状态
        this.chatMessages = [];
        this.aiChatActive = false;
        this.aiSpeechQueue = [];
        this.currentAISpeakerIndex = 0;
        this.currentAISpeaker = null;
        
        document.getElementById('player-name').value = '';
        document.getElementById('log-content').innerHTML = '';
        
        // 重置角色选择界面
        document.querySelector('input[name="role-choice"][value="random"]').checked = true;
        document.getElementById('role-options').style.display = 'none';
        document.querySelectorAll('.role-option').forEach(option => {
            option.classList.remove('selected');
        });
        
        this.showScreen('start-screen');
        this.updateGameInfo('游戏准备中...', 1);
        
        this.addLog('游戏已重新开始', 'important');
    }
    
    // 显示指定屏幕
    showScreen(screenId) {
        document.querySelectorAll('.screen').forEach(screen => {
            screen.classList.remove('active');
        });
        document.getElementById(screenId).classList.add('active');
    }
    
    // 更新游戏信息
    updateGameInfo(phase, day) {
        document.getElementById('current-phase').textContent = phase;
        document.getElementById('day-count').textContent = `第${day}天`;
    }
    
    // 添加游戏日志
    addLog(message, type = 'normal') {
        this.gameLog.push({ message, type, timestamp: new Date() });
        
        const logContent = document.getElementById('log-content');
        const logEntry = document.createElement('div');
        logEntry.className = `log-entry ${type}`;
        logEntry.textContent = message;
        
        logContent.appendChild(logEntry);
        logContent.scrollTop = logContent.scrollHeight;
    }
    
    // 显示投票统计
    // 显示投票统计（优化版）
    showVoteStatistics() {
        // 只统计得票数，简化输出
        const voteCounts = {};
        
        Object.entries(this.votingResults).forEach(([targetId, voterIds]) => {
            const targetPlayer = this.players.find(p => p.id === parseInt(targetId));
            if (targetPlayer && voterIds.length > 0) {
                voteCounts[targetPlayer.name] = voterIds.length;
            }
        });
        
        // 只显示得票统计，简化输出
        const sortedCounts = Object.entries(voteCounts)
            .sort(([,a], [,b]) => b - a);
            
        if (sortedCounts.length > 0) {
            let voteDisplay = '得票统计：';
            sortedCounts.forEach(([name, count]) => {
                voteDisplay += ` ${name}(${count}票)`;
            });
            this.addLog(voteDisplay, 'important');
        } else {
            this.addLog('无人得票', 'important');
        }
    }
    
    // 工具函数：基于时间戳的数组重排（替代随机洗牌）
    shuffleArray(array) {
        const newArray = [...array];
        // 基于当前时间戳和数组长度进行确定性重排
        const seed = Date.now() % 1000;
        for (let i = 0; i < newArray.length; i++) {
            const targetIndex = (i + seed) % newArray.length;
            if (i !== targetIndex) {
                [newArray[i], newArray[targetIndex]] = [newArray[targetIndex], newArray[i]];
            }
        }
        return newArray;
    }
    
    // 工具函数：延迟
    delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
}

// 初始化游戏
const game = new WerewolfGame();

// 页面加载完成后的初始化
document.addEventListener('DOMContentLoaded', () => {
    console.log('狼人杀游戏已加载');
    
    // 添加调试函数
    window.debugGame = () => {
        console.log('=== 游戏调试信息 ===');
        console.log('玩家列表:', game.players);
        console.log('当前发言者:', game.currentSpeaker);
        console.log('发言顺序:', game.speechOrder);
        console.log('发言索引:', game.speechIndex);
        console.log('游戏阶段:', game.phase);
        console.log('游戏是否激活:', game.isGameActive);
    };
});

// 防止页面刷新时丢失游戏状态的警告
window.addEventListener('beforeunload', (e) => {
    if (game.isGameActive) {
        e.preventDefault();
        e.returnValue = '游戏正在进行中，确定要离开吗？';
    }
});