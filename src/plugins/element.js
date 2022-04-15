import Vue from 'vue'
import {
  Button,
  Form,
  FormItem,
  Input,
  Message,
  Container,
  Header,
  Aside,
  Main,
  Menu,
  MenuItem,
  Upload,
  Dialog,
  Descriptions,
  DescriptionsItem,
  Avatar,
  Image,
  Table,
  TableColumn,
  MessageBox,
  Tag,
  Pagination,
  Select,
  Option,
  Switch,
  Timeline,
  TimelineItem
} from 'element-ui'

Vue.use(Button)
Vue.use(Form)
Vue.use(FormItem)
Vue.use(Input)
Vue.use(Container)
Vue.use(Header)
Vue.use(Aside)
Vue.use(Main)
Vue.use(Menu)
Vue.use(MenuItem)
Vue.use(Upload)
Vue.use(Dialog)
Vue.use(Descriptions)
Vue.use(DescriptionsItem)
Vue.use(Avatar)
Vue.use(Image)
Vue.use(Table)
Vue.use(TableColumn)
Vue.use(Tag)
Vue.use(Pagination)
Vue.use(Select)
Vue.use(Option)
Vue.use(Switch)
Vue.use(Timeline)
Vue.use(TimelineItem)
Vue.prototype.$message = Message
Vue.prototype.$prompt = MessageBox.prompt
Vue.prototype.$confirm = MessageBox.confirm
