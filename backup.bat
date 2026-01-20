@echo off
set TIMESTAMP=%date:~10,4%%date:~4,2%%date:~7,2%_%time:~0,2%%time:~3,2%%time:~6,2%
set BACKUP_DIR=./backup_data/%TIMESTAMP%

echo [GDU Career] Dang tien hanh sao luu du lieu MongoDB...
echo Muc tieu: %BACKUP_DIR%

mkdir "%BACKUP_DIR%"

:: Sao luu MongoDB (Gia dinh rang mongodump nam trong PATH)
mongodump --db gdu_career --out "%BACKUP_DIR%"

if %ERRORLEVEL% EQU 0 (
    echo [THANH CONG] Du lieu da duoc sao luu tai %BACKUP_DIR%
) else (
    echo [LOI] Khong the sao luu du lieu. Vui long kiem tra xem MongoDB co dang chay khong.
)

pause
