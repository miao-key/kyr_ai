# Git历史恢复脚本
# 用于从备份中恢复丢失的Git历史记录

param(
    [string]$BackupPath = "",
    [switch]$ListBackups,
    [switch]$Force
)

# 配置
$ProjectDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$BackupBaseDir = Join-Path $ProjectDir "git-backups"
$LogFile = Join-Path $ProjectDir "recovery.log"

# 日志函数
function Write-Log {
    param(
        [string]$Message,
        [string]$Level = "Info"
    )
    $timestamp = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
    $logMessage = "[$timestamp] [$Level] $Message"
    Write-Host $logMessage -ForegroundColor $(switch($Level) {
        "Error" { "Red" }
        "Warning" { "Yellow" }
        "Success" { "Green" }
        default { "White" }
    })
    Add-Content -Path $LogFile -Value $logMessage
}

# 列出可用备份
function Show-AvailableBackups {
    Write-Log "Available backups:" -Level Info
    
    if (-not (Test-Path $BackupBaseDir)) {
        Write-Log "No backup directory found: $BackupBaseDir" -Level Warning
        return @()
    }
    
    $backups = Get-ChildItem $BackupBaseDir -Directory | 
               Where-Object { $_.Name -match '^backup_\d{4}-\d{2}-\d{2}_\d{2}-\d{2}-\d{2}_' } |
               Sort-Object CreationTime -Descending
    
    if ($backups.Count -eq 0) {
        Write-Log "No backups found" -Level Warning
        return @()
    }
    
    $index = 1
    foreach ($backup in $backups) {
        $infoFile = Join-Path $backup.FullName "backup-info.json"
        if (Test-Path $infoFile) {
            $info = Get-Content $infoFile | ConvertFrom-Json
            Write-Host "[$index] $($backup.Name)" -ForegroundColor Cyan
            Write-Host "    Time: $($info.timestamp)" -ForegroundColor Gray
            Write-Host "    Reason: $($info.reason)" -ForegroundColor Gray
            Write-Host "    Branch: $($info.branch)" -ForegroundColor Gray
            Write-Host "    Commits: $($info.commitCount)" -ForegroundColor Gray
            Write-Host "    Path: $($backup.FullName)" -ForegroundColor Gray
        } else {
            Write-Host "[$index] $($backup.Name)" -ForegroundColor Cyan
            Write-Host "    Created: $($backup.CreationTime)" -ForegroundColor Gray
            Write-Host "    Path: $($backup.FullName)" -ForegroundColor Gray
        }
        Write-Host ""
        $index++
    }
    
    return $backups
}

# 恢复Git历史
function Restore-GitHistory {
    param([string]$BackupPath)
    
    Write-Log "Starting Git history recovery from: $BackupPath" -Level Info
    
    # 验证备份路径
    if (-not (Test-Path $BackupPath)) {
        Write-Log "Backup path not found: $BackupPath" -Level Error
        return $false
    }
    
    # 检查是否是有效的Git镜像仓库
    $gitDir = Join-Path $BackupPath "objects"
    if (-not (Test-Path $gitDir)) {
        Write-Log "Invalid Git backup: $BackupPath" -Level Error
        return $false
    }
    
    # 获取备份信息
    $infoFile = Join-Path $BackupPath "backup-info.json"
    if (Test-Path $infoFile) {
        $backupInfo = Get-Content $infoFile | ConvertFrom-Json
        Write-Log "Backup info: Branch=$($backupInfo.branch), Commits=$($backupInfo.commitCount)" -Level Info
    }
    
    # 安全检查
    if (-not $Force) {
        Write-Host "WARNING: This will replace your current Git history!" -ForegroundColor Red
        Write-Host "Current working directory will be backed up first." -ForegroundColor Yellow
        $confirmation = Read-Host "Do you want to continue? (y/N)"
        if ($confirmation -ne 'y' -and $confirmation -ne 'Y') {
            Write-Log "Recovery cancelled by user" -Level Info
            return $false
        }
    }
    
    try {
        # 创建当前状态的紧急备份
        Write-Log "Creating emergency backup of current state..." -Level Info
        $emergencyBackup = Join-Path $BackupBaseDir "emergency_$(Get-Date -Format 'yyyy-MM-dd_HH-mm-ss')"
        git clone --mirror . "$emergencyBackup"
        Write-Log "Emergency backup created: $emergencyBackup" -Level Success
        
        # 获取当前远程仓库配置
        $remotes = @{}
        $remoteOutput = git remote -v
        foreach ($line in $remoteOutput) {
            if ($line -match '^(\w+)\s+(.+?)\s+\((fetch|push)\)$') {
                $remoteName = $matches[1]
                $remoteUrl = $matches[2]
                $remotes[$remoteName] = $remoteUrl
            }
        }
        
        # 删除当前.git目录
        Write-Log "Removing current .git directory..." -Level Warning
        Remove-Item ".git" -Recurse -Force
        
        # 从备份恢复
        Write-Log "Restoring from backup..." -Level Info
        git clone "$BackupPath" ".git-temp"
        Move-Item ".git-temp\.git" ".git"
        Remove-Item ".git-temp" -Recurse -Force
        
        # 恢复远程仓库配置
        Write-Log "Restoring remote repositories..." -Level Info
        foreach ($remote in $remotes.Keys) {
            git remote add $remote $remotes[$remote]
            Write-Log "Added remote: $remote -> $($remotes[$remote])" -Level Info
        }
        
        # 检查恢复结果
        $restoredCommits = git rev-list --count HEAD
        Write-Log "Recovery completed! Restored $restoredCommits commits" -Level Success
        
        # 显示最近的提交
        Write-Log "Recent commits:" -Level Info
        git log --oneline -10
        
        return $true
        
    } catch {
        Write-Log "Recovery failed: $($_.Exception.Message)" -Level Error
        return $false
    }
}

# 主逻辑
try {
    Write-Log "Git Recovery Tool Started" -Level Info
    
    if ($ListBackups) {
        Show-AvailableBackups
        return
    }
    
    if (-not $BackupPath) {
        Write-Log "Available backups:" -Level Info
        $backups = Show-AvailableBackups
        
        if ($backups.Count -eq 0) {
            Write-Log "No backups available for recovery" -Level Error
            exit 1
        }
        
        Write-Host "Enter backup number to restore (1-$($backups.Count)), or 'q' to quit: " -NoNewline
        $selection = Read-Host
        
        if ($selection -eq 'q' -or $selection -eq 'Q') {
            Write-Log "Recovery cancelled by user" -Level Info
            return
        }
        
        try {
            $index = [int]$selection - 1
            if ($index -ge 0 -and $index -lt $backups.Count) {
                $BackupPath = $backups[$index].FullName
            } else {
                Write-Log "Invalid selection: $selection" -Level Error
                exit 1
            }
        } catch {
            Write-Log "Invalid input: $selection" -Level Error
            exit 1
        }
    }
    
    # 执行恢复
    $success = Restore-GitHistory -BackupPath $BackupPath
    
    if ($success) {
        Write-Log "Git history recovery completed successfully!" -Level Success
        Write-Host ""
        Write-Host "Next steps:" -ForegroundColor Green
        Write-Host "1. Verify the restored history: git log --oneline" -ForegroundColor White
        Write-Host "2. Push to remote if needed: git push origin main --force-with-lease" -ForegroundColor White
        Write-Host "3. Check all remotes: git remote -v" -ForegroundColor White
    } else {
        Write-Log "Git history recovery failed!" -Level Error
        exit 1
    }
    
} catch {
    Write-Log "Unexpected error: $($_.Exception.Message)" -Level Error
    exit 1
}