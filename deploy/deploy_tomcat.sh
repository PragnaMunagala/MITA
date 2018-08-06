#!/bin/sh

set -e

while [ ! $# -eq 0 ]
do
  case $1 in
    --prod)
      cd /home/deploy
      tar xf MITA.tar.xz
      rm -rf /usr/share/nginx/html/MITA
      mv MITA /usr/share/nginx/html/
      rm MITA.tar.xz
    ;;
    --dev)
      cd /home/deploy
      tar xf MITA.tar.xz
      rm -rf /usr/share/nginx/html/MITA
      mv MITA /usr/share/nginx/html/
      rm MITA.tar.xz
    ;;
   esac
   echo "Deployment to ${1//-} is successfully finished."
   shift
done
