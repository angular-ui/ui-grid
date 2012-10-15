
$CurrentDir = (Get-Location).Path;
$OutPutFile = $CurrentDir + "\ng-grid.debug.js";
$TempFile = $OutPutFile + ".temp";
$FinalFile = "..\ng-grid-1.0.0.debug.js";
$BuildOrder = $CurrentDir + "\build-order.txt";

Write-Host "JSBuild Starting...";
$files = Get-Content $BuildOrder;
Foreach ($file in $files){
	# Wrap each file output in a new line
	Write-Host "Building... " + $file + " >> " + $TempFile;
	$file >> $TempFile;
}
@ECHO. 
ECHO Building... %%A
@ECHO. 
@ECHO /*********************************************** >> %OutPutFile%.temp
@ECHO * FILE: %%A >> %OutPutFile%.temp
@ECHO ***********************************************/ >> %OutPutFile%.temp
@TYPE $CurrentDir\%%A >> %OutPutFile%.temp
@ECHO. >>%OutPutFile%.temp
)

@REM Remove the OutputFile if it exists
DEL %OutPutFile%

@REM Wrap the final output in an IIFE
@ECHO /*********************************************** >> %OutPutFile%
@ECHO * ng-grid JavaScript Library >> %OutPutFile%
@ECHO * Authors:  https://github.com/Crash8308/ng-grid/blob/master/README.md >> %OutPutFile%
@ECHO * License: MIT (http://www.opensource.org/licenses/mit-license.php) >> %OutputFile%
@ECHO * Compiled At: %Time% %Date% >> %OutPutFile%
@ECHO ***********************************************/ >> %OutPutFile%
@ECHO (function(window, undefined){ >> %OutPutFile%
@TYPE %OutPutFile%.temp >> %OutPutFile%
@ECHO }(window)); >> %OutPutFile%
DEL %OutPutFile%.temp
COPY %OutputFile% %FinalFile%
ECHO JSBuild Succeeded
ENDLOCAL
GOTO :eof