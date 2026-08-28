@echo off
title TravelGo - He Thong Dat Ve Du Lich & Dashboard
color 0B
cls
echo ===================================================================
echo             TRAVELGO - HE THONG DAT CHO DU LICH & DASHBOARD
echo        De tai: LV13-062 - Cong nghe Phan mem (PHP MVC / Node Runner)
echo ===================================================================
echo.
echo [*] Dang khoi dong Web Server truc tiep...
echo [*] Khong can cai them Laragon, XAMPP hay Docker!
echo.
start http://localhost:8000
node preview\server.js
pause
