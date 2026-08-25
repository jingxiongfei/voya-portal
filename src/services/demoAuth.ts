const DEMO_AUTH_STORAGE_KEY = 'voya.portal.demoAccess';

type DemoAccess = 'admin' | 'user';

const demoUsers: Record<DemoAccess, API.CurrentUser> = {
  admin: {
    name: 'Nora Liu',
    userid: 'acct-002',
    email: 'nora.liu@voyaexplore.com',
    signature: 'Voya Portal administrator',
    title: 'System Administrator',
    group: 'Voya Explore · Platform Administration',
    tags: [],
    notifyCount: 0,
    unreadCount: 0,
    country: 'China',
    geographic: {
      province: { label: 'Shanghai', key: '310000' },
      city: { label: 'Shanghai', key: '310100' },
    },
    address: 'Shanghai',
    phone: '+86 139 0000 6138',
    access: 'admin',
  },
  user: {
    name: 'Voya Demo User',
    userid: 'acct-demo-user',
    email: 'demo.user@voyaexplore.com',
    title: 'Demo User',
    group: 'Voya Explore · Demo',
    tags: [],
    notifyCount: 0,
    unreadCount: 0,
    country: 'China',
    access: 'user',
  },
};

const getStorage = () => {
  if (typeof window === 'undefined') {
    return undefined;
  }

  try {
    return window.localStorage;
  } catch {
    return undefined;
  }
};

const readDemoAccess = () => {
  try {
    return getStorage()?.getItem(DEMO_AUTH_STORAGE_KEY);
  } catch {
    return undefined;
  }
};

const writeDemoAccess = (access: DemoAccess) => {
  try {
    getStorage()?.setItem(DEMO_AUTH_STORAGE_KEY, access);
    return true;
  } catch {
    return false;
  }
};

export const isDemoAuthenticationEnabled =
  process.env.NODE_ENV === 'production';

export const loginWithDemoAccount = async (
  params: API.LoginParams,
): Promise<API.LoginResult> => {
  const username = params.username as DemoAccess | undefined;
  const isValidAccount =
    params.type === 'account' &&
    params.password === 'ant.design' &&
    username !== undefined &&
    username in demoUsers;

  if (!isValidAccount || !username) {
    return {
      status: 'error',
      type: params.type,
      currentAuthority: 'guest',
    };
  }

  if (!writeDemoAccess(username)) {
    return {
      status: 'error',
      type: params.type,
      currentAuthority: 'guest',
    };
  }

  return {
    status: 'ok',
    type: params.type,
    currentAuthority: username,
  };
};

export const getDemoCurrentUser = (): API.CurrentUser | undefined => {
  const access = readDemoAccess();
  if (access !== 'admin' && access !== 'user') {
    return undefined;
  }

  return demoUsers[access];
};

export const logoutDemoAccount = () => {
  try {
    getStorage()?.removeItem(DEMO_AUTH_STORAGE_KEY);
  } catch {
    // The in-memory UI state still signs the user out if storage is blocked.
  }
};
