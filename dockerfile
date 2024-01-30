FROM --platform=linux/amd64 ubuntu:xenial
FROM --platform=linux/amd64 node

RUN apt-get -y update

#Create a app directory
WORKDIR /app

#Install app dependencies
COPY package*.json ./

#Run npm install
RUN npm install

#Bundle app souce
COPY . .

RUN wget https://github.com/THCLab/oca-parser-xls/releases/latest/download/parser.bin
RUN chmod +x ./parser.bin

EXPOSE 8080

CMD [ "npm", "start" ]