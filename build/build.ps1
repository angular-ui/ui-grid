
Param(
  [Parameter(Mandatory = $false, Position = 1)]
  [string]$language = "en",
  [Parameter(ParameterSetName = "symbols", Mandatory = $false, Position = 2)]
  [string]$startSymbol = $null,
  [Parameter(ParameterSetName = "symbols", Position = 3)]
  [string]$endSymbol = $null
)

$defaultStartSymbol = '{{';
$defaultEndSymbol = '}}';

$CurrentDir = (Get-Location).Path;
$OutPutFile = $CurrentDir + "\ng-grid.debug.js";
$TempFile = $OutPutFile + ".temp";
$finalprefix = "ng-grid-1.6.3.debug";
$FinalFile = "..\$finalprefix.js";
$BuildOrder = $CurrentDir + "\build-order.txt";
$commentStart = "<!--";
$commentEnd = "-->";

Write-Host "JSBuild Starting...";
$files = Get-Content $BuildOrder;
$compileTime = Get-Date;

Set-Content $TempFile "/***********************************************";
Add-Content $TempFile "* ng-grid JavaScript Library";
Add-Content $TempFile "* Authors: https://github.com/angular-ui/ng-grid/blob/master/README.md";
Add-Content $TempFile "* License: MIT (http://www.opensource.org/licenses/mit-license.php)";
Add-Content $TempFile "* Compiled At: $compileTime";
Add-Content $TempFile "***********************************************/`n"
Add-Content $TempFile "(function(window) {";
Add-Content $TempFile "'use strict';";
Foreach ($file in $files){
	# Wrap each file output in a new line
	Write-Host "Building... $file";
	Add-Content $TempFile "`n/***********************************************`n* FILE: $file`n***********************************************/";
	$fileContents = Get-Content $file | where {!$_.StartsWith("///")};
	if ($fileContents[0].StartsWith("<!--")){
		$compiledContent = $fileContents[0].TrimStart($commentStart).TrimEnd($commentEnd).Trim() + " = function(){ return '";
		for ($indx = 1; $indx -lt $fileContents.Length; $indx++){
			$compiledContent += $fileContents[$indx].Trim().Replace("'", "\'");
		}
		$compiledContent += "';};";
	    if ($startSymbol -ne ""){
	        $compiledContent = $compiledContent.Replace($defaultStartSymbol, $startSymbol);
	        $compiledContent = $compiledContent.Replace($defaultEndSymbol, $endSymbol);
	    }
		Add-Content $TempFile $compiledContent; 
	} else {
		Add-Content $TempFile $fileContents;
	}
}
if ($language -eq "all"){
    $FinalFile = "..\$finalprefix.int.js";
    $langs = Get-ChildItem "..\src\i18n\";
    Foreach ($lang in $langs){
        Write-Host "Adding Language Pack... $lang";        
        Add-Content $TempFile "`n/***********************************************`n* LANGUAGE: $lang`n***********************************************/";
        $content = Get-Content $lang.FullName;
        Add-Content $TempFile $content;
    }
} else {
    if ($language -ne "en"){
        $FinalFile = "..\$finalprefix.$language.js";
    }
    Write-Host "Compiling for language... $language";
    Add-Content $TempFile "`n/***********************************************`n* LANGUAGE: $language.js`n***********************************************/";
    $content = Get-Content "..\src\i18n\$language.js";
    Add-Content $TempFile $content;
}

Add-Content $TempFile "}(window));";
Get-Content $TempFile | Set-Content $OutputFile;
Remove-Item $TempFile -Force;
Copy-Item $OutputFile $FinalFile;
Write-Host "Build Succeeded!"