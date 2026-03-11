# Fix all postcss.config.js files to disable autoprefixer
Get-ChildItem -Path . -Recurse -Filter "postcss.config.js" | ForEach-Object {
    $content = Get-Content $_.FullName -Raw
    if ($content -match "require\('autoprefixer'\)") {
        Write-Host "Fixing: $($_.FullName)"
        $newContent = @"
// Temporarily disable autoprefixer to allow dev server to work
// Autoprefixer adds vendor prefixes but isn't critical for development
module.exports = {
  plugins: [
    // require('autoprefixer')
  ]
}
"@
        Set-Content -Path $_.FullName -Value $newContent
    }
}
Write-Host "Done! Fixed all postcss.config.js files."
