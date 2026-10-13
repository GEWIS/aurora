/* eslint vue/multi-word-component-names: 0 */
/* eslint vue/no-reserved-component-names: 0 */
import 'primeicons/primeicons.css';
import '@/assets/styles.scss';

import { createApp } from 'vue';
import { createPinia } from 'pinia';
import '@gewis/splash';
// @ts-expect-error -- package does exist
import timeago from 'vue-timeago3';
import OpenVue from 'openvue/config';
import Button from 'openvue/button';
import InputText from 'openvue/inputtext';
import Menubar from 'openvue/menubar';
import Panel from 'openvue/panel';
import DataTable from 'openvue/datatable';
import InputNumber from 'openvue/inputnumber';
import Dialog from 'openvue/dialog';
import Select from 'openvue/select';
import Checkbox from 'openvue/checkbox';
import Tabs from 'openvue/tabs';
import ScrollPanel from 'openvue/scrollpanel';
import FileUpload from 'openvue/fileupload';
import ProgressSpinner from 'openvue/progressspinner';
import ProgressBar from 'openvue/progressbar';
import SelectButton from 'openvue/selectbutton';
import ToggleButton from 'openvue/togglebutton';
import Card from 'openvue/card';
import Chip from 'openvue/chip';
import Slider from 'openvue/slider';
import ToastService from 'openvue/toastservice';
import ConfirmationService from 'openvue/confirmationservice';
import Toast from 'openvue/toast';
import Menu from 'openvue/menu';
import MultiSelect from 'openvue/multiselect';
import Divider from 'openvue/divider';
import Skeleton from 'openvue/skeleton';
import ConfirmDialog from 'openvue/confirmdialog';
import Image from 'openvue/image';
import Carousel from 'openvue/carousel';
import Stepper from 'openvue/stepper';
import StepPanel from 'openvue/steppanel';
import ToggleSwitch from 'openvue/toggleswitch';
import Column from 'openvue/column';
import Paginator from 'openvue/paginator';
import Message from 'openvue/message';
import Tag from 'openvue/tag';
import {
  ColorPicker,
  FloatLabel,
  InputGroupAddon,
  Popover,
  Tab,
  TabList,
  TabPanel,
  TabPanels,
  Tooltip,
  TreeTable,
} from 'openvue';
import InputGroup from 'openvue/inputgroup';
import IconField from 'openvue/iconfield';
import InputIcon from 'openvue/inputicon';
import { client } from '@gewis/aurora-api-client/client';
import router from './router';
import App from './App.vue';
import '@/utils/fetchInterceptor';
import { AuraPreset } from '@/assets/preset';

const app = createApp(App);

// define options
const timeagoOptions = {
  converterOptions: {
    includeSeconds: true,
  },
};

app.use(router);
app.use(OpenVue, {
  theme: {
    preset: AuraPreset,
    options: {
      darkModeSelector: '.dark-mode',
    },
  },
});
app.use(ToastService);
app.use(ConfirmationService);

client.setConfig({
  baseUrl: '/api',
});

app.use(createPinia());
app.use(timeago, timeagoOptions);

app.component('Button', Button);
app.component('Card', Card);
app.component('Chip', Chip);
app.component('SelectButton', SelectButton);
app.component('ToggleButton', ToggleButton);
app.component('InputText', InputText);
app.component('InputNumber', InputNumber);
app.component('Menu', Menu);
app.component('Menubar', Menubar);
app.component('Panel', Panel);
app.component('DataTable', DataTable);
app.component('TreeTable', TreeTable);
app.component('Column', Column);
app.component('Paginator', Paginator);
app.component('Dialog', Dialog);
app.component('Select', Select);
app.component('Checkbox', Checkbox);
app.component('Tabs', Tabs);
app.component('TabList', TabList);
app.component('Tab', Tab);
app.component('TabPanels', TabPanels);
app.component('TabPanel', TabPanel);
app.component('ScrollPanel', ScrollPanel);
app.component('FileUpload', FileUpload);
app.component('Spinner', ProgressSpinner);
app.component('ProgressSpinner', ProgressSpinner);
app.component('ProgressBar', ProgressBar);
app.component('Slider', Slider);
app.component('Toast', Toast);
app.component('MultiSelect', MultiSelect);
app.component('Divider', Divider);
app.component('Skeleton', Skeleton);
app.component('ConfirmDialog', ConfirmDialog);
app.component('Image', Image);
app.component('Carousel', Carousel);
app.component('Stepper', Stepper);
app.component('InlineMessage', Message);
app.component('StepperPanel', StepPanel);
app.component('ToggleSwitch', ToggleSwitch);
app.component('Tag', Tag);
app.component('Message', Message);
app.component('FloatLabel', FloatLabel);
app.component('Popover', Popover);
app.component('ColorPicker', ColorPicker);
app.component('IconField', IconField);
app.component('InputIcon', InputIcon);
app.component('InputGroup', InputGroup);
app.component('InputGroupAddon', InputGroupAddon);

app.directive('tooltip', Tooltip);

app.mount('#app');

export { app };
