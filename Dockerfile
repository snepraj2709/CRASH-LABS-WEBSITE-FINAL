FROM nginx:alpine

# Copy website files into nginx directory
COPY . /usr/share/nginx/html

# Expose Cloud Run port
EXPOSE 8080

# Replace default nginx config
RUN sed -i 's/listen       80;/listen       8080;/' /etc/nginx/conf.d/default.conf

CMD ["nginx", "-g", "daemon off;"]