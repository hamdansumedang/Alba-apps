param(
    [string]$Action = "start"
)

Write-Host "🚀 ALBA-APPS 1-Click Deploy Manager" -ForegroundColor Green

if ($Action -eq "setup") {
    Write-Host "📦 Menginstal dependensi..." -ForegroundColor Cyan
    npm install
    Write-Host "👤 Menyiapkan database & admin..." -ForegroundColor Cyan
    node setup-admin.js
}

if ($Action -eq "build" -or $Action -eq "setup") {
    Write-Host "🔨 Membangun frontend..." -ForegroundColor Cyan
    npm run build
}

Write-Host "🚀 Menjalankan server backend..." -ForegroundColor Green
node server.js
