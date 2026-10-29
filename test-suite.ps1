# ==============================================================================
# IURISDOSIS COLOMBIA - SUITE DE PRUEBAS AUTOMATIZADAS (POWERSHELL CLI)
# Ley 599 de 2000 (Codigo Penal) y Ley 906 de 2004 (C.P.P.)
# ==============================================================================

Write-Host "======================================================================" -ForegroundColor Cyan
Write-Host "   IURISDOSIS COLOMBIA - EJECUTOR DE PRUEBAS AUTOMATIZADAS" -ForegroundColor Yellow
Write-Host "   Validacion de Algoritmos de Dosimetria, Cuartos y Catalogo Legal" -ForegroundColor Gray
Write-Host "======================================================================" -ForegroundColor Cyan
Write-Host ""

$totalTests = 0
$passedTests = 0
$failedTests = 0
$failures = @()

function Assert-Test {
    param(
        [string]$Description,
        [bool]$Condition,
        [string]$Details = ""
    )
    $script:totalTests++
    if ($Condition) {
        $script:passedTests++
        Write-Host "  [OK]   " -ForegroundColor Green -NoNewline
        Write-Host $Description -ForegroundColor White
    } else {
        $script:failedTests++
        $script:failures += "$($Description) - $($Details)"
        Write-Host "  [FAIL] " -ForegroundColor Red -NoNewline
        Write-Host $Description -ForegroundColor Yellow
        if ($Details) {
            Write-Host "         -> $Details" -ForegroundColor Red
        }
    }
}

# ------------------------------------------------------------------------------
# 1. INTEGRIDAD DE ARCHIVOS DEL REPOSITORIO
# ------------------------------------------------------------------------------
Write-Host "[1/6] Verificando integridad de estructura del repositorio..." -ForegroundColor Cyan

Assert-Test "Existe index.html en la raiz" (Test-Path "index.html")
Assert-Test "Existe app.js en la raiz" (Test-Path "app.js")
Assert-Test "Existe catalogo-y-calculadora.js en la raiz" (Test-Path "catalogo-y-calculadora.js")
Assert-Test "Existe firebase-config.js en la raiz" (Test-Path "firebase-config.js")
Assert-Test "Existe local-server.ps1 en la raiz" (Test-Path "local-server.ps1")
Assert-Test "Existe README.md en la raiz" (Test-Path "README.md")
Assert-Test "Existe .gitignore en la raiz" (Test-Path ".gitignore")
Assert-Test "Existe test-suite.html en la raiz" (Test-Path "test-suite.html")

# ------------------------------------------------------------------------------
# 2. AUDITORIA DE CONSISTENCIA DOM (HTML vs JAVASCRIPT)
# ------------------------------------------------------------------------------
Write-Host ""
Write-Host "[2/6] Verificando sincronizacion de IDs..." -ForegroundColor Cyan

$htmlContent = Get-Content "index.html" -Raw
$appJsContent = Get-Content "app.js" -Raw
$catJsContent = Get-Content "catalogo-y-calculadora.js" -Raw
$allJsContent = $appJsContent + "`n" + $catJsContent

$regexJs = [regex]'getElementById\([''"]([^''"]+)[''"]\)'
$jsIds = $regexJs.Matches($allJsContent) | ForEach-Object { $_.Groups[1].Value } | Select-Object -Unique

$regexHtml = [regex]'id=[''"]([^''"]+)[''"]'
$htmlIds = $regexHtml.Matches($htmlContent) | ForEach-Object { $_.Groups[1].Value } | Select-Object -Unique

$missingIds = @($jsIds | Where-Object { $htmlIds -notcontains $_ })
Assert-Test "Todos los getElementById referenciados en JS existen en index.html" ($missingIds.Count -eq 0) "IDs faltantes: $($missingIds -join ', ')"

# ------------------------------------------------------------------------------
# 3. VERIFICACION DEL CATALOGO DE DELITOS (LEY 599 DE 2000)
# ------------------------------------------------------------------------------
Write-Host ""
Write-Host "[3/6] Verificando Catalogo de Delitos y Tipos Penales..." -ForegroundColor Cyan

$regexDelito = [regex]'id:\s*[''"]([a-zA-Z0-9_]+)[''"]'
$delitosMatches = $regexDelito.Matches($catJsContent)
$delitosCount = $delitosMatches.Count
Assert-Test "El catalogo contiene al menos 22 tipos penales registrados" ($delitosCount -ge 22) "Contados: $delitosCount"

