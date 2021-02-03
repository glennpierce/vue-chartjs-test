import Vue from 'vue';
import Router from 'vue-router';
import LoginComponent from './views/Login.vue';
import Home from './views/Home.vue';
import Bcp from './views/Bcp.vue';
import UsersAdmin from './views/Admin/UsersAdmin.vue';
import About from './views/About.vue';
import DashBoard from './views/ShimmyPlus/DashBoard.vue';
import PageOne from './views/ShimmyPlus/Page1.vue';
import Comfort from './views/ShimmyPlus/Comfort.vue';
import ElectricityUsage from './views/ShimmyPlus/ElectricityUsage.vue';
import HotWaterUsage from './views/ShimmyPlus/HotWaterUsage.vue';
import Portfolio from './views/Portfolio.vue';
import PortfolioDetails from './views/PortfolioDetails.vue';

Vue.use(Router);

export default new Router({
  routes: [
    // {
    //   path: '/',
    //   name: 'home',
    //   component: Home,
    // },
  ],
});
