$ErrorActionPreference = "Stop"

$secureKey = Read-Host "Вставьте RunningHub API key (ввод скрыт)" -AsSecureString
$keyPointer = [Runtime.InteropServices.Marshal]::SecureStringToBSTR($secureKey)

try {
    $plainKey = [Runtime.InteropServices.Marshal]::PtrToStringBSTR($keyPointer).Trim()
    if ([string]::IsNullOrWhiteSpace($plainKey)) {
        throw "Ключ пустой. Ничего не сохранено."
    }

    [Environment]::SetEnvironmentVariable("RUNNINGHUB_API_KEY", $plainKey, "User")
    Write-Host "RUNNINGHUB_API_KEY сохранён для текущего пользователя Windows. Значение не выводилось."
}
finally {
    if ($keyPointer -ne [IntPtr]::Zero) {
        [Runtime.InteropServices.Marshal]::ZeroFreeBSTR($keyPointer)
    }
    Remove-Variable plainKey, secureKey -ErrorAction SilentlyContinue
}
