FROM node:20-alpine

WORKDIR /usr/src/app

COPY package*.json ./
RUN npm install

COPY . .

EXPOSE 5173

CMD ["npm", "run", "dev", "--", "--host"]

# # Stage 2: Serve with nginx
# FROM nginx:alpine
# COPY --from=build /app/dist /usr/share/nginx/html

# # Copy custom nginx config
# COPY nginx.conf /etc/nginx/conf.d/default.conf

# EXPOSE 80