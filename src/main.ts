import Vue from 'vue';
import axios from 'axios';
import VueAxios from 'vue-axios';
// import jwt_decode from 'jwt-decode';
import Vuex from 'vuex';
import createCache from 'vuex-cache';
import App from './App.vue';
import router from './router';
import 'vue-material-design-icons/styles.css';
import VModal from 'vue-js-modal';
import moment from 'moment';
import 'vuetify/dist/vuetify.min.css';
import vuetify from './plugins/vuetify';
import VueFullPage from 'vue-fullpage.js';
import { Vue2Storage } from 'vue2-storage';

import base64url from 'base64url';
import 'material-design-icons-iconfont/dist/material-design-icons.css';

import { HaystackLogin } from './haystack_auth';
import VueRouter from 'vue-router';

// const auth_module = require('./haystack-auth-node/index');
// import './haystack-auth-node/auth/AuthClientContext';
// import * as auth_module from './haystack-auth-node/index';

Vue.use(Vuex);
Vue.use(VueAxios, axios);
Vue.use(moment as any);
Vue.use(Vue2Storage, {
  prefix: 'profile_',
  driver: 'local',
  ttl: 60 * 60 * 24 * 1000, // 24 hours
});

Vue.config.productionTip = false;

const store = new Vuex.Store({
  plugins: [createCache()],
  state: {
  },
  mutations: {
  },
  getters: {
  },
  actions: {
  },
});

















axios.interceptors.request.use((config: any) => {

  const originalRequest: any = config;

  if (router.currentRoute.name === 'login') {

    if (!originalRequest.headers.hasOwnProperty('authorization')) {
      return config;
    }

    const auth = originalRequest.headers.authorization;
    const parts = auth.split('authToken=');
    const token = parts[1];

    const token_parts = token.split('.');
    const header = base64url.decode(token_parts[0]);
    const payload_str = base64url.decode(token_parts[1]);

    const payload = JSON.parse(payload_str);

    const now = new Date();
    const utc_timestamp_ms = Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate(), now.getUTCHours(), now.getUTCMinutes(), now.getUTCSeconds());
    const utc_timestamp = Math.floor(utc_timestamp_ms / 1000);

    if (utc_timestamp > payload['exp']) {
      router.replace({ name: 'login' });
    }

    // if we ever want a renewal of tokens
    // if (tokenIsExpired && path_is_not_login) {
    //   return issueToken().then((token) => {
    //     originalRequest['Authorization'] = 'Bearer ' + token;
    //     return Promise.resolve(originalRequest);
    //   });
    // }
  }

  return config;
}, (err) => {
  return Promise.reject(err);
});


// Add a response interceptor
axios.interceptors.response.use((response) => {
  // Do something with response data

  // if(response.status == 401 ) {
  //   auth.logout();
  //   router.go('/login?unauthorized=1');
  // }

  return response;
}, (error) => {

  if (error.response.status === 401) {
    router.replace({ name: 'login' });
  }

  // Do something with response error
  return Promise.reject(error);
});




// Vue.prototype.$http = axios;
// Vue.prototype.axios = axios;
// Vue.prototype.axios.defaults.headers.post['Access-Control-Allow-Origin'] = '*';

// import Vue from 'vue';
// import App from './App.vue';
// import router from './router';

// Vue.config.productionTip = false;

// Vue.use(VModal);
Vue.use(VModal, { dynamic: true, injectModalsContainer: true, dynamicDefaults: { clickToClose: false } });

Vue.use(VueFullPage);

new Vue({
  router,
  store,
  vuetify,
  render: (h) => h(App),
}).$mount('#app');
