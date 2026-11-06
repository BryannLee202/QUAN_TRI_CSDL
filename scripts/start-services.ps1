# scripts/start-services.ps1
$rootDir = (Get-Item $PSScriptRoot).Parent.FullName

$backend = Start-Process -FilePath "npm.cmd" -ArgumentList "run dev" -WorkingDirectory "$rootDir\backend" -WindowStyle Hidden -PassThru
$frontend = Start-Process -FilePath "npm.cmd" -ArgumentList "run dev" -WorkingDirectory "$rootDir\frontend" -WindowStyle Hidden -PassThru

try {
    $backend.PriorityClass = [System.Diagnostics.ProcessPriorityClass]::AboveNormal
    $frontend.PriorityClass = [System.Diagnostics.ProcessPriorityClass]::AboveNormal
} catch {}
