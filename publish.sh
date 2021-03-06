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
if git diff-index --quiet HEAD --; then
  git pull
  change_version
  change_oauth
  change_app
  change_resource_server
  change_helm
  git add .
  git commit -m 'release '$VERSION
  git tag -a $VERSION -m 'release '$VERSION
  git push
  git push origin $VERSION
  exit 0
else
  echo '先提交修改'
  exit -1
fi