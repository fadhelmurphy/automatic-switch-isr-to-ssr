module.exports = {
    async rewrites() {
        return [
            {
                source: '/:slug-static',
                destination: '/detail/isr/:slug'
            },
            {
                source: '/:slug-server',
                destination: '/detail/ssr/:slug'
            }
        ];
    },
}