docker stop mongo app
docker rm mongo app
rm -rf bus db .env tape.txt
node index
