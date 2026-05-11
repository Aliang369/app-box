import { defineStore } from "pinia";
import { AuthState } from "@/stores/interface";
import { getAuthButtonListApi, getAuthMenuListApi } from "@/api/modules/login";
import { getFlatMenuList, getShowMenuList, getAllBreadcrumbList } from "@/utils";

const KEEP_TOP_MENU_TITLES = ["用户管理", "资源位管理", "游戏管理", "礼包管理", "轮播图管理"];
const TOP_MENU_ICON_MAP: Record<string, string> = {
  游戏管理: "Platform",
  礼包管理: "Present"
};

const getFirstReachablePath = (menu: Menu.MenuOptions): string => {
  if (menu.redirect) return menu.redirect;
  if (menu.path) return menu.path;
  if (menu.children?.length) return getFirstReachablePath(menu.children[0]);
  return "/home/index";
};

const regroupTemplateMenu = (menuList: Menu.MenuOptions[]): Menu.MenuOptions[] => {
  if (!menuList?.length) return [];

  const keepMenuMap = new Map<string, Menu.MenuOptions>();
  const templateChildren: Menu.MenuOptions[] = [];

  menuList.forEach(item => {
    const title = item.meta?.title;
    if (title && KEEP_TOP_MENU_TITLES.includes(title) && !keepMenuMap.has(title)) {
      keepMenuMap.set(title, item);
      return;
    }
    templateChildren.push(item);
  });

  const keepMenus = KEEP_TOP_MENU_TITLES.map(title => keepMenuMap.get(title)).filter(Boolean) as Menu.MenuOptions[];
  const normalizedKeepMenus = keepMenus.map(item => {
    const icon = TOP_MENU_ICON_MAP[item.meta.title];
    const isGiftMenu = item.meta.title === "礼包管理";
    const normalizedChildren = isGiftMenu
      ? item.children?.map(child => ({
          ...child,
          meta: {
            ...child.meta,
            icon: ""
          }
        }))
      : item.children;

    if (!icon && !isGiftMenu) return item;
    return {
      ...item,
      meta: {
        ...item.meta,
        icon
      },
      children: normalizedChildren
    };
  });
  if (!templateChildren.length) return normalizedKeepMenus;

  const templateMenu: Menu.MenuOptions = {
    path: "/template",
    name: "template",
    redirect: getFirstReachablePath(templateChildren[0]),
    meta: {
      icon: "Collection",
      title: "模板",
      isLink: "",
      isHide: false,
      isFull: false,
      isAffix: false,
      isKeepAlive: true
    },
    children: templateChildren
  };

  return [...normalizedKeepMenus, templateMenu];
};

export const useAuthStore = defineStore({
  id: "geeker-auth",
  state: (): AuthState => ({
    // 按钮权限列表
    authButtonList: {},
    // 菜单权限列表
    authMenuList: [],
    // 当前页面的 router name，用来做按钮权限筛选
    routeName: ""
  }),
  getters: {
    // 按钮权限列表
    authButtonListGet: state => state.authButtonList,
    // 菜单权限列表 ==> 这里的菜单没有经过任何处理
    authMenuListGet: state => state.authMenuList,
    // 菜单权限列表 ==> 左侧菜单栏渲染，需要剔除 isHide == true
    showMenuListGet: state => getShowMenuList(state.authMenuList),
    // 菜单权限列表 ==> 扁平化之后的一维数组菜单，主要用来添加动态路由
    flatMenuListGet: state => getFlatMenuList(state.authMenuList),
    // 递归处理后的所有面包屑导航列表
    breadcrumbListGet: state => getAllBreadcrumbList(state.authMenuList)
  },
  actions: {
    // Get AuthButtonList
    async getAuthButtonList() {
      const { data } = await getAuthButtonListApi();
      this.authButtonList = data;
    },
    // Get AuthMenuList
    async getAuthMenuList() {
      const { data } = await getAuthMenuListApi();
      this.authMenuList = regroupTemplateMenu(data);
    },
    // Set RouteName
    async setRouteName(name: string) {
      this.routeName = name;
    }
  }
});
