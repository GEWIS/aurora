import { createContext, PropsWithChildren, useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { ApiKeyParameters, authKey, AuthUser, getInformation, getOwnScreen, ScreenResponse } from '../api';

interface IAuthContext {
  user: AuthUser | null;
  screen: ScreenResponse | null;
  loading: boolean;
}

const defaultContext: IAuthContext = {
  user: null,
  screen: null,
  loading: true,
};

export const AuthContext = createContext(defaultContext);

export default function AuthContextProvider({ children }: PropsWithChildren) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [screen, setScreen] = useState<ScreenResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [urlSearchParams] = useSearchParams();
  const navigate = useNavigate();

  const authenticate = useCallback(async () => {
    if (urlSearchParams.has('key')) {
      const key = urlSearchParams.get('key');
      const body: ApiKeyParameters = { key: key ?? '' };
      const auth = await authKey({ body });
      // TODO what to do if user cannot be authenticated
      setUser(auth.data!);
    } else {
      const info = await getInformation();
      setUser(info.data!);
    }
  }, [urlSearchParams]);

  const loadData = useCallback(async () => {
    await authenticate();

    const screenRes = await getOwnScreen();
    if (screenRes.response.ok && screenRes.data) {
      setScreen(screenRes.data);
    }
  }, [authenticate]);

  useEffect(() => {
    loadData()
      .catch((e) => console.error(e))
      .finally(() => setLoading(false));
  }, [loadData]);

  useEffect(() => {
    if (user && urlSearchParams.has('key')) {
      void navigate('');
    }
  }, [navigate, urlSearchParams, user]);

  const context = useMemo(
    (): IAuthContext => ({
      user,
      screen,
      loading,
    }),
    [user, screen, loading],
  );

  return <AuthContext.Provider value={context}>{children}</AuthContext.Provider>;
}
