FROM node:20

RUN mkdir -p /home/app
COPY . /home/app 
WORKDIR /home/app 

RUN npm install

EXPOSE 4000

CMD ["node", "index.js"]
