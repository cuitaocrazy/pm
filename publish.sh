#!/bin/bash

. ./version.sh

change_version() {
  BUILD=$((BUILD+1))
  VERSION=$MAJOR.$MONOR.$BUILD
cat <<EOF > version.sh
  MAJOR=$MAJOR
  MONOR=$MONOR
  BUILD=$BUILD
EOF

}

change_oauth() {
  cd oauth-gw
  sed -i '' 's/^version.*/version = "'$VERSION'"/' build.gradle.kts
  cd ..
}

change_app() {
  cd pm-web-app
  sed -i '' 's/  "version".*/  "version": "'$VERSION'",/' package.json
  cd ..
}

change_mobile() {
  cd pm-web-mobile
  sed -i '' 's/  "version".*/  "version": "'$VERSION'",/' package.json
  sed -i '' 's/^VUE_APP_VERSION.*/VUE_APP_VERSION = "'$VERSION'"/' .env
  cd ..
}

change_resource_server() {
  cd pm-resource-server
  sed -i '' 's/  "version".*/  "version": "'$VERSION'",/' package.json
  cd ..
}

change_helm() {
  cd helm/pm
  sed -i '' 's/^version.*/version: "'$VERSION'"/' values.yaml
  sed -i '' 's/^version.*/version: "'$VERSION'"/' Chart.yaml
  cd ../..
}

echo $VERSION
  git pull
  change_version
  change_oauth
  change_app
  change_mobile
  change_resource_server
  change_helm
  git add .
  git commit -m 'release '$VERSION
  git tag -a $VERSION -m 'release '$VERSION
  git push
  git push origin $VERSION
  exit 0