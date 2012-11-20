
$CurrentDir = (Get-Location).Path;
$OutPutFile = $CurrentDir + "\ng-grid.debug.js";
$TempFile = $OutPutFile + ".temp";
$FinalFile = "..\ng-grid-1.2.0.debug.js";
$BuildOrder = $CurrentDir + "\build-order.txt";

Write-Host "JSBuild Starting...";
$files = Get-Content $BuildOrder;
$compileTime = Get-Date;

Set-Content $TempFile "/***********************************************";
Add-Content $TempFile "* ng-grid JavaScript Library";
Add-Content $TempFile "* Authors: https://github.com/Crash8308/ng-grid/blob/master/README.md";
Add-Content $TempFile "* License: MIT (http://www.opensource.org/licenses/mit-license.php)";
Add-Content $TempFile "* Compiled At: $compileTime";
Add-Content $TempFile "***********************************************/`n"
Add-Content $TempFile "(function(window, undefined){";
Foreach ($file in $files){
	# Wrap each file output in a new line
	Write-Host "Building... $file";
	Add-Content $TempFile "`n/***********************************************`n* FILE: $file`n***********************************************/";
	Get-Content $file | where {!$_.StartsWith("///")} | Add-Content $TempFile;
}
Add-Content $TempFile "}(window));";
Get-Content $TempFile | Set-Content $OutputFile;
Remove-Item $TempFile -Force;
Copy-Item $OutputFile $FinalFile;
Write-Host "Build Succeeded!"
