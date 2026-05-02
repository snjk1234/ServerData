module.exports = {
  rewrites: async () => {
    return [
      {
        source: '/auth',
        destination: '/auth/signin'
      },
      {
        source: '/login',
        destination: '/auth/signin'
      }
    ];
  },
  redirects: async () => {
    return [];
  }
};
