#!/bin/sh

# Generate runtime config file from template
envsubst < /usr/share/nginx/html/env.template.js > /usr/share/nginx/html/env.js

# Start nginx
nginx -g "daemon off;"