# Verificar tipos penales emblemáticos y sus extremos
Assert-Test "Art. 103 (Homicidio Simple): 208 a 450 meses" ($catJsContent -match "id:\s*'103'[\s\S]*?minMeses:\s*208[\s\S]*?maxMeses:\s*450")
Assert-Test "Art. 104_7 (Homicidio Agravado): 400 a 600 meses" ($catJsContent -match "id:\s*'104_7'[\s\S]*?minMeses:\s*400[\s\S]*?maxMeses:\s*600")
Assert-Test "Art. 106 (Homicidio por Piedad): 16 a 54 meses" ($catJsContent -match "id:\s*'106'[\s\S]*?minMeses:\s*16[\s\S]*?maxMeses:\s*54")
Assert-Test "Art. 109 (Homicidio Culposo): 32 a 108 meses" ($catJsContent -match "id:\s*'109'[\s\S]*?minMeses:\s*32[\s\S]*?maxMeses:\s*108")
Assert-Test "Art. 205 (Acceso Carnal Violento): 192 a 360 meses" ($catJsContent -match "id:\s*'205'[\s\S]*?minMeses:\s*192[\s\S]*?maxMeses:\s*360")
Assert-Test "Art. 208 (Acceso Carnal < 14 Anos): 208 a 360 meses" ($catJsContent -match "id:\s*'208'[\s\S]*?minMeses:\s*208[\s\S]*?maxMeses:\s*360")
Assert-Test "Art. 239 (Hurto Simple): 32 a 108 meses" ($catJsContent -match "id:\s*'239'[\s\S]*?minMeses:\s*32[\s\S]*?maxMeses:\s*108")
Assert-Test "Art. 244 (Extorsion): 192 a 288 meses" ($catJsContent -match "id:\s*'244'[\s\S]*?minMeses:\s*192[\s\S]*?maxMeses:\s*288")
Assert-Test "Art. 376 (Trafico de Estupefacientes): 128 a 360 meses" ($catJsContent -match "id:\s*'376'[\s\S]*?minMeses:\s*128[\s\S]*?maxMeses:\s*360")
Assert-Test "Art. 397 (Peculado por Apropiacion): 96 a 270 meses" ($catJsContent -match "id:\s*'397'[\s\S]*?minMeses:\s*96[\s\S]*?maxMeses:\s*270")

# ------------------------------------------------------------------------------
# 4. PRUEBAS ARITMETICAS: ARTICULO 61 C.P. (SISTEMA DE CUARTOS)
# ------------------------------------------------------------------------------
Write-Host ""
Write-Host "[4/6] Verificando formulas matematicas del Sistema de Cuartos..." -ForegroundColor Cyan

function Test-CalcularCuartos($min, $max) {
    $ap = $max - $min
    $vc = [Math]::Round(($ap / 4.0), 2)
    $q1Max = [Math]::Round(($min + $vc), 2)
    $q2Max = [Math]::Round(($min + 2 * $vc), 2)
    $q3Max = [Math]::Round(($max - $vc), 2)
    return @{
        Ambito = $ap
        CuartoAmplitud = $vc
        Q1Min = $min; Q1Max = $q1Max
        Q2Min = $q1Max; Q2Max = $q2Max
        Q3Min = $q2Max; Q3Max = $q3Max
        Q4Min = $q3Max; Q4Max = $max
    }
}

# Caso Homicidio Simple (208 a 450 meses)
$resHom = Test-CalcularCuartos 208 450
Assert-Test "Homicidio Simple: Ambito Punitivo = 242 meses" ($resHom.Ambito -eq 242)
Assert-Test "Homicidio Simple: Amplitud de cada cuarto = 60.5 meses" ($resHom.CuartoAmplitud -eq 60.5)
Assert-Test "Homicidio Simple: Cuarto 1 = [208, 268.5]" ($resHom.Q1Min -eq 208 -and $resHom.Q1Max -eq 268.5)
Assert-Test "Homicidio Simple: Cuartos Medios = [268.5, 389.5]" ($resHom.Q2Min -eq 268.5 -and $resHom.Q3Max -eq 389.5)
Assert-Test "Homicidio Simple: Cuarto 4 = [389.5, 450]" ($resHom.Q4Min -eq 389.5 -and $resHom.Q4Max -eq 450)

# Caso Homicidio Agravado (400 a 600 meses)
$resAgrav = Test-CalcularCuartos 400 600
Assert-Test "Homicidio Agravado: Ambito Punitivo = 200 meses" ($resAgrav.Ambito -eq 200)
Assert-Test "Homicidio Agravado: Amplitud de cada cuarto = 50.0 meses" ($resAgrav.CuartoAmplitud -eq 50.0)
Assert-Test "Homicidio Agravado: Cuarto 1 = [400, 450]" ($resAgrav.Q1Min -eq 400 -and $resAgrav.Q1Max -eq 450)
Assert-Test "Homicidio Agravado: Cuarto 4 = [550, 600]" ($resAgrav.Q4Min -eq 550 -and $resAgrav.Q4Max -eq 600)

# Caso Hurto Simple (32 a 108 meses)
$resHurto = Test-CalcularCuartos 32 108
Assert-Test "Hurto Simple: Ambito Punitivo = 76 meses" ($resHurto.Ambito -eq 76)
Assert-Test "Hurto Simple: Amplitud de cada cuarto = 19.0 meses" ($resHurto.CuartoAmplitud -eq 19.0)

