@echo off
git pull
REM 定义函数 改变版本
        for /f "tokens=1-3 delims==. " %%a in ('type version.sh') do (
            if %%a == MAJOR (
                    set /a MAJOR=%%b
                )else if %%a == MONOR (
                    set /a MONOR=%%b
            )else if %%a == BUILD (
                    set /a BUILD=%%b
            )
        )
        echo MAJOR=%MAJOR%
        echo MONOR=%MONOR%
        echo BUILD=%BUILD%
    set /a OLDBUILD = BUILD + 0
    echo %OLDBUILD%
    set  OLDBUILD1 = BUILD
    echo %OLDBUILD1%
    set /a BUILD+=1

    REM 将更新后的变量值写回文件
    echo   MAJOR=%MAJOR% > version.sh
    echo   MONOR=%MONOR% >> version.sh
    echo   BUILD=%BUILD% >> version.sh
  REM 修改oauth下的  build.gradle.kts
  cd oauth-gw
  set search=version = "%MAJOR%.%MONOR%.%OLDBUILD%"
  set replace=version = "%MAJOR%.%MONOR%.%BUILD%"
  for /f "tokens=* delims=" %%a in ('type build.gradle.kts') do (
      if "%%a" == "%search%" (
        echo %replace% >> build.gradle.kts1
      ) else (
        echo %%a >> build.gradle.kts1
      )
  )
  del  build.gradle.kts
  rename build.gradle.kts1 build.gradle.kts
  cd ..

  REM 修改pm-web-app下的package.json
  cd pm-web-app
    set search=  "version": "%MAJOR%.%MONOR%.%OLDBUILD%",
    set replace=  "version": "%MAJOR%.%MONOR%.%BUILD%",

    for /f "tokens=* delims=" %%a in ('type package.json') do (
        if "%%a" == "%search%" (
          echo %replace% >> temp.json
        )
        if not "%%a" == "%search%" (
            echo %%a >> temp.json
        )
    )
    del  package.json
    rename temp.json package.json
  cd ..
  REM 修改pm-web-mobile下的package.json和.env
  cd pm-web-mobile
    set search=  "version": "%MAJOR%.%MONOR%.%OLDBUILD%",
    set replace=  "version": "%MAJOR%.%MONOR%.%BUILD%",

    for /f "tokens=* delims=" %%a in ('type package.json') do (
        if "%%a" == "%search%" (
          echo %replace% >> temp.json
        )
        if not "%%a" == "%search%" (
            echo %%a >> temp.json
        )
    )
    del  package.json
    rename temp.json package.json

    set envValue =VUE_APP_VERSION = "%MAJOR%.%MONOR%.%BUILD%"
    set replace=VUE_APP_VERSION = "%MAJOR%.%MONOR%.%BUILD%"
    set vav=VUE_APP_VERSION = "%MAJOR%.%MONOR%.%BUILD%"
    echo %replace% > .env
  cd ..
  REM 修改pm-resource-server下的package.json
  cd pm-web-app
    set search=  "version": "%MAJOR%.%MONOR%.%OLDBUILD%",
    set replace=  "version": "%MAJOR%.%MONOR%.%BUILD%",

    for /f "tokens=* delims=" %%a in ('type package.json') do (
        if "%%a" == "%search%" (
          echo %replace% >> temp.json
        )
        if not "%%a" == "%search%" (
            echo %%a >> temp.json
        )
    )
    del  package.json
    rename temp.json package.json
  cd ..
  REM 修改helm/pm下的package.json
  cd helm/pm
      set search=version: "%MAJOR%.%MONOR%.%OLDBUILD%"
      set replace=version: "%MAJOR%.%MONOR%.%BUILD%"

      for /f "tokens=* delims=" %%a in ('type Chart.yaml') do (
          if "%%a" == "%search%" (
            echo %replace% >> temp.yaml
          )
          if not "%%a" == "%search%" (
              echo %%a >> temp.yaml
          )
      )
      del  Chart.yaml
      rename temp.yaml Chart.yaml

      set search=version: "%MAJOR%.%MONOR%.%OLDBUILD%"
      set replace=version: "%MAJOR%.%MONOR%.%BUILD%"

      for /f "tokens=* delims=" %%a in ('type values.yaml') do (
          if "%%a" == "%search%" (
            echo %replace% >> temp.yaml
          )
          if not "%%a" == "%search%" (
              echo %%a >> temp.yaml
          )
      )
      del  values.yaml
      rename temp.yaml values.yaml
  cd ../..



echo git add .
echo git commit -m 'release '%MAJOR%.%MONOR%.%BUILD%
echo git tag -a %MAJOR%.%MONOR%.%BUILD% -m 'release '%MAJOR%.%MONOR%.%BUILD%
echo git push
echo git push origin %MAJOR%.%MONOR%.%BUILD%
git add .
git add .
git commit -m 'release '%MAJOR%.%MONOR%.%BUILD%
git tag -a %MAJOR%.%MONOR%.%BUILD% -m 'release '%MAJOR%.%MONOR%.%BUILD%
git push
git push origin %MAJOR%.%MONOR%.%BUILD%
