import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  base: '/smartshift/'
})
```

7. **Enable GitHub Pages:**
   - Go to **Settings** → **Pages**
   - Source: **Deploy from a branch**
   - Branch: **gh-pages** / **root**
   - Click **Save**

8. **Wait 2-3 minutes**, then visit:
```
   https://yourusername.github.io/your-repo-name/
