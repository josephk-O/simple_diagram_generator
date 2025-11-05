FROM n8nio/n8n:latest
LABEL maintainer="kayodejoseph"

COPY simpDrawGen.json /home/node/simpDrawGen.json

# Auto-import workflow, then start n8n
ENTRYPOINT ["sh", "-c", "n8n import:workflow --input=/home/node/simpDrawGen.json && n8n start"]

