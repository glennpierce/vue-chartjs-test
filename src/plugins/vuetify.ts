import Vue from 'vue';
import Vuetify from 'vuetify/lib';
import colors from 'vuetify/lib/util/colors';

Vue.use(Vuetify);

const shimmy = {
  primary: '#1976D2',
  secondary: '#424242',
  accent: '#82B1FF',
  error: '#FF5252',
  info: '#2196F3',
  success: '#4CAF50',
  warning: '#FFC107',
};

const carnego = {
  primary: '#39613E',
  secondary: colors.red.lighten4,
  // All keys will generate theme styles,
  // Here we add a custom `tertiary` color
  // tertiary: colors.pink.base,
  accent: colors.indigo.base, // #3F51B5
};

export default new Vuetify({
  theme: {
    themes: {
      light: carnego,
    },
  },
});
