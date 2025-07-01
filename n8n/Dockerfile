FROM n8nio/n8n:latest

# Set the work directory
WORKDIR /data

# Railway dynamically assigns the PORT
EXPOSE ${PORT}

# n8n runs as node user by default, ensure proper permissions
USER node

# Start n8n
CMD ["n8n", "start"]
