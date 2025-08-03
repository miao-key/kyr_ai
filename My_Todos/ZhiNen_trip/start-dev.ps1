Write-Host "启动智旅开发服务器..." -ForegroundColor Green
Set-Location -Path $PSScriptRoot
Write-Host "当前目录: $(Get-Location)" -ForegroundColor Yellow
npm run dev