FROM node:18-alpine AS build

WORKDIR /frontend

# Copy package files and install dependencies
COPY package.json package-lock.json ./
RUN npm install

# Copy the rest of your code
COPY . .

# Build the app for production
RUN npm run build

FROM nginx:stable-alpine
# Copy build output to Nginx's html folder
COPY --from=build /frontend/dist /usr/share/nginx/html

# Copy the custom Nginx configuration
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Expose the port the app runs on
EXPOSE 80

# Serve the production build
CMD ["nginx", "-g", "daemon off;"]