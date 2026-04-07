FROM node:20-alpine

WORKDIR /app

# Copie package*.json pour cache Docker
COPY package*.json ./

# Installe les dépendances (Vue, Bootstrap, Zod, pdfmake, Supabase, etc.)
RUN npm ci || npm install

# Expose le port Dev Vite
EXPOSE 5173

# Lance le dev server Vite
CMD ["npm", "run", "dev", "--", "--host", "0.0.0.0", "--port", "5173"]
