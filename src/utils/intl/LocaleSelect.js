import React, { Component } from 'react';
import { Select } from 'hzero-ui';
import { connect } from 'dva';
// import config from '../../utils/config';

@connect(({ global = {} }) => ({
  supportLanguage: global.supportLanguage,
  language: global.language,
}))
export default class LocaleSelect extends Component {
  render() {
    const { dispatch, language, supportLanguage = [] } = this.props;
    return (
      <Select
        size="small"
        value={language}
        style={{ width: 100, marginRight: 10 }}
        onChange={v => {
          dispatch({
            type: 'global/changeLanguage',
            payload: v,
          });
          dispatch({
            type: 'global/updateDefaultLanguage',
            payload: { language: v },
          });
        }}
      >
        {supportLanguage.map(locale => (
          <Select.Option key={locale.code} value={locale.code}>
            {locale.name}
          </Select.Option>
        ))}
      </Select>
    );
  }
}
