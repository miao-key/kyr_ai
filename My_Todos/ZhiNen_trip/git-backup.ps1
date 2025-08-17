# Git自动备份脚本
# 用于在同步操作前创建安全备份

param(
    [string]$BackupReason = "sync-operation",
    [int]$MaxBackups = 10
)

# 配置
$ProjectDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$BackupBaseDir = Join-Path $ProjectDir "git-backups"
$LogFile = Join-Path $ProjectDir "backup.log"

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

# 创建备份目录
if (-not (Test-Path $BackupBaseDir)) {
    New-Item -ItemType Directory -Path $BackupBaseDir -Force | Out-Null
    Write-Log "Created backup directory: $BackupBaseDir"
}

# 生成备份名称
$timestamp = Get-Date -Format "yyyy-MM-dd_HH-mm-ss"
$backupName = "backup_${timestamp}_${BackupReason}"
$backupPath = Join-Path $BackupBaseDir $backupName

try {
    Write-Log "Starting Git backup: $backupName" -Level Info
    
    # 检查是否在Git仓库中
    try {
        $gitStatus = git status 2>&1
        if ($LASTEXITCODE -ne 0) {
            Write-Log "Not in a Git repository" -Level Error
            exit 1
        }
    } catch {
        Write-Log "Not in a Git repository" -Level Error
        exit 1
    }
    
    # 获取当前分支和提交信息
    $currentBranch = git branch --show-current
    $currentCommit = git rev-parse HEAD
    $commitCount = git rev-list --count HEAD
    
    Write-Log "Current branch: $currentBranch"
    Write-Log "Current commit: $currentCommit"
    Write-Log "Total commits: $commitCount"
    
    # 创建镜像备份
    Write-Log "Creating mirror backup..."
    git clone --mirror . "$backupPath"
    
    if ($LASTEXITCODE -eq 0) {
        Write-Log "Backup created successfully: $backupPath" -Level Success
        
        # 创建备份信息文件
        $backupInfo = @{
            timestamp = $timestamp
            reason = $BackupReason
            branch = $currentBranch
            commit = $currentCommit
            commitCount = $commitCount
            backupPath = $backupPath
        }
        
        $backupInfoPath = Join-Path $backupPath "backup-info.json"
        $backupInfo | ConvertTo-Json -Depth 2 | Set-Content $backupInfoPath
        
        Write-Log "Backup info saved: $backupInfoPath"
    } else {
        Write-Log "Failed to create backup" -Level Error
        exit 1
    }
    
    # 清理旧备份（保留最新的N个）
    Write-Log "Cleaning up old backups (keeping $MaxBackups)..."
    $backups = Get-ChildItem $BackupBaseDir -Directory | 
               Where-Object { $_.Name -match '^backup_\d{4}-\d{2}-\d{2}_\d{2}-\d{2}-\d{2}_' } |
               Sort-Object CreationTime -Descending
    
    if ($backups.Count -gt $MaxBackups) {
        $toDelete = $backups | Select-Object -Skip $MaxBackups
        foreach ($backup in $toDelete) {
            Write-Log "Removing old backup: $($backup.Name)"
            Remove-Item $backup.FullName -Recurse -Force
        }
        Write-Log "Cleaned up $($toDelete.Count) old backups"
    }
    
    Write-Log "Backup operation completed successfully" -Level Success
    
} catch {
    Write-Log "Backup failed: $($_.Exception.Message)" -Level Error
    exit 1
}

# 返回备份路径供其他脚本使用
return $backupPath