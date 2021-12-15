# FROM node:16.4.1

# WORKDIR /app

# COPY package*.json .
# RUN npm install
# COPY . .

# CMD ["npm", "start"]

# How to build and run it
# sudo docker build -t app .
# 

# From node:latest
# RUN mkdir -p /usr/src/app
# WORKDIR /usr/src/app

# COPY package.json /usr/src/app

# RUN npm install

# COPY . /usr/src/app

# EXPOSE 4000

# CMD ["npm", "start"]