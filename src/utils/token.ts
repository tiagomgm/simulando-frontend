export function setToken(token: string) {
  sessionStorage.setItem("access", token);
}
export function getToken(): string | null {
  return sessionStorage.getItem("access");
}
export function removeToken() {
  sessionStorage.removeItem("access");
  sessionStorage.removeItem("refresh");
}