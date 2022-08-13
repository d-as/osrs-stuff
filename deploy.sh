#!/usr/bin/env sh

set -e
npm run build
cd dist

git add .
git commit -m 'Deploy'

git push -f git@github.com:d-as/osrs-vite.git master:gh-pages

cd -
