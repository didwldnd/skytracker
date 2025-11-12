// utils/oauth.ts
export const buildAuthUrl = ({
  authEndpoint,       // ex) Google: "https://accounts.google.com/o/oauth2/v2/auth"
  clientId,
  redirectUri,        // ex) "http://localhost:19006/skytracker/redirect"
  scope,              // ex) "profile email"
  state,
  extra = {},         // kakao/naver에서 필요한 추가 파라미터
}: {
  authEndpoint: string;
  clientId: string;
  redirectUri: string;
  scope?: string;
  state: string;
  extra?: Record<string, string>;
}) => {
  const p = new URLSearchParams({
    response_type: "code",
    client_id: clientId,
    redirect_uri: redirectUri,
    ...(scope ? { scope } : {}),
    state,
    ...extra,
  });
  return `${authEndpoint}?${p.toString()}`;
};
