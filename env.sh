#!/bin/sh
# env.sh

# Adicione aqui as variáveis que você precisa expor
cat <<EOF > /usr/share/nginx/html/env-config.js
window._env_ = {
  VITE_SUPABASE_URL: "${VITE_SUPABASE_URL}",
  VITE_SUPABASE_ANON_KEY: "${VITE_SUPABASE_ANON_KEY}"
};
EOF