# ADB Bridge for WSL to Windows Emulator

Write-Host "--- Stopping existing ADB server ---" -ForegroundColor Yellow
adb kill-server

# Get IPv4 Address
$ip = (Get-NetIPAddress -AddressFamily IPv4 -InterfaceAlias 'Wi-Fi', 'Ethernet' | Select-Object -First 1).IPAddress
if (!$ip) {
    $ip = (Get-NetIPAddress -AddressFamily IPv4 | Where-Object { $_.InterfaceAlias -notlike "*vEthernet*" -and $_.IPAddress -ne "127.0.0.1" } | Select-Object -First 1).IPAddress
}

Write-Host "--- Starting ADB server on $ip ---" -ForegroundColor Green
Write-Host "KEEP THIS WINDOW OPEN" -ForegroundColor Red

# WSL에서 실행할 명령어 안내
Write-Host "`nCopy this to your WSL terminal:" -ForegroundColor Cyan
Write-Host "export ADB_SERVER_SOCKET=tcp:$ip:5037" -ForegroundColor White
Write-Host "adb devices" -ForegroundColor White

# Start ADB server restricted to the host address and listening for external connections
adb -a -P 5037 nodaemon server
