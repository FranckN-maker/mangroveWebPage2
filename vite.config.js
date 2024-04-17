export default {
  build: {
    sourcemap: true,
     rollupOptions: {
            output:{
                manualChunks(id) {
                    if (id.includes('node_modules')) {
                        return id.toString().split('node_modules/')[1].split('/')[0].toString();
                    }
                }
            }
        }
  },
  base: '',
  define: {
    _global: {},
  },

}
