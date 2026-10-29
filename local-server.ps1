# ==============================================================================
# SERVIDOR WEB LOCAL ULTRALIGERO PARA IURISDOSIS COLOMBIA
# Sin Node.js, sin Python, 100% nativo de Windows PowerShell (.NET HttpListener)
# ==============================================================================

$portsToTry = @(8080, 8081, 8082, 3000, 5000)
$rootDir = $PSScriptRoot
if (-not $rootDir) { $rootDir = (Get-Location).Path }

$listener = $null
$activePort = $null

foreach ($p in $portsToTry) {
    try {
        $tempListener = New-Object System.Net.HttpListener
        $tempListener.Prefixes.Add("http://localhost:$p/")
        $tempListener.Start()
        $listener = $tempListener
        $activePort = $p
        break
    } catch {
        if ($tempListener) { $tempListener.Close() }
    }
}

if (-not $listener) {
    Write-Host "[ERROR] No se pudo vincular ningun puerto local (8080-8082, 3000, 5000)." -ForegroundColor Red
    exit 1
}

try {
    Write-Host ""
    Write-Host "======================================================================" -ForegroundColor Cyan
    Write-Host "   ⚖️ IURISDOSIS COLOMBIA — SERVIDOR LOCAL ACTIVO" -ForegroundColor Yellow
    Write-Host "======================================================================" -ForegroundColor Cyan
    Write-Host "  • Aplicacion Principal : http://localhost:$activePort/" -ForegroundColor Green
    Write-Host "  • Suite de Pruebas     : http://localhost:$activePort/test-suite.html" -ForegroundColor Cyan
    Write-Host "  • Directorio Servido   : $rootDir" -ForegroundColor Gray
    Write-Host "  • Presiona Ctrl + C para detener el servidor" -ForegroundColor Yellow
    Write-Host "======================================================================" -ForegroundColor Cyan
    Write-Host ""

    # Abrir navegador predeterminado automáticamente
    try {
        Start-Process "http://localhost:$activePort/"
    } catch {
        # Si falla el lanzamiento automático del navegador, continuar sirviendo
    }

    while ($listener.IsListening) {
        $context = $listener.GetContext()
        $request = $context.Request
        $response = $context.Response

        $urlPath = $request.Url.LocalPath.TrimStart('/')
        if ([string]::IsNullOrWhiteSpace($urlPath)) { $urlPath = "index.html" }

        # Prevenir directory traversal
        $fullPath = [System.IO.Path]::GetFullPath([System.IO.Path]::Combine($rootDir, $urlPath))
        if (-not $fullPath.StartsWith($rootDir)) {
            $response.StatusCode = 403
            $response.Close()
            continue
        }

        if (Test-Path $fullPath -PathType Leaf) {
            $ext = [System.IO.Path]::GetExtension($fullPath).ToLower()
            $contentType = switch ($ext) {
                ".html" { "text/html; charset=utf-8" }
                ".htm"  { "text/html; charset=utf-8" }
                ".js"   { "application/javascript; charset=utf-8" }
                ".css"  { "text/css; charset=utf-8" }
                ".json" { "application/json; charset=utf-8" }
                ".png"  { "image/png" }
                ".jpg"  { "image/jpeg" }
                ".jpeg" { "image/jpeg" }
                ".svg"  { "image/svg+xml" }
                ".ico"  { "image/x-icon" }
                Default { "application/octet-stream" }
            }

            $bytes = [System.IO.File]::ReadAllBytes($fullPath)
            $response.ContentType = $contentType
            $response.ContentLength64 = $bytes.Length
            $response.StatusCode = 200
            $response.OutputStream.Write($bytes, 0, $bytes.Length)
            $response.OutputStream.Flush()
            $response.Close()
        } else {
            $response.StatusCode = 404
            $msg = [System.Text.Encoding]::UTF8.GetBytes("Archivo no encontrado: $urlPath")
            $response.ContentType = "text/plain; charset=utf-8"
            $response.ContentLength64 = $msg.Length
            $response.OutputStream.Write($msg, 0, $msg.Length)
            $response.OutputStream.Flush()
            $response.Close()
        }
    }
} catch {
    Write-Host "Servidor detenido: $_" -ForegroundColor Yellow
} finally {
    if ($listener -and $listener.IsListening) {
        $listener.Stop()
    }
    if ($listener) {
        $listener.Close()
    }
}
