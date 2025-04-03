module.exports = {
  purge: ['./pages/*.js'],
  theme: {
    extend: {
      keyframes: {
        wiggle: {
          '0%, 100%': { transform: '' },
          '50%': { transform: 'rotate(3deg)' }
        }
      },
      animation: {
        wiggle: 'wiggle 200ms ease-in-out'
      }
    }
  }
};
