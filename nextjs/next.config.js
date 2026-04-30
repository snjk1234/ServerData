module.exports = {
  rewrites: async () => {
    return [
      {
        source: '/auth',
        destination: '/auth/signin'
      }
    ];
  },
  redirects: async () => {
    return [
      {
        source: '/',
        destination: '/login',
        permanent: false
      }
    ];
  }
};

