#!/bin/bash

echo "Set up $GH_REPO [via travis] for $GIT_NAME <${GIT_EMAIL}>"
export REPO_URL="https://$GH_TOKEN@github.com/$GH_REPO.git"
git config --global user.email "$GIT_EMAIL"
git config --global user.name "$GIT_NAME"
git config credential.helper "store --file=.git/credentials"
echo "https://$GH_TOKEN@github.com" > .git/credentials
git branch -a
echo "STATUS"
git status
git remote rename origin old
echo "remotes pre pre-authorized remote url"
git remote -v
git remote add origin $REPO_URL
git config remote.origin.url $REPO_URL

#echo "DEBUG, cd out"
#test -d out && (
#  cd out
#  echo -n "user.email"
#  git config user.email
#  echo -n "user.name"
#  git config user.name
#
#) || echo "fresh build, no out directory"
