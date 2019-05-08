/**
 * 语言切换
 */
import React from 'react';
import { Select } from 'hzero-ui';
import { connect } from 'dva';
import { Bind } from 'lodash-decorators';

class DefaultLanguageSelect extends React.PureComponent {
  componentDidMount() {
    const { querySupportLanguage } = this.props;
    querySupportLanguage();
  }

  @Bind()
  handleLanguageSelectChange(language) {
    const { onChangeLanguage, onUpdateDefaultLanguage } = this.props;
    onChangeLanguage(language);
    onUpdateDefaultLanguage({ language });
  }

  render() {
    const { language, supportLanguage = [], loading = false } = this.props;
    return (
      <Select
        size="small"
        className="select-no-border"
        value={language}
        style={{ width: 100, marginRight: 10 }}
        onChange={this.handleLanguageSelectChange}
        disabled={loading}
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

export default connect(
  ({ global = {}, loading = { effects: {} } }) => ({
    supportLanguage: global.supportLanguage, // 可供切换的语言
    language: global.language, // 当前的语言
    loading:
      loading.effects['global/changeLanguage'] ||
      loading.effects['global/updateDefaultLanguage'] ||
      loading.effects['global/querySupportLanguage'],
  }),
  dispatch => ({
    onChangeLanguage: payload => {
      return dispatch({
        type: 'global/changeLanguage',
        payload,
      });
    },
    onUpdateDefaultLanguage: payload => {
      return dispatch({
        type: 'global/updateDefaultLanguage',
        payload,
      });
    },
    querySupportLanguage: () => {
      return dispatch({
        type: 'global/querySupportLanguage',
      });
    },
  })
)(DefaultLanguageSelect);
