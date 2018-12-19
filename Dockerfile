FROM node

# Create app directory
WORKDIR /usr/src/app/

# A wildcard is used to ensure both package.json AND package-lock.json are copied
COPY package*.json ./

# Install app dependencies
RUN npm install

EXPOSE 8080

# Bundle app source
COPY . .

CMD [ "node", "index.js"]