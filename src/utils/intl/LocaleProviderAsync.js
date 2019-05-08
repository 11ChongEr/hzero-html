import React, { Component } from 'react';
import { LocaleProvider } from 'hzero-ui';
import { connect } from 'dva';
// import moment from 'moment';
// import { isNil } from 'lodash';
// import { getCurrentOrganizationId, getCurrentRole } from 'utils/utils';
// import intl from './index';
// import request from '../request';
// import { HZERO_PLATFORM, HZERO_IAM } from '../config';

// const langCache = {};

@connect(({ global = {} }) => ({
  language: global.language,
  antdLocale: global.antdLocale,
}))
export default class LocalProviderAsync extends Component {
  // currentLanguage;

  // state = {
  //   initDone: false,
  //   antdLocale: null,
  // };

  // //  eslint-disable-next-line
  // UNSAFE_componentWillReceiveProps(nextProps) {
  //   this.loadLocale(nextProps.language);
  // }

  // loadLocale(language) {
  //   if (language) {
  //     if (this.currentLanguage !== language) {
  //       this.currentLanguage = language;
  //       const loadLocales = intl.options.locales;
  //       intl.init({
  //         currentLocale: language,
  //         locales: loadLocales,
  //         warningHandler: e => {
  //           console.warn(e);
  //         },
  //       });
  //       const orgId = getCurrentOrganizationId() || 0;
  //       const langFetchPromise = [
  //         import(`hzero-ui/lib/locale-provider/${language.replace('-', '_')}.js`),
  //       ];
  //       if (!langCache[language]) {
  //         langCache[language] = true;
  //         // 加载 hzero.common
  //         langFetchPromise.push(
  //           request(`${HZERO_PLATFORM}/v1/${orgId}/prompt/${language}?promptKey=hzero.common`)
  //         );
  //         // 加载菜单
  //         const roleId = getCurrentRole().id;
  //         if (!isNil(roleId)) {
  //           // 第一次加载时 还没有角色, 需要在菜单加载完毕后加载菜单
  //           langFetchPromise.push(
  //             request(
  //               `${HZERO_IAM}/hzero/v1/menus/tree-tls?lang=${language}&roleId=${
  //                 getCurrentRole().id
  //               }`
  //             )
  //           );
  //         }
  //       }

  //       Promise.all(langFetchPromise)
  //         .then(([antdLocale, commonLocale, menuLocale]) => {
  //           intl.load({
  //             [language]: { ...commonLocale, ...menuLocale },
  //           });
  //           const { dispatch } = this.props;
  //           dispatch({
  //             type: 'global/updateMenuLeafNode',
  //           });

  //           // TODO: LocaleProvider 中会设置 moment.locale，为何突然不起作用了?
  //           moment.locale(antdLocale.locale);
  //           this.setState({
  //             antdLocale,
  //           });
  //         })
  //         .finally(() => {
  //           this.setState({
  //             initDone: true,
  //           });
  //         });
  //     }
  //   }
  // }

  // componentDidMount() {
  //   const { language } = this.props;
  //   this.loadLocale(language);
  // }

  render() {
    // const { initDone, antdLocale } = this.state;
    const { antdLocale } = this.props;
    return <LocaleProvider {...this.props} locale={antdLocale} />;
    // return initDone ? <LocaleProvider {...this.props} locale={antdLocale} /> : null;
  }
}
