import axios from 'axios';

export function setAcceptLanguageHeader(value: string): void {
  axios.defaults.headers.common['Accept-Language'] = value;
}

export function setTokenHeader(token: string) {
  if (!token || token === 'undefined' || token === 'null') {
    delete axios.defaults.headers.common['Authorization'];
    return;
  }
  axios.defaults.headers.common['Authorization'] = 'Bearer ' + token;
}
