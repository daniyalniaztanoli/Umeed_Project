Set-Location "d:\Umeed-Foundation Project\UmeedUserApp\android"
.\gradlew.bat app:installDebug -PreactNativeDevServerPort=8081 *> "d:\Umeed-Foundation Project\UmeedUserApp\build-log.txt"
Write-Output "GRADLE_DONE exit=$LASTEXITCODE" >> "d:\Umeed-Foundation Project\UmeedUserApp\build-log.txt"