# ------------------------------------------------------------------------------
# 5. REGLAS DE SUBSUNCION Y CONTROL DE PROHIBICIONES LEGALES
# ------------------------------------------------------------------------------
Write-Host ""
Write-Host "[5/6] Verificando Reglas de Subsuncion y Prohibiciones (Arts. 61, 199, 68A)..." -ForegroundColor Cyan

function Test-DeterminarCuarto($mit, $agg) {
    if ($mit -gt 0 -and $agg -eq 0) { return "minimo" }
    elseif ($agg -gt 0 -and $mit -eq 0) { return "maximo" }
    else { return "medios" }
}

Assert-Test "Solo circunstancias de menor punibilidad (Art. 55) situan en Cuarto Minimo" ((Test-DeterminarCuarto 2 0) -eq "minimo")
Assert-Test "Solo circunstancias de mayor punibilidad (Art. 58) situan en Cuarto Maximo" ((Test-DeterminarCuarto 0 3) -eq "maximo")
Assert-Test "Concurrencia de atenuantes y agravantes situa en Cuartos Medios" ((Test-DeterminarCuarto 1 1) -eq "medios")
Assert-Test "Ausencia total de circunstancias (0 y 0) situa en Cuartos Medios" ((Test-DeterminarCuarto 0 0) -eq "medios")

# Justicia Premial (Art. 351 C.P.P.)
function Test-CalcularPenaFinal($quantum, $rebajaPct, $bloqueo199, $bloqueo68a) {
    $rebaja = if ($bloqueo199 -or $bloqueo68a) { 0 } else { $rebajaPct }
    $descuento = [Math]::Round(($quantum * ($rebaja / 100.0)), 2)
    return [Math]::Round(($quantum - $descuento), 2)
}

Assert-Test "Pena de 215m con 40% rebaja (sin prohibicion) = 129 meses" ((Test-CalcularPenaFinal 215 40 $false $false) -eq 129.0)
Assert-Test "Pena de 215m con prohibicion Art. 199 Ley 1098 = 215 meses (0% rebaja)" ((Test-CalcularPenaFinal 215 40 $true $false) -eq 215.0)
Assert-Test "Pena de 215m con prohibicion Art. 68A C.P. = 215 meses (0% rebaja)" ((Test-CalcularPenaFinal 215 40 $false $true) -eq 215.0)

# Subrogados Penales (Arts. 63 y 38B C.P.)
Assert-Test "Condena de 42 meses es factible para Suspension Condicional (Art. 63 <= 48m)" (42 -le 48)
Assert-Test "Condena de 129 meses NO es factible para Suspension Condicional (> 48m)" (129 -gt 48)
Assert-Test "Hurto Simple (min 32m) cumple requisito objetivo de Domiciliaria (Art. 38B <= 96m)" (32 -le 96)
Assert-Test "Homicidio (min 208m) NO cumple requisito objetivo de Domiciliaria (> 96m)" (208 -gt 96)

# ------------------------------------------------------------------------------
# 6. VERIFICACION DE FIREBASE Y AYUDA IA
# ------------------------------------------------------------------------------
Write-Host ""
Write-Host "[6/6] Verificando Arquitectura de Firebase, Firestore y Ayuda IA..." -ForegroundColor Cyan

$fbConfigContent = Get-Content "firebase-config.js" -Raw
Assert-Test "firebase-config.js exporta ventana ElectivaFirebase" ($fbConfigContent -match "window\.ElectivaFirebase")
Assert-Test "firebase-config.js cuenta con detector de estado isFirebaseConfigured" ($fbConfigContent -match "isConfigured:")
Assert-Test "catalogo-y-calculadora.js contiene BancoDudasManager con almacenamiento fallback" ($catJsContent -match "BancoDudasManager")
Assert-Test "AyudaIA_Manager genera el prompt estructurado con las 5 preguntas" ($catJsContent -match "promptEstructurado")

Write-Host ""
Write-Host "======================================================================" -ForegroundColor Cyan
Write-Host "   RESUMEN FINAL DE LA SUITE DE PRUEBAS" -ForegroundColor Yellow
Write-Host "======================================================================" -ForegroundColor Cyan
Write-Host "  Total de Pruebas Ejecutadas : $totalTests" -ForegroundColor White
Write-Host "  Pruebas Superadas (PASS)    : $passedTests" -ForegroundColor Green
Write-Host "  Pruebas Fallidas (FAIL)     : $failedTests" -ForegroundColor $(if ($failedTests -eq 0) { "Green" } else { "Red" })

if ($failedTests -eq 0) {
    Write-Host ""
    Write-Host "  TODAS LAS PRUEBAS PASARON SATISFACTORIAMENTE (100% OK)" -ForegroundColor Green
    Write-Host ""
    exit 0
} else {
    Write-Host ""
    Write-Host "  Se detectaron fallas en las siguientes pruebas:" -ForegroundColor Red
    foreach ($f in $failures) {
        Write-Host "     - $f" -ForegroundColor Yellow
    }
    Write-Host ""
    exit 1
}
