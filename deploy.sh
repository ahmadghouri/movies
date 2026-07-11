#!/bin/bash

echo "=============================="
echo "Starting deployment..."
echo "=============================="

# Latest code
git pull origin main

# Frontend
echo "Building frontend..."
cd /var/www/movies/client
npm install
npm run build

# Backend
echo "Installing backend dependencies..."
cd /var/www/movies/server
npm install

# Restart PM2
echo "Restarting backend..."
pm2 restart movie-api

# Save PM2 state
pm2 save

# Reload Nginx
echo "Reloading Nginx..."
sudo nginx -t && sudo systemctl reload nginx

echo "=============================="
echo "Deployment completed!"
echo "=============================="