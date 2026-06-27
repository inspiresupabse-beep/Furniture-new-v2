$ports = 3001, 5173, 5174
foreach ($port in $ports) {
  $connections = Get-NetTCPConnection -LocalPort $port -State Listen -ErrorAction SilentlyContinue
  foreach ($conn in $connections) {
    $processId = $conn.OwningProcess
    if ($processId -and $processId -ne 0) {
      Write-Host "Stopping process $processId on port $port"
      Stop-Process -Id $processId -Force -ErrorAction SilentlyContinue
    }
  }
}
Write-Host "Dev ports cleared."